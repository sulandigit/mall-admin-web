<template>
  <div class="sales-trend-chart">
    <div class="chart-header">
      <div class="chart-title">
        <h3>销售趋势分析</h3>
        <p class="chart-subtitle">展示销售额和销售数量的时间趋势</p>
      </div>
      <div class="chart-controls">
        <el-button-group>
          <el-button 
            size="small"
            :type="chartType === 'line' ? 'primary' : ''"
            @click="changeChartType('line')">
            折线图
          </el-button>
          <el-button 
            size="small"
            :type="chartType === 'bar' ? 'primary' : ''"
            @click="changeChartType('bar')">
            柱状图
          </el-button>
          <el-button 
            size="small"
            :type="chartType === 'area' ? 'primary' : ''"
            @click="changeChartType('area')">
            面积图
          </el-button>
        </el-button-group>
        
        <el-button 
          size="small"
          icon="el-icon-setting"
          @click="showSettings = true">
          设置
        </el-button>
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

    <!-- 图表设置对话框 -->
    <el-dialog
      title="图表设置"
      :visible.sync="showSettings"
      width="400px">
      <el-form label-width="100px">
        <el-form-item label="显示数据缩放">
          <el-switch v-model="localSettings.showDataZoom"></el-switch>
        </el-form-item>
        <el-form-item label="显示网格线">
          <el-switch v-model="localSettings.showGrid"></el-switch>
        </el-form-item>
        <el-form-item label="平滑曲线">
          <el-switch v-model="localSettings.smooth"></el-switch>
        </el-form-item>
        <el-form-item label="显示数据标签">
          <el-switch v-model="localSettings.showLabel"></el-switch>
        </el-form-item>
        <el-form-item label="动画效果">
          <el-switch v-model="localSettings.animation"></el-switch>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="showSettings = false">取消</el-button>
        <el-button type="primary" @click="applySettings">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'SalesTrendChart',
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
        showDataZoom: true,
        showGrid: true,
        smooth: false,
        showLabel: false,
        animation: true
      })
    }
  },
  data() {
    return {
      chart: null,
      chartType: 'line',
      showSettings: false,
      localSettings: {
        showDataZoom: true,
        showGrid: true,
        smooth: false,
        showLabel: false,
        animation: true
      }
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
    },
    settings: {
      handler(newSettings) {
        this.localSettings = { ...this.localSettings, ...newSettings }
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
    
    // 监听窗口大小变化
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
      const dates = this.data.map(item => item.date)
      const sales = this.data.map(item => item.sales)
      const quantities = this.data.map(item => item.quantity)
      
      return {
        title: {
          show: false
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999'
            }
          },
          formatter: (params) => {
            let result = `<div style="margin-bottom: 5px;">${params[0].axisValue}</div>`
            params.forEach(param => {
              const unit = param.seriesName === '销售额' ? '元' : '件'
              const value = param.seriesName === '销售额' 
                ? (param.value / 10000).toFixed(2) + '万元'
                : param.value.toLocaleString() + '件'
              result += `
                <div style="display: flex; align-items: center; margin-bottom: 2px;">
                  <span style="display: inline-block; width: 10px; height: 10px; background-color: ${param.color}; border-radius: 50%; margin-right: 5px;"></span>
                  <span style="flex: 1;">${param.seriesName}:</span>
                  <span style="font-weight: bold;">${value}</span>
                </div>
              `
            })
            return result
          }
        },
        legend: {
          data: ['销售额', '销售数量'],
          top: 10,
          right: 20
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: this.localSettings.showDataZoom ? '15%' : '3%',
          containLabel: true,
          show: this.localSettings.showGrid,
          borderColor: '#e0e6ed'
        },
        xAxis: [
          {
            type: 'category',
            data: dates,
            axisPointer: {
              type: 'shadow'
            },
            axisLine: {
              lineStyle: {
                color: '#e0e6ed'
              }
            },
            axisLabel: {
              color: '#606266'
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '销售额(万元)',
            position: 'left',
            axisLabel: {
              formatter: '{value}万',
              color: '#606266'
            },
            axisLine: {
              lineStyle: {
                color: '#409eff'
              }
            },
            splitLine: {
              show: this.localSettings.showGrid,
              lineStyle: {
                color: '#f0f2f5'
              }
            }
          },
          {
            type: 'value',
            name: '销售数量(件)',
            position: 'right',
            axisLabel: {
              formatter: '{value}件',
              color: '#606266'
            },
            axisLine: {
              lineStyle: {
                color: '#67c23a'
              }
            },
            splitLine: {
              show: false
            }
          }
        ],
        dataZoom: this.localSettings.showDataZoom ? [
          {
            type: 'slider',
            show: true,
            start: 0,
            end: 100,
            handleStyle: {
              color: '#409eff'
            }
          }
        ] : [],
        series: [
          {
            name: '销售额',
            type: this.chartType,
            yAxisIndex: 0,
            data: sales.map(val => (val / 10000).toFixed(2)),
            itemStyle: {
              color: '#409eff'
            },
            lineStyle: {
              width: 3
            },
            areaStyle: this.chartType === 'area' ? {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
                { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
              ])
            } : null,
            smooth: this.localSettings.smooth,
            label: {
              show: this.localSettings.showLabel,
              position: 'top',
              formatter: '{c}万'
            }
          },
          {
            name: '销售数量',
            type: this.chartType,
            yAxisIndex: 1,
            data: quantities,
            itemStyle: {
              color: '#67c23a'
            },
            lineStyle: {
              width: 3
            },
            areaStyle: this.chartType === 'area' ? {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
                { offset: 1, color: 'rgba(103, 194, 58, 0.1)' }
              ])
            } : null,
            smooth: this.localSettings.smooth,
            label: {
              show: this.localSettings.showLabel,
              position: 'top',
              formatter: '{c}件'
            }
          }
        ],
        animation: this.localSettings.animation
      }
    },

    // 切换图表类型
    changeChartType(type) {
      this.chartType = type
      this.updateChart()
    },

    // 应用设置
    applySettings() {
      this.showSettings = false
      this.updateChart()
      this.$emit('settings-change', this.localSettings)
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
.sales-trend-chart {
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
      gap: 10px;
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
  .sales-trend-chart {
    .chart-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;

      .chart-controls {
        align-self: stretch;
        justify-content: space-between;

        .el-button-group {
          flex: 1;
          display: flex;

          .el-button {
            flex: 1;
            font-size: 12px;
          }
        }
      }
    }

    .chart-content {
      min-height: 250px;
    }
  }
}

@media (max-width: 480px) {
  .sales-trend-chart {
    .chart-header {
      .chart-title {
        h3 {
          font-size: 16px;
        }

        .chart-subtitle {
          font-size: 12px;
        }
      }

      .chart-controls {
        .el-button-group {
          .el-button {
            font-size: 11px;
            padding: 5px 8px;
          }
        }
      }
    }

    .chart-content {
      min-height: 200px;
    }
  }
}
</style>