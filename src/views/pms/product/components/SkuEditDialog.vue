<template>
  <el-dialog
    title="编辑SKU库存"
    :visible.sync="dialogVisible"
    width="80%"
    :before-close="handleClose"
    append-to-body
  >
    <div class="sku-edit-dialog">
      <!-- 商品信息 -->
      <div class="product-info">
        <h4>商品信息</h4>
        <p><strong>商品货号：</strong>{{ modalData.productSn }}</p>
        <p><strong>商品ID：</strong>{{ modalData.productId }}</p>
      </div>
      
      <!-- 搜索区域 -->
      <div class="search-section">
        <el-input
          v-model="searchKeyword"
          placeholder="输入规格进行搜索"
          size="small"
          style="width: 200px"
          @input="handleSearch"
          clearable
        >
          <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
        </el-input>
      </div>
      
      <!-- SKU列表表格 -->
      <div class="sku-table">
        <el-table
          :data="filteredStockList"
          v-loading="loading"
          border
          max-height="400"
        >
          <el-table-column label="规格" width="200">
            <template slot-scope="scope">
              <div class="sku-spec">
                <span 
                  v-for="(spec, index) in getSkuSpecs(scope.row)" 
                  :key="index"
                  class="spec-item"
                >
                  {{ spec }}
                </span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="SKU编码" prop="skuCode" width="150" />
          
          <el-table-column label="销售价格" width="120">
            <template slot-scope="scope">
              <el-input
                v-model="scope.row.price"
                size="mini"
                type="number"
                :min="0"
                :step="0.01"
              />
            </template>
          </el-table-column>
          
          <el-table-column label="促销价格" width="120">
            <template slot-scope="scope">
              <el-input
                v-model="scope.row.promotionPrice"
                size="mini"
                type="number"
                :min="0"
                :step="0.01"
              />
            </template>
          </el-table-column>
          
          <el-table-column label="库存" width="100">
            <template slot-scope="scope">
              <el-input
                v-model="scope.row.stock"
                size="mini"
                type="number"
                :min="0"
              />
            </template>
          </el-table-column>
          
          <el-table-column label="预警库存" width="120">
            <template slot-scope="scope">
              <el-input
                v-model="scope.row.lowStock"
                size="mini"
                type="number"
                :min="0"
              />
            </template>
          </el-table-column>
          
          <el-table-column label="锁定库存" width="120">
            <template slot-scope="scope">
              <span>{{ scope.row.lockStock || 0 }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 批量操作 -->
      <div class="batch-operations">
        <el-divider content-position="left">批量操作</el-divider>
        <div class="batch-controls">
          <div class="batch-item">
            <label>批量设置价格：</label>
            <el-input
              v-model="batchPrice"
              size="small"
              type="number"
              :min="0"
              :step="0.01"
              style="width: 120px"
            />
            <el-button size="small" @click="batchSetPrice">应用</el-button>
          </div>
          
          <div class="batch-item">
            <label>批量设置库存：</label>
            <el-input
              v-model="batchStock"
              size="small"
              type="number"
              :min="0"
              style="width: 120px"
            />
            <el-button size="small" @click="batchSetStock">应用</el-button>
          </div>
        </div>
      </div>
    </div>
    
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm" :loading="submitting">
        确定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { debounce } from '@/utils/debounce'

export default {
  name: 'SkuEditDialog',
  
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    modalData: {
      type: Object,
      default: () => ({})
    }
  },
  
  data() {
    return {
      dialogVisible: false,
      loading: false,
      submitting: false,
      searchKeyword: '',
      stockList: [],
      batchPrice: null,
      batchStock: null,
      
      // 防抖搜索函数
      debouncedSearch: null
    }
  },
  
  computed: {
    // 过滤后的SKU列表
    filteredStockList() {
      if (!this.searchKeyword) {
        return this.stockList
      }
      
      const keyword = this.searchKeyword.toLowerCase()
      return this.stockList.filter(item => {
        const specs = this.getSkuSpecs(item)
        return specs.some(spec => spec.toLowerCase().includes(keyword)) ||
               (item.skuCode && item.skuCode.toLowerCase().includes(keyword))
      })
    }
  },
  
  watch: {
    visible(newVal) {
      this.dialogVisible = newVal
      if (newVal) {
        this.initDialog()
      }
    },
    
    dialogVisible(newVal) {
      if (!newVal) {
        this.$emit('close')
      }
    }
  },
  
  created() {
    // 初始化防抖搜索
    this.debouncedSearch = debounce(this.performSearch, 300)
  },
  
  methods: {
    // 初始化对话框
    async initDialog() {
      if (this.modalData.productId) {
        await this.loadSkuStock()
      }
    },
    
    // 加载SKU库存数据
    async loadSkuStock() {
      this.loading = true
      
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 这里应该调用实际的API
        // const response = await fetchSkuStockList(this.modalData.productId, {
        //   keyword: this.modalData.keyword
        // })
        // this.stockList = response.data
        
        // 模拟数据
        this.stockList = this.generateMockSkuData()
        
      } catch (error) {
        this.$message.error('加载SKU数据失败')
        console.error('Load SKU stock failed:', error)
      } finally {
        this.loading = false
      }
    },
    
    // 生成模拟SKU数据
    generateMockSkuData() {
      const colors = ['红色', '蓝色', '黑色', '白色']
      const sizes = ['S', 'M', 'L', 'XL']
      const mockData = []
      
      colors.forEach(color => {
        sizes.forEach(size => {
          mockData.push({
            id: `${color}-${size}`,
            skuCode: `SKU-${color}-${size}`,
            spData: JSON.stringify([
              { key: '颜色', value: color },
              { key: '尺寸', value: size }
            ]),
            price: (Math.random() * 100 + 50).toFixed(2),
            promotionPrice: (Math.random() * 80 + 40).toFixed(2),
            stock: Math.floor(Math.random() * 100),
            lowStock: Math.floor(Math.random() * 20),
            lockStock: Math.floor(Math.random() * 10)
          })
        })
      })
      
      return mockData
    },
    
    // 获取SKU规格
    getSkuSpecs(row) {
      if (!row.spData) return []
      
      try {
        const spData = JSON.parse(row.spData)
        return spData.map(item => `${item.key}: ${item.value}`)
      } catch {
        return []
      }
    },
    
    // 处理搜索
    handleSearch() {
      this.debouncedSearch()
    },
    
    // 执行搜索
    performSearch() {
      // 搜索逻辑已在computed中处理
      console.log('搜索关键词:', this.searchKeyword)
    },
    
    // 批量设置价格
    batchSetPrice() {
      if (this.batchPrice === null || this.batchPrice === '') {
        this.$message.warning('请输入批量设置的价格')
        return
      }
      
      this.filteredStockList.forEach(item => {
        item.price = this.batchPrice
      })
      
      this.$message.success('批量设置价格成功')
      this.batchPrice = null
    },
    
    // 批量设置库存
    batchSetStock() {
      if (this.batchStock === null || this.batchStock === '') {
        this.$message.warning('请输入批量设置的库存')
        return
      }
      
      this.filteredStockList.forEach(item => {
        item.stock = this.batchStock
      })
      
      this.$message.success('批量设置库存成功')
      this.batchStock = null
    },
    
    // 处理确认
    async handleConfirm() {
      if (this.stockList.length === 0) {
        this.$message.warning('暂无SKU信息')
        return
      }
      
      this.submitting = true
      
      try {
        // 这里应该调用实际的更新API
        // await updateSkuStockList(this.modalData.productId, this.stockList)
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        this.$message.success('SKU信息更新成功')
        this.$emit('confirm', this.stockList)
        this.handleClose()
        
      } catch (error) {
        this.$message.error('SKU信息更新失败')
        console.error('Update SKU stock failed:', error)
      } finally {
        this.submitting = false
      }
    },
    
    // 处理关闭
    handleClose() {
      this.dialogVisible = false
      this.resetDialog()
    },
    
    // 重置对话框
    resetDialog() {
      this.searchKeyword = ''
      this.stockList = []
      this.batchPrice = null
      this.batchStock = null
      this.loading = false
      this.submitting = false
    }
  }
}
</script>

<style scoped>
.sku-edit-dialog {
  max-height: 70vh;
  overflow-y: auto;
}

.product-info {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.product-info h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 16px;
}

.product-info p {
  margin: 8px 0;
  color: #606266;
  font-size: 14px;
}

.search-section {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;
}

.sku-table {
  margin-bottom: 20px;
}

.sku-spec {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.spec-item {
  background-color: #e1f3d8;
  color: #67c23a;
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 12px;
  display: inline-block;
}

.batch-operations {
  margin-top: 20px;
}

.batch-controls {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.batch-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.batch-item label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .batch-controls {
    flex-direction: column;
    gap: 12px;
  }
  
  .batch-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .sku-edit-dialog {
    max-height: 60vh;
  }
}

/* 表格优化 */
.el-table {
  font-size: 12px;
}

.el-table .el-input__inner {
  font-size: 12px;
  padding: 4px 8px;
}

/* 滚动条样式 */
.sku-edit-dialog::-webkit-scrollbar {
  width: 6px;
}

.sku-edit-dialog::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.sku-edit-dialog::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.sku-edit-dialog::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>