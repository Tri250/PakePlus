<script setup lang="ts">
import { computed } from 'vue'
import { fmtSize, store } from '../store'

const done = computed(() => store.tasks.filter(t => t.status === 'completed'))
const totalByDay = computed(() => {
  // 简单聚合：按完成日期分桶（本地演示）
  const map = new Map<string, number>()
  for (const t of done.value) {
    const d = new Date(t.completedAt ?? t.updatedAt).toISOString().slice(0, 10)
    map.set(d, (map.get(d) ?? 0) + t.size)
  }
  return [...map.entries()].sort((a, b) => a[0] < b[0] ? -1 : 1).slice(-14)
})
const max = computed(() => Math.max(1, ...totalByDay.value.map(x => x[1])))
</script>

<template>
  <div class="card panel">
    <div class="panel-title">下载统计</div>
    <div v-if="!totalByDay.length" class="empty">暂无完成记录</div>
    <div style="display:flex; align-items:flex-end; gap:12px; height:220px; padding:10px 0">
      <div v-for="[d, v] in totalByDay" :key="d" style="flex:1; text-align:center">
        <div style="font-size:11px; color:var(--text-3); margin-bottom:4px">{{ fmtSize(v) }}</div>
        <div style="background:var(--primary); border-radius:4px 4px 0 0; height: 0px" :style="{ height: Math.round((v / max) * 160) + 'px' }" />
        <div style="font-size:11px; color:var(--text-3); margin-top:6px">{{ d.slice(5) }}</div>
      </div>
    </div>
    <div style="margin-top:16px; color:var(--text-2); font-size:13px">
      历史累计下载：<b>{{ fmtSize(store.stats.totalBytesDone) }}</b>（只增不减）
    </div>
  </div>
</template>
