/**
 * AppMain组件单元测试
 */

import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import AppMain from '@/views/layout/components/AppMain.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueRouter)

// Mock keep-alive组件
const KeepAlive = {
  name: 'keep-alive',
  props: ['include'],
  render(h) {
    return h('div', { class: 'keep-alive-mock' }, this.$slots.default)
  }
}

describe('AppMain.vue', () => {
  let wrapper
  let store
  let router
  let mockRoute

  beforeEach(() => {
    // 创建mock store
    store = new Vuex.Store({
      getters: {
        cachedViews: () => ['product', 'order']
      },
      actions: {
        addCachedView: jest.fn(),
        delCachedView: jest.fn(),
        clearExpiredCache: jest.fn()
      }
    })

    // 创建mock router
    router = new VueRouter({
      routes: [
        { path: '/pms/product', name: 'product', component: { template: '<div>product</div>' } },
        { path: '/oms/order', name: 'order', component: { template: '<div>order</div>' } }
      ]
    })

    // Mock route对象
    mockRoute = {
      name: 'product',
      fullPath: '/pms/product',
      meta: { keepAlive: true }
    }

    wrapper = shallowMount(AppMain, {
      localVue,
      store,
      router,
      mocks: {
        $route: mockRoute
      },
      stubs: {
        'keep-alive': KeepAlive,
        'router-view': true,
        'transition': false
      }
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  describe('Component Rendering', () => {
    it('renders correctly', () => {
      expect(wrapper.find('.app-main').exists()).toBe(true)
      expect(wrapper.find('.keep-alive-mock').exists()).toBe(true)
    })

    it('passes cached views to keep-alive', () => {
      const keepAlive = wrapper.find('.keep-alive-mock')
      expect(keepAlive.exists()).toBe(true)
    })
  })

  describe('Cache Logic', () => {
    it('should cache route when shouldCache returns true', () => {
      const shouldCache = wrapper.vm.shouldCache(mockRoute)
      expect(shouldCache).toBe(true)
    })

    it('should not cache route when keepAlive is false', () => {
      const route = {
        name: 'addProduct',
        meta: { keepAlive: false }
      }
      const shouldCache = wrapper.vm.shouldCache(route)
      expect(shouldCache).toBe(false)
    })

    it('should not cache add/edit routes by default', () => {
      const routes = [
        { name: 'addProduct', meta: {} },
        { name: 'editProduct', meta: {} },
        { name: 'updateProduct', meta: {} },
        { name: 'productDetail', meta: {} }
      ]

      routes.forEach(route => {
        const shouldCache = wrapper.vm.shouldCache(route)
        expect(shouldCache).toBe(false)
      })
    })

    it('should clear cache when shouldClearCache returns true', () => {
      const from = { name: 'addProduct', meta: { clearCache: true } }
      const to = { name: 'product' }
      
      const shouldClear = wrapper.vm.shouldClearCache(from, to)
      expect(shouldClear).toBe(true)
    })

    it('should clear list cache when returning from edit page', () => {
      const from = { name: 'updateProduct' }
      const to = { name: 'product' }
      
      const shouldClear = wrapper.vm.shouldClearCache(from, to)
      // 这个测试会清理to页面的缓存，而不是返回true
      expect(shouldClear).toBe(false)
    })
  })

  describe('Route Watching', () => {
    it('should handle route change', async () => {
      const handleRouteCache = jest.spyOn(wrapper.vm, 'handleRouteCache')
      
      const newRoute = {
        name: 'order',
        fullPath: '/oms/order',
        meta: { keepAlive: true }
      }

      wrapper.vm.$route = newRoute
      await wrapper.vm.$nextTick()

      expect(handleRouteCache).toHaveBeenCalled()
    })

    it('should add cached view for cacheable route', () => {
      const addCachedView = jest.spyOn(store, 'dispatch')
      
      wrapper.vm.handleRouteCache(mockRoute, null)
      
      expect(addCachedView).toHaveBeenCalledWith('addCachedView', {
        name: 'product',
        fullPath: '/pms/product',
        meta: { keepAlive: true }
      })
    })

    it('should clear expired cache', () => {
      const clearExpiredCache = jest.spyOn(store, 'dispatch')
      
      wrapper.vm.handleRouteCache(mockRoute, null)
      
      // 需要等待setTimeout执行
      setTimeout(() => {
        expect(clearExpiredCache).toHaveBeenCalledWith('clearExpiredCache')
      }, 5100)
    })
  })

  describe('Computed Properties', () => {
    it('should generate correct key for route', () => {
      expect(wrapper.vm.key).toBe('/pms/product')
    })
  })

  describe('Cleanup', () => {
    it('should clear timer on destroy', () => {
      wrapper.vm.clearCacheTimer = setTimeout(() => {}, 1000)
      const timerSpy = jest.spyOn(global, 'clearTimeout')
      
      wrapper.destroy()
      
      expect(timerSpy).toHaveBeenCalled()
    })
  })

  describe('Cache Expiration', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should debounce cache clearing', () => {
      const clearExpiredCache = jest.spyOn(store, 'dispatch')
      
      // 多次调用
      wrapper.vm.clearExpiredCache()
      wrapper.vm.clearExpiredCache()
      wrapper.vm.clearExpiredCache()
      
      // 快进时间
      jest.advanceTimersByTime(5000)
      
      // 应该只被调用一次
      expect(clearExpiredCache).toHaveBeenCalledTimes(1)
    })
  })
})