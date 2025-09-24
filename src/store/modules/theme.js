import Cookies from 'js-cookie'

const theme = {
  state: {
    theme: Cookies.get('theme') || 'light'
  },
  mutations: {
    TOGGLE_THEME: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
      Cookies.set('theme', state.theme)
    },
    SET_THEME: (state, theme) => {
      state.theme = theme
      Cookies.set('theme', theme)
    }
  },
  actions: {
    toggleTheme({ commit }) {
      commit('TOGGLE_THEME')
    },
    setTheme({ commit }, theme) {
      commit('SET_THEME', theme)
    }
  }
}

export default theme