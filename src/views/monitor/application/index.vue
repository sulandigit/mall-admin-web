<template>
  <div class="application-monitor">
    <!-- 应用状态概览 -->
    <el-row :gutter="20" class="app-overview">
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="overview-item">
            <div class="overview-icon users">
              <i class="el-icon-user"></i>
            </div>
            <div class="overview-content">
              <div class="overview-title">在线用户</div>
              <div class="overview-value">{{ applicationMetrics.current.onlineUsers }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="overview-item">
            <div class="overview-icon sessions">
              <i class="el-icon-s-custom"></i>
            </div>
            <div class="overview-content">
              <div class="overview-title">总用户数</div>
              <div class="overview-value">{{ applicationMetrics.current.totalUsers }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="overview-item">
            <div class="overview-icon errors">
              <i class="el-icon-warning"></i>
            </div>
            <div class="overview-content">
              <div class="overview-title">错误率</div>
              <div class="overview-value" :class="getErrorRateClass()">
                {{ applicationMetrics.current.errorRate.toFixed(2) }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="overview-item">
            <div class="overview-icon performance">
              <i class="el-icon-time"></i>
            </div>
            <div class="overview-content">
              <div class="overview-title">页面加载时间</div>
              <div class="overview-value">{{ applicationMetrics.current.avgLoadTime }}ms</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 用户活跃度图表 -->
    <el-row :gutter="20" class="charts-section">
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>用户活跃度趋势</span>
          </div>
          <div class="chart-container">
            <ve-line
              :data="userActivityChartData"
              :settings="userActivityChartSettings"
              height="300px"
            ></ve-line>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>页面访问统计</span>
          </div>
          <div class="chart-container">
            <ve-bar
              :data="pageViewChartData"
              :settings="pageViewChartSettings"
              height="300px"
            ></ve-bar>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 业务指标监控 -->
    <el-row :gutter="20" class="business-section">
      <el-col :span="8">
        <el-card>
          <div slot="header">
            <span>业务数据概览</span>
          </div>
          <div class="business-stats">
            <div class="business-item">
              <span class="business-label">今日订单:</span>
              <span class="business-value orders">{{ businessStats.todayOrders }}</span>
            </div>
            <div class="business-item">
              <span class="business-label">今日销售额:</span>
              <span class="business-value sales">¥{{ formatMoney(businessStats.todaySales) }}</span>
            </div>
            <div class="business-item">
              <span class="business-label">新增用户:</span>
              <span class="business-value users">{{ businessStats.newUsers }}</span>
            </div>
            <div class="business-item">
              <span class="business-label">活跃商品:</span>
              <span class="business-value products">{{ businessStats.activeProducts }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card>
          <div slot="header">
            <span>异常监控</span>
          </div>
          <el-table :data="recentErrors" size="small" height="250">
            <el-table-column prop="level" label="级别" width="80">
              <template slot-scope="scope">
                <el-tag :type="getErrorLevelType(scope.row.level)" size="mini">
                  {{ scope.row.level }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="message" label="错误信息" min-width="150" show-overflow-tooltip></el-table-column>
            <el-table-column prop="count" label="次数" width="60"></el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card>
          <div slot="header">
            <span>用户行为分析</span>
          </div>
          <div class="behavior-stats">
            <div class="behavior-item">
              <span class="behavior-label">平均会话时长:</span>
              <span class="behavior-value">{{ Math.floor(userBehavior.avgSessionTime / 60) }}分钟</span>
            </div>
            <div class="behavior-item">
              <span class="behavior-label">跳出率:</span>
              <span class="behavior-value">{{ userBehavior.bounceRate }}%</span>
            </div>
            <div class="behavior-item">
              <span class="behavior-label">页面访问深度:</span>
              <span class="behavior-value">{{ userBehavior.pageDepth }}</span>
            </div>
            <div class="behavior-item">
              <span class="behavior-label">转化率:</span>
              <span class="behavior-value">{{ userBehavior.conversionRate }}%</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getApplicationMetrics } from '@/api/monitor'

export default {
  name: 'ApplicationMonitor',
  data() {
    return {
      applicationMetrics: {
        current: {
          onlineUsers: 0,
          totalUsers: 0,
          errorRate: 0,
          avgLoadTime: 0
        }
      },
      
      userActivityChartData: {
        columns: ['date', '活跃用户', '新增用户'],
        rows: []
      },
      userActivityChartSettings: {
        labelMap: {
          '活跃用户': '活跃用户数',
          '新增用户': '新增用户数'
        }
      },
      
      pageViewChartData: {
        columns: ['page', '访问量'],
        rows: []
      },
      pageViewChartSettings: {
        labelMap: {
          '访问量': '页面访问量'
        }
      },
      
      businessStats: {
        todayOrders: 156,
        todaySales: 89560,
        newUsers: 23,
        activeProducts: 1258
      },
      
      recentErrors: [],
      
      userBehavior: {
        avgSessionTime: 480,
        bounceRate: 35.6,
        pageDepth: 4.2,
        conversionRate: 2.8
      },
      
      timer: null
    }
  },
  
  created() {
    this.loadData()
    this.startAutoRefresh()
  },
  
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer)
  },
  
  methods: {
    async loadData() {
      await Promise.all([
        this.loadApplicationMetrics(),
        this.loadChartData(),
        this.loadErrorData()
      ])
    },
    
    async loadApplicationMetrics() {
      try {
        const response = await getApplicationMetrics()
        this.applicationMetrics = response.data
      } catch (error) {
        console.error('Failed to load application metrics:', error)
      }
    },
    
    loadChartData() {
      // 用户活跃度数据
      const userRows = []
      const now = new Date()
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const dateStr = (date.getMonth() + 1) + '/' + date.getDate()
        
        userRows.push({
          date: dateStr,
          '活跃用户': Math.floor(Math.random() * 2000) + 1000,
          '新增用户': Math.floor(Math.random() * 200) + 50
        })
      }
      
      this.userActivityChartData.rows = userRows
      
      // 页面访问数据
      this.pageViewChartData.rows = [
        { page: '首页', '访问量': 12580 },
        { page: '商品列表', '访问量': 8960 },
        { page: '商品详情', '访问量': 6780 },
        { page: '购物车', '访问量': 4520 },
        { page: '订单页', '访问量': 2340 },
        { page: '用户中心', '访问量': 1890 }
      ]
    },
    
    loadErrorData() {
      this.recentErrors = [
        { level: 'ERROR', message: '数据库连接超时', count: 15 },
        { level: 'WARN', message: '内存使用率过高', count: 8 },
        { level: 'ERROR', message: 'API响应超时', count: 6 },
        { level: 'INFO', message: '用户登录失败', count: 23 },
        { level: 'WARN', message: '缓存命中率低', count: 4 }
      ]
    },
    
    startAutoRefresh() {
      this.timer = setInterval(() => {
        this.loadData()
      }, 30000)
    },
    
    getErrorRateClass() {
      const rate = this.applicationMetrics.current.errorRate
      if (rate > 5) return 'status-danger'
      if (rate > 2) return 'status-warning'
      return 'status-success'
    },
    
    getErrorLevelType(level) {
      const types = {
        ERROR: 'danger',
        WARN: 'warning',
        INFO: 'info'
      }
      return types[level] || 'info'
    },
    
    formatMoney(amount) {
      return amount.toLocaleString()
    }
  }
}
</script>

<style scoped>
.application-monitor { padding: 20px; }
.app-overview { margin-bottom: 20px; }
.overview-card { height: 140px; }
.overview-item { display: flex; align-items: center; height: 100%; }
.overview-icon { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; }
.overview-icon i { font-size: 24px; color: white; }
.overview-icon.users { background: linear-gradient(45deg, #409EFF, #67C23A); }
.overview-icon.sessions { background: linear-gradient(45deg, #E6A23C, #F56C6C); }
.overview-icon.errors { background: linear-gradient(45deg, #F56C6C, #909399); }
.overview-icon.performance { background: linear-gradient(45deg, #67C23A, #409EFF); }
.overview-content { flex: 1; }
.overview-title { font-size: 14px; color: #909399; margin-bottom: 8px; }
.overview-value { font-size: 24px; font-weight: bold; color: #303133; }
.charts-section { margin-bottom: 20px; }
.chart-container { height: 300px; }
.business-section .el-card { height: 320px; }
.business-stats, .behavior-stats { padding: 20px 10px; }
.business-item, .behavior-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; }
.business-label, .behavior-label { font-size: 14px; color: #606266; }
.business-value, .behavior-value { font-size: 16px; font-weight: 500; color: #409EFF; }
.status-success { color: #67C23A; }
.status-warning { color: #E6A23C; }
.status-danger { color: #F56C6C; }
</style>