// ===== 共享类型定义（主进程 / 渲染进程 / 预加载 三方契约） =====

export type TaskStatus =
  | 'pending'      // 排队中
  | 'parsing'      // 解析中
  | 'ready'        // 已就绪(已取到直链)
  | 'downloading'  // 下载中
  | 'paused'       // 已暂停
  | 'completed'    // 已完成
  | 'failed'       // 失败
  | 'canceled'     // 已取消

export interface ChunkState {
  index: number
  start: number
  end: number        // inclusive
  done: boolean
  tries: number
}

export interface TaskProgress {
  taskId: string
  received: number
  total: number
  percent: number
  speed: number      // bytes/s
  connections: number
}

export interface DownloadTask {
  id: string
  name: string                 // 原始文件名
  remotePath: string           // 网盘完整路径(用于目录镜像)
  url: string                  // dlink 直链
  headers: Record<string, string>
  localPath: string            // 本地落盘完整路径
  size: number                 // 字节
  status: TaskStatus
  received: number
  speed: number
  connections: number
  error?: string
  createdAt: number
  updatedAt: number
  completedAt?: number
}

export interface RemoteFile {
  id: string
  name: string
  path: string            // 网盘完整路径
  size: number
  isDir: boolean
  dlink?: string          // 下载直链（解析/创建任务时获取）
  children?: RemoteFile[]
}

export interface ParseResult {
  ok: boolean
  message: string
  channel: string
  files: RemoteFile[]
}

export interface ChannelInfo {
  id: string
  name: string
  ok: boolean
  message: string
  configured: boolean     // 凭据是否已配置
}

export interface AppConfig {
  downloadDir: string
  connections: number          // 单任务并发连接数
  chunkSizeMB: number
  maxParallelTasks: number
  speedLimitMB: number         // 0 = 不限速
  webCookie: string            // 通道B: BDUSS 等 cookie
  webReferer: string
  webUserAgent: string
  officialAppKey: string       // 通道A: 开放平台
  officialSecret: string
  officialAccessToken: string
  autoStart: boolean
  theme: 'light' | 'dark'
  agreedProtocol: boolean
}

export interface StatsSnapshot {
  totalTasks: number
  completed: number
  downloading: number
  totalBytesDone: number   // 历史累计(只增不减)
  totalSpeed: number
}

// ===== IPC 通道名 =====
export const IPC = {
  parseSubmit: 'parse:submit',
  parseTree: 'parse:tree',
  taskCreate: 'task:create',
  taskList: 'task:list',
  taskPause: 'task:pause',
  taskResume: 'task:resume',
  taskRemove: 'task:remove',
  taskRetry: 'task:retry',
  taskProgress: 'task:progress',       // main -> renderer
  statsGet: 'stats:get',
  statsUpdate: 'stats:update',         // main -> renderer
  channelStatus: 'channel:status',
  channelSwitch: 'channel:switch',
  configGet: 'config:get',
  configSet: 'config:set',
  dialogChooseDir: 'dialog:chooseDir',
  winMin: 'window:minimize',
  winMaxToggle: 'window:maximizeToggle',
  winClose: 'window:close',
  openExternal: 'shell:openExternal'
} as const

export type IpcChannel = (typeof IPC)[keyof typeof IPC]

// ===== 解析通道接口（本地演示 / 官方开放平台 / 网页 Cookie 三通道） =====
export interface IParseChannel {
  id: string
  name: string
  /** 健康检查 + 凭据检测 */
  probe(): Promise<{ ok: boolean; message: string; configured: boolean }>
  /** 解析分享链接 → 文件树（不含直链） */
  parse(link: string, pwd: string): Promise<ParseResult>
  /** 按网盘路径获取可下载文件信息（含新鲜 dlink） */
  resolveFiles(paths: string[]): Promise<{ ok: boolean; message?: string; files: RemoteFile[] }>
  /** 下载直链请求所需附加头（Cookie / UA / Referer） */
  downloadHeaders(): Record<string, string>
  dispose?(): void
}

// 渲染进程可用的 API（preload 注入 / 浏览器 mock 注入）
export interface RendererApi {
  parseSubmit(link: string, pwd: string, cardKey?: string): Promise<ParseResult>
  taskCreate(paths: string[]): Promise<{ created: number }>
  taskList(): Promise<DownloadTask[]>
  taskPause(id: string): Promise<void>
  taskResume(id: string): Promise<void>
  taskRemove(id: string): Promise<void>
  taskRetry(id: string): Promise<void>
  onProgress(cb: (p: TaskProgress) => void): void
  onStats(cb: (s: StatsSnapshot) => void): void
  statsGet(): Promise<StatsSnapshot>
  channelStatus(): Promise<ChannelInfo[]>
  channelSwitch(id: string): Promise<void>
  configGet(): Promise<AppConfig>
  configSet(patch: Partial<AppConfig>): Promise<AppConfig>
  chooseDir(): Promise<string>
  minimize(): void
  maxToggle(): void
  close(): void
  openExternal(url: string): void
  platform: 'electron' | 'browser-mock'
}
