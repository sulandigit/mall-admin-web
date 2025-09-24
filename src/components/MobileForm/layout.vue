/**
 * 移动端表单布局组件
 * 提供响应式表单布局和分步表单支持
 */

<template>
  <div class="mobile-form-layout" :class="layoutClass">
    <!-- 表单标题 -->
    <div v-if="title" class="form-header">
      <h2 class="form-title">{{ title }}</h2>
      <p v-if="description" class="form-description">{{ description }}</p>
    </div>
    
    <!-- 步骤指示器 -->
    <div v-if="showSteps && steps.length > 1" class="form-steps">
      <el-steps 
        :active="currentStep" 
        :direction="stepsDirection"
        :simple="isMobile"
        finish-status="success"
      >
        <el-step 
          v-for="(step, index) in steps"
          :key="index"
          :title="step.title"
          :description="step.description"
        ></el-step>
      </el-steps>
    </div>
    
    <!-- 表单内容 -->
    <div class="form-content">
      <!-- 单步表单 -->
      <mobile-form
        v-if="!showSteps"
        v-bind="formProps"
        v-on="formListeners"
        :show-actions="showFormActions"
      >
        <slot></slot>
      </mobile-form>
      
      <!-- 多步表单 -->
      <template v-else>
        <mobile-form
          v-for="(step, index) in steps"
          v-show="currentStep === index"
          :key="index"
          v-bind="formProps"
          v-on="formListeners"
          :show-actions="false"
          :ref="`form${index}`"
        >
          <slot :name="`step${index}`" :step="step" :index="index">
            <!-- 默认步骤内容 -->
            <div class="step-content">
              <component 
                v-if="step.component" 
                :is="step.component" 
                v-bind="step.props"
              ></component>
            </div>
          </slot>
        </mobile-form>
        
        <!-- 多步表单操作栏 -->
        <div class="steps-actions">
          <el-button
            v-if="currentStep > 0"
            :size="actionButtonSize"
            @click="prevStep"
          >
            上一步
          </el-button>
          
          <el-button
            v-if="currentStep < steps.length - 1"
            :size="actionButtonSize"
            type="primary"
            @click="nextStep"
          >
            下一步
          </el-button>
          
          <el-button
            v-if="currentStep === steps.length - 1"
            :size="actionButtonSize"
            type="primary"
            :loading="submitLoading"
            @click="handleSubmit"
          >
            {{ submitText }}
          </el-button>
          
          <el-button
            v-if="showCancel"
            :size="actionButtonSize"
            @click="handleCancel"
          >
            取消
          </el-button>
        </div>
      </template>
    </div>
    
    <!-- 表单底部信息 -->
    <div v-if="footerText" class="form-footer">
      <p class="footer-text">{{ footerText }}</p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import MobileForm from './index.vue'

