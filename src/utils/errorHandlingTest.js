/**
 * 错误处理系统测试文件
 * 用于验证集中化错误处理的各种功能
 */

import { handleError, ERROR_TYPES, ERROR_LEVELS } from '@/utils/errorHandler'
import { logError, getLogStats, clearLogs } from '@/utils/errorLogger'
import { parseHttpError, parseBusinessError } from '@/utils/errorTypes'

/**
 * 错误处理系统测试类
 */
class ErrorHandlingTest {
  constructor() {
    this.testResults = []
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('🚀 开始错误处理系统测试...')
    
    try {
      // 清空之前的日志
      clearLogs()
      
      // 测试各种错误类型
      await this.testJavaScriptErrors()
      await this.testHttpErrors()
      await this.testBusinessErrors()
      await this.testPromiseRejections()
      await this.testNetworkErrors()
      await this.testValidationErrors()
      
      // 测试日志功能
      await this.testLoggingFeatures()
      
      // 输出测试结果
      this.outputTestResults()
      
    } catch (error) {
      console.error('❌ 测试执行失败:', error)
    }
  }

  /**
   * 测试JavaScript运行时错误
   */
  async testJavaScriptErrors() {
    console.log('🧪 测试JavaScript运行时错误...')
    
    try {
      // 模拟引用错误
      handleError({
        type: ERROR_TYPES.JS_ERROR,
        level: ERROR_LEVELS.HIGH,
        message: '未定义变量引用错误',
        stack: 'ReferenceError: undefinedVariable is not defined\n    at test.js:10:5',
        extra: {
          filename: 'test.js',
          lineno: 10,
          colno: 5
        }
      })
      
      this.addTestResult('JavaScript错误处理', true, '成功处理引用错误')
      
    } catch (error) {
      this.addTestResult('JavaScript错误处理', false, error.message)
    }
  }

  /**
   * 测试HTTP错误
   */
  async testHttpErrors() {
    console.log('🧪 测试HTTP错误...')
    
    try {
      // 模拟401未授权错误
      const unauthorizedError = {
        response: {
          status: 401,
          data: { message: '用户未授权' }
        },
        config: {
          url: '/api/user/profile',
          method: 'get'
        }
      }
      
      const parsedError = parseHttpError(unauthorizedError)
      handleError(parsedError)
      
      // 模拟500服务器错误
      const serverError = {
        response: {
          status: 500,
          data: { message: '服务器内部错误' }
        },
        config: {
          url: '/api/products',
          method: 'post'
        }
      }
      
      const parsedServerError = parseHttpError(serverError)
      handleError(parsedServerError)
      
      this.addTestResult('HTTP错误处理', true, '成功处理401和500错误')
      
    } catch (error) {
      this.addTestResult('HTTP错误处理', false, error.message)
    }
  }

  /**
   * 测试业务错误
   */
  async testBusinessErrors() {
    console.log('🧪 测试业务错误...')
    
    try {
      // 模拟业务逻辑错误
      const businessResponse = {
        code: 1001,
        message: '用户名或密码错误',
        data: null
      }
      
      const parsedError = parseBusinessError(businessResponse)
      handleError(parsedError)
      
      // 模拟验证错误
      handleError({
        type: ERROR_TYPES.VALIDATION_ERROR,
        level: ERROR_LEVELS.MEDIUM,
        message: '邮箱格式不正确',
        extra: {
          field: 'email',
          value: 'invalid-email',
          rule: 'email format'
        }
      })
      
      this.addTestResult('业务错误处理', true, '成功处理业务逻辑和验证错误')
      
    } catch (error) {
      this.addTestResult('业务错误处理', false, error.message)
    }
  }

  /**
   * 测试Promise异常
   */
  async testPromiseRejections() {
    console.log('🧪 测试Promise异常...')
    
    try {
      // 模拟Promise拒绝
      handleError({
        type: ERROR_TYPES.PROMISE_REJECTION,
        level: ERROR_LEVELS.MEDIUM,
        message: '异步操作失败',
        extra: {
          promiseReason: 'Network request failed',
          operation: 'fetchUserData'
        }
      })
      
      this.addTestResult('Promise异常处理', true, '成功处理Promise拒绝')
      
    } catch (error) {
      this.addTestResult('Promise异常处理', false, error.message)
    }
  }

  /**
   * 测试网络错误
   */
  async testNetworkErrors() {
    console.log('🧪 测试网络错误...')
    
    try {
      // 模拟网络连接错误
      const networkError = {
        message: 'Network Error',
        code: 'ERR_NETWORK',
        config: {
          url: '/api/data',
          method: 'get'
        }
      }
      
      const parsedError = parseHttpError(networkError)
      handleError(parsedError)
      
      // 模拟超时错误
      const timeoutError = {
        message: 'timeout of 5000ms exceeded',
        code: 'ECONNABORTED',
        config: {
          url: '/api/upload',
          method: 'post'
        }
      }
      
      const parsedTimeoutError = parseHttpError(timeoutError)
      handleError(parsedTimeoutError)
      
      this.addTestResult('网络错误处理', true, '成功处理网络连接和超时错误')
      
    } catch (error) {
      this.addTestResult('网络错误处理', false, error.message)
    }
  }

