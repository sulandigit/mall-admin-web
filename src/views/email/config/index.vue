<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <!-- SMTP配置 -->
      <el-tab-pane label="SMTP配置" name="smtp">
        <el-card v-loading="configLoading">
          <div slot="header">
            <span>SMTP服务器配置</span>
            <div style="float: right">
              <el-button 
                type="success" 
                size="small"
                @click="testConnection"
                :loading="testLoading">
                测试连接
              </el-button>
              <el-button 
                type="primary" 
                size="small"
                @click="saveConfig"
                :loading="saveLoading">
                保存配置
              </el-button>
            </div>
          </div>
          
          <el-form 
            :model="smtpConfig" 
            :rules="smtpRules" 
            ref="smtpForm" 
            label-width="140px"
            class="config-form">
            
            <el-form-item label="SMTP服务器" prop="smtpHost">
              <el-input 
                v-model="smtpConfig.smtpHost"
                placeholder="例如：smtp.qq.com">
                <template slot="append">
                  <el-select v-model="selectedProvider" @change="onProviderChange" style="width: 120px">
                    <el-option label="自定义" value="custom"></el-option>
                    <el-option label="QQ邮箱" value="qq"></el-option>
                    <el-option label="163邮箱" value="163"></el-option>
                    <el-option label="Gmail" value="gmail"></el-option>
                    <el-option label="Outlook" value="outlook"></el-option>
                  </el-select>
                </template>
              </el-input>
            </el-form-item>
            
            <el-form-item label="SMTP端口" prop="smtpPort">
              <el-input-number 
                v-model="smtpConfig.smtpPort"
                :min="1"
                :max="65535"
                controls-position="right">
              </el-input-number>
              <span style="margin-left: 10px; color: #999;">
                通常SSL端口为465，TLS端口为587
              </span>
            </el-form-item>
            
            <el-form-item label="用户名" prop="smtpUsername">
              <el-input 
                v-model="smtpConfig.smtpUsername"
                placeholder="邮箱地址">
              </el-input>
            </el-form-item>
            
            <el-form-item label="密码" prop="smtpPassword">
              <el-input 
                v-model="smtpConfig.smtpPassword"
                type="password"
                placeholder="邮箱密码或授权码"
                show-password>
              </el-input>
            </el-form-item>
            
            <el-form-item label="加密方式">
              <el-radio-group v-model="smtpConfig.smtpSsl">
                <el-radio :label="true">SSL/TLS</el-radio>
                <el-radio :label="false">无加密</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="发件人邮箱" prop="fromEmail">
              <el-input 
                v-model="smtpConfig.fromEmail"
                placeholder="发件人邮箱地址">
              </el-input>
            </el-form-item>
            
            <el-form-item label="发件人名称" prop="fromName">
              <el-input 
                v-model="smtpConfig.fromName"
                placeholder="发件人显示名称">
              </el-input>
            </el-form-item>
            
            <el-form-item label="回复邮箱">
              <el-input 
                v-model="smtpConfig.replyTo"
                placeholder="回复邮箱地址（可选）">
              </el-input>
            </el-form-item>
            
          </el-form>
          
          <!-- 连接状态显示 -->
          <div class="connection-status" v-if="connectionStatus">
            <el-alert
              :title="connectionStatus.message"
              :type="connectionStatus.type"
              :closable="false"
              show-icon>
            </el-alert>
          </div>
        </el-card>
      </el-tab-pane>
      
      <!-- 发送配置 -->
      <el-tab-pane label="发送配置" name="send">
        <el-card>
          <div slot="header">
            <span>邮件发送参数配置</span>
            <div style="float: right">
              <el-button 
                type="primary" 
                size="small"
                @click="saveSendConfig"
                :loading="saveLoading">
                保存配置
              </el-button>
            </div>
          </div>
          
          <el-form 
            :model="sendConfig" 
            :rules="sendRules" 
            ref="sendForm" 
            label-width="140px"
            class="config-form">
            
            <el-form-item label="连接超时时间" prop="timeout">
              <el-input-number 
                v-model="sendConfig.timeout"
                :min="5000"
                :max="60000"
                :step="1000"
                controls-position="right">
              </el-input-number>
              <span style="margin-left: 10px; color: #999;">毫秒</span>
            </el-form-item>
            
            <el-form-item label="最大重试次数" prop="maxRetries">
              <el-input-number 
                v-model="sendConfig.maxRetries"
                :min="0"
                :max="10"
                controls-position="right">
              </el-input-number>
            </el-form-item>
            
            <el-form-item label="重试间隔时间">
              <el-input-number 
                v-model="sendConfig.retryInterval"
                :min="1"
                :max="60"
                controls-position="right">
              </el-input-number>
              <span style="margin-left: 10px; color: #999;">秒</span>
            </el-form-item>
            
            <el-form-item label="批量发送限制">
              <el-input-number 
                v-model="sendConfig.batchSizeLimit"
                :min="1"
                :max="1000"
                controls-position="right">
              </el-input-number>
              <span style="margin-left: 10px; color: #999;">每批次最大发送数量</span>
            </el-form-item>
            
            <el-form-item label="发送频率限制">
              <el-input-number 
                v-model="sendConfig.rateLimitPerHour"
                :min="10"
                :max="10000"
                controls-position="right">
              </el-input-number>
              <span style="margin-left: 10px; color: #999;">每小时最大发送数量</span>
            </el-form-item>
            
            <el-form-item label="失败重试策略">
              <el-radio-group v-model="sendConfig.retryStrategy">
                <el-radio label="immediate">立即重试</el-radio>
                <el-radio label="delayed">延迟重试</el-radio>
                <el-radio label="exponential">指数退避</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="邮件优先级">
              <el-select v-model="sendConfig.defaultPriority" style="width: 200px">
                <el-option label="高" value="high"></el-option>
                <el-option label="普通" value="normal"></el-option>
                <el-option label="低" value="low"></el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="启用发送日志">
              <el-switch v-model="sendConfig.enableLogging"></el-switch>
            </el-form-item>
            
            <el-form-item label="启用邮件追踪">
              <el-switch v-model="sendConfig.enableTracking"></el-switch>
              <span style="margin-left: 10px; color: #999;">追踪邮件打开和点击</span>
            </el-form-item>
            
            <el-form-item label="自动清理日志">
              <el-switch v-model="sendConfig.autoCleanLogs"></el-switch>
              <el-select 
                v-if="sendConfig.autoCleanLogs" 
                v-model="sendConfig.logRetentionDays" 
                style="width: 120px; margin-left: 10px">
                <el-option label="7天" :value="7"></el-option>
                <el-option label="30天" :value="30"></el-option>
                <el-option label="90天" :value="90"></el-option>
                <el-option label="365天" :value="365"></el-option>
              </el-select>
            </el-form-item>
            
          </el-form>
        </el-card>
      </el-tab-pane>
      
      <!-- 模板配置 -->
      <el-tab-pane label="模板配置" name="template">
        <el-card>
          <div slot="header">
            <span>邮件模板全局配置</span>
            <div style="float: right">
              <el-button 
                type="primary" 
                size="small"
                @click="saveTemplateConfig"
                :loading="saveLoading">
                保存配置
              </el-button>
            </div>
          </div>
          
          <el-form 
            :model="templateConfig" 
            ref="templateForm" 
            label-width="140px"
            class="config-form">
            
            <el-form-item label="默认字符编码">
              <el-select v-model="templateConfig.defaultCharset" style="width: 200px">
                <el-option label="UTF-8" value="utf-8"></el-option>
                <el-option label="GBK" value="gbk"></el-option>
                <el-option label="GB2312" value="gb2312"></el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="默认内容类型">
              <el-radio-group v-model="templateConfig.defaultContentType">
                <el-radio label="html">HTML</el-radio>
                <el-radio label="text">纯文本</el-radio>
                <el-radio label="mixed">混合</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="全局页眉">
              <el-input 
                v-model="templateConfig.globalHeader"
                type="textarea"
                :rows="3"
                placeholder="将添加到所有邮件的页眉">
              </el-input>
            </el-form-item>
            
            <el-form-item label="全局页脚">
              <el-input 
                v-model="templateConfig.globalFooter"
                type="textarea"
                :rows="3"
                placeholder="将添加到所有邮件的页脚">
              </el-input>
            </el-form-item>
            
            <el-form-item label="统一样式表">
              <el-input 
                v-model="templateConfig.globalCSS"
                type="textarea"
                :rows="5"
                placeholder="CSS样式，将应用到所有HTML邮件">
              </el-input>
            </el-form-item>
            
            <el-form-item label="变量前缀">
              <el-input 
                v-model="templateConfig.variablePrefix"
                placeholder="例如：{{ 或 ${"
                style="width: 200px">
              </el-input>
            </el-form-item>
            
            <el-form-item label="变量后缀">
              <el-input 
                v-model="templateConfig.variableSuffix"
                placeholder="例如：}} 或 }"
                style="width: 200px">
              </el-input>
            </el-form-item>
            
          </el-form>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'EmailConfig',
  data() {
    return {
      activeTab: 'smtp',
      configLoading: false,
      saveLoading: false,
      testLoading: false,
      selectedProvider: 'custom',
      connectionStatus: null,
      
      // SMTP配置
      smtpConfig: {
        smtpHost: '',
        smtpPort: 587,
        smtpUsername: '',
        smtpPassword: '',
        smtpSsl: true,
        fromEmail: '',
        fromName: '',
        replyTo: ''
      },
      
      // 发送配置
      sendConfig: {
        timeout: 30000,
        maxRetries: 3,
        retryInterval: 5,
        batchSizeLimit: 100,
        rateLimitPerHour: 1000,
        retryStrategy: 'delayed',
        defaultPriority: 'normal',
        enableLogging: true,
        enableTracking: false,
        autoCleanLogs: true,
        logRetentionDays: 30
      },
      
      // 模板配置
      templateConfig: {
        defaultCharset: 'utf-8',
        defaultContentType: 'html',
        globalHeader: '',
        globalFooter: '',
        globalCSS: '',
        variablePrefix: '{{',
        variableSuffix: '}}'
      },
      
      // 表单验证规则
      smtpRules: {
        smtpHost: [
          { required: true, message: '请输入SMTP服务器地址', trigger: 'blur' }
        ],
        smtpPort: [
          { required: true, message: '请输入SMTP端口', trigger: 'blur' }
        ],
        smtpUsername: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        smtpPassword: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        fromEmail: [
          { required: true, message: '请输入发件人邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        fromName: [
          { required: true, message: '请输入发件人名称', trigger: 'blur' }
        ]
      },
      
      sendRules: {
        timeout: [
          { required: true, message: '请设置连接超时时间', trigger: 'blur' }
        ],
        maxRetries: [
          { required: true, message: '请设置最大重试次数', trigger: 'blur' }
        ]
      },
      
      // 邮件服务商预设配置
      providerConfigs: {
        qq: {
          smtpHost: 'smtp.qq.com',
          smtpPort: 587,
          smtpSsl: true
        },
        163: {
          smtpHost: 'smtp.163.com',
          smtpPort: 465,
          smtpSsl: true
        },
        gmail: {
          smtpHost: 'smtp.gmail.com',
          smtpPort: 587,
          smtpSsl: true
        },
        outlook: {
          smtpHost: 'smtp-mail.outlook.com',
          smtpPort: 587,
          smtpSsl: true
        }
      }
    }
  },
  computed: {
    ...mapState('email', {
      emailConfig: state => state.emailConfig,
      smtpStatus: state => state.smtpStatus,
      configChanged: state => state.configChanged
    })
  },
  created() {
    this.loadConfig()
  },
  methods: {
    ...mapActions('email', [
      'fetchEmailConfig',
      'updateEmailConfig',
      'testSMTPConnection'
    ]),
    async loadConfig() {
      try {
        this.configLoading = true
        await this.fetchEmailConfig()
        
        // 将store中的配置同步到本地
        Object.assign(this.smtpConfig, this.emailConfig)
        
      } catch (error) {
        this.$message.error('加载配置失败：' + error.message)
      } finally {
        this.configLoading = false
      }
    },
    onProviderChange(provider) {
      if (provider !== 'custom' && this.providerConfigs[provider]) {
        const config = this.providerConfigs[provider]
        this.smtpConfig.smtpHost = config.smtpHost
        this.smtpConfig.smtpPort = config.smtpPort
        this.smtpConfig.smtpSsl = config.smtpSsl
      }
    },
    async testConnection() {
      try {
        await this.$refs.smtpForm.validate()
        
        this.testLoading = true
        this.connectionStatus = {
          type: 'info',
          message: '正在测试连接...'
        }
        
        await this.testSMTPConnection(this.smtpConfig)
        
        this.connectionStatus = {
          type: 'success',
          message: 'SMTP连接测试成功！'
        }
        
      } catch (error) {
        this.connectionStatus = {
          type: 'error',
          message: 'SMTP连接测试失败：' + error.message
        }
      } finally {
        this.testLoading = false
      }
    },
    async saveConfig() {
      try {
        await this.$refs.smtpForm.validate()
        
        this.saveLoading = true
        await this.updateEmailConfig(this.smtpConfig)
        
        this.$message.success('SMTP配置保存成功')
        
      } catch (error) {
        if (error.message) {
          this.$message.error('保存配置失败：' + error.message)
        }
      } finally {
        this.saveLoading = false
      }
    },
    async saveSendConfig() {
      try {
        await this.$refs.sendForm.validate()
        
        this.saveLoading = true
        // 保存发送配置
        await this.updateEmailConfig({
          ...this.smtpConfig,
          ...this.sendConfig
        })
        
        this.$message.success('发送配置保存成功')
        
      } catch (error) {
        if (error.message) {
          this.$message.error('保存配置失败：' + error.message)
        }
      } finally {
        this.saveLoading = false
      }
    },
    async saveTemplateConfig() {
      try {
        this.saveLoading = true
        // 保存模板配置
        await this.updateEmailConfig({
          ...this.smtpConfig,
          ...this.sendConfig,
          ...this.templateConfig
        })
        
        this.$message.success('模板配置保存成功')
        
      } catch (error) {
        this.$message.error('保存配置失败：' + error.message)
      } finally {
        this.saveLoading = false
      }
    },
    handleTabClick(tab) {
      // 标签页切换处理
    }
  }
}
</script>

<style scoped>
.config-form {
  max-width: 600px;
}

.connection-status {
  margin-top: 20px;
}
</style>