<template>
  <div class="app-container">
    <!-- 搜索筛选栏 -->
    <div class="filter-container">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="会话状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="全部" value="" />
            <el-option label="等待中" value="waiting" />
            <el-option label="进行中" value="active" />
            <el-option label="已结束" value="closed" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="客服">
          <el-select v-model="searchForm.serviceId" placeholder="全部" clearable>
            <el-option label="全部" value="" />
            <el-option 
              v-for="service in serviceList"
              :key="service.id"
              :label="service.name"
              :value="service.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="yyyy-MM-dd HH:mm"
            value-format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>
        
        <el-form-item label="客户">
          <el-input
            v-model="searchForm.customerKeyword"
            placeholder="客户姓名/手机号"
            clearable
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">
            搜索
          </el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">
            重置
          </el-button>
          <el-button type="success" icon="el-icon-download" @click="handleExport">
            导出
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据统计卡片 -->
    <div class="stats-container">
      <el-row :gutter="16">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalSessions }}</div>
              <div class="stat-label">总会话数</div>
            </div>
            <div class="stat-icon total">
              <i class="el-icon-chat-dot-round"></i>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.activeSessions }}</div>
              <div class="stat-label">进行中</div>
            </div>
            <div class="stat-icon active">
              <i class="el-icon-chat-line-round"></i>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.waitingSessions }}</div>
              <div class="stat-label">等待中</div>
            </div>
            <div class="stat-icon waiting">
              <i class="el-icon-time"></i>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.avgResponseTime }}s</div>
              <div class="stat-label">平均响应</div>
            </div>
            <div class="stat-icon response">
              <i class="el-icon-timer"></i>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 会话列表 -->
    <el-card class="table-container">
      <div slot="header">
        <span>会话列表</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="handleRefresh">
          刷新
        </el-button>
      </div>
      
      <el-table
        v-loading="listLoading"
        :data="sessionList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column label="客户信息" width="200">
          <template slot-scope="scope">
            <div class="customer-info">
              <el-avatar 
                :src="scope.row.customer.avatar"
                :size="32"
                icon="el-icon-user-solid"
              />
              <div class="customer-details">
                <div class="customer-name">{{ scope.row.customer.name }}</div>
                <div class="customer-phone">{{ scope.row.customer.phone }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="客服" width="120">
          <template slot-scope="scope">
            <div v-if="scope.row.service">
              <div>{{ scope.row.service.name }}</div>
              <el-tag :type="getServiceStatusType(scope.row.service.status)" size="mini">
                {{ getServiceStatusText(scope.row.service.status) }}
              </el-tag>
            </div>
            <span v-else class="text-muted">未分配</span>
          </template>
        </el-table-column>
        
        <el-table-column label="会话状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getSessionStatusType(scope.row.status)">
              {{ getSessionStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="开始时间" width="150">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="持续时间" width="100">
          <template slot-scope="scope">
            {{ calculateDuration(scope.row.createdAt, scope.row.endedAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="消息数" width="80" align="center">
          <template slot-scope="scope">
            {{ scope.row.messageCount || 0 }}
          </template>
        </el-table-column>
        
        <el-table-column label="满意度" width="100" align="center">
          <template slot-scope="scope">
            <div v-if="scope.row.satisfaction">
              <el-rate 
                v-model="scope.row.satisfaction.rating"
                :max="5"
                disabled
                show-score
                text-color="#ff9900"
                score-template="{value}"
              />
            </div>
            <span v-else class="text-muted">未评价</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="180" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="viewDetails(scope.row)">
              查看详情
            </el-button>
            <el-button 
              v-if="scope.row.status === 'active'"
              type="text" 
              size="mini"
              @click="joinSession(scope.row)"
            >
              加入会话
            </el-button>
            <el-button 
              v-if="scope.row.status === 'waiting'"
              type="text" 
              size="mini"
              @click="assignSession(scope.row)"
            >
              分配客服
            </el-button>
            <el-dropdown @command="handleCommand" trigger="click">
              <el-button type="text" size="mini">
                更多<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="{ action: 'transfer', row: scope.row }">
                  转接
                </el-dropdown-item>
                <el-dropdown-item :command="{ action: 'close', row: scope.row }" divided>
                  结束会话
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="searchForm.page"
        :limit.sync="searchForm.limit"
        @pagination="getList"
      />
    </el-card>

    <!-- 会话详情对话框 -->
    <session-detail-dialog
      :visible.sync="detailDialogVisible"
      :session-id="selectedSessionId"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import SessionDetailDialog from '@/components/Chat/SessionDetailDialog'

export default {
  name: 'CustomerServiceSessions',
  
  components: {
    Pagination,
    SessionDetailDialog
  },

  data() {
    return {
      listLoading: false,
      detailDialogVisible: false,
      selectedSessionId: '',
      selectedRows: [],
      
      searchForm: {
        status: '',
        serviceId: '',
        dateRange: [],
        customerKeyword: '',
        page: 1,
        limit: 20
      },
      
      sessionList: [],
      serviceList: [],
      total: 0,
      
      stats: {
        totalSessions: 0,
        activeSessions: 0,
        waitingSessions: 0,
        avgResponseTime: 0
      }
    }
  },

  mounted() {
    this.init()
  },

  methods: {
    async init() {
      await Promise.all([
        this.getList(),
        this.getServiceList(),
        this.getStats()
      ])
    },

    // 获取会话列表
    async getList() {
      this.listLoading = true
      try {
        const params = {
          ...this.searchForm,
          startTime: this.searchForm.dateRange?.[0],
          endTime: this.searchForm.dateRange?.[1]
        }
        delete params.dateRange

        // 模拟API调用
        const response = await this.mockGetSessionList(params)
        this.sessionList = response.data.list
        this.total = response.data.total
      } catch (error) {
        console.error('获取会话列表失败:', error)
        this.$message.error('获取会话列表失败')
      } finally {
        this.listLoading = false
      }
    },

    // 获取客服列表
    async getServiceList() {
      try {
        // 模拟数据
        this.serviceList = [
          { id: '1', name: '张客服', status: 'online' },
          { id: '2', name: '李客服', status: 'busy' },
          { id: '3', name: '王客服', status: 'offline' }
        ]
      } catch (error) {
        console.error('获取客服列表失败:', error)
      }
    },

    // 获取统计数据
    async getStats() {
      try {
        this.stats = {
          totalSessions: 156,
          activeSessions: 23,
          waitingSessions: 5,
          avgResponseTime: 28
        }
      } catch (error) {
        console.error('获取统计数据失败:', error)
      }
    },

    // 模拟获取会话列表
    async mockGetSessionList(params) {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const list = Array.from({ length: params.limit }, (_, index) => ({
        id: `session_${Date.now()}_${index}`,
        customer: {
          id: `customer_${index}`,
          name: `客户${index + 1}`,
          phone: `138****${String(index).padStart(4, '0')}`,
          avatar: ''
        },
        service: index % 3 === 0 ? null : {
          id: `service_${index % 3}`,
          name: ['张客服', '李客服', '王客服'][index % 3],
          status: ['online', 'busy', 'offline'][index % 3]
        },
        status: ['waiting', 'active', 'closed'][index % 3],
        createdAt: Date.now() - Math.random() * 86400000,
        endedAt: index % 3 === 2 ? Date.now() - Math.random() * 3600000 : null,
        messageCount: Math.floor(Math.random() * 50) + 1,
        satisfaction: index % 4 === 0 ? {
          rating: Math.floor(Math.random() * 2) + 4,
          comment: '服务很好'
        } : null
      }))

      return {
        data: {
          list,
          total: 156
        }
      }
    },

    // 搜索
    handleSearch() {
      this.searchForm.page = 1
      this.getList()
    },

    // 重置
    handleReset() {
      this.searchForm = {
        status: '',
        serviceId: '',
        dateRange: [],
        customerKeyword: '',
        page: 1,
        limit: 20
      }
      this.getList()
    },

    // 刷新
    handleRefresh() {
      this.getList()
      this.getStats()
    },

    // 导出
    handleExport() {
      this.$message.info('导出功能开发中')
    },

    // 选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    // 查看详情
    viewDetails(row) {
      this.selectedSessionId = row.id
      this.detailDialogVisible = true
    },

    // 加入会话
    joinSession(row) {
      this.$router.push({
        path: '/customer-service/chat',
        query: { sessionId: row.id }
      })
    },

    // 分配客服
    assignSession(row) {
      this.$message.info('分配客服功能开发中')
    },

    // 处理下拉菜单命令
    handleCommand({ action, row }) {
      switch (action) {
        case 'transfer':
          this.$message.info('转接功能开发中')
          break
        case 'close':
          this.closeSession(row)
          break
      }
    },

    // 关闭会话
    async closeSession(row) {
      try {
        await this.$confirm(`确定要结束与 ${row.customer.name} 的会话吗？`, '确认操作', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // 调用API关闭会话
        this.$message.success('会话已结束')
        this.getList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('关闭会话失败:', error)
          this.$message.error('关闭会话失败')
        }
      }
    },

    // 格式化日期时间
    formatDateTime(timestamp) {
      if (!timestamp) return ''
      return new Date(timestamp).toLocaleString()
    },

    // 计算持续时间
    calculateDuration(startTime, endTime) {
      if (!startTime) return ''
      
      const end = endTime || Date.now()
      const duration = Math.floor((end - startTime) / 1000)
      
      const hours = Math.floor(duration / 3600)
      const minutes = Math.floor((duration % 3600) / 60)
      const seconds = duration % 60
      
      if (hours > 0) {
        return `${hours}h ${minutes}m`
      } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`
      } else {
        return `${seconds}s`
      }
    },

    // 获取会话状态类型
    getSessionStatusType(status) {
      const typeMap = {
        'waiting': 'warning',
        'active': 'success',
        'closed': 'info'
      }
      return typeMap[status] || 'info'
    },

    // 获取会话状态文本
    getSessionStatusText(status) {
      const textMap = {
        'waiting': '等待中',
        'active': '进行中',
        'closed': '已结束'
      }
      return textMap[status] || '未知'
    },

    // 获取客服状态类型
    getServiceStatusType(status) {
      const typeMap = {
        'online': 'success',
        'busy': 'warning',
        'offline': 'danger'
      }
      return typeMap[status] || 'info'
    },

    // 获取客服状态文本
    getServiceStatusText(status) {
      const textMap = {
        'online': '在线',
        'busy': '忙碌',
        'offline': '离线'
      }
      return textMap[status] || '未知'
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  margin-bottom: 16px;
  
  .search-form {
    background: #fff;
    padding: 16px;
    border-radius: 4px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }
}

.stats-container {
  margin-bottom: 16px;
  
  .stat-card {
    .stat-content {
      flex: 1;
      
      .stat-number {
        font-size: 28px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 8px;
      }
      
      .stat-label {
        color: #666;
        font-size: 14px;
      }
    }
    
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      
      i {
        font-size: 24px;
        color: #fff;
      }
      
      &.total { background: #409EFF; }
      &.active { background: #67C23A; }
      &.waiting { background: #E6A23C; }
      &.response { background: #F56C6C; }
    }
    
    ::v-deep .el-card__body {
      display: flex;
      align-items: center;
      padding: 20px;
    }
  }
}

.table-container {
  .customer-info {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .customer-details {
      .customer-name {
        font-weight: 500;
        margin-bottom: 2px;
      }
      
      .customer-phone {
        font-size: 12px;
        color: #666;
      }
    }
  }
  
  .text-muted {
    color: #999;
  }
}
</style>