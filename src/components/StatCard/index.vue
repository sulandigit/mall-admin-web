<template>
  <el-card class="stat-card" :class="[`stat-card--${type}`, {'stat-card--hover': hover}]" :shadow="shadow">
    <div class="stat-card__content">
      <!-- 图标区域 -->
      <div class="stat-card__icon" :style="iconStyle">
        <i v-if="icon" :class="icon" class="stat-icon"></i>
        <svg-icon v-else-if="svgIcon" :icon-class="svgIcon" class="stat-icon"></svg-icon>
        <slot v-else name="icon"></slot>
      </div>
      
      <!-- 内容区域 -->
      <div class="stat-card__info">
        <div class="stat-card__header">
          <span class="stat-title">{{ title }}</span>
          <el-tooltip v-if="tooltip" :content="tooltip" placement="top">
            <i class="el-icon-question stat-tooltip"></i>
          </el-tooltip>
        </div>
        
        <div class="stat-card__value">
          <span class="stat-number" :style="valueStyle">
            <animated-number
              v-if="animated"
              :value="value"
              :format="formatValue"
              :duration="animationDuration">
            </animated-number>
            <span v-else>{{ formatValue(value) }}</span>
          </span>
          <span v-if="unit" class="stat-unit">{{ unit }}</span>
        </div>
        
        <!-- 趋势指示器 -->
        <div v-if="trend !== undefined" class="stat-card__trend">
          <i 
            :class="trendIcon" 
            :style="trendStyle"
            class="trend-icon">
          </i>
          <span class="trend-text" :style="trendStyle">
            {{ Math.abs(trend) }}{{ trendUnit }}
          </span>
          <span class="trend-label">{{ trendLabel }}</span>
        </div>
        
        <!-- 额外信息 -->
        <div v-if="extra" class="stat-card__extra">
          {{ extra }}
        </div>
        
        <!-- 操作区域 -->
        <div v-if="$slots.action" class="stat-card__action">
          <slot name="action"></slot>
        </div>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="stat-card__loading">
      <i class="el-icon-loading"></i>
    </div>
  </el-card>
</template>

<script>
// 动画数字组件
const AnimatedNumber = {
  props: {
    value: Number,
    format: Function,
    duration: {
      type: Number,
      default: 1000
    }
  },
  data() {
    return {
      displayValue: 0,
      startTime: null,
      animationId: null
    }
  },
  watch: {
    value: {
      handler(newVal, oldVal) {
        this.animate(oldVal || 0, newVal)
      },
      immediate: true
    }
  },
  methods: {
    animate(from, to) {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId)
      }
      
      this.startTime = null
      const step = (timestamp) => {
        if (!this.startTime) this.startTime = timestamp
        const progress = Math.min((timestamp - this.startTime) / this.duration, 1)
        
        this.displayValue = from + (to - from) * this.easeOutQuart(progress)
        
        if (progress < 1) {
          this.animationId = requestAnimationFrame(step)
        }
      }
      
      this.animationId = requestAnimationFrame(step)
    },
    
    easeOutQuart(t) {
      return 1 - (--t) * t * t * t
    }
  },
  render() {
    return this.format ? this.format(this.displayValue) : Math.round(this.displayValue)
  },
  
  beforeDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
  }
}

