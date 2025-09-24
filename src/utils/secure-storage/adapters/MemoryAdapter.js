/**
 * 内存存储适配器
 * 提供高速的临时内存存储，数据在页面刷新时丢失
 */

export default class MemoryAdapter {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 10 * 1024 * 1024 // 10MB默认限制
    this.maxEntries = options.maxEntries || 1000 // 最大条目数
    this.ttlCheckInterval = options.ttlCheckInterval || 60000 // TTL检查间隔1分钟
    
    // 内存存储映射
    this.storage = new Map()
    
    // 启动TTL清理定时器
    this.startTTLCleanup()
  }

  /**
   * 检查内存存储是否支持（总是支持）
   * @returns {boolean} 是否支持
   */
  isSupported() {
    return true
  }

  /**
   * 获取当前存储大小（估算）
   * @returns {number} 存储大小（字节）
   */
  getCurrentSize() {
    let totalSize = 0
    
    for (const [key, value] of this.storage.entries()) {
      try {
        // 估算大小：键名 + JSON序列化后的值
        totalSize += key.length * 2 // UTF-16编码
        totalSize += JSON.stringify(value).length * 2
      } catch (error) {
        // 如果序列化失败，使用固定大小估算
        totalSize += key.length * 2 + 100
      }
    }
    
    return totalSize
  }

  /**
   * 检查存储容量
   * @param {string} key - 键名
   * @param {any} value - 值
   * @returns {boolean} 是否在容量限制内
   */
  checkCapacity(key, value) {
    try {
      // 检查条目数限制
      if (this.storage.size >= this.maxEntries) {
        return false
      }
      
      // 检查大小限制
      const itemSize = key.length * 2 + JSON.stringify(value).length * 2
      const currentSize = this.getCurrentSize()
      return (currentSize + itemSize) <= this.maxSize
    } catch (error) {
      return false
    }
  }

  /**
   * 写入数据
   * @param {string} key - 键名
   * @param {any} value - 值
   * @returns {Promise<boolean>} 是否成功
   */
  async write(key, value) {
    try {
      // 检查容量
      if (!this.checkCapacity(key, value)) {
        // 尝试清理过期数据
        this.cleanupExpired()
        
        // 再次检查容量
        if (!this.checkCapacity(key, value)) {
          // 如果仍然超出容量，清理最旧的数据
          this.cleanupOldest()
          
          // 最后检查
          if (!this.checkCapacity(key, value)) {
            console.warn('Memory storage capacity exceeded')
            return false
          }
        }
      }

      const now = Date.now()
      const item = {
        data: value,
        timestamp: now,
        expireTime: value.expireTime || null,
        accessCount: 0,
        lastAccess: now
      }

      this.storage.set(key, item)
      return true
      
    } catch (error) {
      console.error('Memory storage write error:', error)
      return false
    }
  }

  /**
   * 读取数据
   * @param {string} key - 键名
   * @returns {Promise<any>} 读取的数据
   */
  async read(key) {
    try {
      const item = this.storage.get(key)
      
      if (!item) {
        return null
      }

      // 检查数据是否过期
      if (item.expireTime && item.expireTime < Date.now()) {
        this.storage.delete(key)
        return null
      }

      // 更新访问统计
      item.accessCount++
      item.lastAccess = Date.now()

      return item.data
      
    } catch (error) {
      console.error('Memory storage read error:', error)
      return null
    }
  }

  /**
   * 删除数据
   * @param {string} key - 键名
   * @returns {Promise<boolean>} 是否成功
   */
  async delete(key) {
    try {
      return this.storage.delete(key)
    } catch (error) {
      console.error('Memory storage delete error:', error)
      return false
    }
  }

  /**
   * 清空所有数据
   * @returns {Promise<boolean>} 是否成功
   */
  async clear() {
    try {
      this.storage.clear()
      return true
    } catch (error) {
      console.error('Memory storage clear error:', error)
      return false
    }
  }

  /**
   * 获取所有键名
   * @returns {Promise<Array<string>>} 键名数组
   */
  async getKeys() {
    try {
      return Array.from(this.storage.keys())
    } catch (error) {
      console.error('Memory storage getKeys error:', error)
      return []
    }
  }

  /**
   * 获取存储大小
   * @returns {Promise<number>} 存储大小（字节）
   */
  async getSize() {
    return this.getCurrentSize()
  }

  /**
   * 清理过期数据
   * @returns {number} 清理的条目数
   */
  cleanupExpired() {
    let cleanedCount = 0
    const now = Date.now()
    
    try {
      for (const [key, item] of this.storage.entries()) {
        if (item.expireTime && item.expireTime < now) {
          this.storage.delete(key)
          cleanedCount++
        }
      }
    } catch (error) {
      console.error('Memory storage cleanup error:', error)
    }
    
    return cleanedCount
  }

  /**
   * 清理最旧的数据（LRU策略）
   * @param {number} count - 要清理的条目数，默认清理25%
   * @returns {number} 清理的条目数
   */
  cleanupOldest(count = null) {
    let cleanedCount = 0
    
    try {
      const entries = Array.from(this.storage.entries())
      
      // 按最后访问时间排序，最旧的在前
      entries.sort((a, b) => a[1].lastAccess - b[1].lastAccess)
      
      // 确定要清理的数量
      const cleanupCount = count || Math.max(1, Math.floor(entries.length * 0.25))
      
      // 删除最旧的条目
      for (let i = 0; i < Math.min(cleanupCount, entries.length); i++) {
        this.storage.delete(entries[i][0])
        cleanedCount++
      }
      
    } catch (error) {
      console.error('Memory storage oldest cleanup error:', error)
    }
    
    return cleanedCount
  }

  /**
   * 启动TTL清理定时器
   */
  startTTLCleanup() {
    // 清除现有定时器
    if (this.ttlTimer) {
      clearInterval(this.ttlTimer)
    }
    
    // 设置新的定时器
    this.ttlTimer = setInterval(() => {
      this.cleanupExpired()
    }, this.ttlCheckInterval)
  }

  /**
   * 停止TTL清理定时器
   */
  stopTTLCleanup() {
    if (this.ttlTimer) {
      clearInterval(this.ttlTimer)
      this.ttlTimer = null
    }
  }

  /**
   * 检查特定键是否存在
   * @param {string} key - 键名
   * @returns {Promise<boolean>} 是否存在
   */
  async exists(key) {
    try {
      const item = this.storage.get(key)
      
      if (!item) {
        return false
      }

      // 检查是否过期
      if (item.expireTime && item.expireTime < Date.now()) {
        this.storage.delete(key)
        return false
      }

      return true
      
    } catch (error) {
      console.error('Memory storage exists error:', error)
      return false
    }
  }

  /**
   * 获取所有数据（用于调试）
   * @returns {Promise<Object>} 所有数据
   */
  async getAllData() {
    try {
      const data = {}
      
      for (const [key, item] of this.storage.entries()) {
        // 检查是否过期
        if (item.expireTime && item.expireTime < Date.now()) {
          this.storage.delete(key)
          continue
        }
        
        data[key] = item.data
      }
      
      return data
      
    } catch (error) {
      console.error('Memory storage getAllData error:', error)
      return {}
    }
  }

  /**
   * 获取访问统计信息
   * @param {string} key - 键名
   * @returns {Promise<Object|null>} 统计信息
   */
  async getItemStats(key) {
    try {
      const item = this.storage.get(key)
      
      if (!item) {
        return null
      }

      return {
        timestamp: item.timestamp,
        expireTime: item.expireTime,
        accessCount: item.accessCount,
        lastAccess: item.lastAccess,
        age: Date.now() - item.timestamp
      }
      
    } catch (error) {
      console.error('Memory storage getItemStats error:', error)
      return null
    }
  }

  /**
   * 获取存储统计信息
   * @returns {Promise<Object>} 统计信息
   */
  async getStats() {
    try {
      const now = Date.now()
      let expiredCount = 0
      let totalAccess = 0
      let oldestTimestamp = now
      let newestTimestamp = 0
      
      for (const [key, item] of this.storage.entries()) {
        if (item.expireTime && item.expireTime < now) {
          expiredCount++
        }
        
        totalAccess += item.accessCount
        oldestTimestamp = Math.min(oldestTimestamp, item.timestamp)
        newestTimestamp = Math.max(newestTimestamp, item.timestamp)
      }
      
      return {
        totalKeys: this.storage.size,
        expiredKeys: expiredCount,
        totalSize: this.getCurrentSize(),
        maxSize: this.maxSize,
        maxEntries: this.maxEntries,
        totalAccess: totalAccess,
        averageAccess: this.storage.size > 0 ? Math.round(totalAccess / this.storage.size) : 0,
        oldestItem: oldestTimestamp < now ? oldestTimestamp : null,
        newestItem: newestTimestamp > 0 ? newestTimestamp : null,
        usagePercentage: Math.round((this.getCurrentSize() / this.maxSize) * 100),
        entryUsagePercentage: Math.round((this.storage.size / this.maxEntries) * 100)
      }
      
    } catch (error) {
      console.error('Memory storage getStats error:', error)
      return {
        totalKeys: 0,
        expiredKeys: 0,
        totalSize: 0,
        maxSize: this.maxSize,
        maxEntries: this.maxEntries,
        totalAccess: 0,
        averageAccess: 0,
        oldestItem: null,
        newestItem: null,
        usagePercentage: 0,
        entryUsagePercentage: 0
      }
    }
  }

  /**
   * 获取最常访问的键
   * @param {number} limit - 返回的数量限制
   * @returns {Promise<Array>} 最常访问的键数组
   */
  async getMostAccessed(limit = 10) {
    try {
      const entries = Array.from(this.storage.entries())
      
      // 按访问次数排序，最多的在前
      entries.sort((a, b) => b[1].accessCount - a[1].accessCount)
      
      return entries.slice(0, limit).map(([key, item]) => ({
        key: key,
        accessCount: item.accessCount,
        lastAccess: item.lastAccess
      }))
      
    } catch (error) {
      console.error('Memory storage getMostAccessed error:', error)
      return []
    }
  }

  /**
   * 销毁存储适配器
   */
  destroy() {
    this.stopTTLCleanup()
    this.storage.clear()
  }
}