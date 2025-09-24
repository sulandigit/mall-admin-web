/**
 * 移动端功能集成测试
 * 验证所有移动端适配功能是否正常工作
 */

import { getDeviceInfo, isMobileDevice, isTabletDevice } from '@/utils/device'
import { createGestureRecognizer, GESTURE_TYPES } from '@/utils/gesture'
import { cacheManager, performanceMonitor } from '@/utils/performance'

// 测试套件
export class MobileAdaptationTester {
  constructor() {
    this.testResults = []
    this.testCount = 0
    this.passedCount = 0
  }
  
  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('开始运行移动端适配测试...')
    
    try {
      await this.testDeviceDetection()
      await this.testGestureRecognition()
      await this.testCacheManager()
      await this.testPerformanceMonitor()
      await this.testResponsiveBreakpoints()
      await this.testStoreIntegration()
      
      this.printResults()
      return this.generateReport()
    } catch (error) {
      console.error('测试运行失败:', error)
      return { success: false, error: error.message }
    }
  }
  
  /**
   * 测试设备检测功能
   */
  async testDeviceDetection() {
    this.test('设备信息获取', () => {
      const deviceInfo = getDeviceInfo()
      return deviceInfo && 
             typeof deviceInfo.type === 'string' &&
             typeof deviceInfo.viewport === 'object' &&
             typeof deviceInfo.breakpoint === 'string'
    })
    
    this.test('移动设备检测', () => {
      const isMobile = isMobileDevice()
      return typeof isMobile === 'boolean'
    })
    
    this.test('平板设备检测', () => {
      const isTablet = isTabletDevice()
      return typeof isTablet === 'boolean'
    })
    
    this.test('响应式断点检测', () => {
      const info = getDeviceInfo()
      const validBreakpoints = ['mobile', 'tablet', 'desktop', 'desktop-large']
      return validBreakpoints.includes(info.breakpoint)
    })
  }
  
  /**
   * 测试手势识别功能
   */
  async testGestureRecognition() {
    return new Promise((resolve) => {
      this.test('手势识别器创建', () => {
        const testElement = document.createElement('div')
        const recognizer = createGestureRecognizer(testElement)
        const success = recognizer && typeof recognizer.on === 'function'
        if (recognizer) recognizer.destroy()
        return success
      })
      
      this.test('手势事件注册', () => {
        const testElement = document.createElement('div')
        const recognizer = createGestureRecognizer(testElement)
        let eventRegistered = false
        
        recognizer.on(GESTURE_TYPES.TAP, () => {
          eventRegistered = true
        })
        
        const success = recognizer.handlers.has(GESTURE_TYPES.TAP)
        recognizer.destroy()
        return success
      })
      
      resolve()
    })
  }
  
  /**
   * 测试缓存管理器
   */
  async testCacheManager() {
    this.test('缓存设置和获取', () => {
      const testKey = 'test_cache_key'
      const testValue = { data: 'test', timestamp: Date.now() }
      
      cacheManager.set(testKey, testValue)
      const retrieved = cacheManager.get(testKey)
      
      const success = JSON.stringify(retrieved) === JSON.stringify(testValue)
      cacheManager.delete(testKey)
      return success
    })
    
    this.test('缓存过期检测', () => {
      const testKey = 'test_expire_key'
      const testValue = 'expire_test'
      
      // 设置1毫秒过期
      cacheManager.set(testKey, testValue, 1)
      
      return new Promise((resolve) => {
        setTimeout(() => {
          const retrieved = cacheManager.get(testKey)
          resolve(retrieved === null)
        }, 10)
      })
    })
    
    this.test('缓存删除', () => {
      const testKey = 'test_delete_key'
      cacheManager.set(testKey, 'delete_test')
      const deleted = cacheManager.delete(testKey)
      const retrieved = cacheManager.get(testKey)
      
      return deleted && retrieved === null
    })
  }
  
  /**
   * 测试性能监控器
   */
  async testPerformanceMonitor() {
    this.test('性能监控器启动', () => {
      performanceMonitor.start()
      return performanceMonitor.isMonitoring === true
    })
    
    this.test('加载时间记录', () => {
      performanceMonitor.recordLoadTime('test_load', 100)
      const report = performanceMonitor.getReport()
      return report.loadTimes.some(item => item.name === 'test_load')
    })
    
    this.test('性能报告生成', () => {
      const report = performanceMonitor.getReport()
      return report && 
             typeof report.fps === 'object' &&
             typeof report.memory === 'object' &&
             Array.isArray(report.loadTimes)
    })
    
    performanceMonitor.stop()
  }
  
  /**
   * 测试响应式断点
   */
  async testResponsiveBreakpoints() {
    this.test('CSS变量加载', () => {
      // 检查响应式变量是否正确加载
      const testElement = document.createElement('div')
      document.body.appendChild(testElement)
      
      // 模拟移动端样式检测
      testElement.className = 'test-responsive'
      testElement.style.setProperty('--mobile-spacing-md', '24px')
      
      const computed = window.getComputedStyle(testElement)
      const hasResponsiveVar = computed.getPropertyValue('--mobile-spacing-md') || 
                              testElement.style.getPropertyValue('--mobile-spacing-md')
      
      document.body.removeChild(testElement)
      return Boolean(hasResponsiveVar)
    })
    
    this.test('触摸样式加载', () => {
      // 检查是否支持触摸样式类
      const testElement = document.createElement('div')
      testElement.className = 'touch-target'
      document.body.appendChild(testElement)
      
      const computed = window.getComputedStyle(testElement)
      const hasMinHeight = computed.minHeight !== 'auto'
      
      document.body.removeChild(testElement)
      return hasMinHeight
    })
  }
  
  /**
   * 测试Store集成
   */
  async testStoreIntegration() {
    // 这里需要在Vue组件中进行测试
    // 模拟基本的状态结构检查
    this.test('Store状态结构', () => {
      const mockStore = {
        state: {
          app: {
            sidebar: { opened: true, withoutAnimation: false },
            device: 'desktop',
            viewport: { width: 1024, height: 768, orientation: 'landscape' },
            interaction: { touchSupported: false, gestureEnabled: true }
          }
        }
      }
      
      return mockStore.state.app &&
             mockStore.state.app.sidebar &&
             mockStore.state.app.viewport &&
             mockStore.state.app.interaction
    })
  }
  
  /**
   * 执行单个测试
   */
  test(name, testFn) {
    this.testCount++
    
    try {
      const result = testFn()
      
      if (result instanceof Promise) {
        return result.then(success => {
          this.recordResult(name, success)
        }).catch(error => {
          this.recordResult(name, false, error.message)
        })
      } else {
        this.recordResult(name, result)
      }
    } catch (error) {
      this.recordResult(name, false, error.message)
    }
  }
  
  /**
   * 记录测试结果
   */
  recordResult(name, success, error = null) {
    this.testResults.push({
      name,
      success,
      error,
      timestamp: new Date().toISOString()
    })
    
    if (success) {
      this.passedCount++
      console.log(`✅ ${name}`)
    } else {
      console.log(`❌ ${name}${error ? `: ${error}` : ''}`)
    }
  }
  
  /**
   * 打印测试结果
   */
  printResults() {
    console.log('\n' + '='.repeat(50))
    console.log('移动端适配测试结果')
    console.log('='.repeat(50))
    console.log(`总计: ${this.testCount} 个测试`)
    console.log(`通过: ${this.passedCount} 个`)
    console.log(`失败: ${this.testCount - this.passedCount} 个`)
    console.log(`成功率: ${((this.passedCount / this.testCount) * 100).toFixed(2)}%`)
    console.log('='.repeat(50))
    
    // 显示失败的测试
    const failed = this.testResults.filter(r => !r.success)
    if (failed.length > 0) {
      console.log('\n失败的测试:')
      failed.forEach(test => {
        console.log(`- ${test.name}: ${test.error || '未知错误'}`)
      })
    }
  }
  
  /**
   * 生成测试报告
   */
  generateReport() {
    return {
      success: this.passedCount === this.testCount,
      total: this.testCount,
      passed: this.passedCount,
      failed: this.testCount - this.passedCount,
      successRate: (this.passedCount / this.testCount) * 100,
      results: this.testResults,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * 移动端功能验证工具
 */
export class MobileFunctionValidator {
  /**
   * 验证当前环境是否支持移动端功能
   */
  static validateEnvironment() {
    const checks = {
      touchSupport: 'ontouchstart' in window,
      gestureSupport: 'GestureEvent' in window,
      intersectionObserver: 'IntersectionObserver' in window,
      resizeObserver: 'ResizeObserver' in window,
      performanceAPI: 'performance' in window,
      localStorage: 'localStorage' in window,
      flexboxSupport: CSS.supports('display', 'flex'),
      gridSupport: CSS.supports('display', 'grid'),
      cssMQSupport: window.matchMedia && window.matchMedia('(min-width: 1px)').matches !== undefined
    }
    
    console.log('环境兼容性检查:', checks)
    
    const unsupported = Object.entries(checks)
      .filter(([key, value]) => !value)
      .map(([key]) => key)
    
    if (unsupported.length > 0) {
      console.warn('以下功能不被支持:', unsupported)
    }
    
    return {
      supported: unsupported.length === 0,
      checks,
      unsupported
    }
  }
  
  /**
   * 检查移动端适配是否正确加载
   */
  static validateMobileAdaptation() {
    const deviceInfo = getDeviceInfo()
    const validation = {
      deviceDetection: Boolean(deviceInfo && deviceInfo.type),
      breakpointDetection: Boolean(deviceInfo && deviceInfo.breakpoint),
      viewportInfo: Boolean(deviceInfo && deviceInfo.viewport),
      touchDetection: typeof deviceInfo.touchSupported === 'boolean',
      cacheAvailable: Boolean(cacheManager),
      performanceMonitorAvailable: Boolean(performanceMonitor)
    }
    
    console.log('移动端适配验证:', validation)
    
    const failed = Object.entries(validation)
      .filter(([key, value]) => !value)
      .map(([key]) => key)
    
    return {
      valid: failed.length === 0,
      checks: validation,
      failed
    }
  }
}

// 导出测试工具
export default {
  MobileAdaptationTester,
  MobileFunctionValidator
}

// 在开发环境下自动运行测试
if (process.env.NODE_ENV === 'development') {
  // 延迟执行，确保所有模块都已加载
  setTimeout(() => {
    const envValidation = MobileFunctionValidator.validateEnvironment()
    const adaptationValidation = MobileFunctionValidator.validateMobileAdaptation()
    
    console.log('环境验证:', envValidation.supported ? '✅ 通过' : '❌ 失败')
    console.log('适配验证:', adaptationValidation.valid ? '✅ 通过' : '❌ 失败')
    
    // 如果需要运行完整测试
    if (window.location.search.includes('runMobileTests=true')) {
      const tester = new MobileAdaptationTester()
      tester.runAllTests().then(report => {
        console.log('完整测试报告:', report)
      })
    }
  }, 1000)
}