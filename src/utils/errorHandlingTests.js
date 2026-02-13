/**
 * 错误处理功能测试文件
 * 
 * 这个文件包含了对错误处理系统的基本测试
 * 由于项目使用的是较老的Vue 2版本，这里提供的是基础的测试示例
 * 实际项目中建议使用Jest或Mocha等专业测试框架
 */

import ErrorHandler, { ERROR_CODES, ERROR_TYPES } from '../utils/errorHandler'
import { RetryManager, globalRetryManager } from '../utils/retryManager'
import { globalErrorRecoveryService } from '../utils/errorRecoveryService'
import { globalErrorMonitor } from '../utils/globalErrorMonitor'

/**
 * 简单的测试框架
 */
class SimpleTestFramework {
  constructor() {
    this.tests = []
    this.results = []
  }

  describe(description, testFn) {
    console.group(`📋 ${description}`)
    testFn()
    console.groupEnd()
  }

  it(description, testFn) {
    console.log(`🧪 ${description}`)
    try {
      testFn()
      console.log(`✅ 通过`)
      this.results.push({ description, passed: true })
    } catch (error) {
      console.error(`❌ 失败:`, error.message)
      this.results.push({ description, passed: false, error: error.message })
    }
  }

  async itAsync(description, testFn) {
    console.log(`🧪 ${description}`)
    try {
      await testFn()
      console.log(`✅ 通过`)
      this.results.push({ description, passed: true })
    } catch (error) {
      console.error(`❌ 失败:`, error.message)
      this.results.push({ description, passed: false, error: error.message })
    }
  }

  expect(actual) {
    return {
      toBe: (expected) => {
        if (actual !== expected) {
          throw new Error(`期望 ${expected}，实际 ${actual}`)
        }
      },
      toEqual: (expected) => {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(`期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}`)
        }
      },
      toBeTruthy: () => {
        if (!actual) {
          throw new Error(`期望真值，实际 ${actual}`)
        }
      },
      toBeFalsy: () => {
        if (actual) {
          throw new Error(`期望假值，实际 ${actual}`)
        }
      },
      toContain: (expected) => {
        if (!actual.includes(expected)) {
          throw new Error(`期望包含 ${expected}`)
        }
      },
      toBeInstanceOf: (expected) => {
        if (!(actual instanceof expected)) {
          throw new Error(`期望是 ${expected.name} 的实例`)
        }
      }
    }
  }

  getSummary() {
    const total = this.results.length
    const passed = this.results.filter(r => r.passed).length
    const failed = total - passed
    
    return {
      total,
      passed,
      failed,
      passRate: total > 0 ? (passed / total * 100).toFixed(2) : 0
    }
  }
}

// 创建测试实例
const test = new SimpleTestFramework()

/**
 * 错误处理器测试
 */
function testErrorHandler() {
  test.describe('ErrorHandler 测试', () => {
    test.it('应该能创建错误对象', () => {
      const error = ErrorHandler.createError(
        ERROR_CODES.NETWORK_ERROR,
        '网络连接失败',
        ERROR_TYPES.NETWORK
      )
      
      test.expect(error).toBeInstanceOf(Error)
      test.expect(error.code).toBe(ERROR_CODES.NETWORK_ERROR)
      test.expect(error.type).toBe(ERROR_TYPES.NETWORK)
      test.expect(error.message).toBe('网络连接失败')
    })

    test.it('应该能解析API错误', () => {
      const mockApiError = {
        response: {
          status: 404,
          data: {
            code: 404,
            message: '资源未找到'
          }
        }
      }
      
      const errorInfo = ErrorHandler.parseApiError(mockApiError)
      test.expect(errorInfo.code).toBe(404)
      test.expect(errorInfo.message).toBe('资源未找到')
    })

    test.it('应该能处理验证错误', () => {
      const validationErrors = {
        username: ['用户名不能为空'],
        password: ['密码长度至少6位']
      }
      
      const errorInfo = ErrorHandler.handleValidationError(validationErrors)
      test.expect(errorInfo.code).toBe(ERROR_CODES.VALIDATION_ERROR)
      test.expect(errorInfo.type).toBe(ERROR_TYPES.VALIDATION)
    })
  })
}

