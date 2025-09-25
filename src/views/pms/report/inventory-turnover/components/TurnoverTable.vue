<template>
  <el-card class="table-container" shadow="never">
    <div slot="header" class="table-header">
      <div class="header-left">
        <span class="table-title">库存周转率明细</span>
        <span class="total-count">共 {{ pagination.total }} 条记录</span>
      </div>
      <div class="header-right">
        <el-button
          type="primary"
          size="small"
          @click="handleExport"
          :loading="exporting">
          <i class="el-icon-download"></i>
          导出数据
        </el-button>
      </div>
    </div>
    
    <el-table
      ref="turnoverTable"
      :data="tableData"
      v-loading="loading"
      border
      stripe
      style="width: 100%"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      @row-click="handleRowClick"
      :row-class-name="getRowClassName">
      
      <!-- 选择列 -->
      <el-table-column
        type="selection"
        width="55"
        align="center">
      </el-table-column>
      
      <!-- 商品信息 -->
      <el-table-column
        label="商品信息"
        width="300"
        fixed="left">
        <template slot-scope="scope">
          <div class="product-info">
            <div class="product-image">
              <img :src="scope.row.productImage || '/static/default-product.png'" :alt="scope.row.productName">
            </div>
            <div class="product-details">
              <div class="product-name" :title="scope.row.productName">
                {{ scope.row.productName }}
              </div>
              <div class="product-meta">
                <span class="product-code">编码: {{ scope.row.productCode }}</span>
                <span class="product-brand">品牌: {{ scope.row.brandName }}</span>
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
      
      <!-- 商品分类 -->
      <el-table-column
        prop="categoryName"
        label="商品分类"
        width="120"
        align="center">
      </el-table-column>
      
      <!-- 库存信息 -->
      <el-table-column
        label="库存信息"
        width="180">
        <template slot-scope="scope">
          <div class="inventory-info">
            <div class="inventory-item">
              <span class="label">期初:</span>
              <span class="value">{{ formatNumber(scope.row.beginningInventory) }}</span>
            </div>
            <div class="inventory-item">
              <span class="label">期末:</span>
              <span class="value">{{ formatNumber(scope.row.endingInventory) }}</span>
            </div>
            <div class="inventory-item">
              <span class="label">平均:</span>
              <span class="value primary">{{ formatNumber(scope.row.averageInventory) }}</span>
            </div>
          </div>
        </template>
      </el-table-column>
      
      <!-- 销售数据 -->
      <el-table-column
        label="销售数据"
        width="160">
        <template slot-scope="scope">
          <div class="sales-info">
            <div class="sales-item">
              <span class="label">销量:</span>
              <span class="value">{{ formatNumber(scope.row.soldQuantity) }}</span>
            </div>
            <div class="sales-item">
              <span class="label">成本:</span>
              <span class="value">{{ formatCurrency(scope.row.costOfGoodsSold) }}</span>
            </div>
          </div>
        </template>
      </el-table-column>
      
      <!-- 周转率 -->
      <el-table-column
        prop="turnoverRate"
        label="周转率"
        width="120"
        align="center"
        sortable="custom">
        <template slot-scope="scope">
          <div class="turnover-rate">
            <div class="rate-value">{{ formatTurnoverRate(scope.row.turnoverRate) }}</div>
            <el-tag
              :type="getLevelTagType(scope.row.turnoverRate)"
              size="mini"
              effect="light">
              {{ getTurnoverLevel(scope.row.turnoverRate).label }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      
      <!-- 周转天数 -->
      <el-table-column
        prop="turnoverDays"
        label="周转天数"
        width="100"
        align="center"
        sortable="custom">
        <template slot-scope="scope">
          <span class="days-value">{{ scope.row.turnoverDays }}天</span>
        </template>
      </el-table-column>
      
      <!-- 库存价值 -->
      <el-table-column
        prop="inventoryValue"
        label="库存价值"
        width="140"
        align="right"
        sortable="custom">
        <template slot-scope="scope">
          <span class="inventory-value">{{ formatCurrency(scope.row.inventoryValue) }}</span>
        </template>
      </el-table-column>
      
      <!-- 风险等级 -->
      <el-table-column
        label="风险等级"
        width="100"
        align="center">
        <template slot-scope="scope">
          <el-tag
            :type="getRiskTagType(scope.row.turnoverRate)"
            effect="plain">
            {{ getRiskLevel(scope.row.turnoverRate) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <!-- 操作 -->
      <el-table-column
        label="操作"
        width="120"
        align="center"
        fixed="right">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            @click="handleViewDetail(scope.row)">
            详情
          </el-button>
          <el-button
            type="text"
            size="small"
            @click="handleViewProduct(scope.row)">
            商品
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagination.pageNum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        background>
      </el-pagination>
    </div>
    
    <!-- 批量操作 -->
    <div class="batch-operations" v-if="selectedRows.length > 0">
      <div class="batch-info">
        已选择 <span class="selected-count">{{ selectedRows.length }}</span> 项
      </div>
      <div class="batch-actions">
        <el-button size="small" @click="handleBatchExport">批量导出</el-button>
        <el-button size="small" @click="handleBatchAnalysis">批量分析</el-button>
        <el-button size="small" type="text" @click="clearSelection">取消选择</el-button>
      </div>
    </div>
  </el-card>
</template>

<script>
import TurnoverCalculator, { turnoverCalculationMixin } from '@/utils/turnoverCalculator'

export default {
  name: 'TurnoverTable',
  mixins: [turnoverCalculationMixin],
  props: {
    tableData: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    pagination: {
      type: Object,
      default: () => ({
        pageNum: 1,
        pageSize: 20,
        total: 0
      })
    }
  },
  data() {
    return {
      selectedRows: [],
      exporting: false
    }
  },
  methods: {
    /**
     * 格式化数字
     */
    formatNumber(value) {
      return TurnoverCalculator.formatNumber(value, 0)
    },
    
    /**
     * 格式化货币
     */
    formatCurrency(value) {
      return TurnoverCalculator.formatCurrency(value)
    },
    
    /**
     * 格式化周转率
     */
    formatTurnoverRate(value) {
      return TurnoverCalculator.formatNumber(value, 2) + '次'
    },
    
    /**
     * 获取周转率级别
     */
    getTurnoverLevel(rate) {
      return TurnoverCalculator.getTurnoverLevel(rate)
    },
    
    /**
     * 获取级别标签类型
     */
    getLevelTagType(rate) {
      const level = this.getTurnoverLevel(rate).level
      const typeMap = {
        fast: 'success',
        normal: 'primary',
        slow: 'warning',
        risk: 'danger'
      }
      return typeMap[level] || 'info'
    },
    
    /**
     * 获取风险等级
     */
    getRiskLevel(rate) {
      const numRate = parseFloat(rate) || 0
      if (numRate >= 4.0) return '低风险'
      if (numRate >= 2.0) return '中风险'
      if (numRate >= 1.0) return '高风险'
      return '极高风险'
    },
    
    /**
     * 获取风险标签类型
     */
    getRiskTagType(rate) {
      const numRate = parseFloat(rate) || 0
      if (numRate >= 4.0) return 'success'
      if (numRate >= 2.0) return 'primary'
      if (numRate >= 1.0) return 'warning'
      return 'danger'
    },
    
    /**
     * 获取行样式类名
     */
    getRowClassName({ row }) {
      const level = this.getTurnoverLevel(row.turnoverRate).level
      return `turnover-level-${level}`
    },
    
    /**
     * 处理选择变化
     */
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },
    
    /**
     * 处理排序变化
     */
    handleSortChange({ column, prop, order }) {
      const sortOrder = order === 'ascending' ? 'asc' : 'desc'
      this.$emit('sort-change', {
        sortField: prop,
        sortOrder: sortOrder
      })
    },
    
    /**
     * 处理行点击
     */
    handleRowClick(row) {
      this.$emit('row-click', row)
    },
    
    /**
     * 处理页面大小变化
     */
    handleSizeChange(size) {
      this.$emit('pagination-change', {
        pageNum: 1,
        pageSize: size
      })
    },
    
    /**
     * 处理当前页变化
     */
    handleCurrentChange(page) {
      this.$emit('pagination-change', {
        pageNum: page,
        pageSize: this.pagination.pageSize
      })
    },
    
    /**
     * 导出数据
     */
    handleExport() {
      this.exporting = true
      this.$emit('export-data')
      setTimeout(() => {
        this.exporting = false
      }, 2000)
    },
    
    /**
     * 查看详情
     */
    handleViewDetail(row) {
      this.$emit('view-detail', row)
    },
    
    /**
     * 查看商品
     */
    handleViewProduct(row) {
      this.$emit('view-product', row)
    },
    
    /**
     * 批量导出
     */
    handleBatchExport() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请先选择要导出的数据')
        return
      }
      this.$emit('batch-export', this.selectedRows)
    },
    
    /**
     * 批量分析
     */
    handleBatchAnalysis() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请先选择要分析的数据')
        return
      }
      this.$emit('batch-analysis', this.selectedRows)
    },
    
    /**
     * 清除选择
     */
    clearSelection() {
      this.$refs.turnoverTable.clearSelection()
      this.selectedRows = []
    }
  }
}
</script>

