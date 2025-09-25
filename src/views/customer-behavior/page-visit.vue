<template>
  <div class="app-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>页面访问统计</h2>
        <p class="page-description">分析页面访问量、访问路径和用户行为流向</p>
      </div>
      <div class="header-right">
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
        <el-button 
          icon="el-icon-download"
          size="small"
          @click="exportData"
        >
          导出
        </el-button>
      </div>
    </div>

    <!-- 页面访问概览 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="overview-content">
            <div class="overview-icon">
              <i class="el-icon-view" style="color: #409EFF;"></i>
            </div>
            <div class="overview-info">
              <div class="overview-title">总页面浏览量</div>
              <div class="overview-value">{{ formatNumber(totalPageViews) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="overview-content">
            <div class="overview-icon">
              <i class="el-icon-user" style="color: #67C23A;"></i>
            </div>
            <div class="overview-info">
              <div class="overview-title">独立访客数</div>
              <div class="overview-value">{{ formatNumber(uniqueVisitors) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="overview-content">
            <div class="overview-icon">
              <i class="el-icon-document" style="color: #E6A23C;"></i>
            </div>
            <div class="overview-info">
              <div class="overview-title">页面总数</div>
              <div class="overview-value">{{ totalPages }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="overview-content">
            <div class="overview-icon">
              <i class="el-icon-time" style="color: #F56C6C;"></i>
            </div>
            <div class="overview-info">
              <div class="overview-title">平均访问深度</div>
              <div class="overview-value">{{ averageDepth.toFixed(1) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 页面访问排行和访问来源 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="12">
        <el-card shadow="hover">
          <div slot="header" class="card-header">
            <span>页面访问排行榜</span>
            <el-input
              v-model="searchKeyword"
              placeholder="搜索页面"
              size="mini"
              prefix-icon="el-icon-search"
              style="width: 200px;"
              @input="onSearch"
            ></el-input>
          </div>
          <div class="ranking-container">
            <el-table
              :data="filteredPageRanking"
              style="width: 100%"
              :loading="loading.pageVisit"
              max-height="400"
            >
              <el-table-column 
                type="index" 
                label="排名" 
                width="60"
                :index="getRankIndex"
              ></el-table-column>
              <el-table-column 
                prop="pageName" 
                label="页面名称" 
                min-width="150"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  <span v-if="scope.row.pageName">{{ scope.row.pageName }}</span>
                  <span v-else class="page-url">{{ scope.row.pageUrl }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="visitCount" label="访问次数" width="100" sortable>
                <template slot-scope="scope">
                  {{ formatNumber(scope.row.visitCount) }}
                </template>
              </el-table-column>
              <el-table-column prop="uniqueVisitors" label="独立访客" width="100" sortable>
                <template slot-scope="scope">
                  {{ formatNumber(scope.row.uniqueVisitors) }}
                </template>
              </el-table-column>
              <el-table-column prop="averageStayTime" label="平均停留" width="100" sortable>
                <template slot-scope="scope">
                  {{ formatTime(scope.row.averageStayTime) }}
                </template>
              </el-table-column>
              <el-table-column prop="bounceRate" label="跳出率" width="80" sortable>
                <template slot-scope="scope">
                  {{ formatPercent(scope.row.bounceRate) }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <div slot="header" class="card-header">
            <span>访问来源分布</span>
          </div>
          <div class="source-chart-container">
            <ve-pie
              :data="visitSourcesData"
              :settings="pieSettings"
              :loading="loading.pageVisit"
              height="350px"
            ></ve-pie>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 访问路径分析和热门入口 -->
    <el-row :gutter="20">
      <el-col :span="14">
        <el-card shadow="hover">
          <div slot="header" class="card-header">
            <span>用户访问路径分析</span>
            <el-select 
              v-model="selectedEntryPage" 
              placeholder="选择入口页面"
              size="mini"
              style="width: 200px;"
              @change="onEntryPageChange"
            >
              <el-option
                v-for="page in entryPages"
                :key="page.value"
                :label="page.label"
                :value="page.value"
              ></el-option>
            </el-select>
          </div>
          <div class="path-analysis-container">
            <div class="path-flow">
              <div 
                v-for="(step, index) in visitPaths" 
                :key="index"
                class="path-step"
              >
                <div class="step-content">
                  <div class="step-title">步骤 {{ index + 1 }}</div>
                  <div class="step-page">{{ step.pageName || step.pageUrl }}</div>
                  <div class="step-stats">
                    <span>{{ formatNumber(step.visitors) }} 用户</span>
                    <span>{{ formatPercent(step.conversionRate) }} 转化率</span>
                  </div>
                </div>
                <div v-if="index < visitPaths.length - 1" class="step-arrow">
                  <i class="el-icon-arrow-right"></i>
                </div>
              </div>
            </div>
            <div v-if="visitPaths.length === 0" class="no-data">
              暂无访问路径数据
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card shadow="hover">
          <div slot="header" class="card-header">
            <span>热门入口页面</span>
          </div>
          <div class="entry-pages-container">
            <div 
              v-for="(entry, index) in topEntryPages"
              :key="index"
              class="entry-item"
              @click="selectEntryPage(entry)"
            >
              <div class="entry-rank">{{ index + 1 }}</div>
              <div class="entry-content">
                <div class="entry-title">{{ entry.pageName || entry.pageUrl }}</div>
                <div class="entry-stats">
                  <span>{{ formatNumber(entry.entryCount) }} 次进入</span>
                  <span>{{ formatPercent(entry.entryRate) }} 入口占比</span>
                </div>
              </div>
              <div class="entry-action">
                <i class="el-icon-arrow-right"></i>
              </div>
            </div>
            <div v-if="topEntryPages.length === 0" class="no-data">
              暂无入口页面数据
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
  name: 'PageVisitAnalysis',
  data() {
    return {
      dateRange: null,
      searchKeyword: '',
      selectedEntryPage: '',
      currentPage: 1,
      pageSize: 20
    }
  },
  computed: {
    ...mapState('behavior', ['pageVisitData', 'loading']),
    ...mapGetters('behavior', ['isLoading', 'pageRankingChartData', 'visitSourcesChartData']),
    
    // 页面访问排行榜
    pageRanking() {
      return this.pageVisitData.pageRanking || []
    },
    
    // 过滤后的页面排行榜
    filteredPageRanking() {
      if (!this.searchKeyword) {
        return this.pageRanking
      }
      return this.pageRanking.filter(page => 
        (page.pageName && page.pageName.toLowerCase().includes(this.searchKeyword.toLowerCase())) ||
        (page.pageUrl && page.pageUrl.toLowerCase().includes(this.searchKeyword.toLowerCase()))
      )
    },
    
    // 访问来源数据
    visitSourcesData() {
      const sources = this.pageVisitData.visitSources || []
      return {
        columns: ['来源', '访问量'],
        rows: sources.map(source => ({
          '来源': source.source,
          '访问量': source.count
        }))
      }
    },
    
    // 访问路径
    visitPaths() {
      return this.pageVisitData.visitPaths || []
    },
    
    // 入口页面列表
    entryPages() {
      const pages = this.pageRanking.map(page => ({
        value: page.pageUrl,
        label: page.pageName || page.pageUrl
      }))
      return [{ value: '', label: '全部页面' }, ...pages]
    },
    
    // 热门入口页面
    topEntryPages() {
      return this.pageRanking
        .filter(page => page.entryCount > 0)
        .sort((a, b) => b.entryCount - a.entryCount)
        .slice(0, 8)
    },
    
    // 概览数据
    totalPageViews() {
      return this.pageRanking.reduce((sum, page) => sum + (page.visitCount || 0), 0)
    },
    
    uniqueVisitors() {
      return this.pageRanking.reduce((sum, page) => sum + (page.uniqueVisitors || 0), 0)
    },
    
    totalPages() {
      return this.pageRanking.length
    },
    
    averageDepth() {
      if (this.uniqueVisitors === 0) return 0
      return this.totalPageViews / this.uniqueVisitors
    },
    
    // 饼图设置
    pieSettings() {
      return {
        radius: ['30%', '70%'],
        label: {
          formatter: '{b}: {c} ({d}%)'
        }
      }
    }
  },
  async mounted() {
    await this.initData()
  },
  methods: {
    ...mapActions('behavior', ['fetchPageVisitData']),
    
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
        params.startDate = this.formatDate(this.dateRange[0])
        params.endDate = this.formatDate(this.dateRange[1])
      }
      params.limit = this.pageSize
      
      try {
        await this.fetchPageVisitData(params)
      } catch (error) {
        this.$message.error('获取页面访问数据失败')
      }
    },
    
    // 刷新数据
    async refreshData() {
      await this.fetchData()
      this.$message.success('数据刷新成功')
    },
    
    // 日期范围变化
    async onDateRangeChange() {
      await this.fetchData()
    },
    
    // 搜索
    onSearch() {
      // 搜索是客户端过滤，无需重新请求数据
    },
    
    // 入口页面变化
    async onEntryPageChange() {
      // 根据选择的入口页面重新获取访问路径数据
      const params = {
        entryPage: this.selectedEntryPage
      }
      if (this.dateRange && this.dateRange.length === 2) {
        params.startDate = this.formatDate(this.dateRange[0])
        params.endDate = this.formatDate(this.dateRange[1])
      }
      
      try {
        await this.fetchPageVisitData(params)
      } catch (error) {
        this.$message.error('获取访问路径数据失败')
      }
    },
    
    // 选择入口页面
    selectEntryPage(entry) {
      this.selectedEntryPage = entry.pageUrl
      this.onEntryPageChange()
    },
    
    // 导出数据
    exportData() {
      // 实现数据导出功能
      this.$message.info('导出功能开发中...')
    },
    
    // 获取排名索引
    getRankIndex(index) {
      return index + 1
    },
    
    // 工具方法
    formatNumber(num) {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
      }
      return num.toString()
    },
    
    formatTime(seconds) {
      if (seconds < 60) {
        return `${seconds.toFixed(0)}s`
      }
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = Math.floor(seconds % 60)
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    },
    
    formatPercent(rate) {
      return `${(rate * 100).toFixed(1)}%`
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

.ranking-container {
  min-height: 400px;
}

.page-url {
  color: #909399;
  font-size: 12px;
}

.source-chart-container {
  height: 350px;
}

.path-analysis-container {
  min-height: 200px;
}

.path-flow {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  padding: 20px;
}

.path-step {
  display: flex;
  align-items: center;
  margin: 10px;
}

.step-content {
  background-color: #F5F7FA;
  border: 1px solid #DCDFE6;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  min-width: 120px;
}

.step-title {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.step-page {
  font-size: 14px;
  color: #303133;
  font-weight: bold;
  margin-bottom: 8px;
}

.step-stats {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.step-stats span {
  font-size: 12px;
  color: #606266;
}

.step-arrow {
  margin: 0 10px;
  color: #C0C4CC;
  font-size: 18px;
}

.entry-pages-container {
  min-height: 300px;
}

.entry-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #F5F7FA;
  cursor: pointer;
  transition: background-color 0.3s;
}

.entry-item:hover {
  background-color: #F5F7FA;
}

.entry-item:last-child {
  border-bottom: none;
}

.entry-rank {
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

.entry-rank:nth-child(1) {
  background-color: #FFD700;
  color: #FFF;
}

.entry-content {
  flex: 1;
}

.entry-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 5px;
  font-weight: 500;
}

.entry-stats {
  display: flex;
  gap: 15px;
}

.entry-stats span {
  font-size: 12px;
  color: #909399;
}

.entry-action {
  color: #C0C4CC;
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