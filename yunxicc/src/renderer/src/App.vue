<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SideBar from './components/SideBar.vue'
import HeaderBar from './components/HeaderBar.vue'
import { store } from './store'

const route = useRoute()
const version = 'v1.0.56'
const title = computed(() => route.meta.title as string ?? '')
</script>

<template>
  <div class="layout">
    <SideBar />
    <div class="main">
      <HeaderBar />
      <div class="content">
        <div v-if="title && $route.path !== '/workbench'" class="breadcrumb">
          <span>🏠</span><span>/</span><span>{{ route.meta.group }}</span><span>/</span><span class="cur">{{ title }}</span>
        </div>
        <router-view />
        <div class="footer-version">云析Down {{ version }}</div>
      </div>
    </div>
  </div>
</template>
