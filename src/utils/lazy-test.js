/**
 * 图片懒加载指令测试
 * 
 * 这个文件展示了如何在Vue组件中使用懒加载指令
 */

// 示例Vue组件，展示懒加载的使用
const LazyImageExample = {
  template: `
    <div class="lazy-image-example">
      <h3>图片懒加载示例</h3>
      
      <!-- 基本用法 -->
      <div class="image-container">
        <h4>基本用法</h4>
        <img v-lazy="basicImageUrl" alt="基本示例" class="example-image">
      </div>
      
      <!-- 带配置的用法 -->
      <div class="image-container">
        <h4>带配置的用法</h4>
        <img v-lazy="advancedConfig" alt="高级示例" class="example-image">
      </div>
      
      <!-- 商品列表模拟 -->
      <div class="product-list">
        <h4>商品列表模拟</h4>
        <div class="product-grid">
          <div v-for="product in products" :key="product.id" class="product-item">
            <img 
              v-lazy="product.image" 
              :alt="product.name"
              class="product-image-lazy">
            <p>{{ product.name }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  
  data() {
    return {
      basicImageUrl: 'https://example.com/image1.jpg',
      
      advancedConfig: {
        src: 'https://example.com/image2.jpg',
        placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciPjxzdG9wIHN0b3AtY29sb3I9IiNmNWY1ZjUiIG9mZnNldD0iMjAlIi8+PHN0b3Agc3RvcC1jb2xvcj0iI2VlZSIgb2Zmc2V0PSI1MCUiLz48c3RvcCBzdG9wLWNvbG9yPSIjZjVmNWY1IiBvZmZzZXQ9IjcwJSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZHk9Ii4zZW0iIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSIjYWFhIj5Loading...</dGV4dD48L3N2Zz4=',
        onLoad: () => console.log('图片加载成功'),
        onError: () => console.log('图片加载失败')
      },
      
      products: [
        { id: 1, name: '商品1', image: 'https://example.com/product1.jpg' },
        { id: 2, name: '商品2', image: 'https://example.com/product2.jpg' },
        { id: 3, name: '商品3', image: 'https://example.com/product3.jpg' },
        { id: 4, name: '商品4', image: 'https://example.com/product4.jpg' },
        { id: 5, name: '商品5', image: 'https://example.com/product5.jpg' },
        { id: 6, name: '商品6', image: 'https://example.com/product6.jpg' }
      ]
    }
  }
}

// 测试懒加载指令的工具函数
const LazyLoadTester = {
  // 检测浏览器是否支持Intersection Observer
  checkIntersectionObserverSupport() {
    return 'IntersectionObserver' in window;
  },
  
  // 模拟滚动触发懒加载
  simulateScroll() {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  },
  
  // 检查图片是否使用了懒加载
  checkLazyImages() {
    const lazyImages = document.querySelectorAll('.lazy-image');
    const stats = {
      total: lazyImages.length,
      loading: document.querySelectorAll('.lazy-loading').length,
      loaded: document.querySelectorAll('.lazy-loaded').length,
      error: document.querySelectorAll('.lazy-error').length
    };
    
    console.log('懒加载图片统计:', stats);
    return stats;
  },
  
  // 性能测试
  performanceTest() {
    const startTime = performance.now();
    
    // 统计网络请求
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.initiatorType === 'img') {
          console.log(`图片加载: ${entry.name} - ${entry.duration.toFixed(2)}ms`);
        }
      }
    });
    
    observer.observe({ entryTypes: ['resource'] });
    
    // 5秒后停止观察
    setTimeout(() => {
      observer.disconnect();
      const endTime = performance.now();
      console.log(`总测试时间: ${(endTime - startTime).toFixed(2)}ms`);
    }, 5000);
  }
};

// 导出测试工具
export { LazyImageExample, LazyLoadTester };