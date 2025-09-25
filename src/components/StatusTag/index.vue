<template>
  <span 
    :class="['status-tag', `status-tag--${type}`, `status-tag--${size}`]"
    :style="customStyle">
    <i v-if="icon" :class="icon" class="status-tag__icon"></i>
    <span class="status-tag__text">{{ text }}</span>
    <i v-if="closable" class="el-icon-close status-tag__close" @click="handleClose"></i>
  </span>
</template>

<script>
export default {
  name: 'StatusTag',
  props: {
    // 标签类型
    type: {
      type: String,
      default: 'primary',
      validator: value => ['primary', 'success', 'warning', 'danger', 'info'].includes(value)
    },
    // 标签大小
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large'].includes(value)
    },
    // 标签文本
    text: {
      type: String,
      required: true
    },
    // 图标
    icon: {
      type: String,
      default: ''
    },
    // 是否可关闭
    closable: {
      type: Boolean,
      default: false
    },
    // 自定义颜色
    color: {
      type: String,
      default: ''
    },
    // 背景颜色
    backgroundColor: {
      type: String,
      default: ''
    }
  },
  computed: {
    customStyle() {
      const style = {}
      if (this.color) {
        style.color = this.color
      }
      if (this.backgroundColor) {
        style.backgroundColor = this.backgroundColor
        style.borderColor = this.backgroundColor
      }
      return style
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixin.scss';

.status-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: $border-radius-base;
  font-size: $font-size-small;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  border: 1px solid transparent;
  @include transition;
  
  &__icon {
    margin-right: 4px;
    font-size: inherit;
  }
  
  &__text {
    flex: 1;
  }
  
  &__close {
    margin-left: 4px;
    cursor: pointer;
    font-size: 12px;
    opacity: 0.6;
    @include transition;
    
    &:hover {
      opacity: 1;
    }
  }
  
  // 类型样式
  &--primary {
    color: $primary-color;
    background-color: rgba($primary-color, 0.1);
    border-color: rgba($primary-color, 0.2);
  }
  
  &--success {
    color: $success-color;
    background-color: rgba($success-color, 0.1);
    border-color: rgba($success-color, 0.2);
  }
  
  &--warning {
    color: $warning-color;
    background-color: rgba($warning-color, 0.1);
    border-color: rgba($warning-color, 0.2);
  }
  
  &--danger {
    color: $danger-color;
    background-color: rgba($danger-color, 0.1);
    border-color: rgba($danger-color, 0.2);
  }
  
  &--info {
    color: $info-color;
    background-color: rgba($info-color, 0.1);
    border-color: rgba($info-color, 0.2);
  }
  
  // 大小样式
  &--small {
    padding: 2px 6px;
    font-size: $font-size-extra-small;
  }
  
  &--medium {
    padding: 4px 8px;
    font-size: $font-size-small;
  }
  
  &--large {
    padding: 6px 12px;
    font-size: $font-size-base;
  }
}
</style>