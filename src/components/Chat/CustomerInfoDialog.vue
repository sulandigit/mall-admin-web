<template>
  <el-dialog
    title="客户详细信息"
    :visible.sync="dialogVisible"
    width="800px"
    :before-close="handleClose"
  >
    <div v-if="customerData" class="customer-detail">
      <!-- 客户基本信息 -->
      <el-card class="info-card">
        <div slot="header">
          <span>基本信息</span>
          <el-button style="float: right; padding: 3px 0" type="text" @click="editCustomer">
            编辑
          </el-button>
        </div>
        
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="customer-avatar-large">
              <el-avatar 
                :src="customerData.avatar"
                :size="80"
                icon="el-icon-user-solid"
              />
              <div 
                v-if="customerData.online"
                class="online-indicator-large"
              ></div>
            </div>
          </el-col>
          <el-col :span="18">
            <div class="customer-info-grid">
              <div class="info-row">
                <span class="label">客户姓名:</span>
                <span class="value">{{ customerData.name }}</span>
              </div>
              <div class="info-row">
                <span class="label">客户ID:</span>
                <span class="value">{{ customerData.id }}</span>
              </div>
              <div class="info-row">
                <span class="label">VIP等级:</span>
                <el-tag v-if="customerData.vipLevel" type="warning">
                  VIP{{ customerData.vipLevel }}
                </el-tag>
                <span v-else class="value">普通客户</span>
              </div>
              <div class="info-row">
                <span class="label">注册时间:</span>
                <span class="value">{{ formatDateTime(customerData.registerTime) }}</span>
              </div>
              <div class="info-row">
                <span class="label">最后活跃:</span>
                <span class="value">{{ formatDateTime(customerData.lastActiveTime) }}</span>
              </div>
              <div class="info-row">
                <span class="label">客户标签:</span>
                <div class="tags-container">
                  <el-tag 
                    v-for="tag in customerData.tags" 
                    :key="tag"
                    size="small"
                    style="margin-right: 8px; margin-bottom: 4px;"
                  >
                    {{ tag }}
                  </el-tag>
                  <el-tag 
                    v-if="!customerData.tags || customerData.tags.length === 0"
                    type="info"
                    size="small"
                  >
                    无标签
                  </el-tag>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 联系方式 -->
      <el-card class="info-card">
        <div slot="header">联系方式</div>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="contact-item">
              <i class="el-icon-phone contact-icon"></i>
              <div class="contact-info">
                <div class="contact-label">手机号码</div>
                <div class="contact-value">{{ customerData.phone || '未填写' }}</div>
              </div>
              <el-button 
                v-if="customerData.phone"
                type="text" 
                icon="el-icon-phone"
                @click="makeCall(customerData.phone)"
              />
            </div>
          </el-col>
          <el-col :span="8">
            <div class="contact-item">
              <i class="el-icon-message contact-icon"></i>
              <div class="contact-info">
                <div class="contact-label">邮箱地址</div>
                <div class="contact-value">{{ customerData.email || '未填写' }}</div>
              </div>
              <el-button 
                v-if="customerData.email"
                type="text" 
                icon="el-icon-message"
                @click="sendEmail(customerData.email)"
              />
            </div>
          </el-col>
          <el-col :span="8">
            <div class="contact-item">
              <i class="el-icon-chat-dot-round contact-icon"></i>
              <div class="contact-info">
                <div class="contact-label">微信号</div>
                <div class="contact-value">{{ customerData.wechat || '未绑定' }}</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 收货地址 -->
      <el-card class="info-card">
        <div slot="header">收货地址</div>
        <div v-if="customerData.addresses && customerData.addresses.length > 0">
          <div 
            v-for="(address, index) in customerData.addresses" 
            :key="index"
            class="address-item"
          >
            <div class="address-header">
              <span class="address-name">{{ address.receiverName }}</span>
              <span class="address-phone">{{ address.phone }}</span>
              <el-tag v-if="address.defaultStatus" type="success" size="mini">默认</el-tag>
            </div>
            <div class="address-detail">
              {{ address.province }}{{ address.city }}{{ address.region }}{{ address.detailAddress }}
            </div>
          </div>
        </div>
        <div v-else class="no-data">暂无收货地址</div>
      </el-card>

      <!-- 统计数据 -->
      <el-card class="info-card">
        <div slot="header">客户统计</div>
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ customerData.orderCount || 0 }}</div>
              <div class="stat-label">总订单数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">¥{{ formatAmount(customerData.totalAmount) }}</div>
              <div class="stat-label">消费总额</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ customerData.chatCount || 0 }}</div>
              <div class="stat-label">咨询次数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ customerData.satisfactionRate || 0 }}%</div>
              <div class="stat-label">满意度</div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 最近订单 -->
      <el-card class="info-card">
        <div slot="header">
          <span>最近订单</span>
          <el-button style="float: right; padding: 3px 0" type="text" @click="viewAllOrders">
            查看全部
          </el-button>
        </div>
        <el-table 
          :data="recentOrders" 
          style="width: 100%"
          max-height="300"
        >
          <el-table-column prop="orderSn" label="订单号" />
          <el-table-column prop="totalAmount" label="订单金额">
            <template slot-scope="scope">
              ¥{{ formatAmount(scope.row.totalAmount) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="订单状态">
            <template slot-scope="scope">
              <el-tag :type="getOrderStatusType(scope.row.status)" size="mini">
                {{ getOrderStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="下单时间">
            <template slot-scope="scope">
              {{ formatDateTime(scope.row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template slot-scope="scope">
              <el-button 
                type="text" 
                size="mini"
                @click="viewOrderDetail(scope.row.id)"
              >
                查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="!recentOrders || recentOrders.length === 0" class="no-data">
          暂无订单记录
        </div>
      </el-card>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <div slot="footer">
      <el-button @click="handleClose">关闭</el-button>
      <el-button type="primary" @click="exportCustomerData">导出数据</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getCustomerInfo } from '@/api/customerService'

export default {
  name: 'CustomerInfoDialog',

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    customerId: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      customerData: null,
      recentOrders: [],
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
    visible(newVal) {
      if (newVal && this.customerId) {
        this.loadCustomerDetail()
      }
    }
  },

  methods: {
    // 加载客户详细信息
    async loadCustomerDetail() {
      if (!this.customerId) return

      this.loading = true
      try {
        const response = await getCustomerInfo(this.customerId)
        if (response.data) {
          this.customerData = response.data.customer
          this.recentOrders = response.data.recentOrders || []
        }
      } catch (error) {
        console.error('加载客户详细信息失败:', error)
        this.$message.error('加载客户信息失败')
      } finally {
        this.loading = false
      }
    },

    // 关闭对话框
    handleClose() {
      this.dialogVisible = false
      this.customerData = null
      this.recentOrders = []
    },

    // 编辑客户
    editCustomer() {
      this.$message.info('编辑客户功能开发中')
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
      this.handleClose()
    },

    // 查看订单详情
    viewOrderDetail(orderId) {
      this.$router.push(`/oms/order/detail/${orderId}`)
      this.handleClose()
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

    // 格式化日期时间
    formatDateTime(timestamp) {
      if (!timestamp) return ''
      return new Date(timestamp).toLocaleString()
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
.customer-detail {
  .info-card {
    margin-bottom: 16px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.customer-avatar-large {
  position: relative;
  display: inline-block;

  .online-indicator-large {
    position: absolute;
    bottom: 4px;
    right: 4px;
    width: 20px;
    height: 20px;
    background: #67C23A;
    border: 3px solid #fff;
    border-radius: 50%;
  }
}

.customer-info-grid {
  .info-row {
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

    .tags-container {
      flex: 1;
    }
  }
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  background: #fafafa;

  .contact-icon {
    font-size: 24px;
    color: #409EFF;
    margin-right: 12px;
  }

  .contact-info {
    flex: 1;

    .contact-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 2px;
    }

    .contact-value {
      font-size: 14px;
      color: #303133;
      font-weight: 500;
    }
  }
}

.address-item {
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }

  .address-header {
    display: flex;
    align-items: center;
    margin-bottom: 6px;

    .address-name {
      font-weight: 500;
      margin-right: 12px;
    }

    .address-phone {
      color: #666;
      margin-right: 12px;
    }
  }

  .address-detail {
    color: #666;
    font-size: 13px;
  }
}

.stat-card {
  text-align: center;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 6px;

  .stat-number {
    font-size: 24px;
    font-weight: 600;
    color: #409EFF;
    margin-bottom: 8px;
  }

  .stat-label {
    font-size: 14px;
    color: #666;
  }
}

.no-data {
  text-align: center;
  color: #999;
  padding: 20px;
  font-size: 14px;
}

.loading-container {
  padding: 20px;
}

::v-deep .el-card__header {
  padding: 12px 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

::v-deep .el-card__body {
  padding: 16px;
}
</style>