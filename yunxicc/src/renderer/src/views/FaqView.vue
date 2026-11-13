<script setup lang="ts">
const items = [
  { q: '支持哪些链接格式？', a: '当前版本支持百度网盘分享链接 https://pan.baidu.com/s/1xxxx（可附带 ?pwd=xxxx）。本地演示通道提取码为 yuni。' },
  { q: '下载速度由什么决定？', a: '速度取决于网盘服务端限流与并发连接数。可在「设置」中调整单任务连接数（默认 8）与分块大小；SVIP 账号配合网页 Cookie 通道可获得更高速度。' },
  { q: '暂停后进度会丢失吗？', a: '不会。分块断点会持久化到本地存储，应用重启后恢复任务会从断点继续（仅补传未完成分块）。' },
  { q: '网页 Cookie 通道如何配置？', a: '浏览器登录 pan.baidu.com → F12 → Application → Cookies → 复制 BDUSS（建议同时复制 STOKEN）→ 粘贴到 设置 → 通道配置。直链下载会自动附带 Cookie、UA 与 Referer。' },
  { q: '官方开放平台通道是什么？', a: '在百度网盘开放平台创建应用后填入 AppKey/Secret，完成 OAuth 授权即可通过官方 OpenAPI 管理自己网盘的文件并获取高速直链（dlink）。' },
  { q: '下载的文件在哪里？', a: '默认保存在系统下载目录的 yunxicc 文件夹，可在「设置 → 下载目录」中修改；网盘目录结构会被镜像到本地。' }
]
</script>

<template>
  <div class="card panel">
    <div class="panel-title">常见问题</div>
    <div v-for="(it, i) in items" :key="i" style="margin-bottom:18px">
      <div style="font-weight:600; margin-bottom:6px">{{ i + 1 }}. {{ it.q }}</div>
      <div style="color:var(--text-2); font-size:13px; line-height:1.7">{{ it.a }}</div>
    </div>
  </div>
</template>
