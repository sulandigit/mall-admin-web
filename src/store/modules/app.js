import Cookies from 'js-cookie'

const app = {
  state: {
    sidebar: {
      opened: !+Cookies.get('sidebarStatus'),
      withoutAnimation: false
    },
    device: 'desktop',
    // 路由加载状态管理
    routeLoading: {
      loading: false,
      routeName: '',
      progress: 0,
      error: false
    },
    // 全局加载状态
    globalLoading: {
      visible: false,
      text: '加载中...',
      progress: 0,
      showProgress: false
    }
  },
  mutations: {
    TOGGLE_SIDEBAR: state => {
      if (state.sidebar.opened) {
        Cookies.set('sidebarStatus', 1)
      } else {
        Cookies.set('sidebarStatus', 0)
      }
      state.sidebar.opened = !state.sidebar.opened
    },
    CLOSE_SIDEBAR: (state, withoutAnimation) => {
      Cookies.set('sidebarStatus', 1)
      state.sidebar.opened = false
      state.sidebar.withoutAnimation = withoutAnimation
    },
    TOGGLE_DEVICE: (state, device) => {
      state.device = device
    },
    // 路由加载状态mutations
    SET_ROUTE_LOADING: (state, { loading, routeName, progress, error }) => {
      state.routeLoading = {
        loading: loading !== undefined ? loading : state.routeLoading.loading,
        routeName: routeName !== undefined ? routeName : state.routeLoading.routeName,
        progress: progress !== undefined ? progress : state.routeLoading.progress,
        error: error !== undefined ? error : state.routeLoading.error
      }
    },
    HIDE_ROUTE_LOADING: (state) => {
      state.routeLoading = {
        loading: false,
        routeName: '',
        progress: 0,
        error: false
      }
    },
    // 全局加载状态mutations
    SET_GLOBAL_LOADING: (state, { visible, text, progress, showProgress }) => {
      state.globalLoading = {
        visible: visible !== undefined ? visible : state.globalLoading.visible,
        text: text !== undefined ? text : state.globalLoading.text,
        progress: progress !== undefined ? progress : state.globalLoading.progress,
        showProgress: showProgress !== undefined ? showProgress : state.globalLoading.showProgress
      }
    }
  },
  actions: {
    ToggleSideBar: ({ commit }) => {
      commit('TOGGLE_SIDEBAR')
    },
    CloseSideBar({ commit }, { withoutAnimation }) {
      commit('CLOSE_SIDEBAR', withoutAnimation)
    },
    ToggleDevice({ commit }, device) {
      commit('TOGGLE_DEVICE', device)
    },
    // 路由加载状态actions
    setRouteLoading({ commit }, payload) {
      commit('SET_ROUTE_LOADING', payload)
    },
    hideRouteLoading({ commit }) {
      commit('HIDE_ROUTE_LOADING')
    },
    // 全局加载状态actions
    setGlobalLoading({ commit }, payload) {
      commit('SET_GLOBAL_LOADING', payload)
    }
  }
}

export default app
