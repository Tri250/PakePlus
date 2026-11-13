/**
 * 渲染层 API：
 * - Electron 环境：window.api（preload contextBridge，真实主进程能力）
 * - 纯浏览器环境（vite dev 演示）：browser-mock 完整模拟同一套 RendererApi
 *   （解析→文件树→任务→进度→统计，进度由定时器驱动，状态存 localStorage）
 */
import type { RendererApi, AppConfig, DownloadTask, ParseResult, RemoteFile, StatsSnapshot, ChannelInfo, TaskProgress } from '@shared/types'

declare global {
  interface Window { api?: RendererApi }
}

// ---------- 浏览器演示：虚拟网盘数据 ----------
const MOCK_TREE: RemoteFile[] = [
  { id: '1', name: '文档资料', path: '/文档资料', size: 0, isDir: true, children: [
    { id: '11', name: '产品需求文档.pdf', path: '/文档资料/产品需求文档.pdf', size: 12 * 1024 * 1024, isDir: false },
    { id: '12', name: '接口设计说明.docx', path: '/文档资料/接口设计说明.docx', size: 6 * 1024 * 1024, isDir: false },
    { id: '13', name: '年度报表2026.xlsx', path: '/文档资料/年度报表2026.xlsx', size: 3 * 1024 * 1024, isDir: false }
  ] },
  { id: '2', name: '图片集合', path: '/图片集合', size: 0, isDir: true, children: [
    { id: '21', name: '壁纸_山海.jpg', path: '/图片集合/壁纸_山海.jpg', size: 2 * 1024 * 1024, isDir: false },
    { id: '22', name: '壁纸_星空.jpg', path: '/图片集合/壁纸_星空.jpg', size: 2 * 1024 * 1024, isDir: false },
    { id: '23', name: '壁纸_城市.jpg', path: '/图片集合/壁纸_城市.jpg', size: 2 * 1024 * 1024, isDir: false }
  ] },
  { id: '3', name: '视频资源', path: '/视频资源', size: 0, isDir: true, children: [
    { id: '31', name: '产品发布会.mp4', path: '/视频资源/产品发布会.mp4', size: 64 * 1024 * 1024, isDir: false },
    { id: '32', name: '教程合集', path: '/视频资源/教程合集', size: 0, isDir: true, children: [
      { id: '321', name: '第01课_环境搭建.mp4', path: '/视频资源/教程合集/第01课_环境搭建.mp4', size: 24 * 1024 * 1024, isDir: false },
      { id: '322', name: '第02课_基础操作.mp4', path: '/视频资源/教程合集/第02课_基础操作.mp4', size: 26 * 1024 * 1024, isDir: false }
    ] }
  ] },
  { id: '4', name: '软件工具', path: '/软件工具', size: 0, isDir: true, children: [
    { id: '41', name: '云析Down_Setup.exe', path: '/软件工具/云析Down_Setup.exe', size: 33 * 1024 * 1024, isDir: false },
    { id: '42', name: '驱动包.zip', path: '/软件工具/驱动包.zip', size: 18 * 1024 * 1024, isDir: false }
  ] },
  { id: '5', name: '音乐精选', path: '/音乐精选', size: 0, isDir: true, children: [
    { id: '51', name: '夜曲.flac', path: '/音乐精选/夜曲.flac', size: 9 * 1024 * 1024, isDir: false },
    { id: '52', name: '晴天.mp3', path: '/音乐精选/晴天.mp3', size: 5 * 1024 * 1024, isDir: false }
  ] },
  { id: '6', name: 'readme.txt', path: '/readme.txt', size: 4096, isDir: false }
]

function flatten(files: RemoteFile[], out: RemoteFile[] = []): RemoteFile[] {
  for (const f of files) {
    out.push(f)
    if (f.children) flatten(f.children, out)
  }
  return out
}

const LS_KEY = 'yunxicc-mock-store'

interface MockPersist { tasks: DownloadTask[]; config: AppConfig; totalBytesDone: number; user: string | null }

function defaultConfig(): AppConfig {
  return {
    downloadDir: 'D:/Downloads/yunxicc', connections: 8, chunkSizeMB: 8, maxParallelTasks: 3, speedLimitMB: 0,
    webCookie: '', webReferer: 'https://pan.baidu.com/disk/home', webUserAgent: 'netdisk;P2SP;2.2.91.136;android-device',
    officialAppKey: '', officialSecret: '', officialAccessToken: '',
    autoStart: true, theme: 'light', agreedProtocol: false
  }
}

