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

// 引入集中化错误处理
import '@/utils/errorHandler' // 错误处理器
import globalErrorListener from '@/utils/globalErrorListener' // 全局错误监听器

// 开发环境下引入错误处理测试
if (process.env.NODE_ENV === 'development') {
  import('@/utils/errorHandlingTest')
}

Vue.use(ElementUI, { locale })
Vue.use(VCharts)

Vue.config.productionTip = false

// 初始化全局错误监听器
globalErrorListener.init()

// 设置Vue全局错误处理
Vue.config.errorHandler = (error, vm, info) => {
  console.error('Vue全局错误:', error)
  console.error('错误信息:', info)
  
  // 错误已由globalErrorListener处理，这里只做额外的记录
  if (process.env.NODE_ENV === 'development') {
    console.error('Vue组件:', vm)
  }
}

new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
