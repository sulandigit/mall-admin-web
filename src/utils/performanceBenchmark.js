/**
 * 性能基准测试工具
 * 用于测试和验证优化效果
 */

class PerformanceBenchmark {
  constructor() {
    this.results = new Map()
    this.testSuites = new Map()
    this.isRunning = false
  }

  /**
   * 注册测试套件
   */
  registerTestSuite(name, tests) {
    this.testSuites.set(name, tests)
  }

  /**
   * 运行基准测试
   */
  async runBenchmark(suiteName, options = {}) {
    const {
      iterations = 10,
      warmupIterations = 3,
      onProgress = null
    } = options

    if (this.isRunning) {
      throw new Error('基准测试正在运行中')
    }

    this.isRunning = true
    const testSuite = this.testSuites.get(suiteName)
    
    if (!testSuite) {
      throw new Error(`找不到测试套件: ${suiteName}`)
    }

    const results = {
      suiteName,
      timestamp: Date.now(),
      tests: new Map(),
      summary: {}
    }

    try {
      for (const [testName, testFunction] of Object.entries(testSuite)) {
        if (onProgress) {
          onProgress(`运行测试: ${testName}`)
        }

        const testResult = await this.runSingleTest(
          testName,
          testFunction,
          iterations,
          warmupIterations
        )
        
        results.tests.set(testName, testResult)
      }

      // 计算摘要
      results.summary = this.calculateSummary(results.tests)
      
      // 保存结果
      this.results.set(`${suiteName}_${Date.now()}`, results)
      
      return results

    } finally {
      this.isRunning = false
    }
  }

  /**
   * 运行单个测试
   */
  async runSingleTest(testName, testFunction, iterations, warmupIterations) {
    const measurements = []
    
    // 预热阶段
    for (let i = 0; i < warmupIterations; i++) {
      await this.measureExecution(testFunction)
    }

    // 正式测试
    for (let i = 0; i < iterations; i++) {
      const measurement = await this.measureExecution(testFunction)
      measurements.push(measurement)
    }

    return this.analyzeResults(testName, measurements)
  }

  /**
   * 测量执行时间
   */
  async measureExecution(testFunction) {
    // 强制垃圾回收（如果可用）
    if (window.gc) {
      window.gc()
    }

    const startTime = performance.now()
    const startMemory = this.getMemoryUsage()
    
    try {
      await testFunction()
      
      const endTime = performance.now()
      const endMemory = this.getMemoryUsage()
      
      return {
        duration: endTime - startTime,
        memoryDelta: endMemory - startMemory,
        success: true
      }
    } catch (error) {
      const endTime = performance.now()
      
      return {
        duration: endTime - startTime,
        memoryDelta: 0,
        success: false,
        error: error.message
      }
    }
  }

  /**
   * 获取内存使用量
   */
  getMemoryUsage() {
    if (performance.memory) {
      return performance.memory.usedJSHeapSize
    }
    return 0
  }

  /**
   * 分析测试结果
   */
  analyzeResults(testName, measurements) {
    const durations = measurements.map(m => m.duration)
    const memoryDeltas = measurements.map(m => m.memoryDelta)
    const successCount = measurements.filter(m => m.success).length
    
    // 移除异常值（使用四分位数方法）
    const cleanDurations = this.removeOutliers(durations)
    
    return {
      testName,
      iterations: measurements.length,
      successRate: (successCount / measurements.length) * 100,
      duration: {
        mean: this.calculateMean(cleanDurations),
        median: this.calculateMedian(cleanDurations),
        min: Math.min(...cleanDurations),
        max: Math.max(...cleanDurations),
        stdDev: this.calculateStdDev(cleanDurations),
        p95: this.calculatePercentile(cleanDurations, 95),
        p99: this.calculatePercentile(cleanDurations, 99)
      },
      memory: {
        mean: this.calculateMean(memoryDeltas),
        median: this.calculateMedian(memoryDeltas),
        min: Math.min(...memoryDeltas),
        max: Math.max(...memoryDeltas)
      },
      rawMeasurements: measurements
    }
  }

  /**
   * 移除异常值
   */
  removeOutliers(data) {
    const sorted = [...data].sort((a, b) => a - b)
    const q1 = this.calculatePercentile(sorted, 25)
    const q3 = this.calculatePercentile(sorted, 75)
    const iqr = q3 - q1
    const lowerBound = q1 - 1.5 * iqr
    const upperBound = q3 + 1.5 * iqr
    
    return sorted.filter(value => value >= lowerBound && value <= upperBound)
  }

