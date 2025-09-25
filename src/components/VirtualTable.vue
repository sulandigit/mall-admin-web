<template>
  <div class="virtual-table" :style="{ height: height + 'px' }">
    <!-- 表头 -->
    <div class="table-header" ref="header">
      <div class="header-row">
        <div
          v-for="column in columns"
          :key="column.key"
          :style="{ width: column.width + 'px' }"
          class="header-cell"
        >
          {{ column.label }}
        </div>
      </div>
    </div>

    <!-- 滚动容器 -->
    <div
      class="table-body"
      ref="container"
      :style="{ height: bodyHeight + 'px' }"
      @scroll="handleScroll"
    >
      <!-- 虚拟占位符 -->
      <div
        class="spacer"
        :style="{ height: spacerHeight + 'px' }"
      ></div>

      <!-- 可见行 -->
      <div
        v-for="(item, index) in visibleItems"
        :key="startIndex + index"
        class="table-row"
        :class="getRowClass(item, startIndex + index)"
        :style="{ transform: `translateY(${(startIndex + index) * itemHeight}px)` }"
      >
        <div
          v-for="column in columns"
          :key="column.key"
          :style="{ width: column.width + 'px' }"
          class="table-cell"
        >
          <slot
            :name="column.key"
            :row="item"
            :column="column"
            :index="startIndex + index"
          >
            {{ formatCellValue(item[column.key], column) }}
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VirtualTable',
  props: {
    // 数据源
    data: {
      type: Array,
      default: () => []
    },
    // 列配置
    columns: {
      type: Array,
      default: () => []
    },
    // 容器高度
    height: {
      type: Number,
      default: 400
    },
    // 行高
    itemHeight: {
      type: Number,
      default: 50
    },
    // 表头高度
    headerHeight: {
      type: Number,
      default: 40
    },
    // 行类名函数
    rowClassName: {
      type: Function,
      default: () => ''
    },
    // 缓冲区大小
    bufferSize: {
      type: Number,
      default: 5
    }
  },
  data() {
    return {
      scrollTop: 0,
      containerHeight: 0
    }
  },
  computed: {
    // 表体高度
    bodyHeight() {
      return this.height - this.headerHeight
    },
    
    // 总高度
    totalHeight() {
      return this.data.length * this.itemHeight
    },
    
    // 可见区域可容纳的项目数
    visibleCount() {
      return Math.ceil(this.bodyHeight / this.itemHeight)
    },
    
    // 开始索引
    startIndex() {
      const index = Math.floor(this.scrollTop / this.itemHeight)
      return Math.max(0, index - this.bufferSize)
    },
    
    // 结束索引
    endIndex() {
      const index = this.startIndex + this.visibleCount + this.bufferSize * 2
      return Math.min(this.data.length - 1, index)
    },
    
    // 可见项目
    visibleItems() {
      return this.data.slice(this.startIndex, this.endIndex + 1)
    },
    
    // 占位符高度
    spacerHeight() {
      return Math.max(0, this.totalHeight - this.visibleItems.length * this.itemHeight)
    }
  },
  mounted() {
    this.updateContainerHeight()
  },
  methods: {
    // 处理滚动
    handleScroll(event) {
      this.scrollTop = event.target.scrollTop
      this.$emit('scroll', {
        scrollTop: this.scrollTop,
        scrollLeft: event.target.scrollLeft
      })
    },
    
    // 更新容器高度
    updateContainerHeight() {
      if (this.$refs.container) {
        this.containerHeight = this.$refs.container.clientHeight
      }
    },
    
    // 获取行类名
    getRowClass(row, index) {
      if (typeof this.rowClassName === 'function') {
        return this.rowClassName({ row, index })
      }
      return this.rowClassName
    },
    
    // 格式化单元格值
    formatCellValue(value, column) {
      if (column.formatter && typeof column.formatter === 'function') {
        return column.formatter(value)
      }
      
      if (value === null || value === undefined || value === '') {
        return '-'
      }
      
      return value
    },
    
    // 滚动到指定行
    scrollToIndex(index) {
      if (this.$refs.container) {
        const scrollTop = index * this.itemHeight
        this.$refs.container.scrollTop = scrollTop
      }
    },
    
    // 滚动到顶部
    scrollToTop() {
      this.scrollToIndex(0)
    },
    
    // 滚动到底部
    scrollToBottom() {
      this.scrollToIndex(this.data.length - 1)
    }
  }
}
</script>

<style scoped>
.virtual-table {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.table-header {
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.header-row {
  display: flex;
  height: 40px;
}

.header-cell {
  display: flex;
  align-items: center;
  padding: 0 12px;
  font-weight: 500;
  color: #909399;
  font-size: 14px;
  border-right: 1px solid #ebeef5;
  box-sizing: border-box;
}

.header-cell:last-child {
  border-right: none;
}

.table-body {
  position: relative;
  overflow: auto;
}

.spacer {
  width: 100%;
}

.table-row {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  border-bottom: 1px solid #ebeef5;
  background-color: #fff;
  transition: background-color 0.25s ease;
}

.table-row:hover {
  background-color: #f5f7fa;
}

.table-row.error-row {
  background-color: #fef0f0;
}

.table-row.error-row:hover {
  background-color: #fde2e2;
}

.table-cell {
  display: flex;
  align-items: center;
  padding: 0 12px;
  font-size: 14px;
  color: #606266;
  border-right: 1px solid #ebeef5;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table-cell:last-child {
  border-right: none;
}

/* 滚动条样式 */
.table-body::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.table-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-body::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.table-body::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>