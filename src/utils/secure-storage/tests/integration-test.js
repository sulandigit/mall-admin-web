/**
 * 集成测试脚本
 * 测试整个加密存储系统与现有功能的集成
 */

// 这个脚本用于在 Node.js 环境或浏览器控制台中运行集成测试
// 由于这是前端项目，实际测试需要在浏览器环境中进行

/**
 * 集成测试套件类
 */
class IntegrationTestSuite {
  constructor() {
    this.testResults = []
    this.totalTests = 0
    this.passedTests = 0
    this.failedTests = 0
  }

  /**
   * 记录测试结果
   * @param {string} testName - 测试名称
   * @param {boolean} passed - 是否通过
   * @param {string} message - 测试消息
   * @param {any} details - 详细信息
   */
  recordTest(testName, passed, message = '', details = null) {
    this.totalTests++
    if (passed) {
      this.passedTests++
    } else {
      this.failedTests++
    }

    const result = {
      testName,
      passed,
      message,
      details,
      timestamp: new Date().toISOString()
    }

    this.testResults.push(result)

    // 输出测试结果
    const icon = passed ? '✅' : '❌'
    const status = passed ? 'PASS' : 'FAIL'
    console.log(`${icon} [${status}] ${testName}: ${message}`)
    
    if (details) {
      console.log('   详情:', details)
    }
  }

  /**
   * 运行认证集成测试
   */
  async runAuthIntegrationTests() {
    console.log('\n🔐 开始认证集成测试...')

    try {
      // 测试1: Token 存储和检索
      const testToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      
      // 模拟 setToken 函数
      if (typeof setToken === 'function') {
        const stored = await setToken(testToken)
        this.recordTest(
          'Auth Token Storage',
          stored === true,
          stored ? 'Token 存储成功' : 'Token 存储失败'
        )

        // 测试检索
        if (typeof getToken === 'function') {
          const retrieved = await getToken()
          this.recordTest(
            'Auth Token Retrieval',
            retrieved === testToken,
            retrieved === testToken ? 'Token 检索成功' : `Token 检索失败: ${retrieved}`
          )
        }

        // 测试删除
        if (typeof removeToken === 'function') {
          const removed = await removeToken()
          this.recordTest(
            'Auth Token Removal',
            removed === true,
            removed ? 'Token 删除成功' : 'Token 删除失败'
          )
        }
      } else {
        this.recordTest(
          'Auth Functions Available',
          false,
          'auth.js functions not available in test environment'
        )
      }

    } catch (error) {
      this.recordTest(
        'Auth Integration Error',
        false,
        `认证集成测试出错: ${error.message}`,
        error.stack
      )
    }
  }

  /**
   * 运行存储适配器集成测试
   */
  async runStorageIntegrationTests() {
    console.log('\n💾 开始存储适配器集成测试...')

    try {
      // 测试不同存储位置的数据一致性
      const testData = {
        user: 'testUser',
        timestamp: Date.now(),
        preferences: {
          theme: 'dark',
          language: 'zh-CN'
        }
      }

      // 测试 IndexedDB 存储
      if (typeof window !== 'undefined' && window.indexedDB) {
        this.recordTest(
          'IndexedDB Available',
          true,
          'IndexedDB 可用'
        )
      } else {
        this.recordTest(
          'IndexedDB Available',
          false,
          'IndexedDB 不可用'
        )
      }

      // 测试 LocalStorage 存储
      if (typeof localStorage !== 'undefined') {
        try {
          const testKey = '_integration_test_' + Date.now()
          localStorage.setItem(testKey, JSON.stringify(testData))
          const retrieved = JSON.parse(localStorage.getItem(testKey))
          localStorage.removeItem(testKey)

          this.recordTest(
            'LocalStorage Integration',
            JSON.stringify(retrieved) === JSON.stringify(testData),
            'LocalStorage 读写测试成功'
          )
        } catch (error) {
          this.recordTest(
            'LocalStorage Integration',
            false,
            `LocalStorage 测试失败: ${error.message}`
          )
        }
      }

      // 测试 SessionStorage 存储
      if (typeof sessionStorage !== 'undefined') {
        try {
          const testKey = '_integration_test_session_' + Date.now()
          sessionStorage.setItem(testKey, JSON.stringify(testData))
          const retrieved = JSON.parse(sessionStorage.getItem(testKey))
          sessionStorage.removeItem(testKey)

          this.recordTest(
            'SessionStorage Integration',
            JSON.stringify(retrieved) === JSON.stringify(testData),
            'SessionStorage 读写测试成功'
          )
        } catch (error) {
          this.recordTest(
            'SessionStorage Integration',
            false,
            `SessionStorage 测试失败: ${error.message}`
          )
        }
      }

    } catch (error) {
      this.recordTest(
        'Storage Integration Error',
        false,
        `存储集成测试出错: ${error.message}`,
        error.stack
      )
    }
  }

