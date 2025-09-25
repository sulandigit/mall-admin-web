<template>
  <div class="customer-service-layout">
    <!-- 客服状态栏 -->
    <div class="service-status-bar">
      <div class="status-left">
        <div class="service-info">
          <el-avatar 
            :src="serviceInfo.avatar"
            :size="32"
            icon="el-icon-user-solid"
          />
          <div class="service-details">
            <div class="service-name">{{ serviceInfo.name }}</div>
            <div class="service-id">ID: {{ serviceInfo.id }}</div>
          </div>
        </div>

        <div class="status-selector">
          <el-select 
            v-model="currentStatus"
            size="small"
            @change="handleStatusChange"
          >
            <el-option
              v-for="status in statusOptions"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            >
              <span :style="{ color: status.color }">●</span>
              {{ status.label }}
            </el-option>
          </el-select>
        </div>
      </div>

      <div class="status-right">
        <div class="connection-status">
          <el-tooltip :content="connectionStatusText" placement="bottom">
            <i 
              :class="connectionStatusIcon"
              :style="{ color: connectionStatusColor }"
            ></i>
          </el-tooltip>
          <span>{{ connectionStatusText }}</span>
        </div>

        <div class="stats-summary">
          <span>活跃会话: {{ analytics.activeSessionCount }}</span>
          <span>今日消息: {{ analytics.todayMessageCount }}</span>
        </div>

        <el-dropdown @command="handleMenuCommand" trigger="click">
          <el-button type="text" icon="el-icon-setting">
            设置
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="config">客服配置</el-dropdown-item>
            <el-dropdown-item command="analytics">统计分析</el-dropdown-item>
            <el-dropdown-item divided command="logout">退出客服</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="service-content">
      <!-- 左侧会话列表 -->
      <div class="session-panel">
        <session-list
          @session-selected="handleSessionSelected"
          @transfer-session="handleTransferSession"
        />
      </div>

      <!-- 中间聊天区域 -->
      <div class="chat-panel">
        <chat-window
          :session-id="activeSessionId"
        />
      </div>

      <!-- 右侧客户信息和工具 -->
      <div class="info-panel">
        <el-tabs v-model="activeInfoTab" type="border-card">
          <el-tab-pane label="客户信息" name="customer">
            <customer-info 
              :customer-id="activeCustomerId"
            />
          </el-tab-pane>
          
          <el-tab-pane label="快捷回复" name="quickReply">
            <quick-reply-panel />
          </el-tab-pane>
          
          <el-tab-pane label="常用工具" name="tools">
            <service-tools />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 客服配置对话框 -->
    <service-config-dialog
      :visible.sync="configDialogVisible"
    />

    <!-- 统计分析对话框 -->
    <service-analytics-dialog
      :visible.sync="analyticsDialogVisible"
    />

    <!-- 新消息提示音 -->
    <audio 
      ref="notificationSound" 
      preload="auto"
      src="/static/sounds/message.mp3"
    ></audio>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import SessionList from '@/components/Chat/SessionList'
import ChatWindow from '@/components/Chat/ChatWindow'
import CustomerInfo from '@/components/Chat/CustomerInfo'
import QuickReplyPanel from '@/components/Chat/QuickReplyPanel'
import ServiceTools from '@/components/Chat/ServiceTools'
import ServiceConfigDialog from '@/components/Chat/ServiceConfigDialog'
import ServiceAnalyticsDialog from '@/components/Chat/ServiceAnalyticsDialog'
import webSocketManager from '@/utils/websocket/manager'
import { getWebSocketUrl } from '@/utils/websocket/helper'

