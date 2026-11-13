"use strict";
const electron = require("electron");
const IPC = {
  parseSubmit: "parse:submit",
  taskCreate: "task:create",
  taskList: "task:list",
  taskPause: "task:pause",
  taskResume: "task:resume",
  taskRemove: "task:remove",
  taskRetry: "task:retry",
  taskProgress: "task:progress",
  // main -> renderer
  statsGet: "stats:get",
  statsUpdate: "stats:update",
  // main -> renderer
  channelStatus: "channel:status",
  channelSwitch: "channel:switch",
  configGet: "config:get",
  configSet: "config:set",
  dialogChooseDir: "dialog:chooseDir",
  winMin: "window:minimize",
  winMaxToggle: "window:maximizeToggle",
  winClose: "window:close",
  openExternal: "shell:openExternal"
};
const api = {
  platform: "electron",
  async parseSubmit(link, pwd, cardKey) {
    return electron.ipcRenderer.invoke(IPC.parseSubmit, link, pwd);
  },
  async taskCreate(paths) {
    return electron.ipcRenderer.invoke(IPC.taskCreate, paths);
  },
  async taskList() {
    return electron.ipcRenderer.invoke(IPC.taskList);
  },
  async taskPause(id) {
    return electron.ipcRenderer.invoke(IPC.taskPause, id);
  },
  async taskResume(id) {
    return electron.ipcRenderer.invoke(IPC.taskResume, id);
  },
  async taskRemove(id) {
    return electron.ipcRenderer.invoke(IPC.taskRemove, id);
  },
  async taskRetry(id) {
    return electron.ipcRenderer.invoke(IPC.taskRetry, id);
  },
  onProgress(cb) {
    const h = (_e, p) => cb(p);
    electron.ipcRenderer.on(IPC.taskProgress, h);
    return () => electron.ipcRenderer.removeListener(IPC.taskProgress, h);
  },
  onStats(cb) {
    const h = (_e, s) => cb(s);
    electron.ipcRenderer.on(IPC.statsUpdate, h);
    return () => electron.ipcRenderer.removeListener(IPC.statsUpdate, h);
  },
  async statsGet() {
    return electron.ipcRenderer.invoke(IPC.statsGet);
  },
  async channelStatus() {
    return electron.ipcRenderer.invoke(IPC.channelStatus);
  },
  async channelSwitch(id) {
    return electron.ipcRenderer.invoke(IPC.channelSwitch, id);
  },
  async configGet() {
    return electron.ipcRenderer.invoke(IPC.configGet);
  },
  async configSet(patch) {
    return electron.ipcRenderer.invoke(IPC.configSet, patch);
  },
  async chooseDir() {
    return electron.ipcRenderer.invoke(IPC.dialogChooseDir);
  },
  minimize() {
    void electron.ipcRenderer.invoke(IPC.winMin);
  },
  maxToggle() {
    void electron.ipcRenderer.invoke(IPC.winMaxToggle);
  },
  close() {
    void electron.ipcRenderer.invoke(IPC.winClose);
  },
  openExternal(url) {
    void electron.ipcRenderer.invoke(IPC.openExternal, url);
  }
};
electron.contextBridge.exposeInMainWorld("api", api);
