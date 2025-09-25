<template>
  <div class="monitor-dashboard">
    <!-- 总体状态卡片 -->
    <el-row :gutter="20" class="status-cards">
      <el-col :span="6">
        <el-card class="status-card">
          <div class="status-item">
            <div class="status-icon cpu">
              <i class="el-icon-cpu"></i>
            </div>
            <div class="status-content">
              <div class="status-title">CPU使用率</div>
              <div class="status-value" :class="getCpuStatusClass()">
                {{ systemMetrics.cpu.usage }}%
              </div>
              <div class="status-desc">{{ systemMetrics.cpu.cores }}核心</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="status-card">
          <div class="status-item">
            <div class="status-icon memory">
              <i class="el-icon-memory"></i>
            </div>
            <div class="status-content">
              <div class="status-title">内存使用率</div>
              <div class="status-value" :class="getMemoryStatusClass()">
                {{ getMemoryUsage() }}%
              </div>
              <div class="status-desc">{{ formatMemory(systemMetrics.memory.used) }}/{{ formatMemory(systemMetrics.memory.total) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="status-card">
          <div class="status-item">
            <div class="status-icon network">
              <i class="el-icon-network"></i>
            </div>
            <div class="status-content">
              <div class="status-title">网络流量</div>
              <div class="status-value">{{ systemMetrics.network.inbound }}KB/s</div>
              <div class="status-desc">入站/出站: {{ systemMetrics.network.outbound }}KB/s</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="status-card">
          <div class="status-item">
            <div class="status-icon disk">
              <i class="el-icon-disk"></i>
            </div>
            <div class="status-content">
              <div class="status-title">磁盘使用率</div>
              <div class="status-value" :class="getDiskStatusClass()">
                {{ getDiskUsage() }}%
              </div>
              <div class="status-desc">{{ formatDisk(systemMetrics.disk.used) }}/{{ formatDisk(systemMetrics.disk.total) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 性能图表区域 -->
    <el-row :gutter="20" class="chart-section">
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>系统资源使用趋势</span>
            <el-button
              style="float: right; padding: 3px 0"
              type="text"
              @click="refreshSystemChart"
            >
              <i class="el-icon-refresh"></i>
            </el-button>
          </div>
          <div class="chart-container">
            <ve-line
              :data="systemChartData"
              :settings="systemChartSettings"
              :loading="systemChartLoading"
              height="300px"
            ></ve-line>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>网络性能监控</span>
            <el-button
              style="float: right; padding: 3px 0"
              type="text"
              @click="refreshNetworkChart"
            >
              <i class="el-icon-refresh"></i>
            </el-button>
          </div>
          <div class="chart-container">
            <ve-line
              :data="networkChartData"
              :settings="networkChartSettings"
              :loading="networkChartLoading"
              height="300px"
            ></ve-line>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 服务状态和告警信息 -->
    <el-row :gutter="20" class="bottom-section">
      <el-col :span="8">
        <el-card>
          <div slot="header">
            <span>服务状态</span>
          </div>
          <div class="service-list">
            <div v-for="service in serviceStatus" :key="service.name" class="service-item">
              <div class="service-info">
                <span class="service-name">{{ service.name }}</span>
                <el-tag
                  :type="service.status === 'running' ? 'success' : 'danger'"
                  size="small"
                >
                  {{ service.status === 'running' ? '运行中' : '已停止' }}
                </el-tag>
              </div>
              <div class="service-uptime">运行时间: {{ service.uptime }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card>
          <div slot="header">
            <span>数据库连接</span>
          </div>
          <div class="db-status">
            <div class="db-item">
              <span>活跃连接:</span>
              <span class="db-value">{{ databaseMetrics.connections.active }}</span>
            </div>
            <div class="db-item">
              <span>空闲连接:</span>
              <span class="db-value">{{ databaseMetrics.connections.idle }}</span>
            </div>
            <div class="db-item">
              <span>查询缓存命中率:</span>
              <span class="db-value">{{ databaseMetrics.cache.hitRate }}%</span>
            </div>
            <div class="db-item">
              <span>平均响应时间:</span>
              <span class="db-value">{{ databaseMetrics.queries.avgResponseTime }}ms</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card>
          <div slot="header">
            <span>最近告警</span>
            <el-button
              style="float: right; padding: 3px 0"
              type="text"
              @click="$router.push('/monitor/alert')"
            >
              查看全部
            </el-button>
          </div>
          <div class="alert-list">
            <div v-for="alert in recentAlerts" :key="alert.id" class="alert-item">
              <div class="alert-info">
                <el-tag
                  :type="getAlertTagType(alert.level)"
                  size="small"
                >
                  {{ alert.level }}
                </el-tag>
                <span class="alert-message">{{ alert.message }}</span>
              </div>
              <div class="alert-time">{{ formatTime(alert.time) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getSystemMetrics, getNetworkMetrics, getDatabaseMetrics, getAlertHistory } from '@/api/monitor'

export default {
  name: 'MonitorDashboard',
  data() {
    return {
      // 系统指标数据
      systemMetrics: {
        cpu: { usage: 0, cores: 0, temperature: 0 },
        memory: { total: 0, used: 0, usage: 0 },
        disk: { total: 0, used: 0, usage: 0 },
        network: { inbound: 0, outbound: 0 }
      },
      
      // 数据库指标数据
      databaseMetrics: {
        connections: { active: 0, idle: 0, max: 100 },
        queries: { total: 0, slow: 0, avgResponseTime: 0 },
        cache: { hitRate: 0, size: 0 }
      },
      
      // 系统图表数据
      systemChartData: {
        columns: ['time', 'CPU', 'Memory', 'Disk'],
        rows: []
      },
      systemChartSettings: {
        labelMap: {
          CPU: 'CPU使用率(%)',
          Memory: '内存使用率(%)', 
          Disk: '磁盘使用率(%)'
        }
      },
      systemChartLoading: false,
      
      // 网络图表数据
      networkChartData: {
        columns: ['time', 'ResponseTime', 'RequestCount'],
        rows: []
      },
      networkChartSettings: {
        axisSite: { right: ['RequestCount'] },
        labelMap: {
          ResponseTime: '响应时间(ms)',
          RequestCount: '请求数量'
        }
      },
      networkChartLoading: false,
      
      // 服务状态
      serviceStatus: [
        { name: 'Web服务', status: 'running', uptime: '15天3小时' },
        { name: 'API服务', status: 'running', uptime: '15天3小时' },
        { name: 'Redis缓存', status: 'running', uptime: '30天12小时' },
        { name: 'MySQL数据库', status: 'running', uptime: '45天8小时' }
      ],
      
      // 最近告警
      recentAlerts: [],
      
      // 定时器
      timer: null
    }
  },
  
  created() {
    this.loadData()
    this.startAutoRefresh()
  },
  
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  
  methods: {
    // 加载所有数据
    async loadData() {
      await Promise.all([
        this.loadSystemMetrics(),
        this.loadDatabaseMetrics(),
        this.loadChartData(),
        this.loadAlerts()
      ])
    },
    
    // 加载系统指标
    async loadSystemMetrics() {
      try {
        const response = await getSystemMetrics()
        this.systemMetrics = response.data
        // 计算使用率
        this.systemMetrics.memory.usage = Math.round((this.systemMetrics.memory.used / this.systemMetrics.memory.total) * 100)
        this.systemMetrics.disk.usage = Math.round((this.systemMetrics.disk.used / this.systemMetrics.disk.total) * 100)
      } catch (error) {
        console.error('Failed to load system metrics:', error)
      }
    },
    
    // 加载数据库指标
    async loadDatabaseMetrics() {
      try {
        const response = await getDatabaseMetrics()
        this.databaseMetrics = response.data
      } catch (error) {
        console.error('Failed to load database metrics:', error)
      }
    },
    
    // 加载图表数据
    async loadChartData() {
      this.systemChartLoading = true
      this.networkChartLoading = true
      
      try {
        // 生成系统资源图表数据
        const systemRows = []
        const networkRows = []
        const now = new Date()
        
        for (let i = 11; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 5 * 60 * 1000) // 每5分钟一个点
          const timeStr = time.toLocaleTimeString().slice(0, 5)
          
          systemRows.push({
            time: timeStr,
            CPU: Math.floor(Math.random() * 30) + 30,
            Memory: Math.floor(Math.random() * 20) + 60,
            Disk: Math.floor(Math.random() * 10) + 70
          })
          
          networkRows.push({
            time: timeStr,
            ResponseTime: Math.floor(Math.random() * 100) + 50,
            RequestCount: Math.floor(Math.random() * 500) + 200
          })
        }
        
        this.systemChartData.rows = systemRows
        this.networkChartData.rows = networkRows
        
      } catch (error) {
        console.error('Failed to load chart data:', error)
      } finally {
        this.systemChartLoading = false
        this.networkChartLoading = false
      }
    },
    
    // 加载告警数据
    async loadAlerts() {
      try {
        const response = await getAlertHistory()
        this.recentAlerts = response.data.alerts.slice(0, 5) // 只显示最近5条
      } catch (error) {
        console.error('Failed to load alerts:', error)
      }
    },
    
    // 刷新系统图表
    refreshSystemChart() {
      this.loadChartData()
    },
    
    // 刷新网络图表
    refreshNetworkChart() {
      this.loadChartData()
    },
    
    // 启动自动刷新
    startAutoRefresh() {
      this.timer = setInterval(() => {
        this.loadData()
      }, 30000) // 每30秒刷新一次
    },
    
    // 获取CPU状态样式类
    getCpuStatusClass() {
      const usage = this.systemMetrics.cpu.usage
      if (usage >= 80) return 'status-danger'
      if (usage >= 60) return 'status-warning'
      return 'status-success'
    },
    
    // 获取内存状态样式类
    getMemoryStatusClass() {
      const usage = this.getMemoryUsage()
      if (usage >= 85) return 'status-danger'
      if (usage >= 70) return 'status-warning'
      return 'status-success'
    },
    
    // 获取磁盘状态样式类
    getDiskStatusClass() {
      const usage = this.getDiskUsage()
      if (usage >= 90) return 'status-danger'
      if (usage >= 80) return 'status-warning'
      return 'status-success'
    },
    
    // 计算内存使用率
    getMemoryUsage() {
      return Math.round((this.systemMetrics.memory.used / this.systemMetrics.memory.total) * 100)
    },
    
    // 计算磁盘使用率
    getDiskUsage() {
      return Math.round((this.systemMetrics.disk.used / this.systemMetrics.disk.total) * 100)
    },
    
    // 格式化内存大小
    formatMemory(mb) {
      if (mb >= 1024) {
        return (mb / 1024).toFixed(1) + 'GB'
      }
      return mb + 'MB'
    },
    
    // 格式化磁盘大小
    formatDisk(mb) {
      if (mb >= 1024 * 1024) {
        return (mb / (1024 * 1024)).toFixed(1) + 'TB'
      }
      if (mb >= 1024) {
        return (mb / 1024).toFixed(1) + 'GB'
      }
      return mb + 'MB'
    },
    
    // 获取告警标签类型
    getAlertTagType(level) {
      const types = {
        warning: 'warning',
        error: 'danger',
        critical: 'danger'
      }
      return types[level] || 'info'
    },
    
    // 格式化时间
    formatTime(timeStr) {
      const time = new Date(timeStr)
      return time.toLocaleString()
    }
  }
}
</script>

<style scoped>
.monitor-dashboard {
  padding: 20px;
}

.status-cards {
  margin-bottom: 20px;
}

.status-card {
  border-radius: 8px;
}

.status-item {
  display: flex;
  align-items: center;
}

.status-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.status-icon i {
  font-size: 24px;
  color: white;
}

.status-icon.cpu {
  background: linear-gradient(45deg, #409EFF, #67C23A);
}

.status-icon.memory {
  background: linear-gradient(45deg, #E6A23C, #F56C6C);
}

.status-icon.network {
  background: linear-gradient(45deg, #909399, #409EFF);
}

.status-icon.disk {
  background: linear-gradient(45deg, #67C23A, #E6A23C);
}

.status-content {
  flex: 1;
}

.status-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.status-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.status-value.status-success {
  color: #67C23A;
}

.status-value.status-warning {
  color: #E6A23C;
}

.status-value.status-danger {
  color: #F56C6C;
}

.status-desc {
  font-size: 12px;
  color: #C0C4CC;
}

.chart-section {
  margin-bottom: 20px;
}

.chart-container {
  height: 300px;
}

.bottom-section .el-card {
  height: 300px;
}

.service-list, .db-status, .alert-list {
  padding: 10px 0;
}

.service-item, .db-item, .alert-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #EBEEF5;
}

.service-item:last-child,
.db-item:last-child,
.alert-item:last-child {
  border-bottom: none;
}

.service-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.service-name {
  font-weight: 500;
}

.service-uptime {
  font-size: 12px;
  color: #909399;
}

.db-value {
  font-weight: 500;
  color: #409EFF;
}

.alert-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.alert-message {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.alert-time {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}
</style>