/**
 * 图片优化性能测试工具
 * 用于测试懒加载和WebP优化的性能表现
 */

class ImageOptimizationPerformanceTester {
  constructor() {
    this.tests = {
      lazyLoading: [],
      webpConversion: [],
      cachePerformance: [],
      memoryUsage: []
    }

    this.metrics = {
      loadTimes: [],
      conversionTimes: [],
      memorySavings: [],
      bandwidthSavings: []
    }

    this.isRunning = false
  }

  /**
   * 启动性能测试
   */
  async startPerformanceTest(options = {}) {
    if (this.isRunning) {
      console.warn('Performance test is already running')
      return
    }

    this.isRunning = true
    
    const config = {
      testDuration: 60000, // 60秒
      imageCount: 50,
      imageTypes: ['jpg', 'png'],
      testTypes: ['lazy', 'webp', 'cache'],
      ...options
    }

    console.log('Starting image optimization performance test...', config)

    try {
      const results = {}

      if (config.testTypes.includes('lazy')) {
        results.lazyLoading = await this.testLazyLoading(config)
      }

      if (config.testTypes.includes('webp')) {
        results.webpConversion = await this.testWebPConversion(config)
      }

      if (config.testTypes.includes('cache')) {
        results.cachePerformance = await this.testCachePerformance(config)
      }

      if (config.testTypes.includes('memory')) {
        results.memoryUsage = await this.testMemoryUsage(config)
      }

      const summary = this.generateTestSummary(results)
      console.log('Performance test completed:', summary)

      return { results, summary }

    } catch (error) {
      console.error('Performance test failed:', error)
      throw error
    } finally {
      this.isRunning = false
    }
  }

