<template>
  <div class="customer-info">
    <!-- 头部 -->
    <div class="info-header">
      <h3>客户信息</h3>
      <el-button 
        type="text" 
        icon="el-icon-refresh"
        :loading="loading"
        @click="refreshCustomerInfo"
      />
    </div>

    <!-- 客户基本信息 -->
    <div v-if="customerData" class="customer-basic">
      <div class="customer-avatar">
        <el-avatar 
          :src="customerData.avatar"
          :size="64"
          icon="el-icon-user-solid"
        />
        <div 
          v-if="customerData.online"
          class="online-status"
          title="在线"
        ></div>
      </div>

      <div class="customer-details">
        <div class="customer-name">
          {{ customerData.name }}
          <el-tag 
            v-if="customerData.vipLevel" 
            type="warning" 
            size="small"
          >
            VIP{{ customerData.vipLevel }}
          </el-tag>
        </div>
        
        <div class="customer-id">
          ID: {{ customerData.id }}
        </div>

        <div class="customer-tags">
          <el-tag 
            v-for="tag in customerData.tags" 
            :key="tag"
            size="mini"
            style="margin-right: 4px; margin-bottom: 4px;"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
    </div>

    <!-- 联系方式 -->
    <div class="info-section">
      <div class="section-title">
        <i class="el-icon-phone"></i>
        联系方式
      </div>
      <div class="section-content">
        <div v-if="customerData?.phone" class="info-item">
          <span class="label">手机号:</span>
          <span class="value">{{ customerData.phone }}</span>
          <el-button 
            type="text" 
            size="mini" 
            icon="el-icon-phone"
            @click="makeCall(customerData.phone)"
          />
        </div>
        <div v-if="customerData?.email" class="info-item">
          <span class="label">邮箱:</span>
          <span class="value">{{ customerData.email }}</span>
          <el-button 
            type="text" 
            size="mini" 
            icon="el-icon-message"
            @click="sendEmail(customerData.email)"
          />
        </div>
        <div v-if="customerData?.wechat" class="info-item">
          <span class="label">微信:</span>
          <span class="value">{{ customerData.wechat }}</span>
        </div>
      </div>
    </div>

    <!-- 客户统计 -->
    <div class="info-section">
      <div class="section-title">
        <i class="el-icon-data-analysis"></i>
        客户统计
      </div>
      <div class="section-content">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ customerData?.orderCount || 0 }}</div>
            <div class="stat-label">订单数量</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">¥{{ formatAmount(customerData?.totalAmount) }}</div>
            <div class="stat-label">消费金额</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ customerData?.chatCount || 0 }}</div>
            <div class="stat-label">咨询次数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ customerData?.satisfactionRate || 0 }}%</div>
            <div class="stat-label">满意度</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近订单 -->
    <div class="info-section">
      <div class="section-title">
        <i class="el-icon-shopping-cart-2"></i>
        最近订单
        <el-button 
          type="text" 
          size="mini"
          @click="viewAllOrders"
        >
          查看全部
        </el-button>
      </div>
      <div class="section-content">
        <div v-if="recentOrders.length > 0" class="orders-list">
          <div 
            v-for="order in recentOrders" 
            :key="order.id"
            class="order-item"
            @click="viewOrderDetail(order.id)"
          >
            <div class="order-info">
              <div class="order-number">{{ order.orderSn }}</div>
              <div class="order-time">{{ formatDate(order.createTime) }}</div>
            </div>
            <div class="order-amount">¥{{ formatAmount(order.totalAmount) }}</div>
            <el-tag 
              :type="getOrderStatusType(order.status)"
              size="mini"
            >
              {{ getOrderStatusText(order.status) }}
            </el-tag>
          </div>
        </div>
        <div v-else class="no-orders">
          暂无订单记录
        </div>
      </div>
    </div>

    <!-- 历史会话 -->
    <div class="info-section">
      <div class="section-title">
        <i class="el-icon-chat-dot-round"></i>
        历史会话
        <el-button 
          type="text" 
          size="mini"
          @click="viewChatHistory"
        >
          查看全部
        </el-button>
      </div>
      <div class="section-content">
        <div v-if="chatHistory.length > 0" class="chat-history">
          <div 
            v-for="chat in chatHistory" 
            :key="chat.id"
            class="chat-item"
          >
            <div class="chat-info">
              <div class="chat-date">{{ formatDate(chat.createTime) }}</div>
              <div class="chat-service">客服: {{ chat.serviceName }}</div>
            </div>
            <div class="chat-summary">{{ chat.summary }}</div>
          </div>
        </div>
        <div v-else class="no-history">
          暂无历史会话
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="info-actions">
      <el-button 
        type="primary" 
        size="small"
        icon="el-icon-edit"
        @click="editCustomer"
      >
        编辑客户
      </el-button>
      <el-button 
        size="small"
        icon="el-icon-document"
        @click="exportCustomerData"
      >
        导出数据
      </el-button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading && !customerData" class="loading-state">
      <el-skeleton :rows="6" animated />
    </div>

    <!-- 无数据状态 -->
    <div v-if="!loading && !customerData" class="empty-state">
      <i class="el-icon-user"></i>
      <p>请选择一个会话查看客户信息</p>
    </div>
  </div>
</template>

<script>
import { getCustomerInfo } from '@/api/customerService'

