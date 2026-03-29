import Vue from 'vue'

import 'normalize.css/normalize.css'// A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/zh-CN' // lang i18n
import VCharts from 'v-charts'

import '@/styles/index.scss' // global css
import '@/styles/image-optimization.scss' // image optimization styles

import App from './App'
import router from './router'
import store from './store'

import '@/icons' // icon
import '@/permission' // permission control

// 图片优化功能初始化
import '@/utils/imageRequestInterceptor' // 图片请求拦截器
import { imageOptimizationConfig } from '@/utils/imageOptimizationConfig'
import { webpManager } from '@/utils/webpManager'

// 全局注册图片优化组件
import LazyImage from '@/components/LazyImage'
import WebPUpload from '@/components/WebPUpload'
import EnhancedUpload from '@/components/Upload/EnhancedUpload'

Vue.component('LazyImage', LazyImage)
Vue.component('WebPUpload', WebPUpload)
Vue.component('EnhancedUpload', EnhancedUpload)

Vue.use(ElementUI, { locale })
Vue.use(VCharts)

Vue.config.productionTip = false

// 初始化WebP支持检测
webpManager.detectSupport().then(isSupported => {
  console.log('WebP support detected:', isSupported)
  store.dispatch('imageOptimization/detectWebPSupport')
})

new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
