<template>
  <div class="inventory-status-chart">
    <div class="chart-header">
      <div class="chart-title">
        <h3>库存状态监控</h3>
        <p class="chart-subtitle">库存分布与预警情况</p>
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
  name: 'InventoryStatusChart',
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    },
    settings: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      chart: null
    }
  },
  computed: {
    hasData() {
      return this.data && this.data.summary
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
      const summary = this.data.summary
      
      return {
        title: {
          show: false
        },
        tooltip: {
          trigger: 'item',
          formatter: (params) => {
            return `
              <div style="margin-bottom: 5px;">${params.name}</div>
              <div style="display: flex; align-items: center;">
                <span style="display: inline-block; width: 10px; height: 10px; background-color: ${params.color}; border-radius: 50%; margin-right: 5px;"></span>
                <span style="flex: 1;">商品数量:</span>
                <span style="font-weight: bold;">${params.value.toLocaleString()}个</span>
              </div>
            `
          }
        },
        legend: {
          orient: 'horizontal',
          bottom: 10,
          data: ['正常库存', '库存预警', '库存不足', '滞销商品'],
          textStyle: {
            fontSize: 12
          }
        },
        series: [
          {
            name: '库存状态',
            type: 'pie',
            radius: ['30%', '70%'],
            center: ['50%', '45%'],
            data: [
              {
                value: summary.normalStock || 0,
                name: '正常库存',
                itemStyle: {
                  color: '#67c23a'
                }
              },
              {
                value: summary.lowStock || 0,
                name: '库存预警',
                itemStyle: {
                  color: '#e6a23c'
                }
              },
              {
                value: summary.outOfStock || 0,
                name: '库存不足',
                itemStyle: {
                  color: '#f56c6c'
                }
              },
              {
                value: summary.overStock || 0,
                name: '滞销商品',
                itemStyle: {
                  color: '#909399'
                }
              }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              show: true,
              formatter: (params) => {
                const total = summary.normalStock + summary.lowStock + summary.outOfStock + summary.overStock
                const percent = total > 0 ? ((params.value / total) * 100).toFixed(1) : 0
                return `${params.name}\n${params.value}个\n(${percent}%)`
              },
              fontSize: 10
            },
            labelLine: {
              show: true
            }
          }
        ],
        animation: true,
        animationType: 'scale',
        animationEasing: 'elasticOut'
      }
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
.inventory-status-chart {
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
  .inventory-status-chart {
    .chart-content {
      min-height: 250px;
    }
  }
}
</style>