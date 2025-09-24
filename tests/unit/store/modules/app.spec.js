import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import app from '@/store/modules/app'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('store/app.js', () => {
  let store
  
  beforeEach(() => {
    // 清除localStorage
    localStorage.clear()
    
    store = new Vuex.Store({
      modules: {
        app: {
          namespaced: true,
          ...app
        }
      }
    })
  })
  
  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const state = store.state.app
      
      expect(state.sidebar).toBeDefined()
      expect(state.device).toBe('desktop')
      expect(state.language).toBe('zh-CN')
      expect(state.theme).toBe('default')
      expect(state.loading).toBe(false)
      expect(state.size).toBe('medium')
    })
  })
  
  describe('mutations', () => {
    it('TOGGLE_SIDEBAR 应该切换侧边栏状态', () => {
      const initialOpened = store.state.app.sidebar.opened
      
      store.commit('app/TOGGLE_SIDEBAR')
      
      expect(store.state.app.sidebar.opened).toBe(!initialOpened)
    })
    
    it('CLOSE_SIDEBAR 应该关闭侧边栏', () => {
      store.commit('app/CLOSE_SIDEBAR', true)
      
      expect(store.state.app.sidebar.opened).toBe(false)
      expect(store.state.app.sidebar.withoutAnimation).toBe(true)
    })
    
    it('TOGGLE_DEVICE 应该设置设备类型', () => {
      store.commit('app/TOGGLE_DEVICE', 'mobile')
      
      expect(store.state.app.device).toBe('mobile')
    })
    
    it('SET_LANGUAGE 应该设置语言并持久化', () => {
      store.commit('app/SET_LANGUAGE', 'en-US')
      
      expect(store.state.app.language).toBe('en-US')
      expect(localStorage.getItem('language')).toBe('en-US')
    })
    
    it('SET_THEME 应该设置主题并持久化', () => {
      store.commit('app/SET_THEME', 'dark')
      
      expect(store.state.app.theme).toBe('dark')
      expect(localStorage.getItem('theme')).toBe('dark')
    })
    
    it('SET_LOADING 应该设置加载状态', () => {
      store.commit('app/SET_LOADING', true)
      
      expect(store.state.app.loading).toBe(true)
    })
    
    it('SET_SIZE 应该设置尺寸并持久化', () => {
      store.commit('app/SET_SIZE', 'large')
      
      expect(store.state.app.size).toBe('large')
      expect(localStorage.getItem('size')).toBe('large')
    })
  })
  
  describe('actions', () => {
    it('toggleSideBar 应该提交 TOGGLE_SIDEBAR mutation', async () => {
      const spy = jest.spyOn(store, 'commit')
      
      await store.dispatch('app/toggleSideBar')
      
      expect(spy).toHaveBeenCalledWith('app/TOGGLE_SIDEBAR')
    })
    
    it('closeSideBar 应该提交 CLOSE_SIDEBAR mutation', async () => {
      const spy = jest.spyOn(store, 'commit')
      
      await store.dispatch('app/closeSideBar', { withoutAnimation: true })
      
      expect(spy).toHaveBeenCalledWith('app/CLOSE_SIDEBAR', true)
    })
    
    it('setLanguage 应该提交 SET_LANGUAGE mutation', async () => {
      const spy = jest.spyOn(store, 'commit')
      
      await store.dispatch('app/setLanguage', 'en-US')
      
      expect(spy).toHaveBeenCalledWith('app/SET_LANGUAGE', 'en-US')
    })
  })
  
  describe('getters', () => {
    it('应该正确返回 getter 值', () => {
      expect(store.getters['app/sidebar']).toEqual(store.state.app.sidebar)
      expect(store.getters['app/device']).toBe(store.state.app.device)
      expect(store.getters['app/language']).toBe(store.state.app.language)
      expect(store.getters['app/theme']).toBe(store.state.app.theme)
      expect(store.getters['app/loading']).toBe(store.state.app.loading)
      expect(store.getters['app/size']).toBe(store.state.app.size)
    })
    
    it('isMobile 应该正确判断是否为移动设备', () => {
      store.commit('app/TOGGLE_DEVICE', 'mobile')
      expect(store.getters['app/isMobile']).toBe(true)
      
      store.commit('app/TOGGLE_DEVICE', 'desktop')
      expect(store.getters['app/isMobile']).toBe(false)
    })
    
    it('isDesktop 应该正确判断是否为桌面设备', () => {
      store.commit('app/TOGGLE_DEVICE', 'desktop')
      expect(store.getters['app/isDesktop']).toBe(true)
      
      store.commit('app/TOGGLE_DEVICE', 'mobile')
      expect(store.getters['app/isDesktop']).toBe(false)
    })
  })
  
  describe('持久化测试', () => {
    it('应该从 localStorage 恢复语言设置', () => {
      localStorage.setItem('language', 'en-US')
      
      // 重新创建store实例
      const newStore = new Vuex.Store({
        modules: {
          app: {
            namespaced: true,
            ...app
          }
        }
      })
      
      expect(newStore.state.app.language).toBe('en-US')
    })
    
    it('应该从 localStorage 恢复主题设置', () => {
      localStorage.setItem('theme', 'dark')
      
      const newStore = new Vuex.Store({
        modules: {
          app: {
            namespaced: true,
            ...app
          }
        }
      })
      
      expect(newStore.state.app.theme).toBe('dark')
    })
  })
})