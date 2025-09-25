# 缓存系统性能测试和优化指南

## 性能测试方案

### 1. 基础性能指标测试

```javascript
// 在浏览器控制台中运行的性能测试脚本
function testCachePerformance() {
  const startTime = performance.now();
  
  // 测试1: 缓存命中率
  const cacheInfo = window.$nuxt ? 
    window.$nuxt.$store.getters.cacheInfo : 
    JSON.parse(localStorage.getItem('cache_metrics_history') || '[]');
  
  console.log('缓存信息:', cacheInfo);
  
  // 测试2: 内存使用情况
  if (performance.memory) {
    const memInfo = {
      used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
      total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB',
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
    };
    console.log('内存使用:', memInfo);
  }
  
  // 测试3: 页面加载时间
  const navigation = performance.getEntriesByType('navigation')[0];
  const loadTime = navigation.loadEventEnd - navigation.fetchStart;
  console.log('页面加载时间:', loadTime + 'ms');
  
  // 测试4: 路由切换性能
  const routeStartTime = performance.now();
  // 这里需要手动触发路由切换后测量
  
  const endTime = performance.now();
  console.log('性能测试完成，耗时:', (endTime - startTime) + 'ms');
}

// 自动化测试函数
function runAutomatedCacheTests() {
  const tests = [];
  
  // 测试缓存命中
  function testCacheHit() {
    return new Promise((resolve) => {
      const startTime = performance.now();
      // 访问已缓存的页面
      window.location.hash = '#/pms/product';
      setTimeout(() => {
        const endTime = performance.now();
        resolve({
          test: 'Cache Hit',
          time: endTime - startTime,
          success: true
        });
      }, 100);
    });
  }
  
  // 测试缓存未命中
  function testCacheMiss() {
    return new Promise((resolve) => {
      const startTime = performance.now();
      // 访问未缓存的页面
      window.location.hash = '#/ums/resource';
      setTimeout(() => {
        const endTime = performance.now();
        resolve({
          test: 'Cache Miss',
          time: endTime - startTime,
          success: true
        });
      }, 100);
    });
  }
  
  return Promise.all([testCacheHit(), testCacheMiss()]);
}
```

### 2. 并发访问测试

```javascript
// 模拟并发页面切换
async function concurrentPageSwitchTest(concurrency = 10) {
  const pages = [
    '#/pms/product',
    '#/oms/order', 
    '#/sms/coupon',
    '#/ums/admin',
    '#/pms/brand'
  ];
  
  const promises = [];
  
  for (let i = 0; i < concurrency; i++) {
    promises.push(new Promise((resolve) => {
      const page = pages[i % pages.length];
      const startTime = performance.now();
      
      setTimeout(() => {
        window.location.hash = page;
        setTimeout(() => {
          const endTime = performance.now();
          resolve({
            page,
            time: endTime - startTime,
            thread: i
          });
        }, 50);
      }, i * 10);
    }));
  }
  
  const results = await Promise.all(promises);
  
  console.log('并发测试结果:');
  results.forEach(result => {
    console.log(`页面 ${result.page}: ${result.time}ms`);
  });
  
  const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;
  console.log(`平均切换时间: ${avgTime}ms`);
  
  return results;
}
```

### 3. 内存泄漏检测

```javascript
// 内存泄漏检测
function memoryLeakTest() {
  const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
  let testIterations = 0;
  
  const interval = setInterval(() => {
    // 模拟页面切换
    const pages = ['#/pms/product', '#/oms/order', '#/sms/coupon'];
    window.location.hash = pages[testIterations % pages.length];
    
    testIterations++;
    
    if (testIterations >= 50) {
      clearInterval(interval);
      
      setTimeout(() => {
        // 强制垃圾回收（仅在Chrome DevTools中有效）
        if (window.gc) {
          window.gc();
        }
        
        const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        const memoryDiff = finalMemory - initialMemory;
        
        console.log('内存泄漏测试结果:');
        console.log(`初始内存: ${Math.round(initialMemory / 1024 / 1024)}MB`);
        console.log(`最终内存: ${Math.round(finalMemory / 1024 / 1024)}MB`);
        console.log(`内存差异: ${Math.round(memoryDiff / 1024 / 1024)}MB`);
        
        if (memoryDiff > 10 * 1024 * 1024) { // 超过10MB
          console.warn('⚠️ 可能存在内存泄漏');
        } else {
          console.log('✅ 内存使用正常');
        }
      }, 2000);
    }
  }, 100);
}
```

