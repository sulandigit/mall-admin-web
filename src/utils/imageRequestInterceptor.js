/**
 * 图片请求拦截器
 * 在Axios请求拦截器中实现自动WebP格式切换和图片请求优化
 */

import axios from 'axios'
import { webpManager } from '@/utils/webpManager'
import store from '@/store'

class ImageRequestInterceptor {
  constructor() {
    // 图片URL匹配模式
    this.imageUrlPatterns = [
      /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i,
      /\/image\//,
      /\/img\//,
      /\/pictures?\//,
      /\/photos?\//
    ]

    // 黑名单 - 已知失败的WebP URL
    this.failedWebPUrls = new Set()

    // 重试计数器
    this.retryCounters = new Map()

    // 最大重试次数
    this.maxRetries = 3

    // 统计数据
    this.stats = {
      totalRequests: 0,
      webpRequests: 0,
      fallbackRequests: 0,
      cachedRequests: 0
    }

    this.init()
  }

  /**
   * 初始化拦截器
   */
  init() {
    // 添加请求拦截器
    this.addRequestInterceptor()
    
    // 添加响应拦截器
    this.addResponseInterceptor()

    // 加载黑名单缓存
    this.loadFailedUrls()
  }

  /**
   * 添加请求拦截器
   */
  addRequestInterceptor() {
    axios.interceptors.request.use(
      async (config) => {
        // 检查是否为图片请求
        if (this.isImageRequest(config)) {
          return await this.handleImageRequest(config)
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )
  }

  /**
   * 添加响应拦截器
   */
  addResponseInterceptor() {
    axios.interceptors.response.use(
      (response) => {
        // 处理成功的图片响应
        if (this.isImageRequest(response.config)) {
          this.handleImageResponse(response)
        }
        return response
      },
      async (error) => {
        // 处理图片请求错误
        if (error.config && this.isImageRequest(error.config)) {
          return await this.handleImageError(error)
        }
        return Promise.reject(error)
      }
    )
  }

  /**
   * 判断是否为图片请求
   */
  isImageRequest(config) {
    if (!config || !config.url) return false

    // 检查URL模式
    return this.imageUrlPatterns.some(pattern => pattern.test(config.url))
  }

  /**
   * 处理图片请求
   */
  async handleImageRequest(config) {
    this.stats.totalRequests++

    try {
      // 检查缓存
      const cachedResponse = await this.checkCache(config.url)
      if (cachedResponse) {
        this.stats.cachedRequests++
        return config
      }

      // WebP优化处理
      if (await this.shouldUseWebP(config.url)) {
        return await this.convertToWebPRequest(config)
      }

      return config

    } catch (error) {
      console.warn('ImageRequestInterceptor: Request processing failed:', error)
      return config
    }
  }

  /**
   * 处理图片响应
   */
  handleImageResponse(response) {
    const { config } = response

    try {
      // 记录成功的WebP请求
      if (this.isWebPUrl(config.url)) {
        this.stats.webpRequests++
        
        // 从黑名单中移除（如果存在）
        this.removeFromFailedUrls(config.url)
      }

      // 添加到缓存
      this.addToCache(config.url, response)

      // 更新统计数据
      this.updateStats('success', config.url)

    } catch (error) {
      console.warn('ImageRequestInterceptor: Response processing failed:', error)
    }
  }

  /**
   * 处理图片请求错误
   */
  async handleImageError(error) {
    const { config } = error

    try {
      // 如果是WebP请求失败，尝试降级到原格式
      if (this.isWebPUrl(config.url)) {
        return await this.handleWebPFallback(error)
      }

      // 重试逻辑
      if (this.shouldRetry(config)) {
        return await this.retryRequest(config)
      }

      // 更新统计数据
      this.updateStats('error', config.url)

      return Promise.reject(error)

    } catch (retryError) {
      console.error('ImageRequestInterceptor: Error handling failed:', retryError)
      return Promise.reject(error)
    }
  }

  /**
   * 检查是否应该使用WebP
   */
  async shouldUseWebP(url) {
    // 检查全局开关
    if (!store.getters['imageOptimization/isWebPEnabled']) {
      return false
    }

    // 检查浏览器支持
    if (!store.getters['imageOptimization/isWebPSupported']) {
      return false
    }

    // 检查是否已经是WebP格式
    if (this.isWebPUrl(url)) {
      return false
    }

    // 检查是否在黑名单中
    if (this.failedWebPUrls.has(url)) {
      return false
    }

    // 检查是否为支持转换的格式
    return /\.(jpg|jpeg|png)(\?.*)?$/i.test(url)
  }

  /**
   * 转换为WebP请求
   */
  async convertToWebPRequest(config) {
    try {
      const webpUrl = await webpManager.getOptimalImageUrl(config.url)
      
      if (webpUrl !== config.url) {
        // 保存原始URL用于降级
        config._originalUrl = config.url
        config.url = webpUrl
        config._isWebPRequest = true
      }

      return config

    } catch (error) {
      console.warn('Failed to convert to WebP request:', error)
      return config
    }
  }

  /**
   * 处理WebP降级
   */
  async handleWebPFallback(error) {
    const { config } = error

    if (!config._originalUrl) {
      return Promise.reject(error)
    }

    try {
      // 添加到黑名单
      this.addToFailedUrls(config._originalUrl)

      // 使用原始URL重新请求
      const fallbackConfig = {
        ...config,
        url: config._originalUrl,
        _isWebPRequest: false,
        _isFallbackRequest: true
      }

      this.stats.fallbackRequests++

      // 执行降级请求
      const response = await axios.request(fallbackConfig)
      
      // 记录降级成功
      this.updateStats('fallback', config._originalUrl)
      
      return response

    } catch (fallbackError) {
      console.error('WebP fallback failed:', fallbackError)
      return Promise.reject(error)
    }
  }

  /**
   * 判断是否应该重试
   */
  shouldRetry(config) {
    if (config._isFallbackRequest) {
      return false // 降级请求不再重试
    }

    const retryCount = this.retryCounters.get(config.url) || 0
    return retryCount < this.maxRetries
  }

  /**
   * 重试请求
   */
  async retryRequest(config) {
    const retryCount = this.retryCounters.get(config.url) || 0
    this.retryCounters.set(config.url, retryCount + 1)

    // 延迟重试
    await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))

    try {
      const response = await axios.request(config)
      
      // 重试成功，清除计数器
      this.retryCounters.delete(config.url)
      
      return response

    } catch (error) {
      // 如果还有重试次数，继续重试
      if (this.shouldRetry(config)) {
        return await this.retryRequest(config)
      }

      // 重试次数用完，清除计数器
      this.retryCounters.delete(config.url)
      throw error
    }
  }

