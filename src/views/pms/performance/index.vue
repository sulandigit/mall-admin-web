<template>
  <div class="product-performance-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title">
        <h2>商品性能分析报告</h2>
        <p class="page-subtitle">全面分析商品销售表现，优化商品管理策略</p>
      </div>
      <div class="page-actions">
        <el-button 
          type="primary" 
          icon="el-icon-refresh" 
          :loading="isAnyLoading"
          @click="refreshData">
          刷新数据
        </el-button>
        <el-button 
          type="success" 
          icon="el-icon-download"
          @click="showExportDialog = true">
          导出报告
        </el-button>
      </div>
    </div>

    <!-- 筛选控制区域 -->
    <div class="filter-section">
      <performance-filters 
        @filter-change="handleFilterChange"
        :loading="isAnyLoading" />
    </div>

    <!-- 核心指标卡片区域 -->
    <div class="metrics-section">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6" v-for="metric in metricCards" :key="metric.key">
          <metric-card 
            :title="metric.title"
            :value="metric.value"
            :icon="metric.icon"
            :color="metric.color"
            :trend="metric.trend"
            :loading="loading.summary" />
        </el-col>
      </el-row>
    </div>

    <!-- 图表展示区域 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <!-- 销售趋势图表 -->
        <el-col :xs="24" :lg="12">
          <div class="chart-container">
            <sales-trend-chart 
              :data="performanceData.trends"
              :loading="loading.trends"
              :settings="chartSettings.salesTrend" />
          </div>
        </el-col>
        
        <!-- 商品排行图表 -->
        <el-col :xs="24" :lg="12">
          <div class="chart-container">
            <product-ranking-chart 
              :data="performanceData.topProducts"
              :loading="loading.ranking"
              :settings="chartSettings.productRanking"
              @settings-change="updateChartSettings" />
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <!-- 分类分析图表 -->
        <el-col :xs="24" :lg="12">
          <div class="chart-container">
            <category-analysis-chart 
              :data="performanceData.categoryAnalysis"
              :loading="loading.category"
              :settings="chartSettings.categoryDistribution" />
          </div>
        </el-col>
        
        <!-- 库存状态图表 -->
        <el-col :xs="24" :lg="12">
          <div class="chart-container">
            <inventory-status-chart 
              :data="performanceData.inventoryStatus"
              :loading="loading.inventory"
              :settings="chartSettings.inventoryStatus" />
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 数据表格区域 -->
    <div class="table-section">
      <el-card>
        <div slot="header" class="table-header">
          <span>商品详细数据</span>
          <el-button-group>
            <el-button 
              size="small"
              :type="activeTab === 'products' ? 'primary' : ''"
              @click="activeTab = 'products'">
              商品列表
            </el-button>
            <el-button 
              size="small"
              :type="activeTab === 'inventory' ? 'primary' : ''"
              @click="activeTab = 'inventory'">
              库存预警
            </el-button>
          </el-button-group>
        </div>
        
        <!-- 商品数据表格 -->
        <div v-show="activeTab === 'products'">
          <product-performance-table 
            :data="performanceData.topProducts"
            :loading="loading.ranking" />
        </div>
        
        <!-- 库存预警表格 -->
        <div v-show="activeTab === 'inventory'">
          <inventory-warning-table 
            :data="performanceData.inventoryStatus.details"
            :loading="loading.inventory" />
        </div>
      </el-card>
    </div>

    <!-- 导出对话框 -->
    <export-dialog 
      v-model="showExportDialog"
      @export="handleExport" />
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import PerformanceFilters from './components/PerformanceFilters'
import MetricCard from './components/MetricCard'
import SalesTrendChart from './components/SalesTrendChart'
import ProductRankingChart from './components/ProductRankingChart'
import CategoryAnalysisChart from './components/CategoryAnalysisChart'
import InventoryStatusChart from './components/InventoryStatusChart'
import ProductPerformanceTable from './components/ProductPerformanceTable'
import InventoryWarningTable from './components/InventoryWarningTable'
import ExportDialog from './components/ExportDialog'

