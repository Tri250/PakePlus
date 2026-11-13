/**
 * 核心多线程下载引擎（纯 Node 实现，可脱离 Electron 独立测试）
 *
 * 特性：
 * - HTTP Range 分块并发下载（默认 8 连接，块大小可配）
 * - 暂停/恢复：中断活动流，恢复时仅续传未完成块
 * - 断点续传：分块状态可持久化/恢复（通过外部回调）
 * - 失败重试：单块指数退避重试
 * - 速度统计：滑动窗口实时速度
 * - 完整性：可选 MD5 校验 + 长度校验
 * - 限速：令牌桶全任务级限速
 */
import { EventEmitter } from 'node:events'
import * as http from 'node:http'
import * as https from 'node:https'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as crypto from 'node:crypto'

export interface ChunkPlan {
  index: number
  start: number
  end: number // inclusive
  done: boolean
  tries: number
}

export interface EngineProgress {
  received: number
  total: number
  percent: number
  speed: number
  connections: number
}

export interface EngineOptions {
  url: string
  filePath: string
  headers?: Record<string, string>
  connections?: number
  chunkSize?: number
  maxRetries?: number
  speedLimitBps?: number // 0 = 不限
  persistState?: (chunks: ChunkPlan[]) => void
  restoredChunks?: ChunkPlan[]
}

export type EngineStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed'

export class DownloadJob extends EventEmitter {
  status: EngineStatus = 'idle'
  progress: EngineProgress = { received: 0, total: 0, percent: 0, speed: 0, connections: 0 }
  readonly chunks: ChunkPlan[] = []

  private readonly url: string
  private readonly filePath: string
  private readonly headers: Record<string, string>
  private readonly connections: number
  private readonly chunkSize: number
  private readonly maxRetries: number
  private speedLimitBps: number
  private readonly persistState?: (c: ChunkPlan[]) => void

  private tmpDir: string
  private activeControllers = new Set<AbortController>()
  private pauseFlag = false
  private destroyed = false
  private speedWindow: { t: number; b: number }[] = []
  private speedTimer?: NodeJS.Timeout

  constructor(opts: EngineOptions) {
    super()
    this.url = opts.url
    this.filePath = opts.filePath
    this.headers = opts.headers ?? {}
    this.connections = Math.max(1, opts.connections ?? 8)
    this.chunkSize = opts.chunkSize ?? 8 * 1024 * 1024
    this.maxRetries = opts.maxRetries ?? 5
    this.speedLimitBps = opts.speedLimitBps ?? 0
    this.persistState = opts.persistState
    this.tmpDir = opts.filePath + '.yunxicc-parts'
    if (opts.restoredChunks?.length) this.chunks.push(...opts.restoredChunks)
  }

  /** 预检：获取文件大小与 Range 支持 */
  async probe(): Promise<{ size: number; acceptRanges: boolean }> {
    const u = new URL(this.url)
    const mod = this.url.startsWith('https:') ? https : http
    const doReq = (method: string, headers: Record<string, string>) =>
      new Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; destroy(): void }>((resolve, reject) => {
        const req = mod.request(
          { hostname: u.hostname, port: u.port || (this.url.startsWith('https:') ? 443 : 80), path: u.pathname + u.search, method, headers: { ...headers, Host: u.host } },
          res => resolve({ statusCode: res.statusCode ?? 0, headers: res.headers, destroy: () => res.destroy() })
        )
        req.on('error', reject)
        req.end()
      })

