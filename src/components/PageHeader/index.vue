<template>
  <div class="page-header" :class="{'page-header--ghost': ghost}">
    <div class="page-header__content">
      <!-- 返回按钮 -->
      <div v-if="showBack" class="page-header__back" @click="handleBack">
        <i class="el-icon-arrow-left"></i>
        <span class="back-text">{{ backText }}</span>
      </div>
      
      <!-- 头部信息 -->
      <div class="page-header__info">
        <!-- 标题区域 -->
        <div class="page-header__title">
          <h1 class="title-text">{{ title }}</h1>
          <div v-if="subtitle" class="subtitle-text">{{ subtitle }}</div>
        </div>
        
        <!-- 描述信息 -->
        <div v-if="description || $slots.description" class="page-header__description">
          <slot name="description">{{ description }}</slot>
        </div>
        
        <!-- 标签区域 -->
        <div v-if="tags && tags.length > 0" class="page-header__tags">
          <el-tag
            v-for="(tag, index) in tags"
            :key="index"
            :type="tag.type || 'info'"
            :size="tag.size || 'small'"
            :effect="tag.effect || 'light'">
            {{ tag.text || tag }}
          </el-tag>
        </div>
      </div>
      
      <!-- 操作区域 -->
      <div v-if="$slots.action || $slots.extra" class="page-header__action">
        <div v-if="$slots.extra" class="page-header__extra">
          <slot name="extra"></slot>
        </div>
        <div v-if="$slots.action" class="page-header__buttons">
          <slot name="action"></slot>
        </div>
      </div>
    </div>
    
    <!-- 底部内容 -->
    <div v-if="$slots.content" class="page-header__bottom">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageHeader',
  props: {
    // 标题
    title: {
      type: String,
      required: true
    },
    // 副标题
    subtitle: {
      type: String,
      default: ''
    },
    // 描述
    description: {
      type: String,
      default: ''
    },
    // 是否显示返回按钮
    showBack: {
      type: Boolean,
      default: false
    },
    // 返回按钮文本
    backText: {
      type: String,
      default: '返回'
    },
    // 标签列表
    tags: {
      type: Array,
      default: () => []
    },
    // 是否为幽灵模式（无背景）
    ghost: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleBack() {
      this.$emit('back')
      // 如果没有监听back事件，默认执行浏览器返回
      if (!this.$listeners.back) {
        this.$router.go(-1)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixin.scss';

.page-header {
  background-color: $background-color-lighter;
  border-bottom: 1px solid $border-color-extra-light;
  padding: $spacing-xl $spacing-xxl;
  margin-bottom: $spacing-xl;
  
  &--ghost {
    background-color: transparent;
    border-bottom: none;
  }
  
  &__content {
    @include flexBetween;
    align-items: flex-start;
    gap: $spacing-lg;
  }
  
  &__back {
    @include flexCenter;
    cursor: pointer;
    color: $text-color-regular;
    @include transition;
    padding: $spacing-xs $spacing-sm;
    border-radius: $border-radius-base;
    margin-right: $spacing-lg;
    flex-shrink: 0;
    
    &:hover {
      color: $primary-color;
      background-color: rgba($primary-color, 0.1);
    }
    
    i {
      font-size: 18px;
      margin-right: $spacing-xs;
    }
    
    .back-text {
      font-size: $font-size-base;
    }
  }
  
  &__info {
    flex: 1;
    min-width: 0;
  }
  
  &__title {
    margin-bottom: $spacing-sm;
    
    .title-text {
      font-size: $font-size-extra-large;
      color: $text-color-primary;
      font-weight: 600;
      margin: 0 0 $spacing-xs 0;
      line-height: 1.2;
    }
    
    .subtitle-text {
      font-size: $font-size-base;
      color: $text-color-secondary;
      line-height: 1.4;
    }
  }
  
  &__description {
    font-size: $font-size-base;
    color: $text-color-regular;
    line-height: 1.6;
    margin-bottom: $spacing-md;
    max-width: 600px;
  }
  
  &__tags {
    .el-tag {
      margin-right: $spacing-sm;
      margin-bottom: $spacing-xs;
    }
  }
  
  &__action {
    @include flexCenter;
    align-items: flex-start;
    gap: $spacing-lg;
    flex-shrink: 0;
  }
  
  &__extra {
    color: $text-color-secondary;
    font-size: $font-size-small;
  }
  
  &__buttons {
    @include flexCenter;
    gap: $spacing-sm;
    
    ::v-deep .el-button {
      // Element UI 按钮样式
    }
  }
  
  &__bottom {
    margin-top: $spacing-lg;
    padding-top: $spacing-lg;
    border-top: 1px solid $border-color-extra-light;
  }
}

// 响应式设计
@include respond-to('md') {
  .page-header {
    padding: $spacing-lg $spacing-xl;
    
    &__content {
      flex-direction: column;
      align-items: stretch;
      gap: $spacing-md;
    }
    
    &__action {
      justify-content: flex-start;
      margin-top: $spacing-md;
    }
  }
}

@include respond-to('sm') {
  .page-header {
    padding: $spacing-md $spacing-lg;
    
    &__back {
      margin-right: 0;
      margin-bottom: $spacing-sm;
    }
    
    &__title {
      .title-text {
        font-size: $font-size-large;
      }
    }
    
    &__buttons {
      flex-direction: column;
      width: 100%;
      
      ::v-deep .el-button {
        width: 100%;
        margin-left: 0 !important;
        margin-bottom: $spacing-xs;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}
</style>