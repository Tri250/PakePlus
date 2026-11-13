<script setup lang="ts">
import { computed, ref } from 'vue'
import { api } from '../api'
import { fmtSize, fmtSpeed, refreshStats, refreshTasks, store } from '../store'

const tab = ref<'active' | 'done'>('active')
const page = ref(1)
const pageSize = 10
const selected = ref(new Set<string>())

const filtered = computed(() => {
  const kw = store.keyword.toLowerCase()
  return store.tasks.filter(t => t.name.toLowerCase().includes(kw))
})
const activeTasks = computed(() => filtered.value.filter(t => t.status !== 'completed'))
const doneTasks = computed(() => filtered.value.filter(t => t.status === 'completed'))
const shown = computed(() => (tab.value === 'active' ? activeTasks.value : doneTasks.value))
const paged = computed(() => shown.value.slice((page.value - 1) * pageSize, page.value * pageSize))
const totalPages = computed(() => Math.max(1, Math.ceil(shown.value.length / pageSize)))

function statusText(t: (typeof store.tasks)[number]): string {
  if (t.status === 'downloading') return fmtSpeed(t.speed) || '下载中'
  const map: Record<string, string> = { pending: '排队中', paused: '已暂停', completed: '已完成', failed: '失败', canceled: '已取消', parsing: '解析中', ready: '已就绪' }
  return map[t.status] ?? t.status
}
function statusColor(t: (typeof store.tasks)[number]): string {
  if (t.status === 'downloading') return 'var(--primary)'
  if (t.status === 'completed') return 'var(--success)'
  if (t.status === 'failed') return 'var(--danger)'
  return 'var(--text-3)'
}
function toggleSel(id: string): void {
  selected.value.has(id) ? selected.value.delete(id) : selected.value.add(id)
  selected.value = new Set(selected.value)
}
function toggleAll(): void {
  if (selected.value.size === paged.value.length) selected.value = new Set()
  else selected.value = new Set(paged.value.map(t => t.id))
}

async function pause(t: { id: string }): Promise<void> { await api.taskPause(t.id); await sync() }
async function resume(t: { id: string }): Promise<void> { await api.taskResume(t.id); await sync() }
async function remove(t: { id: string }): Promise<void> { await api.taskRemove(t.id); selected.value.delete(t.id); await sync() }
async function retry(t: { id: string }): Promise<void> { await api.taskRetry(t.id); await sync() }

async function batchRemove(): Promise<void> {
  if (!selected.value.size) return
  for (const id of selected.value) await api.taskRemove(id)
  selected.value = new Set()
  await sync()
}
async function pauseAll(): Promise<void> {
  for (const t of store.tasks.filter(t => t.status === 'downloading' || t.status === 'pending')) await api.taskPause(t.id)
  await sync()
}
async function resumeAll(): Promise<void> {
  for (const t of store.tasks.filter(t => t.status === 'paused')) await api.taskResume(t.id)
  await sync()
}
async function sync(): Promise<void> { await Promise.all([refreshTasks(), refreshStats()]) }
</script>

<template>
  <div>
    <div class="stat-grid">
      <div class="card stat-card">
        <div class="stat-icon" style="background:var(--hover); color:var(--text-2)">⬇</div>
        <div><div class="stat-label">任务总数</div><div class="stat-value">{{ store.stats.totalTasks }}</div></div>
      </div>
      <div class="card stat-card">
        <div class="stat-icon" style="background:var(--success-bg); color:var(--success)">✔</div>
        <div><div class="stat-label">已完成</div><div class="stat-value">{{ store.stats.completed }}</div></div>
      </div>
      <div class="card stat-card">
        <div class="stat-icon" style="background:var(--primary-bg); color:var(--primary)">⏳</div>
        <div>
          <div class="stat-label">下载中</div>
          <div class="stat-value">{{ store.stats.downloading }}</div>
          <div v-if="store.stats.totalSpeed > 0" class="stat-extra">{{ fmtSpeed(store.stats.totalSpeed) }}</div>
        </div>
      </div>
      <div class="card stat-card">
        <div class="stat-icon" style="background:var(--warning-bg); color:var(--warning)">▤</div>
        <div><div class="stat-label">总下载量</div><div class="stat-value">{{ fmtSize(store.stats.totalBytesDone) }}</div></div>
      </div>
    </div>

    <div class="card panel">
      <div class="panel-title">下载管理</div>
      <div class="tabs">
        <div class="tab" :class="{ active: tab === 'active' }" @click="tab = 'active'; page = 1">
          正在下载 <span v-if="activeTasks.length" class="badge">{{ activeTasks.length }}</span>
        </div>
        <div class="tab" :class="{ active: tab === 'done' }" @click="tab = 'done'; page = 1">已完成</div>
      </div>
      <div class="toolbar">
        <button class="btn danger-plain" :disabled="!selected.size" @click="batchRemove">🗑 批量删除</button>
        <button class="btn" @click="pauseAll">⏸ 全部暂停</button>
        <button class="btn" @click="resumeAll">▶ 全部继续</button>
        <span v-if="store.keyword" style="align-self:center; font-size:12px; color:var(--text-3)">筛选：{{ store.keyword }}（在顶栏搜索框修改）</span>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th style="width:36px"><input type="checkbox" class="checkbox" :checked="selected.size === paged.length && paged.length > 0" @click="toggleAll" /></th>
            <th>文件名</th><th style="width:110px">大小</th><th style="width:240px">进度</th><th style="width:130px">状态</th><th style="width:130px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in paged" :key="t.id">
            <td><input type="checkbox" class="checkbox" :checked="selected.has(t.id)" @click="toggleSel(t.id)" /></td>
            <td class="name" :title="t.remotePath">{{ t.name }}</td>
            <td>{{ fmtSize(t.size) }}</td>
            <td>
              <div class="progress-wrap">
                <div class="progress-bar"><div class="progress-inner" :class="{ done: t.status === 'completed' }" :style="{ width: (t.size ? Math.min(100, (t.received / t.size) * 100) : 0) + '%' }" /></div>
                <span class="progress-text">{{ t.size ? Math.round((t.received / t.size) * 1000) / 10 : 0 }}%</span>
              </div>
            </td>
            <td><span class="status-pill" :style="{ color: statusColor(t) }">{{ statusText(t) }}</span><div v-if="t.error" style="color:var(--danger);font-size:11px">{{ t.error }}</div></td>
            <td>
              <button v-if="t.status === 'downloading'" class="link-btn" @click="pause(t)">暂停</button>
              <button v-if="t.status === 'paused' || t.status === 'pending'" class="link-btn" @click="resume(t)">继续</button>
              <button v-if="t.status === 'failed'" class="link-btn" @click="retry(t)">重试</button>
              <button class="link-btn danger" @click="remove(t)">删除</button>
            </td>
          </tr>
          <tr v-if="!paged.length"><td colspan="6"><div class="empty">{{ tab === 'active' ? '暂无进行中的任务' : '暂无已完成任务' }}</div></td></tr>
        </tbody>
      </table>

      <div class="pagination">
        <span>共 {{ shown.length }} 条</span>
        <button class="page-btn" :disabled="page <= 1" @click="page--">&lt;</button>
        <button v-for="p in totalPages" :key="p" class="page-btn" :class="{ active: p === page }" @click="page = p">{{ p }}</button>
        <button class="page-btn" :disabled="page >= totalPages" @click="page++">&gt;</button>
      </div>
    </div>
  </div>
</template>
