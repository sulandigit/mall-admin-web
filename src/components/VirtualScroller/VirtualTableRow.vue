<template>
  <!-- 使用v-memo优化表格行渲染 -->
  <div 
    v-memo="memoDeps"
    class="virtual-table-row"
    :class="{ 'is-selected': selected, 'is-hover': isHover }"
    :style="{ height: rowHeight + 'px' }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="handleRowClick"
  >
    <table class="row-table">
      <tbody>
        <tr>
          <td 
            v-for="column in columns"
            :key="column.prop || column.label"
            :class="getCellClass(column)"
            :style="getCellStyle(column)"
            @click="handleCellClick(column, $event)"
          >
            <div class="cell">
              <!-- 选择框列 -->
              <template v-if="column.type === 'selection'">
                <el-checkbox
                  :value="selected"
                  @change="handleSelectionChange"
                  @click.stop
                />
              </template>
              
              <!-- 索引列 -->
              <template v-else-if="column.type === 'index'">
                {{ index + 1 }}
              </template>
              
              <!-- 自定义插槽列 -->
              <template v-else-if="column.slot">
                <slot 
                  :name="column.slot"
                  :row="rowData"
                  :column="column"
                  :index="index"
                  :$index="index"
                />
              </template>
              
              <!-- 普通数据列 -->
              <template v-else>
                {{ getCellValue(column) }}
              </template>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'VirtualTableRow',
  
  props: {
    // 行数据
    rowData: {
      type: Object,
      required: true
    },
    
    // 行索引
    index: {
      type: Number,
      required: true
    },
    
    // 列配置
    columns: {
      type: Array,
      required: true
    },
    
    // 行高
    rowHeight: {
      type: Number,
      default: 60
    },
    
    // memo依赖
    memoDeps: {
      type: Array,
      default: () => []
    },
    
    // 是否选中
    selected: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      isHover: false
    }
  },
  
  methods: {
    // 获取单元格的值
    getCellValue(column) {
      if (!column.prop) return ''
      
      const value = this.getValueByPath(this.rowData, column.prop)
      
      // 如果有格式化函数，使用格式化函数
      if (column.formatter && typeof column.formatter === 'function') {
        return column.formatter(this.rowData, column, value, this.index)
      }
      
      return value
    },
    
    // 根据路径获取对象值
    getValueByPath(obj, path) {
      return path.split('.').reduce((current, key) => current?.[key], obj)
    },
    
    // 获取单元格样式类
    getCellClass(column) {
      const classes = []
      
      if (column.align) {
        classes.push(`is-${column.align}`)
      }
      
      if (column.className) {
        classes.push(column.className)
      }
      
      return classes
    },
    
    // 获取单元格样式
    getCellStyle(column) {
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
    
    // 处理鼠标进入
    handleMouseEnter() {
      this.isHover = true
    },
    
    // 处理鼠标离开
    handleMouseLeave() {
      this.isHover = false
    },
    
    // 处理行点击
    handleRowClick(event) {
      this.$emit('row-click', this.rowData, null, event)
    },
    
    // 处理单元格点击
    handleCellClick(column, event) {
      this.$emit('cell-click', this.rowData, column, event.target, event)
    },
    
    // 处理选择变化
    handleSelectionChange(selected) {
      this.$emit('selection-change', this.rowData, selected)
    }
  }
}
</script>

<style scoped>
.virtual-table-row {
  border-bottom: 1px solid #ebeef5;
  background-color: #fff;
  transition: background-color 0.2s ease;
  /* 使用transform3d启用硬件加速 */
  transform: translate3d(0, 0, 0);
  will-change: auto;
}

.virtual-table-row:last-child {
  border-bottom: none;
}

.virtual-table-row.is-hover {
  background-color: #f5f7fa;
}

.virtual-table-row.is-selected {
  background-color: #ecf5ff;
}

.virtual-table-row.is-selected.is-hover {
  background-color: #d9ecff;
}

.row-table {
  width: 100%;
  height: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.row-table td {
  padding: 0;
  border-right: 1px solid #ebeef5;
  vertical-align: middle;
  position: relative;
}

.row-table td:last-child {
  border-right: none;
}

.cell {
  padding: 8px 12px;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.5;
  display: flex;
  align-items: center;
  min-height: 100%;
}

/* 文本对齐 */
.is-left .cell {
  justify-content: flex-start;
  text-align: left;
}

.is-center .cell {
  justify-content: center;
  text-align: center;
}

.is-right .cell {
  justify-content: flex-end;
  text-align: right;
}

/* 选择框列样式 */
.virtual-table-row td[data-type="selection"] .cell {
  justify-content: center;
}

/* 索引列样式 */
.virtual-table-row td[data-type="index"] .cell {
  justify-content: center;
  color: #909399;
  font-size: 12px;
}

/* 性能优化 */
.virtual-table-row {
  contain: layout style paint;
}

/* 避免重绘优化 */
.cell {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .cell {
    padding: 6px 8px;
    font-size: 12px;
  }
}

/* 打印样式 */
@media print {
  .virtual-table-row {
    break-inside: avoid;
  }
}
</style>