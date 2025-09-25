<template>
  <el-dialog
    title="邮件预览"
    :visible.sync="dialogVisible"
    width="900px"
    @close="onDialogClose">
    
    <div class="email-preview">
      <!-- 预览控制栏 -->
      <div class="preview-controls">
        <el-button-group>
          <el-button 
            :type="previewMode === 'desktop' ? 'primary' : 'default'"
            @click="previewMode = 'desktop'"
            size="small">
            <i class="el-icon-monitor"></i> 桌面预览
          </el-button>
          <el-button 
            :type="previewMode === 'mobile' ? 'primary' : 'default'"
            @click="previewMode = 'mobile'"
            size="small">
            <i class="el-icon-mobile-phone"></i> 移动预览
          </el-button>
          <el-button 
            :type="previewMode === 'source' ? 'primary' : 'default'"
            @click="previewMode = 'source'"
            size="small">
            <i class="el-icon-view"></i> 源码查看
          </el-button>
        </el-button-group>
        
        <div style="float: right;">
          <el-button 
            type="success" 
            size="small"
            @click="sendTestEmail">
            <i class="el-icon-message"></i> 发送测试邮件
          </el-button>
        </div>
      </div>
      
      <!-- 邮件信息 -->
      <div class="email-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="收件人">
            <div v-if="emailData.recipient">
              {{ emailData.recipient }}
            </div>
            <div v-else-if="emailData.recipients && emailData.recipients.length > 0">
              <el-tag 
                v-for="(email, index) in emailData.recipients.slice(0, 3)" 
                :key="index"
                size="small"
                style="margin-right: 5px;">
                {{ email }}
              </el-tag>
              <span v-if="emailData.recipients.length > 3">
                等 {{ emailData.recipients.length }} 个收件人
              </span>
            </div>
            <span v-else>未设置</span>
          </el-descriptions-item>
          <el-descriptions-item label="邮件主题">
            {{ processedSubject }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <!-- 变量替换 -->
      <div v-if="hasVariables" class="variables-section">
        <el-divider content-position="left">模板变量</el-divider>
        <el-form :inline="true" size="small">
          <el-form-item 
            v-for="(value, key) in emailData.variables" 
            :key="key"
            :label="key">
            <el-input 
              v-model="emailData.variables[key]"
              @input="updatePreview"
              style="width: 200px;">
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 预览内容 -->
      <div class="preview-content">
        <!-- 桌面预览 -->
        <div v-if="previewMode === 'desktop'" class="desktop-preview">
          <div class="email-frame desktop">
            <iframe 
              :srcdoc="processedContent"
              frameborder="0"
              style="width: 100%; height: 500px;">
            </iframe>
          </div>
        </div>
        
        <!-- 移动预览 -->
        <div v-if="previewMode === 'mobile'" class="mobile-preview">
          <div class="email-frame mobile">
            <iframe 
              :srcdoc="processedContent"
              frameborder="0"
              style="width: 100%; height: 600px;">
            </iframe>
          </div>
        </div>
        
        <!-- 源码查看 -->
        <div v-if="previewMode === 'source'" class="source-preview">
          <el-tabs v-model="sourceTab">
            <el-tab-pane label="HTML源码" name="html">
              <div class="code-editor">
                <pre><code>{{ processedContent }}</code></pre>
              </div>
            </el-tab-pane>
            <el-tab-pane label="纯文本" name="text">
              <div class="text-content">
                {{ stripHtml(processedContent) }}
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
    
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">关 闭</el-button>
      <el-button type="primary" @click="confirmAndSend">确认并发送</el-button>
    </span>
    
    <!-- 测试邮件对话框 -->
    <el-dialog
      title="发送测试邮件"
      :visible.sync="testEmailDialogVisible"
      width="400px"
      append-to-body>
      <el-form ref="testEmailForm" :model="testEmailData" label-width="100px">
        <el-form-item label="测试邮箱" prop="testEmail">
          <el-input 
            v-model="testEmailData.testEmail"
            placeholder="请输入测试邮箱地址">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="testEmailDialogVisible = false">取 消</el-button>
        <el-button 
          type="primary" 
          @click="doSendTestEmail"
          :loading="testEmailLoading">
          发 送
        </el-button>
      </span>
    </el-dialog>
  </el-dialog>
</template>

<script>
import { sendSingleEmail } from '@/api/email'

export default {
  name: 'EmailPreviewDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    emailData: {
      type: Object,
      default: () => ({
        subject: '',
        content: '',
        variables: {},
        recipient: '',
        recipients: []
      })
    }
  },
  data() {
    return {
      dialogVisible: false,
      previewMode: 'desktop',
      sourceTab: 'html',
      testEmailDialogVisible: false,
      testEmailLoading: false,
      testEmailData: {
        testEmail: ''
      },
      processedContent: '',
      processedSubject: ''
    }
  },
  computed: {
    hasVariables() {
      return Object.keys(this.emailData.variables || {}).length > 0
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val) {
        this.updatePreview()
      }
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    },
    'emailData.variables': {
      handler() {
        this.updatePreview()
      },
      deep: true
    }
  },
  methods: {
    updatePreview() {
      // 处理模板变量替换
      let content = this.emailData.content || ''
      let subject = this.emailData.subject || ''
      
      if (this.emailData.variables) {
        Object.keys(this.emailData.variables).forEach(key => {
          const value = this.emailData.variables[key] || `{${key}}`
          const regex = new RegExp(`\\{\\{${key}\\}\\}|\\{${key}\\}`, 'g')
          content = content.replace(regex, value)
          subject = subject.replace(regex, value)
        })
      }
      
      this.processedContent = content
      this.processedSubject = subject
    },
    stripHtml(html) {
      // 简单的HTML标签移除
      return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
    },
    showTestEmailDialog() {
      this.testEmailDialogVisible = true
    },
    async sendTestEmail() {
      this.testEmailDialogVisible = true
    },
    async doSendTestEmail() {
      if (!this.testEmailData.testEmail) {
        this.$message.warning('请输入测试邮箱地址')
        return
      }
      
      try {
        this.testEmailLoading = true
        
        await sendSingleEmail({
          recipient: this.testEmailData.testEmail,
          subject: this.processedSubject + ' [测试]',
          content: this.processedContent,
          variables: this.emailData.variables || {}
        })
        
        this.$message.success('测试邮件发送成功')
        this.testEmailDialogVisible = false
        
      } catch (error) {
        this.$message.error('测试邮件发送失败：' + error.message)
      } finally {
        this.testEmailLoading = false
      }
    },
    confirmAndSend() {
      this.$emit('confirm', {
        subject: this.processedSubject,
        content: this.processedContent,
        variables: this.emailData.variables
      })
      this.dialogVisible = false
    },
    onDialogClose() {
      this.previewMode = 'desktop'
      this.sourceTab = 'html'
      this.testEmailData.testEmail = ''
    }
  }
}
</script>

<style scoped>
.email-preview {
  height: 100%;
}

.preview-controls {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.email-info {
  margin-bottom: 15px;
}

.variables-section {
  margin-bottom: 15px;
}

.preview-content {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.email-frame.desktop {
  width: 100%;
  background-color: #fff;
}

.email-frame.mobile {
  width: 375px;
  margin: 0 auto;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  overflow: hidden;
}

.source-preview {
  background-color: #f5f5f5;
}

.code-editor {
  padding: 15px;
  height: 500px;
  overflow-y: auto;
}

.code-editor pre {
  margin: 0;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.text-content {
  padding: 15px;
  height: 500px;
  overflow-y: auto;
  line-height: 1.6;
  white-space: pre-wrap;
}
</style>