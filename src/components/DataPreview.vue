<template>
  <div class="data-preview">
    <!-- 数据统计信息 -->
    <div class="preview-header">
      <div class="stats-info">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-item">
              <span class="stat-label">总行数：</span>
              <span class="stat-value">{{ totalRows }}</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item success">
              <span class="stat-label">有效数据：</span>
              <span class="stat-value">{{ validRows }}</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item error">
              <span class="stat-label">错误数据：</span>
              <span class="stat-value">{{ errorRows.length }}</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <span class="stat-label">成功率：</span>
              <span class="stat-value">{{ successRate }}%</span>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 错误信息汇总 -->
    <div v-if="errorRows.length > 0" class="error-summary">
      <el-alert
        title="数据验证错误"
        type="error"
        :closable="false"
        show-icon
      >
        <div slot="default">
          <p>发现 {{ errorRows.length }} 行数据存在错误，请检查并修正后重新上传</p>
          <el-button 
            type="text" 
            size="small" 
            @click="showErrorDetail = !showErrorDetail"
          >
            {{ showErrorDetail ? '隐藏' : '查看' }}错误详情
          </el-button>
        </div>
      </el-alert>
      
      <!-- 错误详情 -->
      <div v-if="showErrorDetail" class="error-detail">
        <el-table
          :data="errorRows"
          border
          size="small"
          max-height="200"
          class="error-table"
        >
          <el-table-column
            prop="row"
            label="行号"
            width="80"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="errors"
            label="错误信息"
            min-width="300"
          >
            <template slot-scope="scope">
              <div class="error-messages">
                <p v-for="(error, index) in scope.row.errors" :key="index" class="error-msg">
                  • {{ error }}
                </p>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 数据预览表格 -->
    <div class="preview-table">
      <div class="table-header">
        <h4>数据预览（前{{ Math.min(previewData.length, 100) }}条）</h4>
        <div class="table-actions">
          <el-button 
            v-if="errorRows.length > 0"
            type="warning" 
            size="small"
            @click="filterErrorRows"
          >
            {{ showOnlyErrors ? '显示全部' : '只看错误行' }}
          </el-button>
          <el-button 
            type="info" 
            size="small"
            @click="toggleVirtualTable"
          >
            {{ useVirtualTable ? '普通表格' : '虚拟表格' }}
          </el-button>
        </div>
      </div>
      
      <!-- 虚拟表格 -->
      <virtual-table
        v-if="useVirtualTable && displayData.length > 100"
        :data="displayData"
        :columns="virtualTableColumns"
        :height="400"
        :item-height="50"
        :row-class-name="getVirtualRowClassName"
      >
        <!-- 动态生成插槽 -->
        <template v-for="field in tableFields" :slot="field.key" slot-scope="{ row, column }">
          <div :key="field.key" class="cell-content">
            <span :class="getCellClass(row, field.key)">
              {{ formatCellValue(row[field.key], field.type) }}
            </span>
            <i 
              v-if="hasFieldError(row, field.key)" 
              class="el-icon-warning field-error-icon"
              :title="getFieldErrorMessage(row, field.key)"
            ></i>
          </div>
        </template>
        
        <template #status="{ row }">
          <el-tag 
            :type="row._isValid ? 'success' : 'danger'"
            size="small"
          >
            {{ row._isValid ? '有效' : '错误' }}
          </el-tag>
        </template>
      </virtual-table>
      
      <!-- 普通表格 -->
      <el-table
        v-else
        :data="paginatedData"
        border
        size="small"
        max-height="400"
        :row-class-name="getRowClassName"
        v-loading="loading"
      >
        <el-table-column
          type="index"
          label="序号"
          width="60"
          align="center"
        ></el-table-column>
        
        <!-- 动态生成列 -->
        <el-table-column
          v-for="field in tableFields"
          :key="field.key"
          :prop="field.key"
          :label="field.label"
          :width="field.width"
          :min-width="field.minWidth"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <div class="cell-content">
              <span :class="getCellClass(scope.row, field.key)">
                {{ formatCellValue(scope.row[field.key], field.type) }}
              </span>
              <i 
                v-if="hasFieldError(scope.row, field.key)" 
                class="el-icon-warning field-error-icon"
                :title="getFieldErrorMessage(scope.row, field.key)"
              ></i>
            </div>
          </template>
        </el-table-column>
        
        <!-- 状态列 -->
        <el-table-column
          label="状态"
          width="100"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-tag 
              :type="scope.row._isValid ? 'success' : 'danger'"
              size="small"
            >
              {{ scope.row._isValid ? '有效' : '错误' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div v-if="!useVirtualTable && displayData.length > 0" class="pagination-container">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next"
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="[50, 100, 200]"
        :total="totalCount"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
import VirtualTable from '@/components/VirtualTable'

export default {
  name: 'DataPreview',
  components: {
    VirtualTable
  },
  props: {
    // 预览数据
    previewData: {
      type: Array,
      default: () => []
    },
    // 错误行数据
    errorRows: {
      type: Array,
      default: () => []
    },
    // 总行数
    totalRows: {
      type: Number,
      default: 0
    },
    // 有效行数
    validRows: {
      type: Number,
      default: 0
    },
    // 表格字段配置
    tableFields: {
      type: Array,
      default: () => [
        { key: 'name', label: '商品名称', width: 150, type: 'text' },
        { key: 'subTitle', label: '副标题', width: 120, type: 'text' },
        { key: 'productSn', label: '商品货号', width: 120, type: 'text' },
        { key: 'categoryName', label: '商品分类', width: 120, type: 'text' },
        { key: 'brandName', label: '品牌名称', width: 100, type: 'text' },
        { key: 'price', label: '商品价格', width: 100, type: 'price' },
        { key: 'originalPrice', label: '市场价格', width: 100, type: 'price' },
        { key: 'stock', label: '库存数量', width: 100, type: 'number' },
        { key: 'unit', label: '计量单位', width: 80, type: 'text' },
        { key: 'weight', label: '商品重量', width: 100, type: 'weight' },
        { key: 'sort', label: '排序值', width: 80, type: 'number' },
        { key: 'publishStatus', label: '上架状态', width: 100, type: 'status' }
      ]
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showErrorDetail: false,
      showOnlyErrors: false,
      currentPage: 1,
      pageSize: 50,
      useVirtualTable: false
    }
  },
  computed: {
    successRate() {
      if (this.totalRows === 0) return 0
      return Math.round((this.validRows / this.totalRows) * 100)
    },
    
    displayData() {
      let data = this.showOnlyErrors ? this.getErrorRowsData() : this.previewData
      return data
    },
    
    paginatedData() {
      if (this.useVirtualTable) return this.displayData
      
      // 分页处理
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.displayData.slice(start, end)
    },
    
    virtualTableColumns() {
      const columns = this.tableFields.map(field => ({
        key: field.key,
        label: field.label,
        width: field.width || 120
      }))
      
      // 添加状态列
      columns.push({
        key: 'status',
        label: '状态',
        width: 100
      })
      
      return columns
    },
    
    totalCount() {
      return this.showOnlyErrors ? this.getErrorRowsData().length : this.previewData.length
    }
  },
  
  watch: {
    // 监控数据量，自动切换虚拟表格
    'previewData.length'(newLength) {
      // 大于1000行数据时自动启用虚拟表格
      if (newLength > 1000) {
        this.useVirtualTable = true
      }
    }
  },
  methods: {
    // 获起行的CSS类名
    getRowClassName({ row, rowIndex }) {
      return row._isValid ? '' : 'error-row'
    },
        
    // 虚拟表格的行类名函数
    getVirtualRowClassName({ row, index }) {
      return row._isValid ? '' : 'error-row'
    },
    
    // 获取单元格CSS类名
    getCellClass(row, fieldKey) {
      if (!row._fieldErrors || !row._fieldErrors[fieldKey]) {
        return ''
      }
      return 'error-cell'
    },
    
    // 检查字段是否有错误
    hasFieldError(row, fieldKey) {
      return row._fieldErrors && row._fieldErrors[fieldKey]
    },
    
    // 获取字段错误信息
    getFieldErrorMessage(row, fieldKey) {
      if (!row._fieldErrors || !row._fieldErrors[fieldKey]) {
        return ''
      }
      return row._fieldErrors[fieldKey].join('; ')
    },
    
    // 格式化单元格值
    formatCellValue(value, type) {
      if (value === null || value === undefined || value === '') {
        return '-'
      }
      
      switch (type) {
        case 'price':
          return `¥${Number(value).toFixed(2)}`
        case 'weight':
          return `${value}g`
        case 'status':
          return value === '1' || value === 1 || value === '上架' ? '上架' : '下架'
        case 'number':
          return Number(value).toLocaleString()
        default:
          return value
      }
    },
    
    // 获取错误行的完整数据
    getErrorRowsData() {
      const errorRowNumbers = this.errorRows.map(item => item.row)
      return this.previewData.filter((row, index) => {
        return errorRowNumbers.includes(index + 2) // Excel行号从2开始（去掉表头）
      })
    },
    
    // 切换错误行显示
    filterErrorRows() {
      this.showOnlyErrors = !this.showOnlyErrors
      this.currentPage = 1
    },
    
    // 切换虚拟表格
    toggleVirtualTable() {
      this.useVirtualTable = !this.useVirtualTable
      this.currentPage = 1
    },
    
    // 分页处理
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
    },
    
    handleCurrentChange(val) {
      this.currentPage = val
    }
  }
}
</script>

<style scoped>
.data-preview {
  width: 100%;
}

.preview-header {
  margin-bottom: 20px;
}

.stats-info {
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  color: #606266;
  font-size: 14px;
}

.stat-value {
  color: #303133;
  font-size: 20px;
  font-weight: bold;
  margin-left: 5px;
}

.stat-item.success .stat-value {
  color: #67c23a;
}

.stat-item.error .stat-value {
  color: #f56c6c;
}

.error-summary {
  margin-bottom: 20px;
}

.error-detail {
  margin-top: 15px;
}

.error-messages {
  line-height: 1.6;
}

.error-msg {
  margin: 2px 0;
  color: #f56c6c;
  font-size: 12px;
}

.preview-table {
  margin-bottom: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.table-header h4 {
  margin: 0;
  color: #303133;
}

.cell-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.field-error-icon {
  color: #f56c6c;
  margin-left: 5px;
  cursor: help;
}

.error-cell {
  color: #f56c6c;
  background-color: #fef0f0;
  padding: 2px 4px;
  border-radius: 2px;
}

.pagination-container {
  text-align: center;
  margin-top: 20px;
}

/* 全局样式 */
.data-preview >>> .error-row {
  background-color: #fef0f0;
}

.data-preview >>> .error-row:hover {
  background-color: #fde2e2 !important;
}

.data-preview >>> .error-table .el-table__row {
  background-color: #fef0f0;
}
</style>