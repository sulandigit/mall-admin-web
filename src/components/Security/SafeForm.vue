<template>
  <el-form
    :model="formData"
    :rules="mergedRules"
    :ref="formRef"
    :validate-on-rule-change="false"
    @validate="handleValidate"
    @submit.native.prevent="handleSubmit"
    v-bind="$attrs"
    v-on="$listeners"
    class="safe-form"
  >
    <!-- CSRF隐藏字段 -->
    <input
      v-if="csrfToken"
      type="hidden"
      name="_csrf"
      :value="csrfToken"
    />
    
    <!-- 表单内容插槽 -->
    <slot :form-data="formData" :csrf-token="csrfToken" :submit="safeSubmit" />
    
    <!-- 默认提交按钮（如果没有自定义按钮） -->
    <el-form-item v-if="showDefaultSubmit" class="submit-buttons">
      <el-button
        type="primary"
        :loading="submitting"
        :disabled="!isFormValid || !csrfToken"
        @click="safeSubmit"
      >
        {{ submitText }}
      </el-button>
      <el-button v-if="showCancel" @click="handleCancel">
        {{ cancelText }}
      </el-button>
    </el-form-item>
    
    <!-- 安全状态指示器 -->
    <div v-if="showSecurityStatus" class="security-status">
      <div class="security-indicator" :class="securityStatusClass">
        <i class="el-icon-shield"></i>
        <span>{{ securityStatusText }}</span>
      </div>
    </div>
  </el-form>
</template>

<script>
import { mapGetters } from 'vuex'
import { createSecureFormData, getCSRFToken } from '@/security'

