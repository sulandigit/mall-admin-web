/**
 * 密钥管理器
 * 负责密钥的生成、派生、轮换和生命周期管理
 */

import EncryptionEngine from './EncryptionEngine'
import { DATA_CLASSIFICATIONS } from './index'

export default class KeyManager {
  constructor(options = {}) {  
    this.encryptionEngine = new EncryptionEngine()
    
    // 配置参数
    this.keyRotationInterval = options.keyRotationInterval || 7 * 24 * 60 * 60 * 1000 // 7天
    this.keyRetentionPeriod = options.keyRetentionPeriod || 30 * 24 * 60 * 60 * 1000 // 30天
    this.pbkdf2Iterations = options.pbkdf2Iterations || 100000
    
    // 密钥存储
    this.activeKeys = new Map() // 当前活跃密钥
    this.retiredKeys = new Map() // 已退休密钥（保留期内）
    this.hmacKey = null // HMAC密钥
    
    // 初始化主密码
    this.masterPassword = this.generateMasterPassword()
    
    this.initializeKeys()
  }

  /**
   * 生成主密码
   * @returns {string} 主密码
   */
  generateMasterPassword() {
    // 从浏览器指纹、时间戳等生成相对稳定的主密码
    const fingerprint = this.generateBrowserFingerprint()
    const timestamp = Math.floor(Date.now() / (24 * 60 * 60 * 1000)) // 按天取整
    return this.encryptionEngine.generateRandomPassword() + fingerprint + timestamp
  }

  /**
   * 生成浏览器指纹
   * @returns {string} 浏览器指纹
   */
  generateBrowserFingerprint() {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillText('Browser fingerprint', 2, 2)
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|')
    
    return btoa(fingerprint).slice(0, 16)
  }

  /**
   * 初始化密钥系统
   */
  async initializeKeys() {
    try {
      // 尝试从存储中恢复密钥
      await this.loadKeysFromStorage()
      
      // 如果没有找到密钥，则生成新密钥
      if (this.activeKeys.size === 0) {
        await this.generateInitialKeys()
      }
      
      // 生成或恢复HMAC密钥
      if (!this.hmacKey) {
        this.hmacKey = await this.generateHMACKey()
      }
      
      // 启动密钥轮换定时器
      this.startKeyRotationTimer()
      
    } catch (error) {
      console.error('Key initialization error:', error)
      // 生成新密钥作为后备方案
      await this.generateInitialKeys()
    }
  }

  /**
   * 生成初始密钥集
   */
  async generateInitialKeys() {
    const timestamp = Date.now()
    
    for (const classification of Object.values(DATA_CLASSIFICATIONS)) {
      const keyId = this.generateKeyId(classification, timestamp)
      const salt = this.encryptionEngine.generateSalt()
      
      let algorithm, keyLength
      switch (classification) {
        case DATA_CLASSIFICATIONS.HIGH_SENSITIVE:
          algorithm = 'AES-GCM'
          keyLength = 256
          break
        case DATA_CLASSIFICATIONS.MEDIUM_SENSITIVE:
          algorithm = 'AES-CBC'
          keyLength = 128
          break
        default:
          continue // 低敏感数据不需要加密密钥
      }
      
      const key = await this.encryptionEngine.deriveKeyFromPassword(
        this.masterPassword + classification,
        salt,
        this.pbkdf2Iterations,
        keyLength,
        algorithm
      )
      
      this.activeKeys.set(classification, {
        id: keyId,
        key: key,
        salt: salt,
        algorithm: algorithm,
        keyLength: keyLength,
        createdAt: timestamp,
        classification: classification
      })
    }
    
    // 保存密钥到存储
    await this.saveKeysToStorage()
  }

  /**
   * 生成密钥ID
   * @param {string} classification - 数据分类
   * @param {number} timestamp - 时间戳
   * @returns {string} 密钥ID
   */
  generateKeyId(classification, timestamp) {
    const random = Math.random().toString(36).substring(2, 15)
    return `${classification}_${timestamp}_${random}`
  }

  /**
   * 获取活跃密钥
   * @param {string} classification - 数据分类
   * @returns {Promise<Object>} 密钥信息
   */
  async getActiveKey(classification) {
    if (!this.activeKeys.has(classification)) {
      throw new Error(`No active key found for classification: ${classification}`)
    }
    
    const keyInfo = this.activeKeys.get(classification)
    
    // 检查密钥是否需要轮换
    if (this.shouldRotateKey(keyInfo)) {
      await this.rotateKeyForClassification(classification)
      return this.activeKeys.get(classification)
    }
    
    return keyInfo
  }

