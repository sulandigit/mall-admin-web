import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import locale from 'element-plus/lib/locale/lang/zh-cn'
import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import '@/styles/index.scss' // global css

import App from './App.vue'
import router from './router/index'
import { createPinia } from 'pinia'

import '@/icons' // icon
import '@/permission' // permission control
import { initPerformanceMonitor } from '@/utils/performance'

// 初始化性能监控
if (import.meta.env.MODE === 'production') {
  initPerformanceMonitor()
}

const app = createApp(App)

app.use(ElementPlus, { locale })
app.use(router)
app.use(createPinia())

app.mount('#app')
