<template>
  <div 
    class="home-carousel"
    :style="{ height: height }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @keydown="handleKeyDown"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    tabindex="0"
  >
    <!-- 轮播容器 -->
    <div class="carousel-container" :style="{ height: height }">
      <!-- 轮播项 -->
      <div 
        class="carousel-track"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      >
        <carousel-item
          v-for="(item, index) in images"
          :key="item.id || index"
          :image-url="item.pic"
          :title="item.name"
          :link-url="item.url"
          :is-active="index === currentIndex"
          @click="handleItemClick"
        />
      </div>
      
      <!-- 左右切换箭头 -->
      <div 
        v-if="showArrows === 'always' || (showArrows === 'hover' && hovered)"
        class="carousel-arrows"
      >
        <button 
          class="carousel-arrow carousel-arrow-left"
          @click="prevSlide"
          :disabled="!loop && currentIndex === 0"
        >
          <i class="el-icon-arrow-left"></i>
        </button>
        <button 
          class="carousel-arrow carousel-arrow-right"
          @click="nextSlide"
          :disabled="!loop && currentIndex === images.length - 1"
        >
          <i class="el-icon-arrow-right"></i>
        </button>
      </div>
    </div>
    
    <!-- 指示器 -->
    <carousel-indicator
      v-if="showIndicators && images.length > 1"
      :total="images.length"
      :current="currentIndex"
      @change="goToSlide"
    />
    
    <!-- 加载状态 -->
    <div v-if="loading" class="carousel-loading">
      <i class="el-icon-loading"></i>
      <span>加载中...</span>
    </div>
    
    <!-- 错误状态 -->
    <div v-if="error && !loading" class="carousel-error">
      <i class="el-icon-warning"></i>
      <span>{{ error }}</span>
    </div>
  </div>
</template>

<script>
import CarouselItem from './CarouselItem.vue'
import CarouselIndicator from './CarouselIndicator.vue'

