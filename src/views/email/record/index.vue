<template>
  <div class="app-container">
    <!-- 筛选搜索 -->
    <el-card class="filter-container" shadow="never">
      <div>
        <i class="el-icon-search"></i>
        <span>筛选搜索</span>
        <el-button
          style="float: right"
          @click="searchRecordList()"
          type="primary"
          size="small">
          查询结果
        </el-button>
      </div>
      <div style="margin-top: 15px">
        <el-form :inline="true" :model="listQuery" size="small" label-width="140px">
          <el-form-item label="关键词搜索：">
            <el-input 
              style="width: 203px" 
              v-model="listQuery.keyword" 
              placeholder="模板名称/收件人">
            </el-input>
          </el-form-item>
          <el-form-item label="发送状态：">
            <el-select 
              v-model="listQuery.status" 
              placeholder="选择状态" 
              clearable
              style="width: 203px">
              <el-option label="发送成功" :value="1"></el-option>
              <el-option label="发送失败" :value="0"></el-option>
              <el-option label="发送中" :value="2"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="使用模板：">
            <el-select 
              v-model="listQuery.templateId" 
              placeholder="选择模板" 
              clearable
              style="width: 203px">
              <el-option
                v-for="template in templateList"
                :key="template.id"
                :label="template.name"
                :value="template.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="发送时间：">
            <el-date-picker
              v-model="dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss"
              @change="onDateRangeChange">
            </el-date-picker>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 操作按钮 -->
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>数据列表</span>
      <div style="float: right;">
        <el-button
          size="mini"
          @click="exportRecords">
          导出记录
        </el-button>
        <el-button
          size="mini"
          type="danger"
          @click="cleanupRecords">
          清理记录
        </el-button>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <div class="table-container">
      <el-table 
        ref="recordTable"
        :data="list"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        v-loading="listLoading"
        border>
        <el-table-column type="selection" width="60" align="center"></el-table-column>
        <el-table-column label="记录ID" width="100" align="center">
          <template slot-scope="scope">{{ scope.row.id }}</template>
        </el-table-column>
        <el-table-column label="邮件模板" align="center" min-width="150">
          <template slot-scope="scope">
            <span>{{ scope.row.templateName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="邮件主题" align="center" min-width="200" show-overflow-tooltip>
          <template slot-scope="scope">{{ scope.row.subject }}</template>
        </el-table-column>
        <el-table-column label="收件人" align="center" min-width="180" show-overflow-tooltip>
          <template slot-scope="scope">
            <span v-if="scope.row.sendCount === 1">{{ scope.row.recipients }}</span>
            <span v-else>批量发送 ({{ scope.row.sendCount }}人)</span>
          </template>
        </el-table-column>
        <el-table-column label="发送状态" width="120" align="center">
          <template slot-scope="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发送统计" width="160" align="center">
          <template slot-scope="scope">
            <div class="send-stats">
              <span class="success-count">成功: {{ scope.row.successCount }}</span>
              <span class="fail-count" v-if="scope.row.failCount > 0">失败: {{ scope.row.failCount }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="发送时间" width="180" align="center">
          <template slot-scope="scope">{{ formatDate(scope.row.sendTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template slot-scope="scope">
            <el-button
              size="mini"
              @click="viewDetail(scope.$index, scope.row)">
              详情
            </el-button>
            <el-button
              v-if="scope.row.status === 0 && scope.row.failCount > 0"
              size="mini"
              type="warning"
              @click="retryFailed(scope.$index, scope.row)">
              重试
            </el-button>
            <el-button
              size="mini"
              type="danger"
              @click="deleteRecord(scope.$index, scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 批量操作 -->
    <div class="batch-operate-container">
      <el-select
        size="small"
        v-model="operateType" 
        placeholder="批量操作">
        <el-option
          v-for="item in operates"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <el-button
        style="margin-left: 20px"
        class="search-button"
        @click="handleBatchOperate()"
        type="primary"
        size="small">
        确定
      </el-button>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        layout="total, sizes,prev, pager, next,jumper"
        :page-size="listQuery.pageSize"
        :page-sizes="[10,20,50,100]"
        :current-page.sync="listQuery.pageNum"
        :total="total">
      </el-pagination>
    </div>

    <!-- 统计信息 -->
    <el-card class="stats-container" style="margin-top: 20px;">
      <div slot="header">
        <span>发送统计</span>
      </div>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-item">
            <span class="stat-label">总记录数</span>
            <span class="stat-value">{{ stats.total }}</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <span class="stat-label">成功发送</span>
            <span class="stat-value success">{{ stats.success }}</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <span class="stat-label">发送失败</span>
            <span class="stat-value error">{{ stats.failed }}</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <span class="stat-label">成功率</span>
            <span class="stat-value">{{ stats.successRate }}%</span>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { deleteRecord, exportRecords } from '@/api/email'

export default {
  name: 'EmailRecordList',
  data() {
    return {
      operates: [
        {
          label: "删除记录",
          value: "deleteRecords"
        },
        {
          label: "重试失败",
          value: "retryFailed"
        }
      ],
      operateType: null,
      listQuery: {
        keyword: null,
        status: null,
        templateId: null,
        startTime: null,
        endTime: null,
        pageNum: 1,
        pageSize: 10
      },
      dateRange: null,
      multipleSelection: [],
      stats: {
        total: 0,
        success: 0,
        failed: 0,
        successRate: 0
      }
    }
  },
  computed: {
    ...mapState('email', {
      list: state => state.recordList,
      total: state => state.recordTotal,
      listLoading: state => state.recordLoading,
      templateList: state => state.templateList
    })
  },
  created() {
    this.getList()
    this.loadTemplates()
  },
  methods: {
    ...mapActions('email', [
      'fetchRecordList',
      'fetchTemplateList',
      'retryFailedEmail'
    ]),
    async getList() {
      try {
        const data = await this.fetchRecordList()
        this.updateStats()
      } catch (error) {
        this.$message.error('获取记录列表失败：' + error.message)
      }
    },
    async loadTemplates() {
      try {
        await this.fetchTemplateList({ pageSize: 100 })
      } catch (error) {
        console.error('获取模板列表失败：', error)
      }
    },
    searchRecordList() {
      this.listQuery.pageNum = 1
      this.$store.commit('email/SET_RECORD_QUERY', this.listQuery)
      this.getList()
    },
    onDateRangeChange(dateRange) {
      if (dateRange && dateRange.length === 2) {
        this.listQuery.startTime = dateRange[0]
        this.listQuery.endTime = dateRange[1]
      } else {
        this.listQuery.startTime = null
        this.listQuery.endTime = null
      }
    },
    viewDetail(index, row) {
      this.$router.push({ path: '/email/record/detail/' + row.id })
    },
    async retryFailed(index, row) {
      try {
        await this.$confirm('是否要重试发送失败的邮件？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await this.retryFailedEmail(row.id)
        this.$message.success('重试任务已启动')
        this.getList()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('重试失败：' + error.message)
        }
      }
    },
    async deleteRecord(index, row) {
      try {
        await this.$confirm('是否要删除该发送记录？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await deleteRecord(row.id)
        this.$message.success('删除成功')
        this.getList()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败：' + error.message)
        }
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    async handleBatchOperate() {
      if (this.multipleSelection.length < 1) {
        this.$message.warning('请选择要操作的记录')
        return
      }
      
      if (!this.operateType) {
        this.$message.warning('请选择批量操作类型')
        return
      }

      try {
        if (this.operateType === 'deleteRecords') {
          await this.$confirm('是否要删除选中的记录？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
          
          const promises = this.multipleSelection.map(item => deleteRecord(item.id))
          await Promise.all(promises)
          this.$message.success('批量删除成功')
          
        } else if (this.operateType === 'retryFailed') {
          const failedRecords = this.multipleSelection.filter(item => item.status === 0)
          if (failedRecords.length === 0) {
            this.$message.warning('选中的记录中没有失败的记录')
            return
          }
          
          await this.$confirm(`是否要重试${failedRecords.length}条失败记录？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
          
          const promises = failedRecords.map(item => this.retryFailedEmail(item.id))
          await Promise.all(promises)
          this.$message.success('批量重试任务已启动')
        }
        
        this.getList()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('批量操作失败：' + error.message)
        }
      }
    },
    async exportRecords() {
      try {
        const response = await exportRecords(this.listQuery)
        // 处理文件下载
        const blob = new Blob([response.data])
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = `email_records_${new Date().getTime()}.xlsx`
        link.click()
        this.$message.success('导出成功')
      } catch (error) {
        this.$message.error('导出失败：' + error.message)
      }
    },
    cleanupRecords() {
      this.$confirm('是否要清理30天前的发送记录？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 实现清理逻辑
        this.$message.info('清理功能待实现')
      })
    },
    handleSizeChange(val) {
      this.listQuery.pageSize = val
      this.searchRecordList()
    },
    handleCurrentChange(val) {
      this.listQuery.pageNum = val
      this.getList()
    },
    getStatusText(status) {
      const statusMap = {
        0: '发送失败',
        1: '发送成功',
        2: '发送中'
      }
      return statusMap[status] || '未知'
    },
    getStatusTagType(status) {
      const typeMap = {
        0: 'danger',
        1: 'success',
        2: 'warning'
      }
      return typeMap[status] || 'info'
    },
    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      return d.toLocaleString('zh-CN')
    },
    updateStats() {
      const total = this.list.length
      const success = this.list.filter(item => item.status === 1).length
      const failed = this.list.filter(item => item.status === 0).length
      const successRate = total > 0 ? Math.round((success / total) * 100) : 0
      
      this.stats = {
        total,
        success,
        failed,
        successRate
      }
    }
  }
}
</script>

<style scoped>
.filter-container {
  margin-bottom: 10px;
}

.operate-container {
  margin-bottom: 10px;
}

.table-container {
  margin-bottom: 10px;
}

.batch-operate-container {
  margin-bottom: 20px;
}

.pagination-container {
  text-align: right;
}

.send-stats {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.success-count {
  color: #67C23A;
  font-size: 12px;
}

.fail-count {
  color: #F56C6C;
  font-size: 12px;
}

.stats-container {
  margin-top: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-value.success {
  color: #67C23A;
}

.stat-value.error {
  color: #F56C6C;
}
</style>