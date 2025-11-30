import Cookies from 'js-cookie'

const THEME_KEY = 'mall-admin-theme'

// 主题配置
const themeConfig = {
  light: {
    mode: 'light',
    primaryColor: '#409EFF',
    backgroundColor: '#FFFFFF',
    textColor: '#303133',
    borderColor: '#DCDFE6',
    menuBg: '#304156',
    subMenuBg: '#1f2d3d',
    menuHover: '#001528'
  },
  dark: {
    mode: 'dark',
    primaryColor: '#409EFF',
    backgroundColor: '#1D1E1F',
    textColor: '#CFD3DC',
    borderColor: '#4C4D4F',
    menuBg: '#1F1F1F',
    subMenuBg: '#141414',
    menuHover: '#2D2D2D'
  }
}

const theme = {
  state: {
    currentTheme: 'light',
    isTransitioning: false,
    themeConfig: themeConfig
  },
  mutations: {
    SET_THEME: (state, theme) => {
      state.currentTheme = theme
    },
    SET_THEME_TRANSITIONING: (state, status) => {
      state.isTransitioning = status
    }
  },
  actions: {
    // 切换主题
    toggleTheme({ commit, state }) {
      const newTheme = state.currentTheme === 'light' ? 'dark' : 'light'
      commit('SET_THEME_TRANSITIONING', true)
      
      // 设置新主题
      commit('SET_THEME', newTheme)
      
      // 应用CSS变量
      applyThemeVariables(newTheme, themeConfig[newTheme])
      
      // 保存到Cookie
      Cookies.set(THEME_KEY, newTheme, { expires: 365 })
      
      // 更新body类名
      updateBodyThemeClass(newTheme)
      
      setTimeout(() => {
        commit('SET_THEME_TRANSITIONING', false)
      }, 300)
    },
    
    // 设置指定主题
    setTheme({ commit }, theme) {
      if (!themeConfig[theme]) {
        console.warn(`Unknown theme: ${theme}`)
        return
      }
      
      commit('SET_THEME_TRANSITIONING', true)
      commit('SET_THEME', theme)
      
      // 应用CSS变量
      applyThemeVariables(theme, themeConfig[theme])
      
      // 保存到Cookie
      Cookies.set(THEME_KEY, theme, { expires: 365 })
      
      // 更新body类名
      updateBodyThemeClass(theme)
      
      setTimeout(() => {
        commit('SET_THEME_TRANSITIONING', false)
      }, 300)
    },
    
    // 初始化主题
    initTheme({ commit, dispatch }) {
      const savedTheme = Cookies.get(THEME_KEY) || 'light'
      
      // 验证保存的主题是否有效
      const validTheme = themeConfig[savedTheme] ? savedTheme : 'light'
      
      dispatch('setTheme', validTheme)
    }
  }
}

// 应用CSS变量
function applyThemeVariables(themeName, config) {
  const root = document.documentElement
  
  root.style.setProperty('--theme-bg-color', config.backgroundColor)
  root.style.setProperty('--theme-text-color', config.textColor)
  root.style.setProperty('--theme-border-color', config.borderColor)
  root.style.setProperty('--theme-menu-bg', config.menuBg)
  root.style.setProperty('--theme-submenu-bg', config.subMenuBg)
  root.style.setProperty('--theme-menu-hover', config.menuHover)
  root.style.setProperty('--theme-primary-color', config.primaryColor)
}

// 更新body类名
function updateBodyThemeClass(theme) {
  const body = document.body
  
  // 移除所有主题类
  body.classList.remove('light-theme', 'dark-theme')
  
  // 添加当前主题类
  body.classList.add(`${theme}-theme`)
}

export default theme