export default {
  name: 'CustomerInfo',

  props: {
    customerId: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      customerData: null,
      recentOrders: [],
      chatHistory: [],
      loading: false
    }
  },

  watch: {
    customerId: {
      handler(newId) {
        if (newId) {
          this.loadCustomerInfo()
        } else {
          this.customerData = null
          this.recentOrders = []
          this.chatHistory = []
        }
      },
      immediate: true
    }
  },

  methods: {
    // 加载客户信息
    async loadCustomerInfo() {
      if (!this.customerId) return

      this.loading = true
      try {
        const response = await getCustomerInfo(this.customerId)
        if (response.data) {
          this.customerData = response.data.customer
          this.recentOrders = response.data.recentOrders || []
          this.chatHistory = response.data.chatHistory || []
        }
      } catch (error) {
        console.error('加载客户信息失败:', error)
        this.$message.error('加载客户信息失败')
      } finally {
        this.loading = false
      }
    },

    // 刷新客户信息
    async refreshCustomerInfo() {
      await this.loadCustomerInfo()
      this.$message.success('客户信息已刷新')
    },

    // 拨打电话
    makeCall(phone) {
      window.open(`tel:${phone}`)
    },

    // 发送邮件
    sendEmail(email) {
      window.open(`mailto:${email}`)
    },

    // 查看所有订单
    viewAllOrders() {
      this.$router.push(`/oms/order?customerId=${this.customerId}`)
    },

    // 查看订单详情
    viewOrderDetail(orderId) {
      this.$router.push(`/oms/order/detail/${orderId}`)
    },

    // 查看聊天历史
    viewChatHistory() {
      this.$message.info('聊天历史功能开发中')
    },

    // 编辑客户
    editCustomer() {
      this.$message.info('编辑客户功能开发中')
    },

    // 导出客户数据
    exportCustomerData() {
      this.$message.info('导出数据功能开发中')
    },

    // 格式化金额
    formatAmount(amount) {
      if (!amount) return '0.00'
      return Number(amount).toFixed(2)
    },

    // 格式化日期
    formatDate(timestamp) {
      if (!timestamp) return ''
      return new Date(timestamp).toLocaleDateString()
    },

    // 获取订单状态类型
    getOrderStatusType(status) {
      const typeMap = {
        'pending': 'warning',
        'paid': 'success',
        'shipped': 'primary',
        'delivered': 'success',
        'cancelled': 'danger',
        'refunded': 'info'
      }
      return typeMap[status] || 'info'
    },

    // 获取订单状态文本
    getOrderStatusText(status) {
      const textMap = {
        'pending': '待支付',
        'paid': '已支付',
        'shipped': '已发货',
        'delivered': '已收货',
        'cancelled': '已取消',
        'refunded': '已退款'
      }
      return textMap[status] || '未知'
    }
  }
}
</script>

<style lang="scss" scoped>
.customer-info {
  padding: 16px;
  background: #fff;
  height: 100%;
  overflow-y: auto;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;

  h3 {
    margin: 0;
    font-size: 16px;
    color: #303133;
  }
}

.customer-basic {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;

  .customer-avatar {
    position: relative;
    margin-right: 16px;

    .online-status {
      position: absolute;
      bottom: 4px;
      right: 4px;
      width: 16px;
      height: 16px;
      background: #67C23A;
      border: 3px solid #fff;
      border-radius: 50%;
    }
  }

  .customer-details {
    flex: 1;

    .customer-name {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .customer-id {
      font-size: 12px;
      color: #909399;
      margin-bottom: 8px;
    }

    .customer-tags {
      margin-top: 8px;
    }
  }
}

.info-section {
  margin-bottom: 20px;

  .section-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;

    i {
      margin-right: 6px;
      color: #409EFF;
    }
  }

  .section-content {
    font-size: 13px;
  }
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;

  .label {
    color: #666;
    width: 60px;
    flex-shrink: 0;
  }

  .value {
    flex: 1;
    color: #303133;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  .stat-item {
    text-align: center;
    padding: 12px;
    background: #f9f9f9;
    border-radius: 6px;

    .stat-value {
      font-size: 16px;
      font-weight: 600;
      color: #409EFF;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 12px;
      color: #666;
    }
  }
}

.orders-list, .chat-history {
  .order-item, .chat-item {
    padding: 8px 0;
    border-bottom: 1px solid #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;

    &:hover {
      background: #f9f9f9;
    }

    &:last-child {
      border-bottom: none;
    }
  }
}

.order-item {
  .order-info {
    flex: 1;

    .order-number {
      font-weight: 500;
      color: #303133;
      margin-bottom: 2px;
    }

    .order-time {
      font-size: 12px;
      color: #909399;
    }
  }

  .order-amount {
    font-weight: 500;
    color: #409EFF;
    margin-right: 8px;
  }
}

.chat-item {
  flex-direction: column;
  align-items: flex-start;

  .chat-info {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 4px;

    .chat-date {
      font-size: 12px;
      color: #909399;
    }

    .chat-service {
      font-size: 12px;
      color: #666;
    }
  }

  .chat-summary {
    color: #666;
    font-size: 12px;
    line-height: 1.4;
  }
}

.no-orders, .no-history {
  text-align: center;
  color: #999;
  padding: 20px;
  font-size: 12px;
}

.info-actions {
  margin-top: 20px;
  display: flex;
  gap: 8px;

  .el-button {
    flex: 1;
  }
}

.loading-state {
  padding: 20px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;

  i {
    font-size: 48px;
    margin-bottom: 16px;
    display: block;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
}
</style>