  /**
   * 根据密钥ID获取密钥
   * @param {string} keyId - 密钥ID
   * @returns {Promise<CryptoKey|null>} 密钥对象
   */
  async getKey(keyId) {
    // 先在活跃密钥中查找
    for (const keyInfo of this.activeKeys.values()) {
      if (keyInfo.id === keyId) {
        return keyInfo.key
      }
    }
    
    // 再在已退休密钥中查找
    if (this.retiredKeys.has(keyId)) {
      const retiredKeyInfo = this.retiredKeys.get(keyId)
      
      // 检查是否在保留期内
      if (Date.now() - retiredKeyInfo.retiredAt < this.keyRetentionPeriod) {
        return retiredKeyInfo.key
      } else {
        // 已过期，删除密钥
        this.retiredKeys.delete(keyId)
        await this.saveKeysToStorage()
      }
    }
    
    return null
  }

  /**
   * 获取HMAC密钥
   * @returns {Promise<CryptoKey>} HMAC密钥
   */
  async getHMACKey() {
    if (!this.hmacKey) {
      this.hmacKey = await this.generateHMACKey()
    }
    return this.hmacKey
  }

  /**
   * 生成HMAC密钥
   * @returns {Promise<CryptoKey>} HMAC密钥
   */
  async generateHMACKey() {
    const salt = this.encryptionEngine.generateSalt()
    return await this.encryptionEngine.deriveKeyFromPassword(
      this.masterPassword + 'hmac',
      salt,
      this.pbkdf2Iterations,
      256,
      'HMAC'
    )
  }

  /**
   * 检查密钥是否需要轮换
   * @param {Object} keyInfo - 密钥信息
   * @returns {boolean} 是否需要轮换
   */
  shouldRotateKey(keyInfo) {
    return (Date.now() - keyInfo.createdAt) > this.keyRotationInterval
  }

  /**
   * 为特定分类轮换密钥
   * @param {string} classification - 数据分类
   * @returns {Promise<boolean>} 轮换是否成功
   */
  async rotateKeyForClassification(classification) {
    try {
      const oldKeyInfo = this.activeKeys.get(classification)
      if (!oldKeyInfo) {
        return false
      }
      
      // 生成新密钥
      const timestamp = Date.now()
      const keyId = this.generateKeyId(classification, timestamp)
      const salt = this.encryptionEngine.generateSalt()
      
      const newKey = await this.encryptionEngine.deriveKeyFromPassword(
        this.masterPassword + classification + timestamp, // 加入时间戳确保唯一性
        salt,
        this.pbkdf2Iterations,
        oldKeyInfo.keyLength,
        oldKeyInfo.algorithm
      )
      
      // 将旧密钥移到已退休密钥集合
      this.retiredKeys.set(oldKeyInfo.id, {
        ...oldKeyInfo,
        retiredAt: timestamp
      })
      
      // 设置新的活跃密钥
      this.activeKeys.set(classification, {
        id: keyId,
        key: newKey,
        salt: salt,
        algorithm: oldKeyInfo.algorithm,
        keyLength: oldKeyInfo.keyLength,
        createdAt: timestamp,
        classification: classification
      })
      
      // 保存到存储
      await this.saveKeysToStorage()
      
      return true
    } catch (error) {
      console.error('Key rotation error:', error)
      return false
    }
  }

  /**
   * 轮换所有密钥
   * @returns {Promise<boolean>} 轮换是否成功
   */
  async rotateKeys() {
    try {
      const classifications = Array.from(this.activeKeys.keys())
      const results = await Promise.all(
        classifications.map(classification => this.rotateKeyForClassification(classification))
      )
      
      // 轮换HMAC密钥
      this.hmacKey = await this.generateHMACKey()
      
      return results.every(result => result)
    } catch (error) {
      console.error('Bulk key rotation error:', error)
      return false
    }
  }

