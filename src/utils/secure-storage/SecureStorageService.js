/**
 * 加密存储核心服务类
 * 提供统一的加密存储接口，集成所有子模块功能
 */

import EncryptionEngine from './EncryptionEngine'
import KeyManager from './KeyManager'
import DataClassifier from './DataClassifier'
import StorageAdapters from './adapters'
import SecurityMonitor from './SecurityMonitor'
import { DATA_CLASSIFICATIONS } from './index'

export default class SecureStorageService {
  constructor(options = {}) {
    // 初始化子模块
    this.encryptionEngine = new EncryptionEngine()
    this.keyManager = new KeyManager(options.keyOptions)
    this.dataClassifier = new DataClassifier()
    this.storageAdapters = new StorageAdapters()
    this.securityMonitor = new SecurityMonitor()
    
    // 内存缓存
    this.memoryCache = new Map()
    this.cacheTimeout = options.cacheTimeout || 5 * 60 * 1000 // 5分钟
  }

  /**
   * 存储数据
   * @param {string} key - 数据键名
   * @param {any} data - 要存储的数据
   * @param {Object} options - 存储选项
   * @param {string} options.classification - 数据分类
   * @param {number} options.expireTime - 过期时间戳
   * @param {string} options.storageLocation - 强制指定存储位置
   * @returns {Promise<boolean>} 存储是否成功
   */
  async store(key, data, options = {}) {
    try {
      // 记录访问日志
      this.securityMonitor.logAccess('store', key, options.classification)

      // 数据分类
      const classification = options.classification || this.dataClassifier.classify(key, data)
      
      // 获取存储策略
      const storagePolicy = this.dataClassifier.getStoragePolicy(classification)
      const encryptionLevel = this.dataClassifier.getEncryptionLevel(classification)
      
      // 准备数据包
      const dataPackage = {
        data,
        classification,
        timestamp: Date.now(),
        expireTime: options.expireTime || (Date.now() + storagePolicy.ttl)
      }

      let processedData
      if (encryptionLevel.algorithm === 'base64') {
        // 低敏感数据使用Base64编码
        processedData = {
          version: 1,
          algorithm: 'base64',
          data: btoa(JSON.stringify(dataPackage)),
          timestamp: dataPackage.timestamp,
          expireTime: dataPackage.expireTime
        }
      } else {
        // 中高敏感数据使用AES加密
        const encryptionKey = await this.keyManager.getActiveKey(classification)
        const encrypted = await this.encryptionEngine.encrypt(
          JSON.stringify(dataPackage),
          encryptionKey,
          encryptionLevel.algorithm
        )
        
        processedData = {
          version: 1,
          algorithm: encryptionLevel.algorithm,
          keyId: encryptionKey.id,
          ...encrypted,
          timestamp: dataPackage.timestamp,
          expireTime: dataPackage.expireTime
        }
      }

      // 选择存储位置
      const storageLocation = options.storageLocation || storagePolicy.location
      
      // 存储数据
      const success = await this.storageAdapters.write(storageLocation, key, processedData)
      
      // 更新内存缓存
      if (success && storagePolicy.enableCache) {
        this.memoryCache.set(key, {
          data,
          timestamp: Date.now(),
          expireTime: dataPackage.expireTime
        })
        
        // 设置缓存清理定时器
        setTimeout(() => {
          this.memoryCache.delete(key)
        }, this.cacheTimeout)
      }

      this.securityMonitor.logAccess('store', key, classification, success ? 'success' : 'failed')
      return success
      
    } catch (error) {
      this.securityMonitor.logSecurityEvent('encryption_error', { key, error: error.message })
      console.error('SecureStorage store error:', error)
      return false
    }
  }

