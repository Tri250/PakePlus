/**
 * 官方开放平台通道（百度网盘 xpan OpenAPI，真实端点实现）
 *
 * 文档：https://pan.baidu.com/union/doc/
 * - 授权：用户需在开放平台创建应用取得 AppKey/Secret，通过 OAuth 网页授权获取 access_token
 * - 文件列表：GET /rest/2.0/xpan/file?method=list&access_token=&dir=&web=1
 * - 文件元数据：GET /rest/2.0/xpan/file?method=filemetas&access_token=&fsids=[..]&dlink=1&extra=1
 * - 直链下载：dlink + UA(netease/pan) 头，access_token 随 dlink 已携带
 *
 * 说明：开放平台授权后操作的是「用户自己网盘」；对三方分享链接（/s/1xxx）
 * 官方 OpenAPI 不提供解析接口，因此本通道对分享链接会尝试网页短链接口，
 * 失败时返回明确提示（引导走 Cookie 通道或本地演示通道）。
 */
import * as https from 'node:https'
import { URLSearchParams } from 'node:url'
import type { IParseChannel, ParseResult, RemoteFile } from '@shared/types'
import type { AppConfig } from '@shared/types'

const UA = 'panopenid;Yunxicc/1.0.0'

function httpsGetJson(url: string, headers: Record<string, string> = {}): Promise<{ status: number; json: any; text: string }> {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const req = https.request(
      { hostname: u.hostname, path: u.pathname + u.search, method: 'GET', headers: { 'User-Agent': UA, ...headers } },
      res => {
        const chunks: Buffer[] = []
        res.on('data', c => chunks.push(c))
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf-8')
          let json: any = null
          try { json = JSON.parse(text) } catch { /* 非 JSON 响应 */ }
          resolve({ status: res.statusCode ?? 0, json, text })
        })
      }
    )
    req.on('error', reject)
    req.setTimeout(15000, () => { req.destroy(new Error('请求超时')) })
    req.end()
  })
}

export class OfficialChannel implements IParseChannel {
  id = 'official'
  name = '官方开放平台'
  private cfg: () => AppConfig

  constructor(cfg: () => AppConfig) { this.cfg = cfg }

  private get accessToken(): string { return this.cfg().officialAccessToken }
  get configured(): boolean { return !!this.accessToken || (!!this.cfg().officialAppKey && !!this.cfg().officialSecret) }

  /** OAuth 授权页（真实流程第一步，渲染层可打开外部浏览器） */
  authorizeUrl(redirectUri: string): string {
    const appKey = this.cfg().officialAppKey
    const sp = new URLSearchParams({ client_id: appKey, response_type: 'code', redirect_uri: redirectUri, scope: 'basic,netdisk' })
    return `https://openapi.baidu.com/oauth/2.0/authorize?${sp}`
  }

  /** 用授权码换 access_token（真实端点） */
  async exchangeToken(code: string, redirectUri: string): Promise<{ ok: boolean; message: string }> {
    const sp = new URLSearchParams({
      client_id: this.cfg().officialAppKey,
      client_secret: this.cfg().officialSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      code
    })
    const { json } = await httpsGetJson(`https://openapi.baidu.com/oauth/2.0/token?${sp}`)
    if (json?.access_token) {
      this.cfg().officialAccessToken = json.access_token
      return { ok: true, message: '授权成功' }
    }
    return { ok: false, message: json?.error_description ?? json?.error ?? '换取令牌失败' }
  }

  async probe(): Promise<{ ok: boolean; message: string; configured: boolean }> {
    if (!this.configured) return { ok: false, message: '未配置 AppKey / access_token', configured: false }
    if (!this.accessToken) return { ok: false, message: '已配置 AppKey，尚未完成 OAuth 授权获取 access_token', configured: true }
    const { json } = await httpsGetJson(`https://pan.baidu.com/rest/2.0/xpan/file?method=list&access_token=${encodeURIComponent(this.accessToken)}&dir=${encodeURIComponent('/')}&limit=1&web=1`)
    if (json?.errno === 0) return { ok: true, message: '开放平台令牌有效', configured: true }
    const map: Record<number, string> = { '111': 'access_token 已过期，请重新授权', '-6': '令牌身份校验失败', '2': '参数错误' }
    return { ok: false, message: `官方接口返回 errno=${json?.errno}（${map[json?.errno as number] ?? json?.errmsg ?? '未知错误'}）`, configured: true }
  }