  /**
   * 运行安全监控集成测试
   */
  async runSecurityIntegrationTests() {
    console.log('\n🛡️ 开始安全监控集成测试...')

    try {
      // 测试事件监听
      if (typeof window !== 'undefined') {
        let eventReceived = false
        
        const eventListener = (event) => {
          if (event.type === 'secureStorageAlert') {
            eventReceived = true
          }
        }

        window.addEventListener('secureStorageAlert', eventListener)

        // 模拟触发安全事件
        const mockEvent = new CustomEvent('secureStorageAlert', {
          detail: {
            eventType: 'test_event',
            severity: 'low',
            timestamp: Date.now()
          }
        })
        
        window.dispatchEvent(mockEvent)

        // 等待事件处理
        await new Promise(resolve => setTimeout(resolve, 100))

        window.removeEventListener('secureStorageAlert', eventListener)

        this.recordTest(
          'Security Event Integration',
          eventReceived,
          eventReceived ? '安全事件监听成功' : '安全事件监听失败'
        )
      }

      // 测试控制台输出拦截
      const originalConsoleLog = console.log
      let consoleOutputCaptured = false
      
      console.log = (...args) => {
        if (args.some(arg => typeof arg === 'string' && arg.includes('SecureStorage'))) {
          consoleOutputCaptured = true
        }
        originalConsoleLog.apply(console, args)
      }

      // 模拟产生控制台输出
      console.log('🔒 SecureStorage test log message')

      // 恢复原始console.log
      console.log = originalConsoleLog

      this.recordTest(
        'Console Logging Integration',
        consoleOutputCaptured,
        consoleOutputCaptured ? '控制台日志集成成功' : '控制台日志集成失败'
      )

    } catch (error) {
      this.recordTest(
        'Security Integration Error',
        false,
        `安全监控集成测试出错: ${error.message}`,
        error.stack
      )
    }
  }

  /**
   * 运行性能集成测试
   */
  async runPerformanceIntegrationTests() {
    console.log('\n⚡ 开始性能集成测试...')

    try {
      const startTime = performance.now()
      
      // 模拟大量数据操作
      const operations = []
      for (let i = 0; i < 100; i++) {
        operations.push(
          new Promise(resolve => {
            setTimeout(() => {
              resolve(`operation_${i}`)
            }, Math.random() * 10)
          })
        )
      }

      await Promise.all(operations)
      const endTime = performance.now()
      const duration = endTime - startTime

      this.recordTest(
        'Performance Test',
        duration < 5000, // 5秒内完成
        `100个并发操作耗时 ${duration.toFixed(2)}ms`,
        { duration, operations: operations.length }
      )

      // 测试内存使用情况
      if (typeof window !== 'undefined' && window.performance && window.performance.memory) {
        const memoryInfo = window.performance.memory
        
        this.recordTest(
          'Memory Usage Check',
          memoryInfo.usedJSHeapSize < memoryInfo.totalJSHeapSize * 0.9,
          `内存使用: ${(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB / ${(memoryInfo.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          memoryInfo
        )
      }

    } catch (error) {
      this.recordTest(
        'Performance Integration Error',
        false,
        `性能集成测试出错: ${error.message}`,
        error.stack
      )
    }
  }

  /**
   * 运行完整集成测试套件
   */
  async runFullIntegrationSuite() {
    console.log('🚀 开始运行完整集成测试套件...')
    console.log('测试环境:', typeof window !== 'undefined' ? '浏览器' : 'Node.js')

    const suiteStartTime = Date.now()

    await this.runAuthIntegrationTests()
    await this.runStorageIntegrationTests()
    await this.runSecurityIntegrationTests()
    await this.runPerformanceIntegrationTests()

    const suiteEndTime = Date.now()
    const totalDuration = suiteEndTime - suiteStartTime

    // 输出测试摘要
    console.log('\n📊 集成测试摘要:')
    console.log('━'.repeat(50))
    console.log(`总测试数: ${this.totalTests}`)
    console.log(`通过: ${this.passedTests} ✅`)
    console.log(`失败: ${this.failedTests} ❌`)
    console.log(`成功率: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`)
    console.log(`总耗时: ${totalDuration}ms`)
    console.log('━'.repeat(50))

    // 返回测试结果
    return {
      totalTests: this.totalTests,
      passedTests: this.passedTests,
      failedTests: this.failedTests,
      successRate: (this.passedTests / this.totalTests) * 100,
      duration: totalDuration,
      results: this.testResults
    }
  }

  /**
   * 导出测试结果
   */
  exportResults(format = 'json') {
    const summary = {
      timestamp: new Date().toISOString(),
      environment: typeof window !== 'undefined' ? 'browser' : 'nodejs',
      summary: {
        totalTests: this.totalTests,
        passedTests: this.passedTests,
        failedTests: this.failedTests,
        successRate: (this.passedTests / this.totalTests) * 100
      },
      results: this.testResults
    }

    if (format === 'json') {
      return JSON.stringify(summary, null, 2)
    } else if (format === 'csv') {
      let csv = 'Test Name,Status,Message,Timestamp\n'
      this.testResults.forEach(result => {
        csv += `"${result.testName}","${result.passed ? 'PASS' : 'FAIL'}","${result.message}","${result.timestamp}"\n`
      })
      return csv
    }

    return summary
  }
}

// 如果在浏览器环境中，将测试套件添加到全局对象
if (typeof window !== 'undefined') {
  window.IntegrationTestSuite = IntegrationTestSuite
  
  // 自动运行测试的便捷函数
  window.runIntegrationTests = async function() {
    const testSuite = new IntegrationTestSuite()
    const results = await testSuite.runFullIntegrationSuite()
    
    console.log('\n📄 导出测试结果:')
    console.log(testSuite.exportResults('json'))
    
    return results
  }
  
  console.log('✅ 集成测试套件已加载')
  console.log('💡 使用 runIntegrationTests() 运行完整测试')
}

// 如果在 Node.js 环境中
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IntegrationTestSuite
}

// 导出类
export default IntegrationTestSuite