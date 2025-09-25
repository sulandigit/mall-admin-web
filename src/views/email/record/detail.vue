<template>
  <div class="app-container">
    <el-card v-loading="pageLoading">
      <div slot="header">
        <span>发送记录详情</span>
        <div style="float: right">
          <el-button @click="goBack">返回</el-button>
          <el-button 
            v-if="record.status === 0"
            type="warning" 
            @click="retryFailed">
            重试发送
          </el-button>
        </div>
      </div>
      
      <div class="record-detail">
        <!-- 基本信息 -->
        <div class="detail-section">
          <el-descriptions title="基本信息" :column="2" border>
            <el-descriptions-item label="记录ID">{{ record.id }}</el-descriptions-item>
            <el-descriptions-item label="邮件模板">{{ record.templateName }}</el-descriptions-item>
            <el-descriptions-item label="邮件主题" :span="2">{{ record.subject }}</el-descriptions-item>
            <el-descriptions-item label="发送状态">
              <el-tag :type="getStatusTagType(record.status)">
                {{ getStatusText(record.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="发送时间">{{ formatDate(record.sendTime) }}</el-descriptions-item>
            <el-descriptions-item label="发送总数">{{ record.sendCount }}</el-descriptions-item>
            <el-descriptions-item label="成功数量">
              <span style="color: #67C23A">{{ record.successCount }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="失败数量">
              <span style="color: #F56C6C">{{ record.failCount }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="成功率">
              {{ getSuccessRate() }}%
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 错误信息 -->
        <div v-if="record.errorMessage" class="detail-section">
          <h3>错误信息</h3>
          <el-alert
            :title="record.errorMessage"
            type="error"
            :closable="false">
          </el-alert>
        </div>

        <!-- 收件人列表 -->
        <div class="detail-section">
          <h3>收件人详情</h3>
          <div class="recipients-tabs">
            <el-tabs v-model="activeTab" @tab-click="handleTabClick">
              <el-tab-pane label="全部收件人" name="all">
                <recipient-list 
                  :recipients="allRecipients"
                  :loading="recipientsLoading">
                </recipient-list>
              </el-tab-pane>
              <el-tab-pane label="发送成功" name="success" v-if="record.successCount > 0">
                <recipient-list 
                  :recipients="successRecipients"
                  :loading="recipientsLoading"
                  status="success">
                </recipient-list>
              </el-tab-pane>
              <el-tab-pane label="发送失败" name="failed" v-if="record.failCount > 0">
                <recipient-list 
                  :recipients="failedRecipients"
                  :loading="recipientsLoading"
                  status="failed">
                </recipient-list>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>

        <!-- 邮件内容预览 -->
        <div class="detail-section">
          <h3>邮件内容</h3>
          <div class="email-preview">
            <div class="email-subject">
              <label>主题：</label>
              <span>{{ record.subject }}</span>
            </div>
            <div class="email-content">
              <label>内容：</label>
              <div class="content-frame">
                <iframe 
                  v-if="record.emailContent"
                  :srcdoc="record.emailContent"
                  frameborder="0"
                  style="width: 100%; min-height: 400px;">
                </iframe>
                <div v-else class="no-content">
                  <el-empty description="暂无邮件内容"></el-empty>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 发送日志 -->
        <div class="detail-section">
          <h3>发送日志</h3>
          <el-timeline>
            <el-timeline-item
              v-for="(log, index) in sendLogs"
              :key="index"
              :timestamp="formatDate(log.timestamp)"
              :type="getLogType(log.level)">
              {{ log.message }}
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import RecipientList from './components/RecipientList'

export default {
  name: 'EmailRecordDetail',
  components: {
    RecipientList
  },
  data() {
    return {
      pageLoading: true,
      recipientsLoading: false,
      recordId: null,
      activeTab: 'all',
      record: {
        id: null,
        templateName: '',
        subject: '',
        status: 0,
        sendTime: null,
        sendCount: 0,
        successCount: 0,
        failCount: 0,
        errorMessage: '',
        emailContent: ''
      },
      allRecipients: [],
      successRecipients: [],
      failedRecipients: [],
      sendLogs: []
    }
  },
  created() {
    this.recordId = this.$route.params.id
    this.getRecordDetail()
  },
  methods: {
    ...mapActions('email', [
      'getRecordDetail',
      'retryFailedEmail'
    ]),
    async getRecordDetail() {
      try {
        this.pageLoading = true
        const recordDetail = await this.getRecordDetail(this.recordId)
        this.record = recordDetail
        
        // 解析收件人列表
        this.parseRecipients(recordDetail.recipients)
        
        // 加载发送日志
        this.loadSendLogs()
        
      } catch (error) {
        this.$message.error('获取记录详情失败：' + error.message)
        this.goBack()
      } finally {
        this.pageLoading = false
      }
    },
    parseRecipients(recipientsData) {
      // 假设后端返回的是包含状态信息的收件人数据
      if (typeof recipientsData === 'string') {
        // 如果是字符串，按逗号分割
        this.allRecipients = recipientsData.split(',').map(email => ({
          email: email.trim(),
          status: this.record.status,
          errorMessage: this.record.errorMessage
        }))
      } else if (Array.isArray(recipientsData)) {
        // 如果是数组，直接使用
        this.allRecipients = recipientsData
      } else {
        this.allRecipients = []
      }
      
      // 分类收件人
      this.successRecipients = this.allRecipients.filter(r => r.status === 1)
      this.failedRecipients = this.allRecipients.filter(r => r.status === 0)
    },
    loadSendLogs() {
      // 模拟发送日志数据
      this.sendLogs = [
        {
          timestamp: this.record.sendTime,
          level: 'info',
          message: '开始发送邮件任务'
        },
        {
          timestamp: new Date(new Date(this.record.sendTime).getTime() + 1000),
          level: 'info',
          message: `准备发送给 ${this.record.sendCount} 个收件人`
        }
      ]
      
      if (this.record.successCount > 0) {
        this.sendLogs.push({
          timestamp: new Date(new Date(this.record.sendTime).getTime() + 2000),
          level: 'success',
          message: `成功发送 ${this.record.successCount} 封邮件`
        })
      }
      
      if (this.record.failCount > 0) {
        this.sendLogs.push({
          timestamp: new Date(new Date(this.record.sendTime).getTime() + 3000),
          level: 'error',
          message: `发送失败 ${this.record.failCount} 封邮件`
        })
      }
      
      this.sendLogs.push({
        timestamp: new Date(new Date(this.record.sendTime).getTime() + 4000),
        level: 'info',
        message: '邮件发送任务完成'
      })
    },
    async retryFailed() {
      try {
        await this.$confirm('是否要重试发送失败的邮件？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await this.retryFailedEmail(this.recordId)
        this.$message.success('重试任务已启动')
        
        // 刷新页面数据
        setTimeout(() => {
          this.getRecordDetail()
        }, 1000)
        
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('重试失败：' + error.message)
        }
      }
    },
    handleTabClick(tab) {
      // 标签页切换处理
      if (tab.name === 'success' && this.successRecipients.length === 0) {
        // 加载成功收件人详情
        this.loadRecipientDetails('success')
      } else if (tab.name === 'failed' && this.failedRecipients.length === 0) {
        // 加载失败收件人详情
        this.loadRecipientDetails('failed')
      }
    },
    async loadRecipientDetails(status) {
      // 这里应该调用API获取详细的收件人信息
      this.recipientsLoading = true
      // 模拟API调用
      setTimeout(() => {
        this.recipientsLoading = false
      }, 500)
    },
    goBack() {
      this.$router.push({ path: '/email/record' })
    },
    getStatusText(status) {
      const statusMap = {
        0: '发送失败',
        1: '发送成功',
        2: '发送中'
      }
      return statusMap[status] || '未知'
    },
    getStatusTagType(status) {
      const typeMap = {
        0: 'danger',
        1: 'success',
        2: 'warning'
      }
      return typeMap[status] || 'info'
    },
    getLogType(level) {
      const typeMap = {
        'info': 'primary',
        'success': 'success',
        'warning': 'warning',
        'error': 'danger'
      }
      return typeMap[level] || 'primary'
    },
    getSuccessRate() {
      if (this.record.sendCount === 0) return 0
      return Math.round((this.record.successCount / this.record.sendCount) * 100)
    },
    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      return d.toLocaleString('zh-CN')
    }
  }
}
</script>

<style scoped>
.record-detail {
  max-width: 1000px;
}

.detail-section {
  margin-bottom: 30px;
}

.detail-section h3 {
  margin-bottom: 15px;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.recipients-tabs {
  margin-top: 10px;
}

.email-preview {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.email-subject {
  padding: 15px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
}

.email-subject label {
  font-weight: bold;
  color: #606266;
  margin-right: 10px;
}

.email-content {
  padding: 0;
}

.email-content label {
  display: block;
  padding: 15px 15px 0;
  font-weight: bold;
  color: #606266;
}

.content-frame {
  padding: 15px;
}

.no-content {
  text-align: center;
  padding: 40px 0;
}
</style>