/**
 * WebP格式管理器
 * 负责WebP支持情况检测和缓存、格式转换逻辑封装、URL路径智能切换
 */

class WebPManager {
  constructor() {
    // 支持状态
    this.supportStatus = {
      UNKNOWN: 'unknown',
      DETECTING: 'detecting', 
      SUPPORTED: 'supported',
      NOT_SUPPORTED: 'not_supported'
    }

    // 当前支持状态
    this.currentStatus = this.supportStatus.UNKNOWN

    // 缓存配置
    this.cacheKey = 'webp-support-cache'
    this.cacheExpiry = 24 * 60 * 60 * 1000 // 24小时

    // 转换配置
    this.config = {
      quality: 0.8,              // 默认质量
      enableFallback: true,      // 启用降级
      maxRetries: 3,             // 最大重试次数
      retryDelay: 1000,          // 重试延迟
      urlPatterns: {             // URL模式配置
        webpSuffix: '.webp',
        webpQuery: '?format=webp',
        webpPath: '/webp/'
      }
    }

    // 统计数据
    this.stats = {
      conversionCount: 0,        // 转换次数
      fallbackCount: 0,          // 降级次数
      errorCount: 0,             // 错误次数
      savedBytes: 0              // 节省字节数
    }

    // 黑名单 - 已知不支持WebP的URL
    this.blacklist = new Set()

    // 转换队列
    this.conversionQueue = []
    this.isProcessingQueue = false

    // 初始化
    this.init()
  }

  /**
   * 初始化管理器
   */
  async init() {
    // 加载缓存的支持状态
    this.loadCachedSupport()
    
    // 如果缓存无效，重新检测
    if (this.currentStatus === this.supportStatus.UNKNOWN) {
      await this.detectSupport()
    }

    // 加载配置
    this.loadConfig()

    // 加载黑名单
    this.loadBlacklist()
  }

  /**
   * 检测WebP支持
   */
  async detectSupport() {
    if (this.currentStatus === this.supportStatus.DETECTING) {
      return this.waitForDetection()
    }

    this.currentStatus = this.supportStatus.DETECTING

    try {
      const isSupported = await this.testWebPSupport()
      this.currentStatus = isSupported 
        ? this.supportStatus.SUPPORTED 
        : this.supportStatus.NOT_SUPPORTED

      // 缓存结果
      this.cacheSupport(this.currentStatus)

      console.log(`WebP support: ${this.currentStatus}`)
      return isSupported

    } catch (error) {
      console.error('WebP detection failed:', error)
      this.currentStatus = this.supportStatus.NOT_SUPPORTED
      return false
    }
  }

  /**
   * 测试WebP支持
   */
  testWebPSupport() {
    return new Promise((resolve) => {
      // 创建一个1x1像素的WebP图片进行测试
      const webpData = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
      
      const img = new Image()
      img.onload = () => {
        // 如果图片成功加载且尺寸正确，说明支持WebP
        resolve(img.width === 2 && img.height === 2)
      }
      img.onerror = () => {
        resolve(false)
      }
      
      // 设置超时
      setTimeout(() => resolve(false), 3000)
      
      img.src = webpData
    })
  }

  /**
   * 等待检测完成
   */
  waitForDetection() {
    return new Promise((resolve) => {
      const checkStatus = () => {
        if (this.currentStatus !== this.supportStatus.DETECTING) {
          resolve(this.currentStatus === this.supportStatus.SUPPORTED)
        } else {
          setTimeout(checkStatus, 100)
        }
      }
      checkStatus()
    })
  }

  /**
   * 缓存支持状态
   */
  cacheSupport(status) {
    try {
      const cacheData = {
        status,
        timestamp: Date.now(),
        expiry: Date.now() + this.cacheExpiry
      }
      localStorage.setItem(this.cacheKey, JSON.stringify(cacheData))
    } catch (error) {
      console.warn('Failed to cache WebP support status:', error)
    }
  }

  /**
   * 加载缓存的支持状态
   */
  loadCachedSupport() {
    try {
      const cached = localStorage.getItem(this.cacheKey)
      if (cached) {
        const cacheData = JSON.parse(cached)
        if (cacheData.expiry > Date.now()) {
          this.currentStatus = cacheData.status
          return true
        }
      }
    } catch (error) {
      console.warn('Failed to load cached WebP support status:', error)
    }
    return false
  }