<style lang="scss" scoped>
.table-container {
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .header-left {
      display: flex;
      align-items: center;
      
      .table-title {
        font-size: 16px;
        font-weight: bold;
        color: #303133;
        margin-right: 12px;
      }
      
      .total-count {
        font-size: 12px;
        color: #909399;
      }
    }
  }
  
  .product-info {
    display: flex;
    align-items: center;
    
    .product-image {
      width: 40px;
      height: 40px;
      margin-right: 12px;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 4px;
        border: 1px solid #EBEEF5;
      }
    }
    
    .product-details {
      flex: 1;
      min-width: 0;
      
      .product-name {
        font-weight: 500;
        color: #303133;
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .product-meta {
        font-size: 12px;
        color: #909399;
        
        .product-code,
        .product-brand {
          display: block;
          line-height: 1.4;
        }
      }
    }
  }
  
  .inventory-info,
  .sales-info {
    .inventory-item,
    .sales-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      font-size: 12px;
      
      .label {
        color: #909399;
      }
      
      .value {
        color: #303133;
        font-weight: 500;
        
        &.primary {
          color: #409EFF;
        }
      }
    }
  }
  
  .turnover-rate {
    text-align: center;
    
    .rate-value {
      font-size: 16px;
      font-weight: bold;
      color: #303133;
      margin-bottom: 4px;
    }
  }
  
  .days-value {
    font-weight: 500;
    color: #606266;
  }
  
  .inventory-value {
    font-weight: 500;
    color: #303133;
  }
  
  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }
  
  .batch-operations {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border-radius: 6px;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    z-index: 1000;
    
    .batch-info {
      margin-right: 20px;
      font-size: 14px;
      color: #606266;
      
      .selected-count {
        color: #409EFF;
        font-weight: bold;
      }
    }
    
    .batch-actions {
      .el-button {
        margin-left: 8px;
      }
    }
  }
}

// 行级别样式
::v-deep .el-table {
  .turnover-level-fast {
    background-color: #f0f9ff;
  }
  
  .turnover-level-normal {
    background-color: #fafafa;
  }
  
  .turnover-level-slow {
    background-color: #fffbf0;
  }
  
  .turnover-level-risk {
    background-color: #fef0f0;
  }
}
</style>