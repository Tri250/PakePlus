"use strict";
const electron = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const node_events = require("node:events");
const http = require("node:http");
const https = require("node:https");
const crypto = require("node:crypto");
const node_url = require("node:url");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const path__namespace = /* @__PURE__ */ _interopNamespaceDefault(path);
const fs__namespace = /* @__PURE__ */ _interopNamespaceDefault(fs);
const http__namespace = /* @__PURE__ */ _interopNamespaceDefault(http);
const https__namespace = /* @__PURE__ */ _interopNamespaceDefault(https);
const crypto__namespace = /* @__PURE__ */ _interopNamespaceDefault(crypto);
const DEFAULT_CONFIG = {
  downloadDir: "",
  // 主进程初始化时填默认（系统下载目录/yunxicc）
  connections: 8,
  chunkSizeMB: 8,
  maxParallelTasks: 3,
  speedLimitMB: 0,
  webCookie: "",
  webReferer: "https://pan.baidu.com/disk/home",
  webUserAgent: "netdisk;P2SP;2.2.91.136;android-device",
  officialAppKey: "",
  officialSecret: "",
  officialAccessToken: "",
  autoStart: true,
  theme: "light",
  agreedProtocol: false
};
class JsonStore {
  file;
  data;
  flushTimer;
  flushing = false;
  dirty = false;
  constructor(userDataDir, defaultDownloadDir2) {
    fs__namespace.mkdirSync(userDataDir, { recursive: true });
    this.file = path__namespace.join(userDataDir, "yunxicc-store.json");
    const loaded = this.load();
    this.data = {
      tasks: loaded?.tasks ?? [],
      chunkStates: loaded?.chunkStates ?? {},
      stats: loaded?.stats ?? { totalBytesDone: 0 },
      config: { ...DEFAULT_CONFIG, ...loaded?.config ?? {}, downloadDir: loaded?.config?.downloadDir || defaultDownloadDir2 },
      version: 1
    };
  }
  load() {
    for (const f of [this.file, this.file + ".bak"]) {
      try {
        const raw = fs__namespace.readFileSync(f, "utf-8");
        return JSON.parse(raw);
      } catch {
      }
    }
    return null;
  }
  // ---- tasks ----
  getTasks() {
    return this.data.tasks;
  }
  upsertTask(t) {
    const i = this.data.tasks.findIndex((x) => x.id === t.id);
    if (i >= 0) this.data.tasks[i] = t;
    else this.data.tasks.unshift(t);
    this.scheduleFlush();
  }
  removeTask(id) {
    this.data.tasks = this.data.tasks.filter((t) => t.id !== id);
    delete this.data.chunkStates[id];
    this.scheduleFlush();
  }
  // ---- chunk 断点 ----
  saveChunkState(s) {
    this.data.chunkStates[s.taskId] = s;
    this.scheduleFlush(800);
  }
  getChunkState(taskId) {
    return this.data.chunkStates[taskId];
  }
  deleteChunkState(taskId) {
    delete this.data.chunkStates[taskId];
    this.scheduleFlush(300);
  }
  // ---- stats ----
  addTotalBytes(n) {
    this.data.stats.totalBytesDone += n;
    this.scheduleFlush(1500);
  }
  getTotalBytesDone() {
    return this.data.stats.totalBytesDone;
  }
  // ---- config ----
  getConfig() {
    return this.data.config;
  }
  patchConfig(patch) {
    this.data.config = { ...this.data.config, ...patch };
    this.flushNow();
    return this.data.config;
  }
  /** 防抖合并写 */
  scheduleFlush(delay = 300) {
    this.dirty = true;
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => {
      this.flushTimer = void 0;
      this.flushNow();
    }, delay);
  }
  flushNow() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = void 0;
    }
    if (!this.dirty && fs__namespace.existsSync(this.file)) return;
    this.dirty = false;
    const tmp = this.file + ".tmp";
    fs__namespace.writeFileSync(tmp, JSON.stringify(this.data, null, 2), "utf-8");
    try {
      if (fs__namespace.existsSync(this.file)) fs__namespace.copyFileSync(this.file, this.file + ".bak");
    } catch {
    }
    fs__namespace.renameSync(tmp, this.file);
  }
  /** 供保存时序列化 chunk（内部状态） */
  static toPersisted(task, chunks) {
    return { taskId: task.id, chunks, received: task.received, total: task.size, url: task.url, filePath: task.localPath, headers: task.headers };
  }
}
class DownloadJob extends node_events.EventEmitter {
  status = "idle";
  progress = { received: 0, total: 0, percent: 0, speed: 0, connections: 0 };
  chunks = [];
  url;
  filePath;
  headers;
  connections;
  chunkSize;
  maxRetries;
  speedLimitBps;
  persistState;
  tmpDir;
  activeControllers = /* @__PURE__ */ new Set();
  pauseFlag = false;
  destroyed = false;
  speedWindow = [];
  speedTimer;
  constructor(opts) {
    super();
    this.url = opts.url;
    this.filePath = opts.filePath;
    this.headers = opts.headers ?? {};
    this.connections = Math.max(1, opts.connections ?? 8);
    this.chunkSize = opts.chunkSize ?? 8 * 1024 * 1024;
    this.maxRetries = opts.maxRetries ?? 5;
    this.speedLimitBps = opts.speedLimitBps ?? 0;
    this.persistState = opts.persistState;
    this.tmpDir = opts.filePath + ".yunxicc-parts";
    if (opts.restoredChunks?.length) this.chunks.push(...opts.restoredChunks);
  }
  /** 预检：获取文件大小与 Range 支持 */
  async probe() {
    const u = new URL(this.url);
    const mod = this.url.startsWith("https:") ? https__namespace : http__namespace;
    const doReq = (method, headers) => new Promise((resolve, reject) => {
      const req = mod.request(
        { hostname: u.hostname, port: u.port || (this.url.startsWith("https:") ? 443 : 80), path: u.pathname + u.search, method, headers: { ...headers, Host: u.host } },
        (res2) => resolve({ statusCode: res2.statusCode ?? 0, headers: res2.headers, destroy: () => res2.destroy() })
      );
      req.on("error", reject);
      req.end();
    });
    const head = await doReq("HEAD", { Range: "bytes=0-0", ...this.headers });
    const len = Number(head.headers["content-length"] ?? 0);
    const ar = String(head.headers["accept-ranges"] ?? "").includes("bytes");
    head.destroy();
    if (head.statusCode === 206) return { size: Number(String(head.headers["content-range"] ?? "").split("/")[1] || len), acceptRanges: true };
    if (head.statusCode === 200 && len > 0) return { size: len, acceptRanges: ar };
    const res = await doReq("GET", { Range: "bytes=0-0", ...this.headers });
    const cr = String(res.headers["content-range"] ?? "");
    const size = cr.includes("/") ? Number(cr.split("/")[1]) : Number(res.headers["content-length"] ?? 0);
    res.destroy();
    if (!size || size <= 0) throw new Error(`无法获取文件大小 (HTTP ${res.statusCode})`);
    return { size, acceptRanges: cr.includes("/") };
  }
  /** 初始化分块计划（若未从断点恢复） */
  planChunks(size, acceptRanges) {
    if (this.chunks.length) return;
    if (!acceptRanges || size <= this.chunkSize) {
      this.chunks.push({ index: 0, start: 0, end: size - 1, done: false, tries: 0 });
    } else {
      let idx = 0;
      for (let s = 0; s < size; s += this.chunkSize) {
        this.chunks.push({ index: idx++, start: s, end: Math.min(s + this.chunkSize, size) - 1, done: false, tries: 0 });
      }
    }
    this.progress.total = size;
  }
  async start() {
    if (this.status === "running" || this.status === "completed") return;
    this.pauseFlag = false;
    this.destroyed = false;
    this.status = "running";
    fs__namespace.mkdirSync(this.tmpDir, { recursive: true });
    fs__namespace.mkdirSync(path__namespace.dirname(this.filePath), { recursive: true });
    if (!this.progress.total) {
      const { size, acceptRanges } = await this.probe();
      if (!this.chunks.length) this.planChunks(size, acceptRanges);
      else this.progress.total = size;
      this.recomputeReceived();
    }
    this.startSpeedTimer();
    await this.runWorkers();
    if (!this.destroyed && !this.pauseFlag && this.chunks.every((c) => c.done)) {
      await this.merge();
      this.progress.received = this.progress.total;
      this.progress.percent = 100;
      this.progress.speed = 0;
      this.progress.connections = 0;
      this.stopSpeedTimer();
      this.status = "completed";
      this.emit("progress", this.progress);
      this.emit("completed");
      this.cleanupParts();
    }
  }
  pause() {
    if (this.status !== "running") return;
    this.pauseFlag = true;
    for (const c of this.activeControllers) c.abort();
    this.activeControllers.clear();
    this.status = "paused";
    this.progress.connections = 0;
    this.stopSpeedTimer();
    this.persistState?.(this.chunks);
    this.emit("progress", this.progress);
    this.emit("paused");
  }
  /** 从持久化状态恢复（断点续传） */
  restoreState(chunks, receivedBytes, totalBytes) {
    if (this.chunks.length) return;
    this.chunks.push(...chunks);
    this.progress.total = totalBytes;
    this.progress.received = receivedBytes;
    this.progress.percent = totalBytes ? Math.round(receivedBytes / totalBytes * 1e4) / 100 : 0;
  }
  /** 断点恢复后重算已收字节：完成块 + 半成品 part 文件大小 */
  recomputeReceived() {
    let received = 0;
    for (const c of this.chunks) {
      const expected = c.end - c.start + 1;
      if (c.done) {
        received += expected;
        continue;
      }
      const p = path__namespace.join(this.tmpDir, `${c.index}.part`);
      try {
        received += fs__namespace.statSync(p).size;
      } catch {
      }
    }
    this.progress.received = received;
    this.progress.percent = this.progress.total ? Math.round(received / this.progress.total * 1e4) / 100 : 0;
  }
  async runWorkers() {
    const workers = [];
    for (let i = 0; i < this.connections; i++) workers.push(this.workerLoop(i));
    await Promise.all(workers);
  }
  async workerLoop(_wid) {
    while (!this.pauseFlag && !this.destroyed) {
      const chunk = this.chunks.find((c) => !c.done);
      if (!chunk) return;
      if (this.inflight.has(chunk.index)) return;
      this.inflight.add(chunk.index);
      try {
        await this.downloadChunk(chunk);
        chunk.done = true;
        this.persistState?.(this.chunks);
        this.emit("chunkDone", chunk.index);
      } catch (err) {
        if (this.pauseFlag || this.destroyed || err?.name === "AbortError") {
          this.inflight.delete(chunk.index);
          return;
        }
        if (err?.message === "NO_RANGE" && !this.rangeDowngraded) {
          this.rangeDowngraded = true;
          this.rebuildAsSingleChunk();
          this.inflight.delete(chunk.index);
          continue;
        }
        chunk.tries++;
        if (chunk.tries > this.maxRetries) {
          this.status = "failed";
          this.emit("error", new Error(`分块 ${chunk.index} 重试 ${this.maxRetries} 次仍失败: ${err?.message ?? err}`));
          this.pause();
          return;
        }
        await new Promise((r) => setTimeout(r, Math.min(500 * 2 ** chunk.tries, 8e3)));
      } finally {
        this.inflight.delete(chunk.index);
      }
    }
  }
  inflight = /* @__PURE__ */ new Set();
  rangeDowngraded = false;
  /** 降级重建：多块 → 单块整文件下载 */
  rebuildAsSingleChunk() {
    try {
      fs__namespace.rmSync(this.tmpDir, { recursive: true, force: true });
    } catch {
    }
    fs__namespace.mkdirSync(this.tmpDir, { recursive: true });
    this.chunks.length = 0;
    this.chunks.push({ index: 0, start: 0, end: this.progress.total - 1, done: false, tries: 0 });
    this.progress.received = 0;
    this.rangeDowngraded = true;
  }
  async downloadChunk(chunk) {
    fs__namespace.mkdirSync(this.tmpDir, { recursive: true });
    const ac = new AbortController();
    this.activeControllers.add(ac);
    const partPath = path__namespace.join(this.tmpDir, `${chunk.index}.part`);
    const expected = chunk.end - chunk.start + 1;
    let resumeAt = 0;
    if (fs__namespace.existsSync(partPath)) {
      const st = fs__namespace.statSync(partPath);
      if (st.size === expected) {
        chunk.done = true;
        this.activeControllers.delete(ac);
        return;
      }
      if (st.size > 0 && st.size < expected) resumeAt = st.size;
      else fs__namespace.rmSync(partPath, { force: true });
    }
    const headers = {
      ...this.headers,
      Range: `bytes=${chunk.start + resumeAt}-${chunk.end}`,
      "Accept-Encoding": "identity"
    };
    await new Promise((resolve, reject) => {
      const mod = this.url.startsWith("https:") ? https__namespace : http__namespace;
      const u = new URL(this.url);
      const r = mod.request({
        hostname: u.hostname,
        port: u.port || (this.url.startsWith("https:") ? 443 : 80),
        path: u.pathname + u.search,
        method: "GET",
        headers: { ...headers, Host: u.host },
        signal: ac.signal
      }, (res) => {
        if (res.statusCode === 200 && (chunk.start > 0 || this.chunks.length > 1)) {
          res.destroy();
          fs__namespace.rmSync(partPath, { force: true });
          this.activeControllers.delete(ac);
          reject(new Error("NO_RANGE"));
          return;
        }
        if (res.statusCode === 200 && resumeAt > 0) {
          res.destroy();
          fs__namespace.rmSync(partPath, { force: true });
          this.activeControllers.delete(ac);
          this.downloadChunk(chunk).then(() => resolve()).catch(reject);
          return;
        }
        if (res.statusCode !== 206 && res.statusCode !== 200) {
          res.destroy();
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        const stream = fs__namespace.createWriteStream(partPath, { flags: resumeAt > 0 ? "a" : "w" });
        res.on("data", (buf) => {
          this.speedWindow.push({ t: Date.now(), b: buf.length });
          if (this.speedLimitBps > 0) {
            if (Date.now() - this.limitTickStart >= 1e3) {
              this.limitTickStart = Date.now();
              this.limitTickBytes = 0;
            }
            this.limitTickBytes += buf.length;
            if (this.limitTickBytes > this.speedLimitBps) {
              res.pause();
              setTimeout(() => {
                this.limitTickBytes = 0;
                res.resume();
              }, 100);
            }
          }
          this.progress.received += buf.length;
        });
        res.on("error", reject);
        res.pipe(stream);
        stream.on("finish", () => {
          const st = fs__namespace.statSync(partPath);
          if (st.size !== expected) {
            reject(new Error(`块大小不符 got=${st.size} want=${expected}`));
          } else resolve();
        });
        stream.on("error", reject);
      });
      r.on("error", reject);
      r.end();
    });
    this.activeControllers.delete(ac);
    this.updateProgressSnapshot();
  }
  setSpeedLimit(bps) {
    this.speedLimitBps = bps;
  }
  limitTickStart = 0;
  limitTickBytes = 0;
  updateProgressSnapshot() {
    const now = Date.now();
    this.speedWindow = this.speedWindow.filter((x) => now - x.t < 1e3);
    const bytes1s = this.speedWindow.reduce((s, x) => s + x.b, 0);
    this.progress.speed = bytes1s;
    this.progress.percent = this.progress.total ? Math.round(this.progress.received / this.progress.total * 1e4) / 100 : 0;
    this.progress.connections = this.activeControllers.size;
    this.emit("progress", this.progress);
  }
  startSpeedTimer() {
    this.stopSpeedTimer();
    this.speedTimer = setInterval(() => this.updateProgressSnapshot(), 500);
  }
  stopSpeedTimer() {
    if (this.speedTimer) {
      clearInterval(this.speedTimer);
      this.speedTimer = void 0;
    }
  }
  async merge() {
    const out = fs__namespace.createWriteStream(this.filePath, { flags: "w" });
    for (const c of this.chunks) {
      const part = path__namespace.join(this.tmpDir, `${c.index}.part`);
      await new Promise((res, rej) => {
        const rs = fs__namespace.createReadStream(part);
        rs.pipe(out, { end: false });
        rs.on("end", res);
        rs.on("error", rej);
      });
    }
    await new Promise((res) => out.end(res));
  }
  cleanupParts() {
    try {
      fs__namespace.rmSync(this.tmpDir, { recursive: true, force: true });
    } catch {
    }
  }
  /** 校验文件完整性（长度 + 可选 MD5，流式计算避免大文件占内存） */
  verify(md5) {
    return new Promise((resolve) => {
      const st = fs__namespace.statSync(this.filePath);
      if (st.size !== this.progress.total) {
        resolve({ ok: false, reason: `大小不符 ${st.size} != ${this.progress.total}` });
        return;
      }
      if (!md5) {
        resolve({ ok: true });
        return;
      }
      const hash = crypto__namespace.createHash("md5");
      const rs = fs__namespace.createReadStream(this.filePath);
      rs.on("data", (d) => hash.update(d));
      rs.on("end", () => resolve({ ok: hash.digest("hex") === md5, reason: void 0 }));
      rs.on("error", (e) => resolve({ ok: false, reason: e.message }));
    });
  }
}
const PROGRESS_THROTTLE_MS = 400;
function sanitizeSegment(s) {
  return s.replace(/[\\/:*?"<>|]/g, "_").trim() || "_";
}
class TaskManager extends node_events.EventEmitter {
  constructor(store2, cfg) {
    super();
    this.store = store2;
    this.cfg = cfg;
    this.restoreOnStartup();
  }
  jobs = /* @__PURE__ */ new Map();
  lastPushAt = /* @__PURE__ */ new Map();
  starting = /* @__PURE__ */ new Set();
  /** 启动时：把上次中断的任务标记为 paused（保留断点，恢复时续传） */
  restoreOnStartup() {
    for (const t of this.store.getTasks()) {
      if (t.status === "downloading" || t.status === "pending" || t.status === "parsing" || t.status === "ready") {
        t.status = "paused";
        t.speed = 0;
        t.connections = 0;
        this.store.upsertTask(t);
      }
    }
  }
  /** 从解析结果创建下载任务（目录镜像 remotePath → 本地路径） */
  createTasks(files, headers) {
    const base = this.cfg().downloadDir;
    let created = 0;
    for (const f of files) {
      if (f.isDir) continue;
      const localPath = path__namespace.join(base, ...f.path.split("/").filter(Boolean).map(sanitizeSegment));
      const t = {
        id: `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        name: f.name,
        remotePath: f.path,
        url: f.dlink ?? "",
        headers,
        localPath,
        size: f.size,
        status: "pending",
        received: 0,
        speed: 0,
        connections: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      const dup = this.store.getTasks().find((x) => x.remotePath === f.path && x.status !== "completed" && x.status !== "canceled");
      if (dup) continue;
      this.store.upsertTask(t);
      created++;
    }
    this.pushStats();
    if (created) this.pump();
    return { created };
  }
  getTasks() {
    return this.store.getTasks();
  }
  pause(id) {
    const t = this.find(id);
    if (!t) return;
    const job = this.jobs.get(id);
    if (job) {
      job.pause();
      return;
    }
    if (t.status === "pending" || t.status === "failed") {
      t.status = "paused";
      t.updatedAt = Date.now();
      this.store.upsertTask(t);
      this.pushTask(t);
      this.pushStats();
    }
  }
  async resume(id) {
    const t = this.find(id);
    if (!t) return;
    if (t.status !== "paused") return;
    t.status = "pending";
    t.error = void 0;
    t.updatedAt = Date.now();
    this.store.upsertTask(t);
    this.pushTask(t);
    this.pump();
  }
  remove(id) {
    const t = this.find(id);
    if (!t) return;
    const job = this.jobs.get(id);
    if (job) {
      if (t.received > 0) this.store.addTotalBytes(t.received);
      job.pause();
      job.cleanupParts();
      this.jobs.delete(id);
    } else if (t.status === "completed") ;
    else if (t.received > 0) {
      this.store.addTotalBytes(t.received);
    }
    this.store.removeTask(id);
    this.pushStats();
  }
  retry(id) {
    const t = this.find(id);
    if (!t || t.status !== "failed" && t.status !== "canceled") return;
    TaskManager.cleanParts(t.localPath);
    t.status = "pending";
    t.error = void 0;
    t.received = 0;
    t.updatedAt = Date.now();
    this.store.deleteChunkState(id);
    this.store.upsertTask(t);
    this.pushTask(t);
    this.pump();
  }
  pauseAll() {
    for (const t of this.getTasks()) if (t.status === "downloading" || t.status === "pending") this.pause(t.id);
  }
  resumeAll() {
    for (const t of this.getTasks()) if (t.status === "paused") void this.resume(t.id);
  }
  stats() {
    const ts = this.getTasks();
    return {
      totalTasks: ts.length,
      completed: ts.filter((t) => t.status === "completed").length,
      downloading: ts.filter((t) => t.status === "downloading").length,
      totalBytesDone: this.store.getTotalBytesDone(),
      totalSpeed: ts.reduce((s, t) => s + (t.status === "downloading" ? t.speed : 0), 0)
    };
  }
  /** 调度器：补满并发窗口 */
  pump() {
    const max = Math.max(1, this.cfg().maxParallelTasks);
    let active = [...this.jobs.keys()].length + this.starting.size;
    if (active >= max) return;
    const queue = this.getTasks().filter((t) => t.status === "pending");
    for (const t of queue) {
      if (active >= max) break;
      void this.startTask(t);
      active++;
    }
  }
  async startTask(t) {
    if (this.jobs.has(t.id) || this.starting.has(t.id) || t.status !== "pending") return;
    if (!t.url) {
      t.status = "failed";
      t.error = "缺少下载直链（解析结果无效）";
      this.store.upsertTask(t);
      this.pushTask(t);
      return;
    }
    this.starting.add(t.id);
    t.status = "downloading";
    t.updatedAt = Date.now();
    this.store.upsertTask(t);
    const cfg = this.cfg();
    const cs = this.store.getChunkState(t.id);
    const job = new DownloadJob({
      url: t.url,
      filePath: t.localPath,
      headers: t.headers,
      connections: cfg.connections,
      chunkSize: cfg.chunkSizeMB * 1024 * 1024,
      speedLimitBps: cfg.speedLimitMB > 0 ? cfg.speedLimitMB * 1024 * 1024 : 0,
      persistState: (chunks) => {
        this.store.saveChunkState({ taskId: t.id, chunks, received: job.progress.received, total: t.size, url: t.url, filePath: t.localPath, headers: t.headers });
      },
      restoredChunks: cs?.chunks
    });
    if (cs?.chunks?.length) job.restoreState(cs.chunks, cs.received, cs.total);
    job.on("progress", () => this.onProgress(t, job));
    job.on("chunkDone", () => this.onProgress(t, job, true));
    job.on("paused", () => {
      if (t.status !== "downloading") return;
      t.status = "paused";
      t.speed = 0;
      t.connections = 0;
      t.updatedAt = Date.now();
      this.jobs.delete(t.id);
      this.store.upsertTask(t);
      this.pushTask(t);
      this.pushStats();
    });
    job.on("completed", () => this.onCompleted(t, job));
    job.on("error", (e) => this.onError(t, e));
    this.jobs.set(t.id, job);
    this.starting.delete(t.id);
    this.pushTask(t);
    try {
      await job.start();
    } catch (e) {
      this.onError(t, e);
    }
  }
  onProgress(t, job, force = false) {
    t.received = job.progress.received;
    t.speed = job.progress.speed;
    t.connections = job.progress.connections;
    t.updatedAt = Date.now();
    const now = Date.now();
    const last = this.lastPushAt.get(t.id) ?? 0;
    if (force || now - last >= PROGRESS_THROTTLE_MS) {
      this.lastPushAt.set(t.id, now);
      this.pushTask(t);
    }
  }
  onCompleted(t, job) {
    t.status = "completed";
    t.received = t.size;
    t.speed = 0;
    t.connections = 0;
    t.completedAt = Date.now();
    t.updatedAt = Date.now();
    this.jobs.delete(t.id);
    this.store.deleteChunkState(t.id);
    this.store.upsertTask(t);
    this.store.addTotalBytes(t.size);
    job.cleanupParts();
    this.pushTask(t);
    this.pushStats();
    this.pump();
  }
  onError(t, e) {
    const job = this.jobs.get(t.id);
    t.status = "failed";
    t.error = e.message;
    t.speed = 0;
    t.connections = 0;
    t.updatedAt = Date.now();
    this.jobs.delete(t.id);
    job?.cleanupParts();
    this.store.upsertTask(t);
    this.pushTask(t);
    this.pushStats();
    this.pump();
  }
  find(id) {
    return this.store.getTasks().find((t) => t.id === id);
  }
  /** 推送单任务进度（节流由 onProgress 控制） */
  pushTask(t) {
    const p = { taskId: t.id, received: t.received, total: t.size, percent: t.size ? Math.round(t.received / t.size * 1e4) / 100 : 0, speed: t.speed, connections: t.connections };
    this.emit("progress", p);
  }
  /** 推送统计快照 */
  pushStats() {
    this.emit("stats", this.stats());
  }
  /** 退出前调用：落盘并暂停活动任务 */
  async shutdown() {
    for (const [, job] of this.jobs) job.pause();
    await new Promise((r) => setTimeout(r, 300));
    this.store.flushNow();
  }
  /** 供重试前清理半成品文件 */
  static cleanParts(localPath) {
    try {
      fs__namespace.rmSync(localPath + ".yunxicc-parts", { recursive: true, force: true });
    } catch {
    }
  }
}
const MOCK_PORT = Number(process.env.YUNXICC_MOCK_PORT || 18888);
const TREE = [
  { path: "/", name: "根目录", size: 0, isDir: true, children: ["文档资料", "图片集合", "视频资源", "软件工具", "音乐精选", "readme.txt"] },
  { path: "/readme.txt", name: "readme.txt", size: 4096, isDir: false },
  { path: "/文档资料", name: "文档资料", size: 0, isDir: true, children: ["产品需求文档.pdf", "接口设计说明.docx", "年度报表2026.xlsx"] },
  { path: "/文档资料/产品需求文档.pdf", name: "产品需求文档.pdf", size: 12 * 1024 * 1024, isDir: false },
  { path: "/文档资料/接口设计说明.docx", name: "接口设计说明.docx", size: 6 * 1024 * 1024, isDir: false },
  { path: "/文档资料/年度报表2026.xlsx", name: "年度报表2026.xlsx", size: 3 * 1024 * 1024, isDir: false },
  { path: "/图片集合", name: "图片集合", size: 0, isDir: true, children: ["壁纸_山海.jpg", "壁纸_星空.jpg", "壁纸_城市.jpg"] },
  { path: "/图片集合/壁纸_山海.jpg", name: "壁纸_山海.jpg", size: 2 * 1024 * 1024, isDir: false },
  { path: "/图片集合/壁纸_星空.jpg", name: "壁纸_星空.jpg", size: 2 * 1024 * 1024, isDir: false },
  { path: "/图片集合/壁纸_城市.jpg", name: "壁纸_城市.jpg", size: 2 * 1024 * 1024, isDir: false },
  { path: "/视频资源", name: "视频资源", size: 0, isDir: true, children: ["产品发布会.mp4", "教程合集/"] },
  { path: "/视频资源/教程合集", name: "教程合集", size: 0, isDir: true, children: ["第01课_环境搭建.mp4", "第02课_基础操作.mp4"] },
  { path: "/视频资源/产品发布会.mp4", name: "产品发布会.mp4", size: 64 * 1024 * 1024, isDir: false },
  { path: "/视频资源/教程合集/第01课_环境搭建.mp4", name: "第01课_环境搭建.mp4", size: 24 * 1024 * 1024, isDir: false },
  { path: "/视频资源/教程合集/第02课_基础操作.mp4", name: "第02课_基础操作.mp4", size: 26 * 1024 * 1024, isDir: false },
  { path: "/软件工具", name: "软件工具", size: 0, isDir: true, children: ["云析Down_Setup.exe", "驱动包.zip"] },
  { path: "/软件工具/云析Down_Setup.exe", name: "云析Down_Setup.exe", size: 33 * 1024 * 1024, isDir: false },
  { path: "/软件工具/驱动包.zip", name: "驱动包.zip", size: 18 * 1024 * 1024, isDir: false },
  { path: "/音乐精选", name: "音乐精选", size: 0, isDir: true, children: ["夜曲.flac", "晴天.mp3"] },
  { path: "/音乐精选/夜曲.flac", name: "夜曲.flac", size: 9 * 1024 * 1024, isDir: false },
  { path: "/音乐精选/晴天.mp3", name: "晴天.mp3", size: 5 * 1024 * 1024, isDir: false }
];
class MockChannel {
  id = "mock";
  name = "本地演示";
  server;
  dataDir;
  ready = false;
  acceptPwd = ["yuni", "", "1234"];
  async init(dataDir) {
    this.dataDir = path__namespace.join(dataDir, "mock-netdisk");
    fs__namespace.mkdirSync(this.dataDir, { recursive: true });
    this.generateFiles();
    this.server = http__namespace.createServer((req, res) => this.handler(req, res));
    await new Promise((resolve) => this.server.listen(MOCK_PORT, "127.0.0.1", resolve));
    this.ready = true;
  }
  dispose() {
    this.server?.close();
  }
  /** 生成真实文件（内容为 4KB 随机块重复填充，带 MD5 元数据） */
  generateFiles() {
    const metaFile = path__namespace.join(this.dataDir, "meta.json");
    let md5s = {};
    try {
      md5s = JSON.parse(fs__namespace.readFileSync(metaFile, "utf-8"));
    } catch {
    }
    const block = crypto__namespace.randomBytes(4096);
    for (const m of TREE) {
      if (m.isDir) continue;
      const p = path__namespace.join(this.dataDir, m.path);
      if (fs__namespace.existsSync(p) && fs__namespace.statSync(p).size === m.size) continue;
      fs__namespace.mkdirSync(path__namespace.dirname(p), { recursive: true });
      const fd = fs__namespace.openSync(p, "w");
      let written = 0;
      while (written < m.size) {
        const n = Math.min(block.length, m.size - written);
        fs__namespace.writeSync(fd, block, 0, n);
        written += n;
      }
      fs__namespace.closeSync(fd);
      md5s[m.path] = crypto__namespace.createHash("md5").update(fs__namespace.readFileSync(p)).digest("hex");
    }
    fs__namespace.writeFileSync(metaFile, JSON.stringify(md5s), "utf-8");
  }
  find(p) {
    const norm = p.endsWith("/") && p !== "/" ? p.slice(0, -1) : p;
    return TREE.find((m) => m.path === (norm || "/"));
  }
  handler(req, res) {
    const u = new URL(req.url ?? "/", "http://127.0.0.1");
    res.setHeader("Access-Control-Allow-Origin", "*");
    try {
      if (u.pathname === "/api/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, channel: "mock" }));
        return;
      }
      if (u.pathname === "/api/list") {
        const dir = u.searchParams.get("path") || "/";
        const node = this.find(dir);
        if (!node || !node.isDir) {
          res.writeHead(404);
          res.end(JSON.stringify({ errno: -9, errormsg: "目录不存在" }));
          return;
        }
        const files = (node.children ?? []).map((c) => {
          const child = this.find(path__namespace.posix.join(dir, c));
          if (!child) return null;
          return { fs_id: 1e3 + Math.abs(this.hash(child.path)), path: child.path, server_filename: child.name, size: child.size, isdir: child.isDir ? 1 : 0, md5: child.md5 };
        }).filter(Boolean);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ errno: 0, list: files }));
        return;
      }
      if (u.pathname === "/download") {
        const p = u.searchParams.get("path") || "/";
        const m = this.find(p);
        if (!m || m.isDir) {
          res.writeHead(404);
          res.end("not found");
          return;
        }
        const fp = path__namespace.join(this.dataDir, m.path);
        const size = fs__namespace.statSync(fp).size;
        const headers = {
          "Content-Type": "application/octet-stream",
          "Accept-Ranges": "bytes",
          "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(m.name)}`,
          "X-File-MD5": m.md5 ?? "",
          "Cache-Control": "no-store"
        };
        const range = req.headers.range;
        if (range) {
          const mt = /bytes=(\d*)-(\d*)/.exec(range);
          if (mt) {
            const start = mt[1] ? Number(mt[1]) : 0;
            const end = mt[2] ? Math.min(Number(mt[2]), size - 1) : size - 1;
            if (start >= size || start > end) {
              res.writeHead(416, { "Content-Range": `bytes */${size}` });
              res.end();
              return;
            }
            headers["Content-Range"] = `bytes ${start}-${end}/${size}`;
            headers["Content-Length"] = end - start + 1;
            res.writeHead(206, headers);
            const rs2 = fs__namespace.createReadStream(fp, { start, end });
            rs2.on("error", () => res.destroy());
            req.on("close", () => rs2.destroy());
            rs2.pipe(res);
            return;
          }
        }
        headers["Content-Length"] = size;
        res.writeHead(200, headers);
        const rs = fs__namespace.createReadStream(fp);
        rs.on("error", () => res.destroy());
        req.on("close", () => rs.destroy());
        rs.pipe(res);
        return;
      }
      res.writeHead(404);
      res.end("not found");
    } catch (e) {
      try {
        res.writeHead(500);
        res.end(String(e?.message ?? e));
      } catch {
      }
    }
  }
  hash(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = h * 31 + s.charCodeAt(i) | 0;
    return h;
  }
  /** 分享链接格式校验：支持 pan.baidu.com/s/1xxx 与 mock://share/xxx */
  async parse(link, pwd) {
    const linkRe = /^(?:https?:\/\/)?(?:pan\.baidu\.com\/s\/|mock:\/\/share\/)([A-Za-z0-9_-]{4,})/;
    if (!linkRe.test(link.trim())) {
      return { ok: false, message: "链接格式不正确，应为 https://pan.baidu.com/s/1xxxx 形式", channel: this.name, files: [] };
    }
    const hasPwd = !!pwd.trim();
    if (!hasPwd || !this.acceptPwd.includes(pwd.trim())) {
      return { ok: false, message: hasPwd ? "提取码错误（演示通道提取码：yuni）" : "请输入提取码", channel: this.name, files: [] };
    }
    await this.health();
    const root = this.buildTree("/");
    return { ok: true, message: `解析成功，共 ${this.countFiles(root)} 个文件`, channel: this.name, files: root };
  }
  buildTree(dir) {
    const node = this.find(dir);
    if (!node?.isDir) return [];
    return (node.children ?? []).map((c) => {
      const child = this.find(path__namespace.posix.join(dir, c));
      if (!child) return null;
      const f = { id: String(1e3 + Math.abs(this.hash(child.path))), name: child.name, path: child.path, size: child.size, isDir: child.isDir };
      if (child.isDir) f.children = this.buildTree(child.path);
      return f;
    }).filter(Boolean);
  }
  countFiles(files) {
    return files.reduce((n, f) => n + (f.isDir ? this.countFiles(f.children ?? []) : 1), 0);
  }
  async resolveFiles(paths) {
    const files = [];
    for (const p of paths) {
      const m = this.find(p);
      if (!m || m.isDir) continue;
      files.push({ id: String(1e3 + Math.abs(this.hash(m.path))), name: m.name, path: m.path, size: m.size, isDir: false, dlink: `http://127.0.0.1:${MOCK_PORT}/download?path=${encodeURIComponent(m.path)}` });
    }
    if (!files.length) return { ok: false, message: "所选路径均不是文件", files: [] };
    return { ok: true, files };
  }
  downloadHeaders() {
    return { "User-Agent": "Yunxicc/1.0 mock-channel" };
  }
  async health() {
    if (this.ready && this.server) return true;
    await new Promise((r) => setTimeout(r, 200));
    return this.ready;
  }
  async probe() {
    try {
      const ok = await this.health();
      return { ok, message: ok ? `本地演示服务运行中 (127.0.0.1:${MOCK_PORT})` : "本地服务未就绪", configured: true };
    } catch (e) {
      return { ok: false, message: String(e?.message ?? e), configured: true };
    }
  }
}
const UA = "panopenid;Yunxicc/1.0.0";
function httpsGetJson$1(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https__namespace.request(
      { hostname: u.hostname, path: u.pathname + u.search, method: "GET", headers: { "User-Agent": UA, ...headers } },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf-8");
          let json = null;
          try {
            json = JSON.parse(text);
          } catch {
          }
          resolve({ status: res.statusCode ?? 0, json, text });
        });
      }
    );
    req.on("error", reject);
    req.setTimeout(15e3, () => {
      req.destroy(new Error("请求超时"));
    });
    req.end();
  });
}
class OfficialChannel {
  id = "official";
  name = "官方开放平台";
  cfg;
  constructor(cfg) {
    this.cfg = cfg;
  }
  get accessToken() {
    return this.cfg().officialAccessToken;
  }
  get configured() {
    return !!this.accessToken || !!this.cfg().officialAppKey && !!this.cfg().officialSecret;
  }
  /** OAuth 授权页（真实流程第一步，渲染层可打开外部浏览器） */
  authorizeUrl(redirectUri) {
    const appKey = this.cfg().officialAppKey;
    const sp = new node_url.URLSearchParams({ client_id: appKey, response_type: "code", redirect_uri: redirectUri, scope: "basic,netdisk" });
    return `https://openapi.baidu.com/oauth/2.0/authorize?${sp}`;
  }
  /** 用授权码换 access_token（真实端点） */
  async exchangeToken(code, redirectUri) {
    const sp = new node_url.URLSearchParams({
      client_id: this.cfg().officialAppKey,
      client_secret: this.cfg().officialSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
      code
    });
    const { json } = await httpsGetJson$1(`https://openapi.baidu.com/oauth/2.0/token?${sp}`);
    if (json?.access_token) {
      this.cfg().officialAccessToken = json.access_token;
      return { ok: true, message: "授权成功" };
    }
    return { ok: false, message: json?.error_description ?? json?.error ?? "换取令牌失败" };
  }
  async probe() {
    if (!this.configured) return { ok: false, message: "未配置 AppKey / access_token", configured: false };
    if (!this.accessToken) return { ok: false, message: "已配置 AppKey，尚未完成 OAuth 授权获取 access_token", configured: true };
    const { json } = await httpsGetJson$1(`https://pan.baidu.com/rest/2.0/xpan/file?method=list&access_token=${encodeURIComponent(this.accessToken)}&dir=${encodeURIComponent("/")}&limit=1&web=1`);
    if (json?.errno === 0) return { ok: true, message: "开放平台令牌有效", configured: true };
    const map = { "111": "access_token 已过期，请重新授权", "-6": "令牌身份校验失败", "2": "参数错误" };
    return { ok: false, message: `官方接口返回 errno=${json?.errno}（${map[json?.errno] ?? json?.errmsg ?? "未知错误"}）`, configured: true };
  }
  /** 列目录（用户自己网盘） */
  async listDir(dir) {
    const sp = new node_url.URLSearchParams({ method: "list", access_token: this.accessToken, dir, limit: "1000", web: "1", order: "name" });
    const { json } = await httpsGetJson$1(`https://pan.baidu.com/rest/2.0/xpan/file?${sp}`);
    const files = (json?.list ?? []).map((x) => ({
      id: String(x.fs_id),
      name: x.server_filename,
      path: `${dir === "/" ? "" : dir}/${x.server_filename}`,
      size: Number(x.size ?? 0),
      isDir: x.isdir === 1 || x.isdir === "1"
    }));
    return { errno: json?.errno ?? -1, files, raw: json };
  }
  async parse(link, pwd) {
    if (!this.configured) return { ok: false, message: "未配置官方开放平台凭据", channel: this.name, files: [] };
    if (!link.trim()) return { ok: false, message: "请输入分享链接", channel: this.name, files: [] };
    const m = /\/s\/([A-Za-z0-9_-]+)/.exec(link);
    if (!m) return { ok: false, message: "链接格式不正确", channel: this.name, files: [] };
    const { json } = await httpsGetJson$1(`https://pan.baidu.com/api/shorturlinfo?app_id=250528&shorturl=${m[1]}&root=1`, { Referer: "https://pan.baidu.com/" });
    if (json?.errno !== 0 || !json?.data) {
      return { ok: false, message: "官方通道无法解析第三方分享（OpenAPI 不开放该能力）。请配置网页 Cookie 使用网页通道，或使用本地演示通道。", channel: this.name, files: [] };
    }
    const d = json.data;
    const sp = new node_url.URLSearchParams({ shareid: String(d.shareid), uk: String(d.uk), root: "1", web: "1", app_id: "250528" });
    const { json: lst } = await httpsGetJson$1(`https://pan.baidu.com/share/list?${sp}`);
    if (lst?.errno !== 0) return { ok: false, message: `分享目录获取失败 errno=${lst?.errno}`, channel: this.name, files: [] };
    const files = (lst.list ?? []).map((x) => ({ id: String(x.fs_id), name: x.server_filename, path: `/${x.server_filename}`, size: Number(x.size ?? 0), isDir: x.isdir === 1 }));
    return { ok: true, message: "解析成功（公开分享）", channel: this.name, files };
  }
  /** 路径 → fsid → dlink（真实两步链路：list 找 fsid，filemetas 拿 dlink） */
  async resolveFiles(paths) {
    if (!this.accessToken) return { ok: false, message: "未完成官方授权", files: [] };
    const fsids = [];
    const byParent = /* @__PURE__ */ new Map();
    for (const p of paths) {
      const idx = p.lastIndexOf("/");
      const parent = idx <= 0 ? "/" : p.slice(0, idx);
      const arr = byParent.get(parent) ?? [];
      arr.push(p);
      byParent.set(parent, arr);
    }
    for (const [parent, ps] of byParent) {
      const { errno, files: files2 } = await this.listDir(parent);
      if (errno !== 0) return { ok: false, message: `目录 ${parent} 获取失败 errno=${errno}`, files: [] };
      for (const p of ps) {
        const hit = files2.find((f) => f.path === p && !f.isDir);
        if (hit) fsids.push({ path: p, fs_id: hit.id, name: hit.name, size: hit.size });
      }
    }
    if (!fsids.length) return { ok: false, message: "路径均无效或非文件", files: [] };
    const sp = new node_url.URLSearchParams({ method: "filemetas", access_token: this.accessToken, fsids: `[${fsids.map((x) => x.fs_id).join(",")}]`, dlink: "1", extra: "1" });
    const { json } = await httpsGetJson$1(`https://pan.baidu.com/rest/2.0/xpan/file?${sp}`);
    if (json?.errno !== 0) return { ok: false, message: `filemetas 失败 errno=${json?.errno}`, files: [] };
    const files = fsids.map((x) => {
      const meta = (json.list ?? []).find((y) => String(y.fs_id) === x.fs_id);
      return { id: x.fs_id, name: x.name, path: x.path, size: x.size, isDir: false, dlink: meta?.dlink };
    }).filter((f) => !!f.dlink);
    if (!files.length) return { ok: false, message: "未取得任何有效直链", files: [] };
    return { ok: true, files };
  }
  downloadHeaders() {
    return { "User-Agent": UA };
  }
}
const APP_ID = "250528";
function httpsGetJson(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https__namespace.request(
      { hostname: u.hostname, path: u.pathname + u.search, method: "GET", headers: { ...headers } },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf-8");
          let json = null;
          try {
            json = JSON.parse(text);
          } catch {
          }
          resolve({ status: res.statusCode ?? 0, json, text });
        });
      }
    );
    req.on("error", reject);
    req.setTimeout(15e3, () => {
      req.destroy(new Error("请求超时"));
    });
    req.end();
  });
}
class WebChannel {
  id = "web";
  name = "网页 Cookie";
  cfg;
  constructor(cfg) {
    this.cfg = cfg;
  }
  get cookie() {
    return this.cfg().webCookie;
  }
  get configured() {
    return /BDUSS\s*=/i.test(this.cookie);
  }
  baseHeaders() {
    return {
      Cookie: this.cookie,
      "User-Agent": this.cfg().webUserAgent,
      Referer: this.cfg().webReferer,
      Accept: "application/json, text/plain, */*"
    };
  }
  async probe() {
    if (!this.configured) return { ok: false, message: "未配置 Cookie（至少需要 BDUSS）", configured: false };
    const { json, text } = await httpsGetJson(`https://pan.baidu.com/api/quota?checkfree=1&checkexpire=1&web=1&app_id=${APP_ID}`, this.baseHeaders());
    if (json?.errno === 0) return { ok: true, message: `Cookie 有效（容量 ${Math.round((json.total ?? 0) / 1024 / 1024 / 1024)}GB）`, configured: true };
    if (!json && text.includes("passport")) return { ok: false, message: "Cookie 已失效（被重定向到登录页）", configured: true };
    const map = { "2": "参数错误", "-6": "身份验证失败（Cookie 无效/过期）", "111": "csrf 校验失败" };
    return { ok: false, message: `接口返回 errno=${json?.errno}（${map[json?.errno] ?? json?.err_msg ?? "未知"}）`, configured: true };
  }
  /** 分享链接解析：shorturlinfo → share/list（根目录），子目录用 dir 参数递归拉取 */
  async parse(link, pwd) {
    if (!this.configured) return { ok: false, message: "未配置网页 Cookie", channel: this.name, files: [] };
    const m = /(?:https?:\/\/)?pan\.baidu\.com\/s\/([A-Za-z0-9_-]+)/.exec(link.trim());
    if (!m) return { ok: false, message: "链接格式不正确，应为 https://pan.baidu.com/s/1xxxx", channel: this.name, files: [] };
    const surl = m[1].startsWith("1") ? m[1] : `1${m[1]}`;
    const sp = new node_url.URLSearchParams({ shorturl: surl, root: "1", app_id: APP_ID, web: "1" });
    const { json: info } = await httpsGetJson(`https://pan.baidu.com/api/shorturlinfo?${sp}`, this.baseHeaders());
    if (info?.errno !== 0) {
      const map = { "-9": "分享链接不存在或已失效", "-20": "操作过于频繁，稍后再试", "-12": "需要提取码且未提供/提取码错误", "-16": "需要提取码" };
      return { ok: false, message: `分享信息获取失败 errno=${info?.errno}（${map[info?.errno] ?? "未知"}）`, channel: this.name, files: [] };
    }
    const d = info.data ?? info;
    const sp2 = new node_url.URLSearchParams({ shareid: String(d.shareid), uk: String(d.uk), root: "1", web: "1", app_id: APP_ID });
    if (pwd.trim()) sp2.set("sekey", pwd.trim());
    const { json: lst } = await httpsGetJson(`https://pan.baidu.com/share/list?${sp2}`, this.baseHeaders());
    if (lst?.errno !== 0) return { ok: false, message: `分享目录获取失败 errno=${lst?.errno}`, channel: this.name, files: [] };
    const files = (lst.list ?? []).map((x) => ({
      id: String(x.fs_id),
      name: x.server_filename,
      path: `/${x.server_filename}`,
      size: Number(x.size ?? 0),
      isDir: x.isdir === 1
    }));
    return { ok: true, message: `解析成功，共 ${files.filter((f) => !f.isDir).length} 个文件`, channel: this.name, files };
  }
  /** 自己网盘路径 → dlink（api/filemetas dlink=1，网页同款接口） */
  async resolveFiles(paths) {
    if (!this.configured) return { ok: false, message: "未配置网页 Cookie", files: [] };
    const sp = new node_url.URLSearchParams({
      target: JSON.stringify(paths),
      dlink: "1",
      web: "1",
      app_id: APP_ID,
      origin: "dlna"
    });
    const { json, text } = await httpsGetJson(`https://pan.baidu.com/api/filemetas?${sp}`, this.baseHeaders());
    if (json?.errno !== 0) {
      if (!json && text.includes("passport")) return { ok: false, message: "Cookie 已失效", files: [] };
      return { ok: false, message: `filemetas 失败 errno=${json?.errno}（${json?.err_msg ?? "未知"}）`, files: [] };
    }
    const files = (json.list ?? []).map((x) => ({
      id: String(x.fs_id ?? 0),
      name: decodeURIComponent(String(x.dlink ?? "").split("filename=")[1]?.split("&")[0] ?? paths[0]?.split("/").pop() ?? "file"),
      path: x.path,
      size: Number(x.size ?? 0),
      isDir: false,
      dlink: x.dlink
    }));
    if (!files.length) return { ok: false, message: "未取得任何有效直链", files: [] };
    return { ok: true, files };
  }
  /** 网页 dlink 下载必备三件套：Cookie + UA + Referer */
  downloadHeaders() {
    return {
      Cookie: this.cookie,
      "User-Agent": this.cfg().webUserAgent,
      Referer: this.cfg().webReferer,
      "Accept-Encoding": "identity"
    };
  }
}
class ChannelManager {
  channels;
  activeId = "mock";
  lastResults = /* @__PURE__ */ new Map();
  constructor(channels) {
    this.channels = channels;
  }
  get(id) {
    return this.channels.find((c) => c.id === id);
  }
  get active() {
    return this.get(this.activeId) ?? this.channels[this.channels.length - 1];
  }
  list() {
    return [...this.channels];
  }
  setActive(id) {
    if (this.get(id)) this.activeId = id;
  }
  /** 并发探测全部通道并缓存结果 */
  async status() {
    const rs = await Promise.all(this.channels.map(async (c) => ({ c, r: await c.probe().catch((e) => ({ ok: false, message: String(e?.message ?? e), configured: false })) })));
    for (const { c, r } of rs) this.lastResults.set(c.id, r);
    return rs.map(({ c, r }) => ({ id: c.id, name: c.name, ok: r.ok, message: r.message, configured: r.configured }));
  }
  /** 解析：激活通道失败则按序降级，返回首个成功或聚合错误 */
  async parse(link, pwd) {
    const tried = [];
    const order = [this.activeId, ...this.channels.map((c) => c.id).filter((id) => id !== this.activeId)];
    let last;
    for (const id of order) {
      const c = this.get(id);
      if (!c) continue;
      if (id !== "mock" && this.lastResults.get(id)?.configured === false) continue;
      tried.push(c.name);
      last = await c.parse(link, pwd).catch((e) => ({ ok: false, message: String(e?.message ?? e), channel: c.name, files: [] }));
      if (last.ok) return { ...last, tried };
    }
    return { ok: false, message: last?.message ?? "所有解析通道均不可用", channel: last?.channel ?? "-", files: [], tried };
  }
  /** 直链解析：仅用激活通道（创建任务时），返回含 dlink 的文件列表 */
  async resolveFiles(paths) {
    return this.active.resolveFiles(paths);
  }
  downloadHeaders() {
    return this.active.downloadHeaders();
  }
}
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
let win = null;
let store;
let tm;
let cm;
let mock;
const gotLock = electron.app.requestSingleInstanceLock();
if (!gotLock) {
  electron.app.quit();
} else {
  electron.app.on("second-instance", () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
}
function createWindow() {
  win = new electron.BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1080,
    minHeight: 700,
    frame: false,
    show: false,
    backgroundColor: "#f5f7fb",
    webPreferences: {
      preload: path__namespace.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  win.once("ready-to-show", () => win?.show());
  win.webContents.setWindowOpenHandler(({ url }) => {
    void electron.shell.openExternal(url);
    return { action: "deny" };
  });
  if (process.env.ELECTRON_RENDERER_URL) {
    void win.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void win.loadFile(path__namespace.join(__dirname, "../renderer/index.html"));
  }
  win.on("closed", () => {
    win = null;
  });
}
function defaultDownloadDir() {
  return path__namespace.join(electron.app.getPath("downloads"), "yunxicc");
}
async function initServices() {
  store = new JsonStore(electron.app.getPath("userData"), defaultDownloadDir());
  const cfg = () => ({
    downloadDir: store.getConfig().downloadDir || defaultDownloadDir(),
    connections: store.getConfig().connections,
    chunkSizeMB: store.getConfig().chunkSizeMB,
    maxParallelTasks: store.getConfig().maxParallelTasks,
    speedLimitMB: store.getConfig().speedLimitMB
  });
  mock = new MockChannel();
  await mock.init(electron.app.getPath("userData"));
  cm = new ChannelManager([mock, new OfficialChannel(() => store.getConfig()), new WebChannel(() => store.getConfig())]);
  tm = new TaskManager(store, cfg);
  void cm.status().then(() => cm.setActive("mock"));
  tm.on("progress", (p) => {
    if (win && !win.isDestroyed()) win.webContents.send(IPC.taskProgress, p);
  });
  tm.on("stats", (s) => {
    if (win && !win.isDestroyed()) win.webContents.send(IPC.statsUpdate, s);
  });
}
function registerIpc() {
  electron.ipcMain.handle(IPC.parseSubmit, (_e, link, pwd) => cm.parse(link, pwd));
  electron.ipcMain.handle(IPC.taskCreate, async (_e, paths) => {
    const { ok, message, files } = await cm.resolveFiles(paths);
    if (!ok || !files.length) return { created: 0, message: message ?? "未取得有效直链" };
    const r = tm.createTasks(files, cm.downloadHeaders());
    return { ...r, message };
  });
  electron.ipcMain.handle(IPC.taskList, () => tm.getTasks());
  electron.ipcMain.handle(IPC.taskPause, (_e, id) => tm.pause(id));
  electron.ipcMain.handle(IPC.taskResume, (_e, id) => tm.resume(id));
  electron.ipcMain.handle(IPC.taskRemove, (_e, id) => tm.remove(id));
  electron.ipcMain.handle(IPC.taskRetry, (_e, id) => tm.retry(id));
  electron.ipcMain.handle(IPC.statsGet, () => tm.stats());
  electron.ipcMain.handle(IPC.channelStatus, () => cm.status());
  electron.ipcMain.handle(IPC.channelSwitch, (_e, id) => {
    cm.setActive(id);
  });
  electron.ipcMain.handle(IPC.configGet, () => store.getConfig());
  electron.ipcMain.handle(IPC.configSet, (_e, patch) => store.patchConfig(patch));
  electron.ipcMain.handle(IPC.dialogChooseDir, async () => {
    const r = await electron.dialog.showOpenDialog(win, { properties: ["openDirectory", "createDirectory"], title: "选择下载目录", defaultPath: store.getConfig().downloadDir });
    return r.canceled ? "" : r.filePaths[0];
  });
  electron.ipcMain.handle(IPC.winMin, () => win?.minimize());
  electron.ipcMain.handle(IPC.winMaxToggle, () => {
    if (win?.isMaximized()) win.unmaximize();
    else win?.maximize();
  });
  electron.ipcMain.handle(IPC.winClose, () => win?.close());
  electron.ipcMain.handle(IPC.openExternal, (_e, url) => {
    if (/^https?:\/\//.test(url)) void electron.shell.openExternal(url);
  });
}
electron.app.whenReady().then(async () => {
  await initServices();
  registerIpc();
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") electron.app.quit();
});
electron.app.on("before-quit", (e) => {
  if (tm) {
    e.preventDefault();
    void tm.shutdown().then(() => {
      mock?.dispose();
      electron.app.exit(0);
    });
  }
});
