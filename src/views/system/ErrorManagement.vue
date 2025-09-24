<template>
  <div class=\"error-management\">
    <!-- 错误统计面板 -->
    <el-card class=\"stats-card\" shadow=\"hover\">
      <div slot=\"header\" class=\"card-header\">
        <span class=\"card-title\">
          <i class=\"el-icon-data-analysis\"></i>
          错误统计
        </span>
        <el-button size=\"mini\" @click=\"refreshStats\">刷新</el-button>
      </div>
      
      <el-row :gutter=\"20\">
        <el-col :span=\"6\">
          <div class=\"stat-item\">
            <div class=\"stat-number\">{{ stats.total }}</div>
            <div class=\"stat-label\">总错误数</div>
          </div>
        </el-col>
        <el-col :span=\"6\">
          <div class=\"stat-item\">
            <div class=\"stat-number\">{{ stats.pending }}</div>
            <div class=\"stat-label\">待上报</div>
          </div>
        </el-col>
        <el-col :span=\"6\">
          <div class=\"stat-item\">
            <div class=\"stat-number\">{{ stats.byLevel.error + stats.byLevel.critical }}</div>
            <div class=\"stat-label\">严重错误</div>
          </div>
        </el-col>
        <el-col :span=\"6\">
          <div class=\"stat-item\">
            <div class=\"stat-number\">{{ stats.byLevel.warn }}</div>
            <div class=\"stat-label\">警告</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 工具栏 -->
    <el-card class=\"toolbar-card\" shadow=\"hover\">
      <el-row :gutter=\"10\">
        <el-col :span=\"12\">
          <el-button-group>
            <el-button size=\"small\" icon=\"el-icon-upload\" @click=\"batchReport\">
              批量上报
            </el-button>
            <el-button size=\"small\" icon=\"el-icon-download\" @click=\"exportLogs\">
              导出日志
            </el-button>
            <el-button size=\"small\" icon=\"el-icon-delete\" type=\"danger\" @click=\"clearLogs\">
              清空日志
            </el-button>
          </el-button-group>
        </el-col>
        <el-col :span=\"12\">
          <div style=\"float: right;\">
            <el-switch
              v-model=\"loggerEnabled\"
              active-text=\"日志记录\"
              inactive-text=\"已禁用\"
              @change=\"toggleLogger\"
            ></el-switch>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 过滤器 -->
    <el-card class=\"filter-card\" shadow=\"hover\">
      <el-row :gutter=\"20\">
        <el-col :span=\"6\">
          <el-select v-model=\"filters.level\" placeholder=\"错误级别\" clearable>
            <el-option label=\"信息\" value=\"info\"></el-option>
            <el-option label=\"警告\" value=\"warn\"></el-option>
            <el-option label=\"错误\" value=\"error\"></el-option>
            <el-option label=\"严重\" value=\"critical\"></el-option>
          </el-select>
        </el-col>
        <el-col :span=\"6\">
          <el-select v-model=\"filters.type\" placeholder=\"错误类型\" clearable>
            <el-option 
              v-for=\"type in errorTypes\" 
              :key=\"type\" 
              :label=\"type\" 
              :value=\"type\"
            ></el-option>
          </el-select>
        </el-col>
        <el-col :span=\"6\">
          <el-select v-model=\"filters.reported\" placeholder=\"上报状态\" clearable>
            <el-option label=\"已上报\" :value=\"true\"></el-option>
            <el-option label=\"未上报\" :value=\"false\"></el-option>
          </el-select>
        </el-col>
        <el-col :span=\"6\">
          <el-input
            v-model=\"filters.search\"
            placeholder=\"搜索错误消息\"
            prefix-icon=\"el-icon-search\"
            clearable
          ></el-input>
        </el-col>
      </el-row>
    </el-card>

    <!-- 错误列表 -->
    <el-card class=\"logs-card\" shadow=\"hover\">
      <div slot=\"header\" class=\"card-header\">
        <span class=\"card-title\">
          <i class=\"el-icon-warning\"></i>
          错误日志 ({{ filteredLogs.length }})
        </span>
      </div>
      
      <el-table 
        :data=\"paginatedLogs\" 
        stripe 
        :default-sort=\"{prop: 'timestamp', order: 'descending'}\"
        @row-click=\"showErrorDetail\"
        style=\"cursor: pointer;\"
      >
        <el-table-column prop=\"timestamp\" label=\"时间\" width=\"180\" sortable>
          <template slot-scope=\"scope\">
            {{ formatTime(scope.row.timestamp) }}
          </template>
        </el-table-column>
        
        <el-table-column prop=\"level\" label=\"级别\" width=\"80\">
          <template slot-scope=\"scope\">
            <el-tag :type=\"getLevelTagType(scope.row.level)\" size=\"mini\">
              {{ scope.row.level.toUpperCase() }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop=\"type\" label=\"类型\" width=\"150\">
          <template slot-scope=\"scope\">
            <span class=\"error-type\">{{ scope.row.type }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop=\"message\" label=\"错误消息\" min-width=\"300\">
          <template slot-scope=\"scope\">
            <div class=\"error-message\">
              {{ scope.row.message }}
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop=\"reported\" label=\"状态\" width=\"80\">
          <template slot-scope=\"scope\">
            <el-tag :type=\"scope.row.reported ? 'success' : 'warning'\" size=\"mini\">
              {{ scope.row.reported ? '已上报' : '待上报' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label=\"操作\" width=\"120\">
          <template slot-scope=\"scope\">
            <el-button 
              size=\"mini\" 
              type=\"text\" 
              @click.stop=\"showErrorDetail(scope.row)\"
            >
              详情
            </el-button>
            <el-button 
              v-if=\"!scope.row.reported\" 
              size=\"mini\" 
              type=\"text\" 
              @click.stop=\"reportSingleError(scope.row)\"
            >
              上报
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class=\"pagination-wrapper\">
        <el-pagination
          @size-change=\"handleSizeChange\"
          @current-change=\"handleCurrentChange\"
          :current-page=\"currentPage\"
          :page-sizes=\"[10, 20, 50, 100]\"
          :page-size=\"pageSize\"
          layout=\"total, sizes, prev, pager, next, jumper\"
          :total=\"filteredLogs.length\"
        >
        </el-pagination>
      </div>
    </el-card>

    <!-- 错误详情对话框 -->
    <el-dialog 
      title=\"错误详情\" 
      :visible.sync=\"detailDialogVisible\" 
      width=\"80%\"
      top=\"5vh\"
    >
      <div v-if=\"selectedError\">
        <el-descriptions :column=\"2\" border>
          <el-descriptions-item label=\"错误ID\">{{ selectedError.id }}</el-descriptions-item>
          <el-descriptions-item label=\"时间\">{{ formatTime(selectedError.timestamp) }}</el-descriptions-item>
          <el-descriptions-item label=\"级别\">
            <el-tag :type=\"getLevelTagType(selectedError.level)\">{{ selectedError.level.toUpperCase() }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label=\"类型\">{{ selectedError.type }}</el-descriptions-item>
          <el-descriptions-item label=\"用户ID\">{{ selectedError.userId }}</el-descriptions-item>
          <el-descriptions-item label=\"会话ID\">{{ selectedError.sessionId }}</el-descriptions-item>
          <el-descriptions-item label=\"URL\" :span=\"2\">{{ selectedError.url }}</el-descriptions-item>
          <el-descriptions-item label=\"消息\" :span=\"2\">{{ selectedError.message }}</el-descriptions-item>
        </el-descriptions>
        
        <div class=\"detail-section\" v-if=\"selectedError.stack\">
          <h4>错误堆栈</h4>
          <pre class=\"stack-trace\">{{ selectedError.stack }}</pre>
        </div>
        
        <div class=\"detail-section\" v-if=\"selectedError.extra && Object.keys(selectedError.extra).length > 0\">
          <h4>额外信息</h4>
          <pre class=\"extra-info\">{{ JSON.stringify(selectedError.extra, null, 2) }}</pre>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getLogStats, clearLogs, exportLogs, batchReport, setLoggerEnabled } from '@/utils/errorLogger'
import errorLogger from '@/utils/errorLogger'

export default {
  name: 'ErrorManagement',
  data() {
    return {
      stats: {
        total: 0,
        reported: 0,
        pending: 0,
        byLevel: {
          info: 0,
          warn: 0,
          error: 0,
          critical: 0
        },
        byType: {}
      },
      logs: [],
      filteredLogs: [],
      currentPage: 1,
      pageSize: 20,
      loggerEnabled: true,
      detailDialogVisible: false,
      selectedError: null,
      filters: {
        level: '',
        type: '',
        reported: '',
        search: ''
      }
    }
  },
  
  computed: {
    errorTypes() {
      return Object.keys(this.stats.byType)
    },
    
    paginatedLogs() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredLogs.slice(start, end)
    }
  },
  
  watch: {
    filters: {
      handler() {
        this.filterLogs()
      },
      deep: true
    }
  },
  
  mounted() {
    this.loadData()
    
    // 定期刷新数据
    this.refreshTimer = setInterval(() => {
      this.refreshStats()
    }, 30000) // 每30秒刷新一次
  },
  
  beforeDestroy() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }
  },
  
  methods: {
    loadData() {
      this.refreshStats()
      this.logs = errorLogger.getLocalLogs()
      this.filterLogs()
    },
    
    refreshStats() {
      this.stats = getLogStats()
    },
    
    filterLogs() {
      let filtered = [...this.logs]
      
      // 按级别过滤
      if (this.filters.level) {
        filtered = filtered.filter(log => log.level === this.filters.level)
      }
      
      // 按类型过滤
      if (this.filters.type) {
        filtered = filtered.filter(log => log.type === this.filters.type)
      }
      
      // 按上报状态过滤
      if (this.filters.reported !== '') {
        filtered = filtered.filter(log => log.reported === this.filters.reported)
      }
      
      // 按搜索关键词过滤
      if (this.filters.search) {
        const searchTerm = this.filters.search.toLowerCase()
        filtered = filtered.filter(log => 
          log.message.toLowerCase().includes(searchTerm) ||
          log.type.toLowerCase().includes(searchTerm)
        )
      }
      
      this.filteredLogs = filtered
      this.currentPage = 1
    },
    
    async batchReport() {
      try {
        await batchReport()
        this.$message.success('批量上报完成')
        this.loadData()
      } catch (error) {
        this.$message.error('批量上报失败: ' + error.message)
      }
    },
    
    exportLogs() {
      try {
        exportLogs()
        this.$message.success('日志导出成功')
      } catch (error) {
        this.$message.error('日志导出失败: ' + error.message)
      }
    },
    
    clearLogs() {
      this.$confirm('确定要清空所有日志吗？此操作不可恢复。', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        clearLogs()
        this.$message.success('日志已清空')
        this.loadData()
      })
    },
    
    toggleLogger(enabled) {
      setLoggerEnabled(enabled)
      this.$message.success(`错误日志记录已${enabled ? '启用' : '禁用'}`)
    },
    
    async reportSingleError(error) {
      try {
        // 这里应该调用单个错误上报的方法
        await errorLogger.reportToServer(error)
        this.$message.success('错误上报成功')
        this.loadData()
      } catch (err) {
        this.$message.error('错误上报失败: ' + err.message)
      }
    },
    
    showErrorDetail(error) {
      this.selectedError = error
      this.detailDialogVisible = true
    },
    
    formatTime(timestamp) {
      return new Date(timestamp).toLocaleString('zh-CN')
    },
    
    getLevelTagType(level) {
      const typeMap = {
        info: '',
        warn: 'warning',
        error: 'danger',
        critical: 'danger'
      }
      return typeMap[level] || ''
    },
    
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
    },
    
    handleCurrentChange(page) {
      this.currentPage = page
    }
  }
}
</script>

<style scoped>
.error-management {
  padding: 20px;
}

.stats-card,
.toolbar-card,
.filter-card,
.logs-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
}

.card-title i {
  margin-right: 8px;
  color: #409EFF;
}

.stat-item {
  text-align: center;
  padding: 10px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.error-type {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  background: #f5f5f5;
  padding: 2px 4px;
  border-radius: 3px;
}

.error-message {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

.detail-section {
  margin-top: 20px;
}

.detail-section h4 {
  margin-bottom: 10px;
  color: #333;
}

.stack-trace,
.extra-info {
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  max-height: 300px;
  overflow-y: auto;
  font-size: 12px;
  line-height: 1.4;
}

.el-table__row {
  cursor: pointer;
}

.el-table__row:hover {
  background-color: #f5f7fa;
}
</style>", "original_text": ""}]