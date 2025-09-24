<template>
  <div class="xss-protection">
    <!-- 安全输入框组件 -->
    <component
      :is="componentType"
      v-model="sanitizedValue"
      v-bind="$attrs"
      v-on="$listeners"
      :placeholder="placeholder"
      :disabled="disabled || processing"
      @input="handleInput"
      @change="handleChange"
      @blur="handleBlur"
      class="xss-protected-input"
    />
    
    <!-- 安全状态指示 -->
    <div v-if="showSecurityStatus" class="xss-status" :class="statusClass">
      <i :class="statusIcon"></i>
      <span class="status-text">{{ statusText }}</span>
    </div>
    
    <!-- 威胁检测警告 -->
    <div v-if="threatDetected && showThreatWarning" class="threat-warning">
      <i class="el-icon-warning"></i>
      <span>检测到潜在的安全威胁内容，已自动过滤</span>
      <el-button
        type="text"
        size="mini"
        @click="showThreatDetails = !showThreatDetails"
      >
        详情
      </el-button>
    </div>
    
    <!-- 威胁详情 -->
    <el-collapse-transition>
      <div v-show="showThreatDetails" class="threat-details">
        <div class="threat-info">
          <h4>检测到的威胁:</h4>
          <ul>
            <li v-for="threat in detectedThreats" :key="threat.type">
              <strong>{{ threat.name }}:</strong> {{ threat.description }}
            </li>
          </ul>
        </div>
        <div class="threat-actions">
          <el-button size="mini" @click="restoreOriginalValue">
            恢复原始内容
          </el-button>
          <el-button size="mini" type="primary" @click="acceptSanitizedValue">
            接受过滤后内容
          </el-button>
        </div>
      </div>
    </el-collapse-transition>
  </div>
</template>

<script>
/**
 * XSS防护组件
 * 提供输入内容的XSS防护和净化功能
 */
