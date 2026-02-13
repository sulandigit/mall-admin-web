/**
 * API缓存和批处理优化工具
 * 提供智能缓存、请求合并、批量处理等功能
 */

import { deduplicateRequest, batchProcess } from './debounce'

// 缓存配置
const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 默认5分钟缓存
  MAX_CACHE_SIZE: 100, // 最大缓存条目数
  BATCH_DELAY: 200, // 批处理延迟时间
  MAX_BATCH_SIZE: 20 // 最大批次大小
}

class ApiCacheManager {
  constructor() {
    this.cache = new Map()
    this.stats = {
      hits: 0,
      misses: 0,
      requests: 0,
      batchOperations: 0
    }
    
    // 定期清理过期缓存
    this.startCleanupInterval()
  }

  /**
   * 获取缓存键
   */
  getCacheKey(url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key]
        return result
      }, {})
    return `${url}:${JSON.stringify(sortedParams)}`
  }

  /**
   * 设置缓存
   */
  set(key, data, ttl = CACHE_CONFIG.DEFAULT_TTL) {
    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= CACHE_CONFIG.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      data,
      expires: Date.now() + ttl,
      createdAt: Date.now()
    })
  }

  /**
   * 获取缓存
   */
  get(key) {
    const cached = this.cache.get(key)
    
    if (!cached) {
      this.stats.misses++
      return null
    }

    if (Date.now() > cached.expires) {
      this.cache.delete(key)
      this.stats.misses++
      return null
    }

    this.stats.hits++
    return cached.data
  }

  /**
   * 删除缓存
   */
  delete(key) {
    return this.cache.delete(key)
  }

  /**
   * 清空所有缓存
   */
  clear() {
    this.cache.clear()
  }

  /**
   * 获取缓存统计
   */
  getStats() {
    return {
      ...this.stats,
      cacheSize: this.cache.size,
      hitRate: this.stats.requests > 0 ? 
        (this.stats.hits / this.stats.requests * 100).toFixed(2) + '%' : '0%'
    }
  }

  /**
   * 定期清理过期缓存
   */
  startCleanupInterval() {
    setInterval(() => {
      const now = Date.now()
      for (const [key, value] of this.cache.entries()) {
        if (now > value.expires) {
          this.cache.delete(key)
        }
      }
    }, 60000) // 每分钟清理一次
  }
}

// 全局缓存管理器实例
const cacheManager = new ApiCacheManager()

/**
 * 带缓存的API请求装饰器
 */
export function withCache(apiFunction, options = {}) {
  const {
    ttl = CACHE_CONFIG.DEFAULT_TTL,
    cacheKey = null,
    forceRefresh = false
  } = options

  return async function cachedApiCall(...args) {
    cacheManager.stats.requests++

    // 生成缓存键
    const key = cacheKey || cacheManager.getCacheKey(apiFunction.name, args)

    // 如果不强制刷新，先尝试从缓存获取
    if (!forceRefresh) {
      const cached = cacheManager.get(key)
      if (cached) {
        return cached
      }
    }

    try {
      // 调用原始API
      const result = await apiFunction(...args)
      
      // 存入缓存
      cacheManager.set(key, result, ttl)
      
      return result
    } catch (error) {
      // API调用失败时，如果有过期的缓存数据，可以考虑返回
      const staleData = cacheManager.cache.get(key)
      if (staleData && options.returnStaleOnError) {
        console.warn(`API调用失败，返回过期缓存数据: ${key}`)
        return staleData.data
      }
      throw error
    }
  }
}

/**
 * 批量状态更新处理器
 */
class BatchStatusUpdater {
  constructor() {
    this.queues = new Map() // 按操作类型分组的队列
    this.processors = new Map() // 处理器映射
    
    this.setupProcessors()
  }

  setupProcessors() {
    // 发布状态批处理
    this.processors.set('publishStatus', batchProcess(
      this.processStatusBatch.bind(this, 'publishStatus'),
      CACHE_CONFIG.BATCH_DELAY,
      CACHE_CONFIG.MAX_BATCH_SIZE
    ))

    // 新品状态批处理
    this.processors.set('newStatus', batchProcess(
      this.processStatusBatch.bind(this, 'newStatus'),
      CACHE_CONFIG.BATCH_DELAY,
      CACHE_CONFIG.MAX_BATCH_SIZE
    ))

    // 推荐状态批处理
    this.processors.set('recommandStatus', batchProcess(
      this.processStatusBatch.bind(this, 'recommandStatus'),
      CACHE_CONFIG.BATCH_DELAY,
      CACHE_CONFIG.MAX_BATCH_SIZE
    ))
  }

