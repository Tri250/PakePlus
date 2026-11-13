/**
 * 本地演示通道：内建真实 HTTP 网盘仿真服务
 *
 * - 首次启动在数据目录生成真实文件（伪随机内容，带 MD5），虚拟目录树
 * - HTTP 服务支持 Range 请求（206 分块并发）、HEAD 预检
 * - parse(): 校验分享链接/提取码 → 返回虚拟目录树
 * - resolveFiles(): 路径 → 真实下载直链 http://127.0.0.1:<port>/download?path=...
 */
import * as http from 'node:http'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as crypto from 'node:crypto'
import type { IParseChannel, ParseResult, RemoteFile } from '@shared/types'

export const MOCK_PORT = Number(process.env.YUNXICC_MOCK_PORT || 18888)

interface MockMeta { path: string; name: string; size: number; isDir: boolean; md5?: string; children?: string[] }

// 虚拟网盘目录结构（对齐原应用分享演示场景）
const TREE: MockMeta[] = [
  { path: '/', name: '根目录', size: 0, isDir: true, children: ['文档资料', '图片集合', '视频资源', '软件工具', '音乐精选', 'readme.txt'] },
  { path: '/readme.txt', name: 'readme.txt', size: 4096, isDir: false },
  { path: '/文档资料', name: '文档资料', size: 0, isDir: true, children: ['产品需求文档.pdf', '接口设计说明.docx', '年度报表2026.xlsx'] },
  { path: '/文档资料/产品需求文档.pdf', name: '产品需求文档.pdf', size: 12 * 1024 * 1024, isDir: false },
  { path: '/文档资料/接口设计说明.docx', name: '接口设计说明.docx', size: 6 * 1024 * 1024, isDir: false },
  { path: '/文档资料/年度报表2026.xlsx', name: '年度报表2026.xlsx', size: 3 * 1024 * 1024, isDir: false },
  { path: '/图片集合', name: '图片集合', size: 0, isDir: true, children: ['壁纸_山海.jpg', '壁纸_星空.jpg', '壁纸_城市.jpg'] },
  { path: '/图片集合/壁纸_山海.jpg', name: '壁纸_山海.jpg', size: 2 * 1024 * 1024, isDir: false },
  { path: '/图片集合/壁纸_星空.jpg', name: '壁纸_星空.jpg', size: 2 * 1024 * 1024, isDir: false },
  { path: '/图片集合/壁纸_城市.jpg', name: '壁纸_城市.jpg', size: 2 * 1024 * 1024, isDir: false },
  { path: '/视频资源', name: '视频资源', size: 0, isDir: true, children: ['产品发布会.mp4', '教程合集/'] },
  { path: '/视频资源/教程合集', name: '教程合集', size: 0, isDir: true, children: ['第01课_环境搭建.mp4', '第02课_基础操作.mp4'] },
  { path: '/视频资源/产品发布会.mp4', name: '产品发布会.mp4', size: 64 * 1024 * 1024, isDir: false },
  { path: '/视频资源/教程合集/第01课_环境搭建.mp4', name: '第01课_环境搭建.mp4', size: 24 * 1024 * 1024, isDir: false },
  { path: '/视频资源/教程合集/第02课_基础操作.mp4', name: '第02课_基础操作.mp4', size: 26 * 1024 * 1024, isDir: false },
  { path: '/软件工具', name: '软件工具', size: 0, isDir: true, children: ['云析Down_Setup.exe', '驱动包.zip'] },
  { path: '/软件工具/云析Down_Setup.exe', name: '云析Down_Setup.exe', size: 33 * 1024 * 1024, isDir: false },
  { path: '/软件工具/驱动包.zip', name: '驱动包.zip', size: 18 * 1024 * 1024, isDir: false },
  { path: '/音乐精选', name: '音乐精选', size: 0, isDir: true, children: ['夜曲.flac', '晴天.mp3'] },
  { path: '/音乐精选/夜曲.flac', name: '夜曲.flac', size: 9 * 1024 * 1024, isDir: false },
  { path: '/音乐精选/晴天.mp3', name: '晴天.mp3', size: 5 * 1024 * 1024, isDir: false }
]