## 性能优化策略

### 1. 缓存策略优化

```javascript
// 动态调整缓存配置
function optimizeCacheConfig() {
  const deviceInfo = {
    memory: navigator.deviceMemory || 4, // GB
    cores: navigator.hardwareConcurrency || 4,
    connection: navigator.connection?.effectiveType || '4g'
  };
  
  let maxCacheSize = 10; // 默认值
  let cacheTimeout = 30 * 60 * 1000; // 30分钟
  
  // 根据设备性能调整
  if (deviceInfo.memory >= 8) {
    maxCacheSize = 15;
    cacheTimeout = 60 * 60 * 1000; // 1小时
  } else if (deviceInfo.memory <= 2) {
    maxCacheSize = 5;
    cacheTimeout = 15 * 60 * 1000; // 15分钟
  }
  
  // 根据网络状况调整
  if (deviceInfo.connection === 'slow-2g' || deviceInfo.connection === '2g') {
    maxCacheSize = Math.min(maxCacheSize + 5, 20); // 弱网环境增加缓存
    cacheTimeout = 2 * 60 * 60 * 1000; // 2小时
  }
  
  // 应用配置
  if (window.$nuxt && window.$nuxt.$store) {
    window.$nuxt.$store.dispatch('updateCacheConfig', {
      maxCacheSize,
      defaultTimeout: cacheTimeout
    });
  }
  
  console.log('优化后的缓存配置:', { maxCacheSize, cacheTimeout });
}
```

### 2. 智能预加载

```javascript
// 智能预加载策略
function implementSmartPreloading() {
  const frequentRoutes = JSON.parse(localStorage.getItem('frequent_routes') || '{}');
  const currentHour = new Date().getHours();
  
  // 根据时间和历史记录预测用户可能访问的页面
  function predictNextPages() {
    const predictions = [];
    
    // 工作时间更可能访问业务相关页面
    if (currentHour >= 9 && currentHour <= 18) {
      predictions.push('/pms/product', '/oms/order');
    }
    
    // 根据历史访问频率
    Object.entries(frequentRoutes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .forEach(([route]) => {
        if (!predictions.includes(route)) {
          predictions.push(route);
        }
      });
    
    return predictions;
  }
  
  // 预加载组件
  function preloadComponents(routes) {
    routes.forEach(route => {
      // 使用动态import预加载组件
      import(`@/views${route}/index.vue`).catch(() => {
        // 忽略加载失败的情况
      });
    });
  }
  
  const predictedPages = predictNextPages();
  preloadComponents(predictedPages);
  
  console.log('预加载页面:', predictedPages);
}
```

### 3. 缓存清理优化

```javascript
// 优化的LRU清理算法
function optimizedLRUCleanup(cacheList, maxSize) {
  if (cacheList.length <= maxSize) return cacheList;
  
  // 计算每个缓存项的得分
  const scored = cacheList.map(item => {
    const now = Date.now();
    const age = now - item.timestamp;
    const frequency = item.accessCount || 1;
    const recency = now - (item.lastAccess || item.timestamp);
    
    // 综合考虑频率、最近访问时间和缓存年龄
    const score = (frequency * 1000) - (recency / 1000) - (age / 10000);
    
    return { ...item, score };
  });
  
  // 按得分排序，保留得分高的
  scored.sort((a, b) => b.score - a.score);
  
  return scored.slice(0, maxSize);
}
```

## 性能监控和告警

### 1. 实时性能监控

