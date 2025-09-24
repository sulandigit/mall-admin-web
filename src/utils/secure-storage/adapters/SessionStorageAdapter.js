/**
 * SessionStorage存储适配器
 * 提供会话级别的临时存储
 */

export default class SessionStorageAdapter {
  constructor(options = {}) {
    this.prefix = options.prefix || '_secure_session_'
    this.maxSize = options.maxSize || 5 * 1024 * 1024 // 5MB默认限制
  }

  /**
   * 检查SessionStorage是否支持
   * @returns {boolean} 是否支持
   */
  isSupported() {
    try {
      if (typeof sessionStorage === 'undefined') {
        return false
      }
      
      // 测试写入和读取
      const testKey = '_test_session_support_'
      sessionStorage.setItem(testKey, 'test')
      const testValue = sessionStorage.getItem(testKey)
      sessionStorage.removeItem(testKey)
      
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
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && key.startsWith(this.prefix)) {
          const value = sessionStorage.getItem(key)
          totalSize += (key.length + (value || '').length) * 2
        }
      }
    } catch (error) {
      console.error('Error calculating session storage size:', error)
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
      console.error('SessionStorage is not supported')
      return false
    }

    try {
      const prefixedKey = this.getPrefixedKey(key)
      const serializedValue = JSON.stringify({
        data: value,
        timestamp: Date.now(),
        // SessionStorage不需要expireTime，会话结束时自动清理
        sessionId: this.getSessionId()
      })

      // 检查存储容量
      if (!this.checkCapacity(serializedValue)) {
        console.warn('SessionStorage capacity exceeded')
        // SessionStorage空间有限，如果超出就清理一些数据
        await this.cleanupOldest()
        
        // 再次检查容量
        if (!this.checkCapacity(serializedValue)) {
          return false
        }
      }

      sessionStorage.setItem(prefixedKey, serializedValue)
      return true
      
    } catch (error) {
      console.error('SessionStorage write error:', error)
      
      // 如果是容量错误，尝试清理后重试
      if (error.name === 'QuotaExceededError' || error.name === 'QUOTA_EXCEEDED_ERR') {
        try {
          await this.cleanupOldest()
          const serializedValue = JSON.stringify({
            data: value,
            timestamp: Date.now(),
            sessionId: this.getSessionId()
          })
          sessionStorage.setItem(this.getPrefixedKey(key), serializedValue)
          return true
        } catch (retryError) {
          console.error('SessionStorage retry write error:', retryError)
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
      console.error('SessionStorage is not supported')
      return null
    }

    try {
      const prefixedKey = this.getPrefixedKey(key)
      const storedValue = sessionStorage.getItem(prefixedKey)
      
      if (!storedValue) {
        return null
      }

      const parsed = JSON.parse(storedValue)
      
      // SessionStorage数据在会话期间都有效，不需要检查过期时间
      return parsed.data
      
    } catch (error) {
      console.error('SessionStorage read error:', error)
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
      console.error('SessionStorage is not supported')
      return false
    }

    try {
      const prefixedKey = this.getPrefixedKey(key)
      sessionStorage.removeItem(prefixedKey)
      return true
      
    } catch (error) {
      console.error('SessionStorage delete error:', error)
      return false
    }
  }

  /**
   * 清空所有数据
   * @returns {Promise<boolean>} 是否成功
   */
  async clear() {
    if (!this.isSupported()) {
      console.error('SessionStorage is not supported')
      return false
    }

    try {
      const keysToRemove = []
      
      // 收集所有带前缀的键
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key)
        }
      }
      
      // 删除所有收集到的键
      keysToRemove.forEach(key => {
        sessionStorage.removeItem(key)
      })
      
      return true
      
    } catch (error) {
      console.error('SessionStorage clear error:', error)
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
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && key.startsWith(this.prefix)) {
          // 移除前缀，返回原始键名
          keys.push(key.substring(this.prefix.length))
        }
      }
      
      return keys
      
    } catch (error) {
      console.error('SessionStorage getKeys error:', error)
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
   * 获取会话ID
   * @returns {string} 会话ID
   */
  getSessionId() {
    // 尝试从sessionStorage获取已存在的会话ID
    let sessionId = sessionStorage.getItem('_session_id')
    
    if (!sessionId) {
      // 生成新的会话ID
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15)
      sessionStorage.setItem('_session_id', sessionId)
    }
    
    return sessionId
  }

  /**
   * 清理最旧的数据
   * @param {number} count - 要清理的条目数，默认清理25%
   * @returns {Promise<number>} 清理的条目数
   */
  async cleanupOldest(count = null) {
    if (!this.isSupported()) {
      return 0
    }

    try {
      const allData = []
      
      // 收集所有数据及其时间戳
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && key.startsWith(this.prefix)) {
          try {
            const value = sessionStorage.getItem(key)
            if (value) {
              const parsed = JSON.parse(value)
              allData.push({
                key: key,
                timestamp: parsed.timestamp || 0
              })
            }
          } catch (parseError) {
            // 如果解析失败，也将其添加到清理列表
            allData.push({
              key: key,
              timestamp: 0
            })
          }
        }
      }
      
      // 按时间戳排序，最旧的在前
      allData.sort((a, b) => a.timestamp - b.timestamp)
      
      // 确定要清理的数量
      const cleanupCount = count || Math.max(1, Math.floor(allData.length * 0.25))
      const toDelete = allData.slice(0, cleanupCount)
      
      // 删除最旧的数据
      toDelete.forEach(item => {
        sessionStorage.removeItem(item.key)
      })
      
      return toDelete.length
      
    } catch (error) {
      console.error('SessionStorage cleanup error:', error)
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
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
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
      console.error('SessionStorage getAllData error:', error)
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
      const value = sessionStorage.getItem(prefixedKey)
      return value !== null
      
    } catch (error) {
      console.error('SessionStorage exists error:', error)
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
      const sessionId = this.getSessionId()
      
      return {
        sessionId: sessionId,
        totalKeys: keys.length,
        totalSize: size,
        availableSpace: this.maxSize - size,
        usagePercentage: Math.round((size / this.maxSize) * 100)
      }
      
    } catch (error) {
      console.error('SessionStorage getStats error:', error)
      return {
        sessionId: null,
        totalKeys: 0,
        totalSize: 0,
        availableSpace: this.maxSize,
        usagePercentage: 0
      }
    }
  }

  /**
   * 检查会话是否仍然有效
   * @returns {boolean} 会话是否有效
   */
  isSessionValid() {
    try {
      // 尝试访问sessionStorage来检查会话是否仍然有效
      const sessionId = sessionStorage.getItem('_session_id')
      return sessionId !== null
    } catch (error) {
      return false
    }
  }

  /**
   * 获取会话开始时间
   * @returns {number|null} 会话开始时间戳
   */
  getSessionStartTime() {
    try {
      const startTime = sessionStorage.getItem('_session_start_time')
      if (!startTime) {
        const now = Date.now()
        sessionStorage.setItem('_session_start_time', now.toString())
        return now
      }
      return parseInt(startTime, 10)
    } catch (error) {
      return null
    }
  }

  /**
   * 获取会话持续时间
   * @returns {number} 会话持续时间（毫秒）
   */
  getSessionDuration() {
    const startTime = this.getSessionStartTime()
    return startTime ? Date.now() - startTime : 0
  }
}