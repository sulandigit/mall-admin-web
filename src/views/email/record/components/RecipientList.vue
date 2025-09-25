<template>
  <div class="recipient-list">
    <div class="list-header">
      <span>收件人列表 ({{ recipients.length }})</span>
      <div class="header-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索邮箱地址"
          prefix-icon="el-icon-search"
          size="small"
          style="width: 200px;">
        </el-input>
        <el-button 
          type="primary" 
          size="small"
          @click="exportList"
          style="margin-left: 10px;">
          导出列表
        </el-button>
      </div>
    </div>
    
    <el-table
      :data="filteredRecipients"
      v-loading="loading"
      height="400px"
      border>
      <el-table-column type="index" width="50" label="#"></el-table-column>
      <el-table-column prop="email" label="邮箱地址" min-width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.email }}</span>
          <el-tag 
            v-if="scope.row.source === 'manual'"
            size="mini"
            type="info"
            style="margin-left: 5px;">
            手动
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="姓名" width="120">
        <template slot-scope="scope">
          {{ scope.row.name || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="group" label="用户组" width="100">
        <template slot-scope="scope">
          <el-tag 
            v-if="scope.row.group"
            size="small"
            :type="getGroupTagType(scope.row.group)">
            {{ getGroupName(scope.row.group) }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column 
        v-if="showStatus" 
        prop="status" 
        label="发送状态" 
        width="100">
        <template slot-scope="scope">
          <el-tag 
            :type="getStatusTagType(scope.row.status)"
            size="small">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column 
        v-if="showStatus && status === 'failed'" 
        prop="errorMessage" 
        label="失败原因" 
        min-width="200"
        show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.errorMessage || '-' }}
        </template>
      </el-table-column>
      <el-table-column 
        v-if="showSentTime"
        prop="sentTime" 
        label="发送时间" 
        width="150">
        <template slot-scope="scope">
          {{ formatDate(scope.row.sentTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template slot-scope="scope">
          <el-button 
            v-if="status === 'failed'"
            type="text" 
            size="small"
            @click="retrySingle(scope.row)">
            重试
          </el-button>
          <el-button 
            type="text" 
            size="small"
            @click="removeRecipient(scope.$index, scope.row)">
            移除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <div class="pagination" v-if="recipients.length > pageSize">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="filteredRecipients.length"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handleCurrentChange">
      </el-pagination>
    </div>
    
    <!-- 统计信息 -->
    <div class="statistics" v-if="showStatus">
      <el-card>
        <div slot="header">
          <span>发送统计</span>
        </div>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="stat-item">
              <span class="stat-value">{{ recipients.length }}</span>
              <span class="stat-label">总数</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-item">
              <span class="stat-value success">{{ successCount }}</span>
              <span class="stat-label">成功</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-item">
              <span class="stat-value error">{{ failedCount }}</span>
              <span class="stat-label">失败</span>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RecipientList',
  props: {
    recipients: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      default: 'all' // all, success, failed
    },
    showStatus: {
      type: Boolean,
      default: false
    },
    showSentTime: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      searchKeyword: '',
      pageSize: 50,
      currentPage: 1
    }
  },
  computed: {
    filteredRecipients() {
      let list = this.recipients
      
      // 按状态筛选
      if (this.status !== 'all') {
        const statusMap = {
          'success': 1,
          'failed': 0
        }
        list = list.filter(item => item.status === statusMap[this.status])
      }
      
      // 按关键词搜索
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase()
        list = list.filter(item => 
          item.email.toLowerCase().includes(keyword) ||
          (item.name && item.name.toLowerCase().includes(keyword))
        )
      }
      
      return list
    },
    successCount() {
      return this.recipients.filter(item => item.status === 1).length
    },
    failedCount() {
      return this.recipients.filter(item => item.status === 0).length
    }
  },
  methods: {
    handleCurrentChange(page) {
      this.currentPage = page
    },
    removeRecipient(index, row) {
      this.$emit('remove', row)
    },
    retrySingle(row) {
      this.$emit('retry', row)
    },
    exportList() {
      // 导出收件人列表
      const csvContent = this.generateCSV()
      this.downloadCSV(csvContent, 'recipients.csv')
    },
    generateCSV() {
      const headers = ['邮箱地址', '姓名', '用户组']
      if (this.showStatus) {
        headers.push('发送状态', '失败原因')
      }
      if (this.showSentTime) {
        headers.push('发送时间')
      }
      
      let csvContent = headers.join(',') + '\n'
      
      this.filteredRecipients.forEach(item => {
        const row = [
          item.email,
          item.name || '',
          this.getGroupName(item.group) || ''
        ]
        
        if (this.showStatus) {
          row.push(this.getStatusText(item.status))
          row.push(item.errorMessage || '')
        }
        
        if (this.showSentTime) {
          row.push(this.formatDate(item.sentTime))
        }
        
        csvContent += row.join(',') + '\n'
      })
      
      return csvContent
    },
    downloadCSV(content, filename) {
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      link.click()
    },
    getGroupName(group) {
      const groupMap = {
        'normal': '普通用户',
        'vip': 'VIP用户',
        'admin': '管理员',
        'test': '测试用户',
        'manual': '手动输入'
      }
      return groupMap[group] || group
    },
    getGroupTagType(group) {
      const typeMap = {
        'normal': '',
        'vip': 'warning',
        'admin': 'danger',
        'test': 'info',
        'manual': 'success'
      }
      return typeMap[group] || ''
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
    }
  }
}
</script>

<style scoped>
.recipient-list {
  width: 100%;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.header-actions {
  display: flex;
  align-items: center;
}

.pagination {
  text-align: center;
  margin-top: 15px;
}

.statistics {
  margin-top: 20px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
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

.stat-label {
  display: block;
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}
</style>