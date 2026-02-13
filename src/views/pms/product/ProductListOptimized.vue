<template>
  <div class="app-container">
    <!-- 筛选搜索区域 -->
    <el-card class="filter-container" shadow="never">
      <div>
        <i class="el-icon-search"></i>
        <span>筛选搜索</span>
        <el-button
          style="float: right"
          @click="handleSearchList"
          type="primary"
          size="small">
          查询结果
        </el-button>
        <el-button
          style="float: right;margin-right: 15px"
          @click="handleResetSearch"
          size="small">
          重置
        </el-button>
      </div>
      <div style="margin-top: 15px">
        <search-filter-form 
          :filter-state="filterState"
          :brand-options="brandOptions"
          :product-cate-options="productCateOptions"
          @search="handleSearchList"
          @reset="handleResetSearch"
        />
      </div>
    </el-card>

    <!-- 数据列表区域 -->
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>数据列表</span>
      <el-button
        class="btn-add"
        @click="handleAddProduct"
        size="mini">
        添加
      </el-button>
    </el-card>

    <!-- 优化后的商品表格 -->
    <div class="table-container">
      <optimized-product-table
        :product-list="productList"
        :loading="isProductListLoading"
        :selected-products="selectedProducts"
        @selection-change="handleSelectionChange"
        @status-change="handleStatusChange"
        @show-sku-edit="handleShowSkuEditDialog"
        @show-verify-detail="handleShowVerifyDetail"
        @view-product="handleShowProduct"
        @edit-product="handleUpdateProduct"
        @view-log="handleShowLog"
        @delete-product="handleDelete"
      />
    </div>

    <!-- 批量操作区域 -->
    <batch-operation-panel
      :selected-products="selectedProducts"
      :batch-operations="batchOperations"
      @batch-operate="handleBatchOperate"
    />

    <!-- 分页器 -->
    <div class="pagination-container">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        layout="total, sizes, prev, pager, next, jumper"
        :current-page="pagination.pageNum"
        :page-sizes="[5,10,15,20]"
        :page-size="pagination.pageSize"
        :total="pagination.total">
      </el-pagination>
    </div>

    <!-- SKU编辑弹窗 -->
    <sku-edit-dialog
      :visible="editSkuModalVisible"
      :modal-data="editSkuModalData"
      @close="handleCloseSkuDialog"
      @confirm="handleEditSkuConfirm"
    />

    <!-- 审核详情弹窗 -->
    <verify-detail-dialog
      :visible="verifyDetailModalVisible"
      :modal-data="verifyDetailModalData"
      @close="handleCloseVerifyDialog"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import SearchFilterForm from './components/SearchFilterForm'
import OptimizedProductTable from './components/OptimizedProductTable'
import BatchOperationPanel from './components/BatchOperationPanel'
import SkuEditDialog from './components/SkuEditDialog'
import VerifyDetailDialog from './components/VerifyDetailDialog'

