import Cookies from 'js-cookie'
import { DEVICE_TYPE } from '@/utils/device'

const app = {
  state: {
    sidebar: {
      opened: !+Cookies.get('sidebarStatus'),
      withoutAnimation: false
    },
    device: DEVICE_TYPE.DESKTOP,
    viewport: {
      width: 0,
      height: 0,
      orientation: 'landscape'
    },
    interaction: {
      touchSupported: false,
      gestureEnabled: true,
      keyboardVisible: false,
      currentBreakpoint: 'desktop'
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
    OPEN_SIDEBAR: (state, withoutAnimation) => {
      Cookies.set('sidebarStatus', 0)
      state.sidebar.opened = true
      state.sidebar.withoutAnimation = withoutAnimation
    },
    UPDATE_DEVICE: (state, device) => {
      state.device = device
    },
    UPDATE_VIEWPORT: (state, viewport) => {
      state.viewport = { ...state.viewport, ...viewport }
    },
    UPDATE_INTERACTION: (state, interaction) => {
      state.interaction = { ...state.interaction, ...interaction }
    },
    SET_KEYBOARD_VISIBLE: (state, visible) => {
      state.interaction.keyboardVisible = visible
    },
    SET_GESTURE_ENABLED: (state, enabled) => {
      state.interaction.gestureEnabled = enabled
    }
  },
  actions: {
    ToggleSideBar: ({ commit }) => {
      commit('TOGGLE_SIDEBAR')
    },
    CloseSideBar({ commit }, { withoutAnimation }) {
      commit('CLOSE_SIDEBAR', withoutAnimation)
    },
    OpenSideBar({ commit }, { withoutAnimation }) {
      commit('OPEN_SIDEBAR', withoutAnimation)
    },
    UpdateDevice({ commit }, device) {
      commit('UPDATE_DEVICE', device)
    },
    UpdateViewport({ commit }, viewport) {
      commit('UPDATE_VIEWPORT', viewport)
    },
    UpdateInteraction({ commit }, interaction) {
      commit('UPDATE_INTERACTION', interaction)
    },
    SetKeyboardVisible({ commit }, visible) {
      commit('SET_KEYBOARD_VISIBLE', visible)
    },
    SetGestureEnabled({ commit }, enabled) {
      commit('SET_GESTURE_ENABLED', enabled)
    },
    // 兼容旧的API
    ToggleDevice({ commit }, device) {
      commit('UPDATE_DEVICE', device)
    }
  }
}

export default app
