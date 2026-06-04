const { app, BrowserWindow, ipcMain, clipboard, dialog, shell } = require('electron');
const path = require('path');

// 禁用硬件加速以提高兼容性
app.disableHardwareAcceleration();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1280,
    minHeight: 720,
    frame: false,
    backgroundColor: '#ffffff',
    show: false,  // 先隐藏，加载完成后再显示，避免白屏
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    icon: path.join(__dirname, '../assets/icon.png')
  });

  // 开发环境加载本地服务器
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // 生产环境加载打包后的文件
    const indexPath = path.join(__dirname, '../dist/index.html');
    console.log('Loading:', indexPath);
    mainWindow.loadFile(indexPath);
  }

  // 页面加载完成后显示窗口
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // 监听加载失败
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  // 监听控制台消息
  mainWindow.webContents.on('console-message', (event, level, message) => {
    console.log('Renderer:', message);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 应用就绪时创建窗口
app.whenReady().then(createWindow);

// 所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// macOS点击dock图标时重新创建窗口
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC处理 - 窗口控制
ipcMain.on('window-minimize', () => {
  mainWindow?.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.on('window-close', () => {
  mainWindow?.close();
});

// IPC处理 - 剪贴板
ipcMain.handle('clipboard-read', () => {
  return clipboard.readText();
});

ipcMain.handle('clipboard-write', (event, text) => {
  clipboard.writeText(text);
  return true;
});

// IPC处理 - 文件对话框
ipcMain.handle('dialog-open', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Excel Files', extensions: ['xlsx', 'xls', 'csv'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  return result.filePaths;
});

ipcMain.handle('dialog-save', async () => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: 'Excel Files', extensions: ['xlsx', 'csv'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  return result.filePath;
});

// IPC处理 - 打开外部链接
ipcMain.handle('shell-open', (event, url) => {
  shell.openExternal(url);
  return true;
});