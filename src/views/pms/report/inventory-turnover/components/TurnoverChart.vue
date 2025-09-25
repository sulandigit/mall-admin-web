<template>
  <el-card class="chart-container" shadow="never">
    <div slot="header" class="chart-header">
      <div class="header-left">
        <span class="chart-title">库存周转率趋势</span>
        <el-tooltip content="显示指定时间范围内的周转率变化趋势" placement="top">
          <i class="el-icon-question"></i>
        </el-tooltip>
      </div>
      <div class="header-right">
        <!-- 时间粒度选择 -->
        <el-radio-group v-model="granularity" size="small" @change="handleGranularityChange">
          <el-radio-button label="day">日</el-radio-button>
          <el-radio-button label="week">周</el-radio-button>
          <el-radio-button label="month">月</el-radio-button>
          <el-radio-button label="quarter">季</el-radio-button>
        </el-radio-group>
        
        <!-- 图表类型切换 -->
        <el-dropdown @command="handleChartTypeChange" style="margin-left: 10px">
          <el-button size="small">
            {{ currentChartTypeLabel }}<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="line">折线图</el-dropdown-item>
            <el-dropdown-item command="bar">柱状图</el-dropdown-item>
            <el-dropdown-item command="area">面积图</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        
        <!-- 刷新按钮 -->
        <el-button 
          type="text" 
          size="small" 
          @click="refreshChart"
          :loading="loading"
          style="margin-left: 10px">
          <i class="el-icon-refresh"></i>
        </el-button>
      </div>
    </div>
    
    <!-- 图表区域 -->
    <div class="chart-content" v-loading="loading">
      <div v-if="!hasData && !loading" class="no-data">
        <i class="el-icon-pie-chart"></i>
        <p>暂无数据</p>
      </div>
      <div v-else-if="!vchartsLoaded" class="loading-charts">
        <i class="el-icon-loading"></i>
        <p>加载图表组件中...</p>
      </div>
      <div v-else>
        <!-- 主图表 -->
        <ve-line
          v-if="chartType === 'line'"
          :data="chartData"
          :settings="lineSettings"
          :extend="chartExtend"
          height="400px"
          @click="handleChartClick">
        </ve-line>
        
        <ve-bar
          v-if="chartType === 'bar'"
          :data="chartData"
          :settings="barSettings"
          :extend="chartExtend"
          height="400px"
          @click="handleChartClick">
        </ve-bar>
        
        <ve-line
          v-if="chartType === 'area'"
          :data="chartData"
          :settings="areaSettings"
          :extend="chartExtend"
          height="400px"
          @click="handleChartClick">
        </ve-line>
        
        <!-- 数据点详情提示 -->
        <div v-if="showDataTip" class="data-tip" :style="dataTipStyle">
          <div class="tip-content">
            <div class="tip-title">{{ dataTipContent.title }}</div>
            <div class="tip-item" v-for="item in dataTipContent.data" :key="item.name">
              <span class="tip-color" :style="{ backgroundColor: item.color }"></span>
              <span class="tip-name">{{ item.name }}:</span>
              <span class="tip-value">{{ item.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 图表说明 -->
    <div class="chart-footer">
      <div class="legend-custom">
        <div class="legend-item">
          <span class="legend-color primary"></span>
          <span>平均周转率</span>
        </div>
        <div class="legend-item">
          <span class="legend-color success"></span>
          <span>快速周转率基线 (4.0次)</span>
        </div>
        <div class="legend-item">
          <span class="legend-color warning"></span>
          <span>正常周转率基线 (2.0次)</span>
        </div>
      </div>
      
      <div class="chart-actions">
        <el-button type="text" size="small" @click="exportChart">
          <i class="el-icon-download"></i> 导出图表
        </el-button>
        <el-button type="text" size="small" @click="viewFullScreen">
          <i class="el-icon-full-screen"></i> 全屏查看
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'TurnoverChart',
  props: {
    chartData: {
      type: Object,
      default: () => ({
        columns: [],
        rows: []
      })
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      granularity: 'month',
      chartType: 'line',
      showDataTip: false,
      dataTipContent: {
        title: '',
        data: []
      },
      dataTipStyle: {
        left: '0px',
        top: '0px'
      },
      vchartsLoaded: false
    }
  },
  async created() {
    // 异步加载VCharts
    try {
      await this.$loadVCharts()
      this.vchartsLoaded = true
    } catch (error) {
      console.error('加载VCharts失败:', error)
    }
  },
  computed: {
    /**
     * 是否有数据
     */
    hasData() {
      return this.chartData.rows && this.chartData.rows.length > 0
    },
    
    /**
     * 当前图表类型标签
     */
    currentChartTypeLabel() {
      const typeMap = {
        line: '折线图',
        bar: '柱状图',
        area: '面积图'
      }
      return typeMap[this.chartType] || '折线图'
    },
    
    /**
     * 折线图配置
     */
    lineSettings() {
      return {
        yAxisType: ['normal', 'normal'],
        yAxisName: ['周转率(次)', ''],
        metrics: ['averageTurnoverRate'],
        dimension: ['period']
      }
    },
    
    /**
     * 柱状图配置
     */
    barSettings() {
      return {
        yAxisType: ['normal'],
        yAxisName: ['周转率(次)'],
        metrics: ['averageTurnoverRate'],
        dimension: ['period']
      }
    },
    
    /**
     * 面积图配置
     */
    areaSettings() {
      return {
        ...this.lineSettings,
        area: true
      }
    },
    
    /**
     * 图表扩展配置
     */
    chartExtend() {
      return {
        color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C'],
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          top: '15%',
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999'
            }
          },
          formatter: this.formatTooltip
        },
        toolbox: {
          feature: {
            dataZoom: {
              show: true,
              title: {
                zoom: '区域缩放',
                back: '区域缩放还原'
              }
            },
            dataView: {
              show: true,
              title: '数据视图',
              readOnly: false
            },
            magicType: {
              show: true,
              title: {
                line: '切换为折线图',
                bar: '切换为柱状图'
              },
              type: ['line', 'bar']
            },
            restore: {
              show: true,
              title: '还原'
            },
            saveAsImage: {
              show: true,
              title: '保存为图片'
            }
          }
        },
        dataZoom: [
          {
            show: true,
            realtime: true,
            start: 0,
            end: 100
          },
          {
            type: 'inside',
            realtime: true,
            start: 0,
            end: 100
          }
        ],
        markLine: {
          data: [
            { yAxis: 4.0, name: '快速周转基线', lineStyle: { color: '#67C23A', type: 'dashed' } },
            { yAxis: 2.0, name: '正常周转基线', lineStyle: { color: '#E6A23C', type: 'dashed' } }
          ]
        }
      }
    }
  },
  methods: {
    /**
     * 时间粒度变化处理
     */
    handleGranularityChange(value) {
      this.$emit('granularity-change', value)
    },
    
    /**
     * 图表类型变化处理
     */
    handleChartTypeChange(type) {
      this.chartType = type
    },
    
    /**
     * 刷新图表
     */
    refreshChart() {
      this.$emit('refresh')
    },
    
    /**
     * 图表点击事件
     */
    handleChartClick(params) {
      if (params && params.data) {
        this.$emit('chart-click', {
          period: params.data.period,
          value: params.data.averageTurnoverRate,
          granularity: this.granularity
        })
      }
    },
    
    /**
     * 格式化提示框内容
     */
    formatTooltip(params) {
      if (!params || params.length === 0) return ''
      
      const period = params[0].axisValue
      let content = `<div style="font-weight: bold; margin-bottom: 8px;">${period}</div>`
      
      params.forEach(param => {
        const value = parseFloat(param.value) || 0
        const color = param.color
        content += `
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <span style="display: inline-block; width: 10px; height: 10px; background-color: ${color}; margin-right: 8px; border-radius: 50%;"></span>
            <span style="margin-right: 8px;">${param.seriesName}:</span>
            <span style="font-weight: bold;">${value.toFixed(2)}次</span>
          </div>
        `
      })
      
      // 添加级别说明
      const avgValue = parseFloat(params[0].value) || 0
      let levelText = ''
      if (avgValue >= 4.0) {
        levelText = '<span style="color: #67C23A;">快速周转</span>'
      } else if (avgValue >= 2.0) {
        levelText = '<span style="color: #409EFF;">正常周转</span>'
      } else if (avgValue >= 1.0) {
        levelText = '<span style="color: #E6A23C;">缓慢周转</span>'
      } else {
        levelText = '<span style="color: #F56C6C;">滞销风险</span>'
      }
      
      content += `<div style="margin-top: 8px; font-size: 12px;">级别: ${levelText}</div>`
      
      return content
    },
    
    /**
     * 导出图表
     */
    exportChart() {
      this.$message.info('图表导出功能开发中...')
    },
    
    /**
     * 全屏查看
     */
    viewFullScreen() {
      this.$message.info('全屏查看功能开发中...')
    }
  }
}
</script>