  /**
   * 计算平均值
   */
  calculateMean(values) {
    return values.reduce((sum, value) => sum + value, 0) / values.length
  }

  /**
   * 计算中位数
   */
  calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2
    }
    return sorted[mid]
  }

  /**
   * 计算标准差
   */
  calculateStdDev(values) {
    const mean = this.calculateMean(values)
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2))
    const avgSquaredDiff = this.calculateMean(squaredDiffs)
    return Math.sqrt(avgSquaredDiff)
  }

  /**
   * 计算百分位数
   */
  calculatePercentile(values, percentile) {
    const sorted = [...values].sort((a, b) => a - b)
    const index = (percentile / 100) * (sorted.length - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    
    if (lower === upper) {
      return sorted[lower]
    }
    
    const weight = index - lower
    return sorted[lower] * (1 - weight) + sorted[upper] * weight
  }

  /**
   * 计算摘要统计
   */
  calculateSummary(testResults) {
    const summary = {
      totalTests: testResults.size,
      averageSuccessRate: 0,
      performanceIndex: 0,
      recommendations: []
    }

    let totalSuccessRate = 0
    let totalPerformanceScore = 0

    for (const [testName, result] of testResults.entries()) {
      totalSuccessRate += result.successRate
      
      // 计算性能分数 (基于平均执行时间)
      const performanceScore = Math.max(0, 100 - (result.duration.mean / 10))
      totalPerformanceScore += performanceScore

      // 生成建议
      if (result.duration.mean > 100) {
        summary.recommendations.push(`${testName}: 执行时间过长，建议优化算法`)
      }
      
      if (result.memory.mean > 1000000) { // 1MB
        summary.recommendations.push(`${testName}: 内存使用过多，建议检查内存泄漏`)
      }
      
      if (result.successRate < 100) {
        summary.recommendations.push(`${testName}: 存在失败案例，建议检查错误处理`)
      }
    }

    summary.averageSuccessRate = totalSuccessRate / testResults.size
    summary.performanceIndex = totalPerformanceScore / testResults.size

    return summary
  }

  /**
   * 比较两次测试结果
   */
  compareResults(baselineKey, currentKey) {
    const baseline = this.results.get(baselineKey)
    const current = this.results.get(currentKey)

    if (!baseline || !current) {
      throw new Error('找不到对比的测试结果')
    }

    const comparison = {
      baseline: baseline.suiteName,
      current: current.suiteName,
      timestamp: Date.now(),
      improvements: [],
      regressions: [],
      noChange: [],
      summary: {}
    }

    for (const [testName] of baseline.tests) {
      const baselineResult = baseline.tests.get(testName)
      const currentResult = current.tests.get(testName)

      if (!currentResult) continue

      const durationChange = ((currentResult.duration.mean - baselineResult.duration.mean) / baselineResult.duration.mean) * 100
      const memoryChange = ((currentResult.memory.mean - baselineResult.memory.mean) / Math.abs(baselineResult.memory.mean || 1)) * 100

      const testComparison = {
        testName,
        duration: {
          baseline: baselineResult.duration.mean,
          current: currentResult.duration.mean,
          change: durationChange,
          improved: durationChange < -5 // 改善超过5%
        },
        memory: {
          baseline: baselineResult.memory.mean,
          current: currentResult.memory.mean,
          change: memoryChange,
          improved: memoryChange < -5
        }
      }

      if (testComparison.duration.improved || testComparison.memory.improved) {
        comparison.improvements.push(testComparison)
      } else if (durationChange > 10 || memoryChange > 10) {
        comparison.regressions.push(testComparison)
      } else {
        comparison.noChange.push(testComparison)
      }
    }

    // 计算整体摘要
    comparison.summary = {
      totalTests: baseline.tests.size,
      improvements: comparison.improvements.length,
      regressions: comparison.regressions.length,
      overallImprovement: comparison.improvements.length > comparison.regressions.length
    }

    return comparison
  }

  /**
   * 生成报告
   */
  generateReport(resultKey, format = 'json') {
    const result = this.results.get(resultKey)
    if (!result) {
      throw new Error('找不到测试结果')
    }

    if (format === 'json') {
      return JSON.stringify(result, null, 2)
    }

    if (format === 'html') {
      return this.generateHtmlReport(result)
    }

    if (format === 'csv') {
      return this.generateCsvReport(result)
    }

    throw new Error('不支持的报告格式')
  }

  /**
   * 生成HTML报告
   */
  generateHtmlReport(result) {
    let html = `
      <html>
        <head>
          <title>性能基准测试报告 - ${result.suiteName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .summary { background-color: #e7f3ff; padding: 15px; border-radius: 5px; }
            .recommendation { background-color: #fff3cd; padding: 10px; margin: 5px 0; border-radius: 3px; }
          </style>
        </head>
        <body>
          <h1>性能基准测试报告</h1>
          <div class="summary">
            <h2>摘要</h2>
            <p><strong>测试套件:</strong> ${result.suiteName}</p>
            <p><strong>测试时间:</strong> ${new Date(result.timestamp).toLocaleString()}</p>
            <p><strong>总测试数:</strong> ${result.summary.totalTests}</p>
            <p><strong>平均成功率:</strong> ${result.summary.averageSuccessRate.toFixed(2)}%</p>
            <p><strong>性能指数:</strong> ${result.summary.performanceIndex.toFixed(2)}</p>
          </div>
          
          <h2>测试结果详情</h2>
          <table>
            <tr>
              <th>测试名称</th>
              <th>成功率</th>
              <th>平均时间 (ms)</th>
              <th>中位数时间 (ms)</th>
              <th>95% 时间 (ms)</th>
              <th>内存变化 (bytes)</th>
            </tr>
    `

    for (const [testName, testResult] of result.tests) {
      html += `
        <tr>
          <td>${testName}</td>
          <td>${testResult.successRate.toFixed(2)}%</td>
          <td>${testResult.duration.mean.toFixed(2)}</td>
          <td>${testResult.duration.median.toFixed(2)}</td>
          <td>${testResult.duration.p95.toFixed(2)}</td>
          <td>${testResult.memory.mean.toFixed(0)}</td>
        </tr>
      `
    }

    html += `
          </table>
          
          <h2>建议</h2>
          ${result.summary.recommendations.map(rec => `<div class="recommendation">${rec}</div>`).join('')}
        </body>
      </html>
    `

    return html
  }

  /**
   * 获取所有结果
   */
  getAllResults() {
    return Array.from(this.results.entries()).map(([key, result]) => ({
      key,
      suiteName: result.suiteName,
      timestamp: result.timestamp,
      summary: result.summary
    }))
  }

  /**
   * 清除所有结果
   */
  clearResults() {
    this.results.clear()
  }
}

