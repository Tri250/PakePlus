import { createRouter, createWebHashHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/workbench' },
    { path: '/workbench', name: 'workbench', component: () => import('./views/WorkbenchView.vue'), meta: { group: '仪表盘', title: '工作台' } },
    { path: '/monitor', name: 'monitor', component: () => import('./views/MonitorView.vue'), meta: { group: '仪表盘', title: '实时监控' } },
    { path: '/downloads', name: 'downloads', component: () => import('./views/DownloadView.vue'), meta: { group: '仪表盘', title: '下载管理' } },
    { path: '/square', name: 'square', component: () => import('./views/PlaceholderView.vue'), meta: { group: '仪表盘', title: '圈子广场' } },
    { path: '/help', name: 'help', component: () => import('./views/HelpView.vue'), meta: { group: '仪表盘', title: '使用帮助' } },
    { path: '/stats-dl', name: 'stats-dl', component: () => import('./views/StatsView.vue'), meta: { group: '数据可视化', title: '下载统计' } },
    { path: '/profile', name: 'profile', component: () => import('./views/PlaceholderView.vue'), meta: { group: '个人中心', title: '我的资料' } },
    { path: '/faq', name: 'faq', component: () => import('./views/FaqView.vue'), meta: { group: '更多', title: '常见问题' } }
  ]
})
