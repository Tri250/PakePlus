/**
 * 通道管理器：三通道注册 / 健康探针 / 切换 / 解析降级链
 *
 * 解析顺序：当前激活通道优先，失败后按 [web, official, mock] 顺序降级兜底，
 * 保证任一通道异常时用户仍可完成解析（mock 永远可用）。
 */
import type { ChannelInfo, IParseChannel, ParseResult } from '@shared/types'

export class ChannelManager {
  private channels: IParseChannel[]
  private activeId = 'mock'
  private lastResults = new Map<string, { ok: boolean; message: string; configured: boolean }>()

  constructor(channels: IParseChannel[]) { this.channels = channels }

  get(id: string): IParseChannel | undefined { return this.channels.find(c => c.id === id) }
  get active(): IParseChannel { return this.get(this.activeId) ?? this.channels[this.channels.length - 1] }
  list(): IParseChannel[] { return [...this.channels] }
  setActive(id: string): void { if (this.get(id)) this.activeId = id }

  /** 并发探测全部通道并缓存结果 */
  async status(): Promise<ChannelInfo[]> {
    const rs = await Promise.all(this.channels.map(async c => ({ c, r: await c.probe().catch((e: Error) => ({ ok: false, message: String(e?.message ?? e), configured: false })) })))
    for (const { c, r } of rs) this.lastResults.set(c.id, r)
    return rs.map(({ c, r }) => ({ id: c.id, name: c.name, ok: r.ok, message: r.message, configured: r.configured }))
  }

  /** 解析：激活通道失败则按序降级，返回首个成功或聚合错误 */
  async parse(link: string, pwd: string): Promise<ParseResult & { tried: string[] }> {
    const tried: string[] = []
    const order = [this.activeId, ...this.channels.map(c => c.id).filter(id => id !== this.activeId)]
    let last: ParseResult | undefined
    for (const id of order) {
      const c = this.get(id)
      if (!c) continue
      // 未配置凭据的真实通道直接跳过（避免无效报错刷屏）
      if (id !== 'mock' && this.lastResults.get(id)?.configured === false) continue
      tried.push(c.name)
      last = await c.parse(link, pwd).catch((e: Error) => ({ ok: false, message: String(e?.message ?? e), channel: c.name, files: [] }) as ParseResult)
      if (last.ok) return { ...last, tried }
    }
    return { ok: false, message: last?.message ?? '所有解析通道均不可用', channel: last?.channel ?? '-', files: [], tried }
  }

  /** 直链解析：仅用激活通道（创建任务时），返回含 dlink 的文件列表 */
  async resolveFiles(paths: string[]): Promise<{ ok: boolean; message?: string; files: import('@shared/types').RemoteFile[] }> {
    return this.active.resolveFiles(paths)
  }

  downloadHeaders(): Record<string, string> { return this.active.downloadHeaders() }
}
