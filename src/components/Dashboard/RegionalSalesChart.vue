<template>
  <el-card class="chart-card">
    <div slot="header" class="chart-header">
      <span class="chart-title">地域销售分布</span>
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
      <ve-histogram 
        :data="chartData"
        :settings="barSettings"
        :extend="chartExtend"
        :height="height"
      />
    </div>
    
    <div class="regional-details">
      <div 
        v-for="(item, index) in regionalData" 
        :key="index"
        class="regional-item"
      >
        <div class="region-name">{{ item.region }}</div>
        <div class="region-sales">¥{{ item.sales.toLocaleString() }}</div>
        <div class="region-percentage">{{ item.percentage }}%</div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: item.percentage + '%', backgroundColor: colors[index % colors.length] }"
          ></div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'RegionalSalesChart',
  
  props: {
    height: {
      type: String,
      default: '300px'
    }
  },
  
  data() {
    return {
      colors: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
    }
  },
  
  computed: {
    ...mapState('salesDashboard', ['regionalSales', 'uiState']),
    
    loading() {
      return this.uiState.loading
    },
    
    regionalData() {
      return this.regionalSales || []
    },
    
    chartData() {
      return {
        columns: ['地区', '销售额'],
        rows: this.regionalData.map(item => ({
          '地区': item.region,
          '销售额': item.sales
        }))
      }
    },
    
    barSettings() {
      return {
        dimension: ['地区'],
        metrics: ['销售额']
      }
    },
    
    chartExtend() {
      return {
        color: this.colors,
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: 'transparent',
          textStyle: {
            color: '#fff'
          },
          formatter: function(params) {
            const data = params[0]
            return `${data.name}<br/>销售额: ¥${data.value.toLocaleString()}`
          }
        },
        xAxis: {
          type: 'category',
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
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#E4E7ED'
            }
          },
          axisLabel: {
            color: '#606266',
            formatter: function(value) {
              return '¥' + (value / 1000).toFixed(0) + 'K'
            }
          },
          splitLine: {
            lineStyle: {
              color: '#F2F6FC'
            }
          }
        }
      }
    }
  },
  
  methods: {
    handleRefresh() {
      this.$store.dispatch('salesDashboard/fetchRegionalSales')
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
  
  .regional-details {
    margin-top: 16px;
    
    .regional-item {
      display: grid;
      grid-template-columns: 1fr auto auto;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #F2F6FC;
      
      &:last-child {
        border-bottom: none;
      }
      
      .region-name {
        font-size: 14px;
        color: #303133;
        font-weight: 500;
      }
      
      .region-sales {
        font-size: 14px;
        color: #409EFF;
        font-weight: 500;
      }
      
      .region-percentage {
        font-size: 12px;
        color: #909399;
        width: 50px;
        text-align: right;
      }
      
      .progress-bar {
        grid-column: 1 / -1;
        height: 4px;
        background: #F2F6FC;
        border-radius: 2px;
        overflow: hidden;
        margin-top: 4px;
        
        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .regional-details {
    .regional-item {
      grid-template-columns: 1fr;
      text-align: left;
      
      .region-percentage {
        text-align: left;
        width: auto;
      }
      
      .progress-bar {
        margin-top: 8px;
      }
    }
  }
}
</style>