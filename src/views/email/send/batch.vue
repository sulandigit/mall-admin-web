<template>
  <div class="app-container">
    <el-card>
      <div slot="header">
        <span>批量邮件发送</span>
        <div style="float: right">
          <el-button @click="goBack">返回</el-button>
        </div>
      </div>
      
      <batch-send-form
        :template-list="templateList"
        @submit="handleBatchSend">
      </batch-send-form>
      
      <!-- 发送进度 -->
      <batch-progress
        v-if="showProgress"
        :progress-data="progressData"
        @cancel="cancelBatchSend">
      </batch-progress>
    </el-card>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import BatchSendForm from './components/BatchSendForm'
import BatchProgress from './components/BatchProgress'

export default {
  name: 'BatchEmailSend',
  components: {
    BatchSendForm,
    BatchProgress
  },
  data() {
    return {
      showProgress: false
    }
  },
  computed: {
    ...mapState('email', {
      templateList: state => state.templateList,
      progressData: state => state.sendStatus
    })
  },
  created() {
    this.loadTemplates()
  },
  methods: {
    ...mapActions('email', [
      'fetchTemplateList',
      'sendBatchEmail'
    ]),
    async loadTemplates() {
      await this.fetchTemplateList({ status: 1, pageSize: 100 })
    },
    async handleBatchSend(batchData) {
      try {
        this.showProgress = true
        await this.sendBatchEmail(batchData)
      } catch (error) {
        this.$message.error('批量发送失败：' + error.message)
        this.showProgress = false
      }
    },
    cancelBatchSend() {
      this.showProgress = false
      // 这里可以添加取消发送的逻辑
    },
    goBack() {
      this.$router.push({ path: '/email/send' })
    }
  }
}
</script>