export default {
  name: 'ProductPerformance',
  components: {
    PerformanceFilters,
    MetricCard,
    SalesTrendChart,
    ProductRankingChart,
    CategoryAnalysisChart,
    InventoryStatusChart,
    ProductPerformanceTable,
    InventoryWarningTable,
    ExportDialog
  },
  data() {
    return {
      activeTab: 'products',
      showExportDialog: false
    }
  },
  computed: {
    ...mapState('productPerformance', [
      'performanceData',
      'chartSettings',
      'loading',
      'error',
      'lastUpdateTime'
    ]),
    ...mapGetters('productPerformance', [
      'formattedSummary',
      'isAnyLoading',
      'inventorySummary'
    ]),
    
    // 指标卡片数据
    metricCards() {
      const summary = this.formattedSummary
      return [
        {
          key: 'sales',
          title: '总销售额',
          value: summary.totalSales,
          icon: 'el-icon-money',
          color: '#409EFF',
          trend: this.calculateTrend('sales')
        },
        {
          key: 'orders',
          title: '订单数量',
          value: summary.totalOrders,
          icon: 'el-icon-shopping-cart-2',
          color: '#67C23A',
          trend: this.calculateTrend('orders')
        },
        {
          key: 'profit',
          title: '利润率',
          value: summary.profitMargin,
          icon: 'el-icon-trophy',
          color: '#E6A23C',
          trend: this.calculateTrend('profit')
        },
        {
          key: 'inventory',
          title: '库存预警',
          value: this.inventorySummary.lowStock + this.inventorySummary.outOfStock,
          icon: 'el-icon-warning',
          color: '#F56C6C',
          trend: null
        }
      ]
    }
  },
  async created() {
    // 初始化数据
    await this.initializeData()
  },
  methods: {
    ...mapActions('productPerformance', [
      'fetchAllPerformanceData',
      'updateFilters',
      'updateChartSettings',
      'fetchBaseData',
      'exportReport',
      'refreshData'
    ]),

    // 初始化数据
    async initializeData() {
      try {
        // 获取基础数据（分类、品牌）
        await this.fetchBaseData()
        
        // 获取所有性能数据
        await this.fetchAllPerformanceData()
      } catch (error) {
        this.$message.error('数据加载失败，请稍后重试')
        console.error('初始化数据失败:', error)
      }
    },

    // 处理筛选条件变化
    async handleFilterChange(filters) {
      try {
        await this.updateFilters(filters)
        this.$message.success('数据已更新')
      } catch (error) {
        this.$message.error('数据更新失败')
        console.error('筛选数据失败:', error)
      }
    },

    // 处理图表设置变化
    handleChartSettingsChange(chartType, settings) {
      this.updateChartSettings({ chartType, settings })
    },

    // 处理导出
    async handleExport({ format, options }) {
      try {
        this.showExportDialog = false
        await this.exportReport({ format, options })
        this.$message.success('报告导出成功')
      } catch (error) {
        this.$message.error('报告导出失败')
        console.error('导出失败:', error)
      }
    },

    // 刷新数据
    async handleRefresh() {
      try {
        await this.refreshData()
        this.$message.success('数据刷新成功')
      } catch (error) {
        this.$message.error('数据刷新失败')
        console.error('刷新失败:', error)
      }
    },

    // 计算趋势（示例实现）
    calculateTrend(type) {
      // 这里应该根据历史数据计算趋势
      // 暂时返回模拟数据
      const trends = {
        sales: { value: 12.5, type: 'up' },
        orders: { value: 8.3, type: 'up' },
        profit: { value: -2.1, type: 'down' }
      }
      return trends[type] || null
    }
  }
}
</script>

<style lang="scss" scoped>
.product-performance-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 84px);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    .page-title {
      h2 {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
        color: #303133;
      }

      .page-subtitle {
        margin: 0;
        color: #909399;
        font-size: 14px;
      }
    }

    .page-actions {
      display: flex;
      gap: 12px;
    }
  }

  .filter-section {
    margin-bottom: 20px;
  }

  .metrics-section {
    margin-bottom: 20px;
  }

  .charts-section {
    margin-bottom: 20px;

    .chart-container {
      height: 400px;
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }

  .table-section {
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .product-performance-container {
    padding: 10px;

    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;

      .page-actions {
        width: 100%;
        justify-content: flex-end;
      }
    }

    .charts-section {
      .chart-container {
        height: 300px;
        padding: 15px;
      }
    }
  }
}

@media (max-width: 480px) {
  .product-performance-container {
    .page-header {
      .page-actions {
        flex-direction: column;
        width: 100%;

        .el-button {
          width: 100%;
        }
      }
    }

    .charts-section {
      .chart-container {
        height: 250px;
        padding: 10px;
      }
    }
  }
}
</style>