  /** 列目录（用户自己网盘） */
  private async listDir(dir: string): Promise<{ errno: number; files: RemoteFile[]; raw: any }> {
    const sp = new URLSearchParams({ method: 'list', access_token: this.accessToken, dir, limit: '1000', web: '1', order: 'name' })
    const { json } = await httpsGetJson(`https://pan.baidu.com/rest/2.0/xpan/file?${sp}`)
    const files: RemoteFile[] = (json?.list ?? []).map((x: any) => ({
      id: String(x.fs_id), name: x.server_filename, path: `${dir === '/' ? '' : dir}/${x.server_filename}`,
      size: Number(x.size ?? 0), isDir: x.isdir === 1 || x.isdir === '1'
    }))
    return { errno: json?.errno ?? -1, files, raw: json }
  }

  async parse(link: string, pwd: string): Promise<ParseResult> {
    if (!this.configured) return { ok: false, message: '未配置官方开放平台凭据', channel: this.name, files: [] }
    if (!link.trim()) return { ok: false, message: '请输入分享链接', channel: this.name, files: [] }
    // 官方 OpenAPI 不支持解析三方分享 → 尝试网页短链信息接口
    const m = /\/s\/([A-Za-z0-9_-]+)/.exec(link)
    if (!m) return { ok: false, message: '链接格式不正确', channel: this.name, files: [] }
    const { json } = await httpsGetJson(`https://pan.baidu.com/api/shorturlinfo?app_id=250528&shorturl=${m[1]}&root=1`, { Referer: 'https://pan.baidu.com/' })
    if (json?.errno !== 0 || !json?.data) {
      return { ok: false, message: '官方通道无法解析第三方分享（OpenAPI 不开放该能力）。请配置网页 Cookie 使用网页通道，或使用本地演示通道。', channel: this.name, files: [] }
    }
    // 公开分享可列出根目录
    const d = json.data
    const sp = new URLSearchParams({ shareid: String(d.shareid), uk: String(d.uk), root: '1', web: '1', app_id: '250528' })
    const { json: lst } = await httpsGetJson(`https://pan.baidu.com/share/list?${sp}`)
    if (lst?.errno !== 0) return { ok: false, message: `分享目录获取失败 errno=${lst?.errno}`, channel: this.name, files: [] }
    const files = (lst.list ?? []).map((x: any) => ({ id: String(x.fs_id), name: x.server_filename, path: `/${x.server_filename}`, size: Number(x.size ?? 0), isDir: x.isdir === 1 }))
    return { ok: true, message: '解析成功（公开分享）', channel: this.name, files }
  }

  /** 路径 → fsid → dlink（真实两步链路：list 找 fsid，filemetas 拿 dlink） */
  async resolveFiles(paths: string[]): Promise<{ ok: boolean; message?: string; files: RemoteFile[] }> {
    if (!this.accessToken) return { ok: false, message: '未完成官方授权', files: [] }
    const fsids: { path: string; fs_id: string; name: string; size: number }[] = []
    const byParent = new Map<string, string[]>()
    for (const p of paths) {
      const idx = p.lastIndexOf('/')
      const parent = idx <= 0 ? '/' : p.slice(0, idx)
      const arr = byParent.get(parent) ?? []
      arr.push(p)
      byParent.set(parent, arr)
    }
    for (const [parent, ps] of byParent) {
      const { errno, files } = await this.listDir(parent)
      if (errno !== 0) return { ok: false, message: `目录 ${parent} 获取失败 errno=${errno}`, files: [] }
      for (const p of ps) {
        const hit = files.find(f => f.path === p && !f.isDir)
        if (hit) fsids.push({ path: p, fs_id: hit.id, name: hit.name, size: hit.size })
      }
    }
    if (!fsids.length) return { ok: false, message: '路径均无效或非文件', files: [] }
    const sp = new URLSearchParams({ method: 'filemetas', access_token: this.accessToken, fsids: `[${fsids.map(x => x.fs_id).join(',')}]`, dlink: '1', extra: '1' })
    const { json } = await httpsGetJson(`https://pan.baidu.com/rest/2.0/xpan/file?${sp}`)
    if (json?.errno !== 0) return { ok: false, message: `filemetas 失败 errno=${json?.errno}`, files: [] }
    const files: RemoteFile[] = fsids.map(x => {
      const meta = (json.list ?? []).find((y: any) => String(y.fs_id) === x.fs_id)
      return { id: x.fs_id, name: x.name, path: x.path, size: x.size, isDir: false, dlink: meta?.dlink }
    }).filter((f: RemoteFile) => !!f.dlink)
    if (!files.length) return { ok: false, message: '未取得任何有效直链', files: [] }
    return { ok: true, files }
  }

  downloadHeaders(): Record<string, string> { return { 'User-Agent': UA } }
}
