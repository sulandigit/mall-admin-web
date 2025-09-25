<template>
  <el-dialog
    title="客服统计分析"
    :visible.sync="dialogVisible"
    width="800px"
    @opened="loadAnalyticsData"
  >
    <!-- 时间范围选择 -->
    <div class="date-range-selector">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="yyyy-MM-dd"
        value-format="yyyy-MM-dd"
        @change="handleDateRangeChange"
      />
      <el-button-group style="margin-left: 12px;">
        <el-button size="small" @click="setDateRange('today')">今天</el-button>
        <el-button size="small" @click="setDateRange('week')">本周</el-button>
        <el-button size="small" @click="setDateRange('month')">本月</el-button>
      </el-button-group>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="16">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon sessions">
              <i class="el-icon-chat-dot-round"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ analytics.sessionCount }}</div>
              <div class="stat-label">接待会话</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon messages">
              <i class="el-icon-chat-line-round"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ analytics.messageCount }}</div>
              <div class="stat-label">发送消息</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon response">
              <i class="el-icon-timer"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ analytics.avgResponseTime }}s</div>
              <div class="stat-label">平均响应</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon satisfaction">
              <i class="el-icon-star-on"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ analytics.satisfactionRate }}%</div>
              <div class="stat-label">满意度</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <el-row :gutter="16">
        <!-- 会话趋势图 -->
        <el-col :span="12">
          <el-card>
            <div slot="header">会话趋势</div>
            <div ref="sessionChart" style="height: 300px;"></div>
          </el-card>
        </el-col>
        
        <!-- 响应时间分布 -->
        <el-col :span="12">
          <el-card>
            <div slot="header">响应时间分布</div>
            <div ref="responseChart" style="height: 300px;"></div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="16" style="margin-top: 16px;">
        <!-- 满意度评价 -->
        <el-col :span="12">
          <el-card>
            <div slot="header">满意度评价</div>
            <div ref="satisfactionChart" style="height: 300px;"></div>
          </el-card>
        </el-col>
        
        <!-- 工作时长统计 -->
        <el-col :span="12">
          <el-card>
            <div slot="header">工作时长统计</div>
            <div ref="workTimeChart" style="height: 300px;"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 详细数据表格 -->
    <div class="detail-table">
      <el-card>
        <div slot="header">详细数据</div>
        <el-table :data="detailData" v-loading="loading">
          <el-table-column prop="date" label="日期" />
          <el-table-column prop="sessionCount" label="会话数" />
          <el-table-column prop="messageCount" label="消息数" />
          <el-table-column prop="avgResponseTime" label="平均响应时间(s)" />
          <el-table-column prop="satisfactionRate" label="满意度(%)" />
          <el-table-column prop="workDuration" label="工作时长(h)" />
        </el-table>
      </el-card>
    </div>

    <div slot="footer">
      <el-button @click="exportData">导出数据</el-button>
      <el-button type="primary" @click="dialogVisible = false">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapActions } from 'vuex'
import * as echarts from 'echarts'

