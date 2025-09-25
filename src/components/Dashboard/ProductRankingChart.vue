<template>
  <div ref="chart" class="product-ranking-chart"></div>
</template>

<script>
import * as echarts from 'echarts'
import { getProductRanking, getMockProductRanking } from '@/api/dashboard'

export default {
  name: 'ProductRankingChart',
  data() {
    return {
      chart: null,
      chartData: []
    }
  },
  mounted() {
    this.initChart()
    this.loadData()
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
          top: '5%',
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
            type: 'shadow'
          },
          formatter: function(params) {
            const data = params[0]
            return `${data.name}<br/>销量: ${data.value} 件<br/>营收: ¥${data.data.revenue.toLocaleString()}`
          }
        },
        xAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#2c3e50'
            }
          },
          axisLabel: {
            color: '#8892b0'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        yAxis: {
          type: 'category',
          data: [],
          axisLine: {
            lineStyle: {
              color: '#2c3e50'
            }
          },
          axisLabel: {
            color: '#8892b0',
            formatter: function(value) {
              return value.length > 12 ? value.substr(0, 12) + '...' : value
            }
          },
          axisTick: {
            show: false
          }
        },
        series: [
          {
            name: '销量',
            type: 'bar',
            data: [],
            itemStyle: {
              color: function(params) {
                const colors = [
                  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
                  '#ff9ff3', '#54a0ff', '#5f27cd', '#a55eea', '#26de81'
                ]
                return colors[params.dataIndex % colors.length]
              },
              borderRadius: [0, 4, 4, 0]
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              show: true,
              position: 'right',
              color: '#ffffff',
              fontSize: 12,
              formatter: '{c}'
            }
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
          response = await getProductRanking(10)
        } catch (error) {
          console.warn('使用模拟数据:', error.message)
          response = await getMockProductRanking()
        }
        
        if (response.data && response.data.data) {
          this.chartData = response.data.data
          this.updateChart()
        }
      } catch (error) {
        console.error('加载商品排行数据失败:', error)
        this.$message.error('加载商品排行数据失败')
      }
    },
    updateChart() {
      if (!this.chart || !this.chartData.length) return
      
      // 按销量降序排序
      const sortedData = [...this.chartData].sort((a, b) => b.sales - a.sales)
      
      const names = sortedData.map(item => item.name)
      const data = sortedData.map(item => ({
        value: item.sales,
        revenue: item.revenue
      }))
      
      this.chart.setOption({
        yAxis: {
          data: names
        },
        series: [
          {
            data: data
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
.product-ranking-chart {
  width: 100%;
  height: 100%;
}
</style>