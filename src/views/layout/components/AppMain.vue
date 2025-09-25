<template>
  <section class="app-main">
    <transition name="fade" mode="out-in">
      <keep-alive :include="cachedViews">
        <router-view :key="key"></router-view>
      </keep-alive>
    </transition>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'AppMain',
  computed: {
    ...mapGetters([
      'cachedViews'
    ]),
    key() {
      // 为缓存组件生成唯一key，防止组件复用导致的问题
      return this.$route.fullPath
    }
  },
  watch: {
    // 监听路由变化，管理组件缓存
    $route: {
      handler(to, from) {
        this.handleRouteCache(to, from)
      },
      immediate: true
    }
  },
  methods: {
    /**
     * 处理路由缓存逻辑
     */
    handleRouteCache(to, from) {
      // 检查当前路由是否需要缓存
      if (this.shouldCache(to)) {
        this.$store.dispatch('addCachedView', {
          name: to.name,
          fullPath: to.fullPath,
          meta: to.meta
        })
      }

      // 检查离开的路由是否需要清理缓存
      if (from && from.name && this.shouldClearCache(from, to)) {
        this.$store.dispatch('delCachedView', from.name)
      }

      // 定期清理过期缓存
      this.clearExpiredCache()
    },

    /**
     * 判断路由是否应该被缓存
     */
    shouldCache(route) {
      if (!route.name || !route.meta) return false
      
      // 检查路由meta中的keepAlive配置
      if (route.meta.keepAlive === false) return false
      if (route.meta.keepAlive === true) return true
      
      // 默认缓存列表页面，不缓存添加/编辑页面
      const noCachePatterns = ['add', 'edit', 'update', 'detail']
      const routeName = route.name.toLowerCase()
      
      return !noCachePatterns.some(pattern => routeName.includes(pattern))
    },

    /**
     * 判断是否应该清理缓存
     */
    shouldClearCache(from, to) {
      // 如果路由meta中设置了clearCache
      if (from.meta && from.meta.clearCache) return true
      
      // 如果是编辑页面跳转到列表页面，清理列表页面缓存以刷新数据
      if (to && to.name) {
        const fromName = from.name.toLowerCase()
        const toName = to.name.toLowerCase()
        
        // 从编辑页面返回列表页面时，清理列表页面缓存
        if ((fromName.includes('add') || fromName.includes('edit') || fromName.includes('update')) &&
            !toName.includes('add') && !toName.includes('edit') && !toName.includes('update')) {
          // 清理目标页面的缓存，确保显示最新数据
          this.$store.dispatch('delCachedView', to.name)
        }
      }
      
      return false
    },

    /**
     * 清理过期缓存
     */
    clearExpiredCache() {
      // 使用防抖，避免频繁清理
      if (this.clearCacheTimer) {
        clearTimeout(this.clearCacheTimer)
      }
      
      this.clearCacheTimer = setTimeout(() => {
        this.$store.dispatch('clearExpiredCache')
      }, 5000) // 5秒后执行清理
    }
  },

  beforeDestroy() {
    if (this.clearCacheTimer) {
      clearTimeout(this.clearCacheTimer)
    }
  }
}
</script>
