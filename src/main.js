import Vue from 'vue'

import 'normalize.css/normalize.css'// A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/zh-CN' // lang i18n
import VCharts from 'v-charts'

import '@/styles/index.scss' // global css
import '@/styles/accessibility.scss' // accessibility styles

import App from './App'
import router from './router'
import store from './store'

import '@/icons' // icon
import '@/permission' // permission control

// 导入无障碍指令
import accessibilityDirectives from '@/directives/accessibility'
// 导入键盘导航管理器
import '@/utils/keyboardNavigation'

// 注册无障碍指令
Object.keys(accessibilityDirectives).forEach(key => {
  Vue.directive(key, accessibilityDirectives[key])
})

Vue.use(ElementUI, { locale })
Vue.use(VCharts)

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
