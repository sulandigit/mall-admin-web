<template>
  <div class="theme-toggle">
    <!-- 主题切换按钮 -->
    <el-tooltip
      :content="tooltipText"
      placement="bottom"
      effect="dark"
    >
      <el-button
        :class="['theme-toggle-btn', { 'is-transitioning': isThemeTransitioning }]"
        :size="size"
        :type="buttonType"
        :icon="currentIcon"
        @click="handleToggle"
        circle
      >
        <span v-if="showText" class="theme-toggle-text">
          {{ currentTheme === 'light' ? '暗色' : '亮色' }}
        </span>
      </el-button>
    </el-tooltip>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ThemeToggle',
  props: {
    // 按钮大小
    size: {
      type: String,
      default: 'medium',
      validator: value => ['large', 'medium', 'small', 'mini'].includes(value)
    },
    // 是否显示文本说明
    showText: {
      type: Boolean,
      default: false
    },
    // 按钮类型
    type: {
      type: String,
      default: 'default',
      validator: value => ['default', 'primary', 'success', 'warning', 'danger', 'info', 'text'].includes(value)
    }
  },
  computed: {
    ...mapGetters([
      'currentTheme',
      'isThemeTransitioning'
    ]),
    
    // 当前图标
    currentIcon() {
      return this.currentTheme === 'light' ? 'el-icon-moon' : 'el-icon-sunny'
    },
    
    // 按钮类型
    buttonType() {
      return this.isThemeTransitioning ? 'info' : this.type
    },
    
    // 提示文本
    tooltipText() {
      if (this.isThemeTransitioning) {
        return '主题切换中...'
      }
      return this.currentTheme === 'light' ? '切换到暗色主题' : '切换到亮色主题'
    }
  },
  methods: {
    // 处理主题切换
    handleToggle() {
      if (this.isThemeTransitioning) {
        return
      }
      
      this.$store.dispatch('toggleTheme')
      
      // 触发自定义事件
      this.$emit('theme-changed', this.currentTheme === 'light' ? 'dark' : 'light')
    }
  }
}
</script>

<style lang="scss" scoped>
.theme-toggle {
  display: inline-block;
  
  .theme-toggle-btn {
    @include theme-transition();
    position: relative;
    overflow: hidden;
    
    &.is-transitioning {
      opacity: 0.7;
      cursor: not-allowed;
      
      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.4),
          transparent
        );
        animation: shimmer 1s infinite;
      }
    }
    
    .theme-toggle-text {
      margin-left: 4px;
      font-size: 12px;
    }
    
    // 主题图标样式
    .el-icon-moon {
      color: #409EFF;
    }
    
    .el-icon-sunny {
      color: #F7BA2A;
    }
    
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    &:active {
      transform: scale(0.95);
    }
  }
}

// 切换动画
@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .theme-toggle {
    .theme-toggle-btn {
      .theme-toggle-text {
        display: none;
      }
    }
  }
}
</style>