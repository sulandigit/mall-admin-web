<template>
  <div :style="{ width: width, height: height }" ref="chartContainer"></div>
</template>

<script>
import echarts from '@/echarts-config'

export default {
  name: 'LineChart',
  props: {
    data: {
      type: Object,
      required: true,
      default: () => ({
        columns: [],
        rows: []
      })
    },
    loading: {
      type: Boolean,
      default: false
    },
    dataEmpty: {
      type: Boolean,
      default: false
    },
    settings: {
      type: Object,
      default: () => ({})
    },
    legendVisible: {
      type: Boolean,
      default: true
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '400px'
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    data: {
      handler() {
        this.updateChart()
      },
      deep: true
    },
    loading(val) {
      if (this.chart) {
        if (val) {
          this.chart.showLoading()
        } else {
          this.chart.hideLoading()
        }
      }
    }
  },
  mounted() {
    this.initChart()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
    }
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$refs.chartContainer)
      this.updateChart()
      
      if (this.loading) {
        this.chart.showLoading()
      }
    },
    updateChart() {
      if (!this.chart || this.dataEmpty || !this.data.rows || this.data.rows.length === 0) {
        return
      }

      // 转换数据格式
      const option = this.convertDataToOption()
      this.chart.setOption(option, true)
    },
    convertDataToOption() {
      const { columns, rows } = this.data
      const { labelMap = {}, xAxisType = 'category', axisSite = {}, area = false } = this.settings
      
      // 获取x轴数据
      const xAxisData = rows.map(row => row[columns[0]])
      
      // 构建series数据
      const series = []
      for (let i = 1; i < columns.length; i++) {
        const column = columns[i]
        const seriesData = rows.map(row => row[column])
        
        series.push({
          name: labelMap[column] || column,
          type: 'line',
          data: seriesData,
          smooth: true,
          areaStyle: area ? {} : null,
          yAxisIndex: axisSite.right && axisSite.right.includes(column) ? 1 : 0
        })
      }

      // 构建y轴配置
      const yAxis = [
        {
          type: 'value',
          name: '',
          position: 'left'
        }
      ]
      
      // 如果有右轴配置，添加右轴
      if (axisSite.right && axisSite.right.length > 0) {
        yAxis.push({
          type: 'value',
          name: '',
          position: 'right'
        })
      }

      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
          show: this.legendVisible,
          data: series.map(s => s.name)
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: xAxisType === 'time' ? 'time' : 'category',
          boundaryGap: false,
          data: xAxisType === 'time' ? undefined : xAxisData
        },
        yAxis: yAxis,
        series: series
      }
    },
    handleResize() {
      if (this.chart) {
        this.chart.resize()
      }
    }
  }
}
</script>

<style scoped>
/* 组件样式 */
</style>