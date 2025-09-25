<template>
  <el-dialog
    title="会话详情"
    :visible.sync="dialogVisible"
    width="800px"
    @opened="loadSessionDetail"
  >
    <div v-if="sessionData" class="session-detail">
      <!-- 会话基本信息 -->
      <el-card class="info-section">
        <div slot="header">会话信息</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="label">会话ID:</span>
              <span class="value">{{ sessionData.id }}</span>
            </div>
            <div class="info-item">
              <span class="label">会话状态:</span>
              <el-tag :type="getSessionStatusType(sessionData.status)">
                {{ getSessionStatusText(sessionData.status) }}
              </el-tag>
            </div>
            <div class="info-item">
              <span class="label">开始时间:</span>
              <span class="value">{{ formatDateTime(sessionData.createdAt) }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="label">结束时间:</span>
              <span class="value">{{ sessionData.endedAt ? formatDateTime(sessionData.endedAt) : '进行中' }}</span>
            </div>
            <div class="info-item">
              <span class="label">持续时间:</span>
              <span class="value">{{ calculateDuration(sessionData.createdAt, sessionData.endedAt) }}</span>
            </div>
            <div class="info-item">
              <span class="label">消息数量:</span>
              <span class="value">{{ sessionData.messageCount || 0 }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 客户信息 -->
      <el-card class="info-section">
        <div slot="header">客户信息</div>
        <div class="customer-detail">
          <el-avatar 
            :src="sessionData.customer.avatar"
            :size="64"
            icon="el-icon-user-solid"
          />
          <div class="customer-info">
            <div class="customer-name">{{ sessionData.customer.name }}</div>
            <div class="customer-contact">{{ sessionData.customer.phone }}</div>
            <div class="customer-contact">{{ sessionData.customer.email }}</div>
          </div>
        </div>
      </el-card>

      <!-- 客服信息 -->
      <el-card v-if="sessionData.service" class="info-section">
        <div slot="header">客服信息</div>
        <div class="service-detail">
          <el-avatar 
            :src="sessionData.service.avatar"
            :size="64"
            icon="el-icon-user-solid"
          />
          <div class="service-info">
            <div class="service-name">{{ sessionData.service.name }}</div>
            <div class="service-dept">{{ sessionData.service.department }}</div>
            <el-tag :type="getServiceStatusType(sessionData.service.status)" size="mini">
              {{ getServiceStatusText(sessionData.service.status) }}
            </el-tag>
          </div>
        </div>
      </el-card>

      <!-- 满意度评价 -->
      <el-card v-if="sessionData.satisfaction" class="info-section">
        <div slot="header">满意度评价</div>
        <div class="satisfaction-detail">
          <el-rate 
            v-model="sessionData.satisfaction.rating"
            :max="5"
            disabled
            show-score
            text-color="#ff9900"
          />
          <div class="satisfaction-comment">
            {{ sessionData.satisfaction.comment }}
          </div>
          <div class="satisfaction-time">
            评价时间: {{ formatDateTime(sessionData.satisfaction.createdAt) }}
          </div>
        </div>
      </el-card>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="6" animated />
    </div>

    <div slot="footer">
      <el-button @click="dialogVisible = false">关闭</el-button>
      <el-button type="primary" @click="joinSession">加入会话</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'SessionDetailDialog',

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    sessionId: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      sessionData: null,
      loading: false
    }
  },

  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(value) {
        this.$emit('update:visible', value)
      }
    }
  },

  watch: {
    sessionId(newId) {
      if (newId && this.visible) {
        this.loadSessionDetail()
      }
    }
  },

  methods: {
    async loadSessionDetail() {
      if (!this.sessionId) return

      this.loading = true
      try {
        // 模拟加载会话详情
        await new Promise(resolve => setTimeout(resolve, 500))
        
        this.sessionData = {
          id: this.sessionId,
          status: 'active',
          createdAt: Date.now() - 3600000,
          endedAt: null,
          messageCount: 25,
          customer: {
            id: 'customer_001',
            name: '张三',
            phone: '138****1234',
            email: 'zhangsan@example.com',
            avatar: ''
          },
          service: {
            id: 'service_001',
            name: '李客服',
            department: '在线客服部',
            status: 'online',
            avatar: ''
          },
          satisfaction: {
            rating: 5,
            comment: '服务态度很好，解决问题及时',
            createdAt: Date.now() - 1800000
          }
        }
      } catch (error) {
        console.error('加载会话详情失败:', error)
        this.$message.error('加载会话详情失败')
      } finally {
        this.loading = false
      }
    },

    joinSession() {
      this.$router.push({
        path: '/customer-service/chat',
        query: { sessionId: this.sessionId }
      })
      this.dialogVisible = false
    },

    formatDateTime(timestamp) {
      if (!timestamp) return ''
      return new Date(timestamp).toLocaleString()
    },

    calculateDuration(startTime, endTime) {
      if (!startTime) return ''
      
      const end = endTime || Date.now()
      const duration = Math.floor((end - startTime) / 1000)
      
      const hours = Math.floor(duration / 3600)
      const minutes = Math.floor((duration % 3600) / 60)
      
      if (hours > 0) {
        return `${hours}小时${minutes}分钟`
      } else {
        return `${minutes}分钟`
      }
    },

    getSessionStatusType(status) {
      const typeMap = {
        'waiting': 'warning',
        'active': 'success',
        'closed': 'info'
      }
      return typeMap[status] || 'info'
    },

    getSessionStatusText(status) {
      const textMap = {
        'waiting': '等待中',
        'active': '进行中',
        'closed': '已结束'
      }
      return textMap[status] || '未知'
    },

    getServiceStatusType(status) {
      const typeMap = {
        'online': 'success',
        'busy': 'warning',
        'offline': 'danger'
      }
      return typeMap[status] || 'info'
    },

    getServiceStatusText(status) {
      const textMap = {
        'online': '在线',
        'busy': '忙碌',
        'offline': '离线'
      }
      return textMap[status] || '未知'
    }
  }
}
</script>

<style lang="scss" scoped>
.session-detail {
  .info-section {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    .info-item {
      display: flex;
      align-items: center;
      margin-bottom: 12px;

      .label {
        width: 100px;
        color: #666;
        flex-shrink: 0;
      }

      .value {
        flex: 1;
        color: #303133;
      }
    }
  }

  .customer-detail,
  .service-detail {
    display: flex;
    align-items: center;
    gap: 16px;

    .customer-info,
    .service-info {
      .customer-name,
      .service-name {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 4px;
      }

      .customer-contact,
      .service-dept {
        color: #666;
        margin-bottom: 4px;
      }
    }
  }

  .satisfaction-detail {
    .satisfaction-comment {
      margin: 12px 0;
      color: #303133;
      line-height: 1.6;
    }

    .satisfaction-time {
      color: #666;
      font-size: 12px;
    }
  }
}

.loading-container {
  padding: 20px;
}
</style>