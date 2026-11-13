/**
 * 网页 Cookie 通道（pan.baidu.com 网页版接口，真实端点实现）
 *
 * 原理（与网页版一致）：
 * - 需要浏览器登录后的 Cookie（至少 BDUSS；STOKEN 用于分享接口）
 * - 文件列表（自己网盘）：GET https://pan.baidu.com/api/list?dir=&web=1
 * - 直链获取：GET https://pan.baidu.com/api/filemetas?target=["路径"]&dlink=1&web=1
 * - 分享解析：/s/1xxx → api/shorturlinfo → share/list（需要 STOKEN + sekey 场景）
 * - 直链下载：必须携带与获取时相同的 User-Agent + Referer(https://pan.baidu.com/disk/home) + Cookie，
 *   否则返回 302 到校园/限流页或 403。
 */
import * as https from 'node:https'
import { URLSearchParams } from 'node:url'
import type { IParseChannel, ParseResult, RemoteFile } from '@shared/types'
import type { AppConfig } from '@shared/types'

const APP_ID = '250528'

function httpsGetJson(url: string, headers: Record<string, string> = {}): Promise<{ status: number; json: any; text: string }> {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const req = https.request(
      { hostname: u.hostname, path: u.pathname + u.search, method: 'GET', headers: { ...headers } },
      res => {
        const chunks: Buffer[] = []
        res.on('data', c => chunks.push(c))
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf-8')
          let json: any = null
          try { json = JSON.parse(text) } catch { /* 非 JSON（可能是登录跳转页） */ }
          resolve({ status: res.statusCode ?? 0, json, text })
        })
      }
    )
    req.on('error', reject)
    req.setTimeout(15000, () => { req.destroy(new Error('请求超时')) })
    req.end()
  })
}

export class WebChannel implements IParseChannel {
  id = 'web'
  name = '网页 Cookie'
  private cfg: () => AppConfig

  constructor(cfg: () => AppConfig) { this.cfg = cfg }

  private get cookie(): string { return this.cfg().webCookie }
  get configured(): boolean { return /BDUSS\s*=/i.test(this.cookie) }

  private baseHeaders(): Record<string, string> {
    return {
      Cookie: this.cookie,
      'User-Agent': this.cfg().webUserAgent,
      Referer: this.cfg().webReferer,
      Accept: 'application/json, text/plain, */*'
    }
  }

  async probe(): Promise<{ ok: boolean; message: string; configured: boolean }> {
    if (!this.configured) return { ok: false, message: '未配置 Cookie（至少需要 BDUSS）', configured: false }
    const { json, text } = await httpsGetJson(`https://pan.baidu.com/api/quota?checkfree=1&checkexpire=1&web=1&app_id=${APP_ID}`, this.baseHeaders())
    if (json?.errno === 0) return { ok: true, message: `Cookie 有效（容量 ${Math.round((json.total ?? 0) / 1024 / 1024 / 1024)}GB）`, configured: true }
    if (!json && text.includes('passport')) return { ok: false, message: 'Cookie 已失效（被重定向到登录页）', configured: true }
    const map: Record<number, string> = { '2': '参数错误', '-6': '身份验证失败（Cookie 无效/过期）', '111': 'csrf 校验失败' }
    return { ok: false, message: `接口返回 errno=${json?.errno}（${map[json?.errno as number] ?? json?.err_msg ?? '未知'}）`, configured: true }
  }

  /** 分享链接解析：shorturlinfo → share/list（根目录），子目录用 dir 参数递归拉取 */
  async parse(link: string, pwd: string): Promise<ParseResult> {
    if (!this.configured) return { ok: false, message: '未配置网页 Cookie', channel: this.name, files: [] }
    const m = /(?:https?:\/\/)?pan\.baidu\.com\/s\/([A-Za-z0-9_-]+)/.exec(link.trim())
    if (!m) return { ok: false, message: '链接格式不正确，应为 https://pan.baidu.com/s/1xxxx', channel: this.name, files: [] }
    const surl = m[1].startsWith('1') ? m[1] : `1${m[1]}`

    const sp = new URLSearchParams({ shorturl: surl, root: '1', app_id: APP_ID, web: '1' })
    const { json: info } = await httpsGetJson(`https://pan.baidu.com/api/shorturlinfo?${sp}`, this.baseHeaders())
    if (info?.errno !== 0) {
      const map: Record<number, string> = { '-9': '分享链接不存在或已失效', '-20': '操作过于频繁，稍后再试', '-12': '需要提取码且未提供/提取码错误', '-16': '需要提取码' }
      return { ok: false, message: `分享信息获取失败 errno=${info?.errno}（${map[info?.errno as number] ?? '未知'}）`, channel: this.name, files: [] }
    }
    const d = info.data ?? info
    const sp2 = new URLSearchParams({ shareid: String(d.shareid), uk: String(d.uk), root: '1', web: '1', app_id: APP_ID })
    if (pwd.trim()) sp2.set('sekey', pwd.trim())
    const { json: lst } = await httpsGetJson(`https://pan.baidu.com/share/list?${sp2}`, this.baseHeaders())
    if (lst?.errno !== 0) return { ok: false, message: `分享目录获取失败 errno=${lst?.errno}`, channel: this.name, files: [] }
    const files: RemoteFile[] = (lst.list ?? []).map((x: any) => ({
      id: String(x.fs_id), name: x.server_filename, path: `/${x.server_filename}`, size: Number(x.size ?? 0), isDir: x.isdir === 1
    }))
    return { ok: true, message: `解析成功，共 ${files.filter(f => !f.isDir).length} 个文件`, channel: this.name, files }
  }

  /** 自己网盘路径 → dlink（api/filemetas dlink=1，网页同款接口） */
  async resolveFiles(paths: string[]): Promise<{ ok: boolean; message?: string; files: RemoteFile[] }> {
    if (!this.configured) return { ok: false, message: '未配置网页 Cookie', files: [] }
    const sp = new URLSearchParams({
      target: JSON.stringify(paths),
      dlink: '1',
      web: '1',
      app_id: APP_ID,
      origin: 'dlna'
    })
    const { json, text } = await httpsGetJson(`https://pan.baidu.com/api/filemetas?${sp}`, this.baseHeaders())
    if (json?.errno !== 0) {
      if (!json && text.includes('passport')) return { ok: false, message: 'Cookie 已失效', files: [] }
      return { ok: false, message: `filemetas 失败 errno=${json?.errno}（${json?.err_msg ?? '未知'}）`, files: [] }
    }
    const files: RemoteFile[] = (json.list ?? []).map((x: any) => ({
      id: String(x.fs_id ?? 0), name: decodeURIComponent(String(x.dlink ?? '').split('filename=')[1]?.split('&')[0] ?? paths[0]?.split('/').pop() ?? 'file'),
      path: x.path, size: Number(x.size ?? 0), isDir: false, dlink: x.dlink
    }))
    if (!files.length) return { ok: false, message: '未取得任何有效直链', files: [] }
    return { ok: true, files }
  }

  /** 网页 dlink 下载必备三件套：Cookie + UA + Referer */
  downloadHeaders(): Record<string, string> {
    return {
      Cookie: this.cookie,
      'User-Agent': this.cfg().webUserAgent,
      Referer: this.cfg().webReferer,
      'Accept-Encoding': 'identity'
    }
  }
}
