/**
 * 路由懒加载工具类
 * 提供统一的路由懒加载、预加载和错误处理功能
 */

class RouteHelper {
  constructor() {
    this.loadingComponents = new Map() // 正在加载的组件缓存
    this.failedComponents = new Set() // 加载失败的组件记录
    this.retryCount = 3 // 重试次数
    this.retryDelay = 1000 // 重试延迟（毫秒）
  }

  /**
   * 创建懒加载函数
   * @param {string} path 组件路径
   * @param {Object} options 配置选项
   * @returns {Function} 懒加载函数
   */
  createLazyLoader(path, options = {}) {
    const {
      loading = null, // 加载中的组件
      error = null, // 错误组件
      delay = 200, // 延迟时间
      timeout = 10000 // 超时时间
    } = options

    return () => {
      // 检查是否已在加载中
      if (this.loadingComponents.has(path)) {
        return this.loadingComponents.get(path)
      }

      // 创建加载Promise
      const loadPromise = this.loadComponent(path)
        .finally(() => {
          // 清理缓存
          this.loadingComponents.delete(path)
        })

      // 缓存正在加载的组件
      this.loadingComponents.set(path, loadPromise)

      return loadPromise
    }
  }

  /**
   * 加载组件
   * @param {string} path 组件路径
   * @returns {Promise} 加载Promise
   */
  async loadComponent(path) {
    let lastError = null
    
    for (let i = 0; i < this.retryCount; i++) {
      try {
        console.log(`尝试加载路由组件: ${path} (第${i + 1}次)`)
        
        const module = await import(`@/views/${path}`)
        console.log(`路由组件加载成功: ${path}`)
        
        // 从失败记录中移除
        this.failedComponents.delete(path)
        
        return module
      } catch (error) {
        lastError = error
        console.warn(`路由组件加载失败: ${path} (第${i + 1}次)`, error)
        
        // 如果不是最后一次尝试，等待后重试
        if (i < this.retryCount - 1) {
          await this.delay(this.retryDelay * (i + 1)) // 递增延迟
        }
      }
    }

    // 所有重试都失败了
    console.error(`路由组件加载最终失败: ${path}`, lastError)
    this.failedComponents.add(path)
    
    // 返回错误组件
    return this.loadErrorComponent()
  }

  /**
   * 加载错误组件
   * @returns {Promise} 错误组件Promise
   */
  async loadErrorComponent() {
    try {
      return await import('@/views/error/RouteError')
    } catch (error) {
      console.error('错误组件加载失败，使用默认错误组件', error)
      // 返回默认错误组件
      return {
        default: {
          name: 'DefaultRouteError',
          template: `
            <div style="text-align: center; padding: 50px; color: #f56c6c;">
              <h2>页面加载失败</h2>
              <p>很抱歉，页面无法正常加载。请刷新页面重试。</p>
              <button onclick="window.location.reload()" style="
                padding: 8px 16px;
                background: #409EFF;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
              ">刷新页面</button>
            </div>
          `
        }
      }
    }
  }

  /**
   * 预加载路由组件
   * @param {Array} routes 路由路径数组
   * @param {Object} options 配置选项
   */
  preloadRoutes(routes = [], options = {}) {
    const {
      priority = 'low', // 优先级: 'high', 'normal', 'low'
      delay = 2000 // 延迟时间
    } = options

    const preloadFn = () => {
      routes.forEach((route, index) => {
        // 跳过已失败的组件
        if (this.failedComponents.has(route)) {
          return
        }

        // 错开预加载时间，避免同时加载过多资源
        setTimeout(() => {
          import(`@/views/${route}`)
            .then(() => {
              console.log(`预加载成功: ${route}`)
            })
            .catch(error => {
              console.warn(`预加载失败: ${route}`, error)
              this.failedComponents.add(route)
            })
        }, index * 200) // 每个组件间隔200ms
      })
    }

    // 根据优先级选择预加载策略
    switch (priority) {
      case 'high':
        // 高优先级，立即执行
        preloadFn()
        break
      case 'normal':
        // 普通优先级，使用 requestIdleCallback
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(preloadFn)
        } else {
          setTimeout(preloadFn, delay / 2)
        }
        break
      case 'low':
      default:
        // 低优先级，延迟执行
        if ('requestIdleCallback' in window) {
          setTimeout(() => {
            window.requestIdleCallback(preloadFn)
          }, delay)
        } else {
          setTimeout(preloadFn, delay)
        }
        break
    }
  }

  /**
   * 获取加载统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      loading: this.loadingComponents.size,
      failed: this.failedComponents.size,
      failedPaths: Array.from(this.failedComponents)
    }
  }

  /**
   * 清理失败记录
   */
  clearFailedComponents() {
    this.failedComponents.clear()
  }

  /**
   * 延迟函数
   * @param {number} ms 延迟毫秒数
   * @returns {Promise} 延迟Promise
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// 创建单例实例
const routeHelper = new RouteHelper()

export default routeHelper

// 导出便捷函数
export const lazyLoad = (path, options) => routeHelper.createLazyLoader(path, options)
export const preloadRoutes = (routes, options) => routeHelper.preloadRoutes(routes, options)
export const getRouteStats = () => routeHelper.getStats()
export const clearFailedRoutes = () => routeHelper.clearFailedComponents()