<template>
  <div class="app-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>跳出率分析</h2>
        <p class="page-description">监控页面跳出率变化趋势，识别用户体验问题</p>
      </div>
      <div class="header-right">
        <el-select 
          v-model="selectedPeriod" 
          placeholder="统计周期"
          size="small"
          style="margin-right: 10px;"
          @change="onPeriodChange"
        >
          <el-option label="小时" value="hour"></el-option>
          <el-option label="天" value="day"></el-option>
          <el-option label="周" value="week"></el-option>
          <el-option label="月" value="month"></el-option>
        </el-select>
        <el-input-number
          v-model="alertThreshold"
          :min="0"
          :max="100"
          :precision="1"
          size="small"
          style="width: 120px; margin-right: 10px;"
          @change="onThresholdChange"
        ></el-input-number>
        <span style="margin-right: 10px; font-size: 12px; color: #606266;">预警阈值(%)</span>
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

    <!-- 跳出率概览 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="overview-content">
            <div class="overview-icon">
              <i class="el-icon-warning" style="color: #E6A23C;"></i>
            </div>
            <div class="overview-info">
              <div class="overview-title">总体跳出率</div>
              <div class="overview-value" :class="getBounceRateClass(overallBounceRate)">
                {{ formatPercent(overallBounceRate) }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="overview-content">
            <div class="overview-icon">
              <i class="el-icon-sort-up" style="color: #F56C6C;"></i>
            </div>
            <div class="overview-info">
              <div class="overview-title">最高跳出率</div>
              <div class="overview-value danger">{{ formatPercent(maxBounceRate) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="overview-content">
            <div class="overview-icon">
              <i class="el-icon-sort-down" style="color: #67C23A;"></i>
            </div>
            <div class="overview-info">
              <div class="overview-title">最低跳出率</div>
              <div class="overview-value success">{{ formatPercent(minBounceRate) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="overview-content">
            <div class="overview-icon">
              <i class="el-icon-bell" :style="{ color: alertCount > 0 ? '#F56C6C' : '#C0C4CC' }"></i>
            </div>
            <div class="overview-info">
              <div class="overview-title">预警页面数</div>
              <div class="overview-value" :class="alertCount > 0 ? 'danger' : ''">{{ alertCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 跳出率趋势图表 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="16">
        <el-card shadow="hover">
          <div slot="header" class="card-header">
            <span>跳出率趋势</span>
            <div class="chart-controls">
              <el-checkbox 
                v-model="showTrendLine" 
                @change="updateTrendChart"
                style="margin-right: 10px;"
              >
                显示趋势线
              </el-checkbox>
              <el-checkbox 
                v-model="showAlertLine" 
                @change="updateTrendChart"
              >
                显示预警线
              </el-checkbox>
            </div>
          </div>
          <div class="chart-container">
            <ve-line
              :data="bounceRateTrendData"
              :settings="trendSettings"
              :extend="trendExtend"
              :loading="loading.bounceRate"
              height="350px"
            ></ve-line>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div slot="header" class="card-header">
            <span>跳出率分布</span>
          </div>
          <div class="distribution-container">
            <ve-pie
              :data="bounceRateDistributionData"
              :settings="pieSettings"
              :loading="loading.bounceRate"
              height="300px"
            ></ve-pie>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 页面跳出率排行和预警列表 -->
    <el-row :gutter="20">
      <el-col :span="14">
        <el-card shadow="hover">
          <div slot="header" class="card-header">
            <span>页面跳出率排行</span>
            <el-radio-group v-model="sortOrder" size="mini" @change="onSortChange">
              <el-radio-button label="desc">降序</el-radio-button>
              <el-radio-button label="asc">升序</el-radio-button>
            </el-radio-group>
          </div>
          <div class="ranking-container">
            <el-table
              :data="sortedPageRates"
              style="width: 100%"
              :loading="loading.bounceRate"
              max-height="400"
              @row-click="onPageClick"
            >
              <el-table-column type="index" label="排名" width="60"></el-table-column>
              <el-table-column prop="pageName" label="页面名称" min-width="150" show-overflow-tooltip>
                <template slot-scope="scope">
                  <span v-if="scope.row.pageName">{{ scope.row.pageName }}</span>
                  <span v-else class="page-url">{{ scope.row.pageUrl }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="bounceRate" label="跳出率" width="100" sortable>
                <template slot-scope="scope">
                  <span :class="getBounceRateClass(scope.row.bounceRate)">
                    {{ formatPercent(scope.row.bounceRate) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="visitCount" label="访问次数" width="100">
                <template slot-scope="scope">
                  {{ formatNumber(scope.row.visitCount) }}
                </template>
              </el-table-column>
              <el-table-column prop="trend" label="趋势" width="100">
                <template slot-scope="scope">
                  <span :class="getTrendClass(scope.row.trend)">
                    <i :class="getTrendIcon(scope.row.trend)"></i>
                    {{ formatTrend(scope.row.trend) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="80">
                <template slot-scope="scope">
                  <el-tag 
                    :type="getStatusType(scope.row.bounceRate)"
                    size="mini"
                  >
                    {{ getStatusText(scope.row.bounceRate) }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card shadow="hover">
          <div slot="header" class="card-header">
            <span>异常预警</span>
            <el-badge :value="alertCount" :hidden="alertCount === 0" class="alert-badge">
              <i class="el-icon-bell"></i>
            </el-badge>
          </div>
          <div class="alerts-container">
            <div 
              v-for="alert in alerts"
              :key="alert.id"
              class="alert-item"
              :class="getAlertClass(alert.level)"
            >
              <div class="alert-icon">
                <i :class="getAlertIcon(alert.level)"></i>
              </div>
              <div class="alert-content">
                <div class="alert-title">{{ alert.title }}</div>
                <div class="alert-message">{{ alert.message }}</div>
                <div class="alert-time">{{ formatAlertTime(alert.timestamp) }}</div>
              </div>
              <div class="alert-action">
                <el-button type="text" size="mini" @click="viewAlertDetail(alert)">
                  查看
                </el-button>
              </div>
            </div>
            <div v-if="alerts.length === 0" class="no-alerts">
              <i class="el-icon-circle-check" style="color: #67C23A; font-size: 24px;"></i>
              <p>暂无异常预警</p>
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
  name: 'BounceRateAnalysis',
  data() {
    return {
      selectedPeriod: 'day',
      alertThreshold: 70.0,
      showTrendLine: true,
      showAlertLine: true,
      sortOrder: 'desc'
    }
  },
  computed: {
    ...mapState('behavior', ['bounceRateData', 'loading']),
    ...mapGetters('behavior', ['isLoading']),
    
    // 跳出率趋势数据
    rateTrend() {
      return this.bounceRateData.rateTrend || []
    },
    
    // 页面跳出率数据
    pageRates() {
      return this.bounceRateData.pageRates || []
    },
    
    // 预警列表
    alerts() {
      return this.bounceRateData.alerts || []
    },
    
    // 概览统计
    overallBounceRate() {
      if (this.rateTrend.length === 0) return 0
      const latest = this.rateTrend[this.rateTrend.length - 1]
      return latest.bounceRate || 0
    },
    
    maxBounceRate() {
      if (this.pageRates.length === 0) return 0
      return Math.max(...this.pageRates.map(page => page.bounceRate || 0))
    },
    
    minBounceRate() {
      if (this.pageRates.length === 0) return 0
      return Math.min(...this.pageRates.map(page => page.bounceRate || 0))
    },
    
    alertCount() {
      return this.alerts.length
    },
    
    // 排序后的页面跳出率
    sortedPageRates() {
      const sorted = [...this.pageRates]
      return sorted.sort((a, b) => {
        const rateA = a.bounceRate || 0
        const rateB = b.bounceRate || 0
        return this.sortOrder === 'desc' ? rateB - rateA : rateA - rateB
      })
    },
    
    // 趋势图表数据
    bounceRateTrendData() {
      return {
        columns: ['时间', '跳出率'],
        rows: this.rateTrend.map(item => ({
          '时间': this.formatTrendDate(item.date),
          '跳出率': (item.bounceRate * 100).toFixed(1)
        }))
      }
    },
    
    // 分布数据
    bounceRateDistributionData() {
      const ranges = [
        { name: '0-20%', min: 0, max: 0.2, color: '#67C23A' },
        { name: '20-40%', min: 0.2, max: 0.4, color: '#409EFF' },
        { name: '40-60%', min: 0.4, max: 0.6, color: '#E6A23C' },
        { name: '60-80%', min: 0.6, max: 0.8, color: '#F56C6C' },
        { name: '80-100%', min: 0.8, max: 1, color: '#909399' }
      ]
      
      const distribution = ranges.map(range => {
        const count = this.pageRates.filter(page => 
          page.bounceRate >= range.min && page.bounceRate < range.max
        ).length
        
        return {
          name: range.name,
          value: count
        }
      }).filter(item => item.value > 0)
      
      return {
        columns: ['范围', '页面数'],
        rows: distribution.map(item => ({
          '范围': item.name,
          '页面数': item.value
        }))
      }
    },
    
    // 图表设置
    trendSettings() {
      return {
        area: true,
        smooth: true,
        yAxisType: 'percent'
      }
    },
    
    trendExtend() {
      const extend = {
        series: {
          markLine: {
            data: []
          }
        }
      }
      
      if (this.showAlertLine) {
        extend.series.markLine.data.push({
          yAxis: this.alertThreshold,
          name: '预警线',
          lineStyle: {
            color: '#F56C6C',
            type: 'dashed'
          }
        })
      }
      
      return extend
    },
    
    pieSettings() {
      return {
        radius: ['40%', '70%'],
        label: {
          formatter: '{b}: {c}页'
        }
      }
    }
  },
  async mounted() {
    await this.initData()
  },
  methods: {
    ...mapActions('behavior', ['fetchBounceRateData']),
    
    // 初始化数据
    async initData() {
      await this.fetchData()
    },
    
    // 获取数据
    async fetchData() {
      const params = {
        period: this.selectedPeriod,
        threshold: this.alertThreshold / 100
      }
      
      try {
        await this.fetchBounceRateData(params)
      } catch (error) {
        this.$message.error('获取跳出率数据失败')
      }
    },
    
    // 刷新数据
    async refreshData() {
      await this.fetchData()
      this.$message.success('数据刷新成功')
    },
    
    // 统计周期变化
    async onPeriodChange() {
      await this.fetchData()
    },
    
    // 预警阈值变化
    async onThresholdChange() {
      await this.fetchData()
    },
    
    // 排序变化
    onSortChange() {
      // 客户端排序，无需重新获取数据
    },
    
    // 更新趋势图表
    updateTrendChart() {
      // 图表选项变化，无需重新获取数据
    },
    
    // 页面点击
    onPageClick(row) {
      console.log('查看页面详情:', row)
      // 可以跳转到页面详情或显示更多信息
    },
    
    // 查看预警详情
    viewAlertDetail(alert) {
      this.$alert(alert.details || alert.message, alert.title, {
        confirmButtonText: '确定',
        type: this.getAlertType(alert.level)
      })
    },
    
    // 获取跳出率样式类
    getBounceRateClass(rate) {
      if (rate >= this.alertThreshold / 100) return 'danger'
      if (rate >= 0.5) return 'warning'
      return 'success'
    },
    
    // 获取趋势样式类
    getTrendClass(trend) {
      if (trend > 0) return 'trend-up'
      if (trend < 0) return 'trend-down'
      return 'trend-stable'
    },
    
    // 获取趋势图标
    getTrendIcon(trend) {
      if (trend > 0) return 'el-icon-arrow-up'
      if (trend < 0) return 'el-icon-arrow-down'
      return 'el-icon-minus'
    },
    
    // 获取状态类型
    getStatusType(rate) {
      if (rate >= this.alertThreshold / 100) return 'danger'
      if (rate >= 0.5) return 'warning'
      return 'success'
    },
    
    // 获取状态文本
    getStatusText(rate) {
      if (rate >= this.alertThreshold / 100) return '异常'
      if (rate >= 0.5) return '注意'
      return '正常'
    },
    
    // 获取预警样式类
    getAlertClass(level) {
      return `alert-${level}`
    },
    
    // 获取预警图标
    getAlertIcon(level) {
      const icons = {
        high: 'el-icon-warning',
        medium: 'el-icon-warning-outline',
        low: 'el-icon-info'
      }
      return icons[level] || 'el-icon-info'
    },
    
    // 获取预警类型
    getAlertType(level) {
      const types = {
        high: 'error',
        medium: 'warning',
        low: 'info'
      }
      return types[level] || 'info'
    },
    
    // 工具方法
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
    
    formatTrend(trend) {
      if (trend === 0) return '0%'
      return trend > 0 ? `+${trend.toFixed(1)}%` : `${trend.toFixed(1)}%`
    },
    
    formatTrendDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return `${date.getMonth() + 1}/${date.getDate()}`
    },
    
    formatAlertTime(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) {
        return '刚刚'
      } else if (diff < 3600000) {
        return `${Math.floor(diff / 60000)}分钟前`
      } else if (diff < 86400000) {
        return `${Math.floor(diff / 3600000)}小时前`
      } else {
        return `${Math.floor(diff / 86400000)}天前`
      }
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

.overview-value.success {
  color: #67C23A;
}

.overview-value.warning {
  color: #E6A23C;
}

.overview-value.danger {
  color: #F56C6C;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-controls {
  display: flex;
  align-items: center;
}

.chart-container {
  height: 350px;
}

.distribution-container {
  height: 300px;
}

.ranking-container {
  max-height: 400px;
}

.page-url {
  color: #909399;
  font-size: 12px;
}

.success {
  color: #67C23A;
}

.warning {
  color: #E6A23C;
}

.danger {
  color: #F56C6C;
}

.trend-up {
  color: #F56C6C;
}

.trend-down {
  color: #67C23A;
}

.trend-stable {
  color: #909399;
}

.alerts-container {
  max-height: 400px;
  overflow-y: auto;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 6px;
  border-left: 4px solid #E4E7ED;
}

.alert-high {
  border-left-color: #F56C6C;
  background-color: #FEF0F0;
}

.alert-medium {
  border-left-color: #E6A23C;
  background-color: #FDF6EC;
}

.alert-low {
  border-left-color: #409EFF;
  background-color: #ECF5FF;
}

.alert-icon {
  margin-right: 12px;
  padding-top: 2px;
}

.alert-icon i {
  font-size: 16px;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.alert-message {
  font-size: 13px;
  color: #606266;
  margin-bottom: 5px;
  line-height: 1.4;
}

.alert-time {
  font-size: 12px;
  color: #909399;
}

.alert-action {
  margin-left: 10px;
}

.alert-badge {
  font-size: 16px;
}

.no-alerts {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #909399;
}

.no-alerts p {
  margin: 10px 0 0 0;
  font-size: 14px;
}
</style>