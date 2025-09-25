<template>
  <div class="audit-table">
    <!-- 数据变更记录表格 -->
    <el-card class="table-card" shadow="never">
      <div slot="header" class="card-header">
        <span>数据变更记录</span>
        <div class="header-actions">
          <el-button type="primary" size="mini" @click="refreshDataChanges">
            <i class="el-icon-refresh"></i>
            刷新
          </el-button>
          <el-button type="success" size="mini" @click="exportDataChanges">
            <i class="el-icon-download"></i>
            导出
          </el-button>
        </div>
      </div>
      
      <!-- 搜索条件 -->
      <div class="search-bar">
        <el-form :model="dataChangeSearchForm" :inline="true" size="mini">
          <el-form-item label="表名">
            <el-input
              v-model="dataChangeSearchForm.tableName"
              placeholder="请输入表名"
              clearable
              style="width: 150px"
            />
          </el-form-item>
          <el-form-item label="变更类型">
            <el-select
              v-model="dataChangeSearchForm.changeType"
              placeholder="请选择"
              clearable
              style="width: 120px"
            >
              <el-option label="新增" value="INSERT" />
              <el-option label="更新" value="UPDATE" />
              <el-option label="删除" value="DELETE" />
            </el-select>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="dataChangeSearchForm.timeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="yyyy-MM-dd HH:mm"
              value-format="yyyy-MM-dd HH:mm:ss"
              style="width: 300px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchDataChanges">查询</el-button>
            <el-button @click="resetDataChangeSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <el-table
        :data="dataChanges.list"
        v-loading="dataChangesLoading"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column
          prop="changeTime"
          label="变更时间"
          width="160"
          align="center"
        >
          <template slot-scope="scope">
            {{ formatTime(scope.row.changeTime) }}
          </template>
        </el-table-column>
        
        <el-table-column
          prop="tableName"
          label="表名"
          width="120"
          align="left"
        />
        
        <el-table-column
          prop="recordId"
          label="记录ID"
          width="100"
          align="center"
        />
        
        <el-table-column
          prop="fieldName"
          label="字段名"
          width="120"
          align="left"
        />
        
        <el-table-column
          prop="changeType"
          label="变更类型"
          width="100"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag :type="getChangeTypeTagType(scope.row.changeType)">
              {{ getChangeTypeLabel(scope.row.changeType) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="oldValue"
          label="变更前"
          width="150"
          align="left"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span class="old-value">{{ scope.row.oldValue || '-' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="newValue"
          label="变更后"
          width="150"
          align="left"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span class="new-value">{{ scope.row.newValue || '-' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="operator"
          label="操作人"
          width="100"
          align="center"
        />
        
        <el-table-column
          label="操作"
          width="100"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              @click="viewChangeDetail(scope.row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          @size-change="handleDataChangesSizeChange"
          @current-change="handleDataChangesCurrentChange"
          :current-page="dataChanges.pagination.current"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="dataChanges.pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="dataChanges.pagination.total"
        />
      </div>
    </el-card>

    <!-- 安全告警表格 -->
    <el-card class="table-card" shadow="never">
      <div slot="header" class="card-header">
        <span>安全告警</span>
        <div class="header-actions">
          <el-button type="primary" size="mini" @click="refreshSecurityAlerts">
            <i class="el-icon-refresh"></i>
            刷新
          </el-button>
        </div>
      </div>
      
      <!-- 搜索条件 -->
      <div class="search-bar">
        <el-form :model="alertSearchForm" :inline="true" size="mini">
          <el-form-item label="告警级别">
            <el-select
              v-model="alertSearchForm.alertLevel"
              placeholder="请选择"
              clearable
              style="width: 120px"
            >
              <el-option label="低" value="LOW" />
              <el-option label="中" value="MEDIUM" />
              <el-option label="高" value="HIGH" />
            </el-select>
          </el-form-item>
          <el-form-item label="处理状态">
            <el-select
              v-model="alertSearchForm.status"
              placeholder="请选择"
              clearable
              style="width: 120px"
            >
              <el-option label="待处理" value="PENDING" />
              <el-option label="处理中" value="PROCESSING" />
              <el-option label="已处理" value="RESOLVED" />
              <el-option label="已忽略" value="IGNORED" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchSecurityAlerts">查询</el-button>
            <el-button @click="resetAlertSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <el-table
        :data="securityAlerts.list"
        v-loading="securityAlertsLoading"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column
          prop="alertTime"
          label="告警时间"
          width="160"
          align="center"
        >
          <template slot-scope="scope">
            {{ formatTime(scope.row.alertTime) }}
          </template>
        </el-table-column>
        
        <el-table-column
          prop="alertType"
          label="告警类型"
          width="120"
          align="left"
        />
        
        <el-table-column
          prop="alertLevel"
          label="告警级别"
          width="100"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag :type="getAlertLevelTagType(scope.row.alertLevel)">
              {{ getAlertLevelLabel(scope.row.alertLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="description"
          label="告警描述"
          min-width="200"
          align="left"
          show-overflow-tooltip
        />
        
        <el-table-column
          prop="sourceIP"
          label="来源IP"
          width="120"
          align="center"
        />
        
        <el-table-column
          prop="status"
          label="处理状态"
          width="100"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column
          label="操作"
          width="150"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              @click="viewAlertDetail(scope.row)"
            >
              详情
            </el-button>
            <el-button
              v-if="scope.row.status === 'PENDING'"
              type="warning"
              size="mini"
              @click="handleAlert(scope.row)"
            >
              处理
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          @size-change="handleSecurityAlertsSizeChange"
          @current-change="handleSecurityAlertsCurrentChange"
          :current-page="securityAlerts.pagination.current"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="securityAlerts.pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="securityAlerts.pagination.total"
        />
      </div>
    </el-card>

    <!-- 处理告警对话框 -->
    <el-dialog
      title="处理安全告警"
      :visible.sync="handleAlertDialogVisible"
      width="500px"
    >
      <el-form :model="handleAlertForm" label-width="100px">
        <el-form-item label="处理动作">
          <el-radio-group v-model="handleAlertForm.action">
            <el-radio label="RESOLVE">标记已解决</el-radio>
            <el-radio label="IGNORE">忽略告警</el-radio>
            <el-radio label="ESCALATE">升级处理</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理备注">
          <el-input
            v-model="handleAlertForm.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入处理备注"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleAlertDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmHandleAlert">确认处理</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'AuditTable',
  data() {
    return {
      dataChangesLoading: false,
      securityAlertsLoading: false,
      handleAlertDialogVisible: false,
      currentAlert: null,
      
      // 数据变更搜索表单
      dataChangeSearchForm: {
        tableName: '',
        changeType: '',
        timeRange: []
      },
      
      // 安全告警搜索表单
      alertSearchForm: {
        alertLevel: '',
        status: ''
      },
      
      // 处理告警表单
      handleAlertForm: {
        action: 'RESOLVE',
        remark: ''
      }
    }
  },
  computed: {
    ...mapGetters('audit', [
      'dataChanges',
      'securityAlerts'
    ])
  },
  async created() {
    await this.loadAllData()
  },
  methods: {
    ...mapActions('audit', [
      'getDataChanges',
      'getSecurityAlerts',
      'handleSecurityAlert'
    ]),

    // 加载所有数据
    async loadAllData() {
      await Promise.all([
        this.loadDataChanges(),
        this.loadSecurityAlerts()
      ])
    },

    // 加载数据变更记录
    async loadDataChanges() {
      this.dataChangesLoading = true
      try {
        const params = {
          pageNum: this.dataChanges.pagination.current,
          pageSize: this.dataChanges.pagination.pageSize,
          ...this.dataChangeSearchForm
        }
        
        // 处理时间范围
        if (params.timeRange && params.timeRange.length === 2) {
          params.startTime = params.timeRange[0]
          params.endTime = params.timeRange[1]
          delete params.timeRange
        }
        
        await this.getDataChanges(params)
      } catch (error) {
        console.error('加载数据变更记录失败:', error)
        this.$message.error('加载数据变更记录失败')
      } finally {
        this.dataChangesLoading = false
      }
    },

    // 加载安全告警
    async loadSecurityAlerts() {
      this.securityAlertsLoading = true
      try {
        const params = {
          pageNum: this.securityAlerts.pagination.current,
          pageSize: this.securityAlerts.pagination.pageSize,
          ...this.alertSearchForm
        }
        
        await this.getSecurityAlerts(params)
      } catch (error) {
        console.error('加载安全告警失败:', error)
        this.$message.error('加载安全告警失败')
      } finally {
        this.securityAlertsLoading = false
      }
    },

    // 格式化时间
    formatTime(time) {
      if (!time) return ''
      return new Date(time).toLocaleString('zh-CN')
    },

    // 获取变更类型标签样式
    getChangeTypeTagType(type) {
      const typeMap = {
        'INSERT': 'success',
        'UPDATE': 'warning',
        'DELETE': 'danger'
      }
      return typeMap[type] || ''
    },

    // 获取变更类型标签文本
    getChangeTypeLabel(type) {
      const labelMap = {
        'INSERT': '新增',
        'UPDATE': '更新',
        'DELETE': '删除'
      }
      return labelMap[type] || type
    },

    // 获取告警级别标签样式
    getAlertLevelTagType(level) {
      const typeMap = {
        'LOW': 'info',
        'MEDIUM': 'warning',
        'HIGH': 'danger'
      }
      return typeMap[level] || ''
    },

    // 获取告警级别标签文本
    getAlertLevelLabel(level) {
      const labelMap = {
        'LOW': '低',
        'MEDIUM': '中',
        'HIGH': '高'
      }
      return labelMap[level] || level
    },

    // 获取状态标签样式
    getStatusTagType(status) {
      const typeMap = {
        'PENDING': 'warning',
        'PROCESSING': 'info',
        'RESOLVED': 'success',
        'IGNORED': ''
      }
      return typeMap[status] || ''
    },

    // 获取状态标签文本
    getStatusLabel(status) {
      const labelMap = {
        'PENDING': '待处理',
        'PROCESSING': '处理中',
        'RESOLVED': '已处理',
        'IGNORED': '已忽略'
      }
      return labelMap[status] || status
    },

    // 搜索数据变更
    searchDataChanges() {
      this.loadDataChanges()
    },

    // 重置数据变更搜索
    resetDataChangeSearch() {
      this.dataChangeSearchForm = {
        tableName: '',
        changeType: '',
        timeRange: []
      }
      this.loadDataChanges()
    },

    // 搜索安全告警
    searchSecurityAlerts() {
      this.loadSecurityAlerts()
    },

    // 重置告警搜索
    resetAlertSearch() {
      this.alertSearchForm = {
        alertLevel: '',
        status: ''
      }
      this.loadSecurityAlerts()
    },

    // 刷新数据变更
    refreshDataChanges() {
      this.loadDataChanges()
    },

    // 刷新安全告警
    refreshSecurityAlerts() {
      this.loadSecurityAlerts()
    },

    // 导出数据变更
    exportDataChanges() {
      // 调用导出API
      this.$message.success('导出功能开发中')
    },

    // 查看变更详情
    viewChangeDetail(row) {
      this.$message.info('详情功能开发中')
    },

    // 查看告警详情
    viewAlertDetail(row) {
      this.$message.info('详情功能开发中')
    },

    // 处理告警
    handleAlert(row) {
      this.currentAlert = row
      this.handleAlertForm = {
        action: 'RESOLVE',
        remark: ''
      }
      this.handleAlertDialogVisible = true
    },

    // 确认处理告警
    async confirmHandleAlert() {
      try {
        await this.handleSecurityAlert({
          alertId: this.currentAlert.id,
          data: this.handleAlertForm
        })
        this.handleAlertDialogVisible = false
        this.$message.success('处理成功')
      } catch (error) {
        console.error('处理告警失败:', error)
        this.$message.error('处理失败: ' + error.message)
      }
    },

    // 数据变更分页
    handleDataChangesSizeChange(val) {
      // 更新分页信息并重新加载
      this.loadDataChanges()
    },

    handleDataChangesCurrentChange(val) {
      // 更新分页信息并重新加载
      this.loadDataChanges()
    },

    // 安全告警分页
    handleSecurityAlertsSizeChange(val) {
      // 更新分页信息并重新加载
      this.loadSecurityAlerts()
    },

    handleSecurityAlertsCurrentChange(val) {
      // 更新分页信息并重新加载
      this.loadSecurityAlerts()
    }
  }
}
</script>

<style lang="scss" scoped>
.audit-table {
  .table-card {
    margin-bottom: 20px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      
      .header-actions {
        .el-button {
          margin-left: 8px;
        }
      }
    }
    
    .search-bar {
      padding: 16px 0;
      border-bottom: 1px solid #ebeef5;
      margin-bottom: 16px;
    }
    
    .pagination-wrapper {
      padding: 20px 0;
      text-align: right;
    }
  }
  
  .old-value {
    color: #f56c6c;
    text-decoration: line-through;
  }
  
  .new-value {
    color: #67c23a;
    font-weight: 600;
  }
}
</style>