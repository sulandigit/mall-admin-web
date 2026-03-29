import Vue from 'vue'

import 'normalize.css/normalize.css'// A modern alternative to CSS resets

// Element Plus 导入
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// Element Plus 兼容适配层
import { installElementPlusCompat } from '@/utils/element-plus-compat'
import VCharts from 'v-charts'

import '@/styles/index.scss' // global css

import App from './App'
import router from './router'
import store from './store'

import '@/icons' // icon
import '@/permission' // permission control

// 注册 Element Plus
Vue.use(ElementPlus, {
  locale: zhCn,
})

// 全局注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  Vue.component(key, component)
}

// 安装Element Plus兼容适配层
installElementPlusCompat(Vue)

Vue.use(VCharts)

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
