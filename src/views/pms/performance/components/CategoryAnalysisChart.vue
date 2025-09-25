<template>
  <div class="category-analysis-chart">
    <div class="chart-header">
      <div class="chart-title">
        <h3>分类分析</h3>
        <p class="chart-subtitle">商品分类销售分布情况</p>
      </div>
      <div class="chart-controls">
        <el-button-group>
          <el-button 
            size="small"
            :type="chartType === 'pie' ? 'primary' : ''"
            @click="changeChartType('pie')">
            饼图
          </el-button>
          <el-button 
            size="small"
            :type="chartType === 'doughnut' ? 'primary' : ''"
            @click="changeChartType('doughnut')">
            环形图
          </el-button>
        </el-button-group>
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
  name: 'CategoryAnalysisChart',
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
      default: () => ({})
    }
  },
  data() {
    return {
      chart: null,
      chartType: 'pie'
    }
  },
  computed: {
    hasData() {
      return this.data && this.data.length > 0
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
      const total = this.data.reduce((sum, item) => sum + item.sales, 0)
      
      return {
        title: {
          show: false
        },
        tooltip: {
          trigger: 'item',
          formatter: (params) => {
            const percent = ((params.value / total) * 100).toFixed(2)
            return `
              <div style="margin-bottom: 5px;">${params.name}</div>
              <div style="display: flex; align-items: center; margin-bottom: 2px;">
                <span style="display: inline-block; width: 10px; height: 10px; background-color: ${params.color}; border-radius: 50%; margin-right: 5px;"></span>
                <span style="flex: 1;">销售额:</span>
                <span style="font-weight: bold;">¥${params.value.toLocaleString()}</span>
              </div>
              <div style="display: flex; align-items: center;">
                <span style="margin-left: 15px; flex: 1;">占比:</span>
                <span style="font-weight: bold;">${percent}%</span>
              </div>
            `
          }
        },
        legend: {
          orient: 'horizontal',
          bottom: 10,
          data: this.data.map(item => item.categoryName),
          textStyle: {
            fontSize: 12
          }
        },
        series: [
          {
            name: '分类销售',
            type: 'pie',
            radius: this.chartType === 'doughnut' ? ['40%', '70%'] : '70%',
            center: ['50%', '45%'],
            data: this.data.map((item, index) => ({
              value: item.sales,
              name: item.categoryName,
              itemStyle: {
                color: this.getColor(index)
              }
            })),
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
                const percent = ((params.value / total) * 100).toFixed(1)
                return `${params.name}\n${percent}%`
              },
              fontSize: 11
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

    // 获取颜色
    getColor(index) {
      const colors = [
        '#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399',
        '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'
      ]
      return colors[index % colors.length]
    },

    // 切换图表类型
    changeChartType(type) {
      this.chartType = type
      this.updateChart()
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
.category-analysis-chart {
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
  .category-analysis-chart {
    .chart-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;

      .chart-controls {
        align-self: stretch;

        .el-button-group {
          width: 100%;
          display: flex;

          .el-button {
            flex: 1;
          }
        }
      }
    }

    .chart-content {
      min-height: 250px;
    }
  }
}
</style>