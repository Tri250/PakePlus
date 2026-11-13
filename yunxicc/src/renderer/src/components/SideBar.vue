<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { store } from '../store'

const route = useRoute()
const router = useRouter()
const collapsed = ref(false)
const openGroups = ref<Record<string, boolean>>({ 仪表盘: true, 数据可视化: false, 个人中心: false })

interface Item { key: string; label: string; icon: string; to?: string; children?: { label: string; to: string }[] }
const items: Item[] = [
  { key: '仪表盘', label: '仪表盘', icon: '🌐', children: [
    { label: '工作台', to: '/workbench' },
    { label: '实时监控', to: '/monitor' },
    { label: '下载管理', to: '/downloads' },
    { label: '圈子广场', to: '/square' },
    { label: '使用帮助', to: '/help' }
  ] },
  { key: '数据可视化', label: '数据可视化', icon: '▦', children: [{ label: '下载统计', to: '/stats-dl' }] },
  { key: '个人中心', label: '个人中心', icon: '👤', children: [{ label: '我的资料', to: '/profile' }] },
  { key: '常见问题', label: '常见问题', icon: '?', to: '/faq' }
]

const isActive = (to?: string) => !!to && route.path === to
const groupHasActive = computed(() => (g: Item) => !!g.children?.some(c => c.to === route.path))

function toggleGroup(g: Item): void {
  if (g.to) { void router.push(g.to); return }
  openGroups.value[g.key] = !openGroups.value[g.key]
}
</script>

<template>
  <aside class="sidebar" :class="{ collapsed }">
    <div class="menu">
      <template v-for="g in items" :key="g.key">
        <div class="menu-group" :class="{ active: groupHasActive(g) || isActive(g.to) }" @click="toggleGroup(g)">
          <span class="iconify">{{ g.icon }}</span>
          <span class="label">{{ g.label }}</span>
          <span v-if="g.children" class="arrow" :class="{ open: openGroups[g.key] }">^</span>
        </div>
        <template v-if="g.children && openGroups[g.key]">
          <router-link v-for="c in g.children" :key="c.to" :to="c.to" class="menu-item" :class="{ active: isActive(c.to) }">
            {{ c.label }}
          </router-link>
        </template>
      </template>
    </div>
    <div class="sidebar-footer">
      <button class="icon-btn" title="收起/展开侧边栏" @click="collapsed = !collapsed">☰</button>
    </div>
  </aside>
</template>