  /**
   * 检索数据
   * @param {string} key - 数据键名
   * @param {Object} options - 检索选项
   * @param {string} options.classification - 预期的数据分类
   * @returns {Promise<any>} 解密后的数据
   */
  async retrieve(key, options = {}) {
    try {
      // 记录访问日志
      this.securityMonitor.logAccess('retrieve', key, options.classification)

      // 优先从内存缓存获取
      if (this.memoryCache.has(key)) {
        const cached = this.memoryCache.get(key)
        if (cached.expireTime > Date.now()) {
          this.securityMonitor.logAccess('retrieve', key, 'cache', 'success')
          return cached.data
        } else {
          this.memoryCache.delete(key)
        }
      }

      // 获取数据分类和存储策略
      const classification = options.classification || this.dataClassifier.classifyByKey(key)
      const storagePolicy = this.dataClassifier.getStoragePolicy(classification)
      
      // 从存储中读取
      const storedData = await this.storageAdapters.read(storagePolicy.location, key)
      if (!storedData) {
        this.securityMonitor.logAccess('retrieve', key, classification, 'not_found')
        return null
      }

      // 检查数据有效期
      if (storedData.expireTime && storedData.expireTime < Date.now()) {
        // 数据已过期，自动清理
        await this.remove(key)
        this.securityMonitor.logAccess('retrieve', key, classification, 'expired')
        return null
      }

      let originalData
      if (storedData.algorithm === 'base64') {
        // Base64解码
        const decoded = JSON.parse(atob(storedData.data))
        originalData = decoded.data
      } else {
        // AES解密
        const decryptionKey = await this.keyManager.getKey(storedData.keyId)
        if (!decryptionKey) {
          throw new Error('Decryption key not found')
        }

        const decryptedJson = await this.encryptionEngine.decrypt(
          {
            encryptedData: storedData.encryptedData,
            iv: storedData.iv,
            authTag: storedData.authTag
          },
          decryptionKey,
          storedData.algorithm
        )
        
        const dataPackage = JSON.parse(decryptedJson)
        originalData = dataPackage.data
      }

      // 验证HMAC
      if (storedData.hmac) {
        const isValid = await this.encryptionEngine.verifyHMAC(
          JSON.stringify(originalData),
          storedData.hmac,
          await this.keyManager.getHMACKey()
        )
        
        if (!isValid) {
          this.securityMonitor.logSecurityEvent('data_tampering', { key })
          throw new Error('Data integrity verification failed')
        }
      }

      this.securityMonitor.logAccess('retrieve', key, classification, 'success')
      return originalData
      
    } catch (error) {
      this.securityMonitor.logSecurityEvent('decryption_error', { key, error: error.message })
      console.error('SecureStorage retrieve error:', error)
      return null
    }
  }

  /**
   * 删除数据
   * @param {string} key - 数据键名
   * @returns {Promise<boolean>} 删除是否成功
   */
  async remove(key) {
    try {
      this.securityMonitor.logAccess('remove', key)

      // 从内存缓存中删除
      this.memoryCache.delete(key)

      // 从所有存储位置删除
      const results = await Promise.all([
        this.storageAdapters.delete('indexeddb', key),
        this.storageAdapters.delete('localstorage', key),
        this.storageAdapters.delete('sessionstorage', key)
      ])

      const success = results.some(result => result)
      this.securityMonitor.logAccess('remove', key, null, success ? 'success' : 'failed')
      return success
      
    } catch (error) {
      console.error('SecureStorage remove error:', error)
      return false
    }
  }

  /**
   * 清空指定分类的所有数据
   * @param {string} classification - 数据分类
   * @returns {Promise<boolean>} 清空是否成功
   */
  async clear(classification = null) {
    try {
      this.securityMonitor.logAccess('clear', 'all', classification)

      // 清空内存缓存
      this.memoryCache.clear()

      // 清空存储
      if (classification) {
        // 清空特定分类的数据
        const storagePolicy = this.dataClassifier.getStoragePolicy(classification)
        await this.storageAdapters.clear(storagePolicy.location)
      } else {
        // 清空所有存储
        await Promise.all([
          this.storageAdapters.clear('indexeddb'),
          this.storageAdapters.clear('localstorage'),
          this.storageAdapters.clear('sessionstorage')
        ])
      }

      this.securityMonitor.logAccess('clear', 'all', classification, 'success')
      return true
      
    } catch (error) {
      console.error('SecureStorage clear error:', error)
      return false
    }
  }

  /**
   * 检查密钥是否过期
   * @param {string} key - 数据键名
   * @returns {Promise<boolean>} 是否过期
   */
  async isExpired(key) {
    try {
      const classification = this.dataClassifier.classifyByKey(key)
      const storagePolicy = this.dataClassifier.getStoragePolicy(classification)
      const storedData = await this.storageAdapters.read(storagePolicy.location, key)
      
      if (!storedData || !storedData.expireTime) {
        return true
      }
      
      return storedData.expireTime < Date.now()
    } catch (error) {
      console.error('SecureStorage isExpired error:', error)
      return true
    }
  }

  /**
   * 执行密钥轮换
   * @returns {Promise<boolean>} 轮换是否成功
   */
  async rotateKeys() {
    try {
      this.securityMonitor.logSecurityEvent('key_rotation_start')
      
      const success = await this.keyManager.rotateKeys()
      
      if (success) {
        // 清空内存缓存，强制重新加密
        this.memoryCache.clear()
        this.securityMonitor.logSecurityEvent('key_rotation_success')
      } else {
        this.securityMonitor.logSecurityEvent('key_rotation_failed')
      }
      
      return success
    } catch (error) {
      this.securityMonitor.logSecurityEvent('key_rotation_error', { error: error.message })
      return false
    }
  }

  /**
   * 获取存储统计信息
   * @returns {Object} 统计信息
   */
  async getStats() {
    return {
      memoryCache: {
        size: this.memoryCache.size,
        keys: Array.from(this.memoryCache.keys())
      },
      security: await this.securityMonitor.getStats(),
      keys: await this.keyManager.getStats()
    }
  }
}