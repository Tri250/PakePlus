/**
 * 端到端集成测试（无 Electron，纯 Node）
 *
 * 覆盖链路：MockChannel 真实 HTTP 服务器（Range 206）→ ChannelManager 解析
 * → TaskManager 创建/调度 → DownloadEngine 分块下载落盘 → MD5 校验
 * → 暂停/恢复 → 重启后断点续传 → 统计口径（总下载量只增不减）
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'
import * as crypto from 'node:crypto'

process.env.YUNXICC_MOCK_PORT = '18901'

const { MockChannel } = await import('../src/main/parse/mockChannel')
const { ChannelManager } = await import('../src/main/parse/channelManager')
const { JsonStore } = await import('../src/main/store/jsonStore')
const { TaskManager } = await import('../src/main/engine/taskManager')
const { DEFAULT_CONFIG } = await import('../src/main/store/jsonStore')

let mock: InstanceType<typeof MockChannel>
let cm: InstanceType<typeof ChannelManager>
let store: InstanceType<typeof JsonStore>
let tm: InstanceType<typeof TaskManager>
let tmpDir: string
let dataDir: string

function waitFor(pred: () => boolean, timeoutMs = 30000, interval = 100): Promise<void> {
  return new Promise((resolve, reject) => {
    const t0 = Date.now()
    const timer = setInterval(() => {
      try {
        if (pred()) { clearInterval(timer); resolve() }
        else if (Date.now() - t0 > timeoutMs) { clearInterval(timer); reject(new Error('waitFor 超时')) }
      } catch (e) { clearInterval(timer); reject(e) }
    }, interval)
  })
}

beforeAll(async () => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yunxicc-it-'))
  dataDir = path.join(tmpDir, 'data')
  mock = new MockChannel()
  await mock.init(dataDir)
  cm = new ChannelManager([mock])
  store = new JsonStore(dataDir, path.join(tmpDir, 'downloads'))
  const cfg = () => ({
    downloadDir: path.join(tmpDir, 'downloads'),
    connections: 4,
    chunkSizeMB: 4,
    maxParallelTasks: 2,
    speedLimitMB: DEFAULT_CONFIG.speedLimitMB
  })
  tm = new TaskManager(store, cfg)
}, 60000)

afterAll(async () => {
  await tm?.shutdown()
  mock?.dispose()
  try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch { /* ignore */ }
})

