<script setup lang="ts">
import { computed } from 'vue'
import { fmtSize, fmtSpeed, store } from '../store'

const active = computed(() => store.tasks.filter(t => t.status === 'downloading' || t.status === 'pending' || t.status === 'paused'))
const connCount = computed(() => store.tasks.reduce((n, t) => n + (t.status === 'downloading' ? t.connections : 0), 0))
</script>

<template>
  <div>
    <div class="stat-grid" style="grid-template-columns: repeat(3, 1fr)">
      <div class="card stat-card">
        <div class="stat-icon" style="background:var(--primary-bg); color:var(--primary)">⚡</div>
        <div><div class="stat-label">实时总速度</div><div class="stat-value">{{ fmtSpeed(store.stats.totalSpeed) || '0 B/s' }}</div></div>
      </div>
      <div class="card stat-card">
        <div class="stat-icon" style="background:var(--success-bg); color:var(--success)">⇅</div>
        <div><div class="stat-label">活跃连接</div><div class="stat-value">{{ connCount }}</div></div>
      </div>
      <div class="card stat-card">
        <div class="stat-icon" style="background:var(--warning-bg); color:var(--warning)">⟳</div>
        <div><div class="stat-label">活跃任务</div><div class="stat-value">{{ active.length }}</div></div>
      </div>
    </div>

    <div v-if="!active.length" class="card panel"><div class="empty">当前没有进行中的任务</div></div>
    <div v-else class="monitor-grid">
      <div v-for="t in active" :key="t.id" class="card monitor-card">
        <div class="monitor-head">
          <span class="name">{{ t.name }}</span>
          <span class="speed">{{ fmtSpeed(t.speed) }}</span>
        </div>
        <div class="progress-bar" style="height:8px">
          <div class="progress-inner" :style="{ width: (t.size ? Math.min(100, (t.received / t.size) * 100) : 0) + '%' }" />
        </div>
        <div class="monitor-meta">
          <span>{{ fmtSize(t.received) }} / {{ fmtSize(t.size) }}</span>
          <span>{{ t.size ? Math.round((t.received / t.size) * 1000) / 10 : 0 }}%</span>
          <span>{{ t.connections }} 连接</span>
          <span style="color:var(--text-3)">{{ t.status === 'paused' ? '已暂停' : t.status === 'pending' ? '排队中' : '下载中' }}</span>
        </div>
        <div class="conn-bars">
          <div v-for="i in Math.max(t.connections, 8)" :key="i" class="conn-bar" :class="{ on: i <= t.connections }" />
        </div>
      </div>
    </div>
  </div>
</template>
