<template>
  <el-card class="table-card">
    <div slot="header" class="table-header">
      <span class="table-title">热销商品TOP10</span>
      <div class="table-controls">
        <el-button 
          size="mini" 
          icon="el-icon-refresh" 
          @click="handleRefresh"
          :loading="loading"
        >
          刷新
        </el-button>
        <el-button 
          size="mini" 
          icon="el-icon-download"
          @click="handleExport"
        >
          导出
        </el-button>
      </div>
    </div>
    
    <el-table 
      :data="tableData" 
      v-loading="loading"
      stripe
      style="width: 100%"
      :row-class-name="tableRowClassName"
    >
      <el-table-column 
        prop="rank" 
        label="排名" 
        width="80"
        align="center"
      >
        <template slot-scope="{ row }">
          <div class="rank-badge" :class="getRankClass(row.rank)">
            {{ row.rank }}
          </div>
        </template>
      </el-table-column>
      
      <el-table-column 
        prop="name" 
        label="商品名称"
        min-width="200"
        show-overflow-tooltip
      >
        <template slot-scope="{ row }">
          <div class="product-info">
            <div class="product-name">{{ row.name }}</div>
            <div class="product-id">ID: {{ row.id }}</div>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column 
        prop="sales" 
        label="销售额" 
        width="120"
        align="right"
        sortable
      >
        <template slot-scope="{ row }">
          <span class="sales-amount">¥{{ row.sales.toLocaleString() }}</span>
        </template>
      </el-table-column>
      
      <el-table-column 
        prop="quantity" 
        label="销量" 
        width="100"
        align="right"
        sortable
      >
        <template slot-scope="{ row }">
          <span class="quantity">{{ row.quantity }}</span>
        </template>
      </el-table-column>
      
      <el-table-column 
        prop="growth" 
        label="增长率" 
        width="120"
        align="right"
        sortable
      >
        <template slot-scope="{ row }">
          <div class="growth-rate" :class="getGrowthClass(row.growth)">
            <i :class="getGrowthIcon(row.growth)"></i>
            {{ Math.abs(row.growth) }}%
          </div>
        </template>
      </el-table-column>
      
      <el-table-column 
        label="趋势图" 
        width="120"
        align="center"
      >
        <template slot-scope="{ row }">
          <div class="trend-chart">
            <span 
              v-for="(value, index) in row.trendData" 
              :key="index"
              class="trend-bar"
              :style="{ height: (value / Math.max(...row.trendData) * 30) + 'px' }"
            ></span>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column 
        label="操作" 
        width="100"
        align="center"
      >
        <template slot-scope="{ row }">
          <el-button 
            type="text" 
            size="small"
            @click="handleViewDetail(row)"
          >
            查看详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <div class="table-footer">
      <div class="summary">
        <span>共 {{ tableData.length }} 件商品</span>
        <span>总销售额: ¥{{ totalSales.toLocaleString() }}</span>
      </div>
      <div class="last-update">
        最后更新: {{ lastUpdateText }}
      </div>
    </div>
  </el-card>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'TopProductsTable',
  
  computed: {
    ...mapState('salesDashboard', ['productPerformance', 'uiState', 'realTimeData']),
    ...mapGetters('salesDashboard', ['topPerformingProducts']),
    
    loading() {
      return this.uiState.loading
    },
    
    tableData() {
      return this.topPerformingProducts.map((product, index) => ({
        ...product,
        rank: index + 1,
        trendData: this.generateTrendData() // 模拟趋势数据
      }))
    },
    
    totalSales() {
      return this.tableData.reduce((sum, item) => sum + item.sales, 0)
    },
    
    lastUpdateText() {
      const lastUpdate = this.realTimeData.lastUpdateTime
      if (!lastUpdate) return '暂无数据'
      
      const date = new Date(lastUpdate)
      return date.toLocaleString('zh-CN')
    }
  },
  
  methods: {
    generateTrendData() {
      // 生成7天的趋势数据
      return Array.from({ length: 7 }, () => Math.floor(Math.random() * 100) + 10)
    },
    
    getRankClass(rank) {
      if (rank <= 3) return `rank-${rank}`
      return 'rank-normal'
    },
    
    getGrowthClass(growth) {
      if (growth > 0) return 'growth-positive'
      if (growth < 0) return 'growth-negative'
      return 'growth-neutral'
    },
    
    getGrowthIcon(growth) {
      if (growth > 0) return 'el-icon-arrow-up'
      if (growth < 0) return 'el-icon-arrow-down'
      return 'el-icon-minus'
    },
    
    tableRowClassName({ row, rowIndex }) {
      if (rowIndex < 3) {
        return 'top-row'
      }
      return ''
    },
    
    handleRefresh() {
      this.$store.dispatch('salesDashboard/fetchProductPerformance')
    },
    
    handleExport() {
      // 导出表格数据
      const csvContent = this.generateCSV()
      this.downloadCSV(csvContent, 'top_products.csv')
    },
    
    generateCSV() {
      const headers = ['排名', '商品名称', '商品ID', '销售额', '销量', '增长率']
      const rows = this.tableData.map(item => [
        item.rank,
        item.name,
        item.id,
        item.sales,
        item.quantity,
        item.growth + '%'
      ])
      
      return [headers, ...rows].map(row => row.join(',')).join('\n')
    },
    
    downloadCSV(content, filename) {
      const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    
    handleViewDetail(row) {
      this.$emit('view-detail', row)
    }
  }
}
</script>

