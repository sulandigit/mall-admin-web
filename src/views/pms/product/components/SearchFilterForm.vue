<template>
  <!-- 使用v-memo优化的搜索筛选表单 -->
  <div v-memo="formMemoDeps" class="search-filter-form">
    <el-form :inline="true" :model="localFilterState" size="small" label-width="140px">
      <!-- 商品名称搜索 -->
      <el-form-item label="输入搜索：">
        <el-input 
          style="width: 203px" 
          v-model="localFilterState.keyword" 
          placeholder="商品名称"
          clearable
          @input="debouncedKeywordChange"
          @clear="handleClear('keyword')"
        />
      </el-form-item>
      
      <!-- 商品货号搜索 -->
      <el-form-item label="商品货号：">
        <el-input 
          style="width: 203px" 
          v-model="localFilterState.productSn" 
          placeholder="商品货号"
          clearable
          @input="debouncedProductSnChange"
          @clear="handleClear('productSn')"
        />
      </el-form-item>
      
      <!-- 商品分类选择 -->
      <el-form-item label="商品分类：">
        <el-cascader
          v-model="selectProductCateValue"
          :options="productCateOptions"
          clearable
          placeholder="请选择分类"
          @change="handleCategoryChange"
          style="width: 203px"
        />
      </el-form-item>
      
      <!-- 商品品牌选择 -->
      <el-form-item label="商品品牌：">
        <el-select 
          v-model="localFilterState.brandId" 
          placeholder="请选择品牌"
          clearable
          style="width: 203px"
          @change="handleBrandChange"
        >
          <el-option
            v-for="item in brandOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      
      <!-- 上架状态选择 -->
      <el-form-item label="上架状态：">
        <el-select 
          v-model="localFilterState.publishStatus" 
          placeholder="请选择状态"
          clearable
          style="width: 203px"
          @change="handlePublishStatusChange"
        >
          <el-option
            v-for="item in publishStatusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      
      <!-- 审核状态选择 -->
      <el-form-item label="审核状态：">
        <el-select 
          v-model="localFilterState.verifyStatus" 
          placeholder="请选择状态"
          clearable
          style="width: 203px"
          @change="handleVerifyStatusChange"
        >
          <el-option
            v-for="item in verifyStatusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { debounce } from '@/utils/debounce'

export default {
  name: 'SearchFilterForm',
  
  props: {
    filterState: {
      type: Object,
      required: true
    },
    brandOptions: {
      type: Array,
      default: () => []
    },
    productCateOptions: {
      type: Array,
      default: () => []
    }
  },
  
  data() {
    return {
      // 本地筛选状态，避免直接修改props
      localFilterState: { ...this.filterState },
      
      // 分类选择器的值
      selectProductCateValue: null,
      
      // 上架状态选项
      publishStatusOptions: [
        { value: 1, label: '上架' },
        { value: 0, label: '下架' }
      ],
      
      // 审核状态选项
      verifyStatusOptions: [
        { value: 1, label: '审核通过' },
        { value: 0, label: '未审核' }
      ],
      
      // 防抖函数
      debouncedKeywordChange: null,
      debouncedProductSnChange: null
    }
  },
  
  computed: {
    // 表单memo依赖 - 只有关键字段变化时才重新渲染
    formMemoDeps() {
      return [
        this.localFilterState.keyword,
        this.localFilterState.productSn,
        this.localFilterState.brandId,
        this.localFilterState.productCategoryId,
        this.localFilterState.publishStatus,
        this.localFilterState.verifyStatus,
        this.brandOptions.length,
        this.productCateOptions.length
      ]
    }
  },
  
  watch: {
    // 监听外部filterState变化
    filterState: {
      handler(newVal) {
        this.localFilterState = { ...newVal }
        this.updateCategoryValue()
      },
      deep: true,
      immediate: true
    },
    
    // 监听分类选择变化
    selectProductCateValue(newVal) {
      if (newVal && newVal.length === 2) {
        this.localFilterState.productCategoryId = newVal[1]
      } else {
        this.localFilterState.productCategoryId = null
      }
    }
  },
  
  created() {
    // 初始化防抖函数
    this.debouncedKeywordChange = debounce(this.handleKeywordChange, 500)
    this.debouncedProductSnChange = debounce(this.handleProductSnChange, 500)
    
    // 初始化分类值
    this.updateCategoryValue()
  },
  
  methods: {
    // 更新分类选择器的值
    updateCategoryValue() {
      if (this.localFilterState.productCategoryId && this.productCateOptions.length > 0) {
        // 查找对应的分类路径
        for (const category of this.productCateOptions) {
          if (category.children) {
            for (const child of category.children) {
              if (child.value === this.localFilterState.productCategoryId) {
                this.selectProductCateValue = [category.value, child.value]
                return
              }
            }
          }
        }
      } else {
        this.selectProductCateValue = null
      }
    },
    
    // 处理关键词变化（防抖）
    handleKeywordChange() {
      this.emitFilterChange('keyword', this.localFilterState.keyword)
    },
    
    // 处理商品货号变化（防抖）
    handleProductSnChange() {
      this.emitFilterChange('productSn', this.localFilterState.productSn)
    },
    
    // 处理分类变化
    handleCategoryChange(value) {
      const categoryId = value && value.length === 2 ? value[1] : null
      this.emitFilterChange('productCategoryId', categoryId)
    },
    
    // 处理品牌变化
    handleBrandChange(value) {
      this.emitFilterChange('brandId', value)
    },
    
    // 处理上架状态变化
    handlePublishStatusChange(value) {
      this.emitFilterChange('publishStatus', value)
    },
    
    // 处理审核状态变化
    handleVerifyStatusChange(value) {
      this.emitFilterChange('verifyStatus', value)
    },
    
    // 处理清空操作
    handleClear(field) {
      this.localFilterState[field] = null
      this.emitFilterChange(field, null)
    },
    
    // 触发筛选变化事件
    emitFilterChange(field, value) {
      const newFilterState = {
        ...this.localFilterState,
        [field]: value,
        pageNum: 1 // 筛选时重置到第一页
      }
      
      this.$emit('filter-change', newFilterState)
    },
    
    // 重置表单
    resetForm() {
      this.localFilterState = {
        keyword: null,
        pageNum: 1,
        pageSize: this.localFilterState.pageSize || 10,
        publishStatus: null,
        verifyStatus: null,
        productSn: null,
        productCategoryId: null,
        brandId: null
      }
      this.selectProductCateValue = null
      this.$emit('reset')
    },
    
    // 获取当前筛选状态
    getFilterState() {
      return { ...this.localFilterState }
    }
  }
}
</script>

<style scoped>
.search-filter-form {
  padding: 15px;
  background-color: #fff;
  border-radius: 4px;
}

.el-form--inline .el-form-item {
  margin-bottom: 15px;
  margin-right: 20px;
}

.el-form-item__label {
  color: #606266;
  font-weight: 500;
}

/* 优化选择器的下拉性能 */
.el-select-dropdown {
  will-change: transform;
}

/* 级联选择器优化 */
.el-cascader-panel {
  will-change: transform;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .el-form--inline .el-form-item {
    margin-right: 10px;
  }
  
  .el-input,
  .el-select,
  .el-cascader {
    width: 180px !important;
  }
}

@media (max-width: 768px) {
  .search-filter-form {
    padding: 10px;
  }
  
  .el-form--inline .el-form-item {
    display: block;
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .el-form-item__label {
    width: 100px !important;
  }
  
  .el-input,
  .el-select,
  .el-cascader {
    width: 100% !important;
    max-width: 250px;
  }
}
</style>