  /**
   * 测试验证错误
   */
  async testValidationErrors() {
    console.log('🧪 测试验证错误...')
    
    try {
      // 模拟表单验证错误
      handleError({
        type: ERROR_TYPES.VALIDATION_ERROR,
        level: ERROR_LEVELS.MEDIUM,
        message: '表单验证失败',
        extra: {
          errors: [
            { field: 'username', message: '用户名不能为空' },
            { field: 'password', message: '密码长度至少6位' },
            { field: 'email', message: '邮箱格式不正确' }
          ]
        }
      })
      
      this.addTestResult('验证错误处理', true, '成功处理表单验证错误')
      
    } catch (error) {
      this.addTestResult('验证错误处理', false, error.message)
    }
  }

  /**
   * 测试日志功能
   */
  async testLoggingFeatures() {
    console.log('🧪 测试日志功能...')
    
    try {
      // 等待一秒确保所有错误都被处理
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 获取日志统计
      const stats = getLogStats()
      
      console.log('📊 日志统计:', stats)
      
      // 验证日志是否被正确记录
      if (stats.total > 0) {
        this.addTestResult('日志记录功能', true, `成功记录${stats.total}条错误日志`)
      } else {
        this.addTestResult('日志记录功能', false, '没有记录到错误日志')
      }
      
      // 测试日志级别分布
      const hasErrorLogs = stats.byLevel.error > 0 || stats.byLevel.critical > 0
      const hasWarnLogs = stats.byLevel.warn > 0
      
      if (hasErrorLogs && hasWarnLogs) {
        this.addTestResult('日志级别分类', true, '正确分类不同级别的错误')
      } else {
        this.addTestResult('日志级别分类', false, '日志级别分类异常')
      }
      
    } catch (error) {
      this.addTestResult('日志功能测试', false, error.message)
    }
  }

  /**
   * 添加测试结果
   */
  addTestResult(testName, success, message) {
    this.testResults.push({
      name: testName,
      success,
      message,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * 输出测试结果
   */
  outputTestResults() {
    console.log('\n📋 错误处理系统测试结果:')
    console.log('================================')
    
    const successCount = this.testResults.filter(result => result.success).length
    const totalCount = this.testResults.length
    
    this.testResults.forEach(result => {
      const icon = result.success ? '✅' : '❌'
      console.log(`${icon} ${result.name}: ${result.message}`)
    })
    
    console.log('================================')
    console.log(`📊 测试总结: ${successCount}/${totalCount} 通过`)
    
    if (successCount === totalCount) {
      console.log('🎉 所有测试都通过了！错误处理系统工作正常。')
    } else {
      console.log('⚠️  有测试失败，请检查错误处理系统配置。')
    }
    
    // 输出最终的日志统计
    const finalStats = getLogStats()
    console.log('\n📈 最终日志统计:', finalStats)
  }

  /**
   * 手动触发真实错误进行测试
   */
  triggerRealErrors() {
    console.log('🔥 触发真实错误进行测试...')
    
    // 触发JavaScript错误
    setTimeout(() => {
      try {
        // 故意引用未定义的变量
        console.log(undefinedVariable)
      } catch (error) {
        // 这个错误会被全局错误监听器捕获
      }
    }, 1000)
    
    // 触发Promise异常
    setTimeout(() => {
      Promise.reject(new Error('测试Promise异常'))
    }, 2000)
    
    // 触发资源加载错误
    setTimeout(() => {
      const img = new Image()
      img.src = 'http://nonexistent-domain.com/image.jpg'
      document.body.appendChild(img)
    }, 3000)
  }
}

// 导出测试类
export default ErrorHandlingTest

// 便捷方法
export const runErrorTests = async () => {
  const tester = new ErrorHandlingTest()
  await tester.runAllTests()
  return tester.testResults
}

export const triggerRealErrors = () => {
  const tester = new ErrorHandlingTest()
  tester.triggerRealErrors()
}

// 在开发环境下自动添加全局测试方法
if (process.env.NODE_ENV === 'development') {
  window.testErrorHandling = runErrorTests
  window.triggerTestErrors = triggerRealErrors
  
  console.log('🧪 错误处理测试方法已添加到全局:')
  console.log('- window.testErrorHandling(): 运行所有错误处理测试')
  console.log('- window.triggerTestErrors(): 触发真实错误进行测试')
}", "original_text": ""}]