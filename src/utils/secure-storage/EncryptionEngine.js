/**
 * 加密引擎
 * 提供AES-256-GCM、AES-128-CBC加密解密功能
 * 支持HMAC完整性验证
 */

export default class EncryptionEngine {
  constructor() {
    // 检查Web Crypto API支持
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error('Web Crypto API not supported')
    }
    this.crypto = window.crypto.subtle
  }

  /**
   * 生成随机初始化向量
   * @param {number} length - IV长度，默认16字节
   * @returns {Uint8Array} 随机IV
   */
  generateIV(length = 16) {
    return window.crypto.getRandomValues(new Uint8Array(length))
  }

  /**
   * 生成随机盐值
   * @param {number} length - 盐值长度，默认32字节
   * @returns {Uint8Array} 随机盐值
   */
  generateSalt(length = 32) {
    return window.crypto.getRandomValues(new Uint8Array(length))
  }

  /**
   * 将字符串转换为ArrayBuffer
   * @param {string} str - 输入字符串
   * @returns {ArrayBuffer} 转换后的ArrayBuffer
   */
  stringToArrayBuffer(str) {
    return new TextEncoder().encode(str)
  }

  /**
   * 将ArrayBuffer转换为字符串
   * @param {ArrayBuffer} buffer - 输入buffer
   * @returns {string} 转换后的字符串
   */
  arrayBufferToString(buffer) {
    return new TextDecoder().decode(buffer)
  }

  /**
   * 将ArrayBuffer转换为Base64字符串
   * @param {ArrayBuffer} buffer - 输入buffer
   * @returns {string} Base64字符串
   */
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  /**
   * 将Base64字符串转换为ArrayBuffer
   * @param {string} base64 - Base64字符串
   * @returns {ArrayBuffer} 转换后的ArrayBuffer
   */
  base64ToArrayBuffer(base64) {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }

  /**
   * 使用AES-256-GCM加密数据
   * @param {string} plaintext - 明文数据
   * @param {CryptoKey} key - 加密密钥
   * @returns {Promise<Object>} 加密结果 {encryptedData, iv, authTag}
   */
  async encryptWithAES256GCM(plaintext, key) {
    try {
      const iv = this.generateIV(12) // GCM模式使用12字节IV
      const data = this.stringToArrayBuffer(plaintext)

      const encrypted = await this.crypto.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        data
      )

      // GCM模式加密结果包含认证标签
      const encryptedArray = new Uint8Array(encrypted)
      const encryptedData = encryptedArray.slice(0, -16) // 数据部分
      const authTag = encryptedArray.slice(-16) // 最后16字节是认证标签

      return {
        encryptedData: this.arrayBufferToBase64(encryptedData),
        iv: this.arrayBufferToBase64(iv),
        authTag: this.arrayBufferToBase64(authTag)
      }
    } catch (error) {
      console.error('AES-256-GCM encryption error:', error)
      throw new Error('Encryption failed')
    }
  }

  /**
   * 使用AES-256-GCM解密数据
   * @param {Object} encryptedData - 加密数据 {encryptedData, iv, authTag}
   * @param {CryptoKey} key - 解密密钥
   * @returns {Promise<string>} 解密后的明文
   */
  async decryptWithAES256GCM(encryptedData, key) {
    try {
      const iv = new Uint8Array(this.base64ToArrayBuffer(encryptedData.iv))
      const data = new Uint8Array(this.base64ToArrayBuffer(encryptedData.encryptedData))
      const authTag = new Uint8Array(this.base64ToArrayBuffer(encryptedData.authTag))

      // 合并数据和认证标签
      const combined = new Uint8Array(data.length + authTag.length)
      combined.set(data)
      combined.set(authTag, data.length)

      const decrypted = await this.crypto.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        combined
      )

      return this.arrayBufferToString(decrypted)
    } catch (error) {
      console.error('AES-256-GCM decryption error:', error)
      throw new Error('Decryption failed')
    }
  }

  /**
   * 使用AES-128-CBC加密数据
   * @param {string} plaintext - 明文数据
   * @param {CryptoKey} key - 加密密钥
   * @returns {Promise<Object>} 加密结果 {encryptedData, iv}
   */
  async encryptWithAES128CBC(plaintext, key) {
    try {
      const iv = this.generateIV(16) // CBC模式使用16字节IV
      const data = this.stringToArrayBuffer(plaintext)

      const encrypted = await this.crypto.encrypt(
        {
          name: 'AES-CBC',
          iv: iv
        },
        key,
        data
      )

      return {
        encryptedData: this.arrayBufferToBase64(encrypted),
        iv: this.arrayBufferToBase64(iv)
      }
    } catch (error) {
      console.error('AES-128-CBC encryption error:', error)
      throw new Error('Encryption failed')
    }
  }

  /**
   * 使用AES-128-CBC解密数据
   * @param {Object} encryptedData - 加密数据 {encryptedData, iv}
   * @param {CryptoKey} key - 解密密钥
   * @returns {Promise<string>} 解密后的明文
   */
  async decryptWithAES128CBC(encryptedData, key) {
    try {
      const iv = new Uint8Array(this.base64ToArrayBuffer(encryptedData.iv))
      const data = this.base64ToArrayBuffer(encryptedData.encryptedData)

      const decrypted = await this.crypto.decrypt(
        {
          name: 'AES-CBC',
          iv: iv
        },
        key,
        data
      )

      return this.arrayBufferToString(decrypted)
    } catch (error) {
      console.error('AES-128-CBC decryption error:', error)
      throw new Error('Decryption failed')
    }
  }

  /**
   * 通用加密方法
   * @param {string} plaintext - 明文数据
   * @param {CryptoKey} key - 加密密钥
   * @param {string} algorithm - 加密算法 (aes-256-gcm | aes-128-cbc)
   * @returns {Promise<Object>} 加密结果
   */
  async encrypt(plaintext, key, algorithm = 'aes-256-gcm') {
    switch (algorithm.toLowerCase()) {
      case 'aes-256-gcm':
        return await this.encryptWithAES256GCM(plaintext, key)
      case 'aes-128-cbc':
        return await this.encryptWithAES128CBC(plaintext, key)
      default:
        throw new Error(`Unsupported encryption algorithm: ${algorithm}`)
    }
  }

  /**
   * 通用解密方法
   * @param {Object} encryptedData - 加密数据
   * @param {CryptoKey} key - 解密密钥
   * @param {string} algorithm - 加密算法 (aes-256-gcm | aes-128-cbc)
   * @returns {Promise<string>} 解密后的明文
   */
  async decrypt(encryptedData, key, algorithm = 'aes-256-gcm') {
    switch (algorithm.toLowerCase()) {
      case 'aes-256-gcm':
        return await this.decryptWithAES256GCM(encryptedData, key)
      case 'aes-128-cbc':
        return await this.decryptWithAES128CBC(encryptedData, key)
      default:
        throw new Error(`Unsupported decryption algorithm: ${algorithm}`)
    }
  }

  /**
   * 计算HMAC-SHA256
   * @param {string} data - 数据
   * @param {CryptoKey} key - HMAC密钥
   * @returns {Promise<string>} HMAC值 (Base64编码)
   */
  async computeHMAC(data, key) {
    try {
      const dataBuffer = this.stringToArrayBuffer(data)
      const signature = await this.crypto.sign('HMAC', key, dataBuffer)
      return this.arrayBufferToBase64(signature)
    } catch (error) {
      console.error('HMAC computation error:', error)
      throw new Error('HMAC computation failed')
    }
  }

  /**
   * 验证HMAC-SHA256
   * @param {string} data - 原始数据
   * @param {string} hmac - HMAC值 (Base64编码)
   * @param {CryptoKey} key - HMAC密钥
   * @returns {Promise<boolean>} 验证结果
   */
  async verifyHMAC(data, hmac, key) {
    try {
      const dataBuffer = this.stringToArrayBuffer(data)
      const signatureBuffer = this.base64ToArrayBuffer(hmac)
      return await this.crypto.verify('HMAC', key, signatureBuffer, dataBuffer)
    } catch (error) {
      console.error('HMAC verification error:', error)
      return false
    }
  }

  /**
   * 生成AES密钥
   * @param {number} keyLength - 密钥长度 (128 | 256)
   * @param {string} usage - 密钥用途 ['encrypt', 'decrypt']
   * @returns {Promise<CryptoKey>} 生成的密钥
   */
  async generateAESKey(keyLength = 256, usage = ['encrypt', 'decrypt']) {
    return await this.crypto.generateKey(
      {
        name: 'AES-GCM',
        length: keyLength
      },
      false, // 不可导出
      usage
    )
  }

  /**
   * 生成HMAC密钥
   * @param {number} keyLength - 密钥长度，默认256位
   * @returns {Promise<CryptoKey>} 生成的HMAC密钥
   */
  async generateHMACKey(keyLength = 256) {
    return await this.crypto.generateKey(
      {
        name: 'HMAC',
        hash: 'SHA-256',
        length: keyLength
      },
      false, // 不可导出
      ['sign', 'verify']
    )
  }

  /**
   * 从密码派生密钥
   * @param {string} password - 密码
   * @param {Uint8Array} salt - 盐值
   * @param {number} iterations - 迭代次数
   * @param {number} keyLength - 密钥长度
   * @param {string} algorithm - 目标算法 (AES-GCM | AES-CBC | HMAC)
   * @returns {Promise<CryptoKey>} 派生的密钥
   */
  async deriveKeyFromPassword(password, salt, iterations = 100000, keyLength = 256, algorithm = 'AES-GCM') {
    try {
      // 导入密码作为密钥材料
      const passwordKey = await this.crypto.importKey(
        'raw',
        this.stringToArrayBuffer(password),
        'PBKDF2',
        false,
        ['deriveKey']
      )

      // 配置目标算法参数
      let targetAlgorithm
      let keyUsages
      
      switch (algorithm) {
        case 'AES-GCM':
          targetAlgorithm = { name: 'AES-GCM', length: keyLength }
          keyUsages = ['encrypt', 'decrypt']
          break
        case 'AES-CBC':
          targetAlgorithm = { name: 'AES-CBC', length: keyLength }
          keyUsages = ['encrypt', 'decrypt']
          break
        case 'HMAC':
          targetAlgorithm = { name: 'HMAC', hash: 'SHA-256', length: keyLength }
          keyUsages = ['sign', 'verify']
          break
        default:
          throw new Error(`Unsupported algorithm: ${algorithm}`)
      }

      // 派生密钥
      return await this.crypto.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: iterations,
          hash: 'SHA-256'
        },
        passwordKey,
        targetAlgorithm,
        false, // 不可导出
        keyUsages
      )
    } catch (error) {
      console.error('Key derivation error:', error)
      throw new Error('Key derivation failed')
    }
  }

  /**
   * 生成随机密码
   * @param {number} length - 密码长度
   * @returns {string} 随机密码
   */
  generateRandomPassword(length = 32) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    const randomValues = window.crypto.getRandomValues(new Uint8Array(length))
    let password = ''
    
    for (let i = 0; i < length; i++) {
      password += charset[randomValues[i] % charset.length]
    }
    
    return password
  }
}