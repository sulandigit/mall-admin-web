import Vue from 'vue'
import VueI18n from 'vue-i18n'
import Cookies from 'js-cookie'
import elementEnLocale from 'element-ui/lib/locale/lang/en' // element-ui英文语言包
import elementZhLocale from 'element-ui/lib/locale/lang/zh-CN' // element-ui中文语言包

// 导入自定义语言包
import enLocale from './locales/en-US'
import zhLocale from './locales/zh-CN'

Vue.use(VueI18n)

// 可用语言列表
export const AVAILABLE_LOCALES = [
  {
    code: 'zh-CN',
    name: '简体中文',
    icon: '🇨🇳'
  },
  {
    code: 'en-US',
    name: 'English',
    icon: '🇺🇸'
  }
]

// 语言包合并
const messages = {
  'en-US': {
    ...enLocale,
    ...elementEnLocale
  },
  'zh-CN': {
    ...zhLocale,
    ...elementZhLocale
  }
}

// 获取默认语言
export function getDefaultLocale() {
  const cookieLanguage = Cookies.get('language')
  if (cookieLanguage && messages[cookieLanguage]) {
    return cookieLanguage
  }
  
  // 浏览器语言检测
  const language = navigator.language || navigator.userLanguage
  const locales = Object.keys(messages)
  for (const locale of locales) {
    if (language.indexOf(locale) > -1) {
      return locale
    }
  }
  
  // 默认返回中文
  return 'zh-CN'
}

// 创建i18n实例
const i18n = new VueI18n({
  locale: getDefaultLocale(),
  fallbackLocale: 'zh-CN',
  messages,
  silentTranslationWarn: true
})

export default i18n