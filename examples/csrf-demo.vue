<template>
  <div class="csrf-demo-container">
    <h1>CSRF防护系统演示</h1>
    
    <!-- 系统状态显示 -->
    <el-card class="status-card">
      <div slot="header">
        <span>系统状态</span>
        <el-button 
          style="float: right; padding: 3px 0" 
          type="text" 
          @click="refreshStatus"
        >
          刷新状态
        </el-button>
      </div>
      
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="status-item">
            <span class="status-label">CSRF状态:</span>
            <el-tag :type="csrfStatus.enabled ? 'success' : 'danger'">
              {{ csrfStatus.enabled ? '已启用' : '已禁用' }}
            </el-tag>
          </div>
        </el-col>
        
        <el-col :span="8">
          <div class="status-item">
            <span class="status-label">令牌状态:</span>
            <el-tag :type="hasValidToken ? 'success' : 'warning'">
              {{ hasValidToken ? '有效' : '无效/缺失' }}
            </el-tag>
          </div>
        </el-col>
        
        <el-col :span="8">
          <div class="status-item">
            <span class="status-label">防护策略:</span>
            <el-tag type="info">{{ csrfStatus.strategy }}</el-tag>
          </div>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 10px;">
        <el-col :span="24">
          <div class="status-item">
            <span class="status-label">当前令牌:</span>
            <el-input 
              v-model="currentToken" 
              readonly 
              size="small"
              placeholder="暂无令牌"
            >
              <el-button 
                slot="append" 
                @click="copyToken"
                size="small"
              >
                复制
              </el-button>
            </el-input>
          </div>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 令牌操作 -->
    <el-card class="operation-card">
      <div slot="header">令牌操作</div>
      
      <el-button-group>
        <el-button 
          type="primary" 
          @click="generateToken"
          :loading="generating"
        >
          生成令牌
        </el-button>
        
        <el-button 
          type="warning" 
          @click="refreshToken"
          :loading="refreshing"
        >
          刷新令牌
        </el-button>
        
        <el-button 
          type="danger" 
          @click="clearToken"
          :loading="clearing"
        >
          清除令牌
        </el-button>
        
        <el-button 
          type="info" 
          @click="validateCurrentToken"
          :loading="validating"
        >
          验证令牌
        </el-button>
      </el-button-group>
      
      <div v-if="tokenOperationResult" class="operation-result">
        <h4>操作结果:</h4>
        <pre>{{ tokenOperationResult }}</pre>
      </div>
    </el-card>
    
    <!-- SafeForm演示 -->
    <el-card class="demo-card">
      <div slot="header">SafeForm组件演示</div>
      
      <SafeForm
        :model-value="formData"
        :on-submit="handleSafeFormSubmit"
        :show-security-status="true"
        csrf-protection
        xss-protection
        submit-text="安全提交"
        show-cancel
        @submit-success="onSubmitSuccess"
        @submit-error="onSubmitError"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="formData.username" 
            placeholder="请输入用户名"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input 
            v-model="formData.email" 
            placeholder="请输入邮箱地址"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述信息"
          ></el-input>
        </el-form-item>
      </SafeForm>
    </el-card>
    
    <!-- XSS防护演示 -->
    <el-card class="demo-card">
      <div slot="header">XSS防护组件演示</div>
      
      <el-form label-width="100px">
        <el-form-item label="防护级别:">
          <el-select v-model="xssProtectionLevel" @change="onProtectionLevelChange">
            <el-option label="严格" value="strict"></el-option>
            <el-option label="中等" value="medium"></el-option>
            <el-option label="宽松" value="loose"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="测试输入:">
          <XSSProtection
            v-model="xssTestInput"
            component-type="el-input"
            :protection-level="xssProtectionLevel"
            :show-security-status="true"
            :show-threat-warning="true"
            placeholder="尝试输入一些HTML或JavaScript代码"
            @threat-detected="onThreatDetected"
            @security-processed="onSecurityProcessed"
          />
        </el-form-item>
        
        <el-form-item label="处理结果:">
          <el-input
            v-model="xssProcessedResult"
            type="textarea"
            :rows="3"
            readonly
            placeholder="XSS处理后的结果会显示在这里"
          ></el-input>
        </el-form-item>
      </el-form>
      
      <div class="xss-test-buttons">
        <h4>快速测试用例:</h4>
        <el-button 
          v-for="testCase in xssTestCases" 
          :key="testCase.name"
          size="small"
          @click="applyXSSTestCase(testCase)"
        >
          {{ testCase.name }}
        </el-button>
      </div>
    </el-card>
    
    <!-- API测试 -->
    <el-card class="demo-card">
      <div slot="header">API请求测试</div>
      
      <el-form label-width="100px">
        <el-form-item label="请求URL:">
          <el-input v-model="apiTestUrl" placeholder="/api/test"></el-input>
        </el-form-item>
        
        <el-form-item label="请求方法:">
          <el-select v-model="apiTestMethod">
            <el-option label="GET" value="GET"></el-option>
            <el-option label="POST" value="POST"></el-option>
            <el-option label="PUT" value="PUT"></el-option>
            <el-option label="DELETE" value="DELETE"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="请求数据:">
          <el-input
            v-model="apiTestData"
            type="textarea"
            :rows="3"
            placeholder='{"key": "value"}'
          ></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            @click="sendApiRequest"
            :loading="apiTesting"
          >
            发送请求
          </el-button>
          
          <el-button @click="clearApiResult">清除结果</el-button>
        </el-form-item>
      </el-form>
      
      <div v-if="apiTestResult" class="api-result">
        <h4>请求结果:</h4>
        <pre>{{ apiTestResult }}</pre>
      </div>
    </el-card>
    
    <!-- 日志显示 -->
    <el-card class="log-card">
      <div slot="header">
        <span>操作日志</span>
        <el-button 
          style="float: right; padding: 3px 0" 
          type="text" 
          @click="clearLogs"
        >
          清除日志
        </el-button>
      </div>
      
      <div class="log-container">
        <div 
          v-for="(log, index) in logs" 
          :key="index" 
          :class="['log-entry', 'log-' + log.level]"
        >
          <span class="log-time">{{ log.timestamp }}</span>
          <span class="log-level">{{ log.level.toUpperCase() }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import SafeForm from '@/components/Security/SafeForm'
import XSSProtection from '@/components/Security/XSSProtection'

export default {
  name: 'CSRFDemo',
  
  components: {
    SafeForm,
    XSSProtection
  },
  
  data() {
    return {
      // 状态相关
      csrfStatus: {
        enabled: false,
        strategy: 'unknown'
      },
      currentToken: '',
      
      // 操作状态
      generating: false,
      refreshing: false,
      clearing: false,
      validating: false,
      tokenOperationResult: '',
      
      // 表单数据
      formData: {
        username: '',
        email: '',
        description: ''
      },
      
      // XSS测试相关
      xssProtectionLevel: 'medium',
      xssTestInput: '',
      xssProcessedResult: '',
      xssTestCases: [
        {
          name: 'Script标签',
          input: '<script>alert("XSS")</script>正常文本'
        },
        {
          name: 'JavaScript协议',
          input: '<a href="javascript:alert(\'XSS\')">点击链接</a>'
        },
        {
          name: '事件处理器',
          input: '<img src="x" onerror="alert(\'XSS\')" />'
        },
        {
          name: 'iframe嵌入',
          input: '<iframe src="javascript:alert(\'XSS\')"></iframe>'
        },
        {
          name: '正常内容',
          input: '这是一段正常的文本内容，包含<b>粗体</b>和<i>斜体</i>'
        }
      ],
      
      // API测试相关
      apiTestUrl: '/api/demo/csrf-test',
      apiTestMethod: 'POST',
      apiTestData: '{"message": "Hello CSRF Protection!"}',
      apiTesting: false,
      apiTestResult: '',
      
      // 日志
      logs: []
    }
  },
  
  computed: {
    ...mapGetters(['csrfToken', 'csrfEnabled', 'hasValidCSRFToken']),
    
    hasValidToken() {
      return this.hasValidCSRFToken
    }
  },
  
  created() {
    this.initDemo()
  },
  
  methods: {
    async initDemo() {
      this.addLog('info', 'CSRF防护演示页面已加载')
      await this.refreshStatus()
    },
    
    async refreshStatus() {
      try {
        this.csrfStatus = {
          enabled: this.csrfEnabled,
          strategy: this.$store.getters['csrf/csrfStrategy'] || 'unknown'
        }
        
        this.currentToken = this.csrfToken || ''
        
        this.addLog('info', `状态已刷新: 启用=${this.csrfStatus.enabled}, 策略=${this.csrfStatus.strategy}`)
      } catch (error) {
        this.addLog('error', `状态刷新失败: ${error.message}`)
      }
    },
    
    async generateToken() {
      this.generating = true
      try {
        const token = await this.$csrf.getToken()
        this.currentToken = token
        this.tokenOperationResult = JSON.stringify({
          action: 'generate',
          success: true,
          token: token,
          timestamp: new Date().toISOString()
        }, null, 2)
        
        this.addLog('success', `令牌生成成功: ${token.substring(0, 8)}...`)
      } catch (error) {
        this.tokenOperationResult = JSON.stringify({
          action: 'generate',
          success: false,
          error: error.message
        }, null, 2)
        
        this.addLog('error', `令牌生成失败: ${error.message}`)
      } finally {
        this.generating = false
      }
    },
    
    async refreshToken() {
      this.refreshing = true
      try {
        const newToken = await this.$csrf.refreshToken()
        this.currentToken = newToken
        this.tokenOperationResult = JSON.stringify({
          action: 'refresh',
          success: true,
          newToken: newToken,
          timestamp: new Date().toISOString()
        }, null, 2)
        
        this.addLog('success', `令牌刷新成功: ${newToken.substring(0, 8)}...`)
      } catch (error) {
        this.tokenOperationResult = JSON.stringify({
          action: 'refresh',
          success: false,
          error: error.message
        }, null, 2)
        
        this.addLog('error', `令牌刷新失败: ${error.message}`)
      } finally {
        this.refreshing = false
      }
    },
    
    async clearToken() {
      this.clearing = true
      try {
        await this.$store.dispatch('csrf/clearCSRFToken')
        this.currentToken = ''
        this.tokenOperationResult = JSON.stringify({
          action: 'clear',
          success: true,
          timestamp: new Date().toISOString()
        }, null, 2)
        
        this.addLog('success', '令牌已清除')
      } catch (error) {
        this.tokenOperationResult = JSON.stringify({
          action: 'clear',
          success: false,
          error: error.message
        }, null, 2)
        
        this.addLog('error', `令牌清除失败: ${error.message}`)
      } finally {
        this.clearing = false
      }
    },
    
    async validateCurrentToken() {
      this.validating = true
      try {
        const result = await this.$csrf.validateToken(this.currentToken)
        this.tokenOperationResult = JSON.stringify({
          action: 'validate',
          ...result,
          timestamp: new Date().toISOString()
        }, null, 2)
        
        this.addLog(result.valid ? 'success' : 'warning', 
          `令牌验证结果: ${result.valid ? '有效' : '无效'} - ${result.reason}`)
      } catch (error) {
        this.tokenOperationResult = JSON.stringify({
          action: 'validate',
          success: false,
          error: error.message
        }, null, 2)
        
        this.addLog('error', `令牌验证失败: ${error.message}`)
      } finally {
        this.validating = false
      }
    },
    
    copyToken() {
      if (this.currentToken) {
        navigator.clipboard.writeText(this.currentToken).then(() => {
          this.$message.success('令牌已复制到剪贴板')
        }).catch(() => {
          this.$message.error('复制失败')
        })
      }
    },
    
    async handleSafeFormSubmit(formData) {
      this.addLog('info', '开始处理SafeForm提交')
      
      // 模拟API请求
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.3) { // 70%成功率
            resolve({
              success: true,
              message: '表单提交成功',
              data: formData
            })
          } else {
            reject(new Error('模拟的服务器错误'))
          }
        }, 2000)
      })
    },
    
    onSubmitSuccess(result) {
      this.addLog('success', `SafeForm提交成功: ${JSON.stringify(result)}`)
      this.$message.success('表单提交成功！')
    },
    
    onSubmitError(error) {
      this.addLog('error', `SafeForm提交失败: ${error.message}`)
      this.$message.error(`表单提交失败: ${error.message}`)
    },
    
    onProtectionLevelChange() {
      this.addLog('info', `XSS防护级别已更改为: ${this.xssProtectionLevel}`)
    },
    
    onThreatDetected(event) {
      this.addLog('warning', `检测到XSS威胁: ${event.threats.length}个威胁`)
      this.xssProcessedResult = event.sanitized
    },
    
    onSecurityProcessed(event) {
      this.xssProcessedResult = event.sanitized
      if (event.threats.length > 0) {
        this.addLog('warning', `XSS处理完成: 检测到${event.threats.length}个威胁`)
      }
    },
    
    applyXSSTestCase(testCase) {
      this.xssTestInput = testCase.input
      this.addLog('info', `应用XSS测试用例: ${testCase.name}`)
    },
    
    async sendApiRequest() {
      this.apiTesting = true
      try {
        let requestData = null
        if (this.apiTestData.trim()) {
          try {
            requestData = JSON.parse(this.apiTestData)
          } catch {
            requestData = this.apiTestData
          }
        }
        
        const config = {
          method: this.apiTestMethod.toLowerCase(),
          url: this.apiTestUrl
        }
        
        if (requestData && ['post', 'put', 'patch'].includes(config.method)) {
          config.data = requestData
        }
        
        this.addLog('info', `发送${this.apiTestMethod}请求到${this.apiTestUrl}`)
        
        // 注意：这里的请求会自动包含CSRF令牌
        const response = await this.$http(config)
        
        this.apiTestResult = JSON.stringify({
          success: true,
          status: response.status,
          headers: response.headers,
          data: response.data
        }, null, 2)
        
        this.addLog('success', `API请求成功: ${response.status}`)
        
      } catch (error) {
        this.apiTestResult = JSON.stringify({
          success: false,
          error: error.message,
          isCSRFError: error.isCSRFError || false,
          code: error.code
        }, null, 2)
        
        this.addLog('error', `API请求失败: ${error.message}`)
      } finally {
        this.apiTesting = false
      }
    },
    
    clearApiResult() {
      this.apiTestResult = ''
      this.addLog('info', 'API测试结果已清除')
    },
    
    addLog(level, message) {
      this.logs.unshift({
        level,
        message,
        timestamp: new Date().toLocaleTimeString()
      })
      
      // 限制日志数量
      if (this.logs.length > 100) {
        this.logs = this.logs.slice(0, 100)
      }
    },
    
    clearLogs() {
      this.logs = []
      this.addLog('info', '日志已清除')
    }
  }
}
</script>

<style scoped>
.csrf-demo-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.status-card,
.operation-card,
.demo-card,
.log-card {
  margin-bottom: 20px;
}

.status-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.status-label {
  margin-right: 8px;
  font-weight: 500;
}

.operation-result,
.api-result {
  margin-top: 15px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.operation-result pre,
.api-result pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.xss-test-buttons {
  margin-top: 15px;
}

.xss-test-buttons h4 {
  margin-bottom: 10px;
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
}

.log-entry {
  display: flex;
  margin-bottom: 5px;
  font-family: monospace;
  font-size: 12px;
}

.log-time {
  color: #909399;
  margin-right: 10px;
  min-width: 80px;
}

.log-level {
  margin-right: 10px;
  min-width: 60px;
  font-weight: bold;
}

.log-message {
  flex: 1;
}

.log-info .log-level {
  color: #409eff;
}

.log-success .log-level {
  color: #67c23a;
}

.log-warning .log-level {
  color: #e6a23c;
}

.log-error .log-level {
  color: #f56c6c;
}
</style>