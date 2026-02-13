import { shallowReactive, shallowRef } from 'vue'

// 缓存配置
const CACHE_CONFIG = {
  // API响应缓存时间（毫秒）
  API_CACHE_DURATION: 5 * 60 * 1000, // 5分钟
  // 计算结果缓存时间
  COMPUTED_CACHE_DURATION: 2 * 60 * 1000, // 2分钟
  // 页面状态缓存时间
  PAGE_CACHE_DURATION: 10 * 60 * 1000, // 10分钟
  // 最大缓存条目数
  MAX_CACHE_ENTRIES: 100
}

const state = () => ({
  // API响应缓存
  apiCache: shallowRef(new Map()),
  
  // 计算结果缓存
  computedCache: shallowRef(new Map()),
  
  // 页面状态缓存  
  pageCache: shallowRef(new Map()),
  
  // 缓存统计
  cacheStats: shallowReactive({
    apiHits: 0,
    apiMisses: 0,
    computedHits: 0,
    computedMisses: 0,
    pageHits: 0,
    pageMisses: 0,
    totalSize: 0
  }),
  
  // 预加载队列
  preloadQueue: shallowRef([]),
  
  // 批量操作队列
  batchQueue: shallowReactive({
    operations: [],
    isProcessing: false,
    lastProcessTime: null
  })
})