```javascript
// 性能监控类
class CachePerformanceMonitor {
  constructor() {
    this.metrics = {
      hitRate: 0,
      avgLoadTime: 0,
      memoryUsage: 0,
      errorCount: 0
    };
    
    this.thresholds = {
      hitRate: 0.7, // 70%以上
      avgLoadTime: 200, // 200ms以下
      memoryUsage: 0.8, // 80%以下
      errorRate: 0.05 // 5%以下
    };
  }
  
  startMonitoring() {
    setInterval(() => {
      this.collectMetrics();
      this.checkThresholds();
    }, 30000); // 每30秒检查一次
  }
  
  collectMetrics() {
    // 收集命中率
    const cacheMetrics = JSON.parse(localStorage.getItem('cache_metrics_history') || '[]');
    if (cacheMetrics.length > 0) {
      const latest = cacheMetrics[cacheMetrics.length - 1];
      this.metrics.hitRate = latest.hitRate || 0;
    }
    
    // 收集内存使用率
    if (performance.memory) {
      this.metrics.memoryUsage = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
    }
    
    // 收集平均加载时间
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries.length > 0) {
      this.metrics.avgLoadTime = navEntries[0].loadEventEnd - navEntries[0].fetchStart;
    }
  }
  
  checkThresholds() {
    const alerts = [];
    
    if (this.metrics.hitRate < this.thresholds.hitRate) {
      alerts.push(`缓存命中率过低: ${Math.round(this.metrics.hitRate * 100)}%`);
    }
    
    if (this.metrics.avgLoadTime > this.thresholds.avgLoadTime) {
      alerts.push(`页面加载时间过长: ${this.metrics.avgLoadTime}ms`);
    }
    
    if (this.metrics.memoryUsage > this.thresholds.memoryUsage) {
      alerts.push(`内存使用率过高: ${Math.round(this.metrics.memoryUsage * 100)}%`);
    }
    
    if (alerts.length > 0) {
      console.warn('🚨 性能告警:', alerts);
      this.handleAlerts(alerts);
    }
  }
  
  handleAlerts(alerts) {
    // 自动优化措施
    if (alerts.some(alert => alert.includes('内存使用率'))) {
      // 触发紧急清理
      if (window.cacheControlService) {
        window.cacheControlService.performEmergencyCleanup();
      }
    }
    
    if (alerts.some(alert => alert.includes('命中率'))) {
      // 调整缓存策略
      optimizeCacheConfig();
    }
  }
}

// 启动性能监控
const performanceMonitor = new CachePerformanceMonitor();
performanceMonitor.startMonitoring();
```

### 2. 用户体验优化

```javascript
// UX优化建议
const UX_OPTIMIZATIONS = {
  // 加载状态优化
  showLoadingStates: true,
  
  // 骨架屏配置
  skeletonScreens: {
    productList: true,
    orderList: true,
    userList: true
  },
  
  // 预加载提示
  showCacheStatus: true,
  
  // 错误处理
  fallbackStrategies: {
    cacheFailure: 'reload',
    networkError: 'showCached',
    memoryError: 'cleanup'
  }
};
```

## 部署和生产环境配置

### 1. 生产环境优化配置

```javascript
// 生产环境缓存配置
const PRODUCTION_CACHE_CONFIG = {
  maxCacheSize: 12,
  defaultTimeout: 45 * 60 * 1000, // 45分钟
  enableLRU: true,
  enableTimeout: true,
  cleanupInterval: 10 * 60 * 1000, // 10分钟清理一次
  monitorInterval: 2 * 60 * 1000, // 2分钟监控一次
  
  // 页面级别配置
  pageConfigs: {
    'product': { timeout: 30 * 60 * 1000, priority: 'high' },
    'order': { timeout: 15 * 60 * 1000, priority: 'high', refreshOnActivated: true },
    'coupon': { timeout: 60 * 60 * 1000, priority: 'medium' },
    'admin': { timeout: 30 * 60 * 1000, priority: 'medium' },
    'role': { timeout: 2 * 60 * 60 * 1000, priority: 'low' }
  }
};
```

### 2. 监控和告警配置

```javascript
// 生产环境监控配置
const MONITORING_CONFIG = {
  // 性能阈值
  thresholds: {
    hitRate: 0.75,
    avgLoadTime: 150,
    memoryUsage: 0.75,
    errorRate: 0.03
  },
  
  // 告警方式
  alertMethods: ['console', 'localStorage', 'api'],
  
  // 自动优化
  autoOptimization: {
    enabled: true,
    aggressiveCleanup: true,
    dynamicConfig: true
  }
};
```

## 测试检查清单

- [ ] 缓存命中率 > 70%
- [ ] 页面切换时间 < 200ms
- [ ] 内存使用率 < 80%
- [ ] 无内存泄漏
- [ ] 缓存清理机制正常
- [ ] 错误处理完善
- [ ] 性能监控正常
- [ ] 用户界面响应流畅
- [ ] 并发访问稳定
- [ ] 移动端兼容性良好