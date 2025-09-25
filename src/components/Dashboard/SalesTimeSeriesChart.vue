<template>
  <el-card class=\"chart-card\">
    <div slot=\"header\" class=\"chart-header\">
      <span class=\"chart-title\">{{ title }}</span>
      <div class=\"chart-controls\">
        <el-button-group v-if=\"showTimeRange\">
          <el-button 
            size=\"mini\" 
            :type=\"timeRange === 'today' ? 'primary' : ''\"
            @click=\"handleTimeRangeChange('today')\"
          >
            今日
          </el-button>
          <el-button 
            size=\"mini\" 
            :type=\"timeRange === 'week' ? 'primary' : ''\"
            @click=\"handleTimeRangeChange('week')\"
          >
            本周
          </el-button>
          <el-button 
            size=\"mini\" 
            :type=\"timeRange === 'month' ? 'primary' : ''\"
            @click=\"handleTimeRangeChange('month')\"
          >
            本月
          </el-button>
        </el-button-group>
        
        <el-dropdown v-if=\"showChartType\" @command=\"handleChartTypeChange\">
          <el-button size=\"mini\">
            图表类型<i class=\"el-icon-arrow-down el-icon--right\"></i>
          </el-button>
          <el-dropdown-menu slot=\"dropdown\">
            <el-dropdown-item command=\"line\">折线图</el-dropdown-item>
            <el-dropdown-item command=\"bar\">柱状图</el-dropdown-item>
            <el-dropdown-item command=\"area\">面积图</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        
        <el-button 
          size=\"mini\" 
          icon=\"el-icon-refresh\" 
          @click=\"handleRefresh\"
          :loading=\"loading\"
        >
          刷新
        </el-button>
      </div>
    </div>
    
    <div class=\"chart-content\" v-loading=\"loading\">
      <ve-line 
        v-if=\"chartType === 'line'\"
        :data=\"chartData\"
        :settings=\"lineSettings\"
        :extend=\"chartExtend\"
        :height=\"height\"
      />
      <ve-histogram 
        v-else-if=\"chartType === 'bar'\"
        :data=\"chartData\"
        :settings=\"barSettings\"
        :extend=\"chartExtend\"
        :height=\"height\"
      />
      <ve-area 
        v-else-if=\"chartType === 'area'\"
        :data=\"chartData\"
        :settings=\"areaSettings\"
        :extend=\"chartExtend\"
        :height=\"height\"
      />
    </div>
    
    <div class=\"chart-footer\" v-if=\"showFooter\">
      <div class=\"chart-stats\">
        <span class=\"stat-item\">
          <strong>最高值:</strong> {{ maxValue }}
        </span>
        <span class=\"stat-item\">
          <strong>最低值:</strong> {{ minValue }}
        </span>
        <span class=\"stat-item\">
          <strong>平均值:</strong> {{ avgValue }}
        </span>
      </div>
      <div class=\"last-update\">
        最后更新: {{ lastUpdateText }}
      </div>
    </div>
  </el-card>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'SalesTimeSeriesChart',
  
  props: {
    title: {
      type: String,
      default: '销售趋势图'
    },
    height: {
      type: String,
      default: '400px'
    },
    showTimeRange: {
      type: Boolean,
      default: true
    },
    showChartType: {
      type: Boolean,
      default: true
    },
    showFooter: {
      type: Boolean,
      default: true
    }
  },
  
  data() {
    return {
      chartType: 'line'
    }
  },
  
  computed: {
    ...mapState('salesDashboard', ['historicalData', 'uiState']),
    
    loading() {
      return this.uiState.loading
    },
    
    timeRange() {
      return this.uiState.selectedTimeRange
    },
    
    chartData() {
      const trends = this.historicalData.dailyTrends || []
      
      return {
        columns: ['时间', '销售额', '订单数'],
        rows: trends.map(item => ({
          '时间': item.hour || item.date,
          '销售额': item.sales,
          '订单数': item.orders
        }))
      }
    },
    
    lineSettings() {
      return {
        metrics: ['销售额', '订单数'],
        dimension: ['时间']
      }
    },
    
    barSettings() {
      return {
        metrics: ['销售额'],
        dimension: ['时间']
      }
    },
    
    areaSettings() {
      return {
        metrics: ['销售额'],
        dimension: ['时间']
      }
    },
    
    chartExtend() {
      return {
        color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C'],
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
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
            color: '#606266'
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#E4E7ED'
            }
          },
          axisLabel: {
            color: '#606266'
          },
          splitLine: {
            lineStyle: {
              color: '#F2F6FC'
            }
          }
        }
      }
    },
    
    maxValue() {
      const values = this.historicalData.dailyTrends?.map(item => item.sales) || []
      return values.length ? Math.max(...values).toLocaleString() : '--'
    },
    
    minValue() {
      const values = this.historicalData.dailyTrends?.map(item => item.sales) || []
      return values.length ? Math.min(...values).toLocaleString() : '--'
    },
    
    avgValue() {
      const values = this.historicalData.dailyTrends?.map(item => item.sales) || []
      if (!values.length) return '--'
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length
      return avg.toLocaleString()
    },
    
    lastUpdateText() {
      const lastUpdate = this.$store.state.salesDashboard.realTimeData.lastUpdateTime
      if (!lastUpdate) return '暂无数据'
      
      const date = new Date(lastUpdate)
      return date.toLocaleString('zh-CN')
    }
  },
  
  methods: {
    handleTimeRangeChange(range) {
      this.$store.dispatch('salesDashboard/setTimeRange', range)
    },
    
    handleChartTypeChange(type) {
      this.chartType = type
    },
    
    handleRefresh() {
      this.$store.dispatch('salesDashboard/fetchHistoricalData')
    }
  }
}
</script>

<style lang=\"scss\" scoped>
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
    
    .chart-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
  
  .chart-content {
    min-height: 400px;
  }
  
  .chart-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    border-top: 1px solid #EBEEF5;
    font-size: 12px;
    color: #909399;
    
    .chart-stats {
      display: flex;
      gap: 24px;
      
      .stat-item {
        strong {
          color: #606266;
        }
      }
    }
    
    .last-update {
      color: #C0C4CC;
    }
  }
}

@media (max-width: 768px) {
  .chart-card {
    .chart-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      
      .chart-controls {
        width: 100%;
        justify-content: flex-end;
      }
    }
    
    .chart-footer {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      
      .chart-stats {
        flex-wrap: wrap;
        gap: 12px;
      }
    }
  }
}
</style>