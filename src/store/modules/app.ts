import Cookies from 'js-cookie'
import { AppState, StoreContext, RootState, MutationType, ActionType } from '@/types/store'

// 初始状态
const state: AppState = {
  sidebar: {
    opened: !+Cookies.get('sidebarStatus')!,
    withoutAnimation: false
  },
  device: 'desktop',
  language: 'zh',
  size: 'medium'
}

// Mutations
const mutations = {
  [MutationType.TOGGLE_SIDEBAR]: (state: AppState) => {
    if (state.sidebar.opened) {
      Cookies.set('sidebarStatus', '1')
    } else {
      Cookies.set('sidebarStatus', '0')
    }
    state.sidebar.opened = !state.sidebar.opened
  },
  [MutationType.CLOSE_SIDEBAR]: (state: AppState, withoutAnimation: boolean) => {
    Cookies.set('sidebarStatus', '1')
    state.sidebar.opened = false
    state.sidebar.withoutAnimation = withoutAnimation
  },
  [MutationType.TOGGLE_DEVICE]: (state: AppState, device: 'desktop' | 'mobile') => {
    state.device = device
  },
  [MutationType.SET_LANGUAGE]: (state: AppState, language: string) => {
    state.language = language
  },
  [MutationType.SET_SIZE]: (state: AppState, size: string) => {
    state.size = size
  }
}

// Actions
const actions = {
  [ActionType.TOGGLE_SIDE_BAR]: ({ commit }: StoreContext<AppState, RootState>) => {
    commit(MutationType.TOGGLE_SIDEBAR)
  },
  [ActionType.CLOSE_SIDE_BAR]: ({ commit }: StoreContext<AppState, RootState>, { withoutAnimation }: { withoutAnimation: boolean }) => {
    commit(MutationType.CLOSE_SIDEBAR, withoutAnimation)
  },
  [ActionType.TOGGLE_DEVICE]: ({ commit }: StoreContext<AppState, RootState>, device: 'desktop' | 'mobile') => {
    commit(MutationType.TOGGLE_DEVICE, device)
  },
  [ActionType.SET_LANGUAGE]: ({ commit }: StoreContext<AppState, RootState>, language: string) => {
    commit(MutationType.SET_LANGUAGE, language)
  },
  [ActionType.SET_SIZE]: ({ commit }: StoreContext<AppState, RootState>, size: string) => {
    commit(MutationType.SET_SIZE, size)
  }
}

const app = {
  state,
  mutations,
  actions
}

export default app
