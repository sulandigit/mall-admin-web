<template>
  <div class="virtual-scroller" ref="container" @scroll="handleScroll">
    <!-- 虚拟滚动容器 -->
    <div class="virtual-scroller-wrapper" :style="{ height: totalHeight + 'px' }">
      <!-- 上方填充区域 -->
      <div class="virtual-scroller-spacer" :style="{ height: offsetY + 'px' }"></div>
      
      <!-- 可视区域内容 -->
      <div class="virtual-scroller-content">
        <slot
          v-for="(item, index) in visibleItems"
          :key="getItemKey(item, startIndex + index)"
          :item="item"
          :index="startIndex + index"
          :style="getItemStyle(startIndex + index)"
        />
      </div>
      
      <!-- 下方填充区域 -->
      <div class="virtual-scroller-spacer" :style="{ height: endSpacerHeight + 'px' }"></div>
    </div>
    
    <!-- 滚动条指示器 -->
    <div v-if="showScrollIndicator" class="scroll-indicator">
      <div class="scroll-thumb" :style="scrollThumbStyle"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VirtualScroller',
  
  props: {
    // 数据源
    items: {
      type: Array,
      default: () => []
    },
    
    // 每项的固定高度
    itemHeight: {
      type: Number,
      default: 50
    },
    
    // 缓冲区大小（上下各多渲染几项）
    bufferSize: {
      type: Number,
      default: 5
    },
    
    // 获取唯一键的函数
    keyField: {
      type: String,
      default: 'id'
    },
    
    // 是否显示滚动指示器
    showScrollIndicator: {
      type: Boolean,
      default: true
    },
    
    // 滚动性能优化选项
    throttleDelay: {
      type: Number,
      default: 16 // 约60fps
    }
  },
  
  data() {
    return {
      // 容器高度
      containerHeight: 0,
      
      // 滚动位置
      scrollTop: 0,
      
      // 可视区域开始索引
      startIndex: 0,
      
      // 可视区域结束索引
      endIndex: 0,
      
      // 滚动节流计时器
      scrollTimer: null,
      
      // 是否正在滚动
      isScrolling: false,
      
      // 滚动结束计时器
      scrollEndTimer: null
    }
  },
  
  computed: {
    // 总高度
    totalHeight() {
      return this.items.length * this.itemHeight
    },
    
    // 可视区域内可容纳的项目数
    visibleCount() {
      return Math.ceil(this.containerHeight / this.itemHeight) + this.bufferSize * 2
    },
    
    // 可视区域内的项目
    visibleItems() {
      return this.items.slice(this.startIndex, this.endIndex)
    },
    
    // 上方偏移量
    offsetY() {
      return this.startIndex * this.itemHeight
    },
    
    // 下方填充高度
    endSpacerHeight() {
      const remainingItems = this.items.length - this.endIndex
      return Math.max(0, remainingItems * this.itemHeight)
    },
    
    // 滚动条拇指样式
    scrollThumbStyle() {
      if (this.totalHeight <= this.containerHeight) {
        return { display: 'none' }
      }
      
      const thumbHeight = Math.max(20, (this.containerHeight / this.totalHeight) * this.containerHeight)
      const thumbTop = (this.scrollTop / (this.totalHeight - this.containerHeight)) * (this.containerHeight - thumbHeight)
      
      return {
        height: thumbHeight + 'px',
        transform: `translateY(${thumbTop}px)`,
        opacity: this.isScrolling ? 1 : 0.3
      }
    }
  },
  
  mounted() {
    this.updateContainerHeight()
    this.calculateVisibleRange()
    
    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize)
    
    // 使用 ResizeObserver 监听容器大小变化
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(this.handleResize)
      this.resizeObserver.observe(this.$refs.container)
    }
  },
  
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
    
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer)
    }
    
    if (this.scrollEndTimer) {
      clearTimeout(this.scrollEndTimer)
    }
  },
  
  watch: {
    items() {
      this.calculateVisibleRange()
    },
    
    itemHeight() {
      this.calculateVisibleRange()
    }
  },
  
  methods: {
    // 处理滚动事件 - 使用节流优化性能
    handleScroll(event) {
      if (this.scrollTimer) {
        return
      }
      
      this.scrollTimer = setTimeout(() => {
        this.scrollTop = event.target.scrollTop
        this.calculateVisibleRange()
        this.scrollTimer = null
        
        // 设置滚动状态
        this.isScrolling = true
        
        // 清除之前的滚动结束计时器
        if (this.scrollEndTimer) {
          clearTimeout(this.scrollEndTimer)
        }
        
        // 设置滚动结束计时器
        this.scrollEndTimer = setTimeout(() => {
          this.isScrolling = false
        }, 150)
        
      }, this.throttleDelay)
    },
    
    // 计算可视区域范围
    calculateVisibleRange() {
      if (this.items.length === 0 || this.containerHeight === 0) {
        this.startIndex = 0
        this.endIndex = 0
        return
      }
      
      // 计算开始索引（包含缓冲区）
      const visibleStart = Math.floor(this.scrollTop / this.itemHeight)
      this.startIndex = Math.max(0, visibleStart - this.bufferSize)
      
      // 计算结束索引（包含缓冲区）
      const visibleEnd = visibleStart + Math.ceil(this.containerHeight / this.itemHeight)
      this.endIndex = Math.min(this.items.length, visibleEnd + this.bufferSize)
    },
    
    // 更新容器高度
    updateContainerHeight() {
      if (this.$refs.container) {
        this.containerHeight = this.$refs.container.clientHeight
      }
    },
    
    // 处理窗口大小变化
    handleResize() {
      this.updateContainerHeight()
      this.calculateVisibleRange()
    },
    
    // 获取项目的唯一键
    getItemKey(item, index) {
      if (this.keyField && item[this.keyField] !== undefined) {
        return item[this.keyField]
      }
      return index
    },
    
    // 获取项目样式
    getItemStyle(index) {
      return {
        height: this.itemHeight + 'px',
        // 使用 transform3d 启用硬件加速
        transform: 'translate3d(0, 0, 0)'
      }
    },
    
    // 滚动到指定索引
    scrollToIndex(index) {
      if (index < 0 || index >= this.items.length) return
      
      const targetScrollTop = index * this.itemHeight
      this.$refs.container.scrollTop = targetScrollTop
    },
    
    // 滚动到顶部
    scrollToTop() {
      this.scrollToIndex(0)
    },
    
    // 滚动到底部
    scrollToBottom() {
      this.scrollToIndex(this.items.length - 1)
    },
    
    // 获取当前可视区域信息
    getVisibleRange() {
      return {
        startIndex: this.startIndex,
        endIndex: this.endIndex,
        visibleItems: this.visibleItems
      }
    }
  }
}
</script>

