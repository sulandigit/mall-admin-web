/**
 * 缓存控制服务单元测试
 */

import CacheControlService from '@/utils/cacheControl'

// Mock store
const mockStore = {
  getters: {
    cacheInfo: {
      total: 5,
      maxSize: 10,
      usage: 0.5,
      components: [
        { name: 'product', timestamp: Date.now(), accessCount: 5 },
        { name: 'order', timestamp: Date.now() - 10000, accessCount: 3 }
      ]
    },
    cacheConfig: {
      maxCacheSize: 10,
      defaultTimeout: 30 * 60 * 1000,
      enableLRU: true,
      enableTimeout: true
    },
    cacheCount: 5
  },
  dispatch: jest.fn()
}

// Mock store module
jest.mock('@/store', () => mockStore)

describe('CacheControlService', () => {
  let service

  beforeEach(() => {
    // 重置mock
    jest.clearAllMocks()
    
    // 创建新的服务实例
    service = new (require('@/utils/cacheControl').default.constructor)()
    
    // Mock performance API
    Object.defineProperty(performance, 'memory', {
      value: {
        usedJSHeapSize: 50 * 1024 * 1024,
        totalJSHeapSize: 100 * 1024 * 1024,
        jsHeapSizeLimit: 200 * 1024 * 1024
      },
      configurable: true
    })

    // Mock localStorage
    const mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn()
    }
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage
    })

    // Mock console methods
    global.console = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    }
  })

  afterEach(() => {
    if (service.isRunning) {
      service.stop()
    }
  })

  describe('Service Lifecycle', () => {
    it('should start service', () => {
      service.start()
      
      expect(service.isRunning).toBe(true)
      expect(service.cleanupTimer).toBeDefined()
      expect(service.monitorTimer).toBeDefined()
    })

    it('should stop service', () => {
      service.start()
      service.stop()
      
      expect(service.isRunning).toBe(false)
      expect(service.cleanupTimer).toBeNull()
      expect(service.monitorTimer).toBeNull()
    })

    it('should not start if already running', () => {
      service.start()
      const firstCleanupTimer = service.cleanupTimer
      
      service.start() // 尝试再次启动
      
      expect(service.cleanupTimer).toBe(firstCleanupTimer)
    })

    it('should not stop if not running', () => {
      const spy = jest.spyOn(global, 'clearInterval')
      service.stop()
      
      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('Memory Pressure Detection', () => {
    it('should detect high memory pressure with performance.memory', () => {
      performance.memory.usedJSHeapSize = 85 * 1024 * 1024
      performance.memory.totalJSHeapSize = 100 * 1024 * 1024
      
      expect(service.isMemoryPressureHigh()).toBe(true)
    })

    it('should detect normal memory usage', () => {
      performance.memory.usedJSHeapSize = 50 * 1024 * 1024
      performance.memory.totalJSHeapSize = 100 * 1024 * 1024
      
      expect(service.isMemoryPressureHigh()).toBe(false)
    })

    it('should fallback to cache count when no memory API', () => {
      delete performance.memory
      mockStore.getters.cacheCount = 20
      
      expect(service.isMemoryPressureHigh()).toBe(true)
    })
  })

  describe('Cache Cleanup', () => {
    it('should perform cleanup when usage is high', async () => {
      mockStore.getters.cacheInfo.usage = 0.95
      
      await service.performCleanup()
      
      expect(mockStore.dispatch).toHaveBeenCalledWith('smartCacheClean', {
        forceClean: true,
        cleanRatio: 0.5
      })
    })

    it('should perform standard cleanup when usage is moderate', async () => {
      mockStore.getters.cacheInfo.usage = 0.75
      
      await service.performCleanup()
      
      expect(mockStore.dispatch).toHaveBeenCalledWith('smartCacheClean', {
        forceClean: false,
        cleanRatio: 0.3
      })
    })

    it('should not cleanup when usage is low', async () => {
      mockStore.getters.cacheInfo.usage = 0.5
      
      await service.performCleanup()
      
      expect(mockStore.dispatch).toHaveBeenCalledWith('clearExpiredCache')
      expect(mockStore.dispatch).not.toHaveBeenCalledWith('smartCacheClean', expect.any(Object))
    })

    it('should cleanup on memory pressure', async () => {
      mockStore.getters.cacheInfo.usage = 0.3
      performance.memory.usedJSHeapSize = 85 * 1024 * 1024
      
      await service.performCleanup()
      
      expect(mockStore.dispatch).toHaveBeenCalledWith('smartCacheClean', {
        forceClean: true,
        cleanRatio: 0.6
      })
    })

    it('should handle cleanup errors', async () => {
      mockStore.dispatch.mockRejectedValue(new Error('Cleanup failed'))
      
      await service.performCleanup()
      
      expect(console.error).toHaveBeenCalledWith(
        '[CacheControlService] 缓存清理失败:',
        expect.any(Error)
      )
    })
  })

  describe('Performance Metrics', () => {
    it('should collect metrics', () => {
      service.collectMetrics()
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'cache_metrics_history',
        expect.stringContaining('"cacheCount"')
      )
    })

    it('should limit metrics history', () => {
      const longHistory = new Array(150).fill(0).map((_, i) => ({ timestamp: i }))
      localStorage.getItem.mockReturnValue(JSON.stringify(longHistory))
      
      service.collectMetrics()
      
      const savedData = JSON.parse(localStorage.setItem.mock.calls[0][1])
      expect(savedData.length).toBeLessThanOrEqual(100)
    })

    it('should handle localStorage errors gracefully', () => {
      localStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })
      
      expect(() => {
        service.collectMetrics()
      }).not.toThrow()
      
      expect(console.warn).toHaveBeenCalled()
    })

    it('should calculate hit rate correctly', () => {
      service.performanceMetrics.cacheHitCount = 80
      service.performanceMetrics.cacheMissCount = 20
      
      expect(service.calculateHitRate()).toBe(0.8)
    })

    it('should return 0 hit rate when no data', () => {
      service.performanceMetrics.cacheHitCount = 0
      service.performanceMetrics.cacheMissCount = 0
      
      expect(service.calculateHitRate()).toBe(0)
    })
  })

  describe('Manual Operations', () => {
    it('should perform manual cleanup', async () => {
      await service.manualCleanup({ cleanRatio: 0.8 })
      
      expect(mockStore.dispatch).toHaveBeenCalledWith('smartCacheClean', {
        forceClean: true,
        cleanRatio: 0.8
      })
    })

    it('should clear all cache', async () => {
      await service.clearAllCache()
      
      expect(mockStore.dispatch).toHaveBeenCalledWith('clearAllCache')
    })

    it('should update config', async () => {
      const newConfig = { maxCacheSize: 15 }
      
      await service.updateConfig(newConfig)
      
      expect(mockStore.dispatch).toHaveBeenCalledWith('updateCacheConfig', newConfig)
    })
  })

  describe('Performance Reporting', () => {
    it('should generate performance report', () => {
      service.performanceMetrics.cacheHitCount = 100
      service.performanceMetrics.cacheMissCount = 25
      service.performanceMetrics.cacheCleanCount = 5
      
      const report = service.getPerformanceReport()
      
      expect(report).toHaveProperty('cacheStatus')
      expect(report).toHaveProperty('performance')
      expect(report).toHaveProperty('memory')
      expect(report).toHaveProperty('isRunning')
      
      expect(report.performance.hitRate).toBe(0.8)
      expect(report.performance.totalHits).toBe(100)
      expect(report.performance.cleanupCount).toBe(5)
    })

    it('should include memory info in report', () => {
      const report = service.getPerformanceReport()
      
      expect(report.memory).toEqual({
        used: 50 * 1024 * 1024,
        total: 100 * 1024 * 1024,
        limit: 200 * 1024 * 1024
      })
    })
  })

  describe('Performance Observers', () => {
    beforeEach(() => {
      // Mock document.addEventListener
      global.document = {
        ...global.document,
        addEventListener: jest.fn(),
        hidden: false
      }
    })

    it('should setup performance observers', () => {
      service.setupPerformanceObserver()
      
      expect(document.addEventListener).toHaveBeenCalledWith(
        'visibilitychange',
        expect.any(Function)
      )
    })

    it('should perform lightweight cleanup when page hidden', async () => {
      const performLightweightCleanup = jest.spyOn(service, 'performLightweightCleanup')
      
      service.setupPerformanceObserver()
      
      // 模拟页面隐藏
      document.hidden = true
      const visibilityHandler = document.addEventListener.mock.calls.find(
        call => call[0] === 'visibilitychange'
      )[1]
      
      await visibilityHandler()
      
      expect(performLightweightCleanup).toHaveBeenCalled()
    })
  })

  describe('Event Recording', () => {
    it('should record cache hits', () => {
      service.recordCacheHit()
      service.recordCacheHit()
      
      expect(service.performanceMetrics.cacheHitCount).toBe(2)
    })

    it('should record cache misses', () => {
      service.recordCacheMiss()
      service.recordCacheMiss()
      service.recordCacheMiss()
      
      expect(service.performanceMetrics.cacheMissCount).toBe(3)
    })
  })

  describe('Timer Management', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should execute cleanup timer', async () => {
      const performCleanup = jest.spyOn(service, 'performCleanup')
      
      service.startCleanupTimer()
      
      // 快进5分钟
      jest.advanceTimersByTime(5 * 60 * 1000)
      
      expect(performCleanup).toHaveBeenCalled()
    })

    it('should execute monitor timer', () => {
      const collectMetrics = jest.spyOn(service, 'collectMetrics')
      
      service.startMonitorTimer()
      
      // 快进1分钟
      jest.advanceTimersByTime(60 * 1000)
      
      expect(collectMetrics).toHaveBeenCalled()
    })
  })
})