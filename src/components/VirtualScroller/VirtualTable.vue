<template>
  <div class="virtual-table">
    <!-- 表格头部 -->
    <div class="virtual-table-header" ref="header">
      <table class="header-table">
        <thead>
          <tr>
            <th 
              v-for="column in columns" 
              :key="column.prop || column.label"
              :class="getColumnClass(column)"
              :style="getColumnStyle(column)"
              @click="handleSort(column)"
            >
              <div class="cell">
                <span>{{ column.label }}</span>
                <span v-if="column.sortable" class="sort-icon" :class="getSortClass(column)">
                  <i class="el-icon-caret-top"></i>
                  <i class="el-icon-caret-bottom"></i>
                </span>
              </div>
            </th>
          </tr>
        </thead>
      </table>
    </div>
    
    <!-- 虚拟滚动表格内容 -->
    <div class="virtual-table-body" :style="{ height: tableHeight }">
      <virtual-scroller
        ref="virtualScroller"
        :items="sortedData"
        :item-height="rowHeight"
        :buffer-size="bufferSize"
        key-field="id"
        @scroll="handleScroll"
      >
        <template v-slot="{ item, index }">
          <virtual-table-row
            :key="getRowKey(item, index)"
            :row-data="item"
            :index="index"
            :columns="columns"
            :row-height="rowHeight"
            :memo-deps="getRowMemoDeps(item)"
            :selected="isRowSelected(item)"
            @selection-change="handleSelectionChange"
            @cell-click="handleCellClick"
            @row-click="handleRowClick"
          />
        </template>
      </virtual-scroller>
    </div>
    
    <!-- 加载遮罩 -->
    <div v-if="loading" class="virtual-table-loading">
      <div class="loading-spinner">
        <i class="el-icon-loading"></i>
        <span>加载中...</span>
      </div>
    </div>
    
    <!-- 空数据提示 -->
    <div v-if="!loading && (!data || data.length === 0)" class="virtual-table-empty">
      <i class="el-icon-warning-outline"></i>
      <span>暂无数据</span>
    </div>
  </div>
</template>

<script>
import VirtualScroller from './VirtualScroller'
import VirtualTableRow from './VirtualTableRow'