  /**
   * 加载配置
   */
  loadConfig() {
    try {
      const savedConfig = localStorage.getItem('webp-config')
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) }
      }
    } catch (error) {
      console.warn('Failed to load WebP config:', error)
    }
  }

  /**
   * 保存配置
   */
  saveConfig() {
    try {
      localStorage.setItem('webp-config', JSON.stringify(this.config))
    } catch (error) {
      console.warn('Failed to save WebP config:', error)
    }
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig }
    this.saveConfig()
  }

  /**
   * 加载黑名单
   */
  loadBlacklist() {
    try {
      const blacklistData = localStorage.getItem('webp-blacklist')
      if (blacklistData) {
        const urls = JSON.parse(blacklistData)
        this.blacklist = new Set(urls)
      }
    } catch (error) {
      console.warn('Failed to load WebP blacklist:', error)
    }
  }

  /**
   * 保存黑名单
   */
  saveBlacklist() {
    try {
      const urls = Array.from(this.blacklist)
      localStorage.setItem('webp-blacklist', JSON.stringify(urls))
    } catch (error) {
      console.warn('Failed to save WebP blacklist:', error)
    }
  }

  /**
   * 添加到黑名单
   */
  addToBlacklist(url) {
    this.blacklist.add(url)
    this.saveBlacklist()
  }

  /**
   * 从黑名单移除
   */
  removeFromBlacklist(url) {
    this.blacklist.delete(url)
    this.saveBlacklist()
  }

  /**
   * 检查是否支持WebP
   */
  isSupported() {
    return this.currentStatus === this.supportStatus.SUPPORTED
  }

  /**
   * 检查是否正在检测
   */
  isDetecting() {
    return this.currentStatus === this.supportStatus.DETECTING
  }

  /**
   * 转换URL为WebP格式
   */
  convertToWebPUrl(originalUrl, options = {}) {
    // 检查是否在黑名单中
    if (this.blacklist.has(originalUrl)) {
      return originalUrl
    }

    // 检查是否已经是WebP格式
    if (this.isWebPUrl(originalUrl)) {
      return originalUrl
    }

    // 检查是否为支持转换的格式
    if (!this.isSupportedFormat(originalUrl)) {
      return originalUrl
    }

    const { pattern = 'suffix', quality } = options
    const urlPatterns = this.config.urlPatterns

    try {
      let webpUrl = originalUrl

      switch (pattern) {
        case 'suffix':
          // 替换文件扩展名
          webpUrl = originalUrl.replace(/\.(jpg|jpeg|png)$/i, urlPatterns.webpSuffix)
          break

        case 'query':
          // 添加查询参数
          const separator = originalUrl.includes('?') ? '&' : '?'
          const qualityParam = quality ? `&quality=${quality}` : ''
          webpUrl = `${originalUrl}${separator}format=webp${qualityParam}`
          break

        case 'path':
          // 修改路径
          const urlObj = new URL(originalUrl)
          urlObj.pathname = urlPatterns.webpPath + urlObj.pathname.substring(1)
          webpUrl = urlObj.toString()
          break

        default:
          webpUrl = originalUrl.replace(/\.(jpg|jpeg|png)$/i, urlPatterns.webpSuffix)
      }

      return webpUrl

    } catch (error) {
      console.warn('Failed to convert URL to WebP:', error)
      return originalUrl
    }
  }

  /**
   * 检查是否为WebP URL
   */
  isWebPUrl(url) {
    return /\.webp$/i.test(url) || /format=webp/i.test(url)
  }

  /**
   * 检查是否为支持转换的格式
   */
  isSupportedFormat(url) {
    return /\.(jpg|jpeg|png)$/i.test(url)
  }

  /**
   * 智能获取图片URL
   */
  async getOptimalImageUrl(originalUrl, options = {}) {
    // 如果不支持WebP，直接返回原始URL
    if (!this.isSupported()) {
      return originalUrl
    }

    // 如果在黑名单中，直接返回原始URL
    if (this.blacklist.has(originalUrl)) {
      return originalUrl
    }

    // 尝试转换为WebP
    const webpUrl = this.convertToWebPUrl(originalUrl, options)
    
    // 如果没有变化，说明不需要或无法转换
    if (webpUrl === originalUrl) {
      return originalUrl
    }

    // 启用降级的情况下，测试WebP URL是否有效
    if (this.config.enableFallback) {
      try {
        const isValid = await this.testImageUrl(webpUrl)
        if (isValid) {
          this.stats.conversionCount++
          return webpUrl
        } else {
          // WebP URL无效，添加到黑名单并返回原始URL
          this.addToBlacklist(originalUrl)
          this.stats.fallbackCount++
          return originalUrl
        }
      } catch (error) {
        this.stats.errorCount++
        return originalUrl
      }
    }

    return webpUrl
  }

  /**
   * 测试图片URL是否有效
   */
  testImageUrl(url) {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(true)
      img.onerror = () => resolve(false)
      
      // 设置超时
      setTimeout(() => resolve(false), 5000)
      
      img.src = url
    })
  }

  /**
   * 批量转换图片URL
   */
  async batchConvertUrls(urls, options = {}) {
    const results = []
    
    // 添加到转换队列
    for (const url of urls) {
      this.conversionQueue.push({ url, options, resolve: null, reject: null })
    }

    // 处理队列
    await this.processConversionQueue()

    return results
  }

  /**
   * 处理转换队列
   */
  async processConversionQueue() {
    if (this.isProcessingQueue || this.conversionQueue.length === 0) {
      return
    }

    this.isProcessingQueue = true

    try {
      // 批量处理，避免过度并发
      const batchSize = 5
      while (this.conversionQueue.length > 0) {
        const batch = this.conversionQueue.splice(0, batchSize)
        const promises = batch.map(item => 
          this.getOptimalImageUrl(item.url, item.options)
        )

        await Promise.allSettled(promises)
        
        // 小延迟避免阻塞
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    } finally {
      this.isProcessingQueue = false
    }
  }

  /**
   * 文件转换为WebP
   */
  async convertFileToWebP(file, quality = this.config.quality) {
    return new Promise((resolve, reject) => {
      // 检查文件类型
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        reject(new Error('Unsupported file type for WebP conversion'))
        return
      }

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        try {
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const webpFile = new File(
                  [blob],
                  file.name.replace(/\.(jpg|jpeg|png)$/i, '.webp'),
                  { type: 'image/webp' }
                )
                
                // 统计节省的字节数
                this.stats.savedBytes += file.size - blob.size
                
                resolve(webpFile)
              } else {
                reject(new Error('WebP conversion failed'))
              }
            },
            'image/webp',
            quality
          )
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error('Failed to load image for conversion'))
      }

      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * 获取统计数据
   */
  getStats() {
    const conversionRate = this.stats.conversionCount + this.stats.fallbackCount > 0
      ? (this.stats.conversionCount / (this.stats.conversionCount + this.stats.fallbackCount) * 100).toFixed(2)
      : 0

    return {
      ...this.stats,
      conversionRate: `${conversionRate}%`,
      blacklistSize: this.blacklist.size,
      supportStatus: this.currentStatus
    }
  }

  /**
   * 重置统计数据
   */
  resetStats() {
    this.stats = {
      conversionCount: 0,
      fallbackCount: 0,
      errorCount: 0,
      savedBytes: 0
    }
  }

  /**
   * 清理缓存
   */
  clearCache() {
    try {
      localStorage.removeItem(this.cacheKey)
      localStorage.removeItem('webp-config')
      localStorage.removeItem('webp-blacklist')
      
      this.currentStatus = this.supportStatus.UNKNOWN
      this.blacklist.clear()
      
      // 重新检测
      this.detectSupport()
    } catch (error) {
      console.warn('Failed to clear WebP cache:', error)
    }
  }

  /**
   * 手动重新检测支持
   */
  async redetectSupport() {
    this.currentStatus = this.supportStatus.UNKNOWN
    return await this.detectSupport()
  }
}

// 创建全局实例
const webpManager = new WebPManager()

export { webpManager, WebPManager }