  /**
   * 启动密钥轮换定时器
   */
  startKeyRotationTimer() {
    // 清除现有定时器
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer)
    }
    
    // 设置新的定时器，每天检查一次
    this.rotationTimer = setInterval(async () => {
      for (const [classification, keyInfo] of this.activeKeys.entries()) {
        if (this.shouldRotateKey(keyInfo)) {
          await this.rotateKeyForClassification(classification)
        }
      }
      
      // 清理过期的已退休密钥
      await this.cleanupExpiredKeys()
    }, 24 * 60 * 60 * 1000) // 24小时
  }

  /**
   * 清理过期的已退休密钥
   */
  async cleanupExpiredKeys() {
    const now = Date.now()
    const expiredKeys = []
    
    for (const [keyId, keyInfo] of this.retiredKeys.entries()) {
      if (now - keyInfo.retiredAt > this.keyRetentionPeriod) {
        expiredKeys.push(keyId)
      }
    }
    
    for (const keyId of expiredKeys) {
      this.retiredKeys.delete(keyId)
    }
    
    if (expiredKeys.length > 0) {
      await this.saveKeysToStorage()
    }
  }

  /**
   * 保存密钥到存储
   */
  async saveKeysToStorage() {
    try {
      // 将密钥信息序列化（不包含实际的CryptoKey对象）
      const keyData = {
        activeKeys: {},
        retiredKeys: {},
        lastRotation: Date.now()
      }
      
      // 序列化活跃密钥信息
      for (const [classification, keyInfo] of this.activeKeys.entries()) {
        keyData.activeKeys[classification] = {
          id: keyInfo.id,
          salt: Array.from(keyInfo.salt), // 转换为数组以便序列化
          algorithm: keyInfo.algorithm,
          keyLength: keyInfo.keyLength,
          createdAt: keyInfo.createdAt,
          classification: keyInfo.classification
        }
      }
      
      // 序列化已退休密钥信息
      for (const [keyId, keyInfo] of this.retiredKeys.entries()) {
        keyData.retiredKeys[keyId] = {
          id: keyInfo.id,
          salt: Array.from(keyInfo.salt),
          algorithm: keyInfo.algorithm,
          keyLength: keyInfo.keyLength,
          createdAt: keyInfo.createdAt,
          retiredAt: keyInfo.retiredAt,
          classification: keyInfo.classification
        }
      }
      
      // 使用Base64编码存储到localStorage
      localStorage.setItem('_secure_storage_keys', btoa(JSON.stringify(keyData)))
      
    } catch (error) {
      console.error('Key storage error:', error)
    }
  }

  /**
   * 从存储中加载密钥
   */
  async loadKeysFromStorage() {
    try {
      const storedData = localStorage.getItem('_secure_storage_keys')
      if (!storedData) {
        return
      }
      
      const keyData = JSON.parse(atob(storedData))
      
      // 恢复活跃密钥
      for (const [classification, keyInfo] of Object.entries(keyData.activeKeys)) {
        const salt = new Uint8Array(keyInfo.salt)
        
        const key = await this.encryptionEngine.deriveKeyFromPassword(
          this.masterPassword + classification,
          salt,
          this.pbkdf2Iterations,
          keyInfo.keyLength,
          keyInfo.algorithm
        )
        
        this.activeKeys.set(classification, {
          ...keyInfo,
          key: key,
          salt: salt
        })
      }
      
      // 恢复已退休密钥
      for (const [keyId, keyInfo] of Object.entries(keyData.retiredKeys)) {
        // 检查是否还在保留期内
        if (Date.now() - keyInfo.retiredAt < this.keyRetentionPeriod) {
          const salt = new Uint8Array(keyInfo.salt)
          
          const key = await this.encryptionEngine.deriveKeyFromPassword(
            this.masterPassword + keyInfo.classification + keyInfo.createdAt,
            salt,
            this.pbkdf2Iterations,
            keyInfo.keyLength,
            keyInfo.algorithm
          )
          
          this.retiredKeys.set(keyId, {
            ...keyInfo,
            key: key,
            salt: salt
          })
        }
      }
      
    } catch (error) {
      console.error('Key loading error:', error)
      // 如果加载失败，将在initializeKeys中生成新密钥
    }
  }

  /**
   * 清除所有密钥
   */
  async clearAllKeys() {
    this.activeKeys.clear()
    this.retiredKeys.clear()
    this.hmacKey = null
    
    // 清除定时器
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer)
      this.rotationTimer = null
    }
    
    // 清除存储
    localStorage.removeItem('_secure_storage_keys')
  }

  /**
   * 获取密钥统计信息
   * @returns {Object} 统计信息
   */
  async getStats() {
    return {
      activeKeys: this.activeKeys.size,
      retiredKeys: this.retiredKeys.size,
      keyRotationInterval: this.keyRotationInterval,
      keyRetentionPeriod: this.keyRetentionPeriod,
      lastRotation: Math.min(...Array.from(this.activeKeys.values()).map(k => k.createdAt)),
      nextRotation: Math.min(...Array.from(this.activeKeys.values()).map(k => k.createdAt + this.keyRotationInterval))
    }
  }

  /**
   * 验证密钥完整性
   * @param {string} keyId - 密钥ID
   * @returns {Promise<boolean>} 验证结果
   */
  async validateKeyIntegrity(keyId) {
    try {
      const key = await this.getKey(keyId)
      if (!key) {
        return false
      }
      
      // 尝试用密钥加密和解密测试数据
      const testData = 'integrity_test_' + Date.now()
      const encrypted = await this.encryptionEngine.encrypt(testData, key)
      const decrypted = await this.encryptionEngine.decrypt(encrypted, key)
      
      return decrypted === testData
    } catch (error) {
      console.error('Key integrity validation error:', error)
      return false
    }
  }
}