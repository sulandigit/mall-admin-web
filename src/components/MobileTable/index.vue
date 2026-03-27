/**
 * 移动端表格适配组件
 * 支持卡片模式、横向滚动、响应式列显示
 */

<template>
  <div class="mobile-table-wrapper" :class="{ 'card-mode': isCardMode }">
    <!-- 移动端卡片模式 -->
    <div v-if="isCardMode" class="table-cards">
      <div 
        v-for="(row, index) in tableData" 
        :key="getRowKey(row, index)"
        class="table-card"
        @click="handleCardClick(row, index)"
      >
        <div class="card-header" v-if="cardTitle">
          <span class="card-title">{{ getCardTitle(row) }}</span>
          <div class="card-actions" v-if="$scopedSlots.actions">
            <slot name="actions" :row="row" :index="index"></slot>
          </div>
        </div>
        
        <div class="card-body">
          <div 
            v-for="column in visibleColumns" 
            :key="column.prop"
            class="card-field"
            :class="{ 'highlight': column.highlight }"
          >
            <label class="field-label">{{ column.label }}:</label>
            <div class="field-value">
              <!-- 自定义列内容 -->
              <slot 
                v-if="$scopedSlots[column.prop]" 
                :name="column.prop" 
                :row="row" 
                :column="column"
                :index="index"
              >
              </slot>
              <!-- 默认内容 -->
              <span v-else>{{ getFieldValue(row, column) }}</span>
            </div>
          </div>
        </div>
        
        <div class="card-footer" v-if="$scopedSlots.footer">
          <slot name="footer" :row="row" :index="index"></slot>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="!tableData || tableData.length === 0" class="empty-state">
        <i class="el-icon-document"></i>
        <p>{{ emptyText || '暂无数据' }}</p>
      </div>
    </div>
    
    <!-- 桌面端/平板横向滚动模式 -->
    <div v-else class="table-scroll-wrapper">
      <el-table
        ref="table"
        v-bind="$attrs"
        v-on="$listeners"
        :data="tableData"
        class="responsive-table"
        :class="tableClass"
      >
        <slot></slot>
      </el-table>
    </div>
    
    <!-- 移动端分页 -->
    <div v-if="showPagination" class="mobile-pagination">
      <el-pagination
        v-bind="paginationProps"
        :layout="paginationLayout"
        :small="isMobile"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'MobileTable',
  inheritAttrs: false,
  props: {
    // 表格数据
    data: {
      type: Array,
      default: () => []
    },
    
    // 列配置
    columns: {
      type: Array,
      default: () => []
    },
    
    // 强制使用卡片模式
    forceCardMode: {
      type: Boolean,
      default: false
    },
    
    // 卡片标题字段
    cardTitle: {
      type: String,
      default: ''
    },
    
    // 行唯一标识
    rowKey: {
      type: [String, Function],
      default: 'id'
    },
    
    // 空数据文本
    emptyText: {
      type: String,
      default: ''
    },
    
    // 显示分页
    showPagination: {
      type: Boolean,
      default: false
    },
    
    // 分页配置
    paginationProps: {
      type: Object,
      default: () => ({})
    },
    
    // 表格CSS类
    tableClass: {
      type: String,
      default: ''
    }
  },
  
  computed: {
    ...mapGetters(['isMobile', 'isTablet', 'isMobileOrTablet']),
    
    /**
     * 表格数据
     */
    tableData() {
      return this.data || []
    },
    
    /**
     * 是否使用卡片模式
     */
    isCardMode() {
      return this.forceCardMode || this.isMobile
    },
    
    /**
     * 可见列
     */
    visibleColumns() {
      if (!this.columns || this.columns.length === 0) {
        return []
      }
      
      return this.columns.filter(column => {
        // 移动端隐藏特定列
        if (this.isMobile && column.hideOnMobile) {
          return false
        }
        
        // 平板隐藏特定列
        if (this.isTablet && column.hideOnTablet) {
          return false
        }
        
        return !column.hidden
      })
    },
    
    /**
     * 分页布局
     */
    paginationLayout() {
      if (this.isMobile) {
        return 'prev, pager, next'
      } else if (this.isTablet) {
        return 'total, prev, pager, next'
      } else {
        return 'total, sizes, prev, pager, next, jumper'
      }
    }
  },
  
  methods: {
    /**
     * 获取行键值
     */
    getRowKey(row, index) {
      if (typeof this.rowKey === 'function') {
        return this.rowKey(row, index)
      }
      return row[this.rowKey] || index
    },
    
    /**
     * 获取卡片标题
     */
    getCardTitle(row) {
      if (!this.cardTitle) return ''
      return row[this.cardTitle] || ''
    },
    
    /**
     * 获取字段值
     */
    getFieldValue(row, column) {
      if (!column.prop) return ''
      
      // 支持嵌套属性，如 'user.name'
      const props = column.prop.split('.')
      let value = row
      
      for (const prop of props) {
        if (value && typeof value === 'object') {
          value = value[prop]
        } else {
          value = ''
          break
        }
      }
      
      // 格式化函数
      if (column.formatter && typeof column.formatter === 'function') {
        return column.formatter(row, column, value)
      }
      
      return value
    },
    
    /**
     * 处理卡片点击
     */
    handleCardClick(row, index) {
      this.$emit('card-click', { row, index })
      this.$emit('row-click', row, null, null)
    },
    
    /**
     * 处理分页大小变化
     */
    handleSizeChange(size) {
      this.$emit('size-change', size)
    },
    
    /**
     * 处理当前页变化
     */
    handleCurrentChange(page) {
      this.$emit('current-change', page)
    },
    
    /**
     * 获取表格引用（用于兼容性）
     */
    getTableRef() {
      return this.$refs.table
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/responsive-mixins.scss';

.mobile-table-wrapper {
  width: 100%;
  
  // 卡片模式
  &.card-mode {
    .table-cards {
      display: flex;
      flex-direction: column;
      gap: $mobile-spacing-md;
      
      .table-card {
        @include card-style();
        @include touch-feedback();
        cursor: pointer;
        border: 1px solid $border-color-lighter;
        
        &:hover {
          border-color: $primary-color;
          @include responsive-shadow($mobile-shadow-base, $shadow-base);
        }
        
        .card-header {
          @include flex-space-between();
          padding-bottom: $mobile-spacing-sm;
          margin-bottom: $mobile-spacing-sm;
          border-bottom: 1px solid $border-color-extra-light;
          
          .card-title {
            @include responsive-font-size($mobile-font-lg, $desktop-font-lg);
            font-weight: 500;
            color: $text-color-primary;
            @include text-truncate();
            flex: 1;
          }
          
          .card-actions {
            margin-left: $mobile-spacing-sm;
          }
        }
        
        .card-body {
          .card-field {
            display: flex;
            align-items: flex-start;
            margin-bottom: $mobile-spacing-sm;
            
            &:last-child {
              margin-bottom: 0;
            }
            
            &.highlight {
              .field-value {
                color: $primary-color;
                font-weight: 500;
              }
            }
            
            .field-label {
              @include responsive-font-size($mobile-font-sm, $desktop-font-sm);
              color: $text-color-secondary;
              min-width: 80px;
              margin-right: $mobile-spacing-sm;
              flex-shrink: 0;
            }
            
            .field-value {
              @include responsive-font-size($mobile-font-md, $desktop-font-md);
              color: $text-color-primary;
              flex: 1;
              word-break: break-word;
            }
          }
        }
        
        .card-footer {
          padding-top: $mobile-spacing-sm;
          margin-top: $mobile-spacing-sm;
          border-top: 1px solid $border-color-extra-light;
        }
      }
      
      .empty-state {
        @include flex-center();
        flex-direction: column;
        padding: $mobile-spacing-xl;
        color: $text-color-secondary;
        
        i {
          font-size: 48px;
          margin-bottom: $mobile-spacing-md;
          color: $text-color-placeholder;
        }
        
        p {
          @include responsive-font-size($mobile-font-md, $desktop-font-md);
          margin: 0;
        }
      }
    }
  }
  
  // 横向滚动模式
  .table-scroll-wrapper {
    width: 100%;
    overflow-x: auto;
    @include smooth-scroll();
    
    @include mobile-device {
      // 移动端隐藏滚动条但保持功能
      scrollbar-width: none;
      -ms-overflow-style: none;
      
      &::-webkit-scrollbar {
        display: none;
      }
    }
    
    .responsive-table {
      min-width: 100%;
      
      @include tablet-only {
        min-width: 600px; // 平板最小宽度
      }
      
      @include mobile-only {
        min-width: 500px; // 手机最小宽度
      }
      
      // 移动端表格样式优化
      @include mobile-device {
        ::v-deep .el-table__header-wrapper {
          .el-table__header {
            th {
              @include responsive-padding($mobile-spacing-xs, $desktop-spacing-sm);
              @include responsive-font-size($mobile-font-sm, $desktop-font-sm);
            }
          }
        }
        
        ::v-deep .el-table__body-wrapper {
          .el-table__body {
            td {
              @include responsive-padding($mobile-spacing-xs, $desktop-spacing-sm);
              @include responsive-font-size($mobile-font-sm, $desktop-font-sm);
            }
          }
        }
        
        // 表格行触摸优化
        ::v-deep .el-table__row {
          &:hover {
            background-color: $background-color-light;
          }
          
          &.current-row {
            background-color: rgba($primary-color, 0.1) !important;
          }
        }
      }
    }
  }
  
  // 移动端分页
  .mobile-pagination {
    margin-top: $mobile-spacing-lg;
    @include flex-center();
    
    ::v-deep .el-pagination {
      @include mobile-device {
        .el-pager {
          li {
            @include touch-target();
            min-width: $touch-target-min;
            height: $touch-target-min;
            @include responsive-font-size($mobile-font-sm, $desktop-font-sm);
          }
        }
        
        .btn-prev,
        .btn-next {
          @include touch-target();
          min-width: $touch-target-min;
          height: $touch-target-min;
        }
        
        .el-pagination__sizes {
          display: none; // 移动端隐藏页面大小选择器
        }
        
        .el-pagination__jump {
          display: none; // 移动端隐藏跳转
        }
      }
    }
  }
}
</style>