export class MockChannel implements IParseChannel {
  id = 'mock'
  name = '本地演示'
  private server?: http.Server
  private dataDir!: string
  private ready = false
  private acceptPwd = ['yuni', '', '1234']

  async init(dataDir: string): Promise<void> {
    this.dataDir = path.join(dataDir, 'mock-netdisk')
    fs.mkdirSync(this.dataDir, { recursive: true })
    this.generateFiles()
    this.server = http.createServer((req, res) => this.handler(req, res))
    await new Promise<void>(resolve => this.server!.listen(MOCK_PORT, '127.0.0.1', resolve))
    this.ready = true
  }

  dispose(): void { this.server?.close() }

  /** 生成真实文件（内容为 4KB 随机块重复填充，带 MD5 元数据） */
  private generateFiles(): void {
    const metaFile = path.join(this.dataDir, 'meta.json')
    let md5s: Record<string, string> = {}
    try { md5s = JSON.parse(fs.readFileSync(metaFile, 'utf-8')) } catch { /* 首次生成 */ }
    const block = crypto.randomBytes(4096)
    for (const m of TREE) {
      if (m.isDir) continue
      const p = path.join(this.dataDir, m.path)
      if (fs.existsSync(p) && fs.statSync(p).size === m.size) continue
      fs.mkdirSync(path.dirname(p), { recursive: true })
      const fd = fs.openSync(p, 'w')
      let written = 0
      while (written < m.size) {
        const n = Math.min(block.length, m.size - written)
        fs.writeSync(fd, block, 0, n)
        written += n
      }
      fs.closeSync(fd)
      md5s[m.path] = crypto.createHash('md5').update(fs.readFileSync(p)).digest('hex')
    }
    fs.writeFileSync(metaFile, JSON.stringify(md5s), 'utf-8')
  }

  private find(p: string): MockMeta | undefined {
    const norm = p.endsWith('/') && p !== '/' ? p.slice(0, -1) : p
    return TREE.find(m => m.path === (norm || '/'))
  }

