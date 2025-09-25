<template>
  <div class="performance-filters">
    <el-card>
      <div class="filter-form">
        <el-row :gutter="20">
          <!-- 时间范围选择 -->
          <el-col :xs="24" :sm="12" :md="6">
            <div class="filter-item">
              <label class="filter-label">时间范围</label>
              <date-range-picker 
                v-model="localFilters.dateRange"
                @change="onFilterChange" 
                :disabled="loading" />
            </div>
          </el-col>

          <!-- 商品分类筛选 -->
          <el-col :xs="24" :sm="12" :md="6">
            <div class="filter-item">
              <label class="filter-label">商品分类</label>
              <category-selector 
                v-model="localFilters.categoryIds"
                @change="onFilterChange"
                :disabled="loading" />
            </div>
          </el-col>

          <!-- 品牌筛选 -->
          <el-col :xs="24" :sm="12" :md="6">
            <div class="filter-item">
              <label class="filter-label">品牌</label>
              <brand-selector 
                v-model="localFilters.brandIds"
                @change="onFilterChange"
                :disabled="loading" />
            </div>
          </el-col>

          <!-- 价格区间 -->
          <el-col :xs="24" :sm="12" :md="6">
            <div class="filter-item">
              <label class="filter-label">价格区间</label>
              <price-range-slider 
                v-model="localFilters.priceRange"
                @change="onFilterChange"
                :disabled="loading" />
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 15px;">
          <!-- 商品状态 -->
          <el-col :xs="24" :sm="12" :md="6">
            <div class="filter-item">
              <label class="filter-label">商品状态</label>
              <el-select 
                v-model="localFilters.status" 
                placeholder="选择状态"
                @change="onFilterChange"
                :disabled="loading"
                style="width: 100%">
                <el-option label="全部" value="all"></el-option>
                <el-option label="已上架" value="active"></el-option>
                <el-option label="已下架" value="inactive"></el-option>
              </el-select>
            </div>
          </el-col>

          <!-- 时间粒度 -->
          <el-col :xs="24" :sm="12" :md="6">
            <div class="filter-item">
              <label class="filter-label">时间粒度</label>
              <el-select 
                v-model="localFilters.groupBy" 
                placeholder="选择粒度"
                @change="onFilterChange"
                :disabled="loading"
                style="width: 100%">
                <el-option label="按天" value="day"></el-option>
                <el-option label="按周" value="week"></el-option>
                <el-option label="按月" value="month"></el-option>
              </el-select>
            </div>
          </el-col>

          <!-- 操作按钮 -->
          <el-col :xs="24" :sm="12" :md="12">
            <div class="filter-actions">
              <el-button 
                type="primary" 
                icon="el-icon-search"
                :loading="loading"
                @click="onFilterChange">
                查询
              </el-button>
              <el-button 
                icon="el-icon-refresh-left"
                @click="resetFilters"
                :disabled="loading">
                重置
              </el-button>
              <el-button 
                type="text"
                icon="el-icon-arrow-up"
                @click="toggleCollapse"
                class="collapse-btn">
                {{ collapsed ? '展开筛选' : '收起筛选' }}
              </el-button>
            </div>
          </el-col>
        </el-row>

        <!-- 高级筛选选项（可折叠） -->
        <el-collapse-transition>
          <div v-show="!collapsed" class="advanced-filters">
            <el-divider content-position="left">高级筛选</el-divider>
            <el-row :gutter="20">
              <!-- 销售渠道 -->
              <el-col :xs="24" :sm="12" :md="8">
                <div class="filter-item">
                  <label class="filter-label">销售渠道</label>
                  <el-checkbox-group 
                    v-model="localFilters.channels"
                    @change="onFilterChange"
                    :disabled="loading">
                    <el-checkbox label="pc">PC端</el-checkbox>
                    <el-checkbox label="mobile">移动端</el-checkbox>
                    <el-checkbox label="miniprogram">小程序</el-checkbox>
                  </el-checkbox-group>
                </div>
              </el-col>

              <!-- 用户类型 -->
              <el-col :xs="24" :sm="12" :md="8">
                <div class="filter-item">
                  <label class="filter-label">用户类型</label>
                  <el-checkbox-group 
                    v-model="localFilters.userTypes"
                    @change="onFilterChange"
                    :disabled="loading">
                    <el-checkbox label="new">新用户</el-checkbox>
                    <el-checkbox label="returning">老用户</el-checkbox>
                    <el-checkbox label="vip">会员用户</el-checkbox>
                  </el-checkbox-group>
                </div>
              </el-col>

              <!-- 促销活动 -->
              <el-col :xs="24" :sm="12" :md="8">
                <div class="filter-item">
                  <label class="filter-label">促销活动</label>
                  <el-checkbox-group 
                    v-model="localFilters.promotionTypes"
                    @change="onFilterChange"
                    :disabled="loading">
                    <el-checkbox label="flash">秒杀</el-checkbox>
                    <el-checkbox label="coupon">优惠券</el-checkbox>
                    <el-checkbox label="discount">满减</el-checkbox>
                  </el-checkbox-group>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-collapse-transition>
      </div>
    </el-card>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import DateRangePicker from './DateRangePicker'
import CategorySelector from './CategorySelector'
import BrandSelector from './BrandSelector'
import PriceRangeSlider from './PriceRangeSlider'

export default {
  name: 'PerformanceFilters',
  components: {
    DateRangePicker,
    CategorySelector,
    BrandSelector,
    PriceRangeSlider
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      collapsed: true,
      localFilters: {
        dateRange: [],
        categoryIds: [],
        brandIds: [],
        priceRange: { min: 0, max: 10000 },
        status: 'all',
        groupBy: 'day',
        channels: [],
        userTypes: [],
        promotionTypes: []
      }
    }
  },
  computed: {
    ...mapState('productPerformance', ['filters'])
  },
  watch: {
    filters: {
      handler(newFilters) {
        this.localFilters = { ...this.localFilters, ...newFilters }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    // 筛选条件变化
    onFilterChange() {
      this.$emit('filter-change', { ...this.localFilters })
    },

    // 重置筛选条件
    resetFilters() {
      this.localFilters = {
        dateRange: [],
        categoryIds: [],
        brandIds: [],
        priceRange: { min: 0, max: 10000 },
        status: 'all',
        groupBy: 'day',
        channels: [],
        userTypes: [],
        promotionTypes: []
      }
      this.onFilterChange()
    },

    // 切换折叠状态
    toggleCollapse() {
      this.collapsed = !this.collapsed
    }
  }
}
</script>

<style lang="scss" scoped>
.performance-filters {
  .filter-form {
    .filter-item {
      margin-bottom: 15px;

      .filter-label {
        display: block;
        margin-bottom: 5px;
        font-size: 14px;
        color: #606266;
        font-weight: 500;
      }
    }

    .filter-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      height: 60px; // 与其他filter-item保持高度一致

      .collapse-btn {
        margin-left: auto;
      }
    }

    .advanced-filters {
      margin-top: 15px;
      padding-top: 15px;

      .filter-item {
        .el-checkbox-group {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;

          .el-checkbox {
            margin-right: 0;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .performance-filters {
    .filter-form {
      .filter-actions {
        flex-direction: column;
        align-items: stretch;
        height: auto;
        gap: 8px;

        .el-button {
          width: 100%;
        }

        .collapse-btn {
          margin-left: 0;
        }
      }

      .advanced-filters {
        .el-checkbox-group {
          flex-direction: column;
        }
      }
    }
  }
}
</style>