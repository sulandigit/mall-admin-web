<template>
  <el-card class="table-card">
    <div slot="header" class="table-header">
      <span class="table-title">最新订单</span>
      <div class="table-controls">
        <el-button 
          size="mini" 
          icon="el-icon-refresh" 
          @click="handleRefresh"
          :loading="loading"
        >
          刷新
        </el-button>
        <el-button 
          size="mini" 
          icon="el-icon-view"
          @click="handleViewAll"
        >
          查看全部
        </el-button>
      </div>
    </div>
    
    <el-table 
      :data="tableData" 
      v-loading="loading"
      stripe
      style="width: 100%"
    >
      <el-table-column 
        prop="id" 
        label="订单号"
        width="180"
        show-overflow-tooltip
      >
        <template slot-scope="{ row }">
          <span class="order-id">{{ row.id }}</span>
        </template>
      </el-table-column>
      
      <el-table-column 
        prop="customerName" 
        label="客户姓名"
        width="120"
      >
        <template slot-scope="{ row }">
          <div class="customer-info">
            <i class="el-icon-user"></i>
            <span>{{ row.customerName }}</span>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column 
        prop="amount" 
        label="订单金额" 
        width="120"
        align="right"
        sortable
      >
        <template slot-scope="{ row }">
          <span class="order-amount">¥{{ row.amount.toLocaleString() }}</span>
        </template>
      </el-table-column>
      
      <el-table-column 
        prop="status" 
        label="订单状态" 
        width="100"
        align="center"
      >
        <template slot-scope="{ row }">
          <el-tag 
            :type="getStatusType(row.status)"
            size="small"
          >
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column 
        prop="createTime" 
        label="下单时间" 
        width="160"
        sortable
      >
        <template slot-scope="{ row }">
          <div class="time-info">
            <div class="time">{{ formatTime(row.createTime) }}</div>
            <div class="relative-time">{{ getRelativeTime(row.createTime) }}</div>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column 
        label="操作" 
        width="120"
        align="center"
      >
        <template slot-scope="{ row }">
          <el-button 
            type="text" 
            size="small"
            @click="handleViewOrder(row)"
          >
            查看
          </el-button>
          <el-button 
            type="text" 
            size="small"
            @click="handleProcessOrder(row)"
            v-if="canProcess(row.status)"
          >
            处理
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <div class="table-footer">
      <div class="order-summary">
        <div class="summary-item">
          <span class="label">今日订单:</span>
          <span class="value">{{ todayOrdersCount }}</span>
        </div>
        <div class="summary-item">
          <span class="label">今日金额:</span>
          <span class="value">¥{{ todayAmount.toLocaleString() }}</span>
        </div>
        <div class="summary-item">
          <span class="label">待处理:</span>
          <span class="value pending">{{ pendingCount }}</span>
        </div>
      </div>
      <div class="last-update">
        最后更新: {{ lastUpdateText }}
      </div>
    </div>
  </el-card>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'RecentOrdersTable',
  
  computed: {
    ...mapState('salesDashboard', ['recentOrders', 'uiState', 'realTimeData']),
    
    loading() {
      return this.uiState.loading
    },
    
    tableData() {
      return this.recentOrders.slice(0, 10) // 只显示最新10条
    },
    
    todayOrdersCount() {
      const today = new Date().toDateString()
      return this.recentOrders.filter(order => {
        const orderDate = new Date(order.createTime).toDateString()
        return orderDate === today
      }).length
    },
    
    todayAmount() {
      const today = new Date().toDateString()
      return this.recentOrders
        .filter(order => {
          const orderDate = new Date(order.createTime).toDateString()
          return orderDate === today
        })
        .reduce((sum, order) => sum + order.amount, 0)
    },
    
    pendingCount() {
      return this.recentOrders.filter(order => 
        ['待付款', '待发货'].includes(order.status)
      ).length
    },
    
    lastUpdateText() {
      const lastUpdate = this.realTimeData.lastUpdateTime
      if (!lastUpdate) return '暂无数据'
      
      const date = new Date(lastUpdate)
      return date.toLocaleString('zh-CN')
    }
  },
  
  methods: {
    getStatusType(status) {
      const statusMap = {
        '待付款': 'warning',
        '已付款': 'success',
        '已发货': 'primary',
        '已完成': 'success'
      }
      return statusMap[status] || 'info'
    },
    
    formatTime(timeStr) {
      const date = new Date(timeStr)
      return date.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    getRelativeTime(timeStr) {
      const date = new Date(timeStr)
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) return '刚刚'
      if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
      return `${Math.floor(diff / 86400000)}天前`
    },
    
    canProcess(status) {
      return ['待付款', '待发货'].includes(status)
    },
    
    handleRefresh() {
      this.$store.dispatch('salesDashboard/fetchRecentOrders')
    },
    
    handleViewAll() {
      this.$emit('view-all')
      // 可以跳转到订单列表页面
      // this.$router.push('/oms/order')
    },
    
    handleViewOrder(order) {
      this.$emit('view-order', order)
    },
    
    handleProcessOrder(order) {
      this.$emit('process-order', order)
    }
  }
}
</script>

<style lang="scss" scoped>
.table-card {
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .table-title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }
    
    .table-controls {
      display: flex;
      gap: 8px;
    }
  }
  
  .order-id {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 12px;
    color: #409EFF;
    font-weight: 500;
  }
  
  .customer-info {
    display: flex;
    align-items: center;
    
    i {
      margin-right: 4px;
      color: #909399;
      font-size: 12px;
    }
  }
  
  .order-amount {
    font-weight: 500;
    color: #67C23A;
  }
  
  .time-info {
    .time {
      font-size: 13px;
      color: #303133;
      margin-bottom: 2px;
    }
    
    .relative-time {
      font-size: 11px;
      color: #909399;
    }
  }
  
  .table-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    border-top: 1px solid #EBEEF5;
    font-size: 12px;
    
    .order-summary {
      display: flex;
      gap: 24px;
      
      .summary-item {
        display: flex;
        align-items: center;
        
        .label {
          color: #909399;
          margin-right: 4px;
        }
        
        .value {
          font-weight: 500;
          color: #303133;
          
          &.pending {
            color: #E6A23C;
          }
        }
      }
    }
    
    .last-update {
      color: #C0C4CC;
    }
  }
}

@media (max-width: 768px) {
  .table-card {
    .table-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      
      .table-controls {
        align-self: flex-end;
      }
    }
    
    .table-footer {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      
      .order-summary {
        flex-direction: column;
        gap: 8px;
        width: 100%;
      }
    }
  }
}

:deep(.el-table) {
  .el-table__row {
    &:hover {
      .order-id {
        color: #66b1ff;
      }
    }
  }
}
</style>