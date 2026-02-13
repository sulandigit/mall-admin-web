<template>
  <el-table 
    ref="productTable"
    :data="productList"
    style="width: 100%"
    @selection-change="handleSelectionChange"
    v-loading="loading"
    border
    row-key="id"
    :default-sort="{prop: 'id', order: 'descending'}"
  >
    <!-- 选择框列 -->
    <el-table-column type="selection" width="60" align="center" />
    
    <!-- 编号列 -->
    <el-table-column label="编号" width="100" align="center" prop="id" sortable />
    
    <!-- 商品图片列 - 使用v-memo优化 -->
    <el-table-column label="商品图片" width="120" align="center">
      <template slot-scope="scope">
        <product-image-cell
          :product="scope.row"
          :memo-deps="[scope.row.id, scope.row.pic]"
        />
      </template>
    </el-table-column>
    
    <!-- 商品名称列 - 使用v-memo优化 -->
    <el-table-column label="商品名称" align="center">
      <template slot-scope="scope">
        <product-name-cell
          :product="scope.row"
          :memo-deps="[scope.row.id, scope.row.name, scope.row.brandName]"
        />
      </template>
    </el-table-column>
    
    <!-- 价格/货号列 - 使用v-memo优化 -->
    <el-table-column label="价格/货号" width="120" align="center">
      <template slot-scope="scope">
        <product-price-cell
          :product="scope.row"
          :memo-deps="[scope.row.id, scope.row.price, scope.row.productSn]"
        />
      </template>
    </el-table-column>
    
    <!-- 状态标签列 - 核心优化区域 -->
    <el-table-column label="标签" width="140" align="center">
      <template slot-scope="scope">
        <product-status-switches
          :product="scope.row"
          :index="scope.$index"
          :memo-deps="[
            scope.row.id, 
            scope.row.publishStatus, 
            scope.row.newStatus, 
            scope.row.recommandStatus
          ]"
          @status-change="handleStatusChange"
        />
      </template>
    </el-table-column>
    
    <!-- 排序列 -->
    <el-table-column label="排序" width="100" align="center" prop="sort" sortable />
    
    <!-- SKU库存列 -->
    <el-table-column label="SKU库存" width="100" align="center">
      <template slot-scope="scope">
        <sku-stock-cell
          :product="scope.row"
          :memo-deps="[scope.row.id]"
          @show-sku-edit="handleShowSkuEdit"
        />
      </template>
    </el-table-column>
    
    <!-- 销量列 -->
    <el-table-column label="销量" width="100" align="center" prop="sale" sortable />
    
    <!-- 审核状态列 -->
    <el-table-column label="审核状态" width="100" align="center">
      <template slot-scope="scope">
        <verify-status-cell
          :product="scope.row"
          :memo-deps="[scope.row.id, scope.row.verifyStatus]"
          @show-verify-detail="handleShowVerifyDetail"
        />
      </template>
    </el-table-column>
    
    <!-- 操作列 -->
    <el-table-column label="操作" width="160" align="center" fixed="right">
      <template slot-scope="scope">
        <product-action-buttons
          :product="scope.row"
          :index="scope.$index"
          :memo-deps="[scope.row.id, scope.row.verifyStatus]"
          @view="handleViewProduct"
          @edit="handleEditProduct"
          @log="handleViewLog"
          @delete="handleDeleteProduct"
        />
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import ProductImageCell from './ProductImageCell'
import ProductNameCell from './ProductNameCell'
import ProductPriceCell from './ProductPriceCell'
import ProductStatusSwitches from './ProductStatusSwitches'
import SkuStockCell from './SkuStockCell'
import VerifyStatusCell from './VerifyStatusCell'
import ProductActionButtons from './ProductActionButtons'

export default {
  name: 'OptimizedProductTable',
  
  components: {
    ProductImageCell,
    ProductNameCell,
    ProductPriceCell,
    ProductStatusSwitches,
    SkuStockCell,
    VerifyStatusCell,
    ProductActionButtons
  },
  
  props: {
    productList: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    selectedProducts: {
      type: Array,
      default: () => []
    }
  },
  
  methods: {
    // 选择变化处理
    handleSelectionChange(selection) {
      this.$emit('selection-change', selection)
    },
    
    // 状态变化处理
    handleStatusChange(payload) {
      this.$emit('status-change', payload)
    },
    
    // SKU编辑
    handleShowSkuEdit(payload) {
      this.$emit('show-sku-edit', payload.index, payload.product)
    },
    
    // 审核详情
    handleShowVerifyDetail(payload) {
      this.$emit('show-verify-detail', payload.index, payload.product)
    },
    
    // 查看商品
    handleViewProduct(payload) {
      this.$emit('view-product', payload.index, payload.product)
    },
    
    // 编辑商品
    handleEditProduct(payload) {
      this.$emit('edit-product', payload.index, payload.product)
    },
    
    // 查看日志
    handleViewLog(payload) {
      this.$emit('view-log', payload.index, payload.product)
    },
    
    // 删除商品
    handleDeleteProduct(payload) {
      this.$emit('delete-product', payload.index, payload.product)
    }
  }
}
</script>

<style scoped>
.el-table {
  font-size: 14px;
}

.el-table th {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 500;
}

.el-table td {
  padding: 8px 0;
}

/* 优化表格滚动性能 */
.el-table__body-wrapper {
  will-change: transform;
}

/* 优化固定列性能 */
.el-table__fixed {
  will-change: transform;
}
</style>