<style lang="scss" scoped>
.table-card {
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .table-title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }
    
    .table-controls {
      display: flex;
      gap: 8px;
    }
  }
  
  .rank-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    font-size: 12px;
    font-weight: bold;
    color: white;
    
    &.rank-1 {
      background: linear-gradient(135deg, #FFD700, #FFA500);
    }
    
    &.rank-2 {
      background: linear-gradient(135deg, #C0C0C0, #A9A9A9);
    }
    
    &.rank-3 {
      background: linear-gradient(135deg, #CD7F32, #A0522D);
    }
    
    &.rank-normal {
      background: #E4E7ED;
      color: #606266;
    }
  }
  
  .product-info {
    .product-name {
      font-size: 14px;
      color: #303133;
      margin-bottom: 2px;
    }
    
    .product-id {
      font-size: 12px;
      color: #909399;
    }
  }
  
  .sales-amount {
    font-weight: 500;
    color: #67C23A;
  }
  
  .quantity {
    font-weight: 500;
    color: #409EFF;
  }
  
  .growth-rate {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    font-weight: 500;
    
    i {
      margin-right: 4px;
      font-size: 12px;
    }
    
    &.growth-positive {
      color: #67C23A;
    }
    
    &.growth-negative {
      color: #F56C6C;
    }
    
    &.growth-neutral {
      color: #E6A23C;
    }
  }
  
  .trend-chart {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    height: 30px;
    gap: 2px;
    
    .trend-bar {
      width: 4px;
      background: #409EFF;
      border-radius: 2px;
      opacity: 0.8;
      transition: all 0.3s ease;
      
      &:hover {
        opacity: 1;
      }
    }
  }
  
  .table-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    border-top: 1px solid #EBEEF5;
    font-size: 12px;
    color: #909399;
    
    .summary {
      display: flex;
      gap: 24px;
      
      span {
        font-weight: 500;
      }
    }
    
    .last-update {
      color: #C0C4CC;
    }
  }
}

:deep(.el-table) {
  .top-row {
    background: linear-gradient(90deg, rgba(64, 158, 255, 0.05), rgba(255, 255, 255, 0));
  }
  
  .el-table__row:hover .trend-bar {
    background: #67C23A;
  }
}

@media (max-width: 768px) {
  .table-card {
    .table-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      
      .table-controls {
        align-self: flex-end;
      }
    }
    
    .table-footer {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      
      .summary {
        flex-direction: column;
        gap: 4px;
      }
    }
  }
}
</style>