// 全局基准测试实例
const benchmark = new PerformanceBenchmark()

// 预定义测试套件
benchmark.registerTestSuite('componentRendering', {
  // 大列表渲染性能测试
  async largeListRender() {
    const items = Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `Item ${i}` }))
    
    // 模拟Vue组件渲染
    const startTime = performance.now()
    
    // 这里应该是实际的组件渲染逻辑
    items.forEach(item => {
      const element = document.createElement('div')
      element.textContent = item.name
      element.setAttribute('data-id', item.id)
    })
    
    const endTime = performance.now()
    return endTime - startTime
  },

  // v-memo优化效果测试
  async vMemoOptimization() {
    // 模拟v-memo缓存机制
    const cache = new Map()
    const items = Array.from({ length: 500 }, (_, i) => ({ 
      id: i, 
      name: `Product ${i}`,
      price: Math.random() * 100,
      status: Math.random() > 0.5
    }))

    items.forEach(item => {
      const memoDeps = [item.id, item.price, item.status]
      const cacheKey = JSON.stringify(memoDeps)
      
      if (!cache.has(cacheKey)) {
        // 模拟渲染计算
        const rendered = `${item.name} - $${item.price} - ${item.status ? 'Active' : 'Inactive'}`
        cache.set(cacheKey, rendered)
      }
    })
  }
})

benchmark.registerTestSuite('apiPerformance', {
  // API缓存性能测试
  async apiCaching() {
    const cache = new Map()
    const requests = Array.from({ length: 100 }, (_, i) => `api/products?page=${i % 10}`)
    
    for (const request of requests) {
      if (!cache.has(request)) {
        // 模拟API请求
        await new Promise(resolve => setTimeout(resolve, Math.random() * 10))
        cache.set(request, { data: 'mock data', timestamp: Date.now() })
      }
    }
  },

  // 批量操作性能测试
  async batchOperations() {
    const operations = Array.from({ length: 50 }, (_, i) => ({
      type: 'statusUpdate',
      id: i,
      value: Math.random() > 0.5
    }))

    // 模拟批量处理
    const batches = []
    for (let i = 0; i < operations.length; i += 10) {
      batches.push(operations.slice(i, i + 10))
    }

    await Promise.all(batches.map(async batch => {
      // 模拟批量API调用
      await new Promise(resolve => setTimeout(resolve, Math.random() * 50))
    }))
  }
})

export default benchmark