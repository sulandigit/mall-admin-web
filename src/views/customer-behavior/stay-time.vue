<template>
  <div class="app-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>停留时间分析</h2>
        <p class="page-description">分析用户在各页面的停留时间分布和行为模式</p>
      </div>
      <div class="header-right">
        <el-select 
          v-model="selectedPageType" 
          placeholder="页面类型"
          size="small"
          style="margin-right: 10px;"
          @change="onPageTypeChange"
        >
          <el-option label="全部页面" value=""></el-option>
          <el-option label="首页" value="home"></el-option>
          <el-option label="商品页" value="product"></el-option>
          <el-option label="分类页" value="category"></el-option>
          <el-option label="购物车" value="cart"></el-option>
          <el-option label="结算页" value="checkout"></el-option>
        </el-select>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="small"
          @change="onDateRangeChange"
          style="margin-right: 10px;"
        ></el-date-picker>
        <el-button 
          :loading="isLoading"
          icon="el-icon-refresh"
          size="small"
          @click="refreshData"
        >
          刷新
        </el-button>
      </div>
    </div>

    <!-- 停留时间概览 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="overview-content">
            <div class="overview-icon">
              <i class="el-icon-time" style="color: #409EFF;"></i>
            </div>
            <div class="overview-info">
              <div class="overview-title">平均停留时间</div>
              <div class="overview-value">{{ formatTime(averageStayTime) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="overview-content">
            <div class="overview-icon">
              <i class="el-icon-timer" style="color: #67C23A;"></i>
            </div>
            <div class="overview-info">
              <div class="overview-title">中位数停留时间</div>
              <div class="overview-value">{{ formatTime(medianStayTime) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="overview-content">
            <div class="overview-icon">
              <i class="el-icon-top" style="color: #E6A23C;"></i>
            </div>
            <div class="overview-info">
              <div class="overview-title">最长停留时间</div>
              <div class="overview-value">{{ formatTime(maxStayTime) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="overview-content">
            <div class="overview-icon">
              <i class="el-icon-bottom" style="color: #F56C6C;"></i>
            </div>
            <div class="overview-info">
              <div class="overview-title">短停留率</div>
              <div class="overview-value">{{ formatPercent(shortStayRate) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 停留时间分布图表 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="16">
        <el-card shadow="hover">
          <div slot="header" class="card-header">
            <span>停留时间分布</span>
            <el-radio-group v-model="distributionType" size="mini" @change="updateDistribution">
              <el-radio-button label="histogram">直方图</el-radio-button>
              <el-radio-button label="line">趋势图</el-radio-button>
            </el-radio-group>
          </div>
          <div class="chart-container">
            <ve-histogram
              v-if="distributionType === 'histogram'"
              :data="timeDistributionData"
              :settings="histogramSettings"
              :loading="loading.stayTime"
              height="350px"
            ></ve-histogram>
            <ve-line
              v-else
              :data="timeTrendData"
              :settings="lineSettings"
              :loading="loading.stayTime"
              height="350px"
            ></ve-line>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div slot="header" class="card-header">
            <span>停留时间分段统计</span>
          </div>
          <div class="segment-stats">
            <div 
              v-for="segment in timeSegments"
              :key="segment.range"
              class="segment-item"
            >
              <div class="segment-range">{{ segment.range }}</div>
              <div class="segment-progress">
                <el-progress 
                  :percentage="segment.percentage" 
                  :color="segment.color"
                  :show-text="false"
                ></el-progress>
              </div>
              <div class="segment-value">
                {{ segment.count }} ({{ segment.percentage.toFixed(1) }}%)
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 页面停留时间对比 -->
    <el-row :gutter="20">
      <el-col :span="14">
        <el-card shadow="hover">
          <div slot="header" class="card-header">
            <span>页面停留时间对比</span>
            <el-select 
              v-model="compareMetric" 
              size="mini"
              @change="updateComparison"
            >
              <el-option label="平均停留时间" value="average"></el-option>
              <el-option label="中位数停留时间" value="median"></el-option>
              <el-option label="总停留时间" value="total"></el-option>
            </el-select>
          </div>
          <div class="comparison-chart">
            <ve-bar
              :data="pageComparisonData"
              :settings="barSettings"
              :loading="loading.stayTime"
              height="400px"
            ></ve-bar>
          </div>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card shadow="hover">
          <div slot="header" class="card-header">
            <span>停留时间排行榜</span>
          </div>
          <div class="ranking-list">
            <div 
              v-for="(page, index) in topStayTimePages"
              :key="index"
              class="ranking-item"
            >
              <div class="rank-number">{{ index + 1 }}</div>
              <div class="page-info">
                <div class="page-name">{{ page.pageName || page.pageUrl }}</div>
                <div class="page-stats">
                  <span>平均: {{ formatTime(page.averageStayTime) }}</span>
                  <span>访问: {{ formatNumber(page.visitCount) }}</span>
                </div>
              </div>
              <div class="stay-time-value">
                {{ formatTime(page.averageStayTime) }}
              </div>
            </div>
            <div v-if="topStayTimePages.length === 0" class="no-data">
              暂无数据
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  name: 'StayTimeAnalysis',
  data() {
    return {
      selectedPageType: '',
      dateRange: null,
      distributionType: 'histogram',
      compareMetric: 'average'
    }
  },
  computed: {
    ...mapState('behavior', ['stayTimeData', 'loading']),
    ...mapGetters('behavior', ['isLoading']),
    
    // 停留时间分布数据
    timeDistribution() {
      return this.stayTimeData.timeDistribution || []
    },
    
    // 页面对比数据
    pageComparison() {
      return this.stayTimeData.pageComparison || []
    },
    
    // 概览统计
    averageStayTime() {
      return this.stayTimeData.averageTime || 0
    },
    
    medianStayTime() {
      const distribution = this.timeDistribution
      if (distribution.length === 0) return 0
      const sorted = [...distribution].sort((a, b) => a.time - b.time)
      const mid = Math.floor(sorted.length / 2)
      return sorted.length % 2 === 0 ? 
        (sorted[mid - 1].time + sorted[mid].time) / 2 : 
        sorted[mid].time
    },
    
    maxStayTime() {
      const distribution = this.timeDistribution
      if (distribution.length === 0) return 0
      return Math.max(...distribution.map(item => item.time))
    },
    
    shortStayRate() {
      const distribution = this.timeDistribution
      if (distribution.length === 0) return 0
      const shortStays = distribution.filter(item => item.time < 30).reduce((sum, item) => sum + item.count, 0)
      const totalStays = distribution.reduce((sum, item) => sum + item.count, 0)
      return totalStays > 0 ? shortStays / totalStays : 0
    },
    
    // 停留时间分段统计
    timeSegments() {
      const segments = [
        { range: '0-30秒', min: 0, max: 30, color: '#F56C6C' },
        { range: '30秒-1分钟', min: 30, max: 60, color: '#E6A23C' },
        { range: '1-3分钟', min: 60, max: 180, color: '#409EFF' },
        { range: '3-5分钟', min: 180, max: 300, color: '#67C23A' },
        { range: '5分钟以上', min: 300, max: Infinity, color: '#909399' }
      ]
      
      const distribution = this.timeDistribution
      const totalCount = distribution.reduce((sum, item) => sum + item.count, 0)
      
      return segments.map(segment => {
        const count = distribution
          .filter(item => item.time >= segment.min && item.time < segment.max)
          .reduce((sum, item) => sum + item.count, 0)
        
        return {
          ...segment,
          count,
          percentage: totalCount > 0 ? (count / totalCount) * 100 : 0
        }
      })
    },
    
    // 直方图数据
    timeDistributionData() {
      return {
        columns: ['时间段', '访问次数'],
        rows: this.timeDistribution.map(item => ({
          '时间段': this.formatTimeRange(item.time),
          '访问次数': item.count
        }))
      }
    },
    
    // 趋势图数据
    timeTrendData() {
      return {
        columns: ['时间', '平均停留时间'],
        rows: this.timeDistribution.map(item => ({
          '时间': this.formatTimeRange(item.time),
          '平均停留时间': item.averageTime || item.time
        }))
      }
    },
    
    // 页面对比数据
    pageComparisonData() {
      const metricMap = {
        average: 'averageStayTime',
        median: 'medianStayTime', 
        total: 'totalStayTime'
      }
      const metric = metricMap[this.compareMetric]
      
      return {
        columns: ['页面', '停留时间'],
        rows: this.pageComparison.map(page => ({
          '页面': page.pageName || page.pageUrl.split('/').pop(),
          '停留时间': page[metric] || 0
        }))
      }
    },
    
    // 排行榜数据
    topStayTimePages() {
      return [...this.pageComparison]
        .sort((a, b) => (b.averageStayTime || 0) - (a.averageStayTime || 0))
        .slice(0, 10)
    },
    
    // 图表设置
    histogramSettings() {
      return {
        color: ['#409EFF']
      }
    },
    
    lineSettings() {
      return {
        area: true,
        smooth: true,
        color: ['#67C23A']
      }
    },
    
    barSettings() {
      return {
        color: ['#E6A23C']
      }
    }
  },
  async mounted() {
    await this.initData()
  },
  methods: {
    ...mapActions('behavior', ['fetchStayTimeData']),
    
    // 初始化数据
    async initData() {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 7)
      
      this.dateRange = [startDate, endDate]
      await this.fetchData()
    },
    
    // 获取数据
    async fetchData() {
      const params = {}
      if (this.dateRange && this.dateRange.length === 2) {
        params.dateRange = [
          this.formatDate(this.dateRange[0]),
          this.formatDate(this.dateRange[1])
        ]
      }
      if (this.selectedPageType) {
        params.pageType = this.selectedPageType
      }
      
      try {
        await this.fetchStayTimeData(params)
      } catch (error) {
        this.$message.error('获取停留时间数据失败')
      }
    },
    
    // 刷新数据
    async refreshData() {
      await this.fetchData()
      this.$message.success('数据刷新成功')
    },
    
    // 页面类型变化
    async onPageTypeChange() {
      await this.fetchData()
    },
    
    // 日期范围变化
    async onDateRangeChange() {
      await this.fetchData()
    },
    
    // 更新分布图表
    updateDistribution() {
      // 图表类型切换，无需重新获取数据
    },
    
    // 更新对比指标
    updateComparison() {
      // 对比指标切换，无需重新获取数据
    },
    
    // 工具方法
    formatTime(seconds) {
      if (seconds < 60) {
        return `${seconds.toFixed(0)}s`
      } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = Math.floor(seconds % 60)
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
      } else {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        return `${hours}:${minutes.toString().padStart(2, '0')}:00`
      }
    },
    
    formatTimeRange(seconds) {
      if (seconds < 60) {
        return `${Math.floor(seconds / 10) * 10}-${Math.floor(seconds / 10) * 10 + 10}s`
      } else if (seconds < 300) {
        return `${Math.floor(seconds / 30) * 30}-${Math.floor(seconds / 30) * 30 + 30}s`
      } else {
        return `${Math.floor(seconds / 60)}分钟+`
      }
    },
    
    formatPercent(rate) {
      return `${(rate * 100).toFixed(1)}%`
    },
    
    formatNumber(num) {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
      }
      return num.toString()
    },
    
    formatDate(date) {
      return date.toISOString().split('T')[0]
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #EBEEF5;
}

.header-left h2 {
  margin: 0 0 5px 0;
  color: #303133;
  font-size: 24px;
  font-weight: bold;
}

.page-description {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
}

.overview-card {
  height: 100px;
}

.overview-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.overview-icon {
  margin-right: 15px;
}

.overview-icon i {
  font-size: 36px;
}

.overview-info {
  flex: 1;
}

.overview-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.overview-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 350px;
}

.segment-stats {
  padding: 10px 0;
}

.segment-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.segment-range {
  width: 80px;
  font-size: 12px;
  color: #606266;
}

.segment-progress {
  flex: 1;
  margin: 0 15px;
}

.segment-value {
  width: 80px;
  text-align: right;
  font-size: 12px;
  color: #303133;
}

.comparison-chart {
  height: 400px;
}

.ranking-list {
  max-height: 400px;
  overflow-y: auto;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #F5F7FA;
}

.ranking-item:last-child {
  border-bottom: none;
}

.rank-number {
  width: 30px;
  height: 30px;
  background-color: #E4E7ED;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #909399;
  margin-right: 15px;
  font-size: 14px;
}

.rank-number:nth-child(1) {
  background-color: #FFD700;
  color: #FFF;
}

.rank-number:nth-child(2) {
  background-color: #C0C4CC;
  color: #FFF;
}

.rank-number:nth-child(3) {
  background-color: #CD7F32;
  color: #FFF;
}

.page-info {
  flex: 1;
}

.page-name {
  font-size: 14px;
  color: #303133;
  margin-bottom: 5px;
  font-weight: 500;
}

.page-stats {
  display: flex;
  gap: 15px;
}

.page-stats span {
  font-size: 12px;
  color: #909399;
}

.stay-time-value {
  font-size: 16px;
  font-weight: bold;
  color: #409EFF;
}

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 150px;
  color: #909399;
  font-size: 14px;
}
</style>