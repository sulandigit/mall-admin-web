<template>
  <div class="chat-header">
    <div class="header-left">
      <!-- 连接状态指示器 -->
      <div class="connection-status">
        <el-tooltip :content="connectionStatusText" placement="bottom">
          <i 
            :class="connectionStatusIcon"
            :style="{ color: connectionStatusColor }"
          ></i>
        </el-tooltip>
      </div>

      <!-- 客户信息 -->
      <div v-if="session" class="customer-info">
        <el-avatar 
          :src="session.customer.avatar" 
          :size="32"
          icon="el-icon-user-solid"
        ></el-avatar>
        <div class="customer-details">
          <div class="customer-name">
            {{ session.customer.name }}
            <el-tag v-if="session.customer.vipLevel" type="warning" size="mini">
              VIP{{ session.customer.vipLevel }}
            </el-tag>
          </div>
          <div class="session-info">
            <span class="session-status">{{ sessionStatusText }}</span>
            <span class="session-time">{{ sessionDurationText }}</span>
          </div>
        </div>
      </div>

      <!-- 无会话时的提示 -->
      <div v-else class="no-session">
        <i class="el-icon-chat-dot-round"></i>
        <span>请选择一个会话开始聊天</span>
      </div>
    </div>

    <div class="header-right">
      <!-- 会话操作菜单 -->
      <el-dropdown v-if="session" @command="handleCommand" trigger="click">
        <el-button type="text" icon="el-icon-more">
          操作
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="transfer" icon="el-icon-sort">
            转接会话
          </el-dropdown-item>
          <el-dropdown-item command="close" icon="el-icon-circle-close">
            结束会话
          </el-dropdown-item>
          <el-dropdown-item command="customerInfo" icon="el-icon-user">
            客户详情
          </el-dropdown-item>
          <el-dropdown-item divided command="history" icon="el-icon-document">
            历史记录
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <!-- 转接会话对话框 -->
    <el-dialog
      title="转接会话"
      :visible.sync="transferDialogVisible"
      width="400px"
      @closed="resetTransferDialog"
    >
      <el-form ref="transferForm" :model="transferForm" label-width="80px">
        <el-form-item label="目标客服">
          <el-select 
            v-model="transferForm.targetServiceId" 
            placeholder="请选择客服"
            style="width: 100%"
          >
            <el-option
              v-for="service in onlineServices"
              :key="service.id"
              :label="service.name"
              :value="service.id"
            >
              <span style="float: left">{{ service.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                {{ service.department }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="转接原因">
          <el-input
            v-model="transferForm.reason"
            type="textarea"
            placeholder="请输入转接原因"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="transferDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmTransfer">确定转接</el-button>
      </div>
    </el-dialog>

    <!-- 客户详情对话框 -->
    <customer-info-dialog
      :visible.sync="customerInfoDialogVisible"
      :customer-id="session?.customer?.id"
    />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import CustomerInfoDialog from './CustomerInfoDialog'

export default {
  name: 'ChatHeader',

  components: {
    CustomerInfoDialog
  },

  props: {
    session: {
      type: Object,
      default: null
    },
    connectionStatus: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      transferDialogVisible: false,
      customerInfoDialogVisible: false,
      transferForm: {
        targetServiceId: '',
        reason: ''
      }
    }
  },

  computed: {
    ...mapState('customerService', ['onlineServices']),

    // 连接状态文本
    connectionStatusText() {
      const statusMap = {
        'connected': '已连接',
        'connecting': '连接中',
        'reconnecting': '重连中',
        'disconnected': '未连接',
        'error': '连接错误'
      }
      return statusMap[this.connectionStatus] || '未知状态'
    },

    // 连接状态图标
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

    // 连接状态颜色
    connectionStatusColor() {
      const colorMap = {
        'connected': '#67C23A',
        'connecting': '#409EFF',
        'reconnecting': '#E6A23C',
        'disconnected': '#F56C6C',
        'error': '#F56C6C'
      }
      return colorMap[this.connectionStatus] || '#909399'
    },

    // 会话状态文本
    sessionStatusText() {
      if (!this.session) return ''
      
      const statusMap = {
        'waiting': '等待中',
        'active': '进行中',
        'closed': '已结束'
      }
      return statusMap[this.session.status] || ''
    },

    // 会话持续时间
    sessionDurationText() {
      if (!this.session || !this.session.createdAt) return ''
      
      const duration = Date.now() - this.session.createdAt
      const minutes = Math.floor(duration / 60000)
      const hours = Math.floor(minutes / 60)
      
      if (hours > 0) {
        return `${hours}小时${minutes % 60}分钟`
      } else {
        return `${minutes}分钟`
      }
    }
  },

  watch: {
    transferDialogVisible(visible) {
      if (visible) {
        this.loadOnlineServices()
      }
    }
  },

  methods: {
    // 处理下拉菜单命令
    handleCommand(command) {
      switch (command) {
        case 'transfer':
          this.showTransferDialog()
          break
        case 'close':
          this.handleCloseSession()
          break
        case 'customerInfo':
          this.showCustomerInfo()
          break
        case 'history':
          this.showHistory()
          break
      }
    },

    // 显示转接对话框
    showTransferDialog() {
      this.transferDialogVisible = true
    },

    // 确认转接
    async confirmTransfer() {
      if (!this.transferForm.targetServiceId) {
        this.$message.warning('请选择目标客服')
        return
      }

      try {
        this.$emit('transfer-session', this.transferForm.targetServiceId)
        this.transferDialogVisible = false
      } catch (error) {
        console.error('转接失败:', error)
      }
    },

    // 重置转接表单
    resetTransferDialog() {
      this.transferForm = {
        targetServiceId: '',
        reason: ''
      }
    },

    // 处理关闭会话
    handleCloseSession() {
      this.$emit('close-session', '手动结束')
    },

    // 显示客户详情
    showCustomerInfo() {
      this.customerInfoDialogVisible = true
    },

    // 显示历史记录
    showHistory() {
      // 这里可以跳转到历史记录页面或显示历史记录对话框
      this.$message.info('历史记录功能开发中')
    },

    // 加载在线客服列表
    async loadOnlineServices() {
      try {
        await this.$store.dispatch('customerService/loadOnlineServices')
      } catch (error) {
        console.error('加载在线客服失败:', error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.chat-header {
  height: 60px;
  padding: 0 16px;
  border-bottom: 1px solid #e8eaec;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
}

.header-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.connection-status {
  margin-right: 12px;
  
  i {
    font-size: 16px;
  }
}

.customer-info {
  display: flex;
  align-items: center;
}

.customer-details {
  margin-left: 12px;
}

.customer-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.session-info {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
  
  span {
    margin-right: 12px;
  }
}

.no-session {
  display: flex;
  align-items: center;
  color: #909399;
  font-size: 14px;
  
  i {
    margin-right: 8px;
    font-size: 18px;
  }
}

.header-right {
  .el-button {
    margin-left: 8px;
  }
}
</style>