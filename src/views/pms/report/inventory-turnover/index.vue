<template>
  <div class="app-container inventory-turnover-report">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">
        <i class="el-icon-pie-chart"></i>
        库存周转率报表
      </h1>
      <p class="page-description">
        分析商品库存周转效率，识别滞销商品，优化库存管理策略
      </p>
    </div>
    
    <!-- 筛选条件面板 -->
    <FilterPanel
      @search="handleSearch"
      @reset="handleReset" />
    
    <!-- 汇总指标卡片 -->
    <SummaryCard :summary-data="summaryData" />
    
    <!-- 主要内容区域 -->
    <el-row :gutter="20">
      <!-- 左侧图表区域 -->
      <el-col :span="14">
        <TurnoverChart
          :chart-data="trendData"
          :loading="chartLoading"
          @granularity-change="handleGranularityChange"
          @refresh="refreshChart"
          @chart-click="handleChartClick" />
      </el-col>
      
      <!-- 右侧快速信息区域 -->
      <el-col :span="10">
        <el-card class="quick-info-card" shadow="never">
          <div slot="header" class="card-header">
            <span>快速信息</span>
          </div>
          
          <!-- TOP滞销商品 -->
          <div class="info-section">
            <h4 class="section-title">
              <i class="el-icon-warning"></i>
              滞销风险TOP5
            </h4>
            <div class="risk-list">
              <div
                v-for="(item, index) in topRiskProducts"
                :key="item.productId"
                class="risk-item"
                @click="handleViewProduct(item)">
                <div class="rank">{{ index + 1 }}</div>
                <div class="product-info">
                  <div class="product-name">{{ item.productName }}</div>
                  <div class="product-rate">
                    周转率: {{ formatTurnoverRate(item.turnoverRate) }}
                  </div>
                </div>
                <div class="product-value">
                  {{ formatCurrency(item.inventoryValue) }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- 快速操作 -->
          <div class="info-section">
            <h4 class="section-title">
              <i class="el-icon-s-operation"></i>
              快速操作
            </h4>
            <div class="quick-actions">
              <el-button
                type="primary"
                size="small"
                icon="el-icon-download"
                @click="handleQuickExport"
                block>
                导出完整报表
              </el-button>
              <el-button
                type="success"
                size="small"
                icon="el-icon-view"
                @click="handleViewDashboard"
                block>
                查看仪表盘
              </el-button>
              <el-button
                type="warning"
                size="small"
                icon="el-icon-warning"
                @click="handleViewRiskProducts"
                block>
                查看滞销商品
              </el-button>
            </div>
          </div>
          
          <!-- 数据更新时间 -->
          <div class="info-section">
            <div class="update-time">
              <i class="el-icon-time"></i>
              数据更新时间: {{ lastUpdateTime }}
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 详细数据表格 -->
    <TurnoverTable
      :table-data="tableData"
      :loading="tableLoading"
      :pagination="pagination"
      @sort-change="handleSortChange"
      @pagination-change="handlePaginationChange"
      @export-data="handleExportData"
      @view-detail="handleViewDetail"
      @view-product="handleViewProduct"
      @batch-export="handleBatchExport"
      @batch-analysis="handleBatchAnalysis" />
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import FilterPanel from './components/FilterPanel'
import SummaryCard from './components/SummaryCard'
import TurnoverChart from './components/TurnoverChart'
import TurnoverTable from './components/TurnoverTable'
import TurnoverCalculator from '@/utils/turnoverCalculator'

export default {
  name: 'InventoryTurnoverReport',
  components: {
    FilterPanel,
    SummaryCard,
    TurnoverChart,
    TurnoverTable
  },
  data() {
    return {
      granularity: 'month',
      lastUpdateTime: ''
    }
  },
  computed: {
    ...mapState('inventoryReport', [
      'turnoverList',
      'trendData',
      'summaryStats',
      'filterParams',
      'pagination',
      'loading'
    ]),
    ...mapGetters('inventoryReport', [
      'hasData',
      'isLoading',
      'currentPageData',
      'summaryStatistics',
      'chartData'
    ]),
    
    /**
     * 表格数据
     */
    tableData() {
      return this.currentPageData || []
    },
    
    /**
     * 汇总数据
     */
    summaryData() {
      return this.summaryStatistics || {}
    },
    
    /**
     * 图表加载状态
     */
    chartLoading() {
      return this.loading.chart
    },
    
    /**
     * 表格加载状态
     */
    tableLoading() {
      return this.loading.table
    },
    
    /**
     * TOP滞销商品
     */
    topRiskProducts() {
      return this.tableData
        .filter(item => item.turnoverRate < 1.0)
        .sort((a, b) => parseFloat(a.turnoverRate) - parseFloat(b.turnoverRate))
        .slice(0, 5)
    }
  },
  async mounted() {
    await this.initializeData()
    this.updateLastUpdateTime()
  },
  methods: {
    ...mapActions('inventoryReport', [
      'fetchTurnoverList',
      'fetchTrendData',
      'updateFilterParams',
      'updatePagination',
      'updateSortInfo',
      'resetFilterParams'
    ]),
    
    /**
     * 初始化数据
     */
    async initializeData() {
      try {
        // 并行加载列表和趋势数据
        await Promise.all([
          this.fetchTurnoverList(),
          this.fetchTrendData(this.granularity)
        ])
      } catch (error) {
        this.$message.error('数据加载失败: ' + error.message)
      }
    },
    
    /**
     * 处理搜索
     */
    async handleSearch(params) {
      try {
        await this.updateFilterParams(params)
        await this.updatePagination({ pageNum: 1 })
        await Promise.all([
          this.fetchTurnoverList(),
          this.fetchTrendData(this.granularity)
        ])
        this.updateLastUpdateTime()
      } catch (error) {
        this.$message.error('搜索失败: ' + error.message)
      }
    },
    
    /**
     * 处理重置
     */
    async handleReset() {
      try {
        await this.resetFilterParams()
        await Promise.all([
          this.fetchTurnoverList(),
          this.fetchTrendData(this.granularity)
        ])
        this.updateLastUpdateTime()
      } catch (error) {
        this.$message.error('重置失败: ' + error.message)
      }
    },
    
    /**
     * 处理时间粒度变化
     */
    async handleGranularityChange(granularity) {
      this.granularity = granularity
      try {
        await this.fetchTrendData(granularity)
      } catch (error) {
        this.$message.error('图表更新失败: ' + error.message)
      }
    },
    
    /**
     * 刷新图表
     */
    async refreshChart() {
      try {
        await this.fetchTrendData(this.granularity)
        this.$message.success('图表已刷新')
      } catch (error) {
        this.$message.error('刷新失败: ' + error.message)
      }
    },
    
    /**
     * 处理图表点击
     */
    handleChartClick(params) {
      console.log('图表点击事件:', params)
      // 可以根据点击的数据点进行钻取分析
    },
    
    /**
     * 处理排序变化
     */
    async handleSortChange(sortInfo) {
      try {
        await this.updateSortInfo(sortInfo)
        await this.fetchTurnoverList()
      } catch (error) {
        this.$message.error('排序失败: ' + error.message)
      }
    },
    
    /**
     * 处理分页变化
     */
    async handlePaginationChange(pagination) {
      try {
        await this.updatePagination(pagination)
        await this.fetchTurnoverList()
      } catch (error) {
        this.$message.error('分页切换失败: ' + error.message)
      }
    },
    
    /**
     * 导出数据
     */
    handleExportData() {
      this.$message.info('导出功能开发中...')
    },
    
    /**
     * 查看详情
     */
    handleViewDetail(row) {
      this.$message.info(`查看商品 ${row.productName} 的详细周转分析`)
      // 可以打开详情弹窗或跳转到详情页
    },
    
    /**
     * 查看商品
     */
    handleViewProduct(row) {
      // 跳转到商品详情页
      this.$router.push({
        name: 'updateProduct',
        query: { id: row.productId }
      })
    },
    
    /**
     * 批量导出
     */
    handleBatchExport(selectedRows) {
      this.$message.info(`批量导出 ${selectedRows.length} 条记录`)
    },
    
    /**
     * 批量分析
     */
    handleBatchAnalysis(selectedRows) {
      this.$message.info(`批量分析 ${selectedRows.length} 条记录`)
    },
    
    /**
     * 快速导出
     */
    handleQuickExport() {
      this.handleExportData()
    },
    
    /**
     * 查看仪表盘
     */
    handleViewDashboard() {
      this.$router.push({ name: 'home' })
    },
    
    /**
     * 查看滞销商品
     */
    handleViewRiskProducts() {
      // 设置筛选条件为滞销风险
      this.handleSearch({
        ...this.filterParams,
        turnoverLevel: 'risk'
      })
    },
    
    /**
     * 格式化周转率
     */
    formatTurnoverRate(value) {
      return TurnoverCalculator.formatNumber(value, 2) + '次'
    },
    
    /**
     * 格式化货币
     */
    formatCurrency(value) {
      return TurnoverCalculator.formatCurrency(value)
    },
    
    /**
     * 更新最后更新时间
     */
    updateLastUpdateTime() {
      const now = new Date()
      this.lastUpdateTime = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.inventory-turnover-report {
  .page-header {
    margin-bottom: 20px;
    
    .page-title {
      font-size: 24px;
      color: #303133;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      
      i {
        margin-right: 8px;
        color: #409EFF;
      }
    }
    
    .page-description {
      color: #909399;
      font-size: 14px;
      margin: 0;
    }
  }
  
  .quick-info-card {
    height: 100%;
    
    .card-header {
      font-weight: bold;
      color: #303133;
    }
    
    .info-section {
      margin-bottom: 24px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .section-title {
        font-size: 14px;
        color: #606266;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        
        i {
          margin-right: 6px;
          color: #409EFF;
        }
      }
    }
    
    .risk-list {
      .risk-item {
        display: flex;
        align-items: center;
        padding: 10px;
        border-radius: 6px;
        margin-bottom: 8px;
        background-color: #FEF0F0;
        border: 1px solid #FBC4C4;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          background-color: #FDE2E2;
          transform: translateX(2px);
        }
        
        .rank {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: #F56C6C;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          margin-right: 12px;
        }
        
        .product-info {
          flex: 1;
          min-width: 0;
          
          .product-name {
            font-size: 13px;
            color: #303133;
            font-weight: 500;
            margin-bottom: 2px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          .product-rate {
            font-size: 11px;
            color: #F56C6C;
          }
        }
        
        .product-value {
          font-size: 12px;
          font-weight: bold;
          color: #303133;
        }
      }
    }
    
    .quick-actions {
      .el-button {
        margin-bottom: 8px;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
    
    .update-time {
      display: flex;
      align-items: center;
      font-size: 12px;
      color: #909399;
      background-color: #F5F7FA;
      padding: 8px 12px;
      border-radius: 4px;
      
      i {
        margin-right: 6px;
      }
    }
  }
}
</style>