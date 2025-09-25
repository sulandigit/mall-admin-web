/**
 * 缓存组件混入
 * 为需要缓存的页面组件提供统一的生命周期钩子处理
 */

export default {
  name: 'CacheViewMixin',
  
  data() {
    return {
      // 缓存状态
      cacheStatus: {
        isFromCache: false, // 是否从缓存激活
        lastActivatedTime: null, // 最后激活时间
        cacheCreatedTime: null // 缓存创建时间
      }
    }
  },

  created() {
    this.cacheStatus.cacheCreatedTime = Date.now()
    this.handleCacheCreated()
  },

  activated() {
    this.cacheStatus.isFromCache = true
    this.cacheStatus.lastActivatedTime = Date.now()
    this.handleCacheActivated()
  },

  deactivated() {
    this.handleCacheDeactivated()
  },

  beforeDestroy() {
    this.handleCacheDestroy()
  },

  methods: {
    /**
     * 缓存组件创建时的处理
     * 子组件可以重写此方法进行自定义处理
     */
    handleCacheCreated() {
      // 初始化数据加载
      if (typeof this.initData === 'function') {
        this.initData()
      }
    },

    /**
     * 缓存组件激活时的处理
     * 子组件可以重写此方法进行自定义处理
     */
    handleCacheActivated() {
      // 检查是否需要刷新数据
      if (this.shouldRefreshOnActivated()) {
        this.refreshData()
      }

      // 恢复页面状态
      this.restorePageState()

      // 更新访问统计
      this.updateAccessStats()
    },

    /**
     * 缓存组件失活时的处理
     * 子组件可以重写此方法进行自定义处理
     */
    handleCacheDeactivated() {
      // 保存页面状态
      this.savePageState()

      // 清理临时数据
      this.cleanupTempData()
    },

    /**
     * 缓存组件销毁前的处理
     * 子组件可以重写此方法进行自定义处理
     */
    handleCacheDestroy() {
      // 清理资源
      this.cleanup()
    },

    /**
     * 判断激活时是否需要刷新数据
     */
    shouldRefreshOnActivated() {
      // 检查路由meta配置
      if (this.$route.meta && this.$route.meta.refreshOnActivated === true) {
        return true
      }

      // 检查数据时效性
      const cacheTimeout = this.getCacheTimeout()
      if (cacheTimeout > 0) {
        const now = Date.now()
        const cacheAge = now - (this.cacheStatus.cacheCreatedTime || now)
        return cacheAge > cacheTimeout
      }

      return false
    },

    /**
     * 获取缓存超时时间
     */
    getCacheTimeout() {
      // 优先使用路由配置
      if (this.$route.meta && this.$route.meta.cacheTimeout) {
        return this.$route.meta.cacheTimeout
      }

      // 使用全局配置
      const globalConfig = this.$store.state.cache?.cacheConfig
      return globalConfig?.defaultTimeout || 30 * 60 * 1000
    },

    /**
     * 刷新数据
     * 子组件应该重写此方法实现具体的数据刷新逻辑
     */
    refreshData() {
      // 默认实现：重新调用获取数据的方法
      if (typeof this.getList === 'function') {
        this.getList()
      } else if (typeof this.fetchData === 'function') {
        this.fetchData()
      } else if (typeof this.loadData === 'function') {
        this.loadData()
      }
    },

    /**
     * 保存页面状态
     * 保存滚动位置、搜索条件、分页信息等
     */
    savePageState() {
      const state = {
        scrollTop: 0,
        searchForm: null,
        pagination: null,
        selectedItems: null
      }

      // 保存滚动位置
      const scrollElement = this.getScrollElement()
      if (scrollElement) {
        state.scrollTop = scrollElement.scrollTop
      }

      // 保存搜索表单数据
      if (this.searchForm || this.listQuery) {
        state.searchForm = { ...(this.searchForm || this.listQuery) }
      }

      // 保存分页信息
      if (this.pagination) {
        state.pagination = { ...this.pagination }
      }

      // 保存选中项
      if (this.multipleSelection && this.multipleSelection.length > 0) {
        state.selectedItems = [...this.multipleSelection]
      }

      // 将状态保存到sessionStorage
      const stateKey = `cache_state_${this.$route.name}`
      try {
        sessionStorage.setItem(stateKey, JSON.stringify(state))
      } catch (error) {
        console.warn('Failed to save page state:', error)
      }
    },

    /**
     * 恢复页面状态
     */
    restorePageState() {
      const stateKey = `cache_state_${this.$route.name}`
      
      try {
        const stateStr = sessionStorage.getItem(stateKey)
        if (!stateStr) return

        const state = JSON.parse(stateStr)

        // 恢复滚动位置
        if (state.scrollTop > 0) {
          this.$nextTick(() => {
            const scrollElement = this.getScrollElement()
            if (scrollElement) {
              scrollElement.scrollTop = state.scrollTop
            }
          })
        }

        // 恢复搜索表单数据
        if (state.searchForm) {
          if (this.searchForm) {
            Object.assign(this.searchForm, state.searchForm)
          } else if (this.listQuery) {
            Object.assign(this.listQuery, state.searchForm)
          }
        }

        // 恢复分页信息
        if (state.pagination && this.pagination) {
          Object.assign(this.pagination, state.pagination)
        }

        // 恢复选中项
        if (state.selectedItems && this.multipleSelection) {
          this.multipleSelection = state.selectedItems
        }

      } catch (error) {
        console.warn('Failed to restore page state:', error)
      }
    },

    /**
     * 获取滚动元素
     */
    getScrollElement() {
      return document.querySelector('.app-main') || 
             document.querySelector('.el-table__body-wrapper') ||
             window
    },

    /**
     * 清理临时数据
     */
    cleanupTempData() {
      // 清理定时器
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }

      if (this.interval) {
        clearInterval(this.interval)
        this.interval = null
      }

      // 清理事件监听器
      this.removeEventListeners()
    },

    /**
     * 移除事件监听器
     * 子组件可以重写此方法移除自定义事件监听器
     */
    removeEventListeners() {
      // 子组件实现具体的事件监听器清理逻辑
    },

    /**
     * 更新访问统计
     */
    updateAccessStats() {
      const routeName = this.$route.name
      if (routeName) {
        // 更新缓存访问统计
        this.$store.dispatch('addCachedView', {
          name: routeName,
          fullPath: this.$route.fullPath,
          meta: this.$route.meta
        })
      }
    },

    /**
     * 清理资源
     * 子组件可以重写此方法进行自定义资源清理
     */
    cleanup() {
      // 清理sessionStorage中的状态数据
      const stateKey = `cache_state_${this.$route.name}`
      try {
        sessionStorage.removeItem(stateKey)
      } catch (error) {
        console.warn('Failed to clean up page state:', error)
      }

      // 清理临时数据
      this.cleanupTempData()
    },

    /**
     * 获取缓存信息
     */
    getCacheInfo() {
      return {
        ...this.cacheStatus,
        routeName: this.$route.name,
        cacheTimeout: this.getCacheTimeout(),
        isCached: this.$store.getters.isCached(this.$route.name)
      }
    },

    /**
     * 手动清理当前页面缓存
     */
    clearCurrentCache() {
      if (this.$route.name) {
        this.$store.dispatch('delCachedView', this.$route.name)
      }
    },

    /**
     * 手动刷新当前页面缓存
     */
    refreshCurrentCache() {
      if (this.$route.name) {
        this.$store.dispatch('refreshCache', this.$route.name).then(() => {
          // 重新加载数据
          this.refreshData()
        })
      }
    }
  },

  computed: {
    /**
     * 是否被缓存
     */
    isCached() {
      return this.$store.getters.isCached(this.$route.name)
    },

    /**
     * 缓存年龄（毫秒）
     */
    cacheAge() {
      if (!this.cacheStatus.cacheCreatedTime) return 0
      return Date.now() - this.cacheStatus.cacheCreatedTime
    },

    /**
     * 缓存是否过期
     */
    isCacheExpired() {
      const timeout = this.getCacheTimeout()
      return timeout > 0 && this.cacheAge > timeout
    }
  }
}