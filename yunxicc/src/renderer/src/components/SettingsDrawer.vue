<script setup lang="ts">
import { reactive, ref } from 'vue'
import { api } from '../api'
import { applyConfig, notify, store } from '../store'

const emit = defineEmits<{ close: [] }>()
const cfg = reactive<Record<string, any>>({ ...store.config })
const tab = ref<'download' | 'channel'>('download')

async function save(): Promise<void> {
  await applyConfig(cfg as never)
  notify('设置已保存', 'ok')
  emit('close')
}

async function chooseDir(): Promise<void> {
  const dir = await api.chooseDir()
  if (dir) cfg.downloadDir = dir
}
</script>

<template>
  <div class="drawer-mask" @click="emit('close')" />
  <div class="drawer">
    <div class="dialog-head">设置 <button class="icon-btn x" @click="emit('close')">✕</button></div>
    <div class="dialog-body">
      <div class="tabs">
        <div class="tab" :class="{ active: tab === 'download' }" @click="tab = 'download'">下载设置</div>
        <div class="tab" :class="{ active: tab === 'channel' }" @click="tab = 'channel'">通道配置</div>
      </div>

      <template v-if="tab === 'download'">
        <div class="form-item">
          <label>下载目录</label>
          <div style="display:flex; gap:8px">
            <input v-model="cfg.downloadDir" class="input" />
            <button class="btn" @click="chooseDir">选择</button>
          </div>
        </div>
        <div class="form-item">
          <label>单任务并发连接数：{{ cfg.connections }}</label>
          <div class="slider-row"><input v-model.number="cfg.connections" type="range" min="1" max="32" /><span class="slider-val">{{ cfg.connections }} 线程</span></div>
        </div>
        <div class="form-item">
          <label>分块大小：{{ cfg.chunkSizeMB }} MB</label>
          <div class="slider-row"><input v-model.number="cfg.chunkSizeMB" type="range" min="1" max="64" /><span class="slider-val">{{ cfg.chunkSizeMB }} MB</span></div>
        </div>
        <div class="form-item">
          <label>同时下载任务数：{{ cfg.maxParallelTasks }}</label>
          <div class="slider-row"><input v-model.number="cfg.maxParallelTasks" type="range" min="1" max="10" /><span class="slider-val">{{ cfg.maxParallelTasks }} 个</span></div>
        </div>
        <div class="form-item">
          <label>限速（MB/s，0 为不限速）</label>
          <input v-model.number="cfg.speedLimitMB" class="input" type="number" min="0" />
        </div>
        <div class="form-item">
          <label class="agree"><input v-model="cfg.autoStart" type="checkbox" class="checkbox" /> 任务创建后自动开始下载</label>
        </div>
        <div class="form-item">
          <label>界面主题</label>
          <select v-model="cfg.theme" class="input">
            <option value="light">浅色</option>
            <option value="dark">深色</option>
          </select>
        </div>
      </template>

      <template v-else>
        <div class="section-title">网页 Cookie 通道（pan.baidu.com）</div>
        <div class="form-item">
          <label>Cookie（至少包含 BDUSS=...）</label>
          <textarea v-model="cfg.webCookie" class="input" rows="3" placeholder="BDUSS=xxxx; STOKEN=xxxx" />
          <div class="hint">从浏览器登录百度网盘后，F12 → Application → Cookies 复制。直链下载会自动附带 Cookie + UA + Referer。</div>
        </div>
        <div class="form-item">
          <label>User-Agent</label>
          <input v-model="cfg.webUserAgent" class="input" />
        </div>
        <div class="form-item">
          <label>Referer</label>
          <input v-model="cfg.webReferer" class="input" />
        </div>

        <div class="section-title">官方开放平台通道（xpan OpenAPI）</div>
        <div class="form-item">
          <label>AppKey</label>
          <input v-model="cfg.officialAppKey" class="input" placeholder="开放平台应用 AppKey" />
        </div>
        <div class="form-item">
          <label>SecretKey</label>
          <input v-model="cfg.officialSecret" class="input" type="password" placeholder="开放平台应用 SecretKey" />
        </div>
        <div class="form-item">
          <label>access_token（OAuth 授权后获得）</label>
          <textarea v-model="cfg.officialAccessToken" class="input" rows="2" />
          <div class="hint">配置 AppKey/Secret 后按官方 OAuth 流程授权；拥有 access_token 后可管理自己网盘文件。</div>
        </div>
      </template>
    </div>
    <div class="dialog-foot">
      <button class="btn" @click="emit('close')">取消</button>
      <button class="btn primary" @click="save">保存</button>
    </div>
  </div>
</template>
