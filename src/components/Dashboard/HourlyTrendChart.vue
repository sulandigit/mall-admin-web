<template>
  <el-card class="chart-card">
    <div slot="header" class="chart-header">
      <span class="chart-title">小时销售趋势</span>
      <div class="chart-controls">
        <el-button 
          size="mini" 
          icon="el-icon-refresh" 
          @click="handleRefresh"
          :loading="loading"
        >
          刷新
        </el-button>
      </div>
    </div>
    
    <div class="chart-content" v-loading="loading">
      <ve-area 
        :data="chartData"
        :settings="areaSettings"
        :extend="chartExtend"
        :height="height"
      />
    </div>
    
    <div class="hourly-stats">
      <div class="stat-item">
        <div class="stat-label">峰值时段</div>
        <div class="stat-value">{{ peakHour }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">峰值销售额</div>
        <div class="stat-value">¥{{ peakSales }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">低谷时段</div>
        <div class="stat-value">{{ lowHour }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">平均销售额</div>
        <div class="stat-value">¥{{ avgSales }}</div>
      </div>
    </div>
  </el-card>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'HourlyTrendChart',
  
  props: {
    height: {
      type: String,
      default: '300px'
    }
  },
  
  computed: {
    ...mapState('salesDashboard', ['historicalData', 'uiState']),
    
    loading() {
      return this.uiState.loading
    },
    
    hourlyData() {
      return this.historicalData.dailyTrends || []
    },
    
    chartData() {
      return {
        columns: ['时间', '销售额', '订单数'],
        rows: this.hourlyData.map(item => ({
          '时间': item.hour,
          '销售额': item.sales,
          '订单数': item.orders
        }))
      }
    },
    
    areaSettings() {
      return {
        dimension: ['时间'],
        metrics: ['销售额', '订单数']
      }
    },
    
    chartExtend() {
      return {
        color: ['#409EFF', '#67C23A'],
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: 'transparent',
          textStyle: {
            color: '#fff'
          }
        },
        legend: {
          bottom: 0
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          axisLine: {
            lineStyle: {
              color: '#E4E7ED'
            }
          },
          axisLabel: {
            color: '#606266',
            rotate: 45
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '销售额(元)',
            position: 'left',
            axisLine: {
              lineStyle: {
                color: '#E4E7ED'
              }
            },
            axisLabel: {
              color: '#606266',
              formatter: function(value) {
                return '¥' + (value / 1000).toFixed(1) + 'K'
              }
            },
            splitLine: {
              lineStyle: {
                color: '#F2F6FC'
              }
            }
          },
          {
            type: 'value',
            name: '订单数',
            position: 'right',
            axisLine: {
              lineStyle: {
                color: '#E4E7ED'
              }
            },
            axisLabel: {
              color: '#606266'
            }
          }
        ],
        series: [
          {
            name: '销售额',
            type: 'line',
            smooth: true,
            areaStyle: {
              opacity: 0.3
            },
            yAxisIndex: 0
          },
          {
            name: '订单数',
            type: 'line',
            smooth: true,
            areaStyle: {
              opacity: 0.3
            },
            yAxisIndex: 1
          }
        ]
      }
    },
    
    peakHour() {
      if (!this.hourlyData.length) return '--'
      const maxSales = Math.max(...this.hourlyData.map(item => item.sales))
      const peakData = this.hourlyData.find(item => item.sales === maxSales)
      return peakData ? peakData.hour : '--'
    },
    
    peakSales() {
      if (!this.hourlyData.length) return '--'
      const maxSales = Math.max(...this.hourlyData.map(item => item.sales))
      return maxSales.toLocaleString()
    },
    
    lowHour() {
      if (!this.hourlyData.length) return '--'
      const minSales = Math.min(...this.hourlyData.map(item => item.sales))
      const lowData = this.hourlyData.find(item => item.sales === minSales)
      return lowData ? lowData.hour : '--'
    },
    
    avgSales() {
      if (!this.hourlyData.length) return '--'
      const total = this.hourlyData.reduce((sum, item) => sum + item.sales, 0)
      const avg = total / this.hourlyData.length
      return avg.toLocaleString()
    }
  },
  
  methods: {
    handleRefresh() {
      this.$store.dispatch('salesDashboard/fetchHistoricalData')
    }
  }
}
</script>

<style lang="scss" scoped>
.chart-card {
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .chart-title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }
  }
  
  .chart-content {
    min-height: 300px;
  }
  
  .hourly-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 16px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #EBEEF5;
    
    .stat-item {
      text-align: center;
      
      .stat-label {
        font-size: 12px;
        color: #909399;
        margin-bottom: 4px;
      }
      
      .stat-value {
        font-size: 16px;
        font-weight: 500;
        color: #303133;
      }
    }
  }
}

@media (max-width: 768px) {
  .hourly-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>