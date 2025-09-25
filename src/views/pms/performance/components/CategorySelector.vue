<template>
  <div class="category-selector">
    <el-select
      v-model="selectedCategories"
      multiple
      collapse-tags
      placeholder="选择商品分类"
      @change="onChange"
      :disabled="disabled"
      style="width: 100%"
      :loading="loading">
      
      <el-option-group
        v-for="parentCategory in categoryTree"
        :key="parentCategory.id"
        :label="parentCategory.name">
        
        <!-- 父分类选项 -->
        <el-option
          :label="parentCategory.name"
          :value="parentCategory.id"
          :disabled="hasChildren(parentCategory)">
          <span style="font-weight: bold;">{{ parentCategory.name }}</span>
        </el-option>
        
        <!-- 子分类选项 -->
        <el-option
          v-for="childCategory in parentCategory.children"
          :key="childCategory.id"
          :label="childCategory.name"
          :value="childCategory.id">
          <span style="margin-left: 20px;">{{ childCategory.name }}</span>
          <span style="float: right; color: #8492a6; font-size: 12px;">
            {{ childCategory.productCount || 0 }}个商品
          </span>
        </el-option>
      </el-option-group>
    </el-select>

    <!-- 快速选择按钮 -->
    <div class="quick-actions" style="margin-top: 8px;">
      <el-button-group>
        <el-button 
          size="mini" 
          @click="selectAll"
          :disabled="disabled || loading">
          全选
        </el-button>
        <el-button 
          size="mini" 
          @click="clearAll"
          :disabled="disabled || loading">
          清空
        </el-button>
        <el-button 
          size="mini" 
          @click="selectHot"
          :disabled="disabled || loading">
          热门分类
        </el-button>
      </el-button-group>
    </div>

    <!-- 已选分类显示 -->
    <div v-if="selectedCategories.length > 0" class="selected-categories" style="margin-top: 8px;">
      <div class="selected-header">
        <span class="selected-count">已选择 {{ selectedCategories.length }} 个分类</span>
        <el-button 
          type="text" 
          size="mini" 
          @click="showSelectedDetail = !showSelectedDetail"
          :disabled="disabled">
          {{ showSelectedDetail ? '收起' : '展开' }}
        </el-button>
      </div>
      
      <el-collapse-transition>
        <div v-show="showSelectedDetail" class="selected-detail">
          <el-tag
            v-for="categoryId in selectedCategories"
            :key="categoryId"
            closable
            size="small"
            @close="removeCategory(categoryId)"
            style="margin: 2px;">
            {{ getCategoryName(categoryId) }}
          </el-tag>
        </div>
      </el-collapse-transition>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'CategorySelector',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedCategories: [],
      showSelectedDetail: false,
      loading: false
    }
  },
  computed: {
    ...mapState('productPerformance', ['categories']),
    
    // 构建分类树结构
    categoryTree() {
      if (!this.categories || this.categories.length === 0) {
        return []
      }
      
      // 假设categories是扁平结构，需要构建树形结构
      const tree = []
      const categoryMap = new Map()
      
      // 先创建所有分类的映射
      this.categories.forEach(category => {
        categoryMap.set(category.id, {
          ...category,
          children: []
        })
      })
      
      // 构建树形结构
      this.categories.forEach(category => {
        if (category.parentId === 0 || !category.parentId) {
          // 顶级分类
          tree.push(categoryMap.get(category.id))
        } else {
          // 子分类
          const parent = categoryMap.get(category.parentId)
          if (parent) {
            parent.children.push(categoryMap.get(category.id))
          }
        }
      })
      
      return tree
    },
    
    // 所有分类的平铺列表
    allCategories() {
      const result = []
      const traverse = (categories) => {
        categories.forEach(category => {
          result.push(category)
          if (category.children && category.children.length > 0) {
            traverse(category.children)
          }
        })
      }
      traverse(this.categoryTree)
      return result
    },
    
    // 热门分类（假设根据商品数量判断）
    hotCategories() {
      return this.allCategories
        .filter(category => category.productCount > 10)
        .slice(0, 5)
        .map(category => category.id)
    }
  },
  watch: {
    value: {
      handler(newVal) {
        this.selectedCategories = newVal || []
      },
      immediate: true
    },
    
    categories: {
      handler(newCategories) {
        if (newCategories && newCategories.length > 0 && this.selectedCategories.length === 0) {
          // 如果有分类数据但没有选中任何分类，可以设置默认选中热门分类
          // this.selectedCategories = this.hotCategories.slice(0, 3)
          // this.onChange()
        }
      },
      immediate: true
    }
  },
  methods: {
    // 选择变化
    onChange() {
      this.$emit('input', this.selectedCategories)
      this.$emit('change', this.selectedCategories)
    },

    // 检查分类是否有子分类
    hasChildren(category) {
      return category.children && category.children.length > 0
    },

    // 获取分类名称
    getCategoryName(categoryId) {
      const category = this.allCategories.find(cat => cat.id === categoryId)
      return category ? category.name : `分类${categoryId}`
    },

    // 全选
    selectAll() {
      // 只选择叶子节点（没有子分类的分类）
      this.selectedCategories = this.allCategories
        .filter(category => !this.hasChildren(category))
        .map(category => category.id)
      this.onChange()
    },

    // 清空
    clearAll() {
      this.selectedCategories = []
      this.onChange()
    },

    // 选择热门分类
    selectHot() {
      this.selectedCategories = [...this.hotCategories]
      this.onChange()
    },

    // 移除分类
    removeCategory(categoryId) {
      const index = this.selectedCategories.indexOf(categoryId)
      if (index > -1) {
        this.selectedCategories.splice(index, 1)
        this.onChange()
      }
    }
  },
  async created() {
    // 如果没有分类数据，尝试获取
    if (!this.categories || this.categories.length === 0) {
      this.loading = true
      try {
        await this.$store.dispatch('productPerformance/fetchBaseData')
      } catch (error) {
        console.error('获取分类数据失败:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.category-selector {
  .quick-actions {
    .el-button-group {
      .el-button {
        font-size: 11px;
        padding: 4px 8px;
      }
    }
  }

  .selected-categories {
    .selected-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #606266;
      margin-bottom: 5px;

      .selected-count {
        font-weight: 500;
      }
    }

    .selected-detail {
      padding: 8px;
      background-color: #f5f7fa;
      border-radius: 4px;
      max-height: 120px;
      overflow-y: auto;

      .el-tag {
        margin: 2px;
      }
    }
  }
}

// 自定义下拉选项样式
:deep(.el-select-dropdown) {
  .el-option-group__title {
    font-weight: bold;
    color: #409eff;
  }
  
  .el-option {
    &.is-disabled {
      color: #c0c4cc;
      background-color: #f5f7fa;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .category-selector {
    .quick-actions {
      .el-button-group {
        display: flex;
        width: 100%;
        
        .el-button {
          flex: 1;
        }
      }
    }

    .selected-categories {
      .selected-detail {
        max-height: 80px;
      }
    }
  }
}
</style>