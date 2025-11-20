<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="card-header">
        <span class="card-title">收入预测</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="refreshData">刷新数据</el-button>
      </div>

      <!-- 数据选择和参数设置 -->
      <el-row :gutter="20" class="control-panel">
        <el-col :span="8">
          <el-card shadow="hover">
            <div slot="header">
              <span>数据范围</span>
            </div>
            <el-form :model="queryForm" label-width="100px" size="small">
              <el-form-item label="时间范围:">
                <el-date-picker
                  v-model="queryForm.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="yyyy-MM-dd"
                  @change="handleDateChange">
                </el-date-picker>
              </el-form-item>
              <el-form-item label="数据周期:">
                <el-select v-model="queryForm.period" @change="handlePeriodChange">
                  <el-option label="按日" value="daily"></el-option>
                  <el-option label="按周" value="weekly"></el-option>
                  <el-option label="按月" value="monthly"></el-option>
                </el-select>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card shadow="hover">
            <div slot="header">
              <span>预测参数</span>
            </div>
            <el-form :model="forecastForm" label-width="100px" size="small">
              <el-form-item label="预测算法:">
                <el-select v-model="forecastForm.algorithm">
                  <el-option label="线性回归" value="linear"></el-option>
                  <el-option label="移动平均" value="moving_average"></el-option>
                  <el-option label="指数平滑" value="exponential_smoothing"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="预测周期:">
                <el-input-number 
                  v-model="forecastForm.forecastPeriods" 
                  :min="1" 
                  :max="30"
                  controls-position="right">
                </el-input-number>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="executeForecast" :loading="forecastLoading">
                  开始预测
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card shadow="hover">
            <div slot="header">
              <span>预测结果</span>
            </div>
            <div class="result-summary">
              <div class="result-item">
                <span class="label">预测总收入:</span>
                <span class="value" :class="{'positive': forecastSummary.totalRevenue > 0}">
                  {{ formatCurrency(forecastSummary.totalRevenue) }}
                </span>
              </div>
              <div class="result-item">
                <span class="label">环比增长:</span>
                <span class="value" :class="{'positive': forecastSummary.growthRate > 0, 'negative': forecastSummary.growthRate < 0}">
                  {{ forecastSummary.growthRate.toFixed(2) }}%
                </span>
              </div>
              <div class="result-item">
                <span class="label">置信度:</span>
                <span class="value">{{ (forecastSummary.confidence * 100).toFixed(1) }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 图表展示区域 -->
      <el-row class="chart-container">
        <el-col :span="24">
          <el-card shadow="hover">
            <div slot="header">
              <span>收入趋势与预测对比</span>
              <el-button-group style="float: right;">
                <el-button size="mini" :type="chartType === 'line' ? 'primary' : ''" @click="chartType = 'line'">线图</el-button>
                <el-button size="mini" :type="chartType === 'bar' ? 'primary' : ''" @click="chartType = 'bar'">柱图</el-button>
              </el-button-group>
            </div>
            <div class="chart-wrapper">
              <ve-line
                v-if="chartType === 'line'"
                :data="chartData"
                :settings="lineChartSettings"
                :loading="chartLoading"
                :data-empty="chartDataEmpty"
                height="400px">
              </ve-line>
              <ve-bar
                v-else
                :data="chartData"
                :settings="barChartSettings"
                :loading="chartLoading"
                :data-empty="chartDataEmpty"
                height="400px">
              </ve-bar>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 历史数据表格 -->
      <el-row class="table-container">
        <el-col :span="24">
          <el-card shadow="hover">
            <div slot="header">
              <span>历史收入数据</span>
              <el-button style="float: right;" size="mini" @click="exportData">导出数据</el-button>
            </div>
            <el-table
              :data="historicalData"
              border
              stripe
              v-loading="tableLoading"
              style="width: 100%">
              <el-table-column
                prop="date"
                label="日期"
                width="120"
                align="center">
              </el-table-column>
              <el-table-column
                prop="revenue"
                label="实际收入"
                width="150"
                align="right">
                <template slot-scope="scope">
                  {{ formatCurrency(scope.row.revenue) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="predictedRevenue"
                label="预测收入"
                width="150"
                align="right">
                <template slot-scope="scope">
                  <span v-if="scope.row.predictedRevenue" class="predicted-value">
                    {{ formatCurrency(scope.row.predictedRevenue) }}
                  </span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column
                prop="accuracy"
                label="预测精度"
                width="120"
                align="center">
                <template slot-scope="scope">
                  <el-tag 
                    v-if="scope.row.accuracy !== undefined"
                    :type="getAccuracyTagType(scope.row.accuracy)">
                    {{ (scope.row.accuracy * 100).toFixed(1) }}%
                  </el-tag>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column
                label="趋势分析"
                align="center">
                <template slot-scope="scope">
                  <el-tag 
                    v-if="scope.row.trend"
                    :type="getTrendTagType(scope.row.trend)">
                    {{ getTrendText(scope.row.trend) }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
            
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="pagination.currentPage"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="pagination.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="pagination.total"
              style="margin-top: 20px; text-align: right;">
            </el-pagination>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import {
  getHistoricalRevenue,
  executeForecast as executeRevenueforecast,
  getForecastConfig,
  saveForecastResult,
  getRevenueTrendAnalysis
} from '@/api/revenueForecast'

export default {
  name: 'RevenueForecast',
  data() {
    return {
      // 查询表单
      queryForm: {
        dateRange: [],
        period: 'daily'
      },
      
      // 预测表单
      forecastForm: {
        algorithm: 'linear',
        forecastPeriods: 7
      },

      // 预测结果摘要
      forecastSummary: {
        totalRevenue: 0,
        growthRate: 0,
        confidence: 0
      },

      // 图表相关
      chartType: 'line',
      chartData: {
        columns: ['date', 'actualRevenue', 'predictedRevenue'],
        rows: []
      },
      chartLoading: false,
      chartDataEmpty: false,

      // 图表设置
      lineChartSettings: {
        xAxisType: 'category',
        area: true,
        labelMap: {
          'actualRevenue': '实际收入',
          'predictedRevenue': '预测收入'
        },
        color: ['#409EFF', '#67C23A']
      },
      barChartSettings: {
        labelMap: {
          'actualRevenue': '实际收入',
          'predictedRevenue': '预测收入'
        },
        color: ['#409EFF', '#67C23A']
      },

      // 表格数据
      historicalData: [],
      tableLoading: false,
      forecastLoading: false,

      // 分页
      pagination: {
        currentPage: 1,
        pageSize: 20,
        total: 0
      }
    }
  },

  async created() {
    await this.initData()
    await this.loadHistoricalData()
  },

  methods: {
    // 初始化数据
    async initData() {
      // 设置默认日期范围（最近30天）
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 30)
      
      this.queryForm.dateRange = [
        this.formatDate(start),
        this.formatDate(end)
      ]

      // 加载v-charts组件
      try {
        await this.$loadVCharts()
      } catch (error) {
        console.error('Failed to load v-charts:', error)
      }
    },

    // 加载历史数据
    async loadHistoricalData() {
      this.tableLoading = true
      this.chartLoading = true

      try {
        const params = {
          startDate: this.queryForm.dateRange[0],
          endDate: this.queryForm.dateRange[1],
          period: this.queryForm.period
        }

        const response = await getHistoricalRevenue(params)
        
        // 模拟数据（实际项目中从API获取）
        this.historicalData = this.generateMockData()
        this.updateChartData()
        
        this.pagination.total = this.historicalData.length

      } catch (error) {
        this.$message.error('加载历史数据失败：' + error.message)
      } finally {
        this.tableLoading = false
        this.chartLoading = false
      }
    },

    // 生成模拟数据（用于演示）
    generateMockData() {
      const data = []
      const startDate = new Date(this.queryForm.dateRange[0])
      const endDate = new Date(this.queryForm.dateRange[1])
      
      let currentDate = new Date(startDate)
      let baseRevenue = 10000

      while (currentDate <= endDate) {
        const dayVariation = (Math.random() - 0.5) * 2000
        const trendFactor = Math.sin((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) * 0.1) * 1000
        const revenue = Math.max(0, baseRevenue + dayVariation + trendFactor)

        data.push({
          date: this.formatDate(currentDate),
          revenue: Math.round(revenue),
          trend: this.calculateTrend(revenue, baseRevenue)
        })

        currentDate.setDate(currentDate.getDate() + 1)
        baseRevenue = revenue * 0.95 + baseRevenue * 0.05 // 平滑基准
      }

      return data
    },

    // 执行预测
    async executeForecast() {
      if (this.historicalData.length === 0) {
        this.$message.warning('请先加载历史数据')
        return
      }

      this.forecastLoading = true

      try {
        const data = {
          algorithm: this.forecastForm.algorithm,
          forecastPeriods: this.forecastForm.forecastPeriods,
          period: this.queryForm.period,
          historicalData: this.historicalData
        }

        // 执行预测算法
        const predictions = this.runPredictionAlgorithm(data)
        
        // 更新预测结果
        this.updateForecastResults(predictions)
        
        this.$message.success('预测完成！')

      } catch (error) {
        this.$message.error('预测失败：' + error.message)
      } finally {
        this.forecastLoading = false
      }
    },

    // 运行预测算法
    runPredictionAlgorithm(data) {
      const { algorithm, forecastPeriods, historicalData } = data
      const revenues = historicalData.map(item => item.revenue)
      const predictions = []

      switch (algorithm) {
        case 'linear':
          return this.linearRegression(revenues, forecastPeriods)
        case 'moving_average':
          return this.movingAverage(revenues, forecastPeriods, 7)
        case 'exponential_smoothing':
          return this.exponentialSmoothing(revenues, forecastPeriods, 0.3)
        default:
          return this.movingAverage(revenues, forecastPeriods, 7)
      }
    },

    // 线性回归预测
    linearRegression(data, periods) {
      const n = data.length
      const x = Array.from({ length: n }, (_, i) => i)
      const y = data

      // 计算回归系数
      const sumX = x.reduce((a, b) => a + b, 0)
      const sumY = y.reduce((a, b) => a + b, 0)
      const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
      const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
      const intercept = (sumY - slope * sumX) / n

      // 生成预测值
      const predictions = []
      for (let i = 0; i < periods; i++) {
        const predictedValue = intercept + slope * (n + i)
        predictions.push(Math.max(0, Math.round(predictedValue)))
      }

      return predictions
    },

    // 移动平均预测
    movingAverage(data, periods, windowSize) {
      const predictions = []
      
      for (let i = 0; i < periods; i++) {
        const startIndex = Math.max(0, data.length - windowSize + i)
        const endIndex = data.length + i
        const window = data.slice(startIndex, Math.min(endIndex, data.length))
        
        if (i > 0) {
          window.push(...predictions.slice(Math.max(0, predictions.length - windowSize)))
        }
        
        const average = window.reduce((sum, val) => sum + val, 0) / window.length
        predictions.push(Math.round(average))
      }

      return predictions
    },

    // 指数平滑预测
    exponentialSmoothing(data, periods, alpha) {
      let smoothed = data[0]
      
      // 计算历史平滑值
      for (let i = 1; i < data.length; i++) {
        smoothed = alpha * data[i] + (1 - alpha) * smoothed
      }

      // 生成预测值
      const predictions = []
      for (let i = 0; i < periods; i++) {
        predictions.push(Math.round(smoothed))
      }

      return predictions
    },

    // 更新预测结果
    updateForecastResults(predictions) {
      // 计算预测总收入
      const totalPredicted = predictions.reduce((sum, val) => sum + val, 0)
      
      // 计算环比增长率
      const recentRevenue = this.historicalData.slice(-7).reduce((sum, item) => sum + item.revenue, 0)
      const growthRate = ((totalPredicted - recentRevenue) / recentRevenue) * 100

      // 更新摘要
      this.forecastSummary = {
        totalRevenue: totalPredicted,
        growthRate: growthRate,
        confidence: 0.75 + Math.random() * 0.2 // 模拟置信度
      }

      // 更新图表数据
      this.addPredictionsToChart(predictions)
    },

    // 添加预测数据到图表
    addPredictionsToChart(predictions) {
      const lastDate = new Date(this.historicalData[this.historicalData.length - 1].date)
      
      // 为预测数据生成日期
      predictions.forEach((prediction, index) => {
        const futureDate = new Date(lastDate)
        futureDate.setDate(futureDate.getDate() + index + 1)
        
        this.historicalData.push({
          date: this.formatDate(futureDate),
          revenue: null,
          predictedRevenue: prediction,
          accuracy: null,
          trend: 'predicted'
        })
      })

      this.updateChartData()
    },

    // 更新图表数据
    updateChartData() {
      this.chartData = {
        columns: ['date', 'actualRevenue', 'predictedRevenue'],
        rows: this.historicalData.map(item => ({
          date: item.date,
          actualRevenue: item.revenue,
          predictedRevenue: item.predictedRevenue
        }))
      }
      
      this.chartDataEmpty = this.chartData.rows.length === 0
    },

    // 处理日期变化
    handleDateChange() {
      this.loadHistoricalData()
    },

    // 处理周期变化
    handlePeriodChange() {
      this.loadHistoricalData()
    },

    // 刷新数据
    refreshData() {
      this.loadHistoricalData()
    },

    // 导出数据
    exportData() {
      // 实现数据导出功能
      this.$message.info('导出功能开发中...')
    },

    // 分页处理
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.loadHistoricalData()
    },

    handleCurrentChange(val) {
      this.pagination.currentPage = val
    },

    // 工具方法
    formatDate(date) {
      return date.toISOString().split('T')[0]
    },

    formatCurrency(amount) {
      if (amount === null || amount === undefined) return '-'
      return '¥' + amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
    },

    calculateTrend(current, base) {
      const diff = current - base
      if (Math.abs(diff) < base * 0.05) return 'stable'
      return diff > 0 ? 'up' : 'down'
    },

    getTrendText(trend) {
      const trendMap = {
        'up': '上升',
        'down': '下降',
        'stable': '稳定',
        'predicted': '预测'
      }
      return trendMap[trend] || '-'
    },

    getTrendTagType(trend) {
      const typeMap = {
        'up': 'success',
        'down': 'danger',
        'stable': 'info',
        'predicted': 'warning'
      }
      return typeMap[trend] || 'info'
    },

    getAccuracyTagType(accuracy) {
      if (accuracy >= 0.9) return 'success'
      if (accuracy >= 0.7) return 'warning'
      return 'danger'
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.control-panel {
  margin-bottom: 20px;
}

.chart-container {
  margin-bottom: 20px;
}

.chart-wrapper {
  height: 400px;
}

.table-container {
  margin-bottom: 20px;
}

.result-summary {
  padding: 10px 0;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.result-item .label {
  font-weight: 500;
  color: #606266;
}

.result-item .value {
  font-weight: bold;
  font-size: 16px;
}

.result-item .value.positive {
  color: #67C23A;
}

.result-item .value.negative {
  color: #F56C6C;
}

.predicted-value {
  color: #E6A23C;
  font-style: italic;
}

.box-card {
  margin: 0;
}

.el-card {
  margin-bottom: 0;
}

.el-card + .el-card {
  margin-top: 0;
}
</style>