const mutations = {
  // 设置API缓存
  SET_API_CACHE(state, { key, data, timestamp }) {
    const cache = new Map(state.apiCache.value)
    cache.set(key, {
      data,
      timestamp: timestamp || Date.now(),
      expires: Date.now() + CACHE_CONFIG.API_CACHE_DURATION
    })
    
    // 清理过期缓存
    if (cache.size > CACHE_CONFIG.MAX_CACHE_ENTRIES) {
      const entries = Array.from(cache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      cache.delete(entries[0][0])
    }
    
    state.apiCache.value = cache
    state.cacheStats.totalSize = cache.size
  },
  
  // 设置计算结果缓存
  SET_COMPUTED_CACHE(state, { key, result, dependencies }) {
    const cache = new Map(state.computedCache.value)
    cache.set(key, {
      result,
      dependencies,
      timestamp: Date.now(),
      expires: Date.now() + CACHE_CONFIG.COMPUTED_CACHE_DURATION
    })
    
    state.computedCache.value = cache
  },
  
  // 设置页面状态缓存
  SET_PAGE_CACHE(state, { key, pageState }) {
    const cache = new Map(state.pageCache.value)
    cache.set(key, {
      pageState,
      timestamp: Date.now(),
      expires: Date.now() + CACHE_CONFIG.PAGE_CACHE_DURATION
    })
    
    state.pageCache.value = cache
  },
  
  // 清理过期缓存
  CLEANUP_EXPIRED_CACHE(state) {
    const now = Date.now()
    
    // 清理API缓存
    const apiCache = new Map()
    for (const [key, value] of state.apiCache.value.entries()) {
      if (value.expires > now) {
        apiCache.set(key, value)
      }
    }
    state.apiCache.value = apiCache
    
    // 清理计算结果缓存
    const computedCache = new Map()
    for (const [key, value] of state.computedCache.value.entries()) {
      if (value.expires > now) {
        computedCache.set(key, value)
      }
    }
    state.computedCache.value = computedCache
    
    // 清理页面状态缓存
    const pageCache = new Map()
    for (const [key, value] of state.pageCache.value.entries()) {
      if (value.expires > now) {
        pageCache.set(key, value)
      }
    }
    state.pageCache.value = pageCache
    
    state.cacheStats.totalSize = apiCache.size + computedCache.size + pageCache.size
  },
  
  // 更新缓存统计
  UPDATE_CACHE_STATS(state, { type, hit }) {
    if (hit) {
      state.cacheStats[`${type}Hits`]++
    } else {
      state.cacheStats[`${type}Misses`]++
    }
  },
  
  // 添加预加载任务
  ADD_PRELOAD_TASK(state, task) {
    const queue = [...state.preloadQueue.value]
    if (!queue.find(t => t.key === task.key)) {
      queue.push(task)
      state.preloadQueue.value = queue
    }
  },
  
  // 移除预加载任务
  REMOVE_PRELOAD_TASK(state, taskKey) {
    const queue = state.preloadQueue.value.filter(task => task.key !== taskKey)
    state.preloadQueue.value = queue
  },
  
  // 添加批量操作
  ADD_BATCH_OPERATION(state, operation) {
    state.batchQueue.operations.push({
      ...operation,
      timestamp: Date.now()
    })
  },
  
  // 清空批量操作队列
  CLEAR_BATCH_QUEUE(state) {
    state.batchQueue.operations = []
    state.batchQueue.lastProcessTime = Date.now()
  },
  
  // 设置批量处理状态
  SET_BATCH_PROCESSING(state, isProcessing) {
    state.batchQueue.isProcessing = isProcessing
  },
  
  // 清空所有缓存
  CLEAR_ALL_CACHE(state) {
    state.apiCache.value = new Map()
    state.computedCache.value = new Map()
    state.pageCache.value = new Map()
    state.cacheStats.totalSize = 0
  }
}

const actions = {
  // 获取或设置API缓存
  async getOrSetApiCache({ commit, state }, { key, apiCall, forceRefresh = false }) {
    const cache = state.apiCache.value.get(key)
    
    // 检查缓存是否有效
    if (!forceRefresh && cache && cache.expires > Date.now()) {
      commit('UPDATE_CACHE_STATS', { type: 'api', hit: true })
      return cache.data
    }
    
    commit('UPDATE_CACHE_STATS', { type: 'api', hit: false })
    
    try {
      const data = await apiCall()
      commit('SET_API_CACHE', { key, data })
      return data
    } catch (error) {
      // 如果API调用失败，返回过期的缓存数据（如果有的话）
      if (cache) {
        return cache.data
      }
      throw error
    }
  },
  
  // 获取计算结果缓存
  getComputedCache({ commit, state }, { key, computeFn, dependencies }) {
    const cache = state.computedCache.value.get(key)
    
    // 检查缓存是否有效且依赖未变化
    if (cache && cache.expires > Date.now()) {
      const depsChanged = dependencies.some((dep, index) => 
        dep !== cache.dependencies[index]
      )
      
      if (!depsChanged) {
        commit('UPDATE_CACHE_STATS', { type: 'computed', hit: true })
        return cache.result
      }
    }
    
    commit('UPDATE_CACHE_STATS', { type: 'computed', hit: false })
    
    const result = computeFn()
    commit('SET_COMPUTED_CACHE', { key, result, dependencies })
    return result
  },
  
  // 保存页面状态
  savePageState({ commit }, { key, pageState }) {
    commit('SET_PAGE_CACHE', { key, pageState })
  },
  
  // 恢复页面状态
  restorePageState({ commit, state }, key) {
    const cache = state.pageCache.value.get(key)
    
    if (cache && cache.expires > Date.now()) {
      commit('UPDATE_CACHE_STATS', { type: 'page', hit: true })
      return cache.pageState
    }
    
    commit('UPDATE_CACHE_STATS', { type: 'page', hit: false })
    return null
  },
  
  // 预加载资源
  preloadResource({ commit, dispatch }, { key, apiCall, priority = 1 }) {
    commit('ADD_PRELOAD_TASK', { key, apiCall, priority })
    
    // 异步执行预加载
    setTimeout(async () => {
      try {
        await dispatch('getOrSetApiCache', { key, apiCall })
        commit('REMOVE_PRELOAD_TASK', key)
      } catch (error) {
        commit('REMOVE_PRELOAD_TASK', key)
        console.warn(`预加载失败: ${key}`, error)
      }
    }, 100)
  },
  
  // 添加批量操作
  addBatchOperation({ commit, dispatch }, operation) {
    commit('ADD_BATCH_OPERATION', operation)
    
    // 如果队列中有操作且不在处理中，延迟处理
    setTimeout(() => {
      dispatch('processBatchQueue')
    }, 200)
  },
  
  // 处理批量操作队列
  async processBatchQueue({ commit, state }) {
    if (state.batchQueue.isProcessing || state.batchQueue.operations.length === 0) {
      return
    }
    
    commit('SET_BATCH_PROCESSING', true)
    
    try {
      const operations = [...state.batchQueue.operations]
      commit('CLEAR_BATCH_QUEUE')
      
      // 按类型分组操作
      const groupedOps = operations.reduce((groups, op) => {
        if (!groups[op.type]) {
          groups[op.type] = []
        }
        groups[op.type].push(op)
        return groups
      }, {})
      
      // 并行处理同类型操作
      await Promise.all(
        Object.entries(groupedOps).map(async ([type, ops]) => {
          try {
            if (type === 'statusUpdate') {
              await this.processBatchStatusUpdate(ops)
            }
            // 其他批量操作类型...
          } catch (error) {
            console.error(`批量操作失败: ${type}`, error)
          }
        })
      )
    } finally {
      commit('SET_BATCH_PROCESSING', false)
    }
  },
  
  // 清理过期缓存
  cleanupCache({ commit }) {
    commit('CLEANUP_EXPIRED_CACHE')
  },
  
  // 清空所有缓存
  clearAllCache({ commit }) {
    commit('CLEAR_ALL_CACHE')
  }
}

const getters = {
  // 获取缓存统计
  cacheStats: state => state.cacheStats,
  
  // 获取缓存命中率
  cacheHitRate: state => {
    const totalHits = state.cacheStats.apiHits + state.cacheStats.computedHits + state.cacheStats.pageHits
    const totalMisses = state.cacheStats.apiMisses + state.cacheStats.computedMisses + state.cacheStats.pageMisses
    const total = totalHits + totalMisses
    return total > 0 ? (totalHits / total * 100).toFixed(2) : 0
  },
  
  // 是否有待处理的批量操作
  hasPendingBatchOps: state => state.batchQueue.operations.length > 0,
  
  // 批量操作队列长度
  batchQueueLength: state => state.batchQueue.operations.length,
  
  // 是否正在处理批量操作
  isBatchProcessing: state => state.batchQueue.isProcessing,
  
  // 预加载队列长度
  preloadQueueLength: state => state.preloadQueue.value.length
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}