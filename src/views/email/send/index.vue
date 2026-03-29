<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <!-- 单邮件发送 -->
      <el-tab-pane label="单邮件发送" name="single">
        <el-card>
          <el-form 
            :model="singleEmail" 
            :rules="singleRules" 
            ref="singleForm" 
            label-width="140px"
            class="email-form">
            
            <el-form-item label="选择模板" prop="templateId">
              <el-select 
                v-model="singleEmail.templateId" 
                placeholder="请选择邮件模板"
                @change="onTemplateChange"
                style="width: 100%">
                <el-option
                  v-for="template in enabledTemplates"
                  :key="template.id"
                  :label="`${template.name} (${template.subject})`"
                  :value="template.id">
                </el-option>
              </el-select>
              <el-button 
                type="text" 
                @click="refreshTemplates" 
                style="margin-left: 10px;">
                刷新
              </el-button>
            </el-form-item>
            
            <el-form-item label="收件人邮箱" prop="recipient">
              <el-input 
                v-model="singleEmail.recipient"
                placeholder="请输入收件人邮箱地址">
              </el-input>
            </el-form-item>
            
            <el-form-item label="邮件主题" prop="subject">
              <el-input 
                v-model="singleEmail.subject"
                placeholder="请输入邮件主题">
              </el-input>
            </el-form-item>
            
            <!-- 模板变量 -->
            <div v-if="templateVariables.length > 0">
              <el-divider content-position="left">模板变量</el-divider>
              <el-form-item 
                v-for="variable in templateVariables" 
                :key="variable.name"
                :label="variable.description || variable.name"
                :prop="`variables.${variable.name}`">
                <el-input 
                  v-model="singleEmail.variables[variable.name]"
                  :placeholder="`请输入${variable.description || variable.name}`">
                </el-input>
              </el-form-item>
            </div>
            
            <el-form-item label="邮件内容" prop="content">
              <div class="editor-container">
                <tinymce-editor
                  v-model="singleEmail.content"
                  :height="300"
                  @change="onContentChange">
                </tinymce-editor>
              </div>
            </el-form-item>
            
            <el-form-item label="是否立即发送">
              <el-switch v-model="singleEmail.sendNow"></el-switch>
              <span style="margin-left: 10px; color: #999;">关闭则仅保存为草稿</span>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="sendSingle" :loading="sendLoading">
                {{ singleEmail.sendNow ? '发送邮件' : '保存草稿' }}
              </el-button>
              <el-button @click="previewSingle">预览</el-button>
              <el-button @click="resetSingle">重置</el-button>
            </el-form-item>
            
          </el-form>
        </el-card>
      </el-tab-pane>
      
      <!-- 批量发送 -->
      <el-tab-pane label="批量发送" name="batch">
        <el-card>
          <el-form 
            :model="batchEmail" 
            :rules="batchRules" 
            ref="batchForm" 
            label-width="140px"
            class="email-form">
            
            <el-form-item label="选择模板" prop="templateId">
              <el-select 
                v-model="batchEmail.templateId" 
                placeholder="请选择邮件模板"
                @change="onBatchTemplateChange"
                style="width: 100%">
                <el-option
                  v-for="template in enabledTemplates"
                  :key="template.id"
                  :label="`${template.name} (${template.subject})`"
                  :value="template.id">
                </el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="收件人列表" prop="recipients">
              <div class="recipients-container">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="showRecipientDialog">
                  选择收件人
                </el-button>
                <el-button 
                  type="success" 
                  size="small" 
                  @click="importRecipients">
                  导入列表
                </el-button>
                <span style="margin-left: 10px;">已选择: {{ batchEmail.recipients.length }} 个收件人</span>
              </div>
              <div class="recipients-list" v-if="batchEmail.recipients.length > 0">
                <el-tag
                  v-for="(email, index) in batchEmail.recipients.slice(0, 10)"
                  :key="index"
                  closable
                  @close="removeRecipient(index)"
                  style="margin-right: 5px; margin-bottom: 5px;">
                  {{ email }}
                </el-tag>
                <span v-if="batchEmail.recipients.length > 10">
                  ...还有{{ batchEmail.recipients.length - 10 }}个
                </span>
              </div>
            </el-form-item>
            
            <el-form-item label="邮件主题" prop="subject">
              <el-input 
                v-model="batchEmail.subject"
                placeholder="请输入邮件主题">
              </el-input>
            </el-form-item>
            
            <!-- 批量模板变量 -->
            <div v-if="batchTemplateVariables.length > 0">
              <el-divider content-position="left">模板变量 (全局设置)</el-divider>
              <el-form-item 
                v-for="variable in batchTemplateVariables" 
                :key="variable.name"
                :label="variable.description || variable.name">
                <el-input 
                  v-model="batchEmail.variables[variable.name]"
                  :placeholder="`请输入${variable.description || variable.name}`">
                </el-input>
              </el-form-item>
            </div>
            
            <el-form-item label="发送策略">
              <el-radio-group v-model="batchEmail.sendStrategy">
                <el-radio label="immediately">立即发送</el-radio>
                <el-radio label="scheduled">定时发送</el-radio>
                <el-radio label="batch">分批发送</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item 
              v-if="batchEmail.sendStrategy === 'scheduled'"
              label="发送时间">
              <el-date-picker
                v-model="batchEmail.scheduledTime"
                type="datetime"
                placeholder="选择发送时间"
                format="yyyy-MM-dd HH:mm:ss"
                value-format="yyyy-MM-dd HH:mm:ss">
              </el-date-picker>
            </el-form-item>
            
            <el-form-item 
              v-if="batchEmail.sendStrategy === 'batch'"
              label="分批设置">
              <el-row :gutter="10">
                <el-col :span="8">
                  <el-input-number 
                    v-model="batchEmail.batchSize" 
                    :min="1" 
                    :max="100"
                    controls-position="right">
                  </el-input-number>
                  <span style="margin-left: 5px;">每批数量</span>
                </el-col>
                <el-col :span="8">
                  <el-input-number 
                    v-model="batchEmail.batchInterval" 
                    :min="1" 
                    :max="60"
                    controls-position="right">
                  </el-input-number>
                  <span style="margin-left: 5px;">间隔(分钟)</span>
                </el-col>
              </el-row>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="sendBatch" :loading="batchSendLoading">
                {{ getBatchSendButtonText() }}
              </el-button>
              <el-button @click="previewBatch">预览</el-button>
              <el-button @click="resetBatch">重置</el-button>
            </el-form-item>
            
          </el-form>
        </el-card>
        
        <!-- 批量发送进度 -->
        <el-card v-if="showBatchProgress" style="margin-top: 20px;">
          <div slot="header">
            <span>发送进度</span>
            <el-button 
              style="float: right; padding: 3px 0" 
              type="text" 
              @click="showBatchProgress = false">
              隐藏
            </el-button>
          </div>
          <div class="batch-progress">
            <el-progress 
              :percentage="batchProgressPercentage" 
              :status="batchProgressStatus">
            </el-progress>
            <div class="progress-info">
              <span>总数: {{ batchProgressData.total }}</span>
              <span>成功: {{ batchProgressData.success }}</span>
              <span>失败: {{ batchProgressData.failed }}</span>
              <span>进度: {{ batchProgressData.progress }}%</span>
            </div>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 收件人选择对话框 -->
    <recipient-selector-dialog
      v-if="recipientDialogVisible"
      :visible.sync="recipientDialogVisible"
      @confirm="onRecipientsSelected">
    </recipient-selector-dialog>
    
    <!-- 邮件预览对话框 -->
    <email-preview-dialog
      v-if="previewDialogVisible"
      :visible.sync="previewDialogVisible"
      :email-data="previewEmailData">
    </email-preview-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import TinymceEditor from '@/components/Tinymce'