export default {
  name: 'SafeForm',
  
  props: {
    // 表单数据
    modelValue: {
      type: Object,
      default: () => ({})
    },
    
    // 表单验证规则
    rules: {
      type: Object,
      default: () => ({})
    },
    
    // 是否启用CSRF保护
    csrfProtection: {
      type: Boolean,
      default: true
    },
    
    // 是否启用XSS防护
    xssProtection: {
      type: Boolean,
      default: true
    },
    
    // 自动提交表单
    autoSubmit: {
      type: Boolean,
      default: false
    },
    
    // 提交时的回调函数
    onSubmit: {
      type: Function,
      required: true
    },
    
    // 提交前的验证函数
    beforeSubmit: {
      type: Function,
      default: null
    },
    
    // 提交后的回调函数
    afterSubmit: {
      type: Function,
      default: null
    },
    
    // 错误处理函数
    onError: {
      type: Function,
      default: null
    },
    
    // 是否显示默认提交按钮
    showDefaultSubmit: {
      type: Boolean,
      default: true
    },
    
    // 是否显示取消按钮
    showCancel: {
      type: Boolean,
      default: false
    },
    
    // 提交按钮文本
    submitText: {
      type: String,
      default: '提交'
    },
    
    // 取消按钮文本
    cancelText: {
      type: String,
      default: '取消'
    },
    
    // 是否显示安全状态
    showSecurityStatus: {
      type: Boolean,
      default: false
    },
    
    // 最大重试次数
    maxRetries: {
      type: Number,
      default: 3
    }
  },
  
  data() {
    return {
      formData: { ...this.modelValue },
      csrfToken: null,
      submitting: false,
      isFormValid: false,
      validationErrors: {},
      retryCount: 0,
      securityChecks: {
        csrf: false,
        xss: false,
        validation: false
      }
    }
  },
  
  computed: {
    ...mapGetters(['csrfEnabled', 'csrfInitialized']),
    
    formRef() {
      return `safeForm_${this._uid}`
    },
    
    mergedRules() {
      // 合并基础安全规则和用户自定义规则
      const securityRules = this.generateSecurityRules()
      return {
        ...securityRules,
        ...this.rules
      }
    },
    
    securityStatusClass() {
      const checks = this.securityChecks
      if (checks.csrf && checks.xss && checks.validation) {
        return 'security-status--safe'
      } else if (checks.csrf || checks.xss || checks.validation) {
        return 'security-status--warning'
      } else {
        return 'security-status--danger'
      }
    },
    
    securityStatusText() {
      const checks = this.securityChecks
      if (checks.csrf && checks.xss && checks.validation) {
        return '安全防护已启用'
      } else {
        return '安全检查进行中...'
      }
    }
  },
  
  watch: {
    modelValue: {
      handler(newValue) {
        this.formData = { ...newValue }
      },
      deep: true
    },
    
    csrfEnabled: {
      handler(enabled) {
        if (enabled && this.csrfProtection) {
          this.initCSRFToken()
        }
      },
      immediate: true
    }
  },
  
  created() {
    this.init()
  },
  
  methods: {
    async init() {
      try {
        // 初始化CSRF令牌
        if (this.csrfProtection && this.csrfEnabled) {
          await this.initCSRFToken()
        }
        
        // 初始化安全检查
        this.performSecurityChecks()
        
        // 初始化表单验证
        this.$nextTick(() => {
          this.validateForm()
        })
      } catch (error) {
        console.error('Failed to initialize SafeForm:', error)
        this.handleError(error)
      }
    },
    
    async initCSRFToken() {
      try {
        if (!this.csrfInitialized) {
          await this.$store.dispatch('csrf/initCSRF')
        }
        
        this.csrfToken = await getCSRFToken()
        this.securityChecks.csrf = true
        
        console.info('CSRF token initialized for SafeForm')
      } catch (error) {
        console.error('Failed to initialize CSRF token:', error)
        this.securityChecks.csrf = false
        
        if (this.onError) {
          this.onError(error)
        }
      }
    },
    
    performSecurityChecks() {
      // CSRF检查
      this.securityChecks.csrf = !this.csrfProtection || !!this.csrfToken
      
      // XSS防护检查
      this.securityChecks.xss = !this.xssProtection || this.validateXSS()
      
      // 基础验证检查
      this.securityChecks.validation = true
    },
    
    validateXSS() {
      // 简单的XSS检查
      const dangerousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi
      ]
      
      const formString = JSON.stringify(this.formData)
      return !dangerousPatterns.some(pattern => pattern.test(formString))
    },
    
    generateSecurityRules() {
      const rules = {}
      
      if (this.xssProtection) {
        // 为所有字符串字段添加XSS验证规则
        Object.keys(this.formData).forEach(key => {
          if (typeof this.formData[key] === 'string') {
            rules[key] = rules[key] || []
            rules[key].push({
              validator: this.validateXSSField,
              message: '输入内容包含不安全字符，请检查',
              trigger: 'change'
            })
          }
        })
      }
      
      return rules
    },
    
    validateXSSField(rule, value, callback) {
      if (!value) {
        callback()
        return
      }
      
      const dangerousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe/gi,
        /<object/gi,
        /<embed/gi
      ]
      
      const hasDangerousContent = dangerousPatterns.some(pattern => 
        pattern.test(value)
      )
      
      if (hasDangerousContent) {
        callback(new Error('输入内容包含潜在的安全风险'))
      } else {
        callback()
      }
    },
    
    handleValidate(prop, isValid, message) {
      if (isValid) {
        delete this.validationErrors[prop]
      } else {
        this.validationErrors[prop] = message
      }
      
      this.isFormValid = Object.keys(this.validationErrors).length === 0
      this.securityChecks.validation = this.isFormValid
    },
    
    async validateForm() {
      return new Promise((resolve) => {
        this.$refs[this.formRef].validate((valid) => {
          this.isFormValid = valid
          this.securityChecks.validation = valid
          resolve(valid)
        })
      })
    },
    
    async handleSubmit(event) {
      event.preventDefault()
      return this.safeSubmit()
    },
    
    async safeSubmit() {
      if (this.submitting) {
        return false
      }
      
      try {
        this.submitting = true
        
        // 表单验证
        const isValid = await this.validateForm()
        if (!isValid) {
          throw new Error('表单验证失败')
        }
        
        // 前置检查
        if (this.beforeSubmit) {
          const canSubmit = await this.beforeSubmit(this.formData)
          if (canSubmit === false) {
            return false
          }
        }
        
        // 准备安全的表单数据
        const secureData = await this.prepareSecureData()
        
        // 提交表单
        const result = await this.onSubmit(secureData)
        
        // 后置处理
        if (this.afterSubmit) {
          await this.afterSubmit(result, secureData)
        }
        
        // 触发成功事件
        this.$emit('submit-success', result)
        
        // 重置重试计数
        this.retryCount = 0
        
        return result
      } catch (error) {
        console.error('Form submission failed:', error)
        
        // 处理CSRF错误
        if (error.isCSRFError && this.retryCount < this.maxRetries) {
          return this.retrySubmit(error)
        }
        
        this.handleError(error)
        this.$emit('submit-error', error)
        
        return false
      } finally {
        this.submitting = false
      }
    },
    
    async prepareSecureData() {
      let data = { ...this.formData }
      
      // 添加CSRF令牌
      if (this.csrfProtection && this.csrfToken) {
        data = await createSecureFormData(data)
      }
      
      // XSS防护 - 清理数据
      if (this.xssProtection) {
        data = this.sanitizeData(data)
      }
      
      return data
    },
    
    sanitizeData(data) {
      const sanitized = {}
      
      Object.keys(data).forEach(key => {
        let value = data[key]
        
        if (typeof value === 'string') {
          // 基本的HTML标签清理
          value = value
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
        }
        
        sanitized[key] = value
      })
      
      return sanitized
    },
    
    async retrySubmit(error) {
      try {
        this.retryCount++
        console.warn(`Retrying form submission (attempt ${this.retryCount})`, error)
        
        // 刷新CSRF令牌
        if (error.isCSRFError) {
          await this.initCSRFToken()
        }
        
        // 重新提交
        return this.safeSubmit()
      } catch (retryError) {
        console.error('Retry submission failed:', retryError)
        throw retryError
      }
    },
    
    handleError(error) {
      if (this.onError) {
        this.onError(error)
      } else {
        this.$message.error(error.message || '提交失败，请重试')
      }
    },
    
    handleCancel() {
      this.$emit('cancel')
    },
    
    // 公开方法
    validate() {
      return this.validateForm()
    },
    
    resetForm() {
      this.$refs[this.formRef].resetFields()
      this.formData = { ...this.modelValue }
      this.validationErrors = {}
      this.isFormValid = false
    },
    
    clearValidation() {
      this.$refs[this.formRef].clearValidate()
      this.validationErrors = {}
    }
  }
}
</script>

<style scoped>
.safe-form {
  position: relative;
}

.submit-buttons {
  margin-top: 20px;
  text-align: center;
}

.security-status {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
}

.security-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
}

.security-status--safe {
  background-color: #f0f9ff;
  color: #1890ff;
  border: 1px solid #d9ecff;
}

.security-status--warning {
  background-color: #fffbf0;
  color: #fa8c16;
  border: 1px solid #ffe7ba;
}

.security-status--danger {
  background-color: #fff1f0;
  color: #f5222d;
  border: 1px solid #ffccc7;
}

.safe-form .el-form-item:last-child {
  margin-bottom: 0;
}
</style>