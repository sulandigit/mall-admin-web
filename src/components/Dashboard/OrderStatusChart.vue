<template>
  <div ref="chart" class="order-status-chart"></div>
</template>

<script>
import * as echarts from 'echarts'
import { getOrderStatusDistribution, getMockOrderStatus } from '@/api/dashboard'

export default {
  name: 'OrderStatusChart',
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
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: 'rgba(0, 212, 255, 0.5)',
          textStyle: {
            color: '#ffffff'
          },
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          top: 'middle',
          textStyle: {
            color: '#8892b0'
          },
          itemGap: 15
        },
        series: [
          {
            name: '订单状态',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['65%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 8,
              borderColor: 'rgba(0, 0, 0, 0.2)',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '16',
                fontWeight: 'bold',
                color: '#ffffff'
              },
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            labelLine: {
              show: false
            },
            data: []
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
          response = await getOrderStatusDistribution()
        } catch (error) {
          console.warn('使用模拟数据:', error.message)
          response = await getMockOrderStatus()
        }
        
        if (response.data && response.data.data) {
          this.chartData = response.data.data
          this.updateChart()
        }
      } catch (error) {
        console.error('加载订单状态数据失败:', error)
        this.$message.error('加载订单状态数据失败')
      }
    },
    updateChart() {
      if (!this.chart || !this.chartData.length) return
      
      // 为每个数据项设置颜色
      const data = this.chartData.map(item => ({
        ...item,
        itemStyle: {
          color: item.color || this.getRandomColor()
        }
      }))
      
      this.chart.setOption({
        series: [
          {
            data: data
          }
        ]
      })
    },
    getRandomColor() {
      const colors = [
        '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
        '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'
      ]
      return colors[Math.floor(Math.random() * colors.length)]
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
.order-status-chart {
  width: 100%;
  height: 100%;
}
</style>