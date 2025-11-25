<template>
  <div class="app-container">
    <div class="overview-container">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-header">
              <span>总积分发放</span>
            </div>
            <div class="card-value">{{ overviewData.totalPointsIssued || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-header">
              <span>总积分消费</span>
            </div>
            <div class="card-value">{{ overviewData.totalPointsConsumed || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-header">
              <span>活跃用户数</span>
            </div>
            <div class="card-value">{{ overviewData.activeUsers || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-header">
              <span>今日兑换次数</span>
            </div>
            <div class="card-value">{{ overviewData.todayExchanges || 0 }}</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="charts-container">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="chart-wrapper">
            <div class="chart-title">积分趋势图</div>
            <div id="trendChart" class="chart"></div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-wrapper">
            <div class="chart-title">用户积分分布</div>
            <div id="distributionChart" class="chart"></div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="charts-container">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="chart-wrapper">
            <div class="chart-title">兑换统计</div>
            <div id="exchangeChart" class="chart"></div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-wrapper">
            <div class="chart-title">会员等级分布</div>
            <div id="levelChart" class="chart"></div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import echarts from 'echarts'

export default {
  name: 'PointsAnalytics',
  data() {
    return {
      overviewData: {},
      trendChart: null,
      distributionChart: null,
      exchangeChart: null,
      levelChart: null
    }
  },
  mounted() {
    this.initCharts()
    this.loadData()
  },
  beforeDestroy() {
    if (this.trendChart) this.trendChart.dispose()
    if (this.distributionChart) this.distributionChart.dispose()
    if (this.exchangeChart) this.exchangeChart.dispose()
    if (this.levelChart) this.levelChart.dispose()
  },
  methods: {
    initCharts() {
      this.trendChart = echarts.init(document.getElementById('trendChart'))
      this.distributionChart = echarts.init(document.getElementById('distributionChart'))
      this.exchangeChart = echarts.init(document.getElementById('exchangeChart'))
      this.levelChart = echarts.init(document.getElementById('levelChart'))
      
      // 响应式
      window.addEventListener('resize', this.handleResize)
    },
    loadData() {
      this.loadOverviewData()
      this.loadTrendData()
      this.loadDistributionData()
      this.loadExchangeData()
      this.loadLevelData()
    },
    async loadOverviewData() {
      try {
        const response = await this.$store.dispatch('fetchPointsOverview')
        this.overviewData = response.data
      } catch (error) {
        console.error('加载概览数据失败:', error)
      }
    },
    async loadTrendData() {
      try {
        const response = await this.$store.dispatch('fetchPointsTrend', { days: 30 })
        const data = response.data
        
        const option = {
          title: { text: '近30天积分趋势' },
          tooltip: { trigger: 'axis' },
          legend: { data: ['积分发放', '积分消费'] },
          xAxis: {
            type: 'category',
            data: data.dates || []
          },
          yAxis: { type: 'value' },
          series: [
            {
              name: '积分发放',
              type: 'line',
              data: data.issued || []
            },
            {
              name: '积分消费',
              type: 'line',
              data: data.consumed || []
            }
          ]
        }
        this.trendChart.setOption(option)
      } catch (error) {
        console.error('加载趋势数据失败:', error)
      }
    },
    async loadDistributionData() {
      try {
        const response = await this.$store.dispatch('fetchUserDistribution')
        const data = response.data
        
        const option = {
          title: { text: '用户积分分布' },
          tooltip: { trigger: 'item' },
          series: [{
            type: 'pie',
            radius: '50%',
            data: data.distribution || [
              { value: 35, name: '0-100积分' },
              { value: 25, name: '100-500积分' },
              { value: 20, name: '500-1000积分' },
              { value: 15, name: '1000-5000积分' },
              { value: 5, name: '5000+积分' }
            ]
          }]
        }
        this.distributionChart.setOption(option)
      } catch (error) {
        console.error('加载分布数据失败:', error)
      }
    },
    async loadExchangeData() {
      try {
        const response = await this.$store.dispatch('fetchExchangeStats')
        const data = response.data
        
        const option = {
          title: { text: '兑换商品TOP10' },
          tooltip: { trigger: 'axis' },
          xAxis: {
            type: 'category',
            data: data.itemNames || []
          },
          yAxis: { type: 'value' },
          series: [{
            type: 'bar',
            data: data.exchangeCounts || []
          }]
        }
        this.exchangeChart.setOption(option)
      } catch (error) {
        console.error('加载兑换数据失败:', error)
      }
    },
    async loadLevelData() {
      try {
        // 模拟数据
        const option = {
          title: { text: '会员等级分布' },
          tooltip: { trigger: 'item' },
          series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            data: [
              { value: 40, name: '青铜会员' },
              { value: 30, name: '白银会员' },
              { value: 20, name: '黄金会员' },
              { value: 8, name: '铂金会员' },
              { value: 2, name: '钻石会员' }
            ]
          }]
        }
        this.levelChart.setOption(option)
      } catch (error) {
        console.error('加载等级数据失败:', error)
      }
    },
    handleResize() {
      if (this.trendChart) this.trendChart.resize()
      if (this.distributionChart) this.distributionChart.resize()
      if (this.exchangeChart) this.exchangeChart.resize()
      if (this.levelChart) this.levelChart.resize()
    }
  }
}
</script>

<style scoped>
.overview-container {
  margin-bottom: 20px;
}
.overview-card {
  background: #fff;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  padding: 20px;
  text-align: center;
}
.card-header {
  color: #909399;
  font-size: 14px;
  margin-bottom: 10px;
}
.card-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}
.charts-container {
  margin-bottom: 20px;
}
.chart-wrapper {
  background: #fff;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  padding: 20px;
}
.chart-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #303133;
}
.chart {
  width: 100%;
  height: 300px;
}
</style>