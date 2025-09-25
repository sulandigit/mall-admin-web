<template>
  <div class="app-container">
    <!-- Dashboard Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="dashboard-title">实时销售指标Dashboard</h1>
          <p class="dashboard-subtitle">实时监控销售业绩，助力数据驱动决策</p>
        </div>
        <div class="header-controls">
          <div class="connection-status">
            <el-badge 
              :value="unreadAlertsCount" 
              :hidden="unreadAlertsCount === 0"
              class="alerts-badge"
            >
              <el-button 
                size="small" 
                icon="el-icon-bell"
                @click="showAlerts = !showAlerts"
                :type="unreadAlertsCount > 0 ? 'warning' : 'default'"
              >
                告警
              </el-button>
            </el-badge>
            
            <el-switch
              v-model="isRealTimeEnabled"
              active-text="实时更新"
              inactive-text="暂停更新"
              @change="handleRealTimeToggle"
            />
            
            <div class="connection-indicator" :class="connectionStatusClass">
              <i :class="connectionIcon"></i>
              <span>{{ connectionText }}</span>
            </div>
          </div>
          
          <el-button 
            size="small" 
            icon="el-icon-refresh"
            @click="handleRefreshAll"
            :loading="loading"
          >
            刷新全部
          </el-button>
        </div>
      </div>
    </div>

    <!-- KPI Cards Section -->
    <div class="kpi-section">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <TodaySalesCard @drill-down="handleDrillDown" />
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <OrderCountCard @drill-down="handleDrillDown" />
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <ConversionRateCard @drill-down="handleDrillDown" />
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <RevenueCard @drill-down="handleDrillDown" />
        </el-col>
      </el-row>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <el-row :gutter="20">
        <el-col :xs="24" :lg="16">
          <SalesTimeSeriesChart />
        </el-col>
        <el-col :xs="24" :lg="8">
          <ProductCategoryChart />
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :xs="24" :lg="12">
          <RegionalSalesChart />
        </el-col>
        <el-col :xs="24" :lg="12">
          <HourlyTrendChart />
        </el-col>
      </el-row>
    </div>

    <!-- Tables Section -->
    <div class="tables-section">
      <el-row :gutter="20">
        <el-col :xs="24" :lg="14">
          <TopProductsTable 
            @view-detail="handleProductDetail"
          />
        </el-col>
        <el-col :xs="24" :lg="10">
          <RecentOrdersTable 
            @view-all="handleViewAllOrders"
            @view-order="handleViewOrder"
            @process-order="handleProcessOrder"
          />
        </el-col>
      </el-row>
    </div>

    <!-- Alerts Panel -->
    <el-drawer
      title="系统告警"
      :visible.sync="showAlerts"
      direction="rtl"
      size="400px"
    >
      <div class="alerts-panel">
        <div class="alerts-header">
          <el-button 
            type="text" 
            size="small"
            @click="handleClearAlerts"
            :disabled="alerts.length === 0"
          >
            清空全部
          </el-button>
        </div>
        
        <div class="alerts-list" v-if="alerts.length > 0">
          <div 
            v-for="alert in alerts" 
            :key="alert.id"
            class="alert-item"
            :class="`alert-${alert.level}`"
          >
            <div class="alert-header">
              <span class="alert-title">{{ alert.title }}</span>
              <el-button 
                type="text" 
                size="mini"
                icon="el-icon-close"
                @click="handleRemoveAlert(alert.id)"
              />
            </div>
            <div class="alert-message">{{ alert.message }}</div>
            <div class="alert-time">{{ formatAlertTime(alert.timestamp) }}</div>
          </div>
        </div>
        
        <el-empty 
          v-else
          description="暂无告警信息"
          :image-size="80"
        />
      </div>
    </el-drawer>

    <!-- Loading Overlay -->
    <div v-if="loading" class="dashboard-loading">
      <el-loading 
        :visible="loading"
        background="rgba(255, 255, 255, 0.8)"
        text="正在加载数据..."
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

