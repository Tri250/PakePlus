/**
 * 云析Down 主进程入口
 * - 无边框窗口 + IPC 窗口控制
 * - 三通道（本地演示 / 官方开放平台 / 网页 Cookie）+ 任务管理器装配
 * - 全部 IPC handler 与事件推送
 */
import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import * as path from 'node:path'
import { JsonStore } from './store/jsonStore'
import { TaskManager } from './engine/taskManager'
import { MockChannel } from './parse/mockChannel'
import { OfficialChannel } from './parse/officialChannel'
import { WebChannel } from './parse/webChannel'
import { ChannelManager } from './parse/channelManager'
import { IPC } from '../shared/types'

let win: BrowserWindow | null = null
let store: JsonStore
let tm: TaskManager
let cm: ChannelManager
let mock: MockChannel

const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus() } })
}

function createWindow(): void {
  win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1080,
    minHeight: 700,
    frame: false,
    show: false,
    backgroundColor: '#f5f7fb',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })
  win.once('ready-to-show', () => win?.show())
  // 阻止页面自身导航（下载链接等交给系统浏览器/下载器）
  win.webContents.setWindowOpenHandler(({ url }) => { void shell.openExternal(url); return { action: 'deny' } })

  if (process.env.ELECTRON_RENDERER_URL) {
    void win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    void win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
  win.on('closed', () => { win = null })
}

function defaultDownloadDir(): string {
  return path.join(app.getPath('downloads'), 'yunxicc')
}

async function initServices(): Promise<void> {
  store = new JsonStore(app.getPath('userData'), defaultDownloadDir())
  const cfg = () => ({
    downloadDir: store.getConfig().downloadDir || defaultDownloadDir(),
    connections: store.getConfig().connections,
    chunkSizeMB: store.getConfig().chunkSizeMB,
    maxParallelTasks: store.getConfig().maxParallelTasks,
    speedLimitMB: store.getConfig().speedLimitMB
  })
  mock = new MockChannel()
  await mock.init(app.getPath('userData'))
  cm = new ChannelManager([mock, new OfficialChannel(() => store.getConfig()), new WebChannel(() => store.getConfig())])
  tm = new TaskManager(store, cfg)
  void cm.status().then(() => cm.setActive('mock'))

  // 事件推送
  tm.on('progress', p => { if (win && !win.isDestroyed()) win.webContents.send(IPC.taskProgress, p) })
  tm.on('stats', s => { if (win && !win.isDestroyed()) win.webContents.send(IPC.statsUpdate, s) })
}

function registerIpc(): void {
  ipcMain.handle(IPC.parseSubmit, (_e, link: string, pwd: string) => cm.parse(link, pwd))
  ipcMain.handle(IPC.taskCreate, async (_e, paths: string[]) => {
    const { ok, message, files } = await cm.resolveFiles(paths)
    if (!ok || !files.length) return { created: 0, message: message ?? '未取得有效直链' }
    const r = tm.createTasks(files, cm.downloadHeaders())
    return { ...r, message }
  })
  ipcMain.handle(IPC.taskList, () => tm.getTasks())
  ipcMain.handle(IPC.taskPause, (_e, id: string) => tm.pause(id))
  ipcMain.handle(IPC.taskResume, (_e, id: string) => tm.resume(id))
  ipcMain.handle(IPC.taskRemove, (_e, id: string) => tm.remove(id))
  ipcMain.handle(IPC.taskRetry, (_e, id: string) => tm.retry(id))
  ipcMain.handle(IPC.statsGet, () => tm.stats())
  ipcMain.handle(IPC.channelStatus, () => cm.status())
  ipcMain.handle(IPC.channelSwitch, (_e, id: string) => { cm.setActive(id) })
  ipcMain.handle(IPC.configGet, () => store.getConfig())
  ipcMain.handle(IPC.configSet, (_e, patch: Record<string, unknown>) => store.patchConfig(patch as never))
  ipcMain.handle(IPC.dialogChooseDir, async () => {
    const r = await dialog.showOpenDialog(win!, { properties: ['openDirectory', 'createDirectory'], title: '选择下载目录', defaultPath: store.getConfig().downloadDir })
    return r.canceled ? '' : r.filePaths[0]
  })
  ipcMain.handle(IPC.winMin, () => win?.minimize())
  ipcMain.handle(IPC.winMaxToggle, () => { if (win?.isMaximized()) win.unmaximize(); else win?.maximize() })
  ipcMain.handle(IPC.winClose, () => win?.close())
  ipcMain.handle(IPC.openExternal, (_e, url: string) => { if (/^https?:\/\//.test(url)) void shell.openExternal(url) })
}

app.whenReady().then(async () => {
  await initServices()
  registerIpc()
  createWindow()
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })

app.on('before-quit', e => {
  if (tm) {
    e.preventDefault()
    void tm.shutdown().then(() => { mock?.dispose(); app.exit(0) })
  }
})
