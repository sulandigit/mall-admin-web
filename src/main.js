import Vue from 'vue'

import 'normalize.css/normalize.css'// A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/zh-CN' // lang i18n
import VCharts from 'v-charts'

import '@/styles/index.scss' // global css

import App from './App'
import router from './router'
import store from './store'

import '@/icons' // icon
import '@/permission' // permission control

// 引入全局错误处理
import { globalErrorMonitor } from '@/utils/globalErrorMonitor'
import ErrorHandler from '@/utils/errorHandler'

Vue.use(ElementUI, { locale })
Vue.use(VCharts)

Vue.config.productionTip = false

// 初始化全局错误监控
globalErrorMonitor.init({
  enableConsoleError: true,
  enablePromiseRejection: true,
  enableVueError: true,
  enableResourceError: true,
  reportUrl: process.env.NODE_ENV === 'production' ? '/api/errors/report' : null,
  version: process.env.VUE_APP_VERSION || '1.0.0'
})

// 添加全局属性，方便组件中使用
Vue.prototype.$errorHandler = ErrorHandler
Vue.prototype.$errorMonitor = globalErrorMonitor

new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
