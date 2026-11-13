/**
 * 原子 JSON 持久化存储（任务 / 配置 / 统计）
 *
 * - 写入采用「临时文件 + rename」保证崩溃时不损坏数据
 * - 防抖合并写：高频进度更新不会频繁落盘（持久化分块断点单独走 chunkState）
 */
import * as fs from 'node:fs'
import * as path from 'node:path'
import type { AppConfig, DownloadTask } from '@shared/types'

export interface PersistedChunkState {
  taskId: string
  chunks: { index: number; start: number; end: number; done: boolean; tries: number }[]
  received: number
  total: number
  url: string
  filePath: string
  headers: Record<string, string>
}

interface StoreShape {
  tasks: DownloadTask[]
  chunkStates: Record<string, PersistedChunkState>
  stats: { totalBytesDone: number }
  config: AppConfig
  version: number
}

export const DEFAULT_CONFIG: AppConfig = {
  downloadDir: '', // 主进程初始化时填默认（系统下载目录/yunxicc）
  connections: 8,
  chunkSizeMB: 8,
  maxParallelTasks: 3,
  speedLimitMB: 0,
  webCookie: '',
  webReferer: 'https://pan.baidu.com/disk/home',
  webUserAgent: 'netdisk;P2SP;2.2.91.136;android-device',
  officialAppKey: '',
  officialSecret: '',
  officialAccessToken: '',
  autoStart: true,
  theme: 'light',
  agreedProtocol: false
}

export class JsonStore {
  private file: string
  private data: StoreShape
  private flushTimer?: NodeJS.Timeout
  private flushing = false
  private dirty = false

  constructor(userDataDir: string, defaultDownloadDir: string) {
    fs.mkdirSync(userDataDir, { recursive: true })
    this.file = path.join(userDataDir, 'yunxicc-store.json')
    const loaded = this.load()
    this.data = {
      tasks: loaded?.tasks ?? [],
      chunkStates: loaded?.chunkStates ?? {},
      stats: loaded?.stats ?? { totalBytesDone: 0 },
      config: { ...DEFAULT_CONFIG, ...(loaded?.config ?? {}), downloadDir: loaded?.config?.downloadDir || defaultDownloadDir },
      version: 1
    }
  }

  private load(): StoreShape | null {
    for (const f of [this.file, this.file + '.bak']) {
      try {
        const raw = fs.readFileSync(f, 'utf-8')
        return JSON.parse(raw) as StoreShape
      } catch { /* 尝试下一个 */ }
    }
    return null
  }

  // ---- tasks ----
  getTasks(): DownloadTask[] { return this.data.tasks }
  upsertTask(t: DownloadTask): void {
    const i = this.data.tasks.findIndex(x => x.id === t.id)
    if (i >= 0) this.data.tasks[i] = t
    else this.data.tasks.unshift(t)
    this.scheduleFlush()
  }
  removeTask(id: string): void {
    this.data.tasks = this.data.tasks.filter(t => t.id !== id)
    delete this.data.chunkStates[id]
    this.scheduleFlush()
  }

  // ---- chunk 断点 ----
  saveChunkState(s: PersistedChunkState): void {
    this.data.chunkStates[s.taskId] = s
    this.scheduleFlush(800)
  }
  getChunkState(taskId: string): PersistedChunkState | undefined { return this.data.chunkStates[taskId] }
  deleteChunkState(taskId: string): void { delete this.data.chunkStates[taskId]; this.scheduleFlush(300) }

  // ---- stats ----
  addTotalBytes(n: number): void {
    this.data.stats.totalBytesDone += n
    this.scheduleFlush(1500)
  }
  getTotalBytesDone(): number { return this.data.stats.totalBytesDone }

  // ---- config ----
  getConfig(): AppConfig { return this.data.config }
  patchConfig(patch: Partial<AppConfig>): AppConfig {
    this.data.config = { ...this.data.config, ...patch }
    this.flushNow()
    return this.data.config
  }

  /** 防抖合并写 */
  private scheduleFlush(delay = 300): void {
    this.dirty = true
    if (this.flushTimer) return
    this.flushTimer = setTimeout(() => { this.flushTimer = undefined; this.flushNow() }, delay)
  }

  flushNow(): void {
    if (this.flushTimer) { clearTimeout(this.flushTimer); this.flushTimer = undefined }
    if (!this.dirty && fs.existsSync(this.file)) return
    this.dirty = false
    const tmp = this.file + '.tmp'
    fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2), 'utf-8')
    // 原子替换：保留上一份作为 .bak
    try { if (fs.existsSync(this.file)) fs.copyFileSync(this.file, this.file + '.bak') } catch { /* ignore */ }
    fs.renameSync(tmp, this.file)
  }

  /** 供保存时序列化 chunk（内部状态） */
  static toPersisted(task: DownloadTask, chunks: { index: number; start: number; end: number; done: boolean; tries: number }[]): PersistedChunkState {
    return { taskId: task.id, chunks, received: task.received, total: task.size, url: task.url, filePath: task.localPath, headers: task.headers }
  }
}