export default {
  name: 'StatCard',
  components: {
    AnimatedNumber
  },
  props: {
    // 标题
    title: {
      type: String,
      required: true
    },
    // 数值
    value: {
      type: [Number, String],
      required: true
    },
    // 单位
    unit: {
      type: String,
      default: ''
    },
    // 图标
    icon: {
      type: String,
      default: ''
    },
    // SVG图标
    svgIcon: {
      type: String,
      default: ''
    },
    // 卡片类型
    type: {
      type: String,
      default: 'default',
      validator: value => ['default', 'primary', 'success', 'warning', 'danger', 'info'].includes(value)
    },
    // 趋势值
    trend: {
      type: Number,
      default: undefined
    },
    // 趋势单位
    trendUnit: {
      type: String,
      default: '%'
    },
    // 趋势标签
    trendLabel: {
      type: String,
      default: '较上期'
    },
    // 额外信息
    extra: {
      type: String,
      default: ''
    },
    // 提示信息
    tooltip: {
      type: String,
      default: ''
    },
    // 是否悬停效果
    hover: {
      type: Boolean,
      default: true
    },
    // 阴影类型
    shadow: {
      type: String,
      default: 'hover'
    },
    // 是否显示动画
    animated: {
      type: Boolean,
      default: true
    },
    // 动画持续时间
    animationDuration: {
      type: Number,
      default: 1000
    },
    // 是否加载中
    loading: {
      type: Boolean,
      default: false
    },
    // 自定义颜色
    color: {
      type: String,
      default: ''
    },
    // 数值格式化函数
    formatter: {
      type: Function,
      default: null
    }
  },
  computed: {
    trendIcon() {
      if (this.trend > 0) {
        return 'el-icon-top-right'
      } else if (this.trend < 0) {
        return 'el-icon-bottom-right'
      }
      return 'el-icon-minus'
    },
    
    trendStyle() {
      if (this.trend > 0) {
        return { color: '#67C23A' }
      } else if (this.trend < 0) {
        return { color: '#F56C6C' }
      }
      return { color: '#909399' }
    },
    
    iconStyle() {
      if (this.color) {
        return { color: this.color }
      }
      return {}
    },
    
    valueStyle() {
      if (this.color) {
        return { color: this.color }
      }
      return {}
    }
  },
  methods: {
    formatValue(value) {
      if (this.formatter) {
        return this.formatter(value)
      }
      
      if (typeof value === 'number') {
        // 格式化数字，添加千分位分隔符
        return value.toLocaleString()
      }
      
      return value
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixin.scss';

.stat-card {
  position: relative;
  border: 1px solid $border-color-lighter;
  @include transition;
  
  &--hover:hover {
    transform: translateY(-2px);
    box-shadow: $box-shadow-light;
  }
  
  &__content {
    @include flexCenter;
    align-items: flex-start;
    gap: $spacing-lg;
  }
  
  &__icon {
    flex-shrink: 0;
    width: 60px;
    height: 60px;
    @include flexCenter;
    border-radius: $border-radius-base;
    background-color: rgba($primary-color, 0.1);
    
    .stat-icon {
      font-size: 28px;
      color: $primary-color;
    }
  }
  
  &__info {
    flex: 1;
    min-width: 0;
  }
  
  &__header {
    @include flexBetween;
    margin-bottom: $spacing-sm;
    
    .stat-title {
      @include text-regular;
      font-weight: 500;
    }
    
    .stat-tooltip {
      color: $text-color-placeholder;
      cursor: help;
      margin-left: $spacing-xs;
      
      &:hover {
        color: $primary-color;
      }
    }
  }
  
  &__value {
    @include flexCenter;
    justify-content: flex-start;
    margin-bottom: $spacing-sm;
    
    .stat-number {
      font-size: 28px;
      font-weight: 600;
      color: $text-color-primary;
      line-height: 1;
    }
    
    .stat-unit {
      font-size: $font-size-base;
      color: $text-color-secondary;
      margin-left: $spacing-xs;
    }
  }
  
  &__trend {
    @include flexCenter;
    justify-content: flex-start;
    margin-bottom: $spacing-sm;
    
    .trend-icon {
      font-size: $font-size-small;
      margin-right: $spacing-xs;
    }
    
    .trend-text {
      font-size: $font-size-small;
      font-weight: 500;
      margin-right: $spacing-xs;
    }
    
    .trend-label {
      font-size: $font-size-extra-small;
      color: $text-color-placeholder;
    }
  }
  
  &__extra {
    @include text-secondary;
    margin-bottom: $spacing-sm;
  }
  
  &__action {
    margin-top: $spacing-md;
  }
  
  &__loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    @include flexCenter;
    border-radius: inherit;
    
    i {
      font-size: 24px;
      color: $primary-color;
    }
  }
  
  // 类型样式
  &--primary {
    .stat-card__icon {
      background-color: rgba($primary-color, 0.1);
      
      .stat-icon {
        color: $primary-color;
      }
    }
  }
  
  &--success {
    .stat-card__icon {
      background-color: rgba($success-color, 0.1);
      
      .stat-icon {
        color: $success-color;
      }
    }
  }
  
  &--warning {
    .stat-card__icon {
      background-color: rgba($warning-color, 0.1);
      
      .stat-icon {
        color: $warning-color;
      }
    }
  }
  
  &--danger {
    .stat-card__icon {
      background-color: rgba($danger-color, 0.1);
      
      .stat-icon {
        color: $danger-color;
      }
    }
  }
  
  &--info {
    .stat-card__icon {
      background-color: rgba($info-color, 0.1);
      
      .stat-icon {
        color: $info-color;
      }
    }
  }
}

// 响应式设计
@include respond-to('sm') {
  .stat-card {
    &__content {
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: $spacing-md;
    }
    
    &__info {
      width: 100%;
    }
    
    &__header {
      justify-content: center;
    }
    
    &__value {
      justify-content: center;
    }
    
    &__trend {
      justify-content: center;
    }
  }
}
</style>