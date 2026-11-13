/**
 * 预加载桥：contextIsolation 下安全暴露 RendererApi
 */
import { contextBridge, ipcRenderer } from 'electron'
import type { DownloadTask, TaskProgress, StatsSnapshot, AppConfig, RemoteFile } from '@shared/types'
import { IPC } from '@shared/types'

const api = {
  platform: 'electron' as const,

  async parseSubmit(link: string, pwd: string, cardKey?: string) {
    // cardKey 由真实后端体系校验；本地交付模式下与链接一起透传（未配置卡密体系时忽略）
    void cardKey
    return ipcRenderer.invoke(IPC.parseSubmit, link, pwd)
  },
  async taskCreate(paths: string[]) { return ipcRenderer.invoke(IPC.taskCreate, paths) },
  async taskList(): Promise<DownloadTask[]> { return ipcRenderer.invoke(IPC.taskList) },
  async taskPause(id: string): Promise<void> { return ipcRenderer.invoke(IPC.taskPause, id) },
  async taskResume(id: string): Promise<void> { return ipcRenderer.invoke(IPC.taskResume, id) },
  async taskRemove(id: string): Promise<void> { return ipcRenderer.invoke(IPC.taskRemove, id) },
  async taskRetry(id: string): Promise<void> { return ipcRenderer.invoke(IPC.taskRetry, id) },

  onProgress(cb: (p: TaskProgress) => void): () => void {
    const h = (_e: unknown, p: TaskProgress) => cb(p)
    ipcRenderer.on(IPC.taskProgress, h as never)
    return () => ipcRenderer.removeListener(IPC.taskProgress, h as never)
  },
  onStats(cb: (s: StatsSnapshot) => void): () => void {
    const h = (_e: unknown, s: StatsSnapshot) => cb(s)
    ipcRenderer.on(IPC.statsUpdate, h as never)
    return () => ipcRenderer.removeListener(IPC.statsUpdate, h as never)
  },
  async statsGet(): Promise<StatsSnapshot> { return ipcRenderer.invoke(IPC.statsGet) },

  async channelStatus() { return ipcRenderer.invoke(IPC.channelStatus) },
  async channelSwitch(id: string) { return ipcRenderer.invoke(IPC.channelSwitch, id) },
  async configGet(): Promise<AppConfig> { return ipcRenderer.invoke(IPC.configGet) },
  async configSet(patch: Partial<AppConfig>): Promise<AppConfig> { return ipcRenderer.invoke(IPC.configSet, patch) },
  async chooseDir(): Promise<string> { return ipcRenderer.invoke(IPC.dialogChooseDir) },

  minimize(): void { void ipcRenderer.invoke(IPC.winMin) },
  maxToggle(): void { void ipcRenderer.invoke(IPC.winMaxToggle) },
  close(): void { void ipcRenderer.invoke(IPC.winClose) },
  openExternal(url: string): void { void ipcRenderer.invoke(IPC.openExternal, url) }
}

contextBridge.exposeInMainWorld('api', api)

// 类型侧辅助导出（打包时 rollup 会剔除）
export type { DownloadTask, TaskProgress, StatsSnapshot, AppConfig, RemoteFile }
