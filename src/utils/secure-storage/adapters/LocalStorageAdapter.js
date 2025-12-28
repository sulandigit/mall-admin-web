/**
 * LocalStorage存储适配器
 * 提供持久化的键值对存储
 */

export default class LocalStorageAdapter {
  constructor(options = {}) {
    this.prefix = options.prefix || '_secure_storage_'
    this.maxSize = options.maxSize || 5 * 1024 * 1024 // 5MB默认限制
  }

  /**
   * 检查LocalStorage是否支持
   * @returns {boolean} 是否支持
   */
  isSupported() {
    try {
      if (typeof localStorage === 'undefined') {
        return false
      }
      
      // 测试写入和读取
      const testKey = '_test_storage_support_'
      localStorage.setItem(testKey, 'test')
      const testValue = localStorage.getItem(testKey)
      localStorage.removeItem(testKey)
      
      return testValue === 'test'
    } catch (error) {
      return false
    }
  }

  /**
   * 生成带前缀的键名
   * @param {string} key - 原始键名
   * @returns {string} 带前缀的键名
   */
  getPrefixedKey(key) {
    return this.prefix + key
  }

  /**
   * 检查存储容量
   * @param {string} data - 要存储的数据
   * @returns {boolean} 是否在容量限制内
   */
  checkCapacity(data) {
    try {
      const dataSize = JSON.stringify(data).length * 2 // UTF-16编码
      const currentSize = this.getCurrentSize()
      return (currentSize + dataSize) <= this.maxSize
    } catch (error) {
      return false
    }
  }

