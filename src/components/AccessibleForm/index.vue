<!--
  无障碍表单组件
  基于Element UI Form，增强了无障碍功能
-->
<template>
  <el-form
    ref=\"form\"
    :model=\"model\"
    :rules=\"rules\"
    v-bind=\"$attrs\"
    v-on=\"$listeners\"
    role=\"form\"
    :aria-label=\"formTitle || '表单'\"
    class=\"accessible-form\"
    @validate=\"handleValidate\">
    
    <!-- 表单标题和描述 -->
    <div v-if=\"formTitle || description\" class=\"form-header\">
      <h2 v-if=\"formTitle\" class=\"form-title\">{{ formTitle }}</h2>
      <p v-if=\"description\" id=\"form-description\" class=\"form-description\">{{ description }}</p>
    </div>
    
    <!-- 错误汇总 -->
    <div v-if=\"showErrorSummary && hasErrors\" 
         class=\"form-error-summary\" 
         role=\"alert\" 
         aria-live=\"assertive\">
      <h3 class=\"error-summary-title\">
        表单包含错误，请检查以下字段：
      </h3>
      <ul class=\"error-summary-list\">
        <li v-for=\"error in errorList\" :key=\"error.field\">
          <a :href=\"'#' + error.field\" @click.prevent=\"focusField(error.field)\">
            {{ error.label }}：{{ error.message }}
          </a>
        </li>
      </ul>
    </div>
    
    <!-- 表单内容 -->
    <div class=\"form-content\">
      <slot></slot>
    </div>
    
    <!-- 表单操作按钮 -->
    <div v-if=\"$slots.actions\" class=\"form-actions\" role=\"group\" aria-label=\"表单操作\">
      <slot name=\"actions\"></slot>
    </div>
  </el-form>
</template>

<script>
import { liveAnnouncer } from '@/utils/accessibility'

export default {
  name: 'AccessibleForm',
  inheritAttrs: false,
  props: {
    model: { type: Object, required: true },
    rules: { type: Object, default: () => ({}) },
    formTitle: { type: String, default: '' },
    description: { type: String, default: '' },
    showErrorSummary: { type: Boolean, default: true },
    fieldLabels: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      errorList: []
    }
  },
  computed: {
    hasErrors() {
      return this.errorList.length > 0
    }
  },
  methods: {
    handleValidate(prop, isValid, message) {
      if (isValid) {
        this.errorList = this.errorList.filter(error => error.field !== prop)
      } else {
        const errorItem = {
          field: prop,
          label: this.fieldLabels[prop] || prop,
          message: message
        }
        const existingIndex = this.errorList.findIndex(error => error.field === prop)
        if (existingIndex >= 0) {
          this.errorList.splice(existingIndex, 1, errorItem)
        } else {
          this.errorList.push(errorItem)
        }
        liveAnnouncer.announceUrgent(`${errorItem.label}：${message}`)
      }
    },
    focusField(fieldName) {
      const field = this.$el.querySelector(`[prop=\"${fieldName}\"] input`)
      if (field) {
        field.focus()
      }
    },
    validate(callback) {
      return this.$refs.form.validate(callback)
    },
    resetFields() {
      this.$refs.form.resetFields()
      this.errorList = []
      liveAnnouncer.announce('表单已重置')
    }
  }
}
</script>

<style scoped>
.form-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.form-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.form-error-summary {
  background-color: #fef0f0;
  border: 1px solid #f56c6c;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 24px;
}

.error-summary-title {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #f56c6c;
}

.error-summary-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.error-summary-list a {
  color: #f56c6c;
  text-decoration: underline;
}

.form-actions {
  border-top: 1px solid #ebeef5;
  padding-top: 16px;
  text-align: right;
}
</style>