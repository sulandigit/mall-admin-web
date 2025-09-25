<template>
  <div class="app-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>行为追踪仪表板</h2>
        <p class="page-description">实时监控用户行为数据，分析访问趋势和用户行为模式</p>
      </div>
      <div class="header-right">
        <el-button-group>
          <el-button 
            :type="timeRange === '1d' ? 'primary' : 'default'"
            size="small"
            @click="setTimeRange('1d')"
          >
            今日
          </el-button>
          <el-button 
            :type="timeRange === '7d' ? 'primary' : 'default'"
            size="small"
            @click="setTimeRange('7d')"
          >
            近7天
          </el-button>
          <el-button 
            :type="timeRange === '30d' ? 'primary' : 'default'"
            size="small"
            @click="setTimeRange('30d')"
          >
            近30天
          </el-button>
        </el-button-group>
        <el-button 
          :loading="isRefreshing"
          icon="el-icon-refresh"
          size="small"
          @click="refreshData"
          style="margin-left: 10px;"
        >
          刷新
        </el-button>
        <el-switch
          v-model="autoRefresh"
          active-text="自动刷新"
          style="margin-left: 10px;"
          @change="toggleAutoRefresh"
        ></el-switch>
      </div>
    </div>

    <!-- 错误提示 -->
    <el-alert
      v-if="hasError"
      :title="error"
      type="error"
      :closable="true"
      @close="clearError"
      style="margin-bottom: 20px;"
    ></el-alert>

    <!-- 预警信息 -->
    <el-alert
      v-if="hasAlerts"
      title="异常预警"
      type="warning"
      :closable="false"
      style="margin-bottom: 20px;"
    >
      <div slot="default">
        <ul style="margin: 0; padding-left: 20px;">
          <li v-for="alert in alerts" :key="alert.id">
            {{ alert.message }}
          </li>
        </ul>
      </div>
    </el-alert>

    <!-- 指标卡片 -->
    <metrics-cards
      :total-visits="totalVisits"
      :average-stay-time="averageStayTime"
      :bounce-rate="overallBounceRate"
      :current-visitors="currentVisitors"
      :trend-data="trendChartData"
    />

    <!-- 趋势图表 -->
    <trend-charts
      :trend-data="trendChartData"
      :source-data="visitSourcesChartData"
      :device-data="deviceChartData"
      :loading="isLoading"
      @chart-type-change="onChartTypeChange"
    />

    <!-- 快速访问面板 -->
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover">
          <div slot="header" class="panel-header">
            <span>热门页面</span>
            <el-button type="text" @click="$router.push('/customer-behavior/page-visit')">
              查看更多
            </el-button>
          </div>
          <div class="quick-panel-content">
            <div 
              v-for="(page, index) in topPages"
              :key="index"
              class="quick-panel-item"
            >
              <div class="item-rank">{{ index + 1 }}</div>
              <div class="item-content">
                <div class="item-title">{{ page.pageName || page.pageUrl }}</div>
                <div class="item-value">{{ formatNumber(page.visitCount) }} 次访问</div>
              </div>
            </div>
            <div v-if="topPages.length === 0" class="no-data">
              暂无数据
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div slot="header" class="panel-header">
            <span>实时活动</span>
            <el-button type="text" @click="refreshRealTimeData">
              刷新
            </el-button>
          </div>
          <div class="quick-panel-content">
            <div class="realtime-stats">
              <div class="realtime-item">
                <span class="realtime-label">当前在线:</span>
                <span class="realtime-value">{{ currentVisitors }}</span>
              </div>
              <div class="realtime-item">
                <span class="realtime-label">今日访问:</span>
                <span class="realtime-value">{{ todayVisits }}</span>
              </div>
            </div>
            <div class="realtime-events">
              <div 
                v-for="(event, index) in realtimeEvents" 
                :key="index"
                class="event-item"
              >
                <span class="event-time">{{ formatTime(event.timestamp) }}</span>
                <span class="event-desc">{{ event.description }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div slot="header" class="panel-header">
            <span>快速导航</span>
          </div>
          <div class="quick-panel-content">
            <div class="nav-grid">
              <div 
                class="nav-item" 
                @click="$router.push('/customer-behavior/page-visit')"
              >
                <i class="el-icon-view"></i>
                <span>页面访问分析</span>
              </div>
              <div 
                class="nav-item" 
                @click="$router.push('/customer-behavior/stay-time')"
              >
                <i class="el-icon-time"></i>
                <span>停留时间分析</span>
              </div>
              <div 
                class="nav-item" 
                @click="$router.push('/customer-behavior/bounce-rate')"
              >
                <i class="el-icon-warning"></i>
                <span>跳出率分析</span>
              </div>
              <div 
                class="nav-item" 
                @click="$router.push('/customer-behavior/user-profile')"
              >
                <i class="el-icon-user"></i>
                <span>用户画像分析</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最后更新时间 -->
    <div class="update-info" v-if="lastUpdatedTime">
      <i class="el-icon-time"></i>
      最后更新：{{ formatUpdateTime(lastUpdatedTime) }}
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import MetricsCards from './components/MetricsCards'
import TrendCharts from './components/TrendCharts'

export default {
  name: 'BehaviorDashboard',
  components: {
    MetricsCards,
    TrendCharts
  },
  data() {
    return {
      autoRefresh: true,
      refreshTimer: null,
      refreshInterval: 30000, // 30秒
      isRefreshing: false,
      deviceChartData: [
        { name: '桌面端', value: 65 },
        { name: '移动端', value: 30 },
        { name: '平板端', value: 5 }
      ],
      realtimeEvents: [
        { timestamp: new Date(), description: '用户访问了商品详情页' },
        { timestamp: new Date(Date.now() - 60000), description: '新用户注册' },
        { timestamp: new Date(Date.now() - 120000), description: '用户完成了购买' }
      ]
    }
  },
  computed: {
    ...mapState('behavior', [
      'timeRange',
      'loading',
      'error',
      'alerts',
      'lastUpdated'
    ]),
    ...mapGetters('behavior', [
      'totalVisits',
      'averageStayTime', 
      'overallBounceRate',
      'topPages',
      'isLoading',
      'hasError',
      'hasAlerts',
      'currentVisitors',
      'todayVisits',
      'lastUpdatedTime',
      'trendChartData',
      'visitSourcesChartData'
    ])
  },
  async mounted() {
    await this.initData()
    this.startAutoRefresh()
  },
  beforeDestroy() {
    this.stopAutoRefresh()
  },
  methods: {
    ...mapActions('behavior', [
      'fetchDashboardData',
      'fetchRealTimeData',
      'setTimeRange',
      'refreshAllData'
    ]),
    
    // 初始化数据
    async initData() {
      try {
        await Promise.all([
          this.fetchDashboardData(),
          this.fetchRealTimeData()
        ])
      } catch (error) {
        console.error('初始化数据失败:', error)
      }
    },
    
    // 刷新数据
    async refreshData() {
      this.isRefreshing = true
      try {
        await this.refreshAllData()
        this.$message.success('数据刷新成功')
      } catch (error) {
        this.$message.error('数据刷新失败')
      } finally {
        this.isRefreshing = false
      }
    },
    
    // 设置时间范围
    async setTimeRange(range) {
      await this.$store.dispatch('behavior/setTimeRange', range)
    },
    
    // 开启自动刷新
    startAutoRefresh() {
      if (this.autoRefresh && !this.refreshTimer) {
        this.refreshTimer = setInterval(() => {
          this.refreshData()
        }, this.refreshInterval)
      }
    },
    
    // 停止自动刷新
    stopAutoRefresh() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer)
        this.refreshTimer = null
      }
    },
    
    // 切换自动刷新
    toggleAutoRefresh(enabled) {
      if (enabled) {
        this.startAutoRefresh()
      } else {
        this.stopAutoRefresh()
      }
    },
    
    // 清除错误
    clearError() {
      this.$store.commit('behavior/CLEAR_ERROR')
    },
    
    // 刷新实时数据
    async refreshRealTimeData() {
      await this.fetchRealTimeData()
    },
    
    // 图表类型变化
    onChartTypeChange(type) {
      console.log('图表类型变化:', type)
    },
    
    // 格式化数字
    formatNumber(num) {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
      }
      return num.toString()
    },
    
    // 格式化时间
    formatTime(timestamp) {
      const date = new Date(timestamp)
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    },
    
    // 格式化更新时间
    formatUpdateTime(timestamp) {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) {
        return '刚刚'
      } else if (diff < 3600000) {
        return `${Math.floor(diff / 60000)}分钟前`
      } else {
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
      }
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #EBEEF5;
}