import RecipientSelectorDialog from './components/RecipientSelectorDialog'
import EmailPreviewDialog from './components/EmailPreviewDialog'

export default {
  name: 'EmailSend',
  components: {
    TinymceEditor,
    RecipientSelectorDialog,
    EmailPreviewDialog
  },
  data() {
    return {
      activeTab: 'single',
      sendLoading: false,
      batchSendLoading: false,
      recipientDialogVisible: false,
      previewDialogVisible: false,
      previewEmailData: {},
      showBatchProgress: false,
      
      // 单邮件发送数据
      singleEmail: {
        templateId: null,
        recipient: '',
        subject: '',
        content: '',
        variables: {},
        sendNow: true
      },
      
      // 批量发送数据
      batchEmail: {
        templateId: null,
        recipients: [],
        subject: '',
        variables: {},
        sendStrategy: 'immediately',
        scheduledTime: null,
        batchSize: 10,
        batchInterval: 1
      },
      
      templateVariables: [],
      batchTemplateVariables: [],
      
      // 表单验证规则
      singleRules: {
        templateId: [
          { required: true, message: '请选择邮件模板', trigger: 'change' }
        ],
        recipient: [
          { required: true, message: '请输入收件人邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        subject: [
          { required: true, message: '请输入邮件主题', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入邮件内容', trigger: 'blur' }
        ]
      },
      
      batchRules: {
        templateId: [
          { required: true, message: '请选择邮件模板', trigger: 'change' }
        ],
        recipients: [
          { required: true, message: '请选择收件人', trigger: 'change' }
        ],
        subject: [
          { required: true, message: '请输入邮件主题', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapState('email', {
      templateList: state => state.templateList,
      sendStatus: state => state.sendStatus
    }),
    enabledTemplates() {
      return this.templateList.filter(template => template.status === 1)
    },
    batchProgressData() {
      return this.sendStatus
    },
    batchProgressPercentage() {
      if (this.sendStatus.total === 0) return 0
      return Math.round((this.sendStatus.success + this.sendStatus.failed) / this.sendStatus.total * 100)
    },
    batchProgressStatus() {
      if (this.sendStatus.loading) return 'active'
      if (this.sendStatus.failed > 0) return 'exception'
      return 'success'
    }
  },
  created() {
    this.loadTemplates()
  },
  methods: {
    ...mapActions('email', [
      'fetchTemplateList',
      'getTemplate',
      'sendSingleEmail',
      'sendBatchEmail'
    ]),
    async loadTemplates() {
      try {
        await this.fetchTemplateList({ status: 1, pageSize: 100 })
      } catch (error) {
        this.$message.error('加载模板列表失败：' + error.message)
      }
    },
    async refreshTemplates() {
      await this.loadTemplates()
      this.$message.success('模板列表已刷新')
    },
    async onTemplateChange(templateId) {
      if (!templateId) return
      
      try {
        const template = await this.getTemplate(templateId)
        this.singleEmail.subject = template.subject
        this.singleEmail.content = template.content
        this.templateVariables = template.variables || []
        
        // 初始化变量值
        this.singleEmail.variables = {}
        this.templateVariables.forEach(variable => {
          this.$set(this.singleEmail.variables, variable.name, '')
        })
      } catch (error) {
        this.$message.error('获取模板详情失败：' + error.message)
      }
    },
    async onBatchTemplateChange(templateId) {
      if (!templateId) return
      
      try {
        const template = await this.getTemplate(templateId)
        this.batchEmail.subject = template.subject
        this.batchTemplateVariables = template.variables || []
        
        // 初始化变量值
        this.batchEmail.variables = {}
        this.batchTemplateVariables.forEach(variable => {
          this.$set(this.batchEmail.variables, variable.name, '')
        })
      } catch (error) {
        this.$message.error('获取模板详情失败：' + error.message)
      }
    },
    onContentChange(content) {
      this.singleEmail.content = content
    },
    async sendSingle() {
      try {
        await this.$refs.singleForm.validate()
        
        this.sendLoading = true
        await this.sendSingleEmail({
          ...this.singleEmail,
          templateId: this.singleEmail.templateId
        })
        
        this.$message.success(this.singleEmail.sendNow ? '邮件发送成功' : '草稿保存成功')
        this.resetSingle()
      } catch (error) {
        if (error.message) {
          this.$message.error((this.singleEmail.sendNow ? '发送' : '保存') + '失败：' + error.message)
        }
      } finally {
        this.sendLoading = false
      }
    },
    async sendBatch() {
      try {
        await this.$refs.batchForm.validate()
        
        if (this.batchEmail.recipients.length === 0) {
          this.$message.warning('请选择收件人')
          return
        }
        
        this.batchSendLoading = true
        this.showBatchProgress = true
        
        await this.sendBatchEmail({
          ...this.batchEmail,
          templateId: this.batchEmail.templateId
        })
        
        this.$message.success('批量发送任务已启动')
      } catch (error) {
        if (error.message) {
          this.$message.error('批量发送失败：' + error.message)
        }
        this.showBatchProgress = false
      } finally {
        this.batchSendLoading = false
      }
    },
    previewSingle() {
      this.previewEmailData = {
        subject: this.singleEmail.subject,
        content: this.singleEmail.content,
        variables: this.singleEmail.variables,
        recipient: this.singleEmail.recipient
      }
      this.previewDialogVisible = true
    },
    previewBatch() {
      this.previewEmailData = {
        subject: this.batchEmail.subject,
        content: '', // 需要从模板获取
        variables: this.batchEmail.variables,
        recipients: this.batchEmail.recipients.slice(0, 3) // 只预览前3个
      }
      this.previewDialogVisible = true
    },
    resetSingle() {
      this.singleEmail = {
        templateId: null,
        recipient: '',
        subject: '',
        content: '',
        variables: {},
        sendNow: true
      }
      this.templateVariables = []
      this.$refs.singleForm.resetFields()
    },
    resetBatch() {
      this.batchEmail = {
        templateId: null,
        recipients: [],
        subject: '',
        variables: {},
        sendStrategy: 'immediately',
        scheduledTime: null,
        batchSize: 10,
        batchInterval: 1
      }
      this.batchTemplateVariables = []
      this.$refs.batchForm.resetFields()
    },
    showRecipientDialog() {
      this.recipientDialogVisible = true
    },
    onRecipientsSelected(recipients) {
      this.batchEmail.recipients = recipients
    },
    removeRecipient(index) {
      this.batchEmail.recipients.splice(index, 1)
    },
    importRecipients() {
      // 打开文件选择器导入收件人列表
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.txt,.csv,.xlsx'
      input.onchange = this.handleFileImport
      input.click()
    },
    handleFileImport(event) {
      const file = event.target.files[0]
      if (!file) return
      
      // 这里应该实现文件解析逻辑
      this.$message.info('文件导入功能待实现')
    },
    getBatchSendButtonText() {
      switch (this.batchEmail.sendStrategy) {
        case 'immediately': return '立即发送'
        case 'scheduled': return '定时发送'
        case 'batch': return '分批发送'
        default: return '发送邮件'
      }
    },
    handleTabClick(tab) {
      // 标签页切换处理
    }
  }
}
</script>

<style scoped>
.email-form {
  max-width: 800px;
}

.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.recipients-container {
  margin-bottom: 10px;
}

.recipients-list {
  margin-top: 10px;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fafafa;
  min-height: 40px;
}

.batch-progress {
  padding: 20px;
}

.progress-info {
  margin-top: 10px;
  display: flex;
  justify-content: space-around;
  color: #666;
}
</style>