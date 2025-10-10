// 性能监控配置
export const performanceConfig = {
  // 首屏加载监控
  fcp: {
    threshold: 2000, // 2秒内
    report: true
  },
  
  // 最大内容绘制监控  
  lcp: {
    threshold: 2500, // 2.5秒内
    report: true
  },
  
  // 首次输入延迟监控
  fid: {
    threshold: 100, // 100ms内
    report: true
  },
  
  // 累积布局偏移监控
  cls: {
    threshold: 0.1, // 小于0.1
    report: true
  }
}

// 性能监控函数
export function initPerformanceMonitor() {
  // 监控页面加载性能
  window.addEventListener('load', () => {
    // 获取性能数据
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    // 关键性能指标
    const metrics = {
      // DNS查询时间
      dns: perfData.domainLookupEnd - perfData.domainLookupStart,
      // TCP连接时间
      tcp: perfData.connectEnd - perfData.connectStart,
      // 请求时间
      request: perfData.responseStart - perfData.requestStart,
      // 响应时间
      response: perfData.responseEnd - perfData.responseStart,
      // DOM解析时间
      domParse: perfData.domInteractive - perfData.responseEnd,
      // 资源加载时间
      resourceLoad: perfData.loadEventStart - perfData.domContentLoadedEventEnd,
      // 总加载时间
      total: perfData.loadEventEnd - perfData.navigationStart
    }
    
    console.log('Performance Metrics:', metrics)
    
    // 如果需要上报到监控系统
    if (process.env.NODE_ENV === 'production') {
      // sendMetricsToMonitor(metrics)
    }
  })
}

// 懒加载图片配置
export const lazyLoadConfig = {
  rootMargin: '50px',
  threshold: 0.1
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  return function (...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func.apply(this, args)
    }
  }
}