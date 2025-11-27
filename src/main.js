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

// 引入性能优化系统
import continuousOptimizer from '@/utils/continuousOptimizer'

Vue.use(ElementUI, { locale })
Vue.use(VCharts)

Vue.config.productionTip = false

// 启动持续优化系统
if (process.env.NODE_ENV === 'production') {
  // 生产环境下启动持续优化
  continuousOptimizer.start()
} else {
  // 开发环境下也可以启动，但可能需要调整参数
  continuousOptimizer.updateConfig({
    intervals: {
      monitoring: 60000,    // 开发环境下降低监控频率
      optimization: 600000,
      reporting: 1200000
    }
  })
  continuousOptimizer.start()
}

new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