class BrowserMock implements RendererApi {
  platform = 'browser-mock' as const
  private data: MockPersist
  private progressCbs: ((p: TaskProgress) => void)[] = []
  private statsCbs: ((s: StatsSnapshot) => void)[] = []
  private timers = new Map<string, ReturnType<typeof setInterval>>()

  constructor() {
    let saved: MockPersist | null = null
    try { saved = JSON.parse(localStorage.getItem(LS_KEY) ?? 'null') } catch { saved = null }
    this.data = saved ?? { tasks: [], config: defaultConfig(), totalBytesDone: 0, user: null }
    // 恢复未完成任务为暂停态
    for (const t of this.data.tasks) {
      if (t.status === 'downloading' || t.status === 'pending') { t.status = 'paused'; t.speed = 0; t.connections = 0 }
    }
  }

  private save(): void { localStorage.setItem(LS_KEY, JSON.stringify(this.data)) }
  private emitProgress(t: DownloadTask): void {
    const p: TaskProgress = { taskId: t.id, received: t.received, total: t.size, percent: t.size ? Math.round((t.received / t.size) * 10000) / 100 : 0, speed: t.speed, connections: t.connections }
    for (const cb of this.progressCbs) cb(p)
  }
  private emitStats(): void {
    const ts = this.data.tasks
    const s: StatsSnapshot = {
      totalTasks: ts.length,
      completed: ts.filter(t => t.status === 'completed').length,
      downloading: ts.filter(t => t.status === 'downloading').length,
      totalBytesDone: this.data.totalBytesDone,
      totalSpeed: ts.reduce((a, t) => a + (t.status === 'downloading' ? t.speed : 0), 0)
    }
    for (const cb of this.statsCbs) cb(s)
  }

  private tick(t: DownloadTask): void {
    const step = (6 + Math.random() * 6) * 1024 * 1024 * 0.25 // ~6-12MB/s @250ms
    t.received = Math.min(t.size, t.received + step)
    t.speed = step * 4
    t.connections = 8
    this.emitProgress(t)
    if (t.received >= t.size) {
      t.status = 'completed'
      t.speed = 0; t.connections = 0; t.completedAt = Date.now()
      this.data.totalBytesDone += t.size
      this.stopTimer(t.id)
      this.emitProgress(t)
      this.emitStats()
      this.save()
    }
  }
  private stopTimer(id: string): void { const tm = this.timers.get(id); if (tm) { clearInterval(tm); this.timers.delete(id) } }

  async parseSubmit(link: string, pwd: string): Promise<ParseResult> {
    await new Promise(r => setTimeout(r, 600))
    if (!/(pan\.baidu\.com\/s\/|mock:\/\/share\/)[A-Za-z0-9_-]{4,}/.test(link.trim()))
      return { ok: false, message: '链接格式不正确，应为 https://pan.baidu.com/s/1xxxx 形式', channel: '本地演示', files: [] }
    if (!pwd.trim()) return { ok: false, message: '请输入提取码', channel: '本地演示', files: [] }
    if (pwd.trim() !== 'yuni') return { ok: false, message: '提取码错误（演示通道提取码：yuni）', channel: '本地演示', files: [] }
    const count = flatten(MOCK_TREE).filter(f => !f.isDir).length
    return { ok: true, message: `解析成功，共 ${count} 个文件`, channel: '本地演示', files: MOCK_TREE }
  }