export default {
  name: 'ServiceAnalyticsDialog',

  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      dateRange: [],
      loading: false,
      
      analytics: {
        sessionCount: 0,
        messageCount: 0,
        avgResponseTime: 0,
        satisfactionRate: 0
      },
      
      detailData: [],
      
      charts: {
        session: null,
        response: null,
        satisfaction: null,
        workTime: null
      }
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

  mounted() {
    // 设置默认日期范围为本月
    this.setDateRange('month')
  },

  beforeDestroy() {
    this.destroyCharts()
  },

  methods: {
    ...mapActions('customerService', ['loadAnalytics']),

    // 设置日期范围
    setDateRange(type) {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      switch (type) {
        case 'today':
          this.dateRange = [
            this.formatDate(today),
            this.formatDate(today)
          ]
          break
        case 'week':
          const weekStart = new Date(today)
          weekStart.setDate(today.getDate() - today.getDay())
          this.dateRange = [
            this.formatDate(weekStart),
            this.formatDate(today)
          ]
          break
        case 'month':
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
          this.dateRange = [
            this.formatDate(monthStart),
            this.formatDate(today)
          ]
          break
      }
      
      this.loadAnalyticsData()
    },

    // 处理日期范围变化
    handleDateRangeChange() {
      if (this.dateRange && this.dateRange.length === 2) {
        this.loadAnalyticsData()
      }
    },

    // 加载分析数据
    async loadAnalyticsData() {
      if (!this.dateRange || this.dateRange.length !== 2) return

      this.loading = true
      try {
        const params = {
          startDate: this.dateRange[0],
          endDate: this.dateRange[1]
        }
        
        // 模拟数据，实际应该从API获取
        await this.loadMockData(params)
        
        // 渲染图表
        this.$nextTick(() => {
          this.renderCharts()
        })
      } catch (error) {
        console.error('加载统计数据失败:', error)
        this.$message.error('加载统计数据失败')
      } finally {
        this.loading = false
      }
    },

    // 加载模拟数据
    async loadMockData(params) {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 生成模拟数据
      this.analytics = {
        sessionCount: Math.floor(Math.random() * 100) + 50,
        messageCount: Math.floor(Math.random() * 500) + 200,
        avgResponseTime: Math.floor(Math.random() * 30) + 15,
        satisfactionRate: Math.floor(Math.random() * 20) + 80
      }
      
      // 生成详细数据
      this.detailData = this.generateDetailData()
    },

    // 生成详细数据
    generateDetailData() {
      const data = []
      const startDate = new Date(this.dateRange[0])
      const endDate = new Date(this.dateRange[1])
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        data.push({
          date: this.formatDate(new Date(d)),
          sessionCount: Math.floor(Math.random() * 20) + 5,
          messageCount: Math.floor(Math.random() * 100) + 20,
          avgResponseTime: Math.floor(Math.random() * 20) + 10,
          satisfactionRate: Math.floor(Math.random() * 15) + 85,
          workDuration: Math.floor(Math.random() * 4) + 6
        })
      }
      
      return data
    },

    // 渲染图表
    renderCharts() {
      this.renderSessionChart()
      this.renderResponseChart()
      this.renderSatisfactionChart()
      this.renderWorkTimeChart()
    },

    // 渲染会话趋势图
    renderSessionChart() {
      if (!this.$refs.sessionChart) return

      this.charts.session = echarts.init(this.$refs.sessionChart)
      
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: this.detailData.map(item => item.date)
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          name: '会话数',
          type: 'line',
          data: this.detailData.map(item => item.sessionCount),
          smooth: true,
          areaStyle: {
            opacity: 0.3
          }
        }]
      }
      
      this.charts.session.setOption(option)
    },

    // 渲染响应时间分布图
    renderResponseChart() {
      if (!this.$refs.responseChart) return

      this.charts.response = echarts.init(this.$refs.responseChart)
      
      const option = {
        tooltip: {
          trigger: 'item'
        },
        series: [{
          type: 'pie',
          radius: '50%',
          data: [
            { value: 35, name: '0-10秒' },
            { value: 40, name: '10-30秒' },
            { value: 20, name: '30-60秒' },
            { value: 5, name: '60秒以上' }
          ]
        }]
      }
      
      this.charts.response.setOption(option)
    },

    // 渲染满意度评价图
    renderSatisfactionChart() {
      if (!this.$refs.satisfactionChart) return

      this.charts.satisfaction = echarts.init(this.$refs.satisfactionChart)
      
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: ['非常满意', '满意', '一般', '不满意', '非常不满意']
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          type: 'bar',
          data: [45, 30, 15, 8, 2],
          itemStyle: {
            color: '#67C23A'
          }
        }]
      }
      
      this.charts.satisfaction.setOption(option)
    },

    // 渲染工作时长统计图
    renderWorkTimeChart() {
      if (!this.$refs.workTimeChart) return

      this.charts.workTime = echarts.init(this.$refs.workTimeChart)
      
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: this.detailData.map(item => item.date)
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          name: '工作时长(小时)',
          type: 'bar',
          data: this.detailData.map(item => item.workDuration),
          itemStyle: {
            color: '#409EFF'
          }
        }]
      }
      
      this.charts.workTime.setOption(option)
    },

    // 销毁图表
    destroyCharts() {
      Object.values(this.charts).forEach(chart => {
        if (chart) {
          chart.dispose()
        }
      })
    },

    // 导出数据
    exportData() {
      this.$message.info('导出数据功能开发中')
    },

    // 格式化日期
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  }
}
</script>

<style lang="scss" scoped>
.date-range-selector {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.stats-cards {
  margin-bottom: 20px;

  .stat-card {
    display: flex;
    align-items: center;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    border-left: 4px solid;

    &:nth-child(1) { border-left-color: #409EFF; }
    &:nth-child(2) { border-left-color: #67C23A; }
    &:nth-child(3) { border-left-color: #E6A23C; }
    &:nth-child(4) { border-left-color: #F56C6C; }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;

      i {
        font-size: 24px;
        color: #fff;
      }

      &.sessions { background: #409EFF; }
      &.messages { background: #67C23A; }
      &.response { background: #E6A23C; }
      &.satisfaction { background: #F56C6C; }
    }

    .stat-content {
      .stat-number {
        font-size: 24px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 14px;
        color: #666;
      }
    }
  }
}

.charts-section {
  margin-bottom: 20px;
}

.detail-table {
  ::v-deep .el-card__header {
    padding: 12px 16px;
    background: #f5f7fa;
    border-bottom: 1px solid #ebeef5;
  }
}

::v-deep .el-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
</style>