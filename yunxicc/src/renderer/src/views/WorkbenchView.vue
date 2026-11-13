<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { api } from '../api'
import { notify, store } from '../store'
import FileTreeDialog from '../components/FileTreeDialog.vue'

const link = ref('')
const pwd = ref('')
const cardKey = ref('')
const agreed = ref(false)
const submitting = ref(false)
const showTree = ref(false)

const okChannels = computed(() => store.channels.filter(c => c.ok))
const allOk = computed(() => okChannels.value.length > 0)
const quota = computed(() => store.user ? '今日剩余额度：20/20' : '登录后可查看今日额度')

const err = reactive({ link: '', pwd: '' })

async function submit(): Promise<void> {
  err.link = ''; err.pwd = ''
  if (!link.value.trim()) { err.link = '请输入分享链接'; return }
  if (!agreed.value) { notify('请先勾选同意《服务协议》', 'info'); return }
  submitting.value = true
  try {
    const r = await api.parseSubmit(link.value, pwd.value, cardKey.value)
    if (r.ok) {
      store.parsed = r
      showTree.value = true
      notify(`解析成功（${r.channel}）`, 'ok')
      void refreshChannels()
    } else {
      notify(r.message, 'err')
    }
  } finally {
    submitting.value = false
  }
}

async function refreshChannels(): Promise<void> {
  store.channels = await api.channelStatus()
}
</script>

<template>
  <div>
    <div class="card welcome-card"><h2>欢迎回来!</h2></div>

    <div class="card hero">
      <div class="hero-title">
        <svg class="logo-mark" viewBox="0 0 32 32"><path d="M16 3 30 27H2z" fill="#4080ff" /><path d="M16 12l7 13H9z" fill="#7aa7ff" /></svg>
        Just Do It.
      </div>
      <div class="hero-sub">基于Vite底层组件，探壳体验丝滑前端开发的乐趣。</div>
      <div class="hero-links">
        <a class="clickable" @click="api.openExternal('https://pan.baidu.com')">官网</a>
        <span class="divider">|</span>
        <a class="clickable" @click="notify('解析记录可在下载管理查看', 'info')">解析记录</a>
        <span class="divider">|</span>
        <a class="clickable" @click="api.openExternal('https://github.com/silasmarchioriqhk/Yunxicc')">GitHub</a>
      </div>
      <div class="hero-avatars">
        <span class="avatar" style="background:#4080ff">Y</span>
        <span class="avatar" style="background:#52c41a">X</span>
        <span class="avatar" style="background:#e6a23c">1</span>
      </div>
    </div>

    <div class="card status-card">
      <span class="spacer" />
      <template v-if="allOk">
        <span v-for="c in store.channels" :key="c.id" style="margin-left:14px" :title="c.message">
          <span class="dot" :class="c.ok ? 'ok' : c.configured ? 'warn' : 'bad'" />{{ c.name }}
        </span>
        <span style="margin-left:18px; color:var(--success); font-weight:600">正常</span>
      </template>
      <span v-else><span class="dot bad" />服务异常</span>
    </div>

    <div class="card parse-form">
      <div>
        <input v-model="link" class="input" placeholder="请输入分享链接(可输入带提取码链接)" :disabled="submitting" @keyup.enter="submit" />
        <div v-if="err.link" style="color:var(--danger); font-size:12px; margin-top:4px">{{ err.link }}</div>
      </div>
      <div class="row">
        <div class="field">
          <input v-model="pwd" class="input" placeholder="提取码" :disabled="submitting" @keyup.enter="submit" />
        </div>
        <div class="field">
          <input v-model="cardKey" class="input" placeholder="卡密(可选,获取更多解析额度)" :disabled="submitting" />
        </div>
      </div>
      <button class="btn primary block" style="margin-top:16px" :disabled="submitting" @click="submit">{{ submitting ? '解析中…' : '提 交' }}</button>
      <div class="form-foot">
        <label class="agree">
          <input v-model="agreed" type="checkbox" class="checkbox" />
          我已阅读并同意&nbsp;<a @click.prevent="notify('本工具仅供学习交流，请勿用于商业用途', 'info')">《服务协议》</a>
        </label>
        <span class="spacer" />
        <span style="color:var(--text-3)">{{ quota }}</span>
      </div>
    </div>

    <FileTreeDialog v-if="showTree && store.parsed" :files="store.parsed.files" @close="showTree = false" />
  </div>
</template>
