/**
 * 缓存视图混入单元测试
 */

import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import CacheViewMixin from '@/mixins/cacheView'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueRouter)

// 创建测试组件
const TestComponent = {
  name: 'TestComponent',
  mixins: [CacheViewMixin],
  template: '<div>Test Component</div>',
  data() {
    return {
      listQuery: { page: 1, size: 10 },
      multipleSelection: []
    }
  },
  methods: {
    getList() {
      return Promise.resolve()
    },
    initData() {
      this.getList()
    }
  }
}

describe('CacheViewMixin', () => {
  let wrapper
  let store
  let router
  let mockRoute

  beforeEach(() => {
    // 创建mock store
    store = new Vuex.Store({
      state: {
        cache: {
          cacheConfig: {
            defaultTimeout: 30 * 60 * 1000
          }
        }
      },
      getters: {
        isCached: () => (name) => name === 'product'
      },
      actions: {
        addCachedView: jest.fn(),
        delCachedView: jest.fn(),
        refreshCache: jest.fn()
      }
    })

    // 创建mock router
    router = new VueRouter({
      routes: [
        { path: '/pms/product', name: 'product', component: TestComponent }
      ]
    })

    // Mock route对象
    mockRoute = {
      name: 'product',
      fullPath: '/pms/product',
      meta: { 
        keepAlive: true,
        refreshOnActivated: false,
        cacheTimeout: 15 * 60 * 1000
      }
    }

    // Mock sessionStorage
    const mockSessionStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn()
    }
    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage
    })

    wrapper = shallowMount(TestComponent, {
      localVue,
      store,
      router,
      mocks: {
        $route: mockRoute
      }
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  describe('Lifecycle Hooks', () => {
    it('should set cache created time on created', () => {
      expect(wrapper.vm.cacheStatus.cacheCreatedTime).toBeDefined()
      expect(typeof wrapper.vm.cacheStatus.cacheCreatedTime).toBe('number')
    })

    it('should call handleCacheCreated on created', () => {
      const handleCacheCreated = jest.spyOn(wrapper.vm, 'handleCacheCreated')
      wrapper.vm.$options.created[1].call(wrapper.vm) // 调用mixin的created钩子
      expect(handleCacheCreated).toHaveBeenCalled()
    })

    it('should handle cache activation', () => {
      const handleCacheActivated = jest.spyOn(wrapper.vm, 'handleCacheActivated')
      
      // 模拟activated钩子
      if (wrapper.vm.$options.activated) {
        wrapper.vm.$options.activated[0].call(wrapper.vm)
      }
      
      expect(wrapper.vm.cacheStatus.isFromCache).toBe(true)
      expect(wrapper.vm.cacheStatus.lastActivatedTime).toBeDefined()
    })

    it('should handle cache deactivation', () => {
      const handleCacheDeactivated = jest.spyOn(wrapper.vm, 'handleCacheDeactivated')
      
      // 模拟deactivated钩子
      if (wrapper.vm.$options.deactivated) {
        wrapper.vm.$options.deactivated[0].call(wrapper.vm)
      }
      
      expect(handleCacheDeactivated).toHaveBeenCalled()
    })
  })

  describe('Cache Configuration', () => {
    it('should get cache timeout from route meta', () => {
      const timeout = wrapper.vm.getCacheTimeout()
      expect(timeout).toBe(15 * 60 * 1000)
    })

    it('should use global timeout if route meta not set', () => {
      wrapper.vm.$route.meta.cacheTimeout = undefined
      const timeout = wrapper.vm.getCacheTimeout()
      expect(timeout).toBe(30 * 60 * 1000)
    })

    it('should determine if refresh needed on activation', () => {
      // 设置refreshOnActivated为true
      wrapper.vm.$route.meta.refreshOnActivated = true
      expect(wrapper.vm.shouldRefreshOnActivated()).toBe(true)

      // 设置为false但缓存过期
      wrapper.vm.$route.meta.refreshOnActivated = false
      wrapper.vm.cacheStatus.cacheCreatedTime = Date.now() - 20 * 60 * 1000 // 20分钟前
      expect(wrapper.vm.shouldRefreshOnActivated()).toBe(true)
    })
  })

  describe('Data Refresh', () => {
    it('should call getList method for refresh', () => {
      const getList = jest.spyOn(wrapper.vm, 'getList')
      wrapper.vm.refreshData()
      expect(getList).toHaveBeenCalled()
    })

    it('should handle refresh on activation when needed', async () => {
      const refreshData = jest.spyOn(wrapper.vm, 'refreshData')
      const shouldRefresh = jest.spyOn(wrapper.vm, 'shouldRefreshOnActivated').mockReturnValue(true)
      
      wrapper.vm.handleCacheActivated()
      
      expect(refreshData).toHaveBeenCalled()
    })
  })

  describe('State Management', () => {
    it('should save page state to sessionStorage', () => {
      wrapper.vm.listQuery = { page: 2, keyword: 'test' }
      wrapper.vm.multipleSelection = [{ id: 1 }]
      
      wrapper.vm.savePageState()
      
      expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
        'cache_state_product',
        expect.stringContaining('"searchForm"')
      )
    })

    it('should restore page state from sessionStorage', () => {
      const mockState = {
        scrollTop: 100,
        searchForm: { page: 2, keyword: 'test' },
        selectedItems: [{ id: 1 }]
      }
      
      window.sessionStorage.getItem.mockReturnValue(JSON.stringify(mockState))
      
      wrapper.vm.restorePageState()
      
      expect(wrapper.vm.listQuery.page).toBe(2)
      expect(wrapper.vm.listQuery.keyword).toBe('test')
    })

    it('should handle sessionStorage errors gracefully', () => {
      window.sessionStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })
      
      // 应该不抛出错误
      expect(() => {
        wrapper.vm.savePageState()
      }).not.toThrow()
    })
  })

  describe('Cleanup', () => {
    it('should clean up temp data', () => {
      wrapper.vm.timer = setTimeout(() => {}, 1000)
      wrapper.vm.interval = setInterval(() => {}, 1000)
      
      const clearTimeout = jest.spyOn(global, 'clearTimeout')
      const clearInterval = jest.spyOn(global, 'clearInterval')
      
      wrapper.vm.cleanupTempData()
      
      expect(clearTimeout).toHaveBeenCalled()
      expect(clearInterval).toHaveBeenCalled()
      expect(wrapper.vm.timer).toBeNull()
      expect(wrapper.vm.interval).toBeNull()
    })

    it('should cleanup on destroy', () => {
      const cleanup = jest.spyOn(wrapper.vm, 'cleanup')
      
      // 模拟beforeDestroy钩子
      if (wrapper.vm.$options.beforeDestroy) {
        wrapper.vm.$options.beforeDestroy[0].call(wrapper.vm)
      }
      
      expect(cleanup).toHaveBeenCalled()
    })

    it('should remove state from sessionStorage on cleanup', () => {
      wrapper.vm.cleanup()
      
      expect(window.sessionStorage.removeItem).toHaveBeenCalledWith('cache_state_product')
    })
  })

  describe('Cache Control', () => {
    it('should clear current cache', () => {
      const delCachedView = jest.spyOn(store, 'dispatch')
      
      wrapper.vm.clearCurrentCache()
      
      expect(delCachedView).toHaveBeenCalledWith('delCachedView', 'product')
    })

    it('should refresh current cache', async () => {
      const refreshCache = jest.spyOn(store, 'dispatch').mockResolvedValue()
      const refreshData = jest.spyOn(wrapper.vm, 'refreshData')
      
      await wrapper.vm.refreshCurrentCache()
      
      expect(refreshCache).toHaveBeenCalledWith('refreshCache', 'product')
      expect(refreshData).toHaveBeenCalled()
    })
  })

  describe('Computed Properties', () => {
    it('should compute if cached', () => {
      expect(wrapper.vm.isCached).toBe(true)
    })

    it('should compute cache age', () => {
      wrapper.vm.cacheStatus.cacheCreatedTime = Date.now() - 5000
      expect(wrapper.vm.cacheAge).toBeGreaterThan(4000)
      expect(wrapper.vm.cacheAge).toBeLessThan(6000)
    })

    it('should compute if cache expired', () => {
      wrapper.vm.cacheStatus.cacheCreatedTime = Date.now() - 20 * 60 * 1000 // 20分钟前
      expect(wrapper.vm.isCacheExpired).toBe(true)
    })
  })

  describe('Utility Methods', () => {
    it('should get cache info', () => {
      const info = wrapper.vm.getCacheInfo()
      
      expect(info).toHaveProperty('routeName', 'product')
      expect(info).toHaveProperty('cacheTimeout')
      expect(info).toHaveProperty('isCached')
    })

    it('should get scroll element', () => {
      // Mock DOM elements
      const mockElement = document.createElement('div')
      jest.spyOn(document, 'querySelector').mockReturnValue(mockElement)
      
      const element = wrapper.vm.getScrollElement()
      expect(element).toBe(mockElement)
    })
  })
})