  async taskCreate(paths: string[]): Promise<{ created: number }> {
    const all = flatten(MOCK_TREE)
    let created = 0
    for (const p of paths) {
      const f = all.find(x => x.path === p && !x.isDir)
      if (!f) continue
      if (this.data.tasks.some(t => t.remotePath === p && t.status !== 'completed' && t.status !== 'canceled')) continue
      const t: DownloadTask = {
        id: `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        name: f.name, remotePath: f.path, url: 'mock', headers: {},
        localPath: `${this.data.config.downloadDir}/${f.path}`, size: f.size,
        status: 'pending', received: 0, speed: 0, connections: 0,
        createdAt: Date.now(), updatedAt: Date.now()
      }
      this.data.tasks.unshift(t)
      created++
    }
    this.save()
    this.emitStats()
    for (const t of this.data.tasks) if (t.status === 'pending') this.start(t)
    return { created }
  }
  private start(t: DownloadTask): void {
    if (this.timers.has(t.id)) return
    t.status = 'downloading'
    this.timers.set(t.id, setInterval(() => this.tick(t), 250))
    this.emitStats()
  }

  async taskList(): Promise<DownloadTask[]> { return JSON.parse(JSON.stringify(this.data.tasks)) }
  async taskPause(id: string): Promise<void> {
    const t = this.data.tasks.find(x => x.id === id)
    if (!t || t.status !== 'downloading') return
    this.stopTimer(id)
    t.status = 'paused'; t.speed = 0; t.connections = 0
    this.emitProgress(t); this.emitStats(); this.save()
  }
  async taskResume(id: string): Promise<void> {
    const t = this.data.tasks.find(x => x.id === id)
    if (!t || t.status !== 'paused') return
    this.start(t); this.save()
  }
  async taskRemove(id: string): Promise<void> {
    const t = this.data.tasks.find(x => x.id === id)
    if (t && t.status === 'downloading' && t.received > 0) this.data.totalBytesDone += t.received
    this.stopTimer(id)
    this.data.tasks = this.data.tasks.filter(x => x.id !== id)
    this.emitStats(); this.save()
  }
  async taskRetry(id: string): Promise<void> {
    const t = this.data.tasks.find(x => x.id === id)
    if (!t) return
    t.received = 0; t.error = undefined; t.updatedAt = Date.now()
    this.start(t); this.save()
  }

  onProgress(cb: (p: TaskProgress) => void): void { this.progressCbs.push(cb) }
  onStats(cb: (s: StatsSnapshot) => void): void { this.statsCbs.push(cb) }
  async statsGet(): Promise<StatsSnapshot> { this.emitStats(); return this.emitStatsOnce() }
  private emitStatsOnce(): StatsSnapshot {
    const ts = this.data.tasks
    return {
      totalTasks: ts.length,
      completed: ts.filter(t => t.status === 'completed').length,
      downloading: ts.filter(t => t.status === 'downloading').length,
      totalBytesDone: this.data.totalBytesDone,
      totalSpeed: ts.reduce((a, t) => a + (t.status === 'downloading' ? t.speed : 0), 0)
    }
  }

  async channelStatus(): Promise<ChannelInfo[]> {
    return [
      { id: 'mock', name: '本地演示', ok: true, message: '浏览器演示模式', configured: true },
      { id: 'official', name: '官方开放平台', ok: false, message: '未配置 AppKey / access_token', configured: false },
      { id: 'web', name: '网页 Cookie', ok: false, message: '未配置 Cookie（至少需要 BDUSS）', configured: false }
    ]
  }
  async channelSwitch(): Promise<void> { /* 浏览器演示固定本地通道 */ }
  async configGet(): Promise<AppConfig> { return { ...this.data.config } }
  async configSet(patch: Partial<AppConfig>): Promise<AppConfig> {
    this.data.config = { ...this.data.config, ...patch }
    document.documentElement.dataset.theme = this.data.config.theme
    this.save()
    return { ...this.data.config }
  }
  async chooseDir(): Promise<string> { return this.data.config.downloadDir }
  minimize(): void { /* 浏览器无窗口控制 */ }
  maxToggle(): void { /* 浏览器无窗口控制 */ }
  close(): void { /* 浏览器无窗口控制 */ }
  openExternal(url: string): void { window.open(url, '_blank') }

  get mockUser(): string | null { return this.data.user }
  set mockUser(v: string | null) { this.data.user = v; this.save() }
}

function electronApi(): RendererApi {
  return window.api!
}

export const api: RendererApi & { mockUser?: string | null; setMockUser?: (v: string | null) => void } =
  typeof window !== 'undefined' && window.api ? electronApi() : new BrowserMock()

// 浏览器演示模式把 mockUser 挂到全局便于登录模拟
if (api.platform === 'browser-mock') {
  (window as unknown as { __yunxiccMock: BrowserMock }).__yunxiccMock = api as unknown as BrowserMock
}
