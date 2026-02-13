/**
 * 移动端表单适配组件
 * 提供移动端友好的表单布局和交互体验
 */

<template>
  <div class="mobile-form-wrapper" :class="formWrapperClass">
    <el-form
      ref="form"
      v-bind="$attrs"
      v-on="$listeners"
      :model="formData"
      :rules="formRules"
      :label-position="labelPosition"
      :label-width="labelWidth"
      class="mobile-form"
      :class="formClass"
    >
      <slot></slot>
      
      <!-- 移动端表单操作栏 -->
      <div v-if="showActions && isMobileOrTablet" class="mobile-form-actions">
        <el-button 
          v-if="showCancel"
          :size="actionButtonSize"
          @click="handleCancel"
        >
          {{ cancelText }}
        </el-button>
        <el-button 
          v-if="showSubmit"
          :size="actionButtonSize"
          type="primary" 
          :loading="submitLoading"
          @click="handleSubmit"
        >
          {{ submitText }}
        </el-button>
      </div>
    </el-form>
    
    <!-- 虚拟键盘占位 -->
    <div v-if="keyboardPlaceholder && isKeyboardVisible" class="keyboard-placeholder"></div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'MobileForm',
  inheritAttrs: false,
  props: {
    // 表单数据
    model: {
      type: Object,
      default: () => ({})
    },
    
    // 表单验证规则
    rules: {
      type: Object,
      default: () => ({})
    },
    
    // 表单样式类
    formClass: {
      type: String,
      default: ''
    },
    
    // 显示操作按钮
    showActions: {
      type: Boolean,
      default: false
    },
    
    // 显示取消按钮
    showCancel: {
      type: Boolean,
      default: true
    },
    
    // 显示提交按钮
    showSubmit: {
      type: Boolean,
      default: true
    },
    
    // 取消按钮文本
    cancelText: {
      type: String,
      default: '取消'
    },
    
    // 提交按钮文本
    submitText: {
      type: String,
      default: '确定'
    },
    
    // 提交加载状态
    submitLoading: {
      type: Boolean,
      default: false
    },
    
    // 是否启用键盘占位
    keyboardPlaceholder: {
      type: Boolean,
      default: true
    }
  },
  
  data() {
    return {
      isKeyboardVisible: false,
      focusedInput: null
    }
  },
  
  computed: {
    ...mapGetters(['isMobile', 'isTablet', 'isMobileOrTablet']),
    
    /**
     * 表单数据
     */
    formData() {
      return this.model
    },
    
    /**
     * 表单规则
     */
    formRules() {
      return this.rules
    },
    
    /**
     * 标签位置
     */
    labelPosition() {
      return this.isMobileOrTablet ? 'top' : 'right'
    },
    
    /**
     * 标签宽度
     */
    labelWidth() {
      return this.isMobileOrTablet ? 'auto' : '100px'
    },
    
    /**
     * 表单包装器样式类
     */
    formWrapperClass() {
      return {
        'mobile-device': this.isMobileOrTablet,
        'keyboard-visible': this.isKeyboardVisible
      }
    },
    
    /**
     * 操作按钮尺寸
     */
    actionButtonSize() {
      return this.isMobile ? 'medium' : 'small'
    }
  },
  
  mounted() {
    this.initKeyboardDetection()
  },
  
  beforeDestroy() {
    this.destroyKeyboardDetection()
  },
  
  methods: {
    /**
     * 初始化键盘检测
     */
    initKeyboardDetection() {
      if (!this.isMobileOrTablet) return
      
      // 监听输入框聚焦
      document.addEventListener('focusin', this.handleFocusIn)
      document.addEventListener('focusout', this.handleFocusOut)
      
      // 监听视窗大小变化（用于检测虚拟键盘）
      window.addEventListener('resize', this.handleResize)
    },
    
    /**
     * 销毁键盘检测
     */
    destroyKeyboardDetection() {
      document.removeEventListener('focusin', this.handleFocusIn)
      document.removeEventListener('focusout', this.handleFocusOut)
      window.removeEventListener('resize', this.handleResize)
    },
    
    /**
     * 处理输入框聚焦
     */
    handleFocusIn(event) {
      const target = event.target
      if (this.isInputElement(target)) {
        this.focusedInput = target
        this.isKeyboardVisible = true
        this.$store.dispatch('SetKeyboardVisible', true)
        
        // 延迟滚动到输入框
        this.$nextTick(() => {
          setTimeout(() => {
            this.scrollToInput(target)
          }, 300)
        })
      }
    },
    
    /**
     * 处理输入框失焦
     */
    handleFocusOut(event) {
      // 延迟检测，防止在输入框间快速切换时误判
      setTimeout(() => {
        if (!document.activeElement || !this.isInputElement(document.activeElement)) {
          this.focusedInput = null
          this.isKeyboardVisible = false
          this.$store.dispatch('SetKeyboardVisible', false)
        }
      }, 100)
    },
    
    /**
     * 处理窗口大小变化
     */
    handleResize() {
      // 在移动设备上，视窗高度减少通常意味着虚拟键盘出现
      if (this.isMobileOrTablet && this.focusedInput) {
        const currentHeight = window.innerHeight
        const screenHeight = window.screen.height
        
        // 如果当前高度明显小于屏幕高度，认为键盘已显示
        this.isKeyboardVisible = currentHeight < screenHeight * 0.75
        this.$store.dispatch('SetKeyboardVisible', this.isKeyboardVisible)
      }
    },
    
    /**
     * 判断是否为输入元素
     */
    isInputElement(element) {
      const inputTypes = ['input', 'textarea', 'select']
      const tagName = element.tagName.toLowerCase()
      
      return inputTypes.includes(tagName) || 
             element.contentEditable === 'true' ||
             element.classList.contains('el-input__inner') ||
             element.classList.contains('el-textarea__inner')
    },
    
    /**
     * 滚动到输入框
     */
    scrollToInput(inputElement) {
      if (!inputElement) return
      
      const rect = inputElement.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const keyboardHeight = viewportHeight * 0.4 // 估算键盘高度
      
      // 如果输入框被键盘遮挡，滚动页面
      if (rect.bottom > viewportHeight - keyboardHeight) {
        const scrollOffset = rect.bottom - (viewportHeight - keyboardHeight) + 20
        window.scrollBy(0, scrollOffset)
      }
    },
    
    /**
     * 处理取消
     */
    handleCancel() {
      this.$emit('cancel')
    },
    
    /**
     * 处理提交
     */
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$emit('submit', this.formData)
        } else {
          this.$emit('validate-failed')
          return false
        }
      })
    },
    
    /**
     * 验证表单
     */
    validate(callback) {
      return this.$refs.form.validate(callback)
    },
    
    /**
     * 验证指定字段
     */
    validateField(props, callback) {
      return this.$refs.form.validateField(props, callback)
    },
    
    /**
     * 重置表单
     */
    resetFields() {
      this.$refs.form.resetFields()
    },
    
    /**
     * 清空验证信息
     */
    clearValidate(props) {
      this.$refs.form.clearValidate(props)
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/responsive-mixins.scss';

.mobile-form-wrapper {
  width: 100%;
  
  .mobile-form {
    @include mobile-device {
      // 移动端表单样式优化
      ::v-deep .el-form-item {
        margin-bottom: $mobile-spacing-lg;
        
        .el-form-item__label {
          @include responsive-font-size($mobile-font-md, $desktop-font-sm);
          color: $text-color-primary;
          font-weight: 500;
          margin-bottom: $mobile-spacing-xs;
          line-height: $line-height-normal;
          
          // 移动端标签在上方时的样式
          &.el-form-item__label--top {
            padding: 0 0 $mobile-spacing-xs 0;
          }
        }
        
        .el-form-item__content {
          line-height: normal;
          
          .el-form-item__error {
            @include responsive-font-size($mobile-font-sm, $desktop-font-xs);
            padding-top: $mobile-spacing-xs;
            color: $danger-color;
          }
        }
      }
      
      // 输入框优化
      ::v-deep .el-input {
        .el-input__inner {
          @include touch-target($touch-target-comfortable);
          @include responsive-border-radius($mobile-border-radius-base, $border-radius-base);
          @include responsive-font-size($mobile-font-md, $desktop-font-md);
          
          padding: $mobile-spacing-md;
          border: 2px solid $border-color-base;
          transition: all $transition-normal;
          
          &:focus {
            border-color: $primary-color;
            box-shadow: 0 0 0 2px rgba($primary-color, 0.1);
          }
          
          &::placeholder {
            color: $text-color-placeholder;
            @include responsive-font-size($mobile-font-sm, $desktop-font-sm);
          }
        }
        
        // 输入框图标优化
        .el-input__icon {
          @include touch-target();
          line-height: $touch-target-comfortable;
        }
      }
      
      // 文本域优化
      ::v-deep .el-textarea {
        .el-textarea__inner {
          @include responsive-border-radius($mobile-border-radius-base, $border-radius-base);
          @include responsive-font-size($mobile-font-md, $desktop-font-md);
          
          padding: $mobile-spacing-md;
          border: 2px solid $border-color-base;
          line-height: $line-height-relaxed;
          min-height: 120px;
          
          &:focus {
            border-color: $primary-color;
            box-shadow: 0 0 0 2px rgba($primary-color, 0.1);
          }
        }
      }
      
      // 选择器优化
      ::v-deep .el-select {
        width: 100%;
        
        .el-input__inner {
          @include touch-target($touch-target-comfortable);
          cursor: pointer;
        }
        
        .el-select__caret {
          @include touch-target();
        }
      }
      
      // 日期选择器优化
      ::v-deep .el-date-editor {
        width: 100%;
        
        .el-input__inner {
          @include touch-target($touch-target-comfortable);
        }
      }
      
      // 单选框和复选框优化
      ::v-deep .el-radio,
      ::v-deep .el-checkbox {
        @include touch-target();
        margin-right: $mobile-spacing-lg;
        margin-bottom: $mobile-spacing-sm;
        
        .el-radio__input,
        .el-checkbox__input {
          .el-radio__inner,
          .el-checkbox__inner {
            width: 20px;
            height: 20px;
            
            &:after {
              width: 6px;
              height: 6px;
            }
          }
        }
        
        .el-radio__label,
        .el-checkbox__label {
          @include responsive-font-size($mobile-font-md, $desktop-font-sm);
          padding-left: $mobile-spacing-sm;
        }
      }
      
      // 开关优化
      ::v-deep .el-switch {
        @include touch-target();
        
        .el-switch__core {
          width: 50px;
          height: 24px;
          
          &:after {
            width: 20px;
            height: 20px;
          }
        }
      }
      
      // 滑块优化
      ::v-deep .el-slider {
        .el-slider__runway {
          height: 8px;
          
          .el-slider__button {
            width: 24px;
            height: 24px;
            border-width: 3px;
          }
        }
      }
    }
  }
  
  // 移动端操作栏
  .mobile-form-actions {
    @include responsive-padding($mobile-spacing-lg, $desktop-spacing-md);
    @include flex-space-between();
    
    margin-top: $mobile-spacing-xl;
    border-top: 1px solid $border-color-lighter;
    background-color: $background-color-light;
    
    // 为安全区域适配
    @supports (padding: max(0px)) {
      padding-bottom: max($mobile-spacing-lg, env(safe-area-inset-bottom));
    }
    
    .el-button {
      flex: 1;
      margin: 0 $mobile-spacing-xs;
      @include touch-target($touch-target-comfortable);
      
      &:first-child {
        margin-left: 0;
      }
      
      &:last-child {
        margin-right: 0;
      }
    }
  }
  
  // 键盘占位符
  .keyboard-placeholder {
    height: 300px; // 键盘高度占位
    @include desktop-device {
      display: none;
    }
  }
  
  // 键盘可见时的样式调整
  &.keyboard-visible {
    .mobile-form-actions {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: $z-index-fixed;
      margin-top: 0;
      @include responsive-shadow($mobile-shadow-dark, $shadow-dark);
    }
  }
}

// 全局移动端表单项样式优化
@include mobile-device {
  .el-form--label-top {
    .el-form-item {
      .el-form-item__label {
        float: none;
        display: block;
        text-align: left;
        width: auto !important;
        padding: 0 0 $mobile-spacing-xs 0;
      }
      
      .el-form-item__content {
        margin-left: 0 !important;
      }
    }
  }
}

// 移动端表单验证样式增强
@include mobile-device {
  .el-form-item.is-error {
    .el-input__inner,
    .el-textarea__inner {
      border-color: $danger-color !important;
      box-shadow: 0 0 0 2px rgba($danger-color, 0.1) !important;
    }
  }
  
  .el-form-item.is-success {
    .el-input__inner,
    .el-textarea__inner {
      border-color: $success-color !important;
      box-shadow: 0 0 0 2px rgba($success-color, 0.1) !important;
    }
  }
}
</style>