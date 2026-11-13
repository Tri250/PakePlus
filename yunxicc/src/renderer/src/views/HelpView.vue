<script setup lang="ts">
import { api } from '../api'
</script>

<template>
  <div class="card panel">
    <div class="panel-title">使用帮助</div>
    <div style="line-height:2; color:var(--text-2); font-size:14px">
      <p><b>快速上手（3 步）：</b></p>
      <p>1. 复制百度网盘分享链接粘贴到工作台输入框（本地演示通道可用任意 s/1xxxx 链接，提取码 <b>yuni</b>）。</p>
      <p>2. 点击「提交」解析出文件树，勾选需要的文件并「创建下载任务」。</p>
      <p>3. 在「下载管理」查看进度、暂停/继续；重启应用后自动从断点续传。</p>
      <p style="margin-top:12px"><b>通道说明：</b></p>
      <p>· 本地演示通道 — 内建 HTTP 网盘仿真（支持 Range 分块并发），无需任何凭据即可完整体验全部下载能力。</p>
      <p>· 网页 Cookie 通道 — 使用你自己的百度网盘登录 Cookie（BDUSS），解析自己网盘与公开分享，直链自动附带 Cookie/UA/Referer。</p>
      <p>· 官方开放平台通道 — 使用百度网盘开放平台 AppKey + OAuth access_token，走官方 OpenAPI。</p>
      <p style="margin-top:12px">
        运行环境：<b>{{ api.platform === 'electron' ? '桌面应用（Electron 主进程下载引擎）' : '浏览器演示模式（模拟下载，非真实落盘）' }}</b>
      </p>
    </div>
  </div>
</template>
