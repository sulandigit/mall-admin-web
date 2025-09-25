<template>
  <div class="trend-charts">
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card shadow="hover">
          <div slot="header" class="chart-header">
            <span class="chart-title">访问趋势</span>
            <div class="chart-controls">
              <el-radio-group v-model="chartType" size="mini" @change="updateChart">
                <el-radio-button label="visits">访问量</el-radio-button>
                <el-radio-button label="stayTime">停留时间</el-radio-button>
                <el-radio-button label="bounceRate">跳出率</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="chart-container">
            <ve-line
              :data="chartData"
              :settings="chartSettings"
              :loading="loading"
              height="300px"
            ></ve-line>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" style="margin-bottom: 20px;">
          <div slot="header" class="chart-header">
            <span class="chart-title">访问来源分布</span>
          </div>
          <div class="chart-container">
            <ve-pie
              :data="sourceData"
              :settings="pieSettings"
              :loading="loading"
              height="200px"
            ></ve-pie>
          </div>
        </el-card>
        <el-card shadow="hover">
          <div slot="header" class="chart-header">
            <span class="chart-title">设备类型分布</span>
          </div>
          <div class="chart-container">
            <ve-ring
              :data="deviceData"
              :settings="ringSettings"
              :loading="loading"
              height="200px"
            ></ve-ring>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'TrendCharts',
  props: {
    trendData: {
      type: Array,
      default: () => []
    },
    sourceData: {
      type: Array,
      default: () => []
    },
    deviceData: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      chartType: 'visits'
    }
  },
  computed: {
    // 图表数据
    chartData() {
      if (!this.trendData || this.trendData.length === 0) {
        return {
          columns: ['时间', '数值'],
          rows: []
        }
      }
      
      const columns = ['时间', this.getChartLabel()]
      const rows = this.trendData.map(item => ({
        '时间': this.formatDate(item.date),
        [this.getChartLabel()]: this.getChartValue(item)
      }))
      
      return {
        columns,
        rows
      }
    },
    
    // 图表设置
    chartSettings() {
      const settings = {
        area: true,
        smooth: true,
        itemStyle: {
          color: this.getChartColor()
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0,
              color: this.getChartColor()
            }, {
              offset: 1,
              color: 'rgba(255, 255, 255, 0.1)'
            }]
          }
        }
      }
      
      // 根据图表类型设置特殊配置
      if (this.chartType === 'stayTime') {
        settings.yAxisType = ['time']
      } else if (this.chartType === 'bounceRate') {
        settings.yAxisType = ['percent']
      }
      
      return settings
    },
    
    // 饼图设置
    pieSettings() {
      return {
        radius: ['40%', '70%'],
        labelLine: {
          show: false
        },
        label: {
          show: true,
          position: 'center'
        }
      }
    },
    
    // 环形图设置
    ringSettings() {
      return {
        radius: ['40%', '70%'],
        label: {
          show: false
        },
        labelLine: {
          show: false
        }
      }
    }
  },
  methods: {
    // 获取图表标签
    getChartLabel() {
      const labels = {
        visits: '访问量',
        stayTime: '停留时间(秒)',
        bounceRate: '跳出率(%)'
      }
      return labels[this.chartType] || '数值'
    },
    
    // 获取图表值
    getChartValue(item) {
      switch (this.chartType) {
        case 'visits':
          return item.visits || 0
        case 'stayTime':
          return item.stayTime || 0
        case 'bounceRate':
          return ((item.bounceRate || 0) * 100).toFixed(1)
        default:
          return 0
      }
    },
    
    // 获取图表颜色
    getChartColor() {
      const colors = {
        visits: '#409EFF',
        stayTime: '#67C23A',
        bounceRate: '#E6A23C'
      }
      return colors[this.chartType] || '#409EFF'
    },
    
    // 格式化日期
    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return `${date.getMonth() + 1}/${date.getDate()}`
    },
    
    // 更新图表
    updateChart() {
      this.$emit('chart-type-change', this.chartType)
    }
  }
}
</script>

<style scoped>
.trend-charts {
  margin-bottom: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.chart-controls {
  display: flex;
  align-items: center;
}

.chart-container {
  position: relative;
}

/* 自定义 v-charts 样式 */
.chart-container >>> .echarts {
  width: 100% !important;
}

/* 图表加载状态 */
.chart-container >>> .v-charts-mask-status {
  background-color: rgba(255, 255, 255, 0.8);
}
</style>