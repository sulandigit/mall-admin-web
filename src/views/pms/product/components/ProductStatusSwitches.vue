<template>
  <!-- 使用v-memo优化状态开关组件，这是性能优化的关键区域 -->
  <div 
    v-memo="memoDeps" 
    class="product-status-switches"
  >
    <!-- 上架状态开关 -->
    <div class="status-item">
      <span class="status-label">上架：</span>
      <optimized-switch
        :value="product.publishStatus"
        :disabled="isUpdating"
        @change="handlePublishStatusChange"
      />
    </div>
    
    <!-- 新品状态开关 -->
    <div class="status-item">
      <span class="status-label">新品：</span>
      <optimized-switch
        :value="product.newStatus"
        :disabled="isUpdating"
        @change="handleNewStatusChange"
      />
    </div>
    
    <!-- 推荐状态开关 -->
    <div class="status-item">
      <span class="status-label">推荐：</span>
      <optimized-switch
        :value="product.recommandStatus"
        :disabled="isUpdating"
        @change="handleRecommendStatusChange"
      />
    </div>
  </div>
</template>

<script>
import OptimizedSwitch from './OptimizedSwitch'

export default {
  name: 'ProductStatusSwitches',
  
  components: {
    OptimizedSwitch
  },
  
  props: {
    product: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    memoDeps: {
      type: Array,
      default: () => []
    }
  },
  
  data() {
    return {
      isUpdating: false,
      // 防抖定时器
      debounceTimers: {
        publishStatus: null,
        newStatus: null,
        recommandStatus: null
      }
    }
  },
  
  methods: {
    // 上架状态变化 - 使用防抖优化
    handlePublishStatusChange(value) {
      this.debouncedStatusChange('publishStatus', value)
    },
    
    // 新品状态变化 - 使用防抖优化
    handleNewStatusChange(value) {
      this.debouncedStatusChange('newStatus', value)
    },
    
    // 推荐状态变化 - 使用防抖优化
    handleRecommendStatusChange(value) {
      this.debouncedStatusChange('recommandStatus', value)
    },
    
    // 防抖状态变化处理
    debouncedStatusChange(field, value) {
      // 清除之前的定时器
      if (this.debounceTimers[field]) {
        clearTimeout(this.debounceTimers[field])
      }
      
      // 设置新的定时器
      this.debounceTimers[field] = setTimeout(() => {
        this.emitStatusChange(field, value)
      }, 300) // 300ms防抖延迟
    },
    
    // 触发状态变化事件
    async emitStatusChange(field, value) {
      if (this.isUpdating) return
      
      this.isUpdating = true
      
      try {
        await this.$emit('status-change', {
          index: this.index,
          field,
          value: value ? 1 : 0,
          row: this.product
        })
      } catch (error) {
        console.error('状态更新失败:', error)
        // 如果更新失败，可以在这里恢复状态
      } finally {
        // 延迟重置更新状态，避免频繁切换
        setTimeout(() => {
          this.isUpdating = false
        }, 100)
      }
    }
  },
  
  beforeDestroy() {
    // 清理定时器
    Object.values(this.debounceTimers).forEach(timer => {
      if (timer) clearTimeout(timer)
    })
  }
}
</script>

<style scoped>
.product-status-switches {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 5px;
}

.status-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 20px;
}

.status-label {
  font-size: 12px;
  color: #606266;
  min-width: 32px;
  text-align: left;
}

/* 当组件正在更新时显示加载状态 */
.product-status-switches.updating {
  opacity: 0.7;
  pointer-events: none;
}

/* 优化动画性能 */
.status-item {
  will-change: auto;
}

.status-item:hover {
  background-color: rgba(64, 158, 255, 0.05);
  border-radius: 4px;
  transition: background-color 0.2s ease;
}
</style>