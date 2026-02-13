/**
 * 移动端优化Vue插件
 * 自动注册移动端优化功能
 */

import { lazyLoad, debounce, throttle } from '@/utils/performance'
import { isMobileDevice } from '@/utils/device'

// 移动端优化混入
const mobileOptimizeMixin = {
  data() {
    return {
      isDestroyed: false
    }
  },
  
  beforeDestroy() {
    this.isDestroyed = true
    
    // 清理定时器
    if (this._timers) {
      this._timers.forEach(timer => clearTimeout(timer))
      this._timers = null
    }
    
    // 清理观察者
    if (this._observers) {
      this._observers.forEach(observer => {
        if (observer && typeof observer.disconnect === 'function') {
          observer.disconnect()
        }
      })
      this._observers = null
    }
  },
  
  methods: {
    /**
     * 安全的setTimeout
     */
    $safeTimeout(callback, delay) {
      if (!this._timers) {
        this._timers = []
      }
      
      const timer = setTimeout(() => {
        if (!this.isDestroyed) {
          callback()
        }
        const index = this._timers.indexOf(timer)
        if (index > -1) {
          this._timers.splice(index, 1)
        }
      }, delay)
      
      this._timers.push(timer)
      return timer
    },
    
    /**
     * 添加观察者
     */
    $addObserver(observer) {
      if (!this._observers) {
        this._observers = []
      }
      this._observers.push(observer)
    },
    
    /**
     * 防抖方法
     */
    $debounce(func, wait, immediate) {
      return debounce(func, wait, immediate)
    },
    
    /**
     * 节流方法
     */
    $throttle(func, limit) {
      return throttle(func, limit)
    }
  }
}

// 移动端图片优化指令
const optimizeImage = {
  bind(el, binding) {
    if (!isMobileDevice()) return
    
    const { value, modifiers } = binding
    const options = typeof value === 'object' ? value : { src: value }
    
    // 设置图片压缩参数
    if (modifiers.compress) {
      el.style.imageRendering = 'optimizeQuality'
      
      // 根据设备像素比调整图片尺寸
      const dpr = window.devicePixelRatio || 1
      if (dpr > 1 && options.src) {
        // 为高分辨率屏幕提供更大的图片
        const url = new URL(options.src)
        url.searchParams.set('dpr', Math.min(dpr, 2))
        url.searchParams.set('q', '80') // 压缩质量
        el.src = url.toString()
      }
    }
    
    // 设置加载占位符
    if (modifiers.placeholder) {
      el.style.backgroundColor = '#f5f5f5'
      el.style.backgroundImage = 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDFMMTMuMDkgNi4yNkwyMCA3TDE0IDEzTDE2IDE5TDEwIDE2TDQgMTlMNiAxM0wwIDdMNi45MSA2LjI2TDEwIDFaIiBmaWxsPSIjQ0NDIi8+Cjwvc3ZnPgo=")'
      el.style.backgroundRepeat = 'no-repeat'
      el.style.backgroundPosition = 'center'
      el.style.backgroundSize = '40px 40px'
    }
  }
}

// 移动端滚动优化指令
const optimizeScroll = {
  bind(el, binding) {
    if (!isMobileDevice()) return
    
    const { modifiers } = binding
    
    // 启用硬件加速
    el.style.transform = 'translateZ(0)'
    el.style.willChange = 'scroll-position'
    
    // 平滑滚动
    if (modifiers.smooth) {
      el.style.scrollBehavior = 'smooth'
      el.style.webkitOverflowScrolling = 'touch'
    }
    
    // 隐藏滚动条
    if (modifiers.hideScrollbar) {
      el.style.scrollbarWidth = 'none'
      el.style.msOverflowStyle = 'none'
      const style = document.createElement('style')
      style.textContent = `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `
      document.head.appendChild(style)
      el.classList.add('hide-scrollbar')
    }
  }
}

// 移动端触摸优化指令
const optimizeTouch = {
  bind(el, binding) {
    if (!isMobileDevice()) return
    
    const { modifiers } = binding
    
    // 禁用点击延迟
    el.style.touchAction = 'manipulation'
    
    // 禁用选择
    if (modifiers.noSelect) {
      el.style.webkitUserSelect = 'none'
      el.style.userSelect = 'none'
    }
    
    // 禁用长按菜单
    if (modifiers.noCallout) {
      el.style.webkitTouchCallout = 'none'
    }
    
    // 添加触摸反馈
    if (modifiers.feedback) {
      el.style.position = 'relative'
      
      const addFeedback = (e) => {
        const ripple = document.createElement('div')
        ripple.style.position = 'absolute'
        ripple.style.borderRadius = '50%'
        ripple.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'
        ripple.style.transform = 'scale(0)'
        ripple.style.animation = 'ripple 0.6s linear'
        ripple.style.pointerEvents = 'none'
        
        const rect = el.getBoundingClientRect()
        const size = Math.max(rect.width, rect.height)
        ripple.style.width = ripple.style.height = size + 'px'
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px'
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px'
        
        el.appendChild(ripple)
        
        setTimeout(() => {
          if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple)
          }
        }, 600)
      }
      
      el.addEventListener('touchstart', addFeedback)
      
      // 添加CSS动画
      if (!document.querySelector('#ripple-animation')) {
        const style = document.createElement('style')
        style.id = 'ripple-animation'
        style.textContent = `
          @keyframes ripple {
            to {
              transform: scale(2);
              opacity: 0;
            }
          }
        `
        document.head.appendChild(style)
      }
    }
  }
}

// Vue插件
const MobileOptimizePlugin = {
  install(Vue, options = {}) {
    // 注册全局混入
    Vue.mixin(mobileOptimizeMixin)
    
    // 注册指令
    Vue.directive('lazy', lazyLoad)
    Vue.directive('optimize-image', optimizeImage)
    Vue.directive('optimize-scroll', optimizeScroll)
    Vue.directive('optimize-touch', optimizeTouch)
    
    // 添加全局属性
    Vue.prototype.$isMobile = isMobileDevice()
    
    // 全局错误处理
    Vue.config.errorHandler = (err, vm, info) => {
      console.error('Vue Error:', err)
      console.error('Component:', vm)
      console.error('Info:', info)
      
      // 在移动端显示用户友好的错误信息
      if (isMobileDevice() && options.showMobileErrors) {
        // 可以集成到UI组件中显示错误
        Vue.prototype.$message && Vue.prototype.$message.error('操作失败，请重试')
      }
    }
    
    // 性能优化
    if (isMobileDevice()) {
      // 减少Vue的响应式深度
      Vue.config.optionMergeStrategies.computed = function (parent, child) {
        if (!child) return parent
        if (!parent) return child
        const ret = Object.create(null)
        Object.assign(ret, parent)
        Object.assign(ret, child)
        return ret
      }
      
      // 优化渲染性能
      Vue.config.performance = process.env.NODE_ENV !== 'production'
    }
    
    // 内存泄漏检测（开发环境）
    if (process.env.NODE_ENV === 'development' && options.memoryLeakDetection) {
      let componentCount = 0
      
      Vue.mixin({
        beforeCreate() {
          componentCount++
        },
        beforeDestroy() {
          componentCount--
          
          // 警告组件数量过多
          if (componentCount > 1000) {
            console.warn(`组件数量过多: ${componentCount}，可能存在内存泄漏`)
          }
        }
      })
    }
  }
}

export default MobileOptimizePlugin