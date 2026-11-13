<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'
import { applyConfig, notify, refreshTasks, store } from '../store'
import SettingsDrawer from './SettingsDrawer.vue'

const router = useRouter()
const showSearch = ref(false)
const searchInput = ref('')
const searchEl = ref<HTMLInputElement | null>(null)
const showNotices = ref(false)
const showSettings = ref(false)
const showLang = ref(false)
const showLogin = ref(false)
const loginName = ref('')

const okChannels = computed(() => store.channels.filter(c => c.ok).length)
const user = computed(() => store.user)

async function toggleTheme(): Promise<void> {
  const next = store.config?.theme === 'dark' ? 'light' : 'dark'
  await applyConfig({ theme: next })
}

function onSearch(): void {
  store.keyword = searchInput.value.trim()
  showSearch.value = false
  void router.push('/downloads')
}

function toggleFullscreen(): void {
  if (document.fullscreenElement) void document.exitFullscreen()
  else void document.requestFullscreen()
}

function openLogin(): void { showLogin.value = true; loginName.value = '' }

async function doLogin(): Promise<void> {
  const name = loginName.value.trim() || '管理员'
  store.user = name
  const m = (window as unknown as { __yunxiccMock?: { mockUser: string | null } }).__yunxiccMock
  if (m) m.mockUser = name
  showLogin.value = false
  notify(`欢迎回来，${name}（本地模式）`, 'ok')
}

function logout(): void {
  store.user = null
  const m = (window as unknown as { __yunxiccMock?: { mockUser: string | null } }).__yunxiccMock
  if (m) m.mockUser = null
  notify('已退出登录', 'info')
}

async function pauseAll(): Promise<void> {
  for (const t of store.tasks.filter(t => t.status === 'downloading' || t.status === 'pending')) await api.taskPause(t.id)
  await refreshTasks()
  notify('已全部暂停', 'info')
}
async function resumeAll(): Promise<void> {
  for (const t of store.tasks.filter(t => t.status === 'paused')) await api.taskResume(t.id)
  await refreshTasks()
  notify('已全部继续', 'info')
}

function fmtTime(n: number): string {
  const d = new Date(n)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}
</script>

<template>
  <header class="topbar">
    <div class="brand clickable">
      <svg class="logo-mark" viewBox="0 0 32 32"><path d="M16 3 30 27H2z" fill="#4080ff" /><path d="M16 12l7 13H9z" fill="#7aa7ff" /></svg>
      云析Down
    </div>
    <div class="topbar-spacer" />
    <input v-if="showSearch" ref="searchEl" v-model="searchInput" class="input search-input clickable" placeholder="搜索任务文件名，回车跳转下载管理" @keyup.enter="onSearch" @keyup.esc="showSearch = false" />
    <button class="icon-btn clickable" title="搜索" @click="showSearch = !showSearch; if (showSearch) setTimeout(() => searchEl?.focus(), 50)">🔍</button>

    <div class="icon-btn clickable" style="position:relative" title="翻译">
      <span @click="showLang = !showLang">文A</span>
      <div v-if="showLang" class="pop" style="right:0; width:140px">
        <div class="pop-item" @click="showLang = false">✅ 简体中文</div>
        <div class="pop-item" @click="showLang = false; notify('当前版本暂仅支持中文界面', 'info')">English（暂未开放）</div>
      </div>
    </div>

    <button class="icon-btn clickable" title="主题切换" @click="toggleTheme">{{ store.config?.theme === 'dark' ? '🌙' : '☀️' }}</button>

    <div class="icon-btn clickable" style="position:relative" title="通知">
      <span @click="showNotices = !showNotices">🔔</span>
      <span v-if="store.notices.length" class="badge" style="position:absolute; top:-2px; right:-2px">{{ store.notices.length }}</span>
      <div v-if="showNotices" class="pop" style="right:0">
        <div v-if="!store.notices.length" class="pop-item">暂无通知</div>
        <div v-for="n in store.notices" :key="n.id" class="pop-item">
          <div>{{ n.type === 'ok' ? '✅' : n.type === 'err' ? '❌' : 'ℹ️' }} {{ n.text }}</div>
          <div class="t">{{ fmtTime(n.time) }}</div>
        </div>
      </div>
    </div>

    <button class="icon-btn clickable" title="全屏" @click="toggleFullscreen">⛶</button>
    <button class="icon-btn clickable" title="设置" @click="showSettings = true">⚙</button>

    <button v-if="!user" class="btn primary clickable" style="margin-left:6px" @click="openLogin">👤 登录</button>
    <div v-else class="clickable" style="display:flex; align-items:center; gap:8px; position:relative">
      <span class="avatar" style="margin-left:0; background:#4080ff">{{ user.slice(0, 1) }}</span>
      <span style="font-size:13px">{{ user }}</span>
      <button class="link-btn danger" @click="logout">退出</button>
    </div>

    <div v-if="api.platform === 'electron'" class="win-btns">
      <button class="win-btn" @click="api.minimize()">—</button>
      <button class="win-btn" @click="api.maxToggle()">□</button>
      <button class="win-btn close" @click="api.close()">✕</button>
    </div>

    <SettingsDrawer v-if="showSettings" @close="showSettings = false" />
  </header>
</template>
