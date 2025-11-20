<template>
  <div ref="chart" class="user-location-chart"></div>
</template>

<script>
import * as echarts from 'echarts'
import { getUserLocationDistribution, getMockUserLocation } from '@/api/dashboard'

export default {
  name: 'UserLocationChart',
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
          formatter: '{b}: {c} 人'
        },
        visualMap: {
          min: 0,
          max: 3000,
          left: 'left',
          top: 'bottom',
          text: ['高', '低'],
          textStyle: {
            color: '#8892b0'
          },
          inRange: {
            color: ['#313695', '#4575b4', '#74add1', '#abd9e9', 
                    '#e0f3f8', '#ffffcc', '#fed976', '#feb24c', 
                    '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026']
          },
          calculable: true
        },
        geo: {
          map: 'china',
          roam: false,
          scaleLimit: {
            min: 1,
            max: 2
          },
          zoom: 1.2,
          top: 80,
          label: {
            show: true,
            fontSize: '10',
            color: 'rgba(255,255,255,.6)'
          },
          itemStyle: {
            borderColor: 'rgba(0, 212, 255, 0.2)',
            borderWidth: 1,
            areaColor: 'rgba(255, 255, 255, 0.05)'
          },
          emphasis: {
            itemStyle: {
              areaColor: 'rgba(0, 212, 255, 0.2)',
              shadowOffsetX: 0,
              shadowOffsetY: 0,
              shadowBlur: 20,
              borderWidth: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        },
        series: [
          {
            name: '用户分布',
            type: 'map',
            geoIndex: 0,
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
        // 注册中国地图（简化版）
        this.registerChinaMap()
        
        // 尝试加载真实数据，失败则使用模拟数据
        let response
        try {
          response = await getUserLocationDistribution()
        } catch (error) {
          console.warn('使用模拟数据:', error.message)
          response = await getMockUserLocation()
        }
        
        if (response.data && response.data.data) {
          this.chartData = response.data.data
          this.updateChart()
        }
      } catch (error) {
        console.error('加载用户地域数据失败:', error)
        this.$message.error('加载用户地域数据失败')
      }
    },
    updateChart() {
      if (!this.chart || !this.chartData.length) return
      
      const maxValue = Math.max(...this.chartData.map(item => item.value))
      
      this.chart.setOption({
        visualMap: {
          max: maxValue
        },
        series: [
          {
            data: this.chartData
          }
        ]
      })
    },
    registerChinaMap() {
      // 简化版中国地图数据（仅包含主要省份的基本边界）
      const chinaGeoJSON = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { name: '北京' },
            geometry: {
              type: 'Polygon',
              coordinates: [[[116.3, 39.9], [116.5, 39.9], [116.5, 40.1], [116.3, 40.1], [116.3, 39.9]]]
            }
          },
          {
            type: 'Feature',
            properties: { name: '上海' },
            geometry: {
              type: 'Polygon',
              coordinates: [[[121.4, 31.2], [121.6, 31.2], [121.6, 31.4], [121.4, 31.4], [121.4, 31.2]]]
            }
          },
          {
            type: 'Feature',
            properties: { name: '广东' },
            geometry: {
              type: 'Polygon',
              coordinates: [[[113, 23], [115, 23], [115, 25], [113, 25], [113, 23]]]
            }
          },
          {
            type: 'Feature',
            properties: { name: '浙江' },
            geometry: {
              type: 'Polygon',
              coordinates: [[[119, 29], [121, 29], [121, 31], [119, 31], [119, 29]]]
            }
          },
          {
            type: 'Feature',
            properties: { name: '江苏' },
            geometry: {
              type: 'Polygon',
              coordinates: [[[118, 32], [120, 32], [120, 34], [118, 34], [118, 32]]]
            }
          },
          {
            type: 'Feature',
            properties: { name: '山东' },
            geometry: {
              type: 'Polygon',
              coordinates: [[[116, 36], [118, 36], [118, 38], [116, 38], [116, 36]]]
            }
          },
          {
            type: 'Feature',
            properties: { name: '河南' },
            geometry: {
              type: 'Polygon',
              coordinates: [[[112, 34], [114, 34], [114, 36], [112, 36], [112, 34]]]
            }
          },
          {
            type: 'Feature',
            properties: { name: '四川' },
            geometry: {
              type: 'Polygon',
              coordinates: [[[102, 30], [104, 30], [104, 32], [102, 32], [102, 30]]]
            }
          },
          {
            type: 'Feature',
            properties: { name: '湖北' },
            geometry: {
              type: 'Polygon',
              coordinates: [[[110, 30], [112, 30], [112, 32], [110, 32], [110, 30]]]
            }
          },
          {
            type: 'Feature',
            properties: { name: '福建' },
            geometry: {
              type: 'Polygon',
              coordinates: [[[117, 25], [119, 25], [119, 27], [117, 27], [117, 25]]]
            }
          }
        ]
      }
      
      echarts.registerMap('china', chinaGeoJSON)
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
.user-location-chart {
  width: 100%;
  height: 100%;
}
</style>