  /**
   * 测试懒加载性能
   */
  async testLazyLoading(config) {
    console.log('Testing lazy loading performance...')

    const testResults = {
      totalImages: config.imageCount,
      loadedImages: 0,
      savedRequests: 0,
      averageLoadTime: 0,
      loadTimes: []
    }

    // 创建测试图片列表
    const testImages = this.generateTestImageUrls(config.imageCount, config.imageTypes)

    // 创建容器
    const testContainer = document.createElement('div')
    testContainer.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: 1000px;
      height: 10000px;
      overflow: auto;
    `
    document.body.appendChild(testContainer)

    try {
      // 创建懒加载图片元素
      const lazyImages = testImages.map((url, index) => {
        const imgContainer = document.createElement('div')
        imgContainer.style.cssText = 'width: 200px; height: 200px; margin: 20px;'
        imgContainer.dataset.src = url
        imgContainer.dataset.index = index
        testContainer.appendChild(imgContainer)
        return imgContainer
      })

      // 模拟滚动加载
      const startTime = performance.now()
      const loadPromises = []

      for (let i = 0; i < Math.min(10, lazyImages.length); i++) {
        const imgElement = lazyImages[i]
        const loadPromise = this.simulateLazyLoad(imgElement)
        loadPromises.push(loadPromise)
      }

      const loadResults = await Promise.allSettled(loadPromises)
      const endTime = performance.now()

      // 统计结果
      testResults.loadedImages = loadResults.filter(r => r.status === 'fulfilled').length
      testResults.savedRequests = testResults.totalImages - testResults.loadedImages
      testResults.averageLoadTime = (endTime - startTime) / testResults.loadedImages

      return testResults

    } finally {
      document.body.removeChild(testContainer)
    }
  }

  /**
   * 模拟懒加载
   */
  simulateLazyLoad(element) {
    return new Promise((resolve, reject) => {
      const startTime = performance.now()
      
      const img = new Image()
      img.onload = () => {
        const loadTime = performance.now() - startTime
        this.metrics.loadTimes.push(loadTime)
        resolve({ element, loadTime })
      }
      img.onerror = () => reject(new Error('Image load failed'))
      
      // 模拟延迟加载
      setTimeout(() => {
        img.src = element.dataset.src
      }, 100)
    })
  }

  /**
   * 测试WebP转换性能
   */
  async testWebPConversion(config) {
    console.log('Testing WebP conversion performance...')

    const testResults = {
      totalConversions: 0,
      successfulConversions: 0,
      failedConversions: 0,
      averageConversionTime: 0,
      averageCompressionRatio: 0,
      totalSpaceSaved: 0
    }

    const testFiles = await this.generateTestFiles(config.imageCount, config.imageTypes)

    const conversionPromises = testFiles.map(async (file) => {
      const startTime = performance.now()
      
      try {
        const webpFile = await this.convertFileToWebP(file)
        const conversionTime = performance.now() - startTime
        const compressionRatio = (file.size - webpFile.size) / file.size
        const spaceSaved = file.size - webpFile.size

        testResults.successfulConversions++
        this.metrics.conversionTimes.push(conversionTime)
        testResults.totalSpaceSaved += spaceSaved

        return {
          success: true,
          conversionTime,
          compressionRatio,
          spaceSaved,
          originalSize: file.size,
          webpSize: webpFile.size
        }

      } catch (error) {
        testResults.failedConversions++
        return {
          success: false,
          error: error.message
        }
      }
    })

    const results = await Promise.allSettled(conversionPromises)
    testResults.totalConversions = results.length

    // 计算平均值
    const successfulResults = results
      .filter(r => r.status === 'fulfilled' && r.value.success)
      .map(r => r.value)

    if (successfulResults.length > 0) {
      testResults.averageConversionTime = successfulResults
        .reduce((sum, r) => sum + r.conversionTime, 0) / successfulResults.length

      testResults.averageCompressionRatio = successfulResults
        .reduce((sum, r) => sum + r.compressionRatio, 0) / successfulResults.length
    }

    return testResults
  }

  /**
   * 测试缓存性能
   */
  async testCachePerformance(config) {
    console.log('Testing cache performance...')

    const testResults = {
      cacheHits: 0,
      cacheMisses: 0,
      averageCacheHitTime: 0,
      averageCacheMissTime: 0,
      hitRate: 0
    }

    const testUrls = this.generateTestImageUrls(config.imageCount, config.imageTypes)
    const cache = new Map()

    // 首次加载（全部缓存未命中）
    for (const url of testUrls) {
      const startTime = performance.now()
      const imageData = await this.fetchImageData(url)
      const loadTime = performance.now() - startTime

      cache.set(url, imageData)
      testResults.cacheMisses++
      testResults.averageCacheMissTime = 
        (testResults.averageCacheMissTime * (testResults.cacheMisses - 1) + loadTime) / testResults.cacheMisses
    }

    // 第二次加载（应该命中缓存）
    for (const url of testUrls) {
      const startTime = performance.now()
      
      if (cache.has(url)) {
        const imageData = cache.get(url)
        const hitTime = performance.now() - startTime
        
        testResults.cacheHits++
        testResults.averageCacheHitTime = 
          (testResults.averageCacheHitTime * (testResults.cacheHits - 1) + hitTime) / testResults.cacheHits
      }
    }

    testResults.hitRate = testResults.cacheHits / (testResults.cacheHits + testResults.cacheMisses)

    return testResults
  }

  /**
   * 测试内存使用
   */
  async testMemoryUsage(config) {
    console.log('Testing memory usage...')

    const testResults = {
      initialMemory: 0,
      peakMemory: 0,
      finalMemory: 0,
      memoryIncrease: 0,
      averageImageMemory: 0
    }

    if (performance.memory) {
      testResults.initialMemory = performance.memory.usedJSHeapSize

      // 创建大量图片元素
      const images = []
      const testUrls = this.generateTestImageUrls(config.imageCount, config.imageTypes)

      for (const url of testUrls) {
        const img = new Image()
        img.src = url
        images.push(img)
        
        // 定期检查内存使用
        await new Promise(resolve => setTimeout(resolve, 10))
        
        if (performance.memory) {
          testResults.peakMemory = Math.max(
            testResults.peakMemory, 
            performance.memory.usedJSHeapSize
          )
        }
      }

      // 等待所有图片加载完成
      await Promise.allSettled(images.map(img => {
        return new Promise(resolve => {
          if (img.complete) resolve()
          else {
            img.onload = resolve
            img.onerror = resolve
          }
        })
      }))

      if (performance.memory) {
        testResults.finalMemory = performance.memory.usedJSHeapSize
        testResults.memoryIncrease = testResults.finalMemory - testResults.initialMemory
        testResults.averageImageMemory = testResults.memoryIncrease / config.imageCount
      }

      // 清理
      images.length = 0
    }

    return testResults
  }

  /**
   * 生成测试图片URL
   */
  generateTestImageUrls(count, types) {
    const urls = []
    const baseUrl = 'https://picsum.photos'
    
    for (let i = 0; i < count; i++) {
      const width = 200 + (i % 300)
      const height = 200 + (i % 300)
      const type = types[i % types.length]
      
      urls.push(`${baseUrl}/${width}/${height}?random=${i}&format=${type}`)
    }
    
    return urls
  }

  /**
   * 生成测试文件
   */
  async generateTestFiles(count, types) {
    const files = []
    
    for (let i = 0; i < count; i++) {
      const type = types[i % types.length]
      const size = 50000 + Math.random() * 200000 // 50KB - 250KB
      
      const canvas = document.createElement('canvas')
      canvas.width = 400
      canvas.height = 300
      
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = `hsl(${Math.random() * 360}, 50%, 50%)`
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, `image/${type === 'jpg' ? 'jpeg' : type}`, 0.8)
      })
      
      const file = new File([blob], `test${i}.${type}`, { type: blob.type })
      files.push(file)
    }
    
    return files
  }

  /**
   * WebP转换
   */
  convertFileToWebP(file) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const webpFile = new File([blob], file.name.replace(/\.\w+$/, '.webp'), {
                type: 'image/webp'
              })
              resolve(webpFile)
            } else {
              reject(new Error('WebP conversion failed'))
            }
          },
          'image/webp',
          0.8
        )
      }
      img.onerror = () => reject(new Error('Image load failed'))
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * 获取图片数据
   */
  async fetchImageData(url) {
    // 模拟网络请求
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ url, size: 50000 + Math.random() * 100000 })
      }, 50 + Math.random() * 200)
    })
  }

  /**
   * 生成测试总结
   */
  generateTestSummary(results) {
    const summary = {
      testDate: new Date().toISOString(),
      performance: {
        score: 0,
        grade: 'F'
      },
      recommendations: []
    }

    let totalScore = 0
    let scoreCount = 0

    // 懒加载性能评分
    if (results.lazyLoading) {
      const lazyScore = this.scoreLazyLoadingPerformance(results.lazyLoading)
      totalScore += lazyScore
      scoreCount++
      
      summary.lazyLoading = {
        score: lazyScore,
        loadTime: results.lazyLoading.averageLoadTime,
        savedRequests: results.lazyLoading.savedRequests
      }

      if (lazyScore < 70) {
        summary.recommendations.push('优化懒加载触发机制，减少加载延迟')
      }
    }

    // WebP转换性能评分
    if (results.webpConversion) {
      const webpScore = this.scoreWebPPerformance(results.webpConversion)
      totalScore += webpScore
      scoreCount++
      
      summary.webpConversion = {
        score: webpScore,
        conversionTime: results.webpConversion.averageConversionTime,
        compressionRatio: results.webpConversion.averageCompressionRatio,
        spaceSaved: results.webpConversion.totalSpaceSaved
      }

      if (webpScore < 70) {
        summary.recommendations.push('优化WebP转换质量设置，平衡压缩率和转换速度')
      }
    }

    // 缓存性能评分
    if (results.cachePerformance) {
      const cacheScore = this.scoreCachePerformance(results.cachePerformance)
      totalScore += cacheScore
      scoreCount++
      
      summary.cachePerformance = {
        score: cacheScore,
        hitRate: results.cachePerformance.hitRate,
        hitTime: results.cachePerformance.averageCacheHitTime
      }

      if (cacheScore < 70) {
        summary.recommendations.push('增加缓存容量或优化缓存策略')
      }
    }

    // 内存使用评分
    if (results.memoryUsage) {
      const memoryScore = this.scoreMemoryUsage(results.memoryUsage)
      totalScore += memoryScore
      scoreCount++
      
      summary.memoryUsage = {
        score: memoryScore,
        memoryIncrease: results.memoryUsage.memoryIncrease,
        averageImageMemory: results.memoryUsage.averageImageMemory
      }

      if (memoryScore < 70) {
        summary.recommendations.push('优化图片内存使用，考虑图片回收机制')
      }
    }

    // 总体评分
    if (scoreCount > 0) {
      summary.performance.score = Math.round(totalScore / scoreCount)
      summary.performance.grade = this.getPerformanceGrade(summary.performance.score)
    }

    return summary
  }

  /**
   * 懒加载性能评分
   */
  scoreLazyLoadingPerformance(results) {
    const { averageLoadTime, savedRequests, totalImages } = results
    
    // 基于加载时间评分 (目标: < 100ms)
    const timeScore = Math.max(0, 100 - averageLoadTime / 10)
    
    // 基于节省请求数评分
    const savingScore = (savedRequests / totalImages) * 100
    
    return Math.round((timeScore + savingScore) / 2)
  }

  /**
   * WebP性能评分
   */
  scoreWebPPerformance(results) {
    const { averageConversionTime, averageCompressionRatio, successfulConversions, totalConversions } = results
    
    // 基于转换时间评分 (目标: < 1000ms)
    const timeScore = Math.max(0, 100 - averageConversionTime / 100)
    
    // 基于压缩率评分 (目标: > 20%)
    const compressionScore = Math.min(100, averageCompressionRatio * 500)
    
    // 基于成功率评分
    const successScore = (successfulConversions / totalConversions) * 100
    
    return Math.round((timeScore + compressionScore + successScore) / 3)
  }

  /**
   * 缓存性能评分
   */
  scoreCachePerformance(results) {
    const { hitRate, averageCacheHitTime, averageCacheMissTime } = results
    
    // 基于命中率评分
    const hitRateScore = hitRate * 100
    
    // 基于命中时间评分 (目标: < 10ms)
    const hitTimeScore = Math.max(0, 100 - averageCacheHitTime * 10)
    
    // 基于性能提升评分
    const improvementScore = averageCacheMissTime > 0 
      ? Math.min(100, (1 - averageCacheHitTime / averageCacheMissTime) * 100)
      : 0
    
    return Math.round((hitRateScore + hitTimeScore + improvementScore) / 3)
  }

  /**
   * 内存使用评分
   */
  scoreMemoryUsage(results) {
    const { averageImageMemory } = results
    
    // 基于单张图片内存使用评分 (目标: < 100KB)
    const memoryScore = Math.max(0, 100 - averageImageMemory / 1000)
    
    return Math.round(memoryScore)
  }

  /**
   * 获取性能等级
   */
  getPerformanceGrade(score) {
    if (score >= 90) return 'A+'
    if (score >= 80) return 'A'
    if (score >= 70) return 'B'
    if (score >= 60) return 'C'
    if (score >= 50) return 'D'
    return 'F'
  }

  /**
   * 导出测试报告
   */
  exportReport(results, format = 'json') {
    const report = {
      timestamp: Date.now(),
      date: new Date().toISOString(),
      userAgent: navigator.userAgent,
      results,
      metrics: this.metrics
    }

    switch (format) {
      case 'json':
        return JSON.stringify(report, null, 2)
      
      case 'csv':
        return this.convertToCSV(report)
      
      default:
        return report
    }
  }

  /**
   * 转换为CSV格式
   */
  convertToCSV(report) {
    const csvRows = []
    
    // 标题行
    csvRows.push(['Test Type', 'Metric', 'Value', 'Unit'])
    
    // 懒加载数据
    if (report.results.lazyLoading) {
      const lazy = report.results.lazyLoading
      csvRows.push(['Lazy Loading', 'Average Load Time', lazy.averageLoadTime, 'ms'])
      csvRows.push(['Lazy Loading', 'Saved Requests', lazy.savedRequests, 'count'])
      csvRows.push(['Lazy Loading', 'Total Images', lazy.totalImages, 'count'])
    }
    
    // WebP数据
    if (report.results.webpConversion) {
      const webp = report.results.webpConversion
      csvRows.push(['WebP Conversion', 'Average Conversion Time', webp.averageConversionTime, 'ms'])
      csvRows.push(['WebP Conversion', 'Compression Ratio', webp.averageCompressionRatio, '%'])
      csvRows.push(['WebP Conversion', 'Total Space Saved', webp.totalSpaceSaved, 'bytes'])
    }
    
    return csvRows.map(row => row.join(',')).join('\n')
  }

  /**
   * 清理测试数据
   */
  cleanup() {
    this.tests = {
      lazyLoading: [],
      webpConversion: [],
      cachePerformance: [],
      memoryUsage: []
    }

    this.metrics = {
      loadTimes: [],
      conversionTimes: [],
      memorySavings: [],
      bandwidthSavings: []
    }

    this.isRunning = false
  }
}

// 导出性能测试工具
export { ImageOptimizationPerformanceTester }

// 创建全局实例
if (typeof window !== 'undefined') {
  window.ImageOptimizationPerformanceTester = ImageOptimizationPerformanceTester
}