  private handler(req: http.IncomingMessage, res: http.ServerResponse): void {
    const u = new URL(req.url ?? '/', 'http://127.0.0.1')
    res.setHeader('Access-Control-Allow-Origin', '*')
    try {
      if (u.pathname === '/api/health') { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok: true, channel: 'mock' })); return }

      if (u.pathname === '/api/list') {
        const dir = u.searchParams.get('path') || '/'
        const node = this.find(dir)
        if (!node || !node.isDir) { res.writeHead(404); res.end(JSON.stringify({ errno: -9, errormsg: '目录不存在' })); return }
        const files = (node.children ?? []).map(c => {
          const child = this.find(path.posix.join(dir, c))
          if (!child) return null
          return { fs_id: 1000 + Math.abs(this.hash(child.path)), path: child.path, server_filename: child.name, size: child.size, isdir: child.isDir ? 1 : 0, md5: child.md5 }
        }).filter(Boolean)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ errno: 0, list: files }))
        return
      }

      if (u.pathname === '/download') {
        const p = u.searchParams.get('path') || '/'
        const m = this.find(p)
        if (!m || m.isDir) { res.writeHead(404); res.end('not found'); return }
        const fp = path.join(this.dataDir, m.path)
        const size = fs.statSync(fp).size
        const headers: Record<string, string | number> = {
          'Content-Type': 'application/octet-stream',
          'Accept-Ranges': 'bytes',
          'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(m.name)}`,
          'X-File-MD5': m.md5 ?? '',
          'Cache-Control': 'no-store'
        }
        const range = req.headers.range
        if (range) {
          const mt = /bytes=(\d*)-(\d*)/.exec(range)
          if (mt) {
            const start = mt[1] ? Number(mt[1]) : 0
            const end = mt[2] ? Math.min(Number(mt[2]), size - 1) : size - 1
            if (start >= size || start > end) {
              res.writeHead(416, { 'Content-Range': `bytes */${size}` }); res.end(); return
            }
            headers['Content-Range'] = `bytes ${start}-${end}/${size}`
            headers['Content-Length'] = end - start + 1
            res.writeHead(206, headers)
            const rs = fs.createReadStream(fp, { start, end })
            rs.on('error', () => res.destroy())
            req.on('close', () => rs.destroy())
            rs.pipe(res)
            return
          }
        }
        headers['Content-Length'] = size
        res.writeHead(200, headers)
        const rs = fs.createReadStream(fp)
        rs.on('error', () => res.destroy())
        req.on('close', () => rs.destroy())
        rs.pipe(res)
        return
      }

      res.writeHead(404); res.end('not found')
    } catch (e: any) {
      try { res.writeHead(500); res.end(String(e?.message ?? e)) } catch { /* socket gone */ }
    }
  }

  private hash(s: string): number {
    let h = 0
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
    return h
  }

  /** 分享链接格式校验：支持 pan.baidu.com/s/1xxx 与 mock://share/xxx */
  async parse(link: string, pwd: string): Promise<ParseResult> {
    const linkRe = /^(?:https?:\/\/)?(?:pan\.baidu\.com\/s\/|mock:\/\/share\/)([A-Za-z0-9_-]{4,})/
    if (!linkRe.test(link.trim())) {
      return { ok: false, message: '链接格式不正确，应为 https://pan.baidu.com/s/1xxxx 形式', channel: this.name, files: [] }
    }
    const hasPwd = !!pwd.trim()
    if (!hasPwd || !this.acceptPwd.includes(pwd.trim())) {
      return { ok: false, message: hasPwd ? '提取码错误（演示通道提取码：yuni）' : '请输入提取码', channel: this.name, files: [] }
    }
    await this.health()
    const root = this.buildTree('/')
    return { ok: true, message: `解析成功，共 ${this.countFiles(root)} 个文件`, channel: this.name, files: root }
  }

  private buildTree(dir: string): RemoteFile[] {
    const node = this.find(dir)
    if (!node?.isDir) return []
    return (node.children ?? []).map(c => {
      const child = this.find(path.posix.join(dir, c))
      if (!child) return null
      const f: RemoteFile = { id: String(1000 + Math.abs(this.hash(child.path))), name: child.name, path: child.path, size: child.size, isDir: child.isDir }
      if (child.isDir) f.children = this.buildTree(child.path)
      return f
    }).filter(Boolean) as RemoteFile[]
  }

  private countFiles(files: RemoteFile[]): number {
    return files.reduce((n, f) => n + (f.isDir ? this.countFiles(f.children ?? []) : 1), 0)
  }

  async resolveFiles(paths: string[]): Promise<{ ok: boolean; message?: string; files: RemoteFile[] }> {
    const files: RemoteFile[] = []
    for (const p of paths) {
      const m = this.find(p)
      if (!m || m.isDir) continue
      files.push({ id: String(1000 + Math.abs(this.hash(m.path))), name: m.name, path: m.path, size: m.size, isDir: false, dlink: `http://127.0.0.1:${MOCK_PORT}/download?path=${encodeURIComponent(m.path)}` })
    }
    if (!files.length) return { ok: false, message: '所选路径均不是文件', files: [] }
    return { ok: true, files }
  }

  downloadHeaders(): Record<string, string> { return { 'User-Agent': 'Yunxicc/1.0 mock-channel' } }

  private async health(): Promise<boolean> {
    if (this.ready && this.server) return true
    await new Promise(r => setTimeout(r, 200))
    return this.ready
  }

  async probe(): Promise<{ ok: boolean; message: string; configured: boolean }> {
    try {
      const ok = await this.health()
      return { ok, message: ok ? `本地演示服务运行中 (127.0.0.1:${MOCK_PORT})` : '本地服务未就绪', configured: true }
    } catch (e: any) {
      return { ok: false, message: String(e?.message ?? e), configured: true }
    }
  }
}
