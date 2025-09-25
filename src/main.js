import Vue from 'vue'

import 'normalize.css/normalize.css'// A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import VCharts from 'v-charts'

// 导入国际化配置
import i18n from '@/i18n'
import { updateFormatLocale } from '@/i18n/utils/formatters'

import '@/styles/index.scss' // global css

import App from './App'
import router from './router'
import store from './store'

import '@/icons' // icon
import '@/permission' // permission control

// 根据当前语言设置Element UI语言包
function getElementLocale(locale) {
  if (locale === 'en-US') {
    return require('element-ui/lib/locale/lang/en').default
  } else {
    return require('element-ui/lib/locale/lang/zh-CN').default
  }
}

// 初始化Element UI
Vue.use(ElementUI, { 
  locale: getElementLocale(i18n.locale),
  i18n: (key, value) => i18n.t(key, value)
})
Vue.use(VCharts)

// 监听语言变化，同步更新格式化工具和Element UI
i18n.vm = new Vue()
i18n.vm.$watch('$i18n.locale', (newLocale) => {
  // 更新格式化工具语言
  updateFormatLocale(newLocale)
  
  // 更新Element UI语言
  const elementLocale = getElementLocale(newLocale)
  if (Vue.prototype.$ELEMENT) {
    Vue.prototype.$ELEMENT.locale(elementLocale)
  }
})

// 初始化格式化工具语言
updateFormatLocale(i18n.locale)

Vue.config.productionTip = false

const vm = new Vue({
  el: '#app',
  router,
  store,
  i18n,
  template: '<App/>',
  components: { App }
})

// 将vm实例挂载到window，供store中的i18n模块使用
window.vm = vm
