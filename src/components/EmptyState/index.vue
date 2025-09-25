<template>
  <div class="empty-state" :class="[`empty-state--${size}`]">
    <!-- 图标区域 -->
    <div class="empty-state__icon">
      <i v-if="icon" :class="icon" class="empty-icon"></i>
      <svg-icon v-else-if="svgIcon" :icon-class="svgIcon" class="empty-icon"></svg-icon>
      <img v-else-if="image" :src="image" alt="empty" class="empty-image">
      <slot v-else name="icon">
        <i class="el-icon-box empty-icon"></i>
      </slot>
    </div>
    
    <!-- 文本区域 -->
    <div class="empty-state__content">
      <div class="empty-state__title">
        <slot name="title">{{ title }}</slot>
      </div>
      
      <div v-if="description || $slots.description" class="empty-state__description">
        <slot name="description">{{ description }}</slot>
      </div>
    </div>
    
    <!-- 操作区域 -->
    <div v-if="showAction || $slots.action" class="empty-state__action">
      <slot name="action">
        <el-button 
          v-if="actionText"
          :type="actionType"
          :icon="actionIcon"
          @click="handleAction">
          {{ actionText }}
        </el-button>
      </slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmptyState',
  props: {
    // 标题
    title: {
      type: String,
      default: '暂无数据'
    },
    // 描述
    description: {
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
    // 图片
    image: {
      type: String,
      default: ''
    },
    // 尺寸
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large'].includes(value)
    },
    // 是否显示操作按钮
    showAction: {
      type: Boolean,
      default: false
    },
    // 操作按钮文本
    actionText: {
      type: String,
      default: '重新加载'
    },
    // 操作按钮类型
    actionType: {
      type: String,
      default: 'primary'
    },
    // 操作按钮图标
    actionIcon: {
      type: String,
      default: 'el-icon-refresh'
    }
  },
  methods: {
    handleAction() {
      this.$emit('action')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixin.scss';

.empty-state {
  @include flexCenterColumn;
  padding: $spacing-xxl;
  text-align: center;
  color: $text-color-secondary;
  
  &__icon {
    margin-bottom: $spacing-lg;
    
    .empty-icon {
      font-size: 64px;
      color: $text-color-placeholder;
    }
    
    .empty-image {
      max-width: 200px;
      max-height: 160px;
      opacity: 0.6;
    }
  }
  
  &__content {
    margin-bottom: $spacing-lg;
  }
  
  &__title {
    font-size: $font-size-large;
    color: $text-color-regular;
    font-weight: 500;
    margin-bottom: $spacing-sm;
    line-height: 1.4;
  }
  
  &__description {
    font-size: $font-size-base;
    color: $text-color-secondary;
    line-height: 1.6;
    max-width: 400px;
  }
  
  &__action {
    // 操作按钮由 Element UI 样式处理
  }
  
  // 尺寸变体
  &--small {
    padding: $spacing-lg;
    
    .empty-state__icon {
      margin-bottom: $spacing-md;
      
      .empty-icon {
        font-size: 48px;
      }
      
      .empty-image {
        max-width: 120px;
        max-height: 96px;
      }
    }
    
    .empty-state__title {
      font-size: $font-size-medium;
    }
    
    .empty-state__description {
      font-size: $font-size-small;
    }
  }
  
  &--medium {
    padding: $spacing-xxl;
    
    .empty-state__icon {
      margin-bottom: $spacing-lg;
      
      .empty-icon {
        font-size: 64px;
      }
      
      .empty-image {
        max-width: 200px;
        max-height: 160px;
      }
    }
    
    .empty-state__title {
      font-size: $font-size-large;
    }
    
    .empty-state__description {
      font-size: $font-size-base;
    }
  }
  
  &--large {
    padding: 80px $spacing-xxl;
    
    .empty-state__icon {
      margin-bottom: 32px;
      
      .empty-icon {
        font-size: 80px;
      }
      
      .empty-image {
        max-width: 280px;
        max-height: 224px;
      }
    }
    
    .empty-state__title {
      font-size: $font-size-extra-large;
    }
    
    .empty-state__description {
      font-size: $font-size-medium;
    }
  }
}

// 响应式设计
@include respond-to('sm') {
  .empty-state {
    padding: $spacing-lg;
    
    &__icon {
      .empty-icon {
        font-size: 48px;
      }
      
      .empty-image {
        max-width: 150px;
        max-height: 120px;
      }
    }
    
    &__title {
      font-size: $font-size-medium;
    }
    
    &__description {
      font-size: $font-size-small;
    }
    
    &--large {
      padding: $spacing-xl;
      
      .empty-state__icon {
        .empty-icon {
          font-size: 60px;
        }
      }
    }
  }
}
</style>