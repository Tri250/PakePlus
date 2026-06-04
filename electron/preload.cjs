const { contextBridge, ipcRenderer } = require('electron');

// 向渲染进程暴露安全的API
contextBridge.exposeInMainWorld('electronAPI', {
  // 窗口控制
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),

  // 剪贴板
  readClipboard: () => ipcRenderer.invoke('clipboard-read'),
  writeClipboard: (text) => ipcRenderer.invoke('clipboard-write', text),

  // 文件对话框
  openFileDialog: () => ipcRenderer.invoke('dialog-open'),
  saveFileDialog: () => ipcRenderer.invoke('dialog-save'),

  // 外部链接
  openExternal: (url) => ipcRenderer.invoke('shell-open', url),

  // 平台信息
  platform: process.platform,
  isElectron: true
});