  /**
   * 添加状态更新到批处理队列
   */
  addStatusUpdate(type, productId, value, callback) {
    const processor = this.processors.get(type)
    if (!processor) {
      throw new Error(`不支持的状态类型: ${type}`)
    }

    processor({
      type,
      productId,
      value,
      callback,
      timestamp: Date.now()
    })
  }

  /**
   * 处理状态批次更新
   */
  async processStatusBatch(statusType, batch) {
    if (!batch || batch.length === 0) return

    try {
      // 按状态值分组
      const groups = batch.reduce((acc, item) => {
        const key = `${statusType}_${item.value}`
        if (!acc[key]) {
          acc[key] = []
        }
        acc[key].push(item)
        return acc
      }, {})

      // 并行处理每个分组
      await Promise.all(
        Object.entries(groups).map(([key, items]) => {
          const [, value] = key.split('_')
          return this.executeBatchUpdate(statusType, items, parseInt(value))
        })
      )

      cacheManager.stats.batchOperations++
      
    } catch (error) {
      console.error(`批量${statusType}更新失败:`, error)
      
      // 单独处理失败的项目
      for (const item of batch) {
        if (item.callback) {
          item.callback(error)
        }
      }
    }
  }

  /**
   * 执行批量更新
   */
  async executeBatchUpdate(statusType, items, value) {
    const productIds = items.map(item => item.productId)
    
    try {
      // 这里应该调用实际的批量更新API
      const data = new URLSearchParams()
      data.append('ids', productIds.join(','))
      data.append(statusType, value)

      let updateAPI
      switch (statusType) {
        case 'publishStatus':
          updateAPI = await import('@/api/product').then(module => module.updatePublishStatus)
          break
        case 'newStatus':
          updateAPI = await import('@/api/product').then(module => module.updateNewStatus)
          break
        case 'recommandStatus':
          updateAPI = await import('@/api/product').then(module => module.updateRecommendStatus)
          break
        default:
          throw new Error(`未知的状态类型: ${statusType}`)
      }

      await updateAPI(data)

      // 成功回调
      items.forEach(item => {
        if (item.callback) {
          item.callback(null, { success: true })
        }
      })

      // 清除相关缓存
      this.invalidateRelatedCache(productIds)

    } catch (error) {
      // 失败回调
      items.forEach(item => {
        if (item.callback) {
          item.callback(error)
        }
      })
      throw error
    }
  }

  /**
   * 清除相关缓存
   */
  invalidateRelatedCache(productIds) {
    // 清除商品列表相关的缓存
    for (const [key] of cacheManager.cache.entries()) {
      if (key.includes('fetchList') || 
          productIds.some(id => key.includes(id))) {
        cacheManager.delete(key)
      }
    }
  }
}

// 全局批量更新器实例
const batchUpdater = new BatchStatusUpdater()

/**
 * 智能请求合并装饰器
 */
export function withRequestMerging(apiFunction, keyGenerator) {
  return deduplicateRequest(apiFunction, keyGenerator)
}

/**
 * 预加载数据
 */
export async function preloadData(requests = []) {
  const promises = requests.map(async ({ key, apiCall, ttl }) => {
    try {
      const cached = cacheManager.get(key)
      if (!cached) {
        const data = await apiCall()
        cacheManager.set(key, data, ttl)
      }
    } catch (error) {
      console.warn(`预加载失败: ${key}`, error)
    }
  })

  await Promise.allSettled(promises)
}

/**
 * 导出的API优化工具
 */
export const ApiOptimizer = {
  // 缓存管理
  cache: cacheManager,
  
  // 带缓存装饰器
  withCache,
  
  // 请求合并装饰器
  withRequestMerging,
  
  // 批量状态更新
  batchStatusUpdate: (type, productId, value, callback) => {
    batchUpdater.addStatusUpdate(type, productId, value, callback)
  },
  
  // 预加载数据
  preloadData,
  
  // 获取统计信息
  getStats: () => cacheManager.getStats(),
  
  // 清空缓存
  clearCache: () => cacheManager.clear(),
  
  // 清除指定缓存
  clearCache: (key) => cacheManager.delete(key)
}

export default ApiOptimizer