export default {
  name: 'HomeCarousel',
  components: {
    CarouselItem,
    CarouselIndicator
  },
  props: {
    // 轮播图片数据
    images: {
      type: Array,
      default: () => []
    },
    // 是否自动播放
    autoPlay: {
      type: Boolean,
      default: true
    },
    // 自动播放间隔时间（毫秒）
    interval: {
      type: Number,
      default: 4000
    },
    // 轮播图高度
    height: {
      type: String,
      default: '400px'
    },
    // 是否显示指示器
    showIndicators: {
      type: Boolean,
      default: true
    },
    // 箭头显示模式：always/hover/never
    showArrows: {
      type: String,
      default: 'hover',
      validator: value => ['always', 'hover', 'never'].includes(value)
    },
    // 是否循环播放
    loop: {
      type: Boolean,
      default: true
    },
    // 悬停时暂停
    pauseOnHover: {
      type: Boolean,
      default: true
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },
    // 错误信息
    error: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      currentIndex: 0,
      timer: null,
      hovered: false,
      isPlaying: false,
      // 触摸相关数据
      touchStartX: 0,
      touchStartY: 0,
      touchEndX: 0,
      touchEndY: 0,
      isTouching: false,
      touchThreshold: 50 // 触摸滑动阈值
    }
  },
  computed: {
    hasImages() {
      return this.images && this.images.length > 0
    }
  },
  watch: {
    images: {
      handler(newImages) {
        if (newImages && newImages.length > 0) {
          this.currentIndex = 0
          this.startAutoPlay()
        }
      },
      immediate: true
    },
    autoPlay: {
      handler(newVal) {
        if (newVal) {
          this.startAutoPlay()
        } else {
          this.stopAutoPlay()
        }
      }
    }
  },
  mounted() {
    if (this.hasImages && this.autoPlay) {
      this.startAutoPlay()
    }
  },
  beforeDestroy() {
    this.stopAutoPlay()
  },
  methods: {
    /**
     * 切换到下一张图片
     */
    nextSlide() {
      if (!this.hasImages) return
      
      if (this.currentIndex >= this.images.length - 1) {
        this.currentIndex = this.loop ? 0 : this.images.length - 1
      } else {
        this.currentIndex++
      }
      
      this.$emit('change', this.currentIndex)
    },
    
    /**
     * 切换到上一张图片
     */
    prevSlide() {
      if (!this.hasImages) return
      
      if (this.currentIndex <= 0) {
        this.currentIndex = this.loop ? this.images.length - 1 : 0
      } else {
        this.currentIndex--
      }
      
      this.$emit('change', this.currentIndex)
    },
    
    /**
     * 跳转到指定图片
     */
    goToSlide(index) {
      if (!this.hasImages || index < 0 || index >= this.images.length) return
      
      this.currentIndex = index
      this.$emit('change', this.currentIndex)
    },
    
    /**
     * 开始自动播放
     */
    startAutoPlay() {
      if (!this.autoPlay || !this.hasImages || this.images.length <= 1) return
      
      this.stopAutoPlay()
      this.isPlaying = true
      this.timer = setInterval(() => {
        this.nextSlide()
      }, this.interval)
    },
    
    /**
     * 停止自动播放
     */
    stopAutoPlay() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      this.isPlaying = false
    },
    
    /**
     * 鼠标进入事件
     */
    handleMouseEnter() {
      this.hovered = true
      if (this.pauseOnHover) {
        this.stopAutoPlay()
      }
    },
    
    /**
     * 鼠标离开事件
     */
    handleMouseLeave() {
      this.hovered = false
      if (this.pauseOnHover && this.autoPlay) {
        this.startAutoPlay()
      }
    },
    
    /**
     * 键盘事件处理
     */
    handleKeyDown(event) {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          this.prevSlide()
          break
        case 'ArrowRight':
          event.preventDefault()
          this.nextSlide()
          break
        case ' ':
          event.preventDefault()
          if (this.isPlaying) {
            this.stopAutoPlay()
          } else if (this.autoPlay) {
            this.startAutoPlay()
          }
          break
      }
    },
    
    /**
     * 轮播项点击事件
     */
    handleItemClick(item) {
      this.$emit('item-click', item)
    },
    
    /**
     * 触摸开始事件
     */
    handleTouchStart(event) {
      if (!this.hasImages || this.images.length <= 1) return
      
      const touch = event.touches[0]
      this.touchStartX = touch.clientX
      this.touchStartY = touch.clientY
      this.isTouching = true
      
      // 暂停自动播放
      if (this.pauseOnHover) {
        this.stopAutoPlay()
      }
    },
    
    /**
     * 触摸移动事件
     */
    handleTouchMove(event) {
      if (!this.isTouching) return
      
      event.preventDefault() // 防止页面滚动
    },
    
    /**
     * 触摸结束事件
     */
    handleTouchEnd(event) {
      if (!this.isTouching) return
      
      const touch = event.changedTouches[0]
      this.touchEndX = touch.clientX
      this.touchEndY = touch.clientY
      this.isTouching = false
      
      this.handleSwipe()
      
      // 恢复自动播放
      if (this.pauseOnHover && this.autoPlay) {
        this.startAutoPlay()
      }
    },
    
    /**
     * 处理滑动手势
     */
    handleSwipe() {
      const deltaX = this.touchEndX - this.touchStartX
      const deltaY = this.touchEndY - this.touchStartY
      
      // 判断是否为水平滑动（水平位移大于垂直位移）
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.touchThreshold) {
        if (deltaX > 0) {
          // 右滑，显示上一张
          this.prevSlide()
        } else {
          // 左滑，显示下一张
          this.nextSlide()
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.home-carousel {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  touch-action: pan-y; /* 允许垂直滚动，禁止水平滚动 */
  user-select: none; /* 禁止文本选择 */
  
  &:focus {
    outline: 2px solid #409EFF;
    outline-offset: 2px;
  }
}

.carousel-container {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.carousel-track {
  display: flex;
  width: 100%;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform; /* 优化性能 */
}

.carousel-arrows {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 18px;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.7);
    transform: translateY(-50%) scale(1.1);
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  &.carousel-arrow-left {
    left: 20px;
  }
  
  &.carousel-arrow-right {
    right: 20px;
  }
}

.carousel-loading,
.carousel-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  color: #606266;
  font-size: 16px;
  
  i {
    font-size: 32px;
    margin-bottom: 12px;
  }
}

.carousel-error {
  color: #F56C6C;
}

// 响应式设计
@media (max-width: 768px) {
  .carousel-arrow {
    width: 36px;
    height: 36px;
    font-size: 14px;
    
    &.carousel-arrow-left {
      left: 10px;
    }
    
    &.carousel-arrow-right {
      right: 10px;
    }
  }
  
  .home-carousel {
    touch-action: pan-y; /* 移动端触摸优化 */
  }
}

@media (max-width: 480px) {
  .home-carousel {
    border-radius: 4px;
  }
  
  .carousel-arrow {
    width: 32px;
    height: 32px;
    font-size: 12px;
    
    // 在小屏幕上隐藏箭头，主要依靠触摸手势
    display: none;
  }
}

// 触摸设备优化
@media (pointer: coarse) {
  .carousel-arrow {
    // 增大触摸目标
    width: 48px;
    height: 48px;
    
    &.carousel-arrow-left {
      left: 15px;
    }
    
    &.carousel-arrow-right {
      right: 15px;
    }
  }
}
</style>