export default {
  name: "ProductListOptimized",
  components: {
    SearchFilterForm,
    OptimizedProductTable,
    BatchOperationPanel,
    SkuEditDialog,
    VerifyDetailDialog
  },
  
  data() {
    return {
      brandOptions: [],
      productCateOptions: []
    }
  },

  computed: {
    ...mapGetters('product', [
      'productList',
      'filterState', 
      'pagination',
      'selectedProducts',
      'batchOperations',
      'hasSelectedProducts'
    ]),
    
    ...mapGetters('ui', [
      'isLoading',
      'getModal'
    ]),
    
    // 加载状态
    isProductListLoading() {
      return this.isLoading('productList')
    },
    
    // SKU编辑弹窗状态
    editSkuModalVisible() {
      return this.getModal('editSku')?.visible || false
    },
    
    editSkuModalData() {
      return this.getModal('editSku') || {}
    },
    
    // 审核详情弹窗状态
    verifyDetailModalVisible() {
      return this.getModal('verifyDetail')?.visible || false
    },
    
    verifyDetailModalData() {
      return this.getModal('verifyDetail') || {}
    }
  },

  async created() {
    // 页面初始化时恢复状态或获取数据
    await this.initializePage()
  },

  beforeDestroy() {
    // 保存页面状态
    this.saveCurrentPageState()
  },

  methods: {
    ...mapActions('product', [
      'fetchProductList',
      'updateProductStatus',
      'batchUpdateProductStatus',
      'searchProducts', 
      'resetSearch',
      'changePage',
      'changePageSize'
    ]),
    
    ...mapActions('ui', [
      'showLoading',
      'hideLoading',
      'showModal',
      'hideModal',
      'handleError'
    ]),
    
    ...mapActions('cache', [
      'getOrSetApiCache',
      'savePageState',
      'restorePageState',
      'preloadResource'
    ]),

    // 初始化页面
    async initializePage() {
      try {
        // 尝试恢复页面状态
        const savedState = await this.restorePageState('productList')
        
        if (savedState) {
          // 如果有保存的状态，恢复它
          this.brandOptions = savedState.brandOptions || []
          this.productCateOptions = savedState.productCateOptions || []
        }
        
        // 并行加载必要数据
        await Promise.all([
          this.loadProductList(),
          this.loadBrandOptions(),
          this.loadProductCateOptions()
        ])
        
        // 预加载相关资源
        this.preloadRelatedResources()
        
      } catch (error) {
        this.handleError(error)
      }
    },

    // 加载商品列表
    async loadProductList() {
      try {
        this.showLoading('productList')
        await this.fetchProductList()
      } finally {
        this.hideLoading('productList')
      }
    },

    // 加载品牌选项（使用缓存）
    async loadBrandOptions() {
      try {
        const brandList = await this.getOrSetApiCache({
          key: 'brandList',
          apiCall: async () => {
            const { fetchList } = await import('@/api/brand')
            const response = await fetchList({ pageNum: 1, pageSize: 100 })
            return response.data.list
          }
        })
        
        this.brandOptions = brandList.map(brand => ({
          label: brand.name,
          value: brand.id
        }))
      } catch (error) {
        console.error('加载品牌列表失败:', error)
      }
    },

    // 加载商品分类选项（使用缓存）
    async loadProductCateOptions() {
      try {
        const categoryList = await this.getOrSetApiCache({
          key: 'productCategoryList',
          apiCall: async () => {
            const { fetchListWithChildren } = await import('@/api/productCate')
            const response = await fetchListWithChildren()
            return response.data
          }
        })
        
        this.productCateOptions = categoryList.map(category => ({
          label: category.name,
          value: category.id,
          children: (category.children || []).map(child => ({
            label: child.name,
            value: child.id
          }))
        }))
      } catch (error) {
        console.error('加载商品分类失败:', error)
      }
    },

    // 预加载相关资源
    preloadRelatedResources() {
      // 预加载下一页数据
      if (this.pagination.pageNum < Math.ceil(this.pagination.total / this.pagination.pageSize)) {
        this.preloadResource({
          key: `productList_page_${this.pagination.pageNum + 1}`,
          apiCall: async () => {
            const { fetchList } = await import('@/api/product')
            return fetchList({
              ...this.filterState,
              pageNum: this.pagination.pageNum + 1
            })
          }
        })
      }
    },

    // 搜索商品
    async handleSearchList() {
      try {
        this.showLoading('productList')
        await this.searchProducts(this.filterState)
        this.preloadRelatedResources()
      } catch (error) {
        this.handleError(error)
      } finally {
        this.hideLoading('productList')
      }
    },

    // 重置搜索
    async handleResetSearch() {
      try {
        this.showLoading('productList')
        await this.resetSearch()
        this.preloadRelatedResources()
      } catch (error) {
        this.handleError(error)
      } finally {
        this.hideLoading('productList')
      }
    },

    // 处理页码变化
    async handleCurrentChange(pageNum) {
      try {
        this.showLoading('productList')
        await this.changePage(pageNum)
        this.preloadRelatedResources()
      } catch (error) {
        this.handleError(error)
      } finally {
        this.hideLoading('productList')
      }
    },

    // 处理页面大小变化
    async handleSizeChange(pageSize) {
      try {
        this.showLoading('productList')
        await this.changePageSize(pageSize)
        this.preloadRelatedResources()
      } catch (error) {
        this.handleError(error)
      } finally {
        this.hideLoading('productList')
      }
    },

    // 处理选择变化
    handleSelectionChange(selection) {
      this.$store.commit('product/SET_SELECTED_PRODUCTS', selection)
    },

    // 处理状态变化（优化版本）
    async handleStatusChange({ index, field, value, row }) {
      try {
        await this.updateProductStatus({
          index,
          field,
          value,
          id: row.id
        })
        
        this.$message({
          message: '状态更新成功',
          type: 'success',
          duration: 1000
        })
      } catch (error) {
        this.handleError(error)
        this.$message({
          message: '状态更新失败',
          type: 'error',
          duration: 2000
        })
      }
    },

    // 批量操作
    async handleBatchOperate(operationType) {
      if (!this.hasSelectedProducts) {
        this.$message({
          message: '请先选择要操作的商品',
          type: 'warning',
          duration: 1000
        })
        return
      }

      try {
        this.showLoading('batchOperation')
        
        // 根据操作类型执行批量更新
        let field, value
        switch (operationType) {
          case 'publishOn':
            field = 'publishStatus'
            value = 1
            break
          case 'publishOff':
            field = 'publishStatus'
            value = 0
            break
          case 'recommendOn':
            field = 'recommandStatus'
            value = 1
            break
          case 'recommendOff':
            field = 'recommandStatus'
            value = 0
            break
          case 'newOn':
            field = 'newStatus'
            value = 1
            break
          case 'newOff':
            field = 'newStatus'
            value = 0
            break
          default:
            throw new Error('未知的操作类型')
        }
        
        await this.batchUpdateProductStatus({ field, value })
        
        this.$message({
          message: '批量操作成功',
          type: 'success',
          duration: 1000
        })
        
        // 清空选择
        this.$store.commit('product/SET_SELECTED_PRODUCTS', [])
        
      } catch (error) {
        this.handleError(error)
        this.$message({
          message: '批量操作失败',
          type: 'error',
          duration: 2000
        })
      } finally {
        this.hideLoading('batchOperation')
      }
    },

    // 显示SKU编辑弹窗
    handleShowSkuEditDialog(index, row) {
      this.showModal({
        modalName: 'editSku',
        data: {
          visible: true,
          productId: row.id,
          productSn: row.productSn,
          productAttributeCategoryId: row.productAttributeCategoryId,
          stockList: [],
          productAttr: [],
          keyword: null
        }
      })
    },

    // 关闭SKU编辑弹窗
    handleCloseSkuDialog() {
      this.hideModal('editSku')
    },

    // 确认SKU编辑
    async handleEditSkuConfirm(skuData) {
      try {
        // 处理SKU更新逻辑
        this.handleCloseSkuDialog()
        this.$message({
          message: 'SKU更新成功',
          type: 'success',
          duration: 1000
        })
      } catch (error) {
        this.handleError(error)
      }
    },

    // 显示审核详情
    handleShowVerifyDetail(index, row) {
      this.showModal({
        modalName: 'verifyDetail',
        data: {
          visible: true,
          product: row
        }
      })
    },

    // 关闭审核详情弹窗
    handleCloseVerifyDialog() {
      this.hideModal('verifyDetail')
    },

    // 添加商品
    handleAddProduct() {
      this.$router.push({ path: '/pms/addProduct' })
    },

    // 查看商品
    handleShowProduct(index, row) {
      this.$router.push({ path: '/pms/updateProduct', query: { id: row.id } })
    },

    // 编辑商品
    handleUpdateProduct(index, row) {
      this.$router.push({ path: '/pms/updateProduct', query: { id: row.id } })
    },

    // 查看日志
    handleShowLog(index, row) {
      console.log('查看商品日志:', row)
    },

    // 删除商品
    async handleDelete(index, row) {
      try {
        await this.$confirm('是否要删除该商品?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        // 删除逻辑
        this.$message({
          message: '删除成功',
          type: 'success',
          duration: 1000
        })
        
        // 刷新列表
        await this.loadProductList()
      } catch (error) {
        if (error !== 'cancel') {
          this.handleError(error)
        }
      }
    },

    // 保存当前页面状态
    saveCurrentPageState() {
      this.savePageState('productList', {
        filterState: this.filterState,
        pagination: this.pagination,
        brandOptions: this.brandOptions,
        productCateOptions: this.productCateOptions
      })
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.filter-container {
  margin-bottom: 20px;
}

.operate-container {
  margin-bottom: 20px;
}

.table-container {
  margin-bottom: 20px;
}

.pagination-container {
  text-align: center;
  margin-top: 20px;
}

.btn-add {
  float: right;
  margin-right: 20px;
}
</style>