/**
 * 路由懒加载效果分析工具
 * 用于分析和验证路由懒加载的实现效果
 */

class RouteAnalyzer {
  constructor() {
    this.loadTimes = new Map() // 记录加载时间
    this.chunkSizes = new Map() // 记录chunk大小
    this.failedRoutes = new Set() // 记录失败的路由
  }

  /**
   * 记录路由加载开始
   * @param {string} route 路由名称
   */
  startLoad(route) {
    this.loadTimes.set(route, { start: Date.now() })
    console.log(`📦 开始加载路由组件: ${route}`)
  }

  /**
   * 记录路由加载完成
   * @param {string} route 路由名称
   * @param {boolean} success 是否成功
   */
  endLoad(route, success = true) {
    const loadInfo = this.loadTimes.get(route)
    if (loadInfo) {
      loadInfo.end = Date.now()
      loadInfo.duration = loadInfo.end - loadInfo.start
      loadInfo.success = success
      
      if (success) {
        console.log(`✅ 路由组件加载成功: ${route} (${loadInfo.duration}ms)`)
      } else {
        console.log(`❌ 路由组件加载失败: ${route} (${loadInfo.duration}ms)`)
        this.failedRoutes.add(route)
      }
    }
  }

  /**
   * 生成加载报告
   * @returns {Object} 加载报告
   */
  generateReport() {
    const report = {
      总加载次数: this.loadTimes.size,
      成功加载: 0,
      失败加载: this.failedRoutes.size,
      平均加载时间: 0,
      最快加载: null,
      最慢加载: null,
      失败路由: Array.from(this.failedRoutes),
      详细信息: []
    }

    let totalDuration = 0
    let successCount = 0
    let fastest = { route: '', duration: Infinity }
    let slowest = { route: '', duration: 0 }

    for (const [route, info] of this.loadTimes) {
      if (info.success !== false) {
        successCount++
        totalDuration += info.duration
        
        if (info.duration < fastest.duration) {
          fastest = { route, duration: info.duration }
        }
        
        if (info.duration > slowest.duration) {
          slowest = { route, duration: info.duration }
        }
      }

      report.详细信息.push({
        路由: route,
        加载时间: `${info.duration}ms`,
        状态: info.success !== false ? '成功' : '失败'
      })
    }

    report.成功加载 = successCount
    report.平均加载时间 = successCount > 0 ? Math.round(totalDuration / successCount) : 0
    report.最快加载 = fastest.duration !== Infinity ? `${fastest.route} (${fastest.duration}ms)` : '无'
    report.最慢加载 = slowest.duration > 0 ? `${slowest.route} (${slowest.duration}ms)` : '无'

    return report
  }

  /**
   * 打印加载报告
   */
  printReport() {
    const report = this.generateReport()
    
    console.log('\n🎯 路由懒加载分析报告')
    console.log('=' .repeat(50))
    console.log(`📊 总加载次数: ${report.总加载次数}`)
    console.log(`✅ 成功加载: ${report.成功加载}`)
    console.log(`❌ 失败加载: ${report.失败加载}`)
    console.log(`⏱️  平均加载时间: ${report.平均加载时间}ms`)
    console.log(`🚀 最快加载: ${report.最快加载}`)
    console.log(`🐌 最慢加载: ${report.最慢加载}`)
    
    if (report.失败路由.length > 0) {
      console.log(`❌ 失败路由: ${report.失败路由.join(', ')}`)
    }
    
    console.log('\n📋 详细信息:')
    report.详细信息.forEach(item => {
      const status = item.状态 === '成功' ? '✅' : '❌'
      console.log(`  ${status} ${item.路由} - ${item.加载时间}`)
    })
    
    console.log('=' .repeat(50))
  }

  /**
   * 模拟检查网络环境对懒加载的影响
   */
  checkNetworkImpact() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    
    if (connection) {
      console.log('\n🌐 网络环境分析:')
      console.log(`  连接类型: ${connection.effectiveType}`)
      console.log(`  下行速度: ${connection.downlink}Mbps`)
      console.log(`  往返时延: ${connection.rtt}ms`)
      
      // 根据网络环境给出建议
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        console.log('  🔥 建议: 网络较慢，应优先加载核心组件')
      } else if (connection.effectiveType === '3g') {
        console.log('  💡 建议: 网络一般，可适当预加载常用组件')
      } else {
        console.log('  ⚡ 建议: 网络良好，可积极预加载组件')
      }
    }
  }
}

// 创建全局分析器实例
window.routeAnalyzer = new RouteAnalyzer()

// 导出分析器
export default window.routeAnalyzer

// 导出便捷函数
export const startRouteLoad = (route) => window.routeAnalyzer.startLoad(route)
export const endRouteLoad = (route, success) => window.routeAnalyzer.endLoad(route, success)
export const printRouteReport = () => window.routeAnalyzer.printReport()
export const checkNetwork = () => window.routeAnalyzer.checkNetworkImpact()