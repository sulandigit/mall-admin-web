<template>
  <div class="system-monitor">
    <!-- 实时指标卡片 -->
    <el-row :gutter="20" class="metrics-cards">
      <el-col :span="6">
        <el-card class="metric-card">
          <div class="metric-header">
            <span class="metric-title">CPU使用率</span>
            <el-tag :type="getCpuTagType()" size="small">
              {{ getCpuStatus() }}
            </el-tag>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ systemMetrics.cpu.usage }}%</div>
            <div class="metric-details">
              <div>核心数: {{ systemMetrics.cpu.cores }}</div>
              <div>温度: {{ systemMetrics.cpu.temperature }}°C</div>
            </div>
          </div>
          <div class="metric-progress">
            <el-progress
              :percentage="systemMetrics.cpu.usage"
              :color="getCpuProgressColor()"
              :show-text="false"
            ></el-progress>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="metric-card">
          <div class="metric-header">
            <span class="metric-title">内存使用率</span>
            <el-tag :type="getMemoryTagType()" size="small">
              {{ getMemoryStatus() }}
            </el-tag>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ getMemoryUsage() }}%</div>
            <div class="metric-details">
              <div>已用: {{ formatMemory(systemMetrics.memory.used) }}</div>
              <div>总计: {{ formatMemory(systemMetrics.memory.total) }}</div>
            </div>
          </div>
          <div class="metric-progress">
            <el-progress
              :percentage="getMemoryUsage()"
              :color="getMemoryProgressColor()"
              :show-text="false"
            ></el-progress>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="metric-card">
          <div class="metric-header">
            <span class="metric-title">磁盘使用率</span>
            <el-tag :type="getDiskTagType()" size="small">
              {{ getDiskStatus() }}
            </el-tag>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ getDiskUsage() }}%</div>
            <div class="metric-details">
              <div>已用: {{ formatDisk(systemMetrics.disk.used) }}</div>
              <div>总计: {{ formatDisk(systemMetrics.disk.total) }}</div>
            </div>
          </div>
          <div class="metric-progress">
            <el-progress
              :percentage="getDiskUsage()"
              :color="getDiskProgressColor()"
              :show-text="false"
            ></el-progress>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="metric-card">
          <div class="metric-header">
            <span class="metric-title">网络流量</span>
            <el-tag type="info" size="small">实时</el-tag>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ systemMetrics.network.inbound }}KB/s</div>
            <div class="metric-details">
              <div>入站: {{ systemMetrics.network.inbound }}KB/s</div>
              <div>出站: {{ systemMetrics.network.outbound }}KB/s</div>
            </div>
          </div>
          <div class="network-chart">
            <canvas ref="networkCanvas" width="200" height="50"></canvas>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细监控图表 -->
    <el-row :gutter="20" class="charts-section">
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>CPU使用率趋势</span>
            <div style="float: right;">
              <el-button-group size="mini">
                <el-button 
                  :type="cpuTimeRange === '1h' ? 'primary' : ''" 
                  @click="setCpuTimeRange('1h')"
                >1小时</el-button>
                <el-button 
                  :type="cpuTimeRange === '6h' ? 'primary' : ''" 
                  @click="setCpuTimeRange('6h')"
                >6小时</el-button>
                <el-button 
                  :type="cpuTimeRange === '24h' ? 'primary' : ''" 
                  @click="setCpuTimeRange('24h')"
                >24小时</el-button>
              </el-button-group>
              <el-button 
                type="text" 
                @click="refreshCpuChart"
                style="margin-left: 10px;"
              >
                <i class="el-icon-refresh"></i>
              </el-button>
            </div>
          </div>
          <div class="chart-container">
            <ve-line
              :data="cpuChartData"
              :settings="cpuChartSettings"
              :loading="cpuChartLoading"
              height="350px"
            ></ve-line>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>内存使用趋势</span>
            <div style="float: right;">
              <el-button-group size="mini">
                <el-button 
                  :type="memoryTimeRange === '1h' ? 'primary' : ''" 
                  @click="setMemoryTimeRange('1h')"
                >1小时</el-button>
                <el-button 
                  :type="memoryTimeRange === '6h' ? 'primary' : ''" 
                  @click="setMemoryTimeRange('6h')"
                >6小时</el-button>
                <el-button 
                  :type="memoryTimeRange === '24h' ? 'primary' : ''" 
                  @click="setMemoryTimeRange('24h')"
                >24小时</el-button>
              </el-button-group>
              <el-button 
                type="text" 
                @click="refreshMemoryChart"
                style="margin-left: 10px;"
              >
                <i class="el-icon-refresh"></i>
              </el-button>
            </div>
          </div>
          <div class="chart-container">
            <ve-line
              :data="memoryChartData"
              :settings="memoryChartSettings"
              :loading="memoryChartLoading"
              height="350px"
            ></ve-line>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 进程和服务监控 -->
    <el-row :gutter="20" class="bottom-section">
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>TOP进程 (按CPU使用率)</span>
            <el-button 
              type="text" 
              @click="refreshProcessList"
              style="float: right;"
            >
              <i class="el-icon-refresh"></i>
            </el-button>
          </div>
          <el-table
            :data="topProcesses"
            size="small"
            height="300"
          >
            <el-table-column prop="pid" label="PID" width="80"></el-table-column>
            <el-table-column prop="name" label="进程名" min-width="120"></el-table-column>
            <el-table-column prop="cpu" label="CPU%" width="80" sortable>
              <template slot-scope="scope">
                <span :class="getProcessCpuClass(scope.row.cpu)">
                  {{ scope.row.cpu }}%
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="memory" label="内存%" width="80" sortable>
              <template slot-scope="scope">
                <span :class="getProcessMemoryClass(scope.row.memory)">
                  {{ scope.row.memory }}%
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="user" label="用户" width="100"></el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>系统服务状态</span>
            <el-button 
              type="text" 
              @click="refreshServiceList"
              style="float: right;"
            >
              <i class="el-icon-refresh"></i>
            </el-button>
          </div>
          <el-table
            :data="systemServices"
            size="small"
            height="300"
          >
            <el-table-column prop="name" label="服务名" min-width="120"></el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag
                  :type="scope.row.status === 'running' ? 'success' : 'danger'"
                  size="mini"
                >
                  {{ scope.row.status === 'running' ? '运行中' : '已停止' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="cpu" label="CPU%" width="80">
              <template slot-scope="scope">
                <span>{{ scope.row.cpu }}%</span>
              </template>
            </el-table-column>
            <el-table-column prop="memory" label="内存" width="100">
              <template slot-scope="scope">
                <span>{{ formatMemory(scope.row.memory) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="text"
                  @click="handleServiceAction(scope.row)"
                >
                  {{ scope.row.status === 'running' ? '停止' : '启动' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getSystemMetrics } from '@/api/monitor'

export default {
  name: 'SystemMonitor',
  data() {
    return {
      // 系统指标数据
      systemMetrics: {
        cpu: { usage: 0, cores: 0, temperature: 0 },
        memory: { total: 0, used: 0 },
        disk: { total: 0, used: 0 },
        network: { inbound: 0, outbound: 0 }
      },
      
      // 图表时间范围
      cpuTimeRange: '1h',
      memoryTimeRange: '1h',
      
      // CPU图表数据
      cpuChartData: {
        columns: ['time', 'CPU使用率', '温度'],
        rows: []
      },
      cpuChartSettings: {
        axisSite: { right: ['温度'] },
        labelMap: {
          'CPU使用率': 'CPU使用率(%)',
          '温度': '温度(°C)'
        }
      },
      cpuChartLoading: false,
      
      // 内存图表数据
      memoryChartData: {
        columns: ['time', '内存使用量', '内存使用率'],
        rows: []
      },
      memoryChartSettings: {
        axisSite: { right: ['内存使用率'] },
        labelMap: {
          '内存使用量': '内存使用量(GB)',
          '内存使用率': '内存使用率(%)'
        }
      },
      memoryChartLoading: false,
      
      // 进程列表
      topProcesses: [],
      
      // 系统服务
      systemServices: [],
      
      // 网络流量历史数据
      networkHistory: [],
      
      // 定时器
      timer: null,
      networkTimer: null
    }
  },
  
  created() {
    this.loadData()
    this.startAutoRefresh()
    this.startNetworkChart()
  },
  
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
    if (this.networkTimer) {
      clearInterval(this.networkTimer)
    }
  },
  
  methods: {
    // 加载所有数据
    async loadData() {
      await Promise.all([
        this.loadSystemMetrics(),
        this.loadChartData(),
        this.loadProcessList(),
        this.loadServiceList()
      ])
    },
    
    // 加载系统指标
    async loadSystemMetrics() {
      try {
        const response = await getSystemMetrics()
        this.systemMetrics = response.data
        
        // 添加网络流量历史数据
        this.networkHistory.push({
          time: Date.now(),
          inbound: this.systemMetrics.network.inbound,
          outbound: this.systemMetrics.network.outbound
        })
        
        // 保持最近100个数据点
        if (this.networkHistory.length > 100) {
          this.networkHistory.shift()
        }
      } catch (error) {
        console.error('Failed to load system metrics:', error)
      }
    },
    
    // 加载图表数据
    loadChartData() {
      this.loadCpuChart()
      this.loadMemoryChart()
    },
    
    // 加载CPU图表数据
    loadCpuChart() {
      this.cpuChartLoading = true
      
      try {
        const rows = []
        const now = new Date()
        let points = 12
        let interval = 5 * 60 * 1000 // 5分钟
        
        if (this.cpuTimeRange === '6h') {
          points = 24
          interval = 15 * 60 * 1000 // 15分钟
        } else if (this.cpuTimeRange === '24h') {
          points = 24
          interval = 60 * 60 * 1000 // 1小时
        }
        
        for (let i = points - 1; i >= 0; i--) {
          const time = new Date(now.getTime() - i * interval)
          const timeStr = time.toLocaleTimeString().slice(0, 5)
          
          rows.push({
            time: timeStr,
            'CPU使用率': Math.floor(Math.random() * 40) + 20,
            '温度': Math.floor(Math.random() * 15) + 45
          })
        }
        
        this.cpuChartData.rows = rows
      } catch (error) {
        console.error('Failed to load CPU chart data:', error)
      } finally {
        this.cpuChartLoading = false
      }
    },
    
    // 加载内存图表数据
    loadMemoryChart() {
      this.memoryChartLoading = true
      
      try {
        const rows = []
        const now = new Date()
        let points = 12
        let interval = 5 * 60 * 1000 // 5分钟
        
        if (this.memoryTimeRange === '6h') {
          points = 24
          interval = 15 * 60 * 1000 // 15分钟
        } else if (this.memoryTimeRange === '24h') {
          points = 24
          interval = 60 * 60 * 1000 // 1小时
        }
        
        for (let i = points - 1; i >= 0; i--) {
          const time = new Date(now.getTime() - i * interval)
          const timeStr = time.toLocaleTimeString().slice(0, 5)
          
          const usageGB = Math.random() * 8 + 4 // 4-12GB
          const usagePercent = (usageGB / 16) * 100
          
          rows.push({
            time: timeStr,
            '内存使用量': usageGB.toFixed(2),
            '内存使用率': Math.floor(usagePercent)
          })
        }
        
        this.memoryChartData.rows = rows
      } catch (error) {
        console.error('Failed to load memory chart data:', error)
      } finally {
        this.memoryChartLoading = false
      }
    },
    
    // 加载进程列表
    loadProcessList() {
      const processes = [
        { pid: 1234, name: 'java', cpu: 25.6, memory: 15.2, user: 'root' },
        { pid: 5678, name: 'mysql', cpu: 18.3, memory: 12.8, user: 'mysql' },
        { pid: 9012, name: 'nginx', cpu: 5.2, memory: 2.1, user: 'www' },
        { pid: 3456, name: 'redis', cpu: 3.8, memory: 4.5, user: 'redis' },
        { pid: 7890, name: 'node', cpu: 2.9, memory: 8.7, user: 'app' },
        { pid: 2345, name: 'python', cpu: 1.5, memory: 3.2, user: 'app' },
        { pid: 6789, name: 'php-fpm', cpu: 1.2, memory: 1.8, user: 'www' },
        { pid: 4567, name: 'elasticsearch', cpu: 0.8, memory: 20.5, user: 'elastic' }
      ]
      
      // 添加随机波动
      this.topProcesses = processes.map(process => ({
        ...process,
        cpu: (process.cpu + (Math.random() - 0.5) * 2).toFixed(1),
        memory: (process.memory + (Math.random() - 0.5) * 1).toFixed(1)
      })).sort((a, b) => b.cpu - a.cpu)
    },
    
    // 加载服务列表
    loadServiceList() {
      this.systemServices = [
        { name: 'tomcat', status: 'running', cpu: 15.2, memory: 512 },
        { name: 'nginx', status: 'running', cpu: 2.1, memory: 64 },
        { name: 'mysql', status: 'running', cpu: 8.5, memory: 1024 },
        { name: 'redis', status: 'running', cpu: 1.8, memory: 256 },
        { name: 'elasticsearch', status: 'running', cpu: 12.3, memory: 2048 },
        { name: 'mongodb', status: 'stopped', cpu: 0, memory: 0 }
      ]
    },
    
    // 开始自动刷新
    startAutoRefresh() {
      this.timer = setInterval(() => {
        this.loadData()
      }, 5000) // 每5秒刷新一次
    },
    
    // 开始网络图表
    startNetworkChart() {
      this.$nextTick(() => {
        this.drawNetworkChart()
        this.networkTimer = setInterval(() => {
          this.drawNetworkChart()
        }, 1000) // 每秒更新一次网络图表
      })
    },
    
    // 绘制网络流量图表
    drawNetworkChart() {
      const canvas = this.$refs.networkCanvas
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      const width = canvas.width
      const height = canvas.height
      
      ctx.clearRect(0, 0, width, height)
      
      if (this.networkHistory.length < 2) return
      
      // 设置样式
      ctx.strokeStyle = '#409EFF'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      
      // 计算比例
      const maxValue = Math.max(...this.networkHistory.map(item => Math.max(item.inbound, item.outbound)))
      const stepX = width / (this.networkHistory.length - 1)
      
      // 绘制入站流量
      ctx.beginPath()
      this.networkHistory.forEach((item, index) => {
        const x = index * stepX
        const y = height - (item.inbound / maxValue) * height
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()
      
      // 绘制出站流量
      ctx.strokeStyle = '#67C23A'
      ctx.beginPath()
      this.networkHistory.forEach((item, index) => {
        const x = index * stepX
        const y = height - (item.outbound / maxValue) * height
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()
    },
    
    // 设置CPU时间范围
    setCpuTimeRange(range) {
      this.cpuTimeRange = range
      this.loadCpuChart()
    },
    
    // 设置内存时间范围
    setMemoryTimeRange(range) {
      this.memoryTimeRange = range
      this.loadMemoryChart()
    },
    
    // 刷新图表
    refreshCpuChart() {
      this.loadCpuChart()
    },
    
    refreshMemoryChart() {
      this.loadMemoryChart()
    },
    
    refreshProcessList() {
      this.loadProcessList()
    },
    
    refreshServiceList() {
      this.loadServiceList()
    },
    
    // 服务操作
    handleServiceAction(service) {
      const action = service.status === 'running' ? '停止' : '启动'
      this.$confirm(`确定要${action}服务 ${service.name} 吗？`, '确认操作', {
        type: 'warning'
      }).then(() => {
        service.status = service.status === 'running' ? 'stopped' : 'running'
        this.$message.success(`服务 ${service.name} ${action}成功`)
      }).catch(() => {})
    },
    
    // 获取状态相关方法
    getCpuStatus() {
      const usage = this.systemMetrics.cpu.usage
      if (usage >= 80) return '高负载'
      if (usage >= 60) return '中等负载'
      return '正常'
    },
    
    getCpuTagType() {
      const usage = this.systemMetrics.cpu.usage
      if (usage >= 80) return 'danger'
      if (usage >= 60) return 'warning'
      return 'success'
    },
    
    getCpuProgressColor() {
      const usage = this.systemMetrics.cpu.usage
      if (usage >= 80) return '#F56C6C'
      if (usage >= 60) return '#E6A23C'
      return '#67C23A'
    },
    
    getMemoryStatus() {
      const usage = this.getMemoryUsage()
      if (usage >= 85) return '内存不足'
      if (usage >= 70) return '使用较多'
      return '正常'
    },
    
    getMemoryTagType() {
      const usage = this.getMemoryUsage()
      if (usage >= 85) return 'danger'
      if (usage >= 70) return 'warning'
      return 'success'
    },
    
    getMemoryProgressColor() {
      const usage = this.getMemoryUsage()
      if (usage >= 85) return '#F56C6C'
      if (usage >= 70) return '#E6A23C'
      return '#67C23A'
    },
    
    getDiskStatus() {
      const usage = this.getDiskUsage()
      if (usage >= 90) return '空间不足'
      if (usage >= 80) return '空间较少'
      return '正常'
    },
    
    getDiskTagType() {
      const usage = this.getDiskUsage()
      if (usage >= 90) return 'danger'
      if (usage >= 80) return 'warning'
      return 'success'
    },
    
    getDiskProgressColor() {
      const usage = this.getDiskUsage()
      if (usage >= 90) return '#F56C6C'
      if (usage >= 80) return '#E6A23C'
      return '#67C23A'
    },
    
    // 进程CPU样式类
    getProcessCpuClass(cpu) {
      if (cpu > 20) return 'process-high'
      if (cpu > 10) return 'process-medium'
      return 'process-normal'
    },
    
    // 进程内存样式类
    getProcessMemoryClass(memory) {
      if (memory > 15) return 'process-high'
      if (memory > 8) return 'process-medium'
      return 'process-normal'
    },
    
    // 计算使用率
    getMemoryUsage() {
      if (this.systemMetrics.memory.total === 0) return 0
      return Math.round((this.systemMetrics.memory.used / this.systemMetrics.memory.total) * 100)
    },
    
    getDiskUsage() {
      if (this.systemMetrics.disk.total === 0) return 0
      return Math.round((this.systemMetrics.disk.used / this.systemMetrics.disk.total) * 100)
    },
    
    // 格式化方法
    formatMemory(mb) {
      if (mb >= 1024) {
        return (mb / 1024).toFixed(1) + 'GB'
      }
      return mb + 'MB'
    },
    
    formatDisk(mb) {
      if (mb >= 1024 * 1024) {
        return (mb / (1024 * 1024)).toFixed(1) + 'TB'
      }
      if (mb >= 1024) {
        return (mb / 1024).toFixed(1) + 'GB'
      }
      return mb + 'MB'
    }
  }
}
</script>

<style scoped>
.system-monitor {
  padding: 20px;
}

.metrics-cards {
  margin-bottom: 20px;
}

.metric-card {
  height: 160px;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.metric-title {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.metric-content {
  margin-bottom: 15px;
}

.metric-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.metric-details {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}

.metric-progress {
  margin-top: 10px;
}

.charts-section {
  margin-bottom: 20px;
}

.chart-container {
  height: 350px;
}

.bottom-section .el-card {
  height: 380px;
}

.network-chart {
  margin-top: 10px;
  text-align: center;
}

.process-high {
  color: #F56C6C;
  font-weight: bold;
}

.process-medium {
  color: #E6A23C;
  font-weight: 500;
}

.process-normal {
  color: #67C23A;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .metrics-cards .el-col {
    margin-bottom: 20px;
  }
  
  .charts-section .el-col {
    margin-bottom: 20px;
  }
}
</style>