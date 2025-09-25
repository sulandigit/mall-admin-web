<template>
  <div ref="chart" class="sales-trend-chart"></div>
</template>

<script>
import * as echarts from 'echarts'
import { getSalesTrend, getMockSalesTrend } from '@/api/dashboard'

export default {
  name: 'SalesTrendChart',
  props: {
    period: {
      type: String,
      default: 'day'
    }
  },
  data() {
    return {
      chart: null,
      chartData: []
    }
  },
  watch: {
    period: {
      handler: 'loadData',
      immediate: true
    }
  },
  mounted() {
    this.initChart()
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
    }
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$refs.chart)
      
      const option = {
        grid: {
          top: '10%',
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: 'rgba(0, 212, 255, 0.5)',
          textStyle: {
            color: '#ffffff'
          },
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#00d4ff'
            }
          }
        },
        legend: {
          data: ['销售额', '订单数'],
          textStyle: {
            color: '#8892b0'
          },
          top: '0%'
        },
        xAxis: {
          type: 'category',
          data: [],
          axisPointer: {
            type: 'shadow'
          },
          axisLine: {
            lineStyle: {
              color: '#2c3e50'
            }
          },
          axisLabel: {
            color: '#8892b0'
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '销售额(元)',
            nameTextStyle: {
              color: '#8892b0'
            },
            axisLine: {
              lineStyle: {
                color: '#2c3e50'
              }
            },
            axisLabel: {
              color: '#8892b0',
              formatter: '{value}'
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            }
          },
          {
            type: 'value',
            name: '订单数',
            nameTextStyle: {
              color: '#8892b0'
            },
            axisLine: {
              lineStyle: {
                color: '#2c3e50'
              }
            },
            axisLabel: {
              color: '#8892b0',
              formatter: '{value}'
            }
          }
        ],
        series: [
          {
            name: '销售额',
            type: 'bar',
            yAxisIndex: 0,
            data: [],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#00d4ff' },
                { offset: 1, color: '#5b8cff' }
              ])
            },
            emphasis: {
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#00f5ff' },
                  { offset: 1, color: '#7ba7ff' }
                ])
              }
            }
          },
          {
            name: '订单数',
            type: 'line',
            yAxisIndex: 1,
            data: [],
            lineStyle: {
              color: '#67c23a',
              width: 3
            },
            itemStyle: {
              color: '#67c23a'
            },
            symbol: 'circle',
            symbolSize: 6,
            smooth: true
          }
        ]
      }
      
      this.chart.setOption(option)
      
      // 响应式
      window.addEventListener('resize', () => {
        if (this.chart) {
          this.chart.resize()
        }
      })
    },
    async loadData() {
      try {
        // 尝试加载真实数据，失败则使用模拟数据
        let response
        try {
          response = await getSalesTrend(this.period)
        } catch (error) {
          console.warn('使用模拟数据:', error.message)
          response = await getMockSalesTrend(this.period)
        }
        
        if (response.data && response.data.data) {
          this.chartData = response.data.data
          this.updateChart()
        }
      } catch (error) {
        console.error('加载销售趋势数据失败:', error)
        this.$message.error('加载销售趋势数据失败')
      }
    },
    updateChart() {
      if (!this.chart || !this.chartData.length) return
      
      const times = this.chartData.map(item => item.time)
      const sales = this.chartData.map(item => item.sales)
      const orders = this.chartData.map(item => item.orders)
      
      this.chart.setOption({
        xAxis: {
          data: times
        },
        series: [
          {
            data: sales
          },
          {
            data: orders
          }
        ]
      })
    },
    resize() {
      if (this.chart) {
        this.chart.resize()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.sales-trend-chart {
  width: 100%;
  height: 100%;
}
</style>