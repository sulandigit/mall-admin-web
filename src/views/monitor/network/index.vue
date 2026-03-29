<template>
  <div class="network-monitor">
    <!-- 网络状态概览 -->
    <el-row :gutter="20" class="network-overview">
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="overview-item">
            <div class="overview-icon response-time">
              <i class="el-icon-time"></i>
            </div>
            <div class="overview-content">
              <div class="overview-title">平均响应时间</div>
              <div class="overview-value" :class="getResponseTimeClass()">
                {{ networkMetrics.current.responseTime }}ms
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="overview-item">
            <div class="overview-icon throughput">
              <i class="el-icon-s-data"></i>
            </div>
            <div class="overview-content">
              <div class="overview-title">吞吐量</div>
              <div class="overview-value">{{ networkMetrics.current.throughput }}</div>
              <div class="overview-desc">请求/分钟</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="overview-item">
            <div class="overview-icon error-rate">
              <i class="el-icon-warning"></i>
            </div>
            <div class="overview-content">
              <div class="overview-title">错误率</div>
              <div class="overview-value" :class="getErrorRateClass()">
                {{ networkMetrics.current.errorRate.toFixed(2) }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="overview-item">
            <div class="overview-icon requests">
              <i class="el-icon-s-marketing"></i>
            </div>
            <div class="overview-content">
              <div class="overview-title">总请求数</div>
              <div class="overview-value">{{ formatNumber(networkMetrics.current.requestCount) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 网络性能趋势图表 -->
    <el-row :gutter="20" class="charts-section">
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>响应时间趋势</span>
          </div>
          <div class="chart-container">
            <ve-line
              :data="responseTimeChartData"
              :settings="responseTimeChartSettings"
              :loading="responseTimeChartLoading"
              height="300px"
            ></ve-line>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>请求量统计</span>
          </div>
          <div class="chart-container">
            <ve-bar
              :data="requestChartData"
              :settings="requestChartSettings"
              :loading="requestChartLoading"
              height="300px"
            ></ve-bar>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- API接口性能排行 -->
    <el-row :gutter="20" class="api-section">
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>最慢API接口 TOP10</span>
          </div>
          <el-table :data="slowestApis" size="small" height="300">
            <el-table-column prop="path" label="接口路径" min-width="200">
              <template slot-scope="scope">
                <el-tag size="mini" :type="getMethodTagType(scope.row.method)">
                  {{ scope.row.method }}
                </el-tag>
                <span style="margin-left: 8px;">{{ scope.row.path }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="avgResponseTime" label="响应时间" width="100">
              <template slot-scope="scope">
                <span :class="getResponseTimeClass(scope.row.avgResponseTime)">
                  {{ scope.row.avgResponseTime }}ms
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="errorRate" label="错误率" width="80">
              <template slot-scope="scope">
                <span :class="getErrorRateClass(scope.row.errorRate)">
                  {{ scope.row.errorRate }}%
                </span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>热门API接口 TOP10</span>
          </div>
          <el-table :data="popularApis" size="small" height="300">
            <el-table-column prop="path" label="接口路径" min-width="200">
              <template slot-scope="scope">
                <el-tag size="mini" :type="getMethodTagType(scope.row.method)">
                  {{ scope.row.method }}
                </el-tag>
                <span style="margin-left: 8px;">{{ scope.row.path }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="requestCount" label="请求次数" width="100"></el-table-column>
            <el-table-column prop="successRate" label="成功率" width="80">
              <template slot-scope="scope">
                <span :class="getSuccessRateClass(scope.row.successRate)">
                  {{ scope.row.successRate }}%
                </span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getNetworkMetrics } from '@/api/monitor'

export default {
  name: 'NetworkMonitor',
  data() {
    return {
      networkMetrics: {
        current: { responseTime: 0, requestCount: 0, errorRate: 0, throughput: 0 }
      },
      responseTimeChartData: {
        columns: ['time', '响应时间'],
        rows: []
      },
      responseTimeChartSettings: {
        labelMap: { '响应时间': '响应时间(ms)' }
      },
      responseTimeChartLoading: false,
      requestChartData: {
        columns: ['time', '请求数量'],
        rows: []
      },
      requestChartSettings: {
        labelMap: { '请求数量': '请求数量' }
      },
      requestChartLoading: false,
      slowestApis: [],
      popularApis: [],
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
        this.loadNetworkMetrics(),
        this.loadChartData(),
        this.loadApiStats()
      ])
    },
    
    async loadNetworkMetrics() {
      try {
        const response = await getNetworkMetrics()
        this.networkMetrics = response.data
      } catch (error) {
        console.error('Failed to load network metrics:', error)
      }
    },
    
    loadChartData() {
      this.responseTimeChartLoading = true
      this.requestChartLoading = true
      
      const responseRows = []
      const requestRows = []
      const now = new Date()
      
      for (let i = 11; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 5 * 60 * 1000)
        const timeStr = time.toLocaleTimeString().slice(0, 5)
        
        responseRows.push({
          time: timeStr,
          '响应时间': Math.floor(Math.random() * 200) + 50
        })
        
        requestRows.push({
          time: timeStr,
          '请求数量': Math.floor(Math.random() * 500) + 200
        })
      }
      
      this.responseTimeChartData.rows = responseRows
      this.requestChartData.rows = requestRows
      this.responseTimeChartLoading = false
      this.requestChartLoading = false
    },
    
    loadApiStats() {
      this.slowestApis = [
        { method: 'GET', path: '/api/product/search', avgResponseTime: 1250, errorRate: 2.3 },
        { method: 'POST', path: '/api/order/create', avgResponseTime: 980, errorRate: 1.8 },
        { method: 'GET', path: '/api/user/profile', avgResponseTime: 850, errorRate: 0.5 },
        { method: 'PUT', path: '/api/product/update', avgResponseTime: 720, errorRate: 3.1 },
        { method: 'GET', path: '/api/category/list', avgResponseTime: 680, errorRate: 1.2 }
      ]
      
      this.popularApis = [
        { method: 'GET', path: '/api/product/list', requestCount: 15640, successRate: 99.2 },
        { method: 'GET', path: '/api/user/info', requestCount: 12350, successRate: 99.8 },
        { method: 'GET', path: '/api/category/tree', requestCount: 8920, successRate: 99.5 },
        { method: 'POST', path: '/api/auth/login', requestCount: 7680, successRate: 98.9 },
        { method: 'GET', path: '/api/banner/list', requestCount: 6540, successRate: 99.7 }
      ]
    },
    
    startAutoRefresh() {
      this.timer = setInterval(() => {
        this.loadData()
      }, 30000)
    },
    
    getMethodTagType(method) {
      const types = { GET: 'success', POST: 'primary', PUT: 'warning', DELETE: 'danger' }
      return types[method] || 'info'
    },
    
    getResponseTimeClass(time = null) {
      const responseTime = time || this.networkMetrics.current.responseTime
      if (responseTime > 500) return 'status-danger'
      if (responseTime > 200) return 'status-warning'
      return 'status-success'
    },
    
    getErrorRateClass(rate = null) {
      const errorRate = rate || this.networkMetrics.current.errorRate
      if (errorRate > 5) return 'status-danger'
      if (errorRate > 2) return 'status-warning'
      return 'status-success'
    },
    
    getSuccessRateClass(rate) {
      if (rate >= 99) return 'status-success'
      if (rate >= 95) return 'status-warning'
      return 'status-danger'
    },
    
    formatNumber(num) {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
      return num.toString()
    }
  }
}
</script>

<style scoped>
.network-monitor { padding: 20px; }
.network-overview { margin-bottom: 20px; }
.overview-card { height: 140px; }
.overview-item { display: flex; align-items: center; height: 100%; }
.overview-icon { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; }
.overview-icon i { font-size: 24px; color: white; }
.overview-icon.response-time { background: linear-gradient(45deg, #409EFF, #67C23A); }
.overview-icon.throughput { background: linear-gradient(45deg, #E6A23C, #F56C6C); }
.overview-icon.error-rate { background: linear-gradient(45deg, #F56C6C, #909399); }
.overview-icon.requests { background: linear-gradient(45deg, #67C23A, #409EFF); }
.overview-content { flex: 1; }
.overview-title { font-size: 14px; color: #909399; margin-bottom: 8px; }
.overview-value { font-size: 24px; font-weight: bold; margin-bottom: 5px; color: #303133; }
.overview-desc { font-size: 12px; color: #C0C4CC; }
.charts-section { margin-bottom: 20px; }
.chart-container { height: 300px; }
.api-section .el-card { height: 380px; }
.status-success { color: #67C23A; }
.status-warning { color: #E6A23C; }
.status-danger { color: #F56C6C; }
</style>