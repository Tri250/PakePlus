import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { initStore } from './store'
import './style.css'

const app = createApp(App)
app.use(router)
initStore().finally(() => {
  app.mount('#app')
})