  /**
   * 检查缓存
   */
  async checkCache(url) {
    try {
      return await store.dispatch('imageOptimization/checkImageCache', url)
    } catch (error) {
      console.warn('Cache check failed:', error)
      return null
    }
  }

  /**
   * 添加到缓存
   */
  addToCache(url, response) {
    try {
      // 只缓存成功的响应
      if (response.status === 200) {
        store.dispatch('imageOptimization/addToImageCache', {
          url,
          data: {
            headers: response.headers,
            timestamp: Date.now(),
            size: response.headers['content-length'] || 0
          }
        })
      }
    } catch (error) {
      console.warn('Failed to add to cache:', error)
    }
  }

  /**
   * 判断是否为WebP URL
   */
  isWebPUrl(url) {
    return /\.webp(\?.*)?$/i.test(url) || /format=webp/i.test(url)
  }

  /**
   * 添加到失败URL列表
   */
  addToFailedUrls(url) {
    this.failedWebPUrls.add(url)
    this.saveFailedUrls()
    
    // 同时添加到Vuex黑名单
    store.dispatch('imageOptimization/addToWebPBlacklist', url)
  }

  /**
   * 从失败URL列表移除
   */
  removeFromFailedUrls(url) {
    this.failedWebPUrls.delete(url)
    this.saveFailedUrls()
    
    // 同时从Vuex黑名单移除
    store.dispatch('imageOptimization/removeFromWebPBlacklist', url)
  }

  /**
   * 保存失败URL列表
   */
  saveFailedUrls() {
    try {
      const urls = Array.from(this.failedWebPUrls)
      localStorage.setItem('failed-webp-urls', JSON.stringify(urls))
    } catch (error) {
      console.warn('Failed to save failed URLs:', error)
    }
  }

  /**
   * 加载失败URL列表
   */
  loadFailedUrls() {
    try {
      const saved = localStorage.getItem('failed-webp-urls')
      if (saved) {
        const urls = JSON.parse(saved)
        this.failedWebPUrls = new Set(urls)
      }
    } catch (error) {
      console.warn('Failed to load failed URLs:', error)
    }
  }

  /**
   * 更新统计数据
   */
  updateStats(type, url) {
    try {
      const data = {
        type,
        url,
        timestamp: Date.now()
      }

      switch (type) {
        case 'success':
          store.dispatch('imageOptimization/recordImageLoadStats', {
            type: 'load_success',
            data: { url, loadTime: Date.now() }
          })
          break

        case 'error':
          store.dispatch('imageOptimization/recordImageLoadStats', {
            type: 'load_error',
            data: { url, error: 'Request failed' }
          })
          break

        case 'fallback':
          // 记录降级事件
          break
      }

      // 定期检查性能告警
      store.dispatch('imageOptimization/checkPerformanceAlerts')

    } catch (error) {
      console.warn('Failed to update stats:', error)
    }
  }

  /**
   * 获取统计数据
   */
  getStats() {
    return {
      ...this.stats,
      failedUrls: this.failedWebPUrls.size,
      retryingUrls: this.retryCounters.size
    }
  }

  /**
   * 清理缓存和统计
   */
  cleanup() {
    this.failedWebPUrls.clear()
    this.retryCounters.clear()
    this.stats = {
      totalRequests: 0,
      webpRequests: 0,
      fallbackRequests: 0,
      cachedRequests: 0
    }
    
    try {
      localStorage.removeItem('failed-webp-urls')
    } catch (error) {
      console.warn('Failed to cleanup:', error)
    }
  }

  /**
   * 手动清除特定URL的黑名单状态
   */
  clearUrlBlacklist(url) {
    this.removeFromFailedUrls(url)
    console.log(`Cleared blacklist status for: ${url}`)
  }

  /**
   * 获取黑名单URL列表
   */
  getBlacklistedUrls() {
    return Array.from(this.failedWebPUrls)
  }
}

// 创建全局实例
const imageRequestInterceptor = new ImageRequestInterceptor()

export { imageRequestInterceptor, ImageRequestInterceptor }