.header-left h2 {
  margin: 0 0 5px 0;
  color: #303133;
  font-size: 24px;
  font-weight: bold;
}

.page-description {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quick-panel-content {
  min-height: 200px;
}

.quick-panel-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #F5F7FA;
}

.quick-panel-item:last-child {
  border-bottom: none;
}

.item-rank {
  width: 30px;
  height: 30px;
  background-color: #F5F7FA;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #909399;
  margin-right: 15px;
}

.item-rank:nth-child(1) {
  background-color: #FFD700;
  color: #FFF;
}

.item-content {
  flex: 1;
}

.item-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 5px;
}

.item-value {
  font-size: 12px;
  color: #909399;
}

.realtime-stats {
  margin-bottom: 15px;
}

.realtime-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.realtime-label {
  color: #909399;
  font-size: 14px;
}

.realtime-value {
  color: #303133;
  font-weight: bold;
}

.realtime-events {
  max-height: 150px;
  overflow-y: auto;
}

.event-item {
  display: flex;
  align-items: center;
  padding: 5px 0;
  font-size: 12px;
}

.event-time {
  color: #909399;
  margin-right: 10px;
  min-width: 40px;
}

.event-desc {
  color: #606266;
}

.nav-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 1px solid #EBEEF5;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-item:hover {
  border-color: #409EFF;
  background-color: #F0F9FF;
}

.nav-item i {
  font-size: 24px;
  color: #409EFF;
  margin-bottom: 8px;
}

.nav-item span {
  font-size: 12px;
  color: #606266;
  text-align: center;
}

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 150px;
  color: #909399;
  font-size: 14px;
}

.update-info {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #EBEEF5;
  color: #909399;
  font-size: 12px;
}

.update-info i {
  margin-right: 5px;
}
</style>