<style scoped>
.virtual-scroller {
  position: relative;
  height: 100%;
  overflow: auto;
  /* 优化滚动性能 */
  will-change: scroll-position;
  /* 使用硬件加速 */
  transform: translate3d(0, 0, 0);
}

.virtual-scroller-wrapper {
  position: relative;
  width: 100%;
}

.virtual-scroller-content {
  position: relative;
}

.virtual-scroller-spacer {
  width: 100%;
  /* 防止边距合并 */
  border: none;
  padding: 0;
  margin: 0;
}

/* 滚动条指示器 */
.scroll-indicator {
  position: absolute;
  top: 0;
  right: 2px;
  width: 4px;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  pointer-events: none;
  z-index: 1;
}

.scroll-thumb {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 2px;
  transition: opacity 0.3s ease, transform 0.1s ease;
}

/* 隐藏原生滚动条但保持功能 */
.virtual-scroller::-webkit-scrollbar {
  width: 6px;
}

.virtual-scroller::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.virtual-scroller::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  transition: background-color 0.3s ease;
}

.virtual-scroller::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.4);
}

/* 滚动时的性能优化 */
.virtual-scroller.scrolling * {
  pointer-events: none;
}

/* 针对移动设备的优化 */
@media (max-width: 768px) {
  .virtual-scroller {
    /* 在移动设备上启用惯性滚动 */
    -webkit-overflow-scrolling: touch;
  }
  
  .scroll-indicator {
    display: none;
  }
}
</style>