/**
 * 任务管理器：任务生命周期编排
 *
 * - 并发调度：maxParallelTasks 个任务同时下载
 * - 进度聚合：节流推送 IPC（TaskProgress / StatsSnapshot）
 * - 断点续传：分块状态持久化，重启后恢复续传
 * - 目录镜像：网盘路径结构映射到本地 downloadDir
 * - 统计口径：总下载量只增不减（任务完成/移除时累加已收字节）
 */
import { EventEmitter } from 'node:events'
import * as path from 'node:path'
import * as fs from 'node:fs'
import { DownloadJob } from './downloadEngine'
import { JsonStore } from '../store/jsonStore'
import type { DownloadTask, RemoteFile, StatsSnapshot, TaskProgress } from '@shared/types'

const PROGRESS_THROTTLE_MS = 400

function sanitizeSegment(s: string): string {
  return s.replace(/[\\/:*?"<>|]/g, '_').trim() || '_'
}

export class TaskManager extends EventEmitter {
  private jobs = new Map<string, DownloadJob>()
  private lastPushAt = new Map<string, number>()
  private starting = new Set<string>()

  constructor(private store: JsonStore, private cfg: () => { downloadDir: string; connections: number; chunkSizeMB: number; maxParallelTasks: number; speedLimitMB: number }) {
    super()
    this.restoreOnStartup()
  }

  /** 启动时：把上次中断的任务标记为 paused（保留断点，恢复时续传） */
  restoreOnStartup(): void {
    for (const t of this.store.getTasks()) {
      if (t.status === 'downloading' || t.status === 'pending' || t.status === 'parsing' || t.status === 'ready') {
        t.status = 'paused'
        t.speed = 0
        t.connections = 0
        this.store.upsertTask(t)
      }
    }
  }

  /** 从解析结果创建下载任务（目录镜像 remotePath → 本地路径） */
  createTasks(files: RemoteFile[], headers: Record<string, string>): { created: number } {
    const base = this.cfg().downloadDir
    let created = 0
    for (const f of files) {
      if (f.isDir) continue
      const localPath = path.join(base, ...f.path.split('/').filter(Boolean).map(sanitizeSegment))
      const t: DownloadTask = {
        id: `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        name: f.name,
        remotePath: f.path,
        url: f.dlink ?? '',
        headers,
        localPath,
        size: f.size,
        status: 'pending',
        received: 0,
        speed: 0,
        connections: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      // 同路径任务去重：未完成的替换，已完成的跳过
      const dup = this.store.getTasks().find(x => x.remotePath === f.path && x.status !== 'completed' && x.status !== 'canceled')
      if (dup) continue
      this.store.upsertTask(t)
      created++
    }
    this.pushStats()
    if (created) this.pump()
    return { created }
  }

  getTasks(): DownloadTask[] { return this.store.getTasks() }

  pause(id: string): void {
    const t = this.find(id)
    if (!t) return
    const job = this.jobs.get(id)
    if (job) { job.pause(); return } // pause 事件回调里落盘
    if (t.status === 'pending' || t.status === 'failed') {
      t.status = 'paused'
      t.updatedAt = Date.now()
      this.store.upsertTask(t)
      this.pushTask(t)
      this.pushStats()
    }
  }

  async resume(id: string): Promise<void> {
    const t = this.find(id)
    if (!t) return
    if (t.status !== 'paused') return
    t.status = 'pending'
    t.error = undefined
    t.updatedAt = Date.now()
    this.store.upsertTask(t)
    this.pushTask(t)
    this.pump()
  }

  remove(id: string): void {
    const t = this.find(id)
    if (!t) return
    const job = this.jobs.get(id)
    if (job) {
      // 累计下载量后移除
      if (t.received > 0) this.store.addTotalBytes(t.received)
      job.pause()
      job.cleanupParts()
      this.jobs.delete(id)
    } else if (t.status === 'completed') {
      // 已完成任务的体量早已计入 totalBytesDone（完成时累加），此处不重复计
    } else if (t.received > 0) {
      this.store.addTotalBytes(t.received)
    }
    this.store.removeTask(id)
    this.pushStats()
  }

  retry(id: string): void {
    const t = this.find(id)
    if (!t || (t.status !== 'failed' && t.status !== 'canceled')) return
    TaskManager.cleanParts(t.localPath)
    t.status = 'pending'
    t.error = undefined
    t.received = 0
    t.updatedAt = Date.now()
    this.store.deleteChunkState(id) // 清掉旧断点
    this.store.upsertTask(t)
    this.pushTask(t)
    this.pump()
  }

  pauseAll(): void { for (const t of this.getTasks()) if (t.status === 'downloading' || t.status === 'pending') this.pause(t.id) }
  resumeAll(): void { for (const t of this.getTasks()) if (t.status === 'paused') void this.resume(t.id) }

  stats(): StatsSnapshot {
    const ts = this.getTasks()
    return {
      totalTasks: ts.length,
      completed: ts.filter(t => t.status === 'completed').length,
      downloading: ts.filter(t => t.status === 'downloading').length,
      totalBytesDone: this.store.getTotalBytesDone(),
      totalSpeed: ts.reduce((s, t) => s + (t.status === 'downloading' ? t.speed : 0), 0)
    }
  }

  /** 调度器：补满并发窗口 */
  private pump(): void {
    const max = Math.max(1, this.cfg().maxParallelTasks)
    let active = [...this.jobs.keys()].length + this.starting.size
    if (active >= max) return
    const queue = this.getTasks().filter(t => t.status === 'pending')
    for (const t of queue) {
      if (active >= max) break
      void this.startTask(t)
      active++
    }
  }

  private async startTask(t: DownloadTask): Promise<void> {
    if (this.jobs.has(t.id) || this.starting.has(t.id) || t.status !== 'pending') return
    if (!t.url) { t.status = 'failed'; t.error = '缺少下载直链（解析结果无效）'; this.store.upsertTask(t); this.pushTask(t); return }
    this.starting.add(t.id)
    t.status = 'downloading'
    t.updatedAt = Date.now()
    this.store.upsertTask(t)

    const cfg = this.cfg()
    const cs = this.store.getChunkState(t.id)
    const job = new DownloadJob({
      url: t.url,
      filePath: t.localPath,
      headers: t.headers,
      connections: cfg.connections,
      chunkSize: cfg.chunkSizeMB * 1024 * 1024,
      speedLimitBps: cfg.speedLimitMB > 0 ? cfg.speedLimitMB * 1024 * 1024 : 0,
      persistState: chunks => {
        this.store.saveChunkState({ taskId: t.id, chunks, received: job.progress.received, total: t.size, url: t.url, filePath: t.localPath, headers: t.headers })
      },
      restoredChunks: cs?.chunks
    })
    // 断点恢复：注入已收字节数
    if (cs?.chunks?.length) job.restoreState(cs.chunks, cs.received, cs.total)

    job.on('progress', () => this.onProgress(t, job))
    job.on('chunkDone', () => this.onProgress(t, job, true))
    job.on('paused', () => {
      // 仅当仍处于下载态时降级为暂停（引擎失败后会内部 pause，不得覆盖 failed）
      if (t.status !== 'downloading') return
      t.status = 'paused'
      t.speed = 0
      t.connections = 0
      t.updatedAt = Date.now()
      this.jobs.delete(t.id)
      this.store.upsertTask(t)
      this.pushTask(t)
      this.pushStats()
    })
    job.on('completed', () => this.onCompleted(t, job))
    job.on('error', e => this.onError(t, e))

    this.jobs.set(t.id, job)
    this.starting.delete(t.id)
    this.pushTask(t)
    try {
      await job.start()
    } catch (e: any) {
      this.onError(t, e)
    }
  }

  private onProgress(t: DownloadTask, job: DownloadJob, force = false): void {
    t.received = job.progress.received
    t.speed = job.progress.speed
    t.connections = job.progress.connections
    t.updatedAt = Date.now()
    const now = Date.now()
    const last = this.lastPushAt.get(t.id) ?? 0
    if (force || now - last >= PROGRESS_THROTTLE_MS) {
      this.lastPushAt.set(t.id, now)
      this.pushTask(t)
    }
  }

  private onCompleted(t: DownloadTask, job: DownloadJob): void {
    t.status = 'completed'
    t.received = t.size
    t.speed = 0
    t.connections = 0
    t.completedAt = Date.now()
    t.updatedAt = Date.now()
    this.jobs.delete(t.id)
    this.store.deleteChunkState(t.id)
    this.store.upsertTask(t)
    this.store.addTotalBytes(t.size)
    job.cleanupParts()
    this.pushTask(t)
    this.pushStats()
    this.pump()
  }

  private onError(t: DownloadTask, e: Error): void {
    const job = this.jobs.get(t.id)
    t.status = 'failed'
    t.error = e.message
    t.speed = 0
    t.connections = 0
    t.updatedAt = Date.now()
    this.jobs.delete(t.id)
    job?.cleanupParts()
    this.store.upsertTask(t)
    this.pushTask(t)
    this.pushStats()
    this.pump()
  }

  private find(id: string): DownloadTask | undefined { return this.store.getTasks().find(t => t.id === id) }

  /** 推送单任务进度（节流由 onProgress 控制） */
  private pushTask(t: DownloadTask): void {
    const p: TaskProgress = { taskId: t.id, received: t.received, total: t.size, percent: t.size ? Math.round((t.received / t.size) * 10000) / 100 : 0, speed: t.speed, connections: t.connections }
    this.emit('progress', p)
  }

  /** 推送统计快照 */
  pushStats(): void { this.emit('stats', this.stats()) }

  /** 退出前调用：落盘并暂停活动任务 */
  async shutdown(): Promise<void> {
    for (const [, job] of this.jobs) job.pause()
    await new Promise(r => setTimeout(r, 300))
    this.store.flushNow()
  }

  /** 供重试前清理半成品文件 */
  static cleanParts(localPath: string): void {
    try { fs.rmSync(localPath + '.yunxicc-parts', { recursive: true, force: true }) } catch { /* ignore */ }
  }
}
