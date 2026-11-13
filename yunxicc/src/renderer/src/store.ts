/**
 * 全局响应式状态（不引 pinia，保持轻量）
 */
import { reactive } from 'vue'
import { api } from './api'
import type { AppConfig, ChannelInfo, DownloadTask, ParseResult, StatsSnapshot } from '@shared/types'

export interface Notice { id: number; text: string; time: number; type: 'ok' | 'err' | 'info' }

export const store = reactive({
  ready: false,
  tasks: [] as DownloadTask[],
  stats: { totalTasks: 0, completed: 0, downloading: 0, totalBytesDone: 0, totalSpeed: 0 } as StatsSnapshot,
  channels: [] as ChannelInfo[],
  activeChannel: 'mock',
  config: null as AppConfig | null,
  parsed: null as ParseResult | null,
  parsing: false,
  user: null as string | null,
  notices: [] as Notice[],
  keyword: ''
})

let noticeId = 0
export function notify(text: string, type: Notice['type'] = 'info'): void {
  store.notices.unshift({ id: ++noticeId, text, time: Date.now(), type })
  if (store.notices.length > 20) store.notices.pop()
}

export function fmtSize(n: number): string {
  if (n <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  let v = n
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++ }
  return `${v >= 100 ? v.toFixed(0) : v.toFixed(1)} ${units[i]}`
}
export function fmtSpeed(n: number): string { return n > 0 ? `${fmtSize(n)}/s` : '' }

// 上次任务状态（用于状态变化 → 通知）
const prevStatus = new Map<string, string>()

export async function refreshTasks(): Promise<void> {
  const list = await api.taskList()
  for (const t of list) {
    const prev = prevStatus.get(t.id)
    if (prev && prev !== t.status) {
      if (t.status === 'completed') notify(`下载完成：${t.name}`, 'ok')
      if (t.status === 'failed') notify(`下载失败：${t.name}（${t.error ?? '未知错误'}）`, 'err')
    }
    prevStatus.set(t.id, t.status)
  }
  // 按 id 就地合并（保留表格滚动位置与响应式引用）
  const byId = new Map(store.tasks.map(t => [t.id, t]))
  const merged = list.map(t => {
    const old = byId.get(t.id)
    return old ? Object.assign(old, t) : t
  })
  store.tasks.splice(0, store.tasks.length, ...merged)
}

export async function refreshStats(): Promise<void> {
  store.stats = await api.statsGet()
}

export async function refreshChannels(): Promise<void> {
  store.channels = await api.channelStatus()
  const okCh = store.channels.find(c => c.ok)
  store.activeChannel = okCh?.id ?? 'mock'
}

export async function initStore(): Promise<void> {
  store.config = await api.configGet()
  document.documentElement.dataset.theme = store.config.theme
  await Promise.all([refreshTasks(), refreshStats(), refreshChannels()])
  if (api.platform === 'browser-mock') {
    const m = (window as unknown as { __yunxiccMock?: { mockUser: string | null } }).__yunxiccMock
    store.user = m?.mockUser ?? null
  }
  api.onProgress(p => {
    const t = store.tasks.find(x => x.id === p.taskId)
    if (t) { t.received = p.received; t.speed = p.speed; t.connections = p.connections; t.size = p.total }
  })
  api.onStats(s => { Object.assign(store.stats, s) })
  // 轮询兜底：状态变化/通知
  setInterval(() => { void refreshTasks() }, 1500)
  setInterval(() => { void refreshChannels() }, 15000)
  store.ready = true
}

export async function applyConfig(patch: Partial<AppConfig>): Promise<void> {
  store.config = await api.configSet(patch)
  document.documentElement.dataset.theme = store.config.theme
}