  /**
   * 获取当前存储大小
   * @returns {number} 当前存储大小（字节）
   */
  getCurrentSize() {
    let totalSize = 0
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(this.prefix)) {
          const value = localStorage.getItem(key)
          totalSize += (key.length + (value || '').length) * 2
        }
      }
    } catch (error) {
      console.error('Error calculating storage size:', error)
    }
    
    return totalSize
  }

  /**
   * 写入数据
   * @param {string} key - 键名
   * @param {any} value - 值
   * @returns {Promise<boolean>} 是否成功
   */
  async write(key, value) {
    if (!this.isSupported()) {
      console.error('LocalStorage is not supported')
      return false
    }

    try {
      const prefixedKey = this.getPrefixedKey(key)
      const serializedValue = JSON.stringify({
        data: value,
        timestamp: Date.now(),
        expireTime: value.expireTime || null
      })

      // 检查存储容量
      if (!this.checkCapacity(serializedValue)) {
        console.warn('LocalStorage capacity exceeded')
        // 尝试清理过期数据
        await this.cleanupExpired()
        
        // 再次检查容量
        if (!this.checkCapacity(serializedValue)) {
          return false
        }
      }

      localStorage.setItem(prefixedKey, serializedValue)
      return true
      
    } catch (error) {
      console.error('LocalStorage write error:', error)
      
      // 如果是容量错误，尝试清理后重试
      if (error.name === 'QuotaExceededError' || error.name === 'QUOTA_EXCEEDED_ERR') {
        try {
          await this.cleanupExpired()
          const serializedValue = JSON.stringify({
            data: value,
            timestamp: Date.now(),
            expireTime: value.expireTime || null
          })
          localStorage.setItem(this.getPrefixedKey(key), serializedValue)
          return true
        } catch (retryError) {
          console.error('LocalStorage retry write error:', retryError)
        }
      }
      
      return false
    }
  }

  /**
   * 读取数据
   * @param {string} key - 键名
   * @returns {Promise<any>} 读取的数据
   */
  async read(key) {
    if (!this.isSupported()) {
      console.error('LocalStorage is not supported')
      return null
    }

    try {
      const prefixedKey = this.getPrefixedKey(key)
      const storedValue = localStorage.getItem(prefixedKey)
      
      if (!storedValue) {
        return null
      }

      const parsed = JSON.parse(storedValue)
      
      // 检查数据是否过期
      if (parsed.expireTime && parsed.expireTime < Date.now()) {
        // 数据已过期，删除并返回null
        await this.delete(key)
        return null
      }

      return parsed.data
      
    } catch (error) {
      console.error('LocalStorage read error:', error)
      return null
    }
  }

  /**
   * 删除数据
   * @param {string} key - 键名
   * @returns {Promise<boolean>} 是否成功
   */
  async delete(key) {
    if (!this.isSupported()) {
      console.error('LocalStorage is not supported')
      return false
    }

    try {
      const prefixedKey = this.getPrefixedKey(key)
      localStorage.removeItem(prefixedKey)
      return true
      
    } catch (error) {
      console.error('LocalStorage delete error:', error)
      return false
    }
  }

  /**
   * 清空所有数据
   * @returns {Promise<boolean>} 是否成功
   */
  async clear() {
    if (!this.isSupported()) {
      console.error('LocalStorage is not supported')
      return false
    }

    try {
      const keysToRemove = []
      
      // 收集所有带前缀的键
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key)
        }
      }
      
      // 删除所有收集到的键
      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
      })
      
      return true
      
    } catch (error) {
      console.error('LocalStorage clear error:', error)
      return false
    }
  }

  /**
   * 获取所有键名
   * @returns {Promise<Array<string>>} 键名数组
   */
  async getKeys() {
    if (!this.isSupported()) {
      return []
    }

    try {
      const keys = []
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(this.prefix)) {
          // 移除前缀，返回原始键名
          keys.push(key.substring(this.prefix.length))
        }
      }
      
      return keys
      
    } catch (error) {
      console.error('LocalStorage getKeys error:', error)
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
   * @returns {Promise<number>} 清理的条目数
   */
  async cleanupExpired() {
    if (!this.isSupported()) {
      return 0
    }

    try {
      const keysToRemove = []
      const now = Date.now()
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(this.prefix)) {
          try {
            const value = localStorage.getItem(key)
            if (value) {
              const parsed = JSON.parse(value)
              if (parsed.expireTime && parsed.expireTime < now) {
                keysToRemove.push(key)
              }
            }
          } catch (parseError) {
            // 如果解析失败，也将其标记为需要清理
            keysToRemove.push(key)
          }
        }
      }
      
      // 删除过期的键
      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
      })
      
      return keysToRemove.length
      
    } catch (error) {
      console.error('LocalStorage cleanup error:', error)
      return 0
    }
  }

  /**
   * 获取所有数据（用于调试）
   * @returns {Promise<Object>} 所有数据
   */
  async getAllData() {
    if (!this.isSupported()) {
      return {}
    }

    try {
      const data = {}
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(this.prefix)) {
          const originalKey = key.substring(this.prefix.length)
          const value = await this.read(originalKey)
          if (value !== null) {
            data[originalKey] = value
          }
        }
      }
      
      return data
      
    } catch (error) {
      console.error('LocalStorage getAllData error:', error)
      return {}
    }
  }

  /**
   * 检查特定键是否存在
   * @param {string} key - 键名
   * @returns {Promise<boolean>} 是否存在
   */
  async exists(key) {
    if (!this.isSupported()) {
      return false
    }

    try {
      const prefixedKey = this.getPrefixedKey(key)
      const value = localStorage.getItem(prefixedKey)
      
      if (!value) {
        return false
      }

      // 检查是否过期
      try {
        const parsed = JSON.parse(value)
        if (parsed.expireTime && parsed.expireTime < Date.now()) {
          await this.delete(key) // 清理过期数据
          return false
        }
        return true
      } catch (parseError) {
        return false
      }
      
    } catch (error) {
      console.error('LocalStorage exists error:', error)
      return false
    }
  }

  /**
   * 获取存储统计信息
   * @returns {Promise<Object>} 统计信息
   */
  async getStats() {
    try {
      const keys = await this.getKeys()
      const size = await this.getSize()
      let expiredCount = 0
      
      const now = Date.now()
      for (const key of keys) {
        const prefixedKey = this.getPrefixedKey(key)
        const value = localStorage.getItem(prefixedKey)
        if (value) {
          try {
            const parsed = JSON.parse(value)
            if (parsed.expireTime && parsed.expireTime < now) {
              expiredCount++
            }
          } catch (error) {
            expiredCount++
          }
        }
      }
      
      return {
        totalKeys: keys.length,
        expiredKeys: expiredCount,
        totalSize: size,
        availableSpace: this.maxSize - size,
        usagePercentage: Math.round((size / this.maxSize) * 100)
      }
      
    } catch (error) {
      console.error('LocalStorage getStats error:', error)
      return {
        totalKeys: 0,
        expiredKeys: 0,
        totalSize: 0,
        availableSpace: this.maxSize,
        usagePercentage: 0
      }
    }
  }
}