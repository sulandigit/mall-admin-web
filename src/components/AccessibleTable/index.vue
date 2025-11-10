<!--
  无障碍数据表格组件
  基于Element UI Table，增强了无障碍功能
-->
<template>
  <div class=\"accessible-table-wrapper\" role=\"region\" :aria-label=\"caption || '数据表格'\">
    <!-- 表格标题/说明 -->
    <div v-if=\"caption\" class=\"table-caption\" id=\"table-caption\">
      <h3>{{ caption }}</h3>
      <p v-if=\"description\" class=\"table-description\">{{ description }}</p>
    </div>
    
    <!-- 表格操作工具栏 -->
    <div v-if=\"$slots.toolbar\" class=\"table-toolbar\" role=\"toolbar\" aria-label=\"表格操作\">
      <slot name=\"toolbar\"></slot>
    </div>
    
    <!-- 数据统计信息 -->
    <div v-if=\"showSummary\" class=\"table-summary\" aria-live=\"polite\">
      <span>共 {{ total }} 条数据</span>
      <span v-if=\"filteredCount !== total\">，筛选后 {{ filteredCount }} 条</span>
    </div>
    
    <!-- Element UI 表格 -->
    <el-table
      ref=\"table\"
      :data=\"data\"
      v-bind=\"$attrs\"
      v-on=\"$listeners\"
      role=\"table\"
      :aria-label=\"caption || '数据表格'\"
      :aria-describedby=\"description ? 'table-caption' : null\"
      :aria-rowcount=\"total\"
      @selection-change=\"handleSelectionChange\"
      @sort-change=\"handleSortChange\"
      class=\"accessible-table\">
      
      <!-- 选择列 -->
      <el-table-column
        v-if=\"selectable\"
        type=\"selection\"
        width=\"55\"
        aria-label=\"选择行\">
      </el-table-column>
      
      <!-- 序号列 -->
      <el-table-column
        v-if=\"showIndex\"
        type=\"index\"
        label=\"序号\"
        width=\"80\">
      </el-table-column>
      
      <!-- 数据列 -->
      <slot></slot>
      
      <!-- 操作列 -->
      <el-table-column
        v-if=\"$slots.actions\"
        label=\"操作\"
        :width=\"actionWidth\"
        fixed=\"right\">
        <template slot-scope=\"scope\">
          <div role=\"group\" :aria-label=\"`第${scope.$index + 1}行操作按钮`\">
            <slot name=\"actions\" :row=\"scope.row\" :index=\"scope.$index\"></slot>
          </div>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页组件 -->
    <el-pagination
      v-if=\"showPagination && total > 0\"
      class=\"table-pagination\"
      v-bind=\"paginationProps\"
      :total=\"total\"
      :current-page=\"currentPage\"
      :page-size=\"pageSize\"
      @current-change=\"handleCurrentChange\"
      @size-change=\"handleSizeChange\"
      role=\"navigation\"
      aria-label=\"表格分页导航\">
    </el-pagination>
  </div>
</template>

<script>
import { liveAnnouncer } from '@/utils/accessibility'

export default {
  name: 'AccessibleTable',
  inheritAttrs: false,
  props: {
    data: { type: Array, default: () => [] },
    caption: { type: String, default: '' },
    description: { type: String, default: '' },
    selectable: { type: Boolean, default: false },
    showIndex: { type: Boolean, default: false },
    actionWidth: { type: [String, Number], default: 200 },
    showPagination: { type: Boolean, default: true },
    total: { type: Number, default: 0 },
    currentPage: { type: Number, default: 1 },
    pageSize: { type: Number, default: 20 },
    filteredCount: { type: Number, default: null },
    showSummary: { type: Boolean, default: true },
    paginationProps: {
      type: Object,
      default: () => ({
        background: true,
        layout: 'total, sizes, prev, pager, next, jumper'
      })
    }
  },
  methods: {
    handleSelectionChange(selection) {
      this.$emit('selection-change', selection)
      liveAnnouncer.announce(`已选择 ${selection.length} 行数据`)
    },
    handleSortChange(sort) {
      this.$emit('sort-change', sort)
      const order = sort.order === 'ascending' ? '升序' : '降序'
      liveAnnouncer.announce(`按 ${sort.prop} 列 ${order} 排序`)
    },
    handleCurrentChange(page) {
      this.$emit('current-change', page)
      liveAnnouncer.announce(`已切换到第 ${page} 页`)
    },
    handleSizeChange(size) {
      this.$emit('size-change', size)
      liveAnnouncer.announce(`每页显示 ${size} 条数据`)
    }
  }
}
</script>

<style scoped>
.accessible-table-wrapper {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table-caption {
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
}

.table-caption h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.table-description {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.table-toolbar {
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
  background-color: #fafafa;
}

.table-summary {
  padding: 12px 20px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  font-size: 14px;
  color: #606266;
}

.table-pagination {
  padding: 16px 20px;
  text-align: right;
  border-top: 1px solid #ebeef5;
}
</style>