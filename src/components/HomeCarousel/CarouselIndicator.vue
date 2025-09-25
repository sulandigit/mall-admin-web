<template>
  <div class="carousel-indicator" v-if="total > 1">
    <div class="indicator-wrapper">
      <button
        v-for="index in total"
        :key="index"
        :class="[
          'indicator-dot',
          { 'is-active': index - 1 === current }
        ]"
        :aria-label="`轮播图第${index}张`"
        @click="handleClick(index - 1)"
        @keydown="handleKeyDown($event, index - 1)"
      >
        <span class="dot-inner"></span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CarouselIndicator',
  props: {
    // 总图片数量
    total: {
      type: Number,
      required: true,
      validator: value => value >= 0
    },
    // 当前索引
    current: {
      type: Number,
      required: true,
      validator: value => value >= 0
    }
  },
  methods: {
    /**
     * 处理点击事件
     */
    handleClick(index) {
      if (index === this.current) return
      
      this.$emit('change', index)
    },
    
    /**
     * 键盘事件处理
     */
    handleKeyDown(event, index) {
      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault()
          this.handleClick(index)
          break
        case 'ArrowLeft':
          event.preventDefault()
          const prevIndex = index > 0 ? index - 1 : this.total - 1
          this.handleClick(prevIndex)
          break
        case 'ArrowRight':
          event.preventDefault()
          const nextIndex = index < this.total - 1 ? index + 1 : 0
          this.handleClick(nextIndex)
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.carousel-indicator {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.indicator-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

.indicator-dot {
  width: 12px;
  height: 12px;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  padding: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:focus {
    outline: 2px solid rgba(255, 255, 255, 0.8);
    outline-offset: 2px;
  }
  
  &:hover:not(.is-active) {
    transform: scale(1.2);
    
    .dot-inner {
      background: rgba(255, 255, 255, 0.8);
      transform: scale(1.1);
    }
  }
  
  &.is-active {
    transform: scale(1.3);
    
    .dot-inner {
      background: #409EFF;
      transform: scale(1.2);
      box-shadow: 0 0 8px rgba(64, 158, 255, 0.6);
    }
  }
}

.dot-inner {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: block;
}

// 激活动画
.indicator-dot.is-active .dot-inner {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 8px rgba(64, 158, 255, 0.6);
  }
  50% {
    box-shadow: 0 0 16px rgba(64, 158, 255, 0.8);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .carousel-indicator {
    bottom: 15px;
  }
  
  .indicator-wrapper {
    gap: 6px;
    padding: 6px 12px;
  }
  
  .indicator-dot {
    width: 10px;
    height: 10px;
  }
  
  .dot-inner {
    width: 6px;
    height: 6px;
  }
}

@media (max-width: 480px) {
  .carousel-indicator {
    bottom: 10px;
  }
  
  .indicator-wrapper {
    gap: 4px;
    padding: 4px 8px;
  }
  
  .indicator-dot {
    width: 8px;
    height: 8px;
  }
  
  .dot-inner {
    width: 5px;
    height: 5px;
  }
}

// 高对比度模式支持
@media (prefers-contrast: high) {
  .indicator-wrapper {
    background: rgba(0, 0, 0, 0.8);
  }
  
  .dot-inner {
    background: white;
  }
  
  .indicator-dot.is-active .dot-inner {
    background: #409EFF;
    border: 2px solid white;
  }
}

// 减少动画模式支持
@media (prefers-reduced-motion: reduce) {
  .indicator-dot,
  .dot-inner {
    transition: none;
  }
  
  .indicator-dot.is-active .dot-inner {
    animation: none;
  }
}
</style>