<style lang="scss" scoped>
.chart-container {
  margin-bottom: 20px;
  
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .header-left {
      display: flex;
      align-items: center;
      
      .chart-title {
        font-size: 16px;
        font-weight: bold;
        color: #303133;
        margin-right: 8px;
      }
      
      .el-icon-question {
        color: #909399;
        cursor: help;
      }
    }
    
    .header-right {
      display: flex;
      align-items: center;
    }
  }
  
  .chart-content {
    min-height: 400px;
    position: relative;
    
    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 400px;
      color: #909399;
      
      i {
        font-size: 48px;
        margin-bottom: 16px;
      }
      
      p {
        font-size: 14px;
        margin: 0;
      }
    }
    
    .loading-charts {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 400px;
      color: #409EFF;
      
      i {
        font-size: 32px;
        margin-bottom: 16px;
        animation: rotate 2s linear infinite;
      }
      
      p {
        font-size: 14px;
        margin: 0;
      }
    }
    
    .data-tip {
      position: absolute;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      border-radius: 4px;
      font-size: 12px;
      pointer-events: none;
      z-index: 1000;
      
      .tip-content {
        .tip-title {
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .tip-item {
          display: flex;
          align-items: center;
          margin-bottom: 4px;
          
          .tip-color {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 6px;
          }
          
          .tip-name {
            margin-right: 4px;
          }
          
          .tip-value {
            font-weight: bold;
          }
        }
      }
    }
  }
  
  .chart-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #EBEEF5;
    
    .legend-custom {
      display: flex;
      align-items: center;
      
      .legend-item {
        display: flex;
        align-items: center;
        margin-right: 20px;
        font-size: 12px;
        color: #606266;
        
        .legend-color {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 2px;
          margin-right: 6px;
          
          &.primary {
            background-color: #409EFF;
          }
          
          &.success {
            background-color: #67C23A;
          }
          
          &.warning {
            background-color: #E6A23C;
          }
        }
      }
    }
    
    .chart-actions {
      .el-button {
        padding: 0;
        margin-left: 16px;
        
        i {
          margin-right: 4px;
        }
      }
    }
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>