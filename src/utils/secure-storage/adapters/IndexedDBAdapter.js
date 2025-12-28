/**
 * IndexedDB存储适配器
 * 提供高性能的结构化数据存储，支持大容量数据
 */

export default class IndexedDBAdapter {
  constructor(options = {}) {
    this.dbName = options.dbName || 'SecureStorageDB'
    this.version = options.version || 1
    this.objectStoreName = options.objectStoreName || 'secureData'
    this.db = null
    this.initPromise = this.initialize()
  }

  /**
   * 初始化IndexedDB数据库
   * @returns {Promise<void>}
   */
  async initialize() {
    if (!this.isSupported()) {
      throw new Error('IndexedDB is not supported')
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'))
      }

      request.onsuccess = (event) => {
        this.db = event.target.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // 创建对象存储
        if (!db.objectStoreNames.contains(this.objectStoreName)) {
          const objectStore = db.createObjectStore(this.objectStoreName, { keyPath: 'key' })
          
          // 创建索引
          objectStore.createIndex('timestamp', 'timestamp', { unique: false })
          objectStore.createIndex('expireTime', 'expireTime', { unique: false })
          objectStore.createIndex('classification', 'classification', { unique: false })
        }
      }
    })
  }

  /**
   * 检查IndexedDB是否支持
   * @returns {boolean} 是否支持
   */
  isSupported() {
    return typeof indexedDB !== 'undefined'
  }

  /**
   * 确保数据库已初始化
   * @returns {Promise<void>}
   */
  async ensureInitialized() {
    await this.initPromise
    if (!this.db) {
      throw new Error('IndexedDB not initialized')
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
      await this.ensureInitialized()

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.objectStoreName], 'readwrite')
        const objectStore = transaction.objectStore(this.objectStoreName)

        const data = {
          key: key,
          value: value,
          timestamp: Date.now(),
          expireTime: value.expireTime || null,
          classification: value.classification || null
        }

        const request = objectStore.put(data)

        request.onsuccess = () => {
          resolve(true)
        }

        request.onerror = () => {
          console.error('IndexedDB write error:', request.error)
          resolve(false)
        }

        transaction.onerror = () => {
          console.error('IndexedDB transaction error:', transaction.error)
          resolve(false)
        }
      })
    } catch (error) {
      console.error('IndexedDB write error:', error)
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
      await this.ensureInitialized()

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.objectStoreName], 'readonly')
        const objectStore = transaction.objectStore(this.objectStoreName)
        const request = objectStore.get(key)

        request.onsuccess = () => {
          const result = request.result
          if (result) {
            // 检查数据是否过期
            if (result.expireTime && result.expireTime < Date.now()) {
              // 数据已过期，删除并返回null
              this.delete(key)
              resolve(null)
            } else {
              resolve(result.value)
            }
          } else {
            resolve(null)
          }
        }

        request.onerror = () => {
          console.error('IndexedDB read error:', request.error)
          resolve(null)
        }
      })
    } catch (error) {
      console.error('IndexedDB read error:', error)
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
      await this.ensureInitialized()

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.objectStoreName], 'readwrite')
        const objectStore = transaction.objectStore(this.objectStoreName)
        const request = objectStore.delete(key)

        request.onsuccess = () => {
          resolve(true)
        }

        request.onerror = () => {
          console.error('IndexedDB delete error:', request.error)
          resolve(false)
        }
      })
    } catch (error) {
      console.error('IndexedDB delete error:', error)
      return false
    }
  }

  /**
   * 清空所有数据
   * @returns {Promise<boolean>} 是否成功
   */
  async clear() {
    try {
      await this.ensureInitialized()

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.objectStoreName], 'readwrite')
        const objectStore = transaction.objectStore(this.objectStoreName)
        const request = objectStore.clear()

        request.onsuccess = () => {
          resolve(true)
        }

        request.onerror = () => {
          console.error('IndexedDB clear error:', request.error)
          resolve(false)
        }
      })
    } catch (error) {
      console.error('IndexedDB clear error:', error)
      return false
    }
  }

  /**
   * 获取所有键名
   * @returns {Promise<Array<string>>} 键名数组
   */
  async getKeys() {
    try {
      await this.ensureInitialized()

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.objectStoreName], 'readonly')
        const objectStore = transaction.objectStore(this.objectStoreName)
        const request = objectStore.getAllKeys()

        request.onsuccess = () => {
          resolve(request.result || [])
        }

        request.onerror = () => {
          console.error('IndexedDB getKeys error:', request.error)
          resolve([])
        }
      })
    } catch (error) {
      console.error('IndexedDB getKeys error:', error)
      return []
    }
  }

  /**
   * 获取存储大小（估算）
   * @returns {Promise<number>} 存储大小（字节）
   */
  async getSize() {
    try {
      await this.ensureInitialized()

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.objectStoreName], 'readonly')
        const objectStore = transaction.objectStore(this.objectStoreName)
        const request = objectStore.getAll()

        request.onsuccess = () => {
          const data = request.result || []
          let totalSize = 0

          for (const item of data) {
            // 估算每个项目的大小
            totalSize += JSON.stringify(item).length * 2 // UTF-16编码，每字符2字节
          }

          resolve(totalSize)
        }

        request.onerror = () => {
          console.error('IndexedDB getSize error:', request.error)
          resolve(0)
        }
      })
    } catch (error) {
      console.error('IndexedDB getSize error:', error)
      return 0
    }
  }

  /**
   * 清理过期数据
   * @returns {Promise<number>} 清理的条目数
   */
  async cleanupExpired() {
    try {
      await this.ensureInitialized()

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.objectStoreName], 'readwrite')
        const objectStore = transaction.objectStore(this.objectStoreName)
        const index = objectStore.index('expireTime')
        
        const now = Date.now()
        const range = IDBKeyRange.upperBound(now)
        const request = index.openCursor(range)
        
        let deletedCount = 0

        request.onsuccess = (event) => {
          const cursor = event.target.result
          if (cursor) {
            // 删除过期项
            cursor.delete()
            deletedCount++
            cursor.continue()
          } else {
            resolve(deletedCount)
          }
        }

        request.onerror = () => {
          console.error('IndexedDB cleanup error:', request.error)
          resolve(0)
        }
      })
    } catch (error) {
      console.error('IndexedDB cleanup error:', error)
      return 0
    }
  }

  /**
   * 根据分类获取数据
   * @param {string} classification - 数据分类
   * @returns {Promise<Array>} 数据数组
   */
  async getByClassification(classification) {
    try {
      await this.ensureInitialized()

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.objectStoreName], 'readonly')
        const objectStore = transaction.objectStore(this.objectStoreName)
        const index = objectStore.index('classification')
        const request = index.getAll(classification)

        request.onsuccess = () => {
          const results = request.result || []
          // 过滤掉过期数据
          const validResults = results.filter(item => {
            return !item.expireTime || item.expireTime > Date.now()
          })
          resolve(validResults)
        }

        request.onerror = () => {
          console.error('IndexedDB getByClassification error:', request.error)
          resolve([])
        }
      })
    } catch (error) {
      console.error('IndexedDB getByClassification error:', error)
      return []
    }
  }

  /**
   * 关闭数据库连接
   */
  close() {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }

  /**
   * 删除整个数据库
   * @returns {Promise<boolean>} 是否成功
   */
  async deleteDatabase() {
    try {
      this.close()

      return new Promise((resolve, reject) => {
        const deleteRequest = indexedDB.deleteDatabase(this.dbName)

        deleteRequest.onsuccess = () => {
          resolve(true)
        }

        deleteRequest.onerror = () => {
          console.error('Database deletion error:', deleteRequest.error)
          resolve(false)
        }

        deleteRequest.onblocked = () => {
          console.warn('Database deletion blocked')
          resolve(false)
        }
      })
    } catch (error) {
      console.error('Delete database error:', error)
      return false
    }
  }
}