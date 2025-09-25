<template>
  <div class="product-ranking-chart">
    <div class="chart-header">
      <div class="chart-title">
        <h3>商品排行榜</h3>
        <p class="chart-subtitle">展示热销商品TOP排名</p>
      </div>
      <div class="chart-controls">
        <el-select 
          v-model="sortBy" 
          size="small" 
          @change="onSortChange"
          style="width: 120px;">
          <el-option label="按销售额" value="sales"></el-option>
          <el-option label="按销量" value="quantity"></el-option>
          <el-option label="按利润" value="profit"></el-option>
        </el-select>
        
        <el-select 
          v-model="limit" 
          size="small" 
          @change="onLimitChange"
          style="width: 100px; margin-left: 10px;">
          <el-option label="TOP 5" :value="5"></el-option>
          <el-option label="TOP 10" :value="10"></el-option>
          <el-option label="TOP 20" :value="20"></el-option>
        </el-select>
      </div>
    </div>

    <div class="chart-content" v-loading="loading">
      <div class="chart-wrapper" ref="chartContainer" v-show="!loading && hasData"></div>
      
      <!-- 空数据状态 -->
      <div class="empty-state" v-if="!loading && !hasData">
        <el-empty description="暂无数据">
          <el-button type="primary" @click="$emit('refresh')">重新加载</el-button>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'ProductRankingChart',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    settings: {
      type: Object,
      default: () => ({
        sortBy: 'sales',
        limit: 10
      })
    }
  },
  data() {
    return {
      chart: null,
      sortBy: 'sales',
      limit: 10
    }
  },
  computed: {
    hasData() {
      return this.data && this.data.length > 0
    },
    
    sortedData() {
      if (!this.hasData) return []
      
      return [...this.data]
        .sort((a, b) => b[this.sortBy] - a[this.sortBy])
        .slice(0, this.limit)
    }
  },
  watch: {
    data: {
      handler() {
        this.$nextTick(() => {
          this.updateChart()
        })
      },
      deep: true
    },
    loading(newVal) {
      if (!newVal && this.hasData) {
        this.$nextTick(() => {
          this.initChart()
        })
      }
    },
    settings: {
      handler(newSettings) {
        this.sortBy = newSettings.sortBy || 'sales'
        this.limit = newSettings.limit || 10
        this.updateChart()
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    if (!this.loading && this.hasData) {
      this.initChart()
    }
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
    }
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    // 初始化图表
    initChart() {
      if (!this.$refs.chartContainer) return
      
      if (this.chart) {
        this.chart.dispose()
      }
      
      this.chart = echarts.init(this.$refs.chartContainer)
      this.updateChart()
    },

    // 更新图表
    updateChart() {
      if (!this.chart || !this.hasData) return
      
      const option = this.getChartOption()
      this.chart.setOption(option, true)
    },

    // 获取图表配置
    getChartOption() {
      const products = this.sortedData.map(item => item.productName)
      const values = this.sortedData.map(item => item[this.sortBy])
      
      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f', '#bb8fce', '#85c1e9']
      
      return {
        title: {
          show: false
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: (params) => {
            const param = params[0]
            const unit = this.sortBy === 'sales' ? '元' : this.sortBy === 'quantity' ? '件' : '元'
            const value = this.sortBy === 'sales' || this.sortBy === 'profit'
              ? '¥' + param.value.toLocaleString()
              : param.value.toLocaleString() + '件'
            
            return `
              <div style="margin-bottom: 5px;">${param.name}</div>
              <div style="display: flex; align-items: center;">
                <span style="display: inline-block; width: 10px; height: 10px; background-color: ${param.color}; border-radius: 50%; margin-right: 5px;"></span>
                <span style="flex: 1;">${this.getSortLabel()}:</span>
                <span style="font-weight: bold;">${value}</span>
              </div>
            `
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          axisLabel: {
            formatter: (value) => {
              if (this.sortBy === 'sales' || this.sortBy === 'profit') {
                return value >= 10000 ? (value / 10000).toFixed(1) + 'w' : value
              }
              return value
            },
            color: '#606266'
          },
          axisLine: {
            lineStyle: {
              color: '#e0e6ed'
            }
          },
          splitLine: {
            lineStyle: {
              color: '#f0f2f5'
            }
          }
        },
        yAxis: {
          type: 'category',
          data: products,
          axisLabel: {
            color: '#606266',
            formatter: (value) => {
              return value.length > 8 ? value.substring(0, 8) + '...' : value
            }
          },
          axisLine: {
            lineStyle: {
              color: '#e0e6ed'
            }
          }
        },
        series: [
          {
            name: this.getSortLabel(),
            type: 'bar',
            data: values.map((value, index) => ({
              value: value,
              itemStyle: {
                color: colors[index % colors.length]
              }
            })),
            barWidth: '60%',
            label: {
              show: true,
              position: 'right',
              formatter: (params) => {
                if (this.sortBy === 'sales' || this.sortBy === 'profit') {
                  return params.value >= 10000 
                    ? (params.value / 10000).toFixed(1) + 'w'
                    : params.value.toLocaleString()
                }
                return params.value.toLocaleString()
              },
              color: '#606266',
              fontSize: 12
            }
          }
        ],
        animation: true,
        animationDuration: 1000
      }
    },

    // 获取排序标签
    getSortLabel() {
      const labels = {
        sales: '销售额',
        quantity: '销售数量',
        profit: '利润额'
      }
      return labels[this.sortBy] || '销售额'
    },

    // 排序方式变化
    onSortChange() {
      this.updateChart()
      this.emitSettingsChange()
    },

    // 数量限制变化
    onLimitChange() {
      this.updateChart()
      this.emitSettingsChange()
    },

    // 发送设置变化事件
    emitSettingsChange() {
      this.$emit('settings-change', 'productRanking', {
        sortBy: this.sortBy,
        limit: this.limit
      })
    },

    // 处理窗口大小变化
    handleResize() {
      if (this.chart) {
        this.chart.resize()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.product-ranking-chart {
  height: 100%;
  display: flex;
  flex-direction: column;

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #e4e7ed;

    .chart-title {
      h3 {
        margin: 0 0 5px 0;
        font-size: 18px;
        color: #303133;
        font-weight: 600;
      }

      .chart-subtitle {
        margin: 0;
        font-size: 14px;
        color: #909399;
      }
    }

    .chart-controls {
      display: flex;
      align-items: center;
    }
  }

  .chart-content {
    flex: 1;
    min-height: 300px;
    position: relative;

    .chart-wrapper {
      width: 100%;
      height: 100%;
    }

    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-height: 300px;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .product-ranking-chart {
    .chart-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;

      .chart-controls {
        align-self: stretch;
        justify-content: space-between;

        .el-select {
          flex: 1;
          max-width: 45%;
        }
      }
    }

    .chart-content {
      min-height: 250px;
    }
  }
}
</style>