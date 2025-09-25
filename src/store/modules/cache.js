/**
 * 组件缓存管理模块
 * 实现keep-alive组件的缓存控制、LRU清理策略和超时处理
 */

const cache = {
  state: {
    // 当前缓存的组件名称列表
    cachedViews: [],
    // 缓存配置
    cacheConfig: {
      maxCacheSize: 10, // 最大缓存组件数量
      defaultTimeout: 30 * 60 * 1000, // 默认缓存超时时间（30分钟）
      enableLRU: true, // 是否启用LRU清理策略
      enableTimeout: true // 是否启用超时清理
    },
    // 各组件缓存时间戳记录 { componentName: timestamp }
    cacheTimestamp: {},
    // 组件访问次数记录（用于LRU算法）{ componentName: accessCount }
    cacheAccessCount: {},
    // 组件最后访问时间（用于LRU算法）{ componentName: lastAccessTime }
    cacheLastAccess: {}
  },

  mutations: {
    /**
     * 添加缓存组件
     */
    ADD_CACHED_VIEW: (state, view) => {
      const { name, fullPath } = view
      if (!name) return

      const timestamp = Date.now()
      
      // 如果组件不在缓存列表中，添加到列表
      if (!state.cachedViews.includes(name)) {
        // 检查是否超过最大缓存数量
        if (state.cachedViews.length >= state.cacheConfig.maxCacheSize) {
          // 执行LRU清理策略
          const lruComponent = findLRUComponent(state)
          if (lruComponent) {
            const index = state.cachedViews.indexOf(lruComponent)
            if (index > -1) {
              state.cachedViews.splice(index, 1)
              delete state.cacheTimestamp[lruComponent]
              delete state.cacheAccessCount[lruComponent]
              delete state.cacheLastAccess[lruComponent]
            }
          }
        }
        
        state.cachedViews.push(name)
        state.cacheTimestamp[name] = timestamp
        state.cacheAccessCount[name] = 1
        state.cacheLastAccess[name] = timestamp
      } else {
        // 更新访问统计
        state.cacheAccessCount[name] = (state.cacheAccessCount[name] || 0) + 1
        state.cacheLastAccess[name] = timestamp
      }
    },

    /**
     * 删除指定缓存组件
     */
    DEL_CACHED_VIEW: (state, viewName) => {
      const index = state.cachedViews.indexOf(viewName)
      if (index > -1) {
        state.cachedViews.splice(index, 1)
        delete state.cacheTimestamp[viewName]
        delete state.cacheAccessCount[viewName]
        delete state.cacheLastAccess[viewName]
      }
    },

    /**
     * 清空所有缓存
     */
    CLEAR_ALL_CACHE: (state) => {
      state.cachedViews = []
      state.cacheTimestamp = {}
      state.cacheAccessCount = {}
      state.cacheLastAccess = {}
    },

    /**
     * 更新缓存配置
     */
    UPDATE_CACHE_CONFIG: (state, config) => {
      state.cacheConfig = { ...state.cacheConfig, ...config }
    },

    /**
     * 清理过期缓存
     */
    CLEAR_EXPIRED_CACHE: (state) => {
      if (!state.cacheConfig.enableTimeout) return

      const now = Date.now()
      const timeout = state.cacheConfig.defaultTimeout
      const expiredViews = []

      // 查找过期的组件
      Object.keys(state.cacheTimestamp).forEach(viewName => {
        if (now - state.cacheTimestamp[viewName] > timeout) {
          expiredViews.push(viewName)
        }
      })

      // 清理过期组件
      expiredViews.forEach(viewName => {
        const index = state.cachedViews.indexOf(viewName)
        if (index > -1) {
          state.cachedViews.splice(index, 1)
          delete state.cacheTimestamp[viewName]
          delete state.cacheAccessCount[viewName]
          delete state.cacheLastAccess[viewName]
        }
      })
    },

    /**
     * 批量删除缓存组件
     */
    DEL_CACHED_VIEWS: (state, viewNames) => {
      viewNames.forEach(viewName => {
        const index = state.cachedViews.indexOf(viewName)
        if (index > -1) {
          state.cachedViews.splice(index, 1)
          delete state.cacheTimestamp[viewName]
          delete state.cacheAccessCount[viewName] 
          delete state.cacheLastAccess[viewName]
        }
      })
    }
  },

  actions: {
    /**
     * 添加缓存组件
     */
    addCachedView({ commit, state }, view) {
      return new Promise(resolve => {
        commit('ADD_CACHED_VIEW', view)
        resolve([...state.cachedViews])
      })
    },

    /**
     * 删除缓存组件
     */
    delCachedView({ commit, state }, viewName) {
      return new Promise(resolve => {
        commit('DEL_CACHED_VIEW', viewName)
        resolve([...state.cachedViews])
      })
    },

    /**
     * 清空所有缓存
     */
    clearAllCache({ commit }) {
      return new Promise(resolve => {
        commit('CLEAR_ALL_CACHE')
        resolve()
      })
    },

    /**
     * 刷新指定组件缓存
     */
    refreshCache({ commit, state }, viewName) {
      return new Promise(resolve => {
        // 先删除再添加，实现刷新效果
        commit('DEL_CACHED_VIEW', viewName)
        resolve([...state.cachedViews])
      })
    },

    /**
     * 更新缓存配置
     */
    updateCacheConfig({ commit }, config) {
      return new Promise(resolve => {
        commit('UPDATE_CACHE_CONFIG', config)
        resolve()
      })
    },

    /**
     * 清理过期缓存
     */
    clearExpiredCache({ commit }) {
      return new Promise(resolve => {
        commit('CLEAR_EXPIRED_CACHE')
        resolve()
      })
    },

    /**
     * 智能缓存清理
     * 根据内存使用率和缓存数量进行智能清理
     */
    smartCacheClean({ commit, state }, options = {}) {
      return new Promise(resolve => {
        const { forceClean = false, cleanRatio = 0.5 } = options
        
        if (forceClean || state.cachedViews.length > state.cacheConfig.maxCacheSize * 0.8) {
          // 先清理过期缓存
          commit('CLEAR_EXPIRED_CACHE')
          
          // 如果还是超过阈值，执行LRU清理
          if (state.cachedViews.length > state.cacheConfig.maxCacheSize * 0.6) {
            const cleanCount = Math.floor(state.cachedViews.length * cleanRatio)
            const lruComponents = findMultipleLRUComponents(state, cleanCount)
            commit('DEL_CACHED_VIEWS', lruComponents)
          }
        }
        
        resolve([...state.cachedViews])
      })
    }
  },

  getters: {
    cachedViews: state => state.cachedViews,
    cacheConfig: state => state.cacheConfig,
    cacheCount: state => state.cachedViews.length,
    isCached: (state) => (viewName) => state.cachedViews.includes(viewName),
    cacheInfo: state => {
      return {
        total: state.cachedViews.length,
        maxSize: state.cacheConfig.maxCacheSize,
        usage: state.cachedViews.length / state.cacheConfig.maxCacheSize,
        components: state.cachedViews.map(name => ({
          name,
          timestamp: state.cacheTimestamp[name],
          accessCount: state.cacheAccessCount[name],
          lastAccess: state.cacheLastAccess[name]
        }))
      }
    }
  }
}

/**
 * 查找最少使用的组件（LRU算法）
 */
function findLRUComponent(state) {
  if (state.cachedViews.length === 0) return null
  
  let lruComponent = null
  let minAccessTime = Date.now()
  
  state.cachedViews.forEach(viewName => {
    const lastAccess = state.cacheLastAccess[viewName] || 0
    if (lastAccess < minAccessTime) {
      minAccessTime = lastAccess
      lruComponent = viewName
    }
  })
  
  return lruComponent
}

/**
 * 查找多个最少使用的组件
 */
function findMultipleLRUComponents(state, count) {
  const components = state.cachedViews.map(name => ({
    name,
    lastAccess: state.cacheLastAccess[name] || 0,
    accessCount: state.cacheAccessCount[name] || 0
  }))
  
  // 按最后访问时间和访问次数排序
  components.sort((a, b) => {
    if (a.lastAccess !== b.lastAccess) {
      return a.lastAccess - b.lastAccess
    }
    return a.accessCount - b.accessCount
  })
  
  return components.slice(0, count).map(comp => comp.name)
}

export default cache