export default {
  name: 'XSSProtection',
  
  props: {
    // 输入值
    value: {
      type: [String, Number],
      default: ''
    },
    
    // 组件类型
    componentType: {
      type: String,
      default: 'el-input'
    },
    
    // 防护级别
    protectionLevel: {
      type: String,
      default: 'medium', // strict, medium, loose
      validator: value => ['strict', 'medium', 'loose'].includes(value)
    },
    
    // 是否启用实时检测
    realTimeDetection: {
      type: Boolean,
      default: true
    },
    
    // 是否显示安全状态
    showSecurityStatus: {
      type: Boolean,
      default: true
    },
    
    // 是否显示威胁警告
    showThreatWarning: {
      type: Boolean,
      default: true
    },
    
    // 是否自动净化
    autoSanitize: {
      type: Boolean,
      default: true
    },
    
    // 自定义净化规则
    customRules: {
      type: Array,
      default: () => []
    },
    
    // 白名单标签
    allowedTags: {
      type: Array,
      default: () => []
    },
    
    // 白名单属性
    allowedAttributes: {
      type: Array,
      default: () => []
    },
    
    // 占位符
    placeholder: {
      type: String,
      default: ''
    },
    
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      sanitizedValue: '',
      originalValue: '',
      processing: false,
      threatDetected: false,
      detectedThreats: [],
      showThreatDetails: false,
      debounceTimer: null
    }
  },
  
  computed: {
    statusClass() {
      if (this.threatDetected) {
        return 'xss-status--danger'
      } else if (this.sanitizedValue !== this.originalValue) {
        return 'xss-status--warning'
      } else {
        return 'xss-status--safe'
      }
    },
    
    statusIcon() {
      if (this.threatDetected) {
        return 'el-icon-close'
      } else if (this.sanitizedValue !== this.originalValue) {
        return 'el-icon-warning'
      } else {
        return 'el-icon-check'
      }
    },
    
    statusText() {
      if (this.threatDetected) {
        return '检测到威胁'
      } else if (this.sanitizedValue !== this.originalValue) {
        return '内容已过滤'
      } else {
        return '内容安全'
      }
    },
    
    protectionRules() {
      return this.getProtectionRules()
    }
  },
  
  watch: {
    value: {
      handler(newValue) {
        if (newValue !== this.sanitizedValue) {
          this.originalValue = newValue
          this.processSecurity(newValue)
        }
      },
      immediate: true
    }
  },
  
  methods: {
    handleInput(value) {
      this.originalValue = value
      
      if (this.realTimeDetection) {
        // 使用防抖处理实时检测
        clearTimeout(this.debounceTimer)
        this.debounceTimer = setTimeout(() => {
          this.processSecurity(value)
        }, 300)
      } else {
        this.sanitizedValue = value
      }
      
      this.$emit('input', this.sanitizedValue)
    },
    
    handleChange(value) {
      if (!this.realTimeDetection) {
        this.processSecurity(value)
      }
      this.$emit('change', this.sanitizedValue)
    },
    
    handleBlur(event) {
      // 确保在失焦时进行最终检测
      this.processSecurity(this.originalValue)
      this.$emit('blur', event)
    },
    
    async processSecurity(value) {
      if (!value || typeof value !== 'string') {
        this.sanitizedValue = value
        this.resetThreatStatus()
        return
      }
      
      try {
        this.processing = true
        
        // 检测威胁
        const threats = this.detectThreats(value)
        this.detectedThreats = threats
        this.threatDetected = threats.length > 0
        
        // 净化内容
        if (this.autoSanitize || this.threatDetected) {
          this.sanitizedValue = this.sanitizeContent(value)
        } else {
          this.sanitizedValue = value
        }
        
        // 触发事件
        if (this.threatDetected) {
          this.$emit('threat-detected', {
            original: value,
            sanitized: this.sanitizedValue,
            threats: threats
          })
        }
        
        this.$emit('security-processed', {
          original: value,
          sanitized: this.sanitizedValue,
          threats: threats,
          safe: !this.threatDetected
        })
        
      } catch (error) {
        console.error('XSS protection processing failed:', error)
        this.sanitizedValue = value
        this.$emit('error', error)
      } finally {
        this.processing = false
      }
    },
    
    detectThreats(content) {
      const threats = []
      const rules = this.protectionRules
      
      rules.forEach(rule => {
        if (rule.pattern.test(content)) {
          threats.push({
            type: rule.type,
            name: rule.name,
            description: rule.description,
            pattern: rule.pattern,
            matches: content.match(rule.pattern)
          })
        }
      })
      
      return threats
    },
    
    sanitizeContent(content) {
      let sanitized = content
      const rules = this.protectionRules
      
      // 应用净化规则
      rules.forEach(rule => {
        if (rule.sanitize) {
          sanitized = sanitized.replace(rule.pattern, rule.replacement || '')
        }
      })
      
      // 应用自定义规则
      this.customRules.forEach(rule => {
        if (rule.pattern && rule.replacement !== undefined) {
          sanitized = sanitized.replace(rule.pattern, rule.replacement)
        }
      })
      
      // 白名单处理
      if (this.allowedTags.length > 0 || this.allowedAttributes.length > 0) {
        sanitized = this.applyWhitelist(sanitized)
      }
      
      return sanitized
    },
    
    applyWhitelist(content) {
      // 简单的白名单实现
      let result = content
      
      if (this.allowedTags.length === 0) {
        // 如果没有允许的标签，移除所有HTML标签
        result = result.replace(/<[^>]*>/g, '')
      } else {
        // 只保留允许的标签
        const allowedTagsPattern = new RegExp(
          `<(?!/?(?:${this.allowedTags.join('|')})\\b)[^>]*>`,
          'gi'
        )
        result = result.replace(allowedTagsPattern, '')
      }
      
      return result
    },
    
    getProtectionRules() {
      const baseRules = {
        strict: [
          {
            type: 'script',
            name: 'Script标签',
            description: '可执行的JavaScript代码',
            pattern: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            sanitize: true,
            replacement: ''
          },
          {
            type: 'javascript',
            name: 'JavaScript协议',
            description: 'JavaScript伪协议',
            pattern: /javascript:/gi,
            sanitize: true,
            replacement: ''
          },
          {
            type: 'event',
            name: '事件处理器',
            description: 'HTML事件处理属性',
            pattern: /on\w+\s*=/gi,
            sanitize: true,
            replacement: ''
          },
          {
            type: 'iframe',
            name: 'iframe标签',
            description: '可能嵌入恶意内容的iframe',
            pattern: /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
            sanitize: true,
            replacement: ''
          },
          {
            type: 'object',
            name: 'Object标签',
            description: '可能包含恶意内容的object标签',
            pattern: /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
            sanitize: true,
            replacement: ''
          },
          {
            type: 'embed',
            name: 'Embed标签',
            description: '可能包含恶意内容的embed标签',
            pattern: /<embed\b[^>]*>/gi,
            sanitize: true,
            replacement: ''
          }
        ],
        
        medium: [
          {
            type: 'script',
            name: 'Script标签',
            description: '可执行的JavaScript代码',
            pattern: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            sanitize: true,
            replacement: ''
          },
          {
            type: 'javascript',
            name: 'JavaScript协议',
            description: 'JavaScript伪协议',
            pattern: /javascript:/gi,
            sanitize: true,
            replacement: ''
          },
          {
            type: 'event',
            name: '事件处理器',
            description: 'HTML事件处理属性',
            pattern: /on\w+\s*=/gi,
            sanitize: true,
            replacement: ''
          }
        ],
        
        loose: [
          {
            type: 'script',
            name: 'Script标签',
            description: '可执行的JavaScript代码',
            pattern: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            sanitize: true,
            replacement: ''
          }
        ]
      }
      
      return baseRules[this.protectionLevel] || baseRules.medium
    },
    
    resetThreatStatus() {
      this.threatDetected = false
      this.detectedThreats = []
      this.showThreatDetails = false
    },
    
    restoreOriginalValue() {
      this.sanitizedValue = this.originalValue
      this.showThreatDetails = false
      this.$emit('input', this.sanitizedValue)
    },
    
    acceptSanitizedValue() {
      this.originalValue = this.sanitizedValue
      this.resetThreatStatus()
      this.showThreatDetails = false
      this.$emit('input', this.sanitizedValue)
    },
    
    // 公开方法
    forceCheck() {
      this.processSecurity(this.originalValue)
    },
    
    getSanitizedValue() {
      return this.sanitizedValue
    },
    
    getOriginalValue() {
      return this.originalValue
    },
    
    getDetectedThreats() {
      return this.detectedThreats
    }
  }
}
</script>

<style scoped>
.xss-protection {
  position: relative;
}

.xss-protected-input {
  width: 100%;
}

.xss-status {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 5px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.xss-status--safe {
  color: #52c41a;
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
}

.xss-status--warning {
  color: #fa8c16;
  background-color: #fffbf0;
  border: 1px solid #ffe7ba;
}

.xss-status--danger {
  color: #f5222d;
  background-color: #fff1f0;
  border: 1px solid #ffccc7;
}

.threat-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #fff1f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
  color: #f5222d;
  font-size: 13px;
}

.threat-details {
  margin-top: 10px;
  padding: 12px;
  background-color: #fafafa;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.threat-info h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #262626;
}

.threat-info ul {
  margin: 0;
  padding-left: 20px;
}

.threat-info li {
  margin-bottom: 4px;
  font-size: 12px;
  color: #595959;
}

.threat-actions {
  margin-top: 12px;
  text-align: right;
}

.status-text {
  font-weight: 500;
}
</style>