    const head = await doReq('HEAD', { Range: 'bytes=0-0', ...this.headers })
    const len = Number(head.headers['content-length'] ?? 0)
    const ar = String(head.headers['accept-ranges'] ?? '').includes('bytes')
    head.destroy()
    if (head.statusCode === 206) return { size: Number(String(head.headers['content-range'] ?? '').split('/')[1] || len), acceptRanges: true }
    if (head.statusCode === 200 && len > 0) return { size: len, acceptRanges: ar }
    // fallback: GET Range 0-0 读 Content-Range
    const res = await doReq('GET', { Range: 'bytes=0-0', ...this.headers })
    const cr = String(res.headers['content-range'] ?? '') // bytes 0-0/12345
    const size = cr.includes('/') ? Number(cr.split('/')[1]) : Number(res.headers['content-length'] ?? 0)
    res.destroy()
    if (!size || size <= 0) throw new Error(`无法获取文件大小 (HTTP ${res.statusCode})`)
    return { size, acceptRanges: cr.includes('/') }
  }

  /** 初始化分块计划（若未从断点恢复） */
  planChunks(size: number, acceptRanges: boolean): void {
    if (this.chunks.length) return
    if (!acceptRanges || size <= this.chunkSize) {
      this.chunks.push({ index: 0, start: 0, end: size - 1, done: false, tries: 0 })
    } else {
      let idx = 0
      for (let s = 0; s < size; s += this.chunkSize) {
        this.chunks.push({ index: idx++, start: s, end: Math.min(s + this.chunkSize, size) - 1, done: false, tries: 0 })
      }
    }
    this.progress.total = size
  }

  async start(): Promise<void> {
    if (this.status === 'running' || this.status === 'completed') return
    this.pauseFlag = false
    this.destroyed = false
    this.status = 'running'
    fs.mkdirSync(this.tmpDir, { recursive: true })
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true })

    if (!this.progress.total) {
      const { size, acceptRanges } = await this.probe()
      if (!this.chunks.length) this.planChunks(size, acceptRanges)
      else this.progress.total = size
      this.recomputeReceived()
    }

    this.startSpeedTimer()
    await this.runWorkers()
    if (!this.destroyed && !this.pauseFlag && this.chunks.every(c => c.done)) {
      await this.merge()
      this.progress.received = this.progress.total
      this.progress.percent = 100
      this.progress.speed = 0
      this.progress.connections = 0
      this.stopSpeedTimer()
      this.status = 'completed'
      this.emit('progress', this.progress)
      this.emit('completed')
      this.cleanupParts()
    }
  }

  pause(): void {
    if (this.status !== 'running') return
    this.pauseFlag = true
    for (const c of this.activeControllers) c.abort()
    this.activeControllers.clear()
    this.status = 'paused'
    this.progress.connections = 0
    this.stopSpeedTimer()
    this.persistState?.(this.chunks)
    this.emit('progress', this.progress)
    this.emit('paused')
  }

  /** 从持久化状态恢复（断点续传） */
  restoreState(chunks: ChunkPlan[], receivedBytes: number, totalBytes: number): void {
    if (this.chunks.length) return
    this.chunks.push(...chunks)
    this.progress.total = totalBytes
    this.progress.received = receivedBytes
    this.progress.percent = totalBytes ? Math.round((receivedBytes / totalBytes) * 10000) / 100 : 0
  }

  /** 断点恢复后重算已收字节：完成块 + 半成品 part 文件大小 */
  recomputeReceived(): void {
    let received = 0
    for (const c of this.chunks) {
      const expected = c.end - c.start + 1
      if (c.done) { received += expected; continue }
      const p = path.join(this.tmpDir, `${c.index}.part`)
      try { received += fs.statSync(p).size } catch { /* 未开始 */ }
    }
    this.progress.received = received
    this.progress.percent = this.progress.total ? Math.round((received / this.progress.total) * 10000) / 100 : 0
  }

  private async runWorkers(): Promise<void> {
    const workers: Promise<void>[] = []
    for (let i = 0; i < this.connections; i++) workers.push(this.workerLoop(i))
    await Promise.all(workers)
  }

  private async workerLoop(_wid: number): Promise<void> {
    while (!this.pauseFlag && !this.destroyed) {
      const chunk = this.chunks.find(c => !c.done)
      if (!chunk) return
      // 抢占标记：置 done=false 但用 in-flight set 防重复
      if (this.inflight.has(chunk.index)) return
      this.inflight.add(chunk.index)
      try {
        await this.downloadChunk(chunk)
        chunk.done = true
        this.persistState?.(this.chunks)
        this.emit('chunkDone', chunk.index)
      } catch (err: any) {
        if (this.pauseFlag || this.destroyed || err?.name === 'AbortError') { this.inflight.delete(chunk.index); return }
        if (err?.message === 'NO_RANGE' && !this.rangeDowngraded) {
          // 降级：重建为单块，清理旧分块文件，立即继续（不计失败次数）
          this.rangeDowngraded = true
          this.rebuildAsSingleChunk()
          this.inflight.delete(chunk.index)
          continue
        }
        chunk.tries++
        if (chunk.tries > this.maxRetries) {
          this.status = 'failed'
          this.emit('error', new Error(`分块 ${chunk.index} 重试 ${this.maxRetries} 次仍失败: ${err?.message ?? err}`))
          this.pause()
          return
        }
        await new Promise(r => setTimeout(r, Math.min(500 * 2 ** chunk.tries, 8000)))
      } finally {
        this.inflight.delete(chunk.index)
      }
    }
  }
  private inflight = new Set<number>()
  private rangeDowngraded = false

  /** 降级重建：多块 → 单块整文件下载 */
  rebuildAsSingleChunk(): void {
    try { fs.rmSync(this.tmpDir, { recursive: true, force: true }) } catch { /* ignore */ }
    fs.mkdirSync(this.tmpDir, { recursive: true })
    this.chunks.length = 0
    this.chunks.push({ index: 0, start: 0, end: this.progress.total - 1, done: false, tries: 0 })
    this.progress.received = 0
    this.rangeDowngraded = true
  }

  private async downloadChunk(chunk: ChunkPlan): Promise<void> {
    fs.mkdirSync(this.tmpDir, { recursive: true })
    const ac = new AbortController()
    this.activeControllers.add(ac)
    const partPath = path.join(this.tmpDir, `${chunk.index}.part`)
    const expected = chunk.end - chunk.start + 1

    // 断点：块内续传
    let resumeAt = 0
    if (fs.existsSync(partPath)) {
      const st = fs.statSync(partPath)
      if (st.size === expected) { chunk.done = true; this.activeControllers.delete(ac); return }
      if (st.size > 0 && st.size < expected) resumeAt = st.size
      else fs.rmSync(partPath, { force: true })
    }

    const headers = {
      ...this.headers,
      Range: `bytes=${chunk.start + resumeAt}-${chunk.end}`,
      'Accept-Encoding': 'identity'
    }

    await new Promise<void>((resolve, reject) => {
      const mod = this.url.startsWith('https:') ? https : http
      const u = new URL(this.url)
      const r = mod.request({
        hostname: u.hostname,
        port: u.port || (this.url.startsWith('https:') ? 443 : 80),
        path: u.pathname + u.search,
        method: 'GET',
        headers: { ...headers, Host: u.host },
        signal: ac.signal
      }, res => {
        if (res.statusCode === 200 && (chunk.start > 0 || this.chunks.length > 1)) {
          // 请求了 Range 却返回 200：服务器实际不支持 Range → 引擎降级为单连接整文件下载
          res.destroy()
          fs.rmSync(partPath, { force: true })
          this.activeControllers.delete(ac)
          reject(new Error('NO_RANGE'))
          return
        }
        if (res.statusCode === 200 && resumeAt > 0) {
          // 单块且已有半成品但服务器不支持 Range：删除半成品，从块头重新下载（单次递归）
          res.destroy()
          fs.rmSync(partPath, { force: true })
          this.activeControllers.delete(ac)
          this.downloadChunk(chunk).then(() => resolve()).catch(reject)
          return
        }
        if (res.statusCode !== 206 && res.statusCode !== 200) {
          res.destroy()
          reject(new Error(`HTTP ${res.statusCode}`))
          return
        }
        const stream = fs.createWriteStream(partPath, { flags: resumeAt > 0 ? 'a' : 'w' })
        res.on('data', (buf: Buffer) => {
          this.speedWindow.push({ t: Date.now(), b: buf.length })
          if (this.speedLimitBps > 0) {
            // 近似限速：超出本秒预算则暂停流 100ms
            if (Date.now() - this.limitTickStart >= 1000) { this.limitTickStart = Date.now(); this.limitTickBytes = 0 }
            this.limitTickBytes += buf.length
            if (this.limitTickBytes > this.speedLimitBps) {
              res.pause()
              setTimeout(() => { this.limitTickBytes = 0; res.resume() }, 100)
            }
          }
          this.progress.received += buf.length
        })
        res.on('error', reject)
        res.pipe(stream)
        stream.on('finish', () => {
          const st = fs.statSync(partPath)
          if (st.size !== expected) {
            reject(new Error(`块大小不符 got=${st.size} want=${expected}`))
          } else resolve()
        })
        stream.on('error', reject)
      })
      r.on('error', reject)
      r.end()
    })
    this.activeControllers.delete(ac)
    this.updateProgressSnapshot()
  }

  setSpeedLimit(bps: number): void { this.speedLimitBps = bps }

  private limitTickStart = 0
  private limitTickBytes = 0

  private updateProgressSnapshot(): void {
    const now = Date.now()
    this.speedWindow = this.speedWindow.filter(x => now - x.t < 1000)
    const bytes1s = this.speedWindow.reduce((s, x) => s + x.b, 0)
    this.progress.speed = bytes1s
    this.progress.percent = this.progress.total ? Math.round((this.progress.received / this.progress.total) * 10000) / 100 : 0
    this.progress.connections = this.activeControllers.size
    this.emit('progress', this.progress)
  }

  private startSpeedTimer(): void {
    this.stopSpeedTimer()
    this.speedTimer = setInterval(() => this.updateProgressSnapshot(), 500)
  }
  private stopSpeedTimer(): void { if (this.speedTimer) { clearInterval(this.speedTimer); this.speedTimer = undefined } }

  private async merge(): Promise<void> {
    const out = fs.createWriteStream(this.filePath, { flags: 'w' })
    for (const c of this.chunks) {
      const part = path.join(this.tmpDir, `${c.index}.part`)
      await new Promise<void>((res, rej) => {
        const rs = fs.createReadStream(part)
        rs.pipe(out, { end: false })
        rs.on('end', res); rs.on('error', rej)
      })
    }
    await new Promise<void>(res => out.end(res))
  }

  cleanupParts(): void {
    try { fs.rmSync(this.tmpDir, { recursive: true, force: true }) } catch { /* ignore */ }
  }

  /** 校验文件完整性（长度 + 可选 MD5，流式计算避免大文件占内存） */
  verify(md5?: string): Promise<{ ok: boolean; reason?: string }> {
    return new Promise(resolve => {
      const st = fs.statSync(this.filePath)
      if (st.size !== this.progress.total) { resolve({ ok: false, reason: `大小不符 ${st.size} != ${this.progress.total}` }); return }
      if (!md5) { resolve({ ok: true }); return }
      const hash = crypto.createHash('md5')
      const rs = fs.createReadStream(this.filePath)
      rs.on('data', (d: Buffer | string) => hash.update(d))
      rs.on('end', () => resolve({ ok: hash.digest('hex') === md5, reason: undefined }))
      rs.on('error', e => resolve({ ok: false, reason: e.message }))
    })
  }
}