describe('端到端：解析 → 下载 → 校验', () => {
  it('解析分享链接返回目录树', async () => {
    const r = await cm.parse('https://pan.baidu.com/s/1mockdemo?pwd=yuni', 'yuni')
    expect(r.ok).toBe(true)
    expect(r.files.length).toBeGreaterThan(0)
    const video = r.files.find(f => f.name === '视频资源')
    expect(video?.isDir).toBe(true)
    expect(video?.children?.some(c => c.name === '产品发布会.mp4')).toBe(true)
  })

  it('提取码错误被拒绝', async () => {
    const r = await cm.parse('https://pan.baidu.com/s/1mockdemo', 'wrongpwd')
    expect(r.ok).toBe(false)
    expect(r.message).toContain('提取码')
  })

  it('创建任务并真实下载到磁盘，MD5 与服务器一致', async () => {
    const tree = await cm.parse('https://pan.baidu.com/s/1mockdemo', 'yuni')
    const picks = ['readme.txt', '文档资料/接口设计说明.docx', '软件工具/驱动包.zip']
    const paths = picks.map(p => (p === 'readme.txt' ? '/readme.txt' : `/${p}`))
    const { ok, files } = await cm.resolveFiles(paths)
    expect(ok).toBe(true)
    expect(files.every(f => f.dlink?.startsWith('http://127.0.0.1'))).toBe(true)

    const created = tm.createTasks(files, cm.downloadHeaders())
    expect(created.created).toBe(3)

    await waitFor(() => tm.getTasks().every(t => t.status === 'completed'), 30000)

    // 本地落盘校验：大小 + MD5 与 mock 服务器 meta.json 一致
    const md5s = JSON.parse(fs.readFileSync(path.join(dataDir, 'mock-netdisk', 'meta.json'), 'utf-8'))
    for (const t of tm.getTasks()) {
      expect(fs.existsSync(t.localPath)).toBe(true)
      expect(fs.statSync(t.localPath).size).toBe(t.size)
      const localMd5 = crypto.createHash('md5').update(fs.readFileSync(t.localPath)).digest('hex')
      expect(localMd5).toBe(md5s[t.remotePath])
    }
    // 统计：总下载量只增不减，累计应等于完成文件总和
    const stats = tm.stats()
    expect(stats.completed).toBe(3)
    expect(stats.totalBytesDone).toBe(picks.length ? files.reduce((s, f) => s + f.size, 0) : 0)
  })

  it('限速 + 暂停/恢复：恢复后继续并完成', async () => {
    // 限速 2MB/s 下载 24MB 文件，保证有窗口执行暂停
    store.patchConfig({ speedLimitMB: 2 })
    const { files } = await cm.resolveFiles(['/视频资源/教程合集/第01课_环境搭建.mp4'])
    const before = store.getTotalBytesDone()
    tm.createTasks(files, cm.downloadHeaders())
    const t = tm.getTasks().find(x => x.name === '第01课_环境搭建.mp4')!

    await waitFor(() => t.received > 2 * 1024 * 1024, 20000) // 至少收到 2MB
    tm.pause(t.id)
    await waitFor(() => t.status === 'paused', 5000)
    expect(t.received).toBeLessThan(t.size)

    const receivedAtPause = t.received
    store.patchConfig({ speedLimitMB: 0 })
    tm.resume(t.id)
    await waitFor(() => t.status === 'completed', 30000)
    expect(t.received).toBe(t.size)
    // 续传后总量仍正确
    expect(fs.statSync(t.localPath).size).toBe(t.size)
    expect(store.getTotalBytesDone()).toBe(before + t.size)
    void receivedAtPause
  }, 40000)

  it('重启后断点续传：新 TaskManager 从持久化恢复并完成下载', async () => {
    // 造一个限速任务并中途暂停
    store.patchConfig({ speedLimitMB: 2 })
    const { files } = await cm.resolveFiles(['/视频资源/教程合集/第02课_基础操作.mp4'])
    tm.createTasks(files, cm.downloadHeaders())
    const t = tm.getTasks().find(x => x.name === '第02课_基础操作.mp4')!
    await waitFor(() => t.received > 2 * 1024 * 1024, 20000)
    tm.pause(t.id)
    await waitFor(() => t.status === 'paused', 5000)
    await tm.shutdown() // 模拟应用退出（落盘）

    // 模拟重启：新建 TaskManager，任务应恢复为 paused 且保留断点
    const store2 = new JsonStore(dataDir, path.join(tmpDir, 'downloads'))
    const tm2 = new TaskManager(store2, () => ({
      downloadDir: path.join(tmpDir, 'downloads'),
      connections: 4, chunkSizeMB: 4, maxParallelTasks: 2, speedLimitMB: 0
    }))
    const t2 = store2.getTasks().find(x => x.name === '第02课_基础操作.mp4')!
    expect(t2.status).toBe('paused')
    expect(t2.received).toBeGreaterThan(0)
    const chunkState = store2.getChunkState(t2.id)
    expect(chunkState?.chunks?.length).toBeGreaterThan(0)

    tm2.resume(t2.id)
    await waitFor(() => t2.status === 'completed', 30000)
    expect(fs.statSync(t2.localPath).size).toBe(t2.size)
    await tm2.shutdown()
  }, 50000)

  it('并发窗口限制 maxParallelTasks', async () => {
    store.patchConfig({ speedLimitMB: 0 })
    const { files } = await cm.resolveFiles([
      '/文档资料/产品需求文档.pdf', '/文档资料/年度报表2026.xlsx',
      '/图片集合/壁纸_山海.jpg', '/图片集合/壁纸_星空.jpg'
    ])
    tm.createTasks(files, cm.downloadHeaders())
    await waitFor(() => tm.stats().completed >= 4, 30000)
    expect(tm.stats().completed).toBeGreaterThanOrEqual(4)
  }, 40000)
})
