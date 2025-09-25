<template>
  <div class="inventory-warning-table">
    <el-table
      :data="data"
      v-loading="loading"
      stripe
      border
      :height="tableHeight">
      
      <el-table-column
        prop="productName"
        label="商品名称"
        min-width="200"
        show-overflow-tooltip>
        <template slot-scope="scope">
          <div class="product-info">
            <img 
              v-if="scope.row.productImage" 
              :src="scope.row.productImage" 
              :alt="scope.row.productName"
              class="product-image">
            <div class="product-details">
              <div class="product-name">{{ scope.row.productName }}</div>
              <div class="product-sku">{{ scope.row.productSku }}</div>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        prop="currentStock"
        label="当前库存"
        width="120"
        align="right">
        <template slot-scope="scope">
          <span :class="getStockClass(scope.row)">{{ scope.row.currentStock }}</span>
        </template>
      </el-table-column>

      <el-table-column
        prop="safetyStock"
        label="安全库存"
        width="120"
        align="right">
        <template slot-scope="scope">
          <span class="safety-stock">{{ scope.row.safetyStock }}</span>
        </template>
      </el-table-column>

      <el-table-column
        prop="status"
        label="库存状态"
        width="120"
        align="center">
        <template slot-scope="scope">
          <el-tag :type="getStatusType(scope.row.status)" size="small">
            {{ getStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        prop="lastSaleDate"
        label="最后销售日期"
        width="140"
        align="center">
        <template slot-scope="scope">
          <span class="sale-date">{{ formatDate(scope.row.lastSaleDate) }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="滞销天数"
        width="100"
        align="center">
        <template slot-scope="scope">
          <span :class="getSlowMovingClass(scope.row)">
            {{ calculateSlowMovingDays(scope.row.lastSaleDate) }}天
          </span>
        </template>
      </el-table-column>

      <el-table-column
        label="建议操作"
        width="120"
        align="center">
        <template slot-scope="scope">
          <el-tag 
            :type="getActionType(scope.row)"
            size="small">
            {{ getActionLabel(scope.row) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        width="150"
        fixed="right">
        <template slot-scope="scope">
          <el-button 
            type="text" 
            size="small"
            @click="adjustStock(scope.row)">
            调整库存
          </el-button>
          <el-button 
            type="text" 
            size="small"
            @click="viewHistory(scope.row)">
            库存记录
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 批量操作 -->
    <div class="batch-actions" v-if="selectedRows.length > 0">
      <el-alert
        :title="`已选择 ${selectedRows.length} 个商品`"
        type="info"
        show-icon
        :closable="false">
        <template slot="description">
          <el-button size="small" @click="batchAdjustStock">批量调整库存</el-button>
          <el-button size="small" @click="exportWarningList">导出预警清单</el-button>
        </template>
      </el-alert>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InventoryWarningTable',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    tableHeight: {
      type: [String, Number],
      default: 400
    }
  },
  data() {
    return {
      selectedRows: []
    }
  },
  methods: {
    // 获取库存数量样式
    getStockClass(row) {
      if (row.status === 'out_of_stock') return 'stock-out'
      if (row.status === 'low_stock') return 'stock-low'
      return 'stock-normal'
    },

    // 获取状态类型
    getStatusType(status) {
      const types = {
        'normal_stock': 'success',
        'low_stock': 'warning',
        'out_of_stock': 'danger',
        'over_stock': 'info'
      }
      return types[status] || 'info'
    },

    // 获取状态标签
    getStatusLabel(status) {
      const labels = {
        'normal_stock': '正常',
        'low_stock': '库存预警',
        'out_of_stock': '库存不足',
        'over_stock': '库存过量'
      }
      return labels[status] || '未知'
    },

    // 获取滞销天数样式
    getSlowMovingClass(row) {
      const days = this.calculateSlowMovingDays(row.lastSaleDate)
      if (days > 90) return 'slow-moving-critical'
      if (days > 60) return 'slow-moving-warning'
      if (days > 30) return 'slow-moving-normal'
      return 'moving-active'
    },

    // 计算滞销天数
    calculateSlowMovingDays(lastSaleDate) {
      if (!lastSaleDate) return 0
      const lastSale = new Date(lastSaleDate)
      const now = new Date()
      const diffTime = Math.abs(now - lastSale)
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    },

    // 获取建议操作类型
    getActionType(row) {
      if (row.status === 'out_of_stock') return 'danger'
      if (row.status === 'low_stock') return 'warning'
      if (row.status === 'over_stock') return 'info'
      return 'success'
    },

    // 获取建议操作标签
    getActionLabel(row) {
      const days = this.calculateSlowMovingDays(row.lastSaleDate)
      
      if (row.status === 'out_of_stock') return '紧急补货'
      if (row.status === 'low_stock') return '预警补货'
      if (row.status === 'over_stock' || days > 90) return '促销清库'
      if (days > 60) return '关注销售'
      return '正常销售'
    },

    // 格式化日期
    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleDateString()
    },

    // 调整库存
    adjustStock(row) {
      this.$emit('adjust-stock', row)
    },

    // 查看库存记录
    viewHistory(row) {
      this.$emit('view-history', row)
    },

    // 批量调整库存
    batchAdjustStock() {
      this.$emit('batch-adjust-stock', this.selectedRows)
    },

    // 导出预警清单
    exportWarningList() {
      this.$emit('export-warning-list', this.selectedRows)
    }
  }
}
</script>

<style lang="scss" scoped>
.inventory-warning-table {
  .product-info {
    display: flex;
    align-items: center;
    gap: 10px;

    .product-image {
      width: 40px;
      height: 40px;
      border-radius: 4px;
      object-fit: cover;
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

      .product-sku {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .stock-out {
    color: #f56c6c;
    font-weight: bold;
  }

  .stock-low {
    color: #e6a23c;
    font-weight: bold;
  }

  .stock-normal {
    color: #67c23a;
    font-weight: 500;
  }

  .safety-stock {
    color: #909399;
  }

  .sale-date {
    color: #606266;
    font-size: 12px;
  }

  .slow-moving-critical {
    color: #f56c6c;
    font-weight: bold;
  }

  .slow-moving-warning {
    color: #e6a23c;
    font-weight: bold;
  }

  .slow-moving-normal {
    color: #409eff;
  }

  .moving-active {
    color: #67c23a;
  }

  .batch-actions {
    margin-top: 15px;
  }
}

// 自定义表格样式
:deep(.el-table) {
  .el-table__header-wrapper {
    .el-table__header {
      th {
        background-color: #fafafa;
        color: #606266;
        font-weight: 600;
      }
    }
  }

  .el-table__body-wrapper {
    .el-table__row {
      &:hover {
        background-color: #f5f7fa;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .inventory-warning-table {
    .product-info {
      .product-image {
        width: 32px;
        height: 32px;
      }

      .product-details {
        .product-name {
          font-size: 13px;
        }

        .product-sku {
          font-size: 11px;
        }
      }
    }
  }
}
</style>