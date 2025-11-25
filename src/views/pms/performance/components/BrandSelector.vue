<template>
  <div class="brand-selector">
    <el-select
      v-model="selectedBrands"
      multiple
      filterable
      remote
      reserve-keyword
      placeholder="搜索并选择品牌"
      :remote-method="searchBrands"
      :loading="searching"
      @change="onChange"
      :disabled="disabled"
      style="width: 100%">
      
      <el-option
        v-for="brand in displayBrands"
        :key="brand.id"
        :label="brand.name"
        :value="brand.id">
        <div class="brand-option">
          <img 
            v-if="brand.logo" 
            :src="brand.logo" 
            :alt="brand.name"
            class="brand-logo">
          <span class="brand-name">{{ brand.name }}</span>
          <span class="brand-info">{{ brand.productCount || 0 }}个商品</span>
        </div>
      </el-option>
    </el-select>

    <!-- 热门品牌快速选择 -->
    <div class="hot-brands" style="margin-top: 8px;">
      <div class="hot-brands-label">热门品牌：</div>
      <div class="hot-brands-list">
        <el-tag
          v-for="brand in hotBrands"
          :key="brand.id"
          :type="selectedBrands.includes(brand.id) ? 'primary' : 'info'"
          size="small"
          @click="toggleBrand(brand.id)"
          :class="{ 'clickable': !disabled }"
          style="margin: 2px; cursor: pointer;">
          {{ brand.name }}
        </el-tag>
      </div>
    </div>

    <!-- 快速操作 -->
    <div class="quick-actions" style="margin-top: 8px;">
      <el-button-group>
        <el-button 
          size="mini" 
          @click="selectHotBrands"
          :disabled="disabled || loading">
          选择热门
        </el-button>
        <el-button 
          size="mini" 
          @click="clearAll"
          :disabled="disabled || loading">
          清空
        </el-button>
      </el-button-group>
    </div>

    <!-- 已选品牌统计 -->
    <div v-if="selectedBrands.length > 0" class="selected-summary" style="margin-top: 8px;">
      <el-alert
        :title="`已选择 ${selectedBrands.length} 个品牌`"
        type="info"
        :closable="false"
        show-icon>
        <template slot="description">
          <div class="selected-brands-preview">
            <span 
              v-for="brandId in selectedBrands.slice(0, 3)" 
              :key="brandId"
              class="brand-name">
              {{ getBrandName(brandId) }}
            </span>
            <span v-if="selectedBrands.length > 3" class="more-count">
              等{{ selectedBrands.length }}个品牌
            </span>
          </div>
        </template>
      </el-alert>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'BrandSelector',
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
      selectedBrands: [],
      searchKeyword: '',
      searching: false,
      loading: false,
      filteredBrands: [],
      searchTimer: null
    }
  },
  computed: {
    ...mapState('productPerformance', ['brands']),
    
    // 显示的品牌列表
    displayBrands() {
      if (this.searchKeyword) {
        return this.filteredBrands
      }
      return this.brands || []
    },
    
    // 热门品牌（根据商品数量排序）
    hotBrands() {
      if (!this.brands || this.brands.length === 0) {
        return []
      }
      return [...this.brands]
        .sort((a, b) => (b.productCount || 0) - (a.productCount || 0))
        .slice(0, 8)
    }
  },
  watch: {
    value: {
      handler(newVal) {
        this.selectedBrands = newVal || []
      },
      immediate: true
    }
  },
  methods: {
    // 搜索品牌
    searchBrands(keyword) {
      // 手动实现防抖
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
      }
      
      this.searchTimer = setTimeout(() => {
        if (!keyword) {
          this.filteredBrands = []
          this.searchKeyword = ''
          return
        }
        
        this.searching = true
        this.searchKeyword = keyword
        
        // 本地搜索
        this.filteredBrands = (this.brands || []).filter(brand => 
          brand.name.toLowerCase().includes(keyword.toLowerCase()) ||
          (brand.firstLetter && brand.firstLetter.toLowerCase() === keyword.toLowerCase())
        )
        
        this.searching = false
      }, 300)
    },

    // 选择变化
    onChange() {
      this.$emit('input', this.selectedBrands)
      this.$emit('change', this.selectedBrands)
    },

    // 切换品牌选择状态
    toggleBrand(brandId) {
      if (this.disabled) return
      
      const index = this.selectedBrands.indexOf(brandId)
      if (index > -1) {
        this.selectedBrands.splice(index, 1)
      } else {
        this.selectedBrands.push(brandId)
      }
      this.onChange()
    },

    // 选择热门品牌
    selectHotBrands() {
      this.selectedBrands = this.hotBrands.map(brand => brand.id)
      this.onChange()
    },

    // 清空选择
    clearAll() {
      this.selectedBrands = []
      this.onChange()
    },

    // 获取品牌名称
    getBrandName(brandId) {
      const brand = (this.brands || []).find(b => b.id === brandId)
      return brand ? brand.name : `品牌${brandId}`
    }
  },
  async created() {
    // 如果没有品牌数据，尝试获取
    if (!this.brands || this.brands.length === 0) {
      this.loading = true
      try {
        await this.$store.dispatch('productPerformance/fetchBaseData')
      } catch (error) {
        console.error('获取品牌数据失败:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.brand-selector {
  .brand-option {
    display: flex;
    align-items: center;
    gap: 8px;

    .brand-logo {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      object-fit: cover;
    }

    .brand-name {
      flex: 1;
      font-weight: 500;
    }

    .brand-info {
      font-size: 12px;
      color: #909399;
    }
  }

  .hot-brands {
    .hot-brands-label {
      font-size: 12px;
      color: #606266;
      margin-bottom: 5px;
    }

    .hot-brands-list {
      .el-tag {
        &.clickable:hover {
          opacity: 0.8;
        }
      }
    }
  }

  .quick-actions {
    .el-button-group {
      .el-button {
        font-size: 11px;
        padding: 4px 8px;
      }
    }
  }

  .selected-summary {
    .selected-brands-preview {
      font-size: 12px;
      
      .brand-name {
        margin-right: 8px;
        color: #409eff;
        font-weight: 500;
      }
      
      .more-count {
        color: #909399;
      }
    }
  }
}

// 自定义下拉选项样式
:deep(.el-select-dropdown) {
  .el-option {
    height: auto;
    line-height: normal;
    padding: 8px 20px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .brand-selector {
    .hot-brands {
      .hot-brands-list {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
    }

    .quick-actions {
      .el-button-group {
        display: flex;
        width: 100%;
        
        .el-button {
          flex: 1;
        }
      }
    }

    .brand-option {
      .brand-logo {
        width: 16px;
        height: 16px;
      }
      
      .brand-info {
        display: none;
      }
    }
  }
}
</style>