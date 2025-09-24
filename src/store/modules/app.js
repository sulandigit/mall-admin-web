import Cookies from 'js-cookie'

const app = {
  namespaced: true,
  state: {
    sidebar: {
      opened: !+Cookies.get('sidebarStatus'),
      withoutAnimation: false
    },
    device: 'desktop',
    language: localStorage.getItem('language') || 'zh-CN',
    theme: localStorage.getItem('theme') || 'default',
    loading: false,
    size: localStorage.getItem('size') || 'medium'
  },
  mutations: {
    TOGGLE_SIDEBAR: state => {
      const status = state.sidebar.opened ? 1 : 0
      localStorage.setItem('sidebarStatus', status)
      Cookies.set('sidebarStatus', status)
      state.sidebar.opened = !state.sidebar.opened
    },
    CLOSE_SIDEBAR: (state, withoutAnimation) => {
      localStorage.setItem('sidebarStatus', 1)
      Cookies.set('sidebarStatus', 1)
      state.sidebar.opened = false
      state.sidebar.withoutAnimation = withoutAnimation
    },
    TOGGLE_DEVICE: (state, device) => {
      state.device = device
    },
    SET_LANGUAGE: (state, language) => {
      state.language = language
      localStorage.setItem('language', language)
    },
    SET_THEME: (state, theme) => {
      state.theme = theme
      localStorage.setItem('theme', theme)
    },
    SET_LOADING: (state, loading) => {
      state.loading = !!loading
    },
    SET_SIZE: (state, size) => {
      state.size = size
      localStorage.setItem('size', size)
    }
  },
  actions: {
    toggleSideBar: ({ commit }) => {
      commit('TOGGLE_SIDEBAR')
    },
    closeSideBar({ commit }, { withoutAnimation }) {
      commit('CLOSE_SIDEBAR', withoutAnimation)
    },
    toggleDevice({ commit }, device) {
      commit('TOGGLE_DEVICE', device)
    },
    setLanguage({ commit }, language) {
      commit('SET_LANGUAGE', language)
    },
    setTheme({ commit }, theme) {
      commit('SET_THEME', theme)
    },
    setLoading({ commit }, loading) {
      commit('SET_LOADING', loading)
    },
    setSize({ commit }, size) {
      commit('SET_SIZE', size)
    }
  },
  getters: {
    sidebar: state => state.sidebar,
    device: state => state.device,
    language: state => state.language,
    theme: state => state.theme,
    loading: state => state.loading,
    size: state => state.size,
    isMobile: state => state.device === 'mobile',
    isDesktop: state => state.device === 'desktop'
  }
}

export default app
