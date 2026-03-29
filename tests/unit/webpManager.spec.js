/**
 * WebP管理器单元测试
 */

import { WebPManager } from '@/utils/webpManager'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock Image
global.Image = class {
  constructor() {
    this.width = 0
    this.height = 0
  }
  
  set src(value) {
    if (value.includes('webp')) {
      setTimeout(() => {
        this.width = 2
        this.height = 2
        this.onload && this.onload()
      }, 100)
    } else {
      setTimeout(() => {
        this.onerror && this.onerror()
      }, 100)
    }
  }
}

describe('WebPManager', () => {
  let webpManager

  beforeEach(() => {
    webpManager = new WebPManager()
    jest.clearAllMocks()
  })

  describe('WebP支持检测', () => {
    it('should detect WebP support correctly', async () => {
      const isSupported = await webpManager.detectSupport()
      
      expect(isSupported).toBe(true)
      expect(webpManager.currentStatus).toBe('supported')
    })

    it('should cache detection result', async () => {
      await webpManager.detectSupport()
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'webp-support-cache',
        expect.stringContaining('supported')
      )
    })

    it('should load cached result if valid', () => {
      const cachedData = {
        status: 'supported',
        timestamp: Date.now(),
        expiry: Date.now() + 86400000
      }
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(cachedData))
      
      const result = webpManager.loadCachedSupport()
      
      expect(result).toBe(true)
      expect(webpManager.currentStatus).toBe('supported')
    })
  })

  describe('URL转换', () => {
    it('should convert URL to WebP format using suffix pattern', () => {
      const originalUrl = 'https://example.com/image.jpg'
      const webpUrl = webpManager.convertToWebPUrl(originalUrl, { pattern: 'suffix' })
      
      expect(webpUrl).toBe('https://example.com/image.webp')
    })

    it('should convert URL to WebP format using query pattern', () => {
      const originalUrl = 'https://example.com/image.jpg'
      const webpUrl = webpManager.convertToWebPUrl(originalUrl, { pattern: 'query' })
      
      expect(webpUrl).toBe('https://example.com/image.jpg?format=webp')
    })

    it('should not convert already WebP URLs', () => {
      const webpUrl = 'https://example.com/image.webp'
      const result = webpManager.convertToWebPUrl(webpUrl)
      
      expect(result).toBe(webpUrl)
    })

    it('should not convert unsupported formats', () => {
      const gifUrl = 'https://example.com/animation.gif'
      const result = webpManager.convertToWebPUrl(gifUrl)
      
      expect(result).toBe(gifUrl)
    })

    it('should not convert blacklisted URLs', () => {
      const url = 'https://example.com/image.jpg'
      webpManager.addToBlacklist(url)
      
      const result = webpManager.convertToWebPUrl(url)
      
      expect(result).toBe(url)
    })
  })

  describe('智能URL获取', () => {
    beforeEach(() => {
      webpManager.currentStatus = 'supported'
    })

    it('should return WebP URL when supported', async () => {
      const originalUrl = 'https://example.com/image.jpg'
      
      // Mock testImageUrl to always return true
      webpManager.testImageUrl = jest.fn().mockResolvedValue(true)
      
      const result = await webpManager.getOptimalImageUrl(originalUrl)
      
      expect(result).toBe('https://example.com/image.webp')
      expect(webpManager.stats.conversionCount).toBe(1)
    })

    it('should fallback to original URL when WebP fails', async () => {
      const originalUrl = 'https://example.com/image.jpg'
      
      // Mock testImageUrl to fail for WebP
      webpManager.testImageUrl = jest.fn().mockResolvedValue(false)
      
      const result = await webpManager.getOptimalImageUrl(originalUrl)
      
      expect(result).toBe(originalUrl)
      expect(webpManager.stats.fallbackCount).toBe(1)
      expect(webpManager.blacklist.has(originalUrl)).toBe(true)
    })

    it('should return original URL when WebP not supported', async () => {
      webpManager.currentStatus = 'not_supported'
      
      const originalUrl = 'https://example.com/image.jpg'
      const result = await webpManager.getOptimalImageUrl(originalUrl)
      
      expect(result).toBe(originalUrl)
    })
  })

  describe('文件转换', () => {
    beforeEach(() => {
      // Mock Canvas and related APIs
      global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
        drawImage: jest.fn(),
      }))
      
      global.HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
        const blob = new Blob(['webp data'], { type: 'image/webp' })
        callback(blob)
      })
      
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')
    })

    it('should convert JPEG file to WebP', async () => {
      const jpegFile = new File(['jpeg data'], 'test.jpg', { type: 'image/jpeg' })
      
      const webpFile = await webpManager.convertFileToWebP(jpegFile)
      
      expect(webpFile).toBeInstanceOf(File)
      expect(webpFile.type).toBe('image/webp')
      expect(webpFile.name).toBe('test.webp')
    })

    it('should reject unsupported file types', async () => {
      const textFile = new File(['text'], 'test.txt', { type: 'text/plain' })
      
      await expect(webpManager.convertFileToWebP(textFile)).rejects.toThrow('Unsupported file type')
    })
  })

  describe('黑名单管理', () => {
    it('should add URL to blacklist', () => {
      const url = 'https://example.com/image.jpg'
      
      webpManager.addToBlacklist(url)
      
      expect(webpManager.blacklist.has(url)).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'webp-blacklist',
        JSON.stringify([url])
      )
    })

    it('should remove URL from blacklist', () => {
      const url = 'https://example.com/image.jpg'
      webpManager.blacklist.add(url)
      
      webpManager.removeFromBlacklist(url)
      
      expect(webpManager.blacklist.has(url)).toBe(false)
    })

    it('should load blacklist from storage', () => {
      const blacklistUrls = ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
      localStorageMock.getItem.mockReturnValue(JSON.stringify(blacklistUrls))
      
      webpManager.loadBlacklist()
      
      expect(webpManager.blacklist.size).toBe(2)
      expect(webpManager.blacklist.has(blacklistUrls[0])).toBe(true)
    })
  })

  describe('配置管理', () => {
    it('should update configuration', () => {
      const newConfig = { quality: 0.9, enableFallback: false }
      
      webpManager.updateConfig(newConfig)
      
      expect(webpManager.config.quality).toBe(0.9)
      expect(webpManager.config.enableFallback).toBe(false)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'webp-config',
        expect.stringContaining('"quality":0.9')
      )
    })

    it('should load configuration from storage', () => {
      const savedConfig = { quality: 0.7 }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedConfig))
      
      webpManager.loadConfig()
      
      expect(webpManager.config.quality).toBe(0.7)
    })
  })

  describe('统计数据', () => {
    it('should track conversion statistics', () => {
      webpManager.stats.conversionCount = 10
      webpManager.stats.fallbackCount = 2
      
      const stats = webpManager.getStats()
      
      expect(stats.conversionCount).toBe(10)
      expect(stats.fallbackCount).toBe(2)
      expect(stats.conversionRate).toBe('83.33%')
    })

    it('should reset statistics', () => {
      webpManager.stats.conversionCount = 10
      webpManager.stats.fallbackCount = 2
      
      webpManager.resetStats()
      
      expect(webpManager.stats.conversionCount).toBe(0)
      expect(webpManager.stats.fallbackCount).toBe(0)
    })
  })

  describe('URL检测', () => {
    it('should detect WebP URLs correctly', () => {
      expect(webpManager.isWebPUrl('https://example.com/image.webp')).toBe(true)
      expect(webpManager.isWebPUrl('https://example.com/image.jpg?format=webp')).toBe(true)
      expect(webpManager.isWebPUrl('https://example.com/image.jpg')).toBe(false)
    })

    it('should detect supported formats correctly', () => {
      expect(webpManager.isSupportedFormat('https://example.com/image.jpg')).toBe(true)
      expect(webpManager.isSupportedFormat('https://example.com/image.png')).toBe(true)
      expect(webpManager.isSupportedFormat('https://example.com/image.gif')).toBe(false)
    })
  })

  describe('缓存清理', () => {
    it('should clear all caches', () => {
      webpManager.currentStatus = 'supported'
      webpManager.blacklist.add('https://example.com/image.jpg')
      
      webpManager.clearCache()
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('webp-support-cache')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('webp-config')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('webp-blacklist')
      expect(webpManager.currentStatus).toBe('unknown')
      expect(webpManager.blacklist.size).toBe(0)
    })
  })
})