<template>
  <div class="log-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="page-title">
        <h2>操作日志</h2>
        <p>查看和管理系统操作日志，追踪用户行为和系统事件</p>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon total">
              <i class="el-icon-document"></i>
            </div>
            <div class="stat-info">
              <p class="stat-label">总日志数</p>
              <p class="stat-value">{{ statistics.totalCount | formatNumber }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon today">
              <i class="el-icon-date"></i>
            </div>
            <div class="stat-info">
              <p class="stat-label">今日操作</p>
              <p class="stat-value">{{ statistics.todayCount | formatNumber }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon success">
              <i class="el-icon-success"></i>
            </div>
            <div class="stat-info">
              <p class="stat-label">成功率</p>
              <p class="stat-value">{{ statistics.successRate }}%</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon error">
              <i class="el-icon-warning"></i>
            </div>
            <div class="stat-info">
              <p class="stat-label">异常数量</p>
              <p class="stat-value">{{ statistics.errorCount | formatNumber }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索组件 -->
    <log-search
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
    />

    <!-- 表格组件 -->
    <log-table
      @view-detail="handleViewDetail"
      @view-user="handleViewUser"
      @page-change="handlePageChange"
      @sort-change="handleSortChange"
    />

    <!-- 日志详情对话框 -->
    <log-detail
      :visible="detailVisible"
      :log-detail="currentLogDetail"
      @close="detailVisible = false"
    />

    <!-- 导出对话框 -->
    <el-dialog
      title="导出日志"
      :visible.sync="exportDialogVisible"
      width="500px"
    >
      <el-form :model="exportForm" label-width="100px">
        <el-form-item label="导出格式">
          <el-radio-group v-model="exportForm.format">
            <el-radio label="excel">Excel格式</el-radio>
            <el-radio label="csv">CSV格式</el-radio>
            <el-radio label="pdf">PDF格式</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="导出字段">
          <el-checkbox-group v-model="exportForm.fields">
            <el-checkbox label="operationTime">操作时间</el-checkbox>
            <el-checkbox label="username">用户名</el-checkbox>
            <el-checkbox label="operationType">操作类型</el-checkbox>
            <el-checkbox label="moduleName">模块名称</el-checkbox>
            <el-checkbox label="operationDesc">操作描述</el-checkbox>
            <el-checkbox label="ipAddress">IP地址</el-checkbox>
            <el-checkbox label="status">操作状态</el-checkbox>
            <el-checkbox label="duration">执行时长</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="exportForm.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="exportDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmExport" :loading="exportLoading">
          确认导出
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import LogSearch from './components/LogSearch'
import LogTable from './components/LogTable'
import LogDetail from './components/LogDetail'

export default {
  name: 'LogManagement',
  components: {
    LogSearch,
    LogTable,
    LogDetail
  },
  data() {
    return {
      detailVisible: false,
      exportDialogVisible: false,
      exportForm: {
        format: 'excel',
        fields: ['operationTime', 'username', 'operationType', 'moduleName', 'operationDesc', 'ipAddress', 'status'],
        timeRange: []
      }
    }
  },
  computed: {
    ...mapGetters('log', [
      'statistics',
      'currentLogDetail',
      'exportLoading'
    ])
  },
  filters: {
    formatNumber(value) {
      if (!value) return '0'
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
  },
  async created() {
    await this.initData()
  },
  methods: {
    ...mapActions('log', [
      'fetchLogList',
      'getLogStatistics',
      'fetchLogDetail',
      'exportLogs'
    ]),

    // 初始化数据
    async initData() {
      try {
        await Promise.all([
          this.fetchLogList(),
          this.getLogStatistics()
        ])
      } catch (error) {
        console.error('初始化数据失败:', error)
        this.$message.error('加载数据失败')
      }
    },

    // 搜索
    async handleSearch() {
      try {
        await this.fetchLogList()
      } catch (error) {
        console.error('搜索失败:', error)
        this.$message.error('搜索失败')
      }
    },

    // 重置
    async handleReset() {
      try {
        await this.fetchLogList()
      } catch (error) {
        console.error('重置失败:', error)
        this.$message.error('重置失败')
      }
    },

    // 导出
    handleExport() {
      this.exportDialogVisible = true
    },

    // 确认导出
    async confirmExport() {
      try {
        const params = {
          format: this.exportForm.format,
          fields: this.exportForm.fields,
          filters: {
            ...this.$store.getters['log/searchForm']
          }
        }

        // 处理时间范围
        if (this.exportForm.timeRange && this.exportForm.timeRange.length === 2) {
          params.filters.startTime = this.exportForm.timeRange[0]
          params.filters.endTime = this.exportForm.timeRange[1]
        }

        await this.exportLogs(params)
        this.exportDialogVisible = false
        this.$message.success('导出成功')
      } catch (error) {
        console.error('导出失败:', error)
        this.$message.error('导出失败: ' + error.message)
      }
    },

    // 查看详情
    async handleViewDetail(row) {
      try {
        await this.fetchLogDetail(row.id)
        this.detailVisible = true
      } catch (error) {
        console.error('获取详情失败:', error)
        this.$message.error('获取详情失败')
      }
    },

    // 查看用户
    handleViewUser(userId) {
      // 跳转到用户管理页面
      this.$router.push({ path: '/ums/admin', query: { userId } })
    },

    // 分页变化
    async handlePageChange() {
      try {
        await this.fetchLogList()
      } catch (error) {
        console.error('分页查询失败:', error)
        this.$message.error('分页查询失败')
      }
    },

    // 排序变化
    async handleSortChange(sortParams) {
      try {
        await this.fetchLogList(sortParams)
      } catch (error) {
        console.error('排序查询失败:', error)
        this.$message.error('排序查询失败')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.log-management {
  padding: 20px;
  
  .page-header {
    margin-bottom: 24px;
    
    .page-title {
      h2 {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
        color: #303133;
      }
      
      p {
        margin: 0;
        font-size: 14px;
        color: #909399;
      }
    }
  }
  
  .stats-cards {
    margin-bottom: 24px;
    
    .stat-card {
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.15);
      }
      
      .stat-content {
        display: flex;
        align-items: center;
        
        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          
          i {
            font-size: 24px;
            color: #fff;
          }
          
          &.total {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          
          &.today {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }
          
          &.success {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          }
          
          &.error {
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
          }
        }
        
        .stat-info {
          flex: 1;
          
          .stat-label {
            margin: 0 0 4px 0;
            font-size: 14px;
            color: #909399;
          }
          
          .stat-value {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            color: #303133;
          }
        }
      }
    }
  }
}
</style>