export default {
  name: 'MobileFormLayout',
  components: {
    MobileForm
  },
  props: {
    // 表单标题
    title: {
      type: String,
      default: ''
    },
    
    // 表单描述
    description: {
      type: String,
      default: ''
    },
    
    // 底部文本
    footerText: {
      type: String,
      default: ''
    },
    
    // 是否显示步骤
    showSteps: {
      type: Boolean,
      default: false
    },
    
    // 步骤配置
    steps: {
      type: Array,
      default: () => []
    },
    
    // 当前步骤
    value: {
      type: Number,
      default: 0
    },
    
    // 表单属性
    formProps: {
      type: Object,
      default: () => ({})
    },
    
    // 是否显示表单操作按钮
    showFormActions: {
      type: Boolean,
      default: true
    },
    
    // 是否显示取消按钮
    showCancel: {
      type: Boolean,
      default: true
    },
    
    // 提交按钮文本
    submitText: {
      type: String,
      default: '提交'
    },
    
    // 提交加载状态
    submitLoading: {
      type: Boolean,
      default: false
    },
    
    // 布局模式
    layout: {
      type: String,
      default: 'default', // default, card, modal
      validator: value => ['default', 'card', 'modal'].includes(value)
    }
  },
  
  data() {
    return {
      currentStep: this.value
    }
  },
  
  computed: {
    ...mapGetters(['isMobile', 'isTablet', 'isMobileOrTablet']),
    
    /**
     * 布局样式类
     */
    layoutClass() {
      return {
        [`layout-${this.layout}`]: true,
        'mobile-device': this.isMobileOrTablet,
        'multi-step': this.showSteps
      }
    },
    
    /**
     * 步骤方向
     */
    stepsDirection() {
      return this.isMobile ? 'vertical' : 'horizontal'
    },
    
    /**
     * 操作按钮尺寸
     */
    actionButtonSize() {
      return this.isMobile ? 'medium' : 'small'
    },
    
    /**
     * 表单事件监听器
     */
    formListeners() {
      return {
        ...this.$listeners,
        submit: this.handleFormSubmit,
        cancel: this.handleFormCancel
      }
    }
  },
  
  watch: {
    value(newVal) {
      this.currentStep = newVal
    },
    
    currentStep(newVal) {
      this.$emit('input', newVal)
      this.$emit('step-change', newVal)
    }
  },
  
  methods: {
    /**
     * 上一步
     */
    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--
      }
    },
    
    /**
     * 下一步
     */
    nextStep() {
      if (!this.showSteps) return
      
      // 验证当前步骤
      const currentForm = this.$refs[`form${this.currentStep}`]
      if (currentForm && currentForm[0]) {
        currentForm[0].validate((valid) => {
          if (valid) {
            if (this.currentStep < this.steps.length - 1) {
              this.currentStep++
            }
          } else {
            this.$message.error('请完善当前步骤的信息')
          }
        })
      } else {
        if (this.currentStep < this.steps.length - 1) {
          this.currentStep++
        }
      }
    },
    
    /**
     * 跳转到指定步骤
     */
    goToStep(step) {
      if (step >= 0 && step < this.steps.length) {
        this.currentStep = step
      }
    },
    
    /**
     * 处理表单提交
     */
    handleFormSubmit(data) {
      this.$emit('submit', data)
    },
    
    /**
     * 处理表单取消
     */
    handleFormCancel() {
      this.$emit('cancel')
    },
    
    /**
     * 处理最终提交
     */
    handleSubmit() {
      if (this.showSteps) {
        // 验证所有步骤
        this.validateAllSteps((valid) => {
          if (valid) {
            this.$emit('submit', this.getAllFormData())
          } else {
            this.$message.error('请检查并完善表单信息')
          }
        })
      } else {
        this.handleFormSubmit()
      }
    },
    
    /**
     * 处理取消
     */
    handleCancel() {
      this.$emit('cancel')
    },
    
    /**
     * 验证所有步骤
     */
    validateAllSteps(callback) {
      const promises = []
      
      for (let i = 0; i < this.steps.length; i++) {
        const formRef = this.$refs[`form${i}`]
        if (formRef && formRef[0]) {
          promises.push(new Promise((resolve) => {
            formRef[0].validate((valid) => {
              resolve({ step: i, valid })
            })
          }))
        }
      }
      
      Promise.all(promises).then((results) => {
        const allValid = results.every(result => result.valid)
        const firstInvalidStep = results.find(result => !result.valid)
        
        if (!allValid && firstInvalidStep) {
          this.currentStep = firstInvalidStep.step
        }
        
        callback(allValid)
      })
    },
    
    /**
     * 获取所有表单数据
     */
    getAllFormData() {
      const data = {}
      
      for (let i = 0; i < this.steps.length; i++) {
        const formRef = this.$refs[`form${i}`]
        if (formRef && formRef[0] && formRef[0].formData) {
          Object.assign(data, formRef[0].formData)
        }
      }
      
      return data
    },
    
    /**
     * 重置所有表单
     */
    resetAllForms() {
      if (this.showSteps) {
        for (let i = 0; i < this.steps.length; i++) {
          const formRef = this.$refs[`form${i}`]
          if (formRef && formRef[0]) {
            formRef[0].resetFields()
          }
        }
      }
      this.currentStep = 0
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/responsive-mixins.scss';

.mobile-form-layout {
  width: 100%;
  
  // 默认布局
  &.layout-default {
    @include responsive-padding($mobile-spacing-md, $desktop-spacing-lg);
  }
  
  // 卡片布局
  &.layout-card {
    @include card-style();
    @include responsive-margin($mobile-spacing-md, $desktop-spacing-lg);
  }
  
  // 模态框布局
  &.layout-modal {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  // 表单头部
  .form-header {
    margin-bottom: $mobile-spacing-lg;
    text-align: center;
    
    @include tablet-up {
      text-align: left;
    }
    
    .form-title {
      @include title-font(2);
      margin: 0 0 $mobile-spacing-sm 0;
      color: $text-color-primary;
    }
    
    .form-description {
      @include responsive-font-size($mobile-font-md, $desktop-font-md);
      color: $text-color-secondary;
      margin: 0;
      line-height: $line-height-relaxed;
    }
  }
  
  // 步骤指示器
  .form-steps {
    margin-bottom: $mobile-spacing-xl;
    
    @include mobile-device {
      ::v-deep .el-steps {
        &.el-steps--vertical {
          .el-step {
            .el-step__head {
              .el-step__icon {
                width: 32px;
                height: 32px;
                @include responsive-font-size($mobile-font-md, $desktop-font-sm);
              }
            }
            
            .el-step__main {
              .el-step__title {
                @include responsive-font-size($mobile-font-md, $desktop-font-md);
                font-weight: 500;
              }
              
              .el-step__description {
                @include responsive-font-size($mobile-font-sm, $desktop-font-sm);
              }
            }
          }
        }
        
        &.el-steps--simple {
          .el-step {
            .el-step__arrow {
              &::before,
              &::after {
                width: 8px;
                height: 8px;
              }
            }
          }
        }
      }
    }
  }
  
  // 表单内容
  .form-content {
    flex: 1;
    
    .step-content {
      min-height: 200px;
      
      @include mobile-device {
        min-height: 150px;
      }
    }
  }
  
  // 多步表单操作栏
  .steps-actions {
    @include flex-space-between();
    @include responsive-padding($mobile-spacing-lg, $desktop-spacing-md);
    
    margin-top: $mobile-spacing-xl;
    border-top: 1px solid $border-color-lighter;
    
    @include mobile-device {
      flex-wrap: wrap;
      gap: $mobile-spacing-sm;
      
      .el-button {
        flex: 1;
        min-width: 120px;
        @include touch-target($touch-target-comfortable);
      }
    }
    
    @include desktop-device {
      justify-content: flex-end;
      
      .el-button {
        margin-left: $desktop-spacing-sm;
        
        &:first-child {
          margin-left: 0;
        }
      }
    }
  }
  
  // 表单底部
  .form-footer {
    margin-top: $mobile-spacing-lg;
    text-align: center;
    
    .footer-text {
      @include responsive-font-size($mobile-font-sm, $desktop-font-sm);
      color: $text-color-secondary;
      margin: 0;
      line-height: $line-height-relaxed;
    }
  }
  
  // 移动设备特定样式
  &.mobile-device {
    // 多步表单在移动端的优化
    &.multi-step {
      .form-steps {
        background-color: $background-color-base;
        @include responsive-padding($mobile-spacing-md, $desktop-spacing-md);
        @include responsive-margin(-$mobile-spacing-md, -$desktop-spacing-lg);
        margin-bottom: $mobile-spacing-lg;
        @include responsive-border-radius(0, $border-radius-base);
      }
    }
  }
}

// 移动端表单布局响应式优化
@include mobile-device {
  .mobile-form-layout {
    // 在小屏幕上确保表单不会太宽
    max-width: 100%;
    
    // 为虚拟键盘留出空间
    &.keyboard-active {
      padding-bottom: 300px;
    }
  }
}

// 平板端优化
@include tablet-only {
  .mobile-form-layout {
    &.layout-card {
      max-width: 600px;
      margin: $mobile-spacing-lg auto;
    }
  }
}

// 大屏幕优化
@include desktop-large-up {
  .mobile-form-layout {
    &.layout-card {
      max-width: 800px;
    }
  }
}
</style>