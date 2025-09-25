import Cookies from 'js-cookie'
import { AVAILABLE_LOCALES, getDefaultLocale } from '../index'

const state = {
  currentLocale: getDefaultLocale(),
  availableLocales: AVAILABLE_LOCALES,
  fallbackLocale: 'zh-CN',
  loading: false
}

const mutations = {
  SET_LOCALE(state, locale) {
    state.currentLocale = locale
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  }
}

const actions = {
  changeLocale({ commit, dispatch }, locale) {
    return new Promise((resolve) => {
      commit('SET_LOADING', true)
      
      // 模拟异步加载
      setTimeout(() => {
        commit('SET_LOCALE', locale)
        
        // 保存到cookie
        Cookies.set('language', locale, { expires: 365 })
        
        // 更新i18n实例的语言
        if (window.vm && window.vm.$i18n) {
          window.vm.$i18n.locale = locale
        }
        
        // 更新Element UI的语言
        dispatch('_updateElementLocale', locale)
        
        commit('SET_LOADING', false)
        resolve()
      }, 300)
    })
  },
  
  _updateElementLocale({ state }, locale) {
    // 动态更新Element UI语言包
    try {
      let elementLocale
      if (locale === 'en-US') {
        elementLocale = require('element-ui/lib/locale/lang/en').default
      } else {
        elementLocale = require('element-ui/lib/locale/lang/zh-CN').default
      }
      
      if (window.vm && window.vm.$ELEMENT) {
        window.vm.$ELEMENT.locale(elementLocale)
      }
    } catch (error) {
      console.warn('Failed to update Element UI locale:', error)
    }
  }
}

const getters = {
  currentLanguage: state => {
    const locale = state.availableLocales.find(l => l.code === state.currentLocale)
    return locale ? locale.name : 'Unknown'
  },
  currentLanguageIcon: state => {
    const locale = state.availableLocales.find(l => l.code === state.currentLocale)
    return locale ? locale.icon : '🌐'
  },
  isRTL: state => {
    // 目前支持的语言都是从左到右，如果以后支持阿拉伯语等，可以在这里判断
    return false
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}