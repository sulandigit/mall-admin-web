import store from '@/store'
import { getDeviceInfo, createResponsiveListener } from '@/utils/device'

export default {
  data() {
    return {
      responsiveCleanup: null
    }
  },
  watch: {
    $route(route) {
      // 移动设备和平板设备在路由变化时关闭侧边栏
      if (this.isMobileOrTablet && this.sidebar.opened) {
        store.dispatch('CloseSideBar', { withoutAnimation: false })
      }
    }
  },
  computed: {
    device() {
      return this.$store.state.app.device
    },
    sidebar() {
      return this.$store.state.app.sidebar
    },
    isMobileOrTablet() {
      return this.device === 'mobile' || this.device === 'tablet'
    }
  },
  beforeMount() {
    // 使用防抖的resize监听器
    this.debouncedResizeHandler = this.debounce(this.resizeHandler, 100)
    window.addEventListener('resize', this.debouncedResizeHandler)
    
    // 创建响应式监听器
    this.responsiveCleanup = createResponsiveListener({
      'mobile': () => this.handleDeviceChange('mobile'),
      'tablet': () => this.handleDeviceChange('tablet'),
      'desktop': () => this.handleDeviceChange('desktop'),
      'desktop-large': () => this.handleDeviceChange('desktop-large')
    })
  },
  mounted() {
    // 初始化设备信息
    this.initializeDeviceInfo()
  },
  beforeDestroy() {
    // 清理监听器
    if (this.debouncedResizeHandler) {
      window.removeEventListener('resize', this.debouncedResizeHandler)
    }
    if (this.responsiveCleanup) {
      this.responsiveCleanup()
    }
  },
  methods: {
    /**
     * 初始化设备信息
     */
    initializeDeviceInfo() {
      const deviceInfo = getDeviceInfo()
      
      // 更新设备类型
      store.dispatch('UpdateDevice', deviceInfo.type)
      
      // 更新视窗信息
      store.dispatch('UpdateViewport', {
        width: deviceInfo.viewport.width,
        height: deviceInfo.viewport.height,
        orientation: deviceInfo.orientation
      })
      
      // 更新交互状态
      store.dispatch('UpdateInteraction', {
        touchSupported: deviceInfo.touchSupported,
        currentBreakpoint: deviceInfo.breakpoint
      })
      
      // 移动设备和平板初始状态下关闭侧边栏
      if (deviceInfo.isMobile || deviceInfo.isTablet) {
        store.dispatch('CloseSideBar', { withoutAnimation: true })
      }
    },
    
    /**
     * 处理设备类型变化
     */
    handleDeviceChange(deviceType) {
      const currentDevice = this.$store.state.app.device
      
      if (currentDevice !== deviceType) {
        store.dispatch('UpdateDevice', deviceType)
        
        // 移动设备和平板自动关闭侧边栏
        if (deviceType === 'mobile' || deviceType === 'tablet') {
          store.dispatch('CloseSideBar', { withoutAnimation: true })
        }
        
        // 触发设备变化事件
        this.$emit('device-change', deviceType)
      }
    },
    
    /**
     * 窗口大小变化处理器
     */
    resizeHandler() {
      if (!document.hidden) {
        const deviceInfo = getDeviceInfo()
        
        // 更新视窗信息
        store.dispatch('UpdateViewport', {
          width: deviceInfo.viewport.width,
          height: deviceInfo.viewport.height,
          orientation: deviceInfo.orientation
        })
        
        // 更新断点信息
        store.dispatch('UpdateInteraction', {
          currentBreakpoint: deviceInfo.breakpoint
        })
      }
    },
    
    /**
     * 防抖函数
     */
    debounce(func, wait) {
      let timeout
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout)
          func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
      }
    }
  }
}
