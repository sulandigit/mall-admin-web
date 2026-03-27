import { defineStore } from 'pinia'
import Cookies from 'js-cookie'

interface AppState {
  sidebar: {
    opened: boolean
    withoutAnimation: boolean
  }
  device: string
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    sidebar: {
      opened: !+Cookies.get('sidebarStatus'),
      withoutAnimation: false
    },
    device: 'desktop'
  }),

  getters: {
    sidebarOpened: (state) => state.sidebar.opened,
    deviceType: (state) => state.device
  },

  actions: {
    toggleSidebar() {
      if (this.sidebar.opened) {
        Cookies.set('sidebarStatus', '1')
      } else {
        Cookies.set('sidebarStatus', '0')
      }
      this.sidebar.opened = !this.sidebar.opened
      this.sidebar.withoutAnimation = false
    },

    closeSidebar(withoutAnimation: boolean = false) {
      Cookies.set('sidebarStatus', '1')
      this.sidebar.opened = false
      this.sidebar.withoutAnimation = withoutAnimation
    },

    toggleDevice(device: string) {
      this.device = device
    }
  }
})