<template>
  <div class="product-performance-table">
    <el-table
      :data="data"
      v-loading="loading"
      stripe
      border
      :height="tableHeight"
      @sort-change="onSortChange"
      :default-sort="{prop: 'sales', order: 'descending'}">
      
      <el-table-column
        type="index"
        label="排名"
        width="60"
        align="center">
        <template slot-scope="scope">
          <span class="rank-badge" :class="getRankClass(scope.$index + 1)">
            {{ scope.$index + 1 }}
          </span>
        </template>
      </el-table-column>

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
        prop="categoryName"
        label="分类"
        width="120"
        show-overflow-tooltip>
      </el-table-column>

      <el-table-column
        prop="brandName"
        label="品牌"
        width="120"
        show-overflow-tooltip>
      </el-table-column>

      <el-table-column
        prop="sales"
        label="销售额"
        width="120"
        sortable="custom"
        align="right">
        <template slot-scope="scope">
          <span class="amount-text">¥{{ formatNumber(scope.row.sales) }}</span>
        </template>
      </el-table-column>

      <el-table-column
        prop="quantity"
        label="销售数量"
        width="120"
        sortable="custom"
        align="right">
        <template slot-scope="scope">
          <span class="quantity-text">{{ formatNumber(scope.row.quantity) }}件</span>
        </template>
      </el-table-column>

      <el-table-column
        prop="profit"
        label="利润额"
        width="120"
        sortable="custom"
        align="right">
        <template slot-scope="scope">
          <span class="profit-text">¥{{ formatNumber(scope.row.profit) }}</span>
        </template>
      </el-table-column>

      <el-table-column
        prop="profitRate"
        label="利润率"
        width="100"
        sortable="custom"
        align="center">
        <template slot-scope="scope">
          <el-tag 
            :type="getProfitRateType(scope.row.profitRate)"
            size="small">
            {{ (scope.row.profitRate * 100).toFixed(2) }}%
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        prop="returnRate"
        label="退货率"
        width="100"
        sortable="custom"
        align="center">
        <template slot-scope="scope">
          <el-tag 
            :type="getReturnRateType(scope.row.returnRate)"
            size="small">
            {{ (scope.row.returnRate * 100).toFixed(2) }}%
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        width="120"
        fixed="right">
        <template slot-scope="scope">
          <el-button 
            type="text" 
            size="small"
            @click="viewDetail(scope.row)">
            查看详情
          </el-button>
          <el-button 
            type="text" 
            size="small"
            @click="viewAnalysis(scope.row)">
            深度分析
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="table-pagination" v-if="showPagination">
      <el-pagination
        @size-change="onSizeChange"
        @current-change="onCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper">
      </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductPerformanceTable',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    showPagination: {
      type: Boolean,
      default: false
    },
    total: {
      type: Number,
      default: 0
    },
    tableHeight: {
      type: [String, Number],
      default: 400
    }
  },
  data() {
    return {
      currentPage: 1,
      pageSize: 10
    }
  },
  methods: {
    // 格式化数字
    formatNumber(num) {
      if (num >= 10000) {
        return (num / 10000).toFixed(2) + '万'
      }
      return num.toLocaleString()
    },

    // 获取排名样式
    getRankClass(rank) {
      if (rank === 1) return 'rank-first'
      if (rank === 2) return 'rank-second'
      if (rank === 3) return 'rank-third'
      return 'rank-normal'
    },

    // 获取利润率标签类型
    getProfitRateType(rate) {
      if (rate >= 0.3) return 'success'
      if (rate >= 0.2) return 'warning'
      return 'danger'
    },

    // 获取退货率标签类型
    getReturnRateType(rate) {
      if (rate <= 0.02) return 'success'
      if (rate <= 0.05) return 'warning'
      return 'danger'
    },

    // 排序变化
    onSortChange({ prop, order }) {
      this.$emit('sort-change', { prop, order })
    },

    // 页面大小变化
    onSizeChange(size) {
      this.pageSize = size
      this.$emit('pagination-change', { page: this.currentPage, size })
    },

    // 当前页变化
    onCurrentChange(page) {
      this.currentPage = page
      this.$emit('pagination-change', { page, size: this.pageSize })
    },

    // 查看详情
    viewDetail(row) {
      this.$emit('view-detail', row)
    },

    // 查看分析
    viewAnalysis(row) {
      this.$emit('view-analysis', row)
    }
  }
}
</script>

<style lang="scss" scoped>
.product-performance-table {
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

  .rank-badge {
    display: inline-block;
    width: 24px;
    height: 24px;
    line-height: 24px;
    border-radius: 50%;
    text-align: center;
    font-weight: bold;
    font-size: 12px;

    &.rank-first {
      background-color: #ff6b6b;
      color: white;
    }

    &.rank-second {
      background-color: #4ecdc4;
      color: white;
    }

    &.rank-third {
      background-color: #ffe066;
      color: #333;
    }

    &.rank-normal {
      background-color: #f5f7fa;
      color: #909399;
    }
  }

  .amount-text {
    font-weight: 600;
    color: #409eff;
  }

  .quantity-text {
    font-weight: 500;
    color: #67c23a;
  }

  .profit-text {
    font-weight: 600;
    color: #e6a23c;
  }

  .table-pagination {
    margin-top: 20px;
    text-align: right;
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
  .product-performance-table {
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

    .rank-badge {
      width: 20px;
      height: 20px;
      line-height: 20px;
      font-size: 11px;
    }

    .table-pagination {
      text-align: center;
    }
  }
}
</style>