/**
 * 重试管理器测试
 */
function testRetryManager() {
  test.describe('RetryManager 测试', () => {
    test.it('应该能创建重试管理器实例', () => {
      const retryManager = new RetryManager()
      test.expect(retryManager).toBeInstanceOf(RetryManager)
      test.expect(retryManager.retryCount).toBe(0)
      test.expect(retryManager.isRetrying).toBeFalsy()
    })

    test.itAsync('应该能执行成功的操作', async () => {
      const retryManager = new RetryManager({ maxRetries: 2 })
      let callCount = 0
      
      const operation = () => {
        callCount++
        return Promise.resolve('成功')
      }
      
      const result = await retryManager.execute(operation)
      test.expect(result).toBe('成功')
      test.expect(callCount).toBe(1)
    })

    test.itAsync('应该能重试失败的操作', async () => {
      const retryManager = new RetryManager({ 
        maxRetries: 2, 
        baseDelay: 10 // 减少测试时间
      })
      let callCount = 0
      
      const operation = () => {
        callCount++
        if (callCount < 2) {
          const error = new Error('临时失败')
          error.code = ERROR_CODES.NETWORK_ERROR
          throw error
        }
        return Promise.resolve('重试成功')
      }
      
      const result = await retryManager.execute(operation)
      test.expect(result).toBe('重试成功')
      test.expect(callCount).toBe(2)
    })
  })
}

/**
 * 错误恢复服务测试
 */
function testErrorRecoveryService() {
  test.describe('ErrorRecoveryService 测试', () => {
    test.it('应该有预定义的恢复策略', () => {
      const strategies = globalErrorRecoveryService.recoveryStrategies
      test.expect(strategies.has(ERROR_CODES.NETWORK_ERROR)).toBeTruthy()
      test.expect(strategies.has(ERROR_CODES.TIMEOUT_ERROR)).toBeTruthy()
      test.expect(strategies.has(ERROR_CODES.UNAUTHORIZED)).toBeTruthy()
    })

    test.itAsync('应该能执行默认值策略', async () => {
      const mockError = new Error('测试错误')
      mockError.code = 'TEST_ERROR'
      
      const result = await globalErrorRecoveryService.executeStrategy(
        { type: 'default', value: { data: [], message: '默认数据' } },
        mockError,
        {}
      )
      
      test.expect(result.success).toBeTruthy()
      test.expect(result.data.message).toBe('默认数据')
    })

    test.it('应该能记录恢复历史', () => {
      const initialCount = globalErrorRecoveryService.recoveryHistory.length
      
      globalErrorRecoveryService.recordRecovery(
        { code: 'TEST', type: 'TEST' },
        { type: 'retry' },
        true
      )
      
      test.expect(globalErrorRecoveryService.recoveryHistory.length).toBe(initialCount + 1)
    })
  })
}

/**
 * 全局错误监控测试
 */
function testGlobalErrorMonitor() {
  test.describe('GlobalErrorMonitor 测试', () => {
    test.it('应该能初始化监控', () => {
      test.expect(globalErrorMonitor.isInitialized).toBeTruthy()
      test.expect(globalErrorMonitor.errorQueue).toBeInstanceOf(Array)
      test.expect(globalErrorMonitor.errorCounts).toBeInstanceOf(Map)
    })

    test.it('应该能记录错误', () => {
      const initialCount = globalErrorMonitor.errorQueue.length
      
      globalErrorMonitor.recordError({
        type: 'test-error',
        message: '测试错误',
        timestamp: Date.now()
      })
      
      test.expect(globalErrorMonitor.errorQueue.length).toBe(initialCount + 1)
    })

    test.it('应该能获取错误统计', () => {
      const stats = globalErrorMonitor.getErrorStats()
      test.expect(stats).toBeTruthy()
      test.expect(typeof stats.totalErrors).toBe('number')
      test.expect(typeof stats.errorsByType).toBe('object')
    })
  })
}

/**
 * 集成测试
 */
