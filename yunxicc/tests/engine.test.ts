/**
 * 下载引擎自测：本地 HTTP Range 服务器 + 真实字节校验
 * 覆盖：单块/多块并发、暂停恢复、跨进程断点续传、失败重试、MD5 校验、无 Range 服务器降级
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import * as http from 'node:http'
import * as crypto from 'node:crypto'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'
import { DownloadJob } from '../src/main/engine/downloadEngine'

let server: http.Server
let baseUrl = ''
let dataBuf: Buffer
let workDir: string
let failCounts: Record<string, number> = {}
let failFirstN = 0          // 指定范围请求前 N 次返回 500
let rejectHead = false      // 模拟不支持 HEAD
let noRange = false         // 模拟不支持 Range（返回 200 全量）

beforeAll(async () => {
  workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yunxicc-engine-'))
  dataBuf = crypto.randomBytes(5 * 1024 * 1024) // 5MB 随机数据
  server = http.createServer((req, res) => {
    const range = req.headers.range
    if (req.method === 'HEAD') {
      if (rejectHead) { res.writeHead(405); res.end(); return }
      res.writeHead(200, { 'Content-Length': String(dataBuf.length), 'Accept-Ranges': 'bytes' })
      res.end()
      return
    }
    // GET
    if (failFirstN > 0 && range) {
      failCounts[range] = (failCounts[range] ?? 0) + 1
      if (failCounts[range] <= failFirstN) { res.writeHead(500); res.end(); return }
    }
    const m = range ? /bytes=(\d+)-(\d+)/.exec(range) : null
    const delay = Number(new URL(req.url ?? '/', 'http://x').searchParams.get('delay') ?? 0)
    const respond = () => {
      if (m && !noRange) {
        const start = Number(m[1]), end = Number(m[2])
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${dataBuf.length}`,
          'Content-Length': String(end - start + 1),
          'Accept-Ranges': 'bytes'
        })
        res.end(dataBuf.subarray(start, end + 1))
      } else {
        res.writeHead(200, { 'Content-Length': String(dataBuf.length) })
        res.end(dataBuf)
      }
    }
    if (delay > 0) setTimeout(respond, delay)
    else respond()
  })
  await new Promise<void>(r => server.listen(0, '127.0.0.1', r))
  baseUrl = `http://127.0.0.1:${(server.address() as any).port}/file.bin`
})

afterAll(() => { server.close() })
beforeEach(() => { failFirstN = 0; rejectHead = false; noRange = false; failCounts = {} })

const outPath = (name: string) => path.join(workDir, name)

describe('DownloadJob 核心引擎', () => {
  it('1. 单块小文件下载内容一致', async () => {
    const p = outPath('small.bin')
    const job = new DownloadJob({ url: baseUrl, filePath: p, connections: 1 })
    await job.start()
    expect(job.status).toBe('completed')
    const buf = fs.readFileSync(p)
    expect(buf.length).toBe(dataBuf.length)
    expect(buf.equals(dataBuf)).toBe(true)
  }, 20000)

  it('2. 多块并发下载(5MB/1MB块/3连接)内容一致', async () => {
    const p = outPath('multi.bin')
    const job = new DownloadJob({ url: baseUrl, filePath: p, connections: 3, chunkSize: 1024 * 1024 })
    await job.start()
    expect(job.chunks.length).toBe(5)
    expect(job.status).toBe('completed')
    expect(fs.readFileSync(p).equals(dataBuf)).toBe(true)
    job.cleanupParts()
    expect(fs.existsSync(p + '.yunxicc-parts')).toBe(false)
  }, 20000)

  it('3. 暂停后恢复 → 最终内容一致', async () => {
    const p = outPath('pause.bin')
    const job = new DownloadJob({ url: `${baseUrl}?delay=120`, filePath: p, connections: 2, chunkSize: 1024 * 1024 })
    const started = job.start()
    await new Promise(r => setTimeout(r, 60))   // 块下载中(delay=120ms/块)
    job.pause()
    expect(job.status).toBe('paused')
    await new Promise(r => setTimeout(r, 50))
    await job.start()                            // 恢复
    await started
    expect(job.status).toBe('completed')
    expect(fs.readFileSync(p).equals(dataBuf)).toBe(true)
  }, 20000)

  it('4. 服务端瞬时 500 → 自动重试成功', async () => {
    failFirstN = 2
    const p = outPath('retry.bin')
    const job = new DownloadJob({ url: baseUrl, filePath: p, connections: 2, chunkSize: 1024 * 1024, maxRetries: 5 })
    await job.start()
    expect(job.status).toBe('completed')
    expect(fs.readFileSync(p).equals(dataBuf)).toBe(true)
  }, 30000)

  it('5. 模拟进程重启：新 Job 恢复分块状态续传', async () => {
    const p = outPath('resume.bin')
    const partsDir = p + '.yunxicc-parts'
    const statePath = path.join(workDir, 'resume.state.json')
    // 第一段：下载 2 个块后"崩溃"退出
    {
      const job = new DownloadJob({
        url: baseUrl, filePath: p, connections: 1, chunkSize: 1024 * 1024,
        persistState: chunks => fs.writeFileSync(statePath, JSON.stringify(chunks))
      })
      const started = job.start()
      await new Promise(r => {
        job.on('chunkDone', (idx: number) => { if (idx >= 1) r(null) })
      })
      job.pause()
      await started
      expect(fs.existsSync(partsDir)).toBe(true)
    }
    // "重启"：新 Job 从持久化分块状态恢复续传
    const snapshot = JSON.parse(fs.readFileSync(statePath, 'utf-8')) as any[]
    expect(snapshot.length).toBe(5)
    expect(snapshot.filter(c => c.done).length).toBeGreaterThanOrEqual(2)
    const job2 = new DownloadJob({ url: baseUrl, filePath: p, connections: 2, chunkSize: 1024 * 1024, restoredChunks: snapshot })
    job2.restoreState(snapshot, 0, 5 * 1024 * 1024)
    await job2.start()
    expect(job2.status).toBe('completed')
    expect(fs.readFileSync(p).equals(dataBuf)).toBe(true)
  }, 20000)

  it('6. verify() 长度与 MD5 校验', async () => {
    const p = outPath('verify.bin')
    const job = new DownloadJob({ url: baseUrl, filePath: p, connections: 2, chunkSize: 1024 * 1024 })
    await job.start()
    const md5 = crypto.createHash('md5').update(dataBuf).digest('hex')
    expect((await job.verify(md5)).ok).toBe(true)
    expect((await job.verify('deadbeef')).ok).toBe(false)
  }, 20000)

  it('7. 无 Range 服务器 → 单块降级且内容一致', async () => {
    noRange = true
    const p = outPath('norange.bin')
    const job = new DownloadJob({ url: baseUrl, filePath: p, connections: 4, chunkSize: 1024 * 1024 })
    await job.start()
    expect(job.chunks.length).toBe(1)
    expect(fs.readFileSync(p).equals(dataBuf)).toBe(true)
  }, 20000)
})
