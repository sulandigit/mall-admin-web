const cache = {
  namespaced: true,
  state: {
    // 本地缓存数据 (localStorage)
    localCache: {},
    
    // 会话缓存数据 (sessionStorage)
    sessionCache: {},
    
    // 内存缓存数据 (运行时缓存)
    memoryCache: {},
    
    // 缓存配置
    cacheConfig: {
      // 默认过期时间 (毫秒)
      defaultExpiry: 30 * 60 * 1000, // 30分钟
      
      // 各类型数据的过期时间配置
      expiryConfig: {
        userInfo: 30 * 60 * 1000,     // 30分钟
        permissions: 60 * 60 * 1000,   // 1小时
        dictionaries: 24 * 60 * 60 * 1000, // 24小时
        productList: 5 * 60 * 1000,    // 5分钟
        categoryList: 10 * 60 * 1000,  // 10分钟
        brandList: 10 * 60 * 1000,     // 10分钟
        orderList: 3 * 60 * 1000,      // 3分钟
        couponList: 5 * 60 * 1000,     // 5分钟
        adminList: 10 * 60 * 1000,     // 10分钟
        roleList: 15 * 60 * 1000       // 15分钟
      },
      
      // 最大缓存数量限制
      maxCacheSize: {
        memory: 100,      // 内存缓存最大条目数
        local: 500,       // 本地缓存最大条目数
        session: 200      // 会话缓存最大条目数
      },
      
      // 自动清理配置
      autoCleanup: {
        enabled: true,
        interval: 5 * 60 * 1000, // 5分钟执行一次清理
        lastCleanup: Date.now()
      }
    },
    
    // 缓存统计信息
    statistics: {
      hits: 0,           // 缓存命中次数
      misses: 0,         // 缓存未命中次数
      sets: 0,           // 缓存设置次数
      deletes: 0,        // 缓存删除次数
      cleanups: 0,       // 清理次数
      totalSize: {       // 总大小统计
        memory: 0,
        local: 0,
        session: 0
      }
    },
    
    // 清理任务状态
    cleanupTaskRunning: false
  },
  
  mutations: {
    // 设置内存缓存
    SET_MEMORY_CACHE: (state, { key, data, expiry }) => {
      const now = Date.now()
      state.memoryCache[key] = {
        data,
        timestamp: now,
        expiry: expiry || (now + state.cacheConfig.defaultExpiry)
      }
      state.statistics.sets++
    },
    
    // 设置本地缓存
    SET_LOCAL_CACHE: (state, { key, data, expiry }) => {
      const now = Date.now()
      const cacheItem = {
        data,
        timestamp: now,
        expiry: expiry || (now + state.cacheConfig.defaultExpiry)
      }
      
      state.localCache[key] = cacheItem
      
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem))
      } catch (error) {
        console.warn('Failed to save to localStorage:', error)
      }
      
      state.statistics.sets++
    },
    
    // 设置会话缓存
    SET_SESSION_CACHE: (state, { key, data, expiry }) => {
      const now = Date.now()
      const cacheItem = {
        data,
        timestamp: now,
        expiry: expiry || (now + state.cacheConfig.defaultExpiry)
      }
      
      state.sessionCache[key] = cacheItem
      
      try {
        sessionStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem))
      } catch (error) {
        console.warn('Failed to save to sessionStorage:', error)
      }
      
      state.statistics.sets++
    },
    
    // 删除内存缓存
    DELETE_MEMORY_CACHE: (state, key) => {
      if (key in state.memoryCache) {
        delete state.memoryCache[key]
        state.statistics.deletes++
      }
    },
    
    // 删除本地缓存
    DELETE_LOCAL_CACHE: (state, key) => {
      if (key in state.localCache) {
        delete state.localCache[key]
        localStorage.removeItem(`cache_${key}`)
        state.statistics.deletes++
      }
    },
    
    // 删除会话缓存
    DELETE_SESSION_CACHE: (state, key) => {
      if (key in state.sessionCache) {
        delete state.sessionCache[key]
        sessionStorage.removeItem(`cache_${key}`)
        state.statistics.deletes++
      }
    },
    
    // 清空所有缓存
    CLEAR_ALL_CACHE: (state) => {
      // 清空内存缓存
      state.memoryCache = {}
      
      // 清空本地缓存
      state.localCache = {}
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key)
        }
      })
      
      // 清空会话缓存
      state.sessionCache = {}
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('cache_')) {
          sessionStorage.removeItem(key)
        }
      })
      
      // 重置统计信息
      state.statistics = {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        cleanups: 0,
        totalSize: {
          memory: 0,
          local: 0,
          session: 0
        }
      }
    },
    
    // 更新缓存配置
    UPDATE_CACHE_CONFIG: (state, config) => {
      state.cacheConfig = { ...state.cacheConfig, ...config }
    },
    
    // 更新统计信息
    UPDATE_STATISTICS: (state, stats) => {
      state.statistics = { ...state.statistics, ...stats }
    },
    
    // 设置清理任务状态
    SET_CLEANUP_TASK_RUNNING: (state, running) => {
      state.cleanupTaskRunning = running
    },
    
    // 初始化缓存数据
    INIT_CACHE_DATA: (state) => {
      // 从localStorage恢复本地缓存
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cache_')) {
          try {
            const cacheKey = key.replace('cache_', '')
            const cacheItem = JSON.parse(localStorage.getItem(key))
            
            // 检查是否已过期
            if (cacheItem.expiry > Date.now()) {
              state.localCache[cacheKey] = cacheItem
            } else {
              // 过期则删除
              localStorage.removeItem(key)
            }
          } catch (error) {
            console.warn('Failed to parse localStorage cache item:', error)
            localStorage.removeItem(key)
          }
        }
      })
      
      // 从sessionStorage恢复会话缓存
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('cache_')) {
          try {
            const cacheKey = key.replace('cache_', '')
            const cacheItem = JSON.parse(sessionStorage.getItem(key))
            
            // 检查是否已过期
            if (cacheItem.expiry > Date.now()) {
              state.sessionCache[cacheKey] = cacheItem
            } else {
              // 过期则删除
              sessionStorage.removeItem(key)
            }
          } catch (error) {
            console.warn('Failed to parse sessionStorage cache item:', error)
            sessionStorage.removeItem(key)
          }
        }
      })
    }
  },
  
  actions: {
    // 初始化缓存
    initCache({ commit }) {
      commit('INIT_CACHE_DATA')
    },
    
    // 设置缓存（自动选择存储类型）
    setCache({ commit, state }, { key, data, type = 'memory', expiry = null }) {
      const now = Date.now()
      let finalExpiry = expiry
      
      // 如果没有指定过期时间，使用配置中的时间
      if (!finalExpiry) {
        finalExpiry = now + (state.cacheConfig.expiryConfig[key] || state.cacheConfig.defaultExpiry)
      }
      
      switch (type) {
        case 'local':
          commit('SET_LOCAL_CACHE', { key, data, expiry: finalExpiry })
          break
        case 'session':
          commit('SET_SESSION_CACHE', { key, data, expiry: finalExpiry })
          break
        case 'memory':
        default:
          commit('SET_MEMORY_CACHE', { key, data, expiry: finalExpiry })
          break
      }
    },
    
    // 获取缓存
    getCache({ state, commit }, { key, type = 'auto' }) {
      const now = Date.now()
      let cacheItem = null
      let foundType = null
      
      // 自动选择类型时的查找顺序：memory -> session -> local
      if (type === 'auto') {
        if (key in state.memoryCache) {
          cacheItem = state.memoryCache[key]
          foundType = 'memory'
        } else if (key in state.sessionCache) {
          cacheItem = state.sessionCache[key]
          foundType = 'session'
        } else if (key in state.localCache) {
          cacheItem = state.localCache[key]
          foundType = 'local'
        }
      } else {
        // 指定类型查找
        switch (type) {
          case 'memory':
            if (key in state.memoryCache) {
              cacheItem = state.memoryCache[key]
              foundType = 'memory'
            }
            break
          case 'session':
            if (key in state.sessionCache) {
              cacheItem = state.sessionCache[key]
              foundType = 'session'
            }
            break
          case 'local':
            if (key in state.localCache) {
              cacheItem = state.localCache[key]
              foundType = 'local'
            }
            break
        }
      }
      
      // 检查缓存是否存在且未过期
      if (cacheItem && cacheItem.expiry > now) {
        commit('UPDATE_STATISTICS', { hits: state.statistics.hits + 1 })
        return {
          data: cacheItem.data,
          timestamp: cacheItem.timestamp,
          type: foundType,
          hit: true
        }
      } else {
        // 缓存过期或不存在，清理过期缓存
        if (cacheItem) {
          switch (foundType) {
            case 'memory':
              commit('DELETE_MEMORY_CACHE', key)
              break
            case 'session':
              commit('DELETE_SESSION_CACHE', key)
              break
            case 'local':
              commit('DELETE_LOCAL_CACHE', key)
              break
          }
        }
        
        commit('UPDATE_STATISTICS', { misses: state.statistics.misses + 1 })
        return {
          data: null,
          timestamp: null,
          type: null,
          hit: false
        }
      }
    },
    
    // 删除缓存
    deleteCache({ commit }, { key, type = 'all' }) {
      if (type === 'all') {
        commit('DELETE_MEMORY_CACHE', key)
        commit('DELETE_SESSION_CACHE', key)
        commit('DELETE_LOCAL_CACHE', key)
      } else {
        switch (type) {
          case 'memory':
            commit('DELETE_MEMORY_CACHE', key)
            break
          case 'session':
            commit('DELETE_SESSION_CACHE', key)
            break
          case 'local':
            commit('DELETE_LOCAL_CACHE', key)
            break
        }
      }
    },
    
    // 清理过期缓存
    cleanupExpiredCache({ state, commit }) {
      if (state.cleanupTaskRunning) {
        return
      }
      
      commit('SET_CLEANUP_TASK_RUNNING', true)
      
      const now = Date.now()
      let cleanedCount = 0
      
      try {
        // 清理内存缓存
        Object.keys(state.memoryCache).forEach(key => {
          if (state.memoryCache[key].expiry <= now) {
            commit('DELETE_MEMORY_CACHE', key)
            cleanedCount++
          }
        })
        
        // 清理会话缓存
        Object.keys(state.sessionCache).forEach(key => {
          if (state.sessionCache[key].expiry <= now) {
            commit('DELETE_SESSION_CACHE', key)
            cleanedCount++
          }
        })
        
        // 清理本地缓存
        Object.keys(state.localCache).forEach(key => {
          if (state.localCache[key].expiry <= now) {
            commit('DELETE_LOCAL_CACHE', key)
            cleanedCount++
          }
        })
        
        // 更新统计信息
        commit('UPDATE_STATISTICS', {
          cleanups: state.statistics.cleanups + 1
        })
        
        // 更新最后清理时间
        commit('UPDATE_CACHE_CONFIG', {
          autoCleanup: {
            ...state.cacheConfig.autoCleanup,
            lastCleanup: now
          }
        })
        
        console.log(`Cache cleanup completed. Cleaned ${cleanedCount} expired items.`)
        
      } finally {
        commit('SET_CLEANUP_TASK_RUNNING', false)
      }
    },
    
    // 启动自动清理任务
    startAutoCleanup({ state, dispatch }) {
      if (!state.cacheConfig.autoCleanup.enabled) {
        return
      }
      
      const cleanup = () => {
        dispatch('cleanupExpiredCache')
        
        // 设置下次清理
        setTimeout(cleanup, state.cacheConfig.autoCleanup.interval)
      }
      
      // 立即执行一次清理
      setTimeout(cleanup, 1000)
    },
    
    // 清空所有缓存
    clearAllCache({ commit }) {
      commit('CLEAR_ALL_CACHE')
    },
    
    // 更新缓存配置
    updateCacheConfig({ commit }, config) {
      commit('UPDATE_CACHE_CONFIG', config)
    },
    
    // 检查缓存是否存在
    hasCache({ state }, { key, type = 'auto' }) {
      const now = Date.now()
      
      if (type === 'auto') {
        // 检查所有类型
        const memoryItem = state.memoryCache[key]
        const sessionItem = state.sessionCache[key]
        const localItem = state.localCache[key]
        
        return (memoryItem && memoryItem.expiry > now) ||
               (sessionItem && sessionItem.expiry > now) ||
               (localItem && localItem.expiry > now)
      } else {
        // 检查指定类型
        let item = null
        switch (type) {
          case 'memory':
            item = state.memoryCache[key]
            break
          case 'session':
            item = state.sessionCache[key]
            break
          case 'local':
            item = state.localCache[key]
            break
        }
        
        return item && item.expiry > now
      }
    },
    
    // 批量设置缓存
    setBatchCache({ dispatch }, cacheItems) {
      const promises = cacheItems.map(item => {
        return dispatch('setCache', item)
      })
      
      return Promise.all(promises)
    },
    
    // 批量获取缓存
    getBatchCache({ dispatch }, keys) {
      const promises = keys.map(key => {
        return dispatch('getCache', { key })
      })
      
      return Promise.all(promises)
    }
  },
  
  getters: {
    // 获取缓存配置
    cacheConfig: state => state.cacheConfig,
    
    // 获取缓存统计信息
    statistics: state => state.statistics,
    
    // 获取缓存命中率
    hitRate: state => {
      const total = state.statistics.hits + state.statistics.misses
      return total > 0 ? (state.statistics.hits / total * 100).toFixed(2) : '0.00'
    },
    
    // 获取各类型缓存数量
    cacheCount: state => ({
      memory: Object.keys(state.memoryCache).length,
      session: Object.keys(state.sessionCache).length,
      local: Object.keys(state.localCache).length,
      total: Object.keys(state.memoryCache).length + 
             Object.keys(state.sessionCache).length + 
             Object.keys(state.localCache).length
    }),
    
    // 获取所有缓存键
    allCacheKeys: state => ({
      memory: Object.keys(state.memoryCache),
      session: Object.keys(state.sessionCache),
      local: Object.keys(state.localCache)
    }),
    
    // 检查是否需要清理
    needCleanup: state => {
      const now = Date.now()
      const lastCleanup = state.cacheConfig.autoCleanup.lastCleanup
      const interval = state.cacheConfig.autoCleanup.interval
      
      return now - lastCleanup > interval
    },
    
    // 获取过期的缓存键
    expiredCacheKeys: state => {
      const now = Date.now()
      const expired = {
        memory: [],
        session: [],
        local: []
      }
      
      Object.keys(state.memoryCache).forEach(key => {
        if (state.memoryCache[key].expiry <= now) {
          expired.memory.push(key)
        }
      })
      
      Object.keys(state.sessionCache).forEach(key => {
        if (state.sessionCache[key].expiry <= now) {
          expired.session.push(key)
        }
      })
      
      Object.keys(state.localCache).forEach(key => {
        if (state.localCache[key].expiry <= now) {
          expired.local.push(key)
        }
      })
      
      return expired
    },
    
    // 获取清理任务状态
    cleanupTaskRunning: state => state.cleanupTaskRunning
  }
}

export default cache