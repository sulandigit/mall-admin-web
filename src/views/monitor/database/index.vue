<template>
  <div class="database-monitor">
    <!-- 数据库状态概览 -->
    <el-row :gutter="20" class="db-overview">
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="overview-item">
            <div class="overview-icon connections">
              <i class="el-icon-link"></i>
            </div>
            <div class="overview-content">
              <div class="overview-title">活跃连接数</div>
              <div class="overview-value" :class="getConnectionsClass()">
                {{ databaseMetrics.connections.active }}
              </div>
              <div class="overview-desc">/ {{ databaseMetrics.connections.max }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="overview-item">
            <div class="overview-icon queries">
              <i class="el-icon-document"></i>
            </div>
            <div class="overview-content">
              <div class="overview-title">查询/秒</div>
              <div class="overview-value">{{ Math.floor(databaseMetrics.queries.total / 60) }}</div>
              <div class="overview-desc">总查询: {{ databaseMetrics.queries.total }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="overview-item">
            <div class="overview-icon cache">
              <i class="el-icon-cpu"></i>
            </div>
            <div class="overview-content">
              <div class="overview-title">缓存命中率</div>
              <div class="overview-value" :class="getCacheHitClass()">
                {{ databaseMetrics.cache.hitRate }}%
              </div>
              <div class="overview-desc">缓存: {{ formatMemory(databaseMetrics.cache.size) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="overview-item">
            <div class="overview-icon response">
              <i class="el-icon-time"></i>
            </div>
            <div class="overview-content">
              <div class="overview-title">平均响应时间</div>
              <div class="overview-value" :class="getResponseTimeClass()">
                {{ databaseMetrics.queries.avgResponseTime }}ms
              </div>
              <div class="overview-desc">慢查询: {{ databaseMetrics.queries.slow }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据库性能图表 -->
    <el-row :gutter="20" class="charts-section">
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>连接数趋势</span>
          </div>
          <div class="chart-container">
            <ve-line
              :data="connectionsChartData"
              :settings="connectionsChartSettings"
              height="300px"
            ></ve-line>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>查询性能统计</span>
          </div>
          <div class="chart-container">
            <ve-line
              :data="queryChartData"
              :settings="queryChartSettings"
              height="300px"
            ></ve-line>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据库详细信息 -->
    <el-row :gutter="20" class="details-section">
      <el-col :span="8">
        <el-card>
          <div slot="header">
            <span>慢查询监控</span>
          </div>
          <el-table :data="slowQueries" size="small" height="300">
            <el-table-column prop="query" label="查询语句" min-width="200" show-overflow-tooltip>
              <template slot-scope="scope">
                <code class="sql-code">{{ scope.row.query }}</code>
              </template>
            </el-table-column>
            <el-table-column prop="duration" label="执行时间" width="100">
              <template slot-scope="scope">
                <span :class="getQueryDurationClass(scope.row.duration)">
                  {{ scope.row.duration }}s
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="count" label="次数" width="80"></el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card>
          <div slot="header">
            <span>锁监控</span>
          </div>
          <div class="lock-stats">
            <div class="lock-item">
              <span class="lock-label">等待锁:</span>
              <span class="lock-value waiting">{{ databaseMetrics.locks.waiting }}</span>
            </div>
            <div class="lock-item">
              <span class="lock-label">死锁:</span>
              <span class="lock-value deadlock">{{ databaseMetrics.locks.deadlocks }}</span>
            </div>
            <div class="lock-item">
              <span class="lock-label">锁超时:</span>
              <span class="lock-value timeout">{{ lockStats.timeouts }}</span>
            </div>
            <div class="lock-chart">
              <canvas ref="lockCanvas" width="200" height="150"></canvas>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card>
          <div slot="header">
            <span>表空间使用情况</span>
          </div>
          <el-table :data="tableSpaces" size="small" height="300">
            <el-table-column prop="name" label="表空间" width="120"></el-table-column>
            <el-table-column prop="used" label="已用" width="80">
              <template slot-scope="scope">
                <span>{{ formatSize(scope.row.used) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="total" label="总计" width="80">
              <template slot-scope="scope">
                <span>{{ formatSize(scope.row.total) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="使用率" width="80">
              <template slot-scope="scope">
                <el-progress
                  :percentage="Math.floor((scope.row.used / scope.row.total) * 100)"
                  :color="getSpaceProgressColor(scope.row.used / scope.row.total)"
                  :show-text="false"
                ></el-progress>
                <span class="space-percent">{{ Math.floor((scope.row.used / scope.row.total) * 100) }}%</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getDatabaseMetrics } from '@/api/monitor'

export default {
  name: 'DatabaseMonitor',
  data() {
    return {
      databaseMetrics: {
        connections: { active: 0, idle: 0, max: 100 },
        queries: { total: 0, slow: 0, avgResponseTime: 0 },
        locks: { waiting: 0, deadlocks: 0 },
        cache: { hitRate: 0, size: 0 }
      },
      
      connectionsChartData: {
        columns: ['time', '活跃连接', '空闲连接'],
        rows: []
      },
      connectionsChartSettings: {
        labelMap: {
          '活跃连接': '活跃连接数',
          '空闲连接': '空闲连接数'
        }
      },
      
      queryChartData: {
        columns: ['time', '查询数量', '平均响应时间'],
        rows: []
      },
      queryChartSettings: {
        axisSite: { right: ['平均响应时间'] },
        labelMap: {
          '查询数量': '查询数量',
          '平均响应时间': '响应时间(ms)'
        }
      },
      
      slowQueries: [],
      lockStats: { timeouts: 0 },
      tableSpaces: [],
      
      timer: null
    }
  },
  
  created() {
    this.loadData()
    this.startAutoRefresh()
  },
  
  mounted() {
    this.drawLockChart()
  },
  
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer)
  },
  
  methods: {
    async loadData() {
      await Promise.all([
        this.loadDatabaseMetrics(),
        this.loadChartData(),
        this.loadSlowQueries(),
        this.loadTableSpaces()
      ])
    },
    
    async loadDatabaseMetrics() {
      try {
        const response = await getDatabaseMetrics()
        this.databaseMetrics = response.data
        this.lockStats.timeouts = Math.floor(Math.random() * 5)
      } catch (error) {
        console.error('Failed to load database metrics:', error)
      }
    },
    
    loadChartData() {
      const connectionsRows = []
      const queryRows = []
      const now = new Date()
      
      for (let i = 11; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 5 * 60 * 1000)
        const timeStr = time.toLocaleTimeString().slice(0, 5)
        
        connectionsRows.push({
          time: timeStr,
          '活跃连接': Math.floor(Math.random() * 30) + 40,
          '空闲连接': Math.floor(Math.random() * 20) + 10
        })
        
        queryRows.push({
          time: timeStr,
          '查询数量': Math.floor(Math.random() * 200) + 100,
          '平均响应时间': Math.floor(Math.random() * 50) + 20
        })
      }
      
      this.connectionsChartData.rows = connectionsRows
      this.queryChartData.rows = queryRows
    },
    
    loadSlowQueries() {
      this.slowQueries = [
        { query: 'SELECT * FROM orders WHERE created_at > ?', duration: 5.2, count: 12 },
        { query: 'UPDATE products SET stock = stock - 1 WHERE id = ?', duration: 3.8, count: 45 },
        { query: 'SELECT COUNT(*) FROM user_logs WHERE date >= ?', duration: 2.9, count: 8 },
        { query: 'DELETE FROM temp_data WHERE created_at < ?', duration: 2.3, count: 3 },
        { query: 'INSERT INTO analytics_data SELECT * FROM raw_data', duration: 1.8, count: 2 }
      ]
    },
    
    loadTableSpaces() {
      this.tableSpaces = [
        { name: 'system', used: 2048, total: 4096 },
        { name: 'users', used: 1536, total: 2048 },
        { name: 'orders', used: 3072, total: 4096 },
        { name: 'products', used: 1024, total: 2048 },
        { name: 'logs', used: 4096, total: 8192 },
        { name: 'temp', used: 512, total: 1024 }
      ]
    },
    
    drawLockChart() {
      const canvas = this.$refs.lockCanvas
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      const width = canvas.width
      const height = canvas.height
      
      ctx.clearRect(0, 0, width, height)
      
      // 绘制锁等待情况的简单可视化
      ctx.fillStyle = '#67C23A'
      ctx.fillRect(20, 20, 60, 40)
      ctx.fillStyle = '#E6A23C'
      ctx.fillRect(90, 20, 40, 40)
      ctx.fillStyle = '#F56C6C'
      ctx.fillRect(140, 20, 20, 40)
      
      ctx.fillStyle = '#303133'
      ctx.font = '12px Arial'
      ctx.fillText('正常', 25, 80)
      ctx.fillText('等待', 95, 80)
      ctx.fillText('死锁', 145, 80)
    },
    
    startAutoRefresh() {
      this.timer = setInterval(() => {
        this.loadData()
        this.drawLockChart()
      }, 10000)
    },
    
    getConnectionsClass() {
      const usage = (this.databaseMetrics.connections.active / this.databaseMetrics.connections.max) * 100
      if (usage >= 80) return 'status-danger'
      if (usage >= 60) return 'status-warning'
      return 'status-success'
    },
    
    getCacheHitClass() {
      const hitRate = this.databaseMetrics.cache.hitRate
      if (hitRate >= 90) return 'status-success'
      if (hitRate >= 80) return 'status-warning'
      return 'status-danger'
    },
    
    getResponseTimeClass() {
      const time = this.databaseMetrics.queries.avgResponseTime
      if (time > 100) return 'status-danger'
      if (time > 50) return 'status-warning'
      return 'status-success'
    },
    
    getQueryDurationClass(duration) {
      if (duration > 5) return 'status-danger'
      if (duration > 2) return 'status-warning'
      return 'status-normal'
    },
    
    getSpaceProgressColor(ratio) {
      if (ratio >= 0.9) return '#F56C6C'
      if (ratio >= 0.8) return '#E6A23C'
      return '#67C23A'
    },
    
    formatMemory(mb) {
      if (mb >= 1024) return (mb / 1024).toFixed(1) + 'GB'
      return mb + 'MB'
    },
    
    formatSize(mb) {
      if (mb >= 1024) return (mb / 1024).toFixed(1) + 'GB'
      return mb + 'MB'
    }
  }
}
</script>

<style scoped>
.database-monitor { padding: 20px; }
.db-overview { margin-bottom: 20px; }
.overview-card { height: 140px; }
.overview-item { display: flex; align-items: center; height: 100%; }
.overview-icon { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; }
.overview-icon i { font-size: 24px; color: white; }
.overview-icon.connections { background: linear-gradient(45deg, #409EFF, #67C23A); }
.overview-icon.queries { background: linear-gradient(45deg, #E6A23C, #F56C6C); }
.overview-icon.cache { background: linear-gradient(45deg, #67C23A, #409EFF); }
.overview-icon.response { background: linear-gradient(45deg, #909399, #E6A23C); }
.overview-content { flex: 1; }
.overview-title { font-size: 14px; color: #909399; margin-bottom: 8px; }
.overview-value { font-size: 24px; font-weight: bold; margin-bottom: 5px; color: #303133; }
.overview-desc { font-size: 12px; color: #C0C4CC; }
.charts-section { margin-bottom: 20px; }
.chart-container { height: 300px; }
.details-section .el-card { height: 380px; }
.sql-code { font-family: 'Courier New', monospace; font-size: 12px; background: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
.lock-stats { padding: 20px 10px; }
.lock-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; }
.lock-label { font-size: 14px; color: #606266; }
.lock-value { font-size: 16px; font-weight: 500; }
.lock-value.waiting { color: #E6A23C; }
.lock-value.deadlock { color: #F56C6C; }
.lock-value.timeout { color: #909399; }
.lock-chart { margin-top: 20px; text-align: center; }
.space-percent { font-size: 12px; color: #909399; margin-left: 5px; }
.status-success { color: #67C23A; }
.status-warning { color: #E6A23C; }
.status-danger { color: #F56C6C; }
.status-normal { color: #303133; }
</style>