export default {
  name: 'CustomerServiceIndex',

  components: {
    SessionList,
    ChatWindow,
    CustomerInfo,
    QuickReplyPanel,
    ServiceTools,
    ServiceConfigDialog,
    ServiceAnalyticsDialog
  },

  data() {
    return {
      activeSessionId: '',
      activeInfoTab: 'customer',
      configDialogVisible: false,
      analyticsDialogVisible: false,
      
      statusOptions: [
        { value: 'online', label: '在线', color: '#67C23A' },
        { value: 'busy', label: '忙碌', color: '#E6A23C' },
        { value: 'away', label: '离开', color: '#909399' },
        { value: 'offline', label: '离线', color: '#F56C6C' }
      ]
    }
  },

  computed: {
    ...mapState('chat', [
      'activeSession',
      'connectionStatus'
    ]),
    
    ...mapState('customerService', [
      'serviceInfo',
      'serviceStatus',
      'analytics'
    ]),
    
    ...mapGetters('chat', [
      'connectionStatusText',
      'isConnected'
    ]),
    
    ...mapGetters('customerService', [
      'serviceStatusText',
      'serviceStatusColor'
    ]),

    ...mapGetters(['token']),

    currentStatus: {
      get() {
        return this.serviceStatus
      },
      set(value) {
        // 通过getter/setter处理状态变更
      }
    },

    activeCustomerId() {
      return this.activeSession?.customer?.id || ''
    },

    connectionStatusIcon() {
      const iconMap = {
        'connected': 'el-icon-success',
        'connecting': 'el-icon-loading',
        'reconnecting': 'el-icon-refresh',
        'disconnected': 'el-icon-error',
        'error': 'el-icon-warning'
      }
      return iconMap[this.connectionStatus] || 'el-icon-question'
    },

    connectionStatusColor() {
      const colorMap = {
        'connected': '#67C23A',
        'connecting': '#409EFF',
        'reconnecting': '#E6A23C',
        'disconnected': '#F56C6C',
        'error': '#F56C6C'
      }
      return colorMap[this.connectionStatus] || '#909399'
    }
  },

  async mounted() {
    await this.initializeCustomerService()
  },

  beforeDestroy() {
    this.cleanup()
  },

  methods: {
    ...mapActions('chat', [
      'initChat',
      'disconnectWebSocket'
    ]),
    
    ...mapActions('customerService', [
      'initCustomerService',
      'updateStatus'
    ]),

    // 初始化客服系统
    async initializeCustomerService() {
      try {
        // 获取当前用户信息作为客服信息
        const userInfo = this.$store.getters.name
        const serviceInfo = {
          id: this.$store.getters.id || 'service_001',
          name: userInfo || '客服',
          avatar: this.$store.getters.avatar || '',
          department: '在线客服部',
          skills: ['产品咨询', '订单处理', '售后服务']
        }

        // 初始化客服模块
        await this.initCustomerService(serviceInfo)

        // 初始化聊天模块
        const wsUrl = getWebSocketUrl(process.env.VUE_APP_WS_API || 'localhost:8080', this.token)
        await this.initChat({
          token: this.token,
          wsUrl
        })

        // 设置为在线状态
        await this.updateStatus('online')

        this.$message.success('客服系统初始化成功')
      } catch (error) {
        console.error('初始化客服系统失败:', error)
        this.$message.error('客服系统初始化失败')
      }
    },

    // 处理会话选择
    handleSessionSelected(session) {
      this.activeSessionId = session.id
      this.activeInfoTab = 'customer'
    },

    // 处理状态变更
    async handleStatusChange(status) {
      try {
        await this.updateStatus(status)
        this.$message.success(`状态已切换为: ${this.getStatusLabel(status)}`)
      } catch (error) {
        console.error('状态切换失败:', error)
        this.$message.error('状态切换失败')
      }
    },

    // 处理转接会话
    handleTransferSession(session) {
      this.$message.info('转接会话功能开发中')
    },

    // 处理菜单命令
    handleMenuCommand(command) {
      switch (command) {
        case 'config':
          this.configDialogVisible = true
          break
        case 'analytics':
          this.analyticsDialogVisible = true
          break
        case 'logout':
          this.handleLogout()
          break
      }
    },

    // 处理退出客服
    async handleLogout() {
      try {
        await this.$confirm('确定要退出客服系统吗？', '确认退出', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await this.updateStatus('offline')
        this.cleanup()
        this.$router.push('/home')
        this.$message.success('已退出客服系统')
      } catch (error) {
        if (error !== 'cancel') {
          console.error('退出客服失败:', error)
        }
      }
    },

    // 获取状态标签
    getStatusLabel(status) {
      const option = this.statusOptions.find(opt => opt.value === status)
      return option ? option.label : status
    },

    // 播放通知音效
    playNotificationSound() {
      if (this.$refs.notificationSound && this.serviceConfig.notificationSound) {
        this.$refs.notificationSound.play().catch(error => {
          console.warn('播放通知音效失败:', error)
        })
      }
    },

    // 清理资源
    cleanup() {
      this.disconnectWebSocket()
    }
  }
}
</script>

<style lang="scss" scoped>
.customer-service-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
}

.service-status-bar {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e8eaec;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.status-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.service-info {
  display: flex;
  align-items: center;
  gap: 12px;

  .service-details {
    .service-name {
      font-weight: 500;
      color: #303133;
      font-size: 14px;
    }

    .service-id {
      font-size: 12px;
      color: #909399;
    }
  }
}

.status-selector {
  ::v-deep .el-select .el-input__inner {
    border: none;
    background: #f5f5f5;
  }
}

.status-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;

  i {
    font-size: 16px;
  }
}

.stats-summary {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #666;

  span {
    padding: 4px 8px;
    background: #f5f5f5;
    border-radius: 4px;
  }
}

.service-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.session-panel {
  width: 320px;
  background: #fff;
  border-right: 1px solid #e8eaec;
  overflow: hidden;
}

.chat-panel {
  flex: 1;
  background: #fff;
  margin: 0 1px;
  overflow: hidden;
}

.info-panel {
  width: 300px;
  background: #fff;
  overflow: hidden;

  ::v-deep .el-tabs--border-card {
    border: none;
    box-shadow: none;
  }

  ::v-deep .el-tabs__header {
    margin: 0;
    border-bottom: 1px solid #e4e7ed;
  }

  ::v-deep .el-tabs__content {
    padding: 0;
    height: calc(100vh - 120px);
    overflow: hidden;
  }

  ::v-deep .el-tab-pane {
    height: 100%;
    overflow: hidden;
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .info-panel {
    width: 250px;
  }
  
  .session-panel {
    width: 280px;
  }
}

@media (max-width: 992px) {
  .service-content {
    flex-direction: column;
  }
  
  .session-panel,
  .info-panel {
    width: 100%;
    height: 200px;
  }
  
  .chat-panel {
    flex: 1;
    margin: 1px 0;
  }
}
</style>