export default {
  name: 'VirtualTable',
  
  components: {
    VirtualScroller,
    VirtualTableRow
  },
  
  props: {
    // 表格数据
    data: {
      type: Array,
      default: () => []
    },
    
    // 表格列配置
    columns: {
      type: Array,
      default: () => []
    },
    
    // 行高
    rowHeight: {
      type: Number,
      default: 60
    },
    
    // 表格高度
    tableHeight: {
      type: String,
      default: '400px'
    },
    
    // 缓冲区大小
    bufferSize: {
      type: Number,
      default: 5
    },
    
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },
    
    // 选中的行
    selectedRows: {
      type: Array,
      default: () => []
    },
    
    // 行唯一标识字段
    rowKey: {
      type: String,
      default: 'id'
    },
    
    // 排序配置
    defaultSort: {
      type: Object,
      default: () => ({ prop: '', order: '' })
    }
  },
  
  data() {
    return {
      // 当前排序状态
      currentSort: {
        prop: '',
        order: '' // 'ascending' | 'descending' | ''
      },
      
      // 表头固定位置
      headerScrollLeft: 0
    }
  },
  
  computed: {
    // 排序后的数据
    sortedData() {
      if (!this.currentSort.prop || !this.currentSort.order) {
        return this.data
      }
      
      const { prop, order } = this.currentSort
      const sortedData = [...this.data]
      
      sortedData.sort((a, b) => {
        const aVal = this.getValueByPath(a, prop)
        const bVal = this.getValueByPath(b, prop)
        
        if (aVal === bVal) return 0
        
        const result = aVal > bVal ? 1 : -1
        return order === 'ascending' ? result : -result
      })
      
      return sortedData
    }
  },
  
  mounted() {
    // 初始化排序
    if (this.defaultSort.prop) {
      this.currentSort = { ...this.defaultSort }
    }
    
    // 同步表头滚动
    this.syncHeaderScroll()
  },
  
  methods: {
    // 获取行的memo依赖
    getRowMemoDeps(row) {
      // 基础依赖包括行ID和选中状态
      const deps = [row[this.rowKey], this.isRowSelected(row)]
      
      // 添加行数据的关键字段作为依赖
      this.columns.forEach(column => {
        if (column.prop) {
          deps.push(this.getValueByPath(row, column.prop))
        }
      })
      
      return deps
    },
    
    // 获取行的唯一键
    getRowKey(row, index) {
      return row[this.rowKey] || index
    },
    
    // 检查行是否被选中
    isRowSelected(row) {
      return this.selectedRows.some(selectedRow => 
        selectedRow[this.rowKey] === row[this.rowKey]
      )
    },
    
    // 处理选择变化
    handleSelectionChange(row, selected) {
      let newSelection = [...this.selectedRows]
      
      if (selected) {
        if (!this.isRowSelected(row)) {
          newSelection.push(row)
        }
      } else {
        newSelection = newSelection.filter(selectedRow => 
          selectedRow[this.rowKey] !== row[this.rowKey]
        )
      }
      
      this.$emit('selection-change', newSelection)
    },
    
    // 处理单元格点击
    handleCellClick(row, column, cell, event) {
      this.$emit('cell-click', row, column, cell, event)
    },
    
    // 处理行点击
    handleRowClick(row, column, event) {
      this.$emit('row-click', row, column, event)
    },
    
    // 处理排序
    handleSort(column) {
      if (!column.sortable) return
      
      let order = ''
      if (this.currentSort.prop === column.prop) {
        // 切换排序顺序：升序 -> 降序 -> 无排序
        if (this.currentSort.order === 'ascending') {
          order = 'descending'
        } else if (this.currentSort.order === 'descending') {
          order = ''
        } else {
          order = 'ascending'
        }
      } else {
        order = 'ascending'
      }
      
      this.currentSort = {
        prop: order ? column.prop : '',
        order
      }
      
      this.$emit('sort-change', { ...this.currentSort })
    },
    
    // 获取列的样式类
    getColumnClass(column) {
      return {
        'is-sortable': column.sortable,
        'ascending': this.currentSort.prop === column.prop && this.currentSort.order === 'ascending',
        'descending': this.currentSort.prop === column.prop && this.currentSort.order === 'descending'
      }
    },
    
    // 获取列的样式
    getColumnStyle(column) {
      const style = {}
      
      if (column.width) {
        style.width = column.width + 'px'
        style.minWidth = column.width + 'px'
      }
      
      if (column.minWidth) {
        style.minWidth = column.minWidth + 'px'
      }
      
      return style
    },
    
    // 获取排序图标的样式类
    getSortClass(column) {
      if (this.currentSort.prop !== column.prop) return ''
      return this.currentSort.order
    },
    
    // 根据路径获取对象值
    getValueByPath(obj, path) {
      return path.split('.').reduce((current, key) => current?.[key], obj)
    },
    
    // 处理滚动事件
    handleScroll(event) {
      this.syncHeaderScroll()
      this.$emit('scroll', event)
    },
    
    // 同步表头滚动
    syncHeaderScroll() {
      if (this.$refs.virtualScroller && this.$refs.header) {
        const scrollLeft = this.$refs.virtualScroller.$refs.container?.scrollLeft || 0
        if (scrollLeft !== this.headerScrollLeft) {
          this.headerScrollLeft = scrollLeft
          this.$refs.header.scrollLeft = scrollLeft
        }
      }
    },
    
    // 滚动到指定行
    scrollToRow(index) {
      if (this.$refs.virtualScroller) {
        this.$refs.virtualScroller.scrollToIndex(index)
      }
    },
    
    // 获取当前可视区域信息
    getVisibleRange() {
      return this.$refs.virtualScroller?.getVisibleRange() || null
    },
    
    // 刷新表格
    refresh() {
      if (this.$refs.virtualScroller) {
        this.$refs.virtualScroller.calculateVisibleRange()
      }
    }
  }
}
</script>

<style scoped>
.virtual-table {
  position: relative;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #fff;
  font-size: 14px;
  color: #606266;
}

.virtual-table-header {
  overflow: hidden;
  border-bottom: 1px solid #ebeef5;
  background-color: #f5f7fa;
}

.header-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.header-table th {
  padding: 12px 0;
  text-align: left;
  font-weight: 500;
  color: #909399;
  background-color: #f5f7fa;
  border-right: 1px solid #ebeef5;
  position: relative;
  user-select: none;
}

.header-table th:last-child {
  border-right: none;
}

.header-table th.is-sortable {
  cursor: pointer;
}

.header-table th.is-sortable:hover {
  background-color: #eef1f6;
}

.cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sort-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 4px;
  color: #c0c4cc;
}

.sort-icon i {
  font-size: 12px;
  line-height: 1;
}

.sort-icon i:first-child {
  margin-bottom: -2px;
}

.ascending .sort-icon .el-icon-caret-top {
  color: #409eff;
}

.descending .sort-icon .el-icon-caret-bottom {
  color: #409eff;
}

.virtual-table-body {
  position: relative;
  overflow: hidden;
}

.virtual-table-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #409eff;
}

.loading-spinner i {
  font-size: 24px;
  margin-bottom: 8px;
}

.virtual-table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #909399;
}

.virtual-table-empty i {
  font-size: 48px;
  margin-bottom: 16px;
}

/* 性能优化样式 */
.virtual-table-header,
.virtual-table-body {
  transform: translate3d(0, 0, 0);
  will-change: scroll-position;
}
</style>