<template>
  <div class="dashboard-container">
    <!-- 头部标题区域 -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">商城运营数据大屏</h1>
      <div class="dashboard-time">
        <span>{{ currentTime }}</span>
        <el-button 
          type="primary" 
          size="small" 
          @click="toggleFullscreen"
          class="fullscreen-btn"
        >
          <i :class="isFullscreen ? 'el-icon-close' : 'el-icon-full-screen'"></i>
          {{ isFullscreen ? '退出全屏' : '全屏显示' }}
        </el-button>
      </div>
    </div>

    <!-- 核心指标卡片区域 -->
    <div class="metrics-row">
      <div class="metric-card" v-for="metric in metrics" :key="metric.key">
        <div class="metric-icon">
          <i :class="metric.icon"></i>
        </div>
        <div class="metric-content">
          <div class="metric-value">{{ metric.value }}</div>
          <div class="metric-label">{{ metric.label }}</div>
          <div class="metric-change" :class="{'positive': metric.change > 0, 'negative': metric.change < 0}">
            <i :class="metric.change > 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
            {{ Math.abs(metric.change) }}%
          </div>
        </div>
      </div>
    </div>

    <!-- 图表展示区域 -->
    <div class="charts-container">
      <div class="chart-row">
        <!-- 销售趋势图 -->
        <div class="chart-card large">
          <div class="chart-header">
            <h3>销售趋势分析</h3>
            <el-radio-group v-model="salesPeriod" size="small">
              <el-radio-button label="day">今日</el-radio-button>
              <el-radio-button label="week">本周</el-radio-button>
              <el-radio-button label="month">本月</el-radio-button>
            </el-radio-group>
          </div>
          <div class="chart-content">
            <sales-trend-chart :period="salesPeriod" ref="salesChart"></sales-trend-chart>
          </div>
        </div>

        <!-- 订单状态分布 -->
        <div class="chart-card medium">
          <div class="chart-header">
            <h3>订单状态分布</h3>
          </div>
          <div class="chart-content">
            <order-status-chart ref="orderChart"></order-status-chart>
          </div>
        </div>
      </div>

      <div class="chart-row">
        <!-- 热销商品排行 -->
        <div class="chart-card medium">
          <div class="chart-header">
            <h3>热销商品TOP10</h3>
          </div>
          <div class="chart-content">
            <product-ranking-chart ref="productChart"></product-ranking-chart>
          </div>
        </div>

        <!-- 用户地域分布 -->
        <div class="chart-card medium">
          <div class="chart-header">
            <h3>用户地域分布</h3>
          </div>
          <div class="chart-content">
            <user-location-chart ref="locationChart"></user-location-chart>
          </div>
        </div>
      </div>

      <div class="chart-row">
        <!-- 实时交易数据 -->
        <div class="chart-card large">
          <div class="chart-header">
            <h3>实时交易流水</h3>
          </div>
          <div class="chart-content">
            <real-time-transactions ref="transactionsList"></real-time-transactions>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SalesTrendChart from '@/components/Dashboard/SalesTrendChart'
import OrderStatusChart from '@/components/Dashboard/OrderStatusChart'
import ProductRankingChart from '@/components/Dashboard/ProductRankingChart'
import UserLocationChart from '@/components/Dashboard/UserLocationChart'
import RealTimeTransactions from '@/components/Dashboard/RealTimeTransactions'
import { getDashboardMetrics } from '@/api/dashboard'