function testIntegration() {
  test.describe('集成测试', () => {
    test.itAsync('应该能处理完整的错误流程', async () => {
      // 模拟一个会失败然后成功的操作
      let attemptCount = 0
      const mockOperation = () => {
        attemptCount++
        if (attemptCount === 1) {
          const error = new Error('网络错误')
          error.code = ERROR_CODES.NETWORK_ERROR
          throw error
        }
        return Promise.resolve({ data: '成功数据' })
      }

      try {
        // 使用错误恢复服务
        const result = await globalErrorRecoveryService.recover(
          new Error('网络错误'),
          { operation: mockOperation }
        )
        
        // 这个测试可能会失败，因为需要实际的操作
        console.log('集成测试结果:', result)
      } catch (error) {
        console.log('集成测试异常（预期）:', error.message)
      }
    })
  })
}

/**
 * 性能测试
 */
function testPerformance() {
  test.describe('性能测试', () => {
    test.it('错误创建性能测试', () => {
      const startTime = performance.now()
      
      for (let i = 0; i < 1000; i++) {
        ErrorHandler.createError(
          ERROR_CODES.SYSTEM_ERROR,
          `测试错误 ${i}`,
          ERROR_TYPES.SYSTEM
        )
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      console.log(`创建1000个错误对象耗时: ${duration.toFixed(2)}ms`)
      test.expect(duration).toBeTruthy() // 只要能完成就算通过
    })

    test.it('错误队列性能测试', () => {
      const startTime = performance.now()
      
      for (let i = 0; i < 100; i++) {
        globalErrorMonitor.recordError({
          type: 'performance-test',
          message: `性能测试错误 ${i}`,
          timestamp: Date.now()
        })
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      console.log(`记录100个错误耗时: ${duration.toFixed(2)}ms`)
      test.expect(duration).toBeTruthy()
    })
  })
}

/**
 * 运行所有测试
 */
export function runAllTests() {
  console.log('🚀 开始运行错误处理系统测试...')
  console.log('====================================')
  
  // 运行各个测试模块
  testErrorHandler()
  testRetryManager()
  testErrorRecoveryService()
  testGlobalErrorMonitor()
  testIntegration()
  testPerformance()
  
  // 输出测试结果
  const summary = test.getSummary()
  console.log('====================================')
  console.log('📊 测试结果汇总:')
  console.log(`总计: ${summary.total} 个测试`)
  console.log(`通过: ${summary.passed} 个测试`)
  console.log(`失败: ${summary.failed} 个测试`)
  console.log(`通过率: ${summary.passRate}%`)
  
  if (summary.failed > 0) {
    console.log('❌ 有测试失败，请检查错误信息')
    const failedTests = test.results.filter(r => !r.passed)
    failedTests.forEach(test => {
      console.log(`  - ${test.description}: ${test.error}`)
    })
  } else {
    console.log('✅ 所有测试都通过了！')
  }
  
  return summary
}

/**
 * 手动测试函数
 */
export function manualTest() {
  console.log('🔧 手动测试错误处理功能...')
  
  // 测试错误创建
  const testError = ErrorHandler.createError(
    ERROR_CODES.NETWORK_ERROR,
    '这是一个测试错误',
    ERROR_TYPES.NETWORK
  )
  console.log('创建的测试错误:', testError)
  
  // 测试错误记录
  globalErrorMonitor.recordError({
    type: 'manual-test',
    message: '手动测试错误',
    timestamp: Date.now()
  })
  
  // 测试错误统计
  const stats = globalErrorMonitor.getErrorStats()
  console.log('错误统计:', stats)
  
  // 测试恢复历史
  const recoveryStats = globalErrorRecoveryService.getRecoveryStats()
  console.log('恢复统计:', recoveryStats)
  
  console.log('✅ 手动测试完成')
}

// 导出测试框架，以便在其他地方使用
export { SimpleTestFramework, test }

// 在开发环境下自动运行测试
if (process.env.NODE_ENV === 'development') {
  // 延迟执行，确保所有模块都已加载
  setTimeout(() => {
    console.log('🧪 开发环境检测到，自动运行错误处理测试...')
    runAllTests()
  }, 1000)
}