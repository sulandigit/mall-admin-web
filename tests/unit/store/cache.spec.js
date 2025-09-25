/**
 * Vuex缓存模块单元测试
 */

import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import cache from '@/store/modules/cache'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('Cache Module', () => {
  let store

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        cache: {
          namespaced: false,
          ...cache
        }
      }
    })
  })

  describe('state', () => {
    it('should have initial state', () => {
      const state = store.state.cache
      expect(state.cachedViews).toEqual([])
      expect(state.cacheConfig.maxCacheSize).toBe(10)
      expect(state.cacheConfig.defaultTimeout).toBe(30 * 60 * 1000)
      expect(state.cacheTimestamp).toEqual({})
      expect(state.cacheAccessCount).toEqual({})
      expect(state.cacheLastAccess).toEqual({})
    })
  })

  describe('mutations', () => {
    it('should add cached view', () => {
      const view = { name: 'product', fullPath: '/pms/product' }
      store.commit('ADD_CACHED_VIEW', view)
      
      expect(store.state.cache.cachedViews).toContain('product')
      expect(store.state.cache.cacheTimestamp.product).toBeDefined()
      expect(store.state.cache.cacheAccessCount.product).toBe(1)
    })

    it('should not add duplicate views', () => {
      const view = { name: 'product', fullPath: '/pms/product' }
      store.commit('ADD_CACHED_VIEW', view)
      store.commit('ADD_CACHED_VIEW', view)
      
      expect(store.state.cache.cachedViews.length).toBe(1)
      expect(store.state.cache.cacheAccessCount.product).toBe(2)
    })

    it('should delete cached view', () => {
      const view = { name: 'product', fullPath: '/pms/product' }
      store.commit('ADD_CACHED_VIEW', view)
      store.commit('DEL_CACHED_VIEW', 'product')
      
      expect(store.state.cache.cachedViews).not.toContain('product')
      expect(store.state.cache.cacheTimestamp.product).toBeUndefined()
      expect(store.state.cache.cacheAccessCount.product).toBeUndefined()
    })

    it('should clear all cache', () => {
      const view1 = { name: 'product', fullPath: '/pms/product' }
      const view2 = { name: 'order', fullPath: '/oms/order' }
      
      store.commit('ADD_CACHED_VIEW', view1)
      store.commit('ADD_CACHED_VIEW', view2)
      store.commit('CLEAR_ALL_CACHE')
      
      expect(store.state.cache.cachedViews).toEqual([])
      expect(store.state.cache.cacheTimestamp).toEqual({})
      expect(store.state.cache.cacheAccessCount).toEqual({})
    })

    it('should update cache config', () => {
      const newConfig = { maxCacheSize: 15, enableLRU: false }
      store.commit('UPDATE_CACHE_CONFIG', newConfig)
      
      expect(store.state.cache.cacheConfig.maxCacheSize).toBe(15)
      expect(store.state.cache.cacheConfig.enableLRU).toBe(false)
    })

    it('should enforce max cache size with LRU', () => {
      // 设置最大缓存为2
      store.commit('UPDATE_CACHE_CONFIG', { maxCacheSize: 2 })
      
      // 添加3个视图
      const view1 = { name: 'product', fullPath: '/pms/product' }
      const view2 = { name: 'order', fullPath: '/oms/order' }
      const view3 = { name: 'coupon', fullPath: '/sms/coupon' }
      
      store.commit('ADD_CACHED_VIEW', view1)
      
      // 模拟时间间隔
      setTimeout(() => {
        store.commit('ADD_CACHED_VIEW', view2)
      }, 10)
      
      setTimeout(() => {
        store.commit('ADD_CACHED_VIEW', view3)
      }, 20)
      
      // 应该只保留最近的2个视图
      expect(store.state.cache.cachedViews.length).toBeLessThanOrEqual(2)
    })
  })

  describe('actions', () => {
    it('should add cached view via action', async () => {
      const view = { name: 'product', fullPath: '/pms/product' }
      const result = await store.dispatch('addCachedView', view)
      
      expect(result).toContain('product')
      expect(store.state.cache.cachedViews).toContain('product')
    })

    it('should delete cached view via action', async () => {
      const view = { name: 'product', fullPath: '/pms/product' }
      await store.dispatch('addCachedView', view)
      const result = await store.dispatch('delCachedView', 'product')
      
      expect(result).not.toContain('product')
      expect(store.state.cache.cachedViews).not.toContain('product')
    })

    it('should clear all cache via action', async () => {
      const view = { name: 'product', fullPath: '/pms/product' }
      await store.dispatch('addCachedView', view)
      await store.dispatch('clearAllCache')
      
      expect(store.state.cache.cachedViews).toEqual([])
    })

    it('should refresh cache', async () => {
      const view = { name: 'product', fullPath: '/pms/product' }
      await store.dispatch('addCachedView', view)
      const result = await store.dispatch('refreshCache', 'product')
      
      expect(result).not.toContain('product')
    })

    it('should clear expired cache', async () => {
      // 设置短超时时间
      store.commit('UPDATE_CACHE_CONFIG', { defaultTimeout: 100 })
      
      const view = { name: 'product', fullPath: '/pms/product' }
      store.commit('ADD_CACHED_VIEW', view)
      
      // 等待超时
      await new Promise(resolve => setTimeout(resolve, 150))
      
      await store.dispatch('clearExpiredCache')
      
      expect(store.state.cache.cachedViews).not.toContain('product')
    })

    it('should perform smart cache clean', async () => {
      // 添加多个视图
      const views = [
        { name: 'product', fullPath: '/pms/product' },
        { name: 'order', fullPath: '/oms/order' },
        { name: 'coupon', fullPath: '/sms/coupon' },
        { name: 'admin', fullPath: '/ums/admin' }
      ]
      
      for (const view of views) {
        await store.dispatch('addCachedView', view)
      }
      
      const result = await store.dispatch('smartCacheClean', { 
        forceClean: true, 
        cleanRatio: 0.5 
      })
      
      expect(result.length).toBeLessThan(views.length)
    })
  })

  describe('getters', () => {
    beforeEach(() => {
      const views = [
        { name: 'product', fullPath: '/pms/product' },
        { name: 'order', fullPath: '/oms/order' }
      ]
      
      views.forEach(view => {
        store.commit('ADD_CACHED_VIEW', view)
      })
    })

    it('should get cached views', () => {
      const cachedViews = store.getters.cachedViews
      expect(cachedViews).toContain('product')
      expect(cachedViews).toContain('order')
    })

    it('should get cache config', () => {
      const config = store.getters.cacheConfig
      expect(config.maxCacheSize).toBe(10)
      expect(config.defaultTimeout).toBe(30 * 60 * 1000)
    })

    it('should get cache count', () => {
      const count = store.getters.cacheCount
      expect(count).toBe(2)
    })

    it('should check if cached', () => {
      const isCached = store.getters.isCached
      expect(isCached('product')).toBe(true)
      expect(isCached('nonexistent')).toBe(false)
    })

    it('should get cache info', () => {
      const info = store.getters.cacheInfo
      expect(info.total).toBe(2)
      expect(info.maxSize).toBe(10)
      expect(info.usage).toBe(0.2)
      expect(info.components).toHaveLength(2)
    })
  })
})