// Import KPI Components
import TodaySalesCard from '@/components/Dashboard/TodaySalesCard.vue'
import OrderCountCard from '@/components/Dashboard/OrderCountCard.vue'
import ConversionRateCard from '@/components/Dashboard/ConversionRateCard.vue'
import RevenueCard from '@/components/Dashboard/RevenueCard.vue'

// Import Chart Components
import SalesTimeSeriesChart from '@/components/Dashboard/SalesTimeSeriesChart.vue'
import ProductCategoryChart from '@/components/Dashboard/ProductCategoryChart.vue'
import RegionalSalesChart from '@/components/Dashboard/RegionalSalesChart.vue'
import HourlyTrendChart from '@/components/Dashboard/HourlyTrendChart.vue'

// Import Table Components
import TopProductsTable from '@/components/Dashboard/TopProductsTable.vue'
import RecentOrdersTable from '@/components/Dashboard/RecentOrdersTable.vue'

export default {
  name: 'RealTimeSalesDashboard',
  
  components: {
    TodaySalesCard,
    OrderCountCard,
    ConversionRateCard,
    RevenueCard,
    SalesTimeSeriesChart,
    ProductCategoryChart,
    RegionalSalesChart,
    HourlyTrendChart,
    TopProductsTable,
    RecentOrdersTable
  },
  
  data() {
    return {
      showAlerts: false
    }
  },
  
  computed: {
    ...mapState('salesDashboard', ['uiState', 'alerts']),
    ...mapGetters('salesDashboard', ['isConnected', 'unreadAlertsCount']),
    
    loading() {
      return this.uiState.loading
    },
    
    isRealTimeEnabled: {
      get() {
        return this.uiState.isRealTimeEnabled
      },
      set(value) {
        this.$store.commit('salesDashboard/TOGGLE_REAL_TIME')
      }
    },
    
    connectionStatusClass() {
      return {
        'status-connected': this.uiState.connectionStatus === 'connected',
        'status-connecting': this.uiState.connectionStatus === 'connecting',
        'status-disconnected': this.uiState.connectionStatus === 'disconnected'
      }
    },
    
    connectionIcon() {
      switch (this.uiState.connectionStatus) {
        case 'connected':
          return 'el-icon-success'
        case 'connecting':
          return 'el-icon-loading'
        default:
          return 'el-icon-error'
      }
    },
    
    connectionText() {
      switch (this.uiState.connectionStatus) {
        case 'connected':
          return '已连接'
        case 'connecting':
          return '连接中'
        default:
          return '已断开'
      }
    }
  },
  
  async mounted() {
    // 初始化Dashboard
    await this.initDashboard()
    
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
  },
  
  beforeDestroy() {
    // 清理事件监听
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    
    // 断开WebSocket连接
    this.disconnectWebSocket()
  },
  
  methods: {
    ...mapActions('salesDashboard', [
      'initDashboard',
      'connectWebSocket',
      'disconnectWebSocket',
      'fetchKPIMetrics',
      'fetchHistoricalData',
      'fetchProductPerformance',
      'fetchRegionalSales',
      'fetchRecentOrders'
    ]),
    
    async handleRefreshAll() {
      try {
        await Promise.all([
          this.fetchKPIMetrics(),
          this.fetchHistoricalData(),
          this.fetchProductPerformance(),
          this.fetchRegionalSales(),
          this.fetchRecentOrders()
        ])
        
        this.$message.success('数据刷新成功')
      } catch (error) {
        this.$message.error('数据刷新失败: ' + error.message)
      }
    },
    
    handleRealTimeToggle(enabled) {
      if (enabled) {
        this.connectWebSocket()
        this.$message.success('已开启实时更新')
      } else {
        this.disconnectWebSocket()
        this.$message.info('已暂停实时更新')
      }
    },
    
    handleDrillDown(type) {
      // 处理KPI卡片的钻取操作
      switch (type) {
        case 'sales-detail':
          this.$router.push('/sales/detail')
          break
        case 'order-detail':
          this.$router.push('/oms/order')
          break
        case 'conversion-detail':
          this.$router.push('/analytics/conversion')
          break
        case 'revenue-detail':
          this.$router.push('/analytics/revenue')
          break
        default:
          console.log('未知的钻取类型:', type)
      }
    },
    
    handleProductDetail(product) {
      // 查看商品详情
      this.$router.push(`/pms/product/detail/${product.id}`)
    },
    
    handleViewAllOrders() {
      // 查看所有订单
      this.$router.push('/oms/order')
    },
    
    handleViewOrder(order) {
      // 查看订单详情
      this.$router.push(`/oms/order/detail/${order.id}`)
    },
    
    handleProcessOrder(order) {
      // 处理订单
      this.$router.push(`/oms/order/process/${order.id}`)
    },
    
    handleClearAlerts() {
      this.$store.commit('salesDashboard/CLEAR_ALERTS')
      this.$message.success('已清空所有告警')
    },
    
    handleRemoveAlert(alertId) {
      this.$store.commit('salesDashboard/REMOVE_ALERT', alertId)
    },
    
    formatAlertTime(timestamp) {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) return '刚刚'
      if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
      return date.toLocaleDateString('zh-CN')
    },
    
    handleVisibilityChange() {
      // 页面可见性变化时的处理
      if (document.hidden) {
        // 页面不可见时暂停实时更新
        if (this.isRealTimeEnabled) {
          this.disconnectWebSocket()
        }
      } else {
        // 页面可见时恢复实时更新
        if (this.isRealTimeEnabled) {
          this.connectWebSocket()
          this.handleRefreshAll()
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
  padding: 20px;
}

.dashboard-header {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .title-section {
      .dashboard-title {
        font-size: 24px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 8px 0;
      }
      
      .dashboard-subtitle {
        font-size: 14px;
        color: #909399;
        margin: 0;
      }
    }
    
    .header-controls {
      display: flex;
      align-items: center;
      gap: 16px;
      
      .connection-status {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .alerts-badge {
          :deep(.el-badge__content) {
            background: #F56C6C;
            border: 1px solid #F56C6C;
          }
        }
        
        .connection-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 4px;
          
          &.status-connected {
            color: #67C23A;
            background: rgba(103, 194, 58, 0.1);
          }
          
          &.status-connecting {
            color: #E6A23C;
            background: rgba(230, 162, 60, 0.1);
          }
          
          &.status-disconnected {
            color: #F56C6C;
            background: rgba(245, 108, 108, 0.1);
          }
        }
      }
    }
  }
}

.kpi-section {
  margin-bottom: 20px;
}

.charts-section {
  margin-bottom: 20px;
}

.tables-section {
  margin-bottom: 20px;
}

.alerts-panel {
  padding: 0 20px 20px;
  
  .alerts-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #EBEEF5;
  }
  
  .alerts-list {
    .alert-item {
      padding: 16px;
      margin-bottom: 12px;
      border-radius: 6px;
      border-left: 4px solid;
      
      &.alert-high {
        background: rgba(245, 108, 108, 0.1);
        border-left-color: #F56C6C;
      }
      
      &.alert-medium {
        background: rgba(230, 162, 60, 0.1);
        border-left-color: #E6A23C;
      }
      
      &.alert-low {
        background: rgba(64, 158, 255, 0.1);
        border-left-color: #409EFF;
      }
      
      .alert-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        
        .alert-title {
          font-weight: 500;
          color: #303133;
        }
      }
      
      .alert-message {
        font-size: 14px;
        color: #606266;
        margin-bottom: 8px;
        line-height: 1.5;
      }
      
      .alert-time {
        font-size: 12px;
        color: #C0C4CC;
      }
    }
  }
}

.dashboard-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
}

// 响应式设计
@media (max-width: 768px) {
  .app-container {
    padding: 12px;
  }
  
  .dashboard-header {
    padding: 16px;
    
    .header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
      
      .header-controls {
        width: 100%;
        justify-content: space-between;
        
        .connection-status {
          flex-wrap: wrap;
        }
      }
    }
  }
  
  .alerts-panel {
    padding: 0 12px 12px;
  }
}

@media (max-width: 480px) {
  .dashboard-header {
    .header-content {
      .header-controls {
        flex-direction: column;
        align-items: stretch;
        
        .connection-status {
          justify-content: space-between;
        }
      }
    }
  }
}
</style>