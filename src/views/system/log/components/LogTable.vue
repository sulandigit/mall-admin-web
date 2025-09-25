<template>
  <div class="log-table">
    <div class="table-header">
      <div class="header-left">
        <el-button 
          type="danger" 
          size="small"
          :disabled="multipleSelection.length === 0"
          @click="handleBatchDelete"
        >
          <i class="el-icon-delete"></i>
          批量删除
        </el-button>
      </div>
      <div class="header-right">
        <span class="total-info">共 {{ pagination.total }} 条记录</span>
      </div>
    </div>
    
    <el-table
      ref="logTable"
      :data="logList"
      v-loading="loading"
      stripe
      border
      style="width: 100%"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      
      <el-table-column
        prop="operationTime"
        label="操作时间"
        width="160"
        align="center"
        sortable="custom"
      >
        <template slot-scope="scope">
          {{ formatTime(scope.row.operationTime) }}
        </template>
      </el-table-column>
      
      <el-table-column
        prop="username"
        label="用户名"
        width="120"
        align="left"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <el-link 
            type="primary" 
            @click="viewUserDetail(scope.row.userId)"
            :underline="false"
          >
            {{ scope.row.username }}
          </el-link>
        </template>
      </el-table-column>
      
      <el-table-column
        prop="operationType"
        label="操作类型"
        width="100"
        align="center"
      >
        <template slot-scope="scope">
          <el-tag :type="getOperationTypeTagType(scope.row.operationType)">
            {{ getOperationTypeLabel(scope.row.operationType) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column
        prop="moduleName"
        label="模块名称"
        width="120"
        align="left"
        show-overflow-tooltip
      />
      
      <el-table-column
        prop="operationDesc"
        label="操作描述"
        width="200"
        align="left"
        show-overflow-tooltip
      />
      
      <el-table-column
        prop="ipAddress"
        label="IP地址"
        width="120"
        align="center"
      />
      
      <el-table-column
        prop="status"
        label="状态"
        width="80"
        align="center"
      >
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 'SUCCESS' ? 'success' : 'danger'">
            {{ scope.row.status === 'SUCCESS' ? '成功' : '失败' }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column
        prop="duration"
        label="耗时(ms)"
        width="90"
        align="center"
        sortable="custom"
      >
        <template slot-scope="scope">
          <span :class="getDurationClass(scope.row.duration)">
            {{ scope.row.duration || 0 }}
          </span>
        </template>
      </el-table-column>
      
      <el-table-column
        label="操作"
        width="120"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            @click="viewLogDetail(scope.row)"
          >
            详情
          </el-button>
          <el-button
            type="danger"
            size="mini"
            @click="handleDelete(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页组件 -->
    <div class="pagination-wrapper">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagination.current"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'LogTable',
  data() {
    return {
      multipleSelection: []
    }
  },
  computed: {
    ...mapGetters('log', [
      'logList',
      'pagination',
      'loading'
    ])
  },
  methods: {
    // 格式化时间
    formatTime(time) {
      if (!time) return ''
      return new Date(time).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    },
    
    // 获取操作类型标签样式
    getOperationTypeTagType(type) {
      const typeMap = {
        'LOGIN': 'success',
        'LOGOUT': 'info',
        'CREATE': 'primary',
        'UPDATE': 'warning',
        'DELETE': 'danger',
        'QUERY': '',
        'EXPORT': 'success',
        'BATCH': 'warning'
      }
      return typeMap[type] || ''
    },
    
    // 获取操作类型标签文本
    getOperationTypeLabel(type) {
      const labelMap = {
        'LOGIN': '登录',
        'LOGOUT': '登出',
        'CREATE': '创建',
        'UPDATE': '更新',
        'DELETE': '删除',
        'QUERY': '查询',
        'EXPORT': '导出',
        'BATCH': '批量'
      }
      return labelMap[type] || type
    },
    
    // 获取耗时样式类
    getDurationClass(duration) {
      if (duration > 3000) {
        return 'duration-slow'
      } else if (duration > 1000) {
        return 'duration-medium'
      }
      return 'duration-fast'
    },
    
    // 多选变化
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    
    // 排序变化
    handleSortChange({ column, prop, order }) {
      const sortParams = {
        sortField: prop,
        sortOrder: order === 'ascending' ? 'asc' : 'desc'
      }
      this.$emit('sort-change', sortParams)
    },
    
    // 每页大小变化
    handleSizeChange(val) {
      this.$store.dispatch('log/updatePagination', { pageSize: val, current: 1 })
      this.$emit('page-change')
    },
    
    // 当前页变化
    handleCurrentChange(val) {
      this.$store.dispatch('log/updatePagination', { current: val })
      this.$emit('page-change')
    },
    
    // 查看日志详情
    viewLogDetail(row) {
      this.$emit('view-detail', row)
    },
    
    // 查看用户详情
    viewUserDetail(userId) {
      this.$emit('view-user', userId)
    },
    
    // 删除日志
    handleDelete(row) {
      this.$confirm(`确定要删除用户 "${row.username}" 在 ${this.formatTime(row.operationTime)} 的操作记录吗？`, '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await this.$store.dispatch('log/deleteLog', row.id)
          this.$message.success('删除成功')
        } catch (error) {
          this.$message.error('删除失败: ' + error.message)
        }
      }).catch(() => {
        // 用户取消删除
      })
    },
    
    // 批量删除日志
    handleBatchDelete() {
      const ids = this.multipleSelection.map(item => item.id)
      this.$confirm(`确定要删除选中的 ${ids.length} 条操作记录吗？`, '确认批量删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await this.$store.dispatch('log/batchDeleteLogs', ids)
          this.$message.success('批量删除成功')
          // 清空选择
          this.multipleSelection = []
          this.$refs.logTable.clearSelection()
        } catch (error) {
          this.$message.error('批量删除失败: ' + error.message)
        }
      }).catch(() => {
        // 用户取消删除
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.log-table {
  background: #fff;
  border-radius: 4px;
  
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #ebeef5;
    
    .total-info {
      color: #606266;
      font-size: 14px;
    }
  }
  
  .pagination-wrapper {
    padding: 20px;
    text-align: right;
  }
  
  // 耗时样式
  .duration-fast {
    color: #67c23a;
  }
  
  .duration-medium {
    color: #e6a23c;
  }
  
  .duration-slow {
    color: #f56c6c;
  }
}
</style>