export default {
  name: 'Dashboard',
  components: {
    SalesTrendChart,
    OrderStatusChart,
    ProductRankingChart,
    UserLocationChart,
    RealTimeTransactions
  },
  data() {
    return {
      currentTime: '',
      isFullscreen: false,
      salesPeriod: 'day',
      metrics: [
        {
          key: 'totalSales',
          label: '今日销售额',
          value: '0',
          icon: 'el-icon-s-finance',
          change: 0
        },
        {
          key: 'totalOrders',
          label: '今日订单数',
          value: '0',
          icon: 'el-icon-s-order',
          change: 0
        },
        {
          key: 'totalUsers',
          label: '在线用户数',
          value: '0',
          icon: 'el-icon-user',
          change: 0
        },
        {
          key: 'conversionRate',
          label: '转化率',
          value: '0%',
          icon: 'el-icon-s-data',
          change: 0
        }
      ],
      timer: null,
      dataTimer: null
    }
  },
  mounted() {
    this.updateTime()
    this.timer = setInterval(this.updateTime, 1000)
    this.loadMetrics()
    this.dataTimer = setInterval(this.loadMetrics, 30000) // 30秒刷新一次数据
    
    // 监听全屏事件
    document.addEventListener('fullscreenchange', this.onFullscreenChange)
    document.addEventListener('webkitfullscreenchange', this.onFullscreenChange)
    document.addEventListener('mozfullscreenchange', this.onFullscreenChange)
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
    if (this.dataTimer) {
      clearInterval(this.dataTimer)
    }
    
    document.removeEventListener('fullscreenchange', this.onFullscreenChange)
    document.removeEventListener('webkitfullscreenchange', this.onFullscreenChange)
    document.removeEventListener('mozfullscreenchange', this.onFullscreenChange)
  },
  methods: {
    updateTime() {
      const now = new Date()
      this.currentTime = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    },
    async loadMetrics() {
      try {
        const response = await getDashboardMetrics()
        if (response.data && response.data.data) {
          const data = response.data.data
          this.metrics = [
            {
              key: 'totalSales',
              label: '今日销售额',
              value: `¥${(data.totalSales || 0).toLocaleString()}`,
              icon: 'el-icon-s-finance',
              change: data.salesChange || 0
            },
            {
              key: 'totalOrders',
              label: '今日订单数',
              value: (data.totalOrders || 0).toLocaleString(),
              icon: 'el-icon-s-order',
              change: data.ordersChange || 0
            },
            {
              key: 'totalUsers',
              label: '在线用户数',
              value: (data.onlineUsers || 0).toLocaleString(),
              icon: 'el-icon-user',
              change: data.usersChange || 0
            },
            {
              key: 'conversionRate',
              label: '转化率',
              value: `${(data.conversionRate || 0).toFixed(2)}%`,
              icon: 'el-icon-s-data',
              change: data.conversionChange || 0
            }
          ]
        }
      } catch (error) {
        console.error('加载指标数据失败:', error)
        // 使用模拟数据
        this.loadMockMetrics()
      }
    },
    loadMockMetrics() {
      this.metrics = [
        {
          key: 'totalSales',
          label: '今日销售额',
          value: '¥128,560',
          icon: 'el-icon-s-finance',
          change: 12.5
        },
        {
          key: 'totalOrders',
          label: '今日订单数',
          value: '3,247',
          icon: 'el-icon-s-order',
          change: 8.3
        },
        {
          key: 'totalUsers',
          label: '在线用户数',
          value: '1,856',
          icon: 'el-icon-user',
          change: -2.1
        },
        {
          key: 'conversionRate',
          label: '转化率',
          value: '3.28%',
          icon: 'el-icon-s-data',
          change: 5.7
        }
      ]
    },
    toggleFullscreen() {
      if (!this.isFullscreen) {
        const element = this.$el
        if (element.requestFullscreen) {
          element.requestFullscreen()
        } else if (element.webkitRequestFullscreen) {
          element.webkitRequestFullscreen()
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen()
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen()
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen()
        }
      }
    },
    onFullscreenChange() {
      this.isFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0c1022 0%, #1a1f3a 100%);
  color: #ffffff;
  padding: 20px;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  
  &:fullscreen {
    padding: 10px;
  }
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 0 10px;
  
  .dashboard-title {
    font-size: 32px;
    font-weight: 600;
    background: linear-gradient(45deg, #00d4ff, #5b8cff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
  }
  
  .dashboard-time {
    display: flex;
    align-items: center;
    gap: 20px;
    font-size: 18px;
    color: #8892b0;
    
    .fullscreen-btn {
      background: rgba(0, 212, 255, 0.1);
      border: 1px solid rgba(0, 212, 255, 0.3);
      color: #00d4ff;
      
      &:hover {
        background: rgba(0, 212, 255, 0.2);
      }
    }
  }
}

.metrics-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.metric-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(0, 212, 255, 0.3);
    transform: translateY(-2px);
  }
  
  .metric-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    background: linear-gradient(45deg, #00d4ff, #5b8cff);
    display: flex;
    align-items: center;
    justify-content: center;
    
    i {
      font-size: 28px;
      color: #ffffff;
    }
  }
  
  .metric-content {
    flex: 1;
    
    .metric-value {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 4px;
    }
    
    .metric-label {
      font-size: 14px;
      color: #8892b0;
      margin-bottom: 8px;
    }
    
    .metric-change {
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
      
      &.positive {
        color: #67c23a;
      }
      
      &.negative {
        color: #f56c6c;
      }
    }
  }
}

.charts-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chart-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  
  &:last-child {
    grid-template-columns: 1fr;
  }
}

.chart-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  
  &.large {
    grid-column: 1 / -1;
  }
  
  .chart-header {
    padding: 20px 20px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
    }
  }
  
  .chart-content {
    padding: 20px;
    height: 300px;
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .dashboard-header {
    .dashboard-title {
      font-size: 28px;
    }
  }
  
  .chart-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 10px;
  }
  
  .dashboard-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
    
    .dashboard-title {
      font-size: 24px;
    }
    
    .dashboard-time {
      justify-content: center;
      font-size: 16px;
    }
  }
  
  .metrics-row {
    grid-template-columns: 1fr;
  }
  
  .metric-card {
    padding: 16px;
    
    .metric-icon {
      width: 50px;
      height: 50px;
      
      i {
        font-size: 24px;
      }
    }
    
    .metric-content .metric-value {
      font-size: 24px;
    }
  }
  
  .chart-card .chart-content {
    height: 250px;
  }
}
</style>