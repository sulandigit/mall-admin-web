<template>
  <transition name="fade">
    <div v-if="showIndicator" class="cache-status-indicator" :class="statusClass">
      <i :class="iconClass"></i>
      <span class="status-text">{{ statusText }}</span>
    </div>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'CacheStatusIndicator',
  
  data() {
    return {
      showIndicator: false,
      currentStatus: 'normal', // normal, cached, loading, refreshing
      autoHideTimer: null
    }
  },

  computed: {
    ...mapGetters([
      'cachedViews'
    ]),
    
    statusClass() {
      return `status-${this.currentStatus}`
    },
    
    iconClass() {
      const iconMap = {
        normal: 'el-icon-document',
        cached: 'el-icon-folder-checked',
        loading: 'el-icon-loading',
        refreshing: 'el-icon-refresh'
      }
      return iconMap[this.currentStatus] || 'el-icon-document'
    },
    
    statusText() {
      const textMap = {
        normal: '页面已加载',
        cached: '从缓存加载',
        loading: '页面加载中...',
        refreshing: '数据刷新中...'
      }
      return textMap[this.currentStatus] || ''
    }
  },

  watch: {
    '$route'(to, from) {
      this.handleRouteChange(to, from)
    }
  },

  mounted() {
    this.handleRouteChange(this.$route, null)
  },

  methods: {
    handleRouteChange(to, from) {
      // 检查页面是否从缓存加载
      if (to.name && this.cachedViews.includes(to.name)) {
        this.showStatus('cached', 2000)
      } else {
        this.showStatus('normal', 1500)
      }
    },
    
    showStatus(status, duration = 2000) {
      this.currentStatus = status
      this.showIndicator = true
      
      // 清除之前的定时器
      if (this.autoHideTimer) {
        clearTimeout(this.autoHideTimer)
      }
      
      // 设置自动隐藏
      this.autoHideTimer = setTimeout(() => {
        this.hideStatus()
      }, duration)
    },
    
    hideStatus() {
      this.showIndicator = false
      if (this.autoHideTimer) {
        clearTimeout(this.autoHideTimer)
        this.autoHideTimer = null
      }
    },
    
    // 外部调用方法
    showLoading() {
      this.showStatus('loading')
    },
    
    showRefreshing() {
      this.showStatus('refreshing', 1500)
    },
    
    showCached() {
      this.showStatus('cached', 2000)
    }
  },

  beforeDestroy() {
    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer)
    }
  }
}
</script>

<style scoped>
.cache-status-indicator {
  position: fixed;
  top: 70px;
  right: 20px;
  z-index: 1500;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}

.status-normal {
  background-color: rgba(103, 194, 58, 0.9);
  color: white;
}

.status-cached {
  background-color: rgba(64, 158, 255, 0.9);
  color: white;
}

.status-loading {
  background-color: rgba(230, 162, 60, 0.9);
  color: white;
}

.status-refreshing {
  background-color: rgba(144, 147, 153, 0.9);
  color: white;
}

.status-text {
  margin-left: 6px;
  font-weight: 500;
}

.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

/* 旋转动画 */
.el-icon-loading {
  animation: rotating 2s linear infinite;
}

.el-icon-refresh {
  animation: rotating 1s linear infinite;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>