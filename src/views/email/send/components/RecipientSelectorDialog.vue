<template>
  <el-dialog
    title="选择收件人"
    :visible.sync="dialogVisible"
    width="800px"
    @close="onDialogClose">
    
    <div class="recipient-selector">
      <!-- 搜索和筛选 -->
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索用户邮箱或姓名"
          prefix-icon="el-icon-search"
          @input="onSearch"
          style="width: 300px;">
        </el-input>
        <el-select
          v-model="filterGroup"
          placeholder="选择用户组"
          clearable
          style="width: 200px; margin-left: 10px;">
          <el-option
            v-for="group in userGroups"
            :key="group.value"
            :label="group.label"
            :value="group.value">
          </el-option>
        </el-select>
        <el-button type="primary" @click="searchUsers">查询</el-button>
      </div>
      
      <!-- 快速选择 -->
      <div class="quick-select">
        <el-button size="small" @click="selectAll">全选</el-button>
        <el-button size="small" @click="selectNone">清空</el-button>
        <el-button size="small" @click="selectReverse">反选</el-button>
        <span style="margin-left: 10px; color: #666;">
          已选择 {{ selectedUsers.length }} 个用户
        </span>
      </div>
      
      <!-- 用户列表 -->
      <div class="user-list">
        <el-table
          ref="userTable"
          :data="userList"
          v-loading="loading"
          @selection-change="handleSelectionChange"
          height="400px"
          border>
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="name" label="姓名" width="120"></el-table-column>
          <el-table-column prop="email" label="邮箱地址" min-width="200"></el-table-column>
          <el-table-column prop="group" label="用户组" width="120">
            <template slot-scope="scope">
              <el-tag size="small">{{ scope.row.group }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template slot-scope="scope">
              <el-tag 
                :type="scope.row.status === 'active' ? 'success' : 'danger'"
                size="small">
                {{ scope.row.status === 'active' ? '活跃' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="lastLogin" label="最后登录" width="150">
            <template slot-scope="scope">
              {{ formatDate(scope.row.lastLogin) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange">
        </el-pagination>
      </div>
      
      <!-- 手动输入 -->
      <div class="manual-input">
        <el-divider content-position="left">手动输入邮箱</el-divider>
        <el-input
          v-model="manualEmails"
          type="textarea"
          :rows="3"
          placeholder="请输入邮箱地址，多个邮箱用逗号或换行分隔">
        </el-input>
        <el-button 
          type="text" 
          @click="parseManualEmails"
          style="margin-top: 5px;">
          解析并添加邮箱
        </el-button>
      </div>
    </div>
    
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="confirmSelection">
        确定 ({{ selectedUsers.length }})
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getRecipientList } from '@/api/email'

export default {
  name: 'RecipientSelectorDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    selectedEmails: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      searchKeyword: '',
      filterGroup: '',
      manualEmails: '',
      userList: [],
      selectedUsers: [],
      total: 0,
      pageSize: 20,
      currentPage: 1,
      userGroups: [
        { label: '普通用户', value: 'normal' },
        { label: 'VIP用户', value: 'vip' },
        { label: '管理员', value: 'admin' },
        { label: '测试用户', value: 'test' }
      ]
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val) {
        this.loadUsers()
        this.initSelectedUsers()
      }
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    async loadUsers() {
      try {
        this.loading = true
        const params = {
          keyword: this.searchKeyword,
          group: this.filterGroup,
          pageNum: this.currentPage,
          pageSize: this.pageSize
        }
        
        const response = await getRecipientList(params)
        this.userList = response.data.list || []
        this.total = response.data.total || 0
        
        // 恢复之前的选择状态
        this.restoreSelection()
        
      } catch (error) {
        this.$message.error('加载用户列表失败：' + error.message)
      } finally {
        this.loading = false
      }
    },
    initSelectedUsers() {
      // 将传入的邮箱列表转换为用户对象
      this.selectedUsers = this.selectedEmails.map(email => ({
        email: email,
        name: '',
        group: 'unknown'
      }))
    },
    restoreSelection() {
      this.$nextTick(() => {
        this.userList.forEach(user => {
          if (this.selectedEmails.includes(user.email)) {
            this.$refs.userTable.toggleRowSelection(user, true)
          }
        })
      })
    },
    onSearch() {
      // 防抖搜索
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.searchUsers()
      }, 500)
    },
    searchUsers() {
      this.currentPage = 1
      this.loadUsers()
    },
    handleSelectionChange(selection) {
      // 更新选中的用户，保持跨页选择
      const currentPageEmails = this.userList.map(user => user.email)
      
      // 移除当前页面之前选中但现在未选中的用户
      this.selectedUsers = this.selectedUsers.filter(user => 
        !currentPageEmails.includes(user.email) || 
        selection.some(selected => selected.email === user.email)
      )
      
      // 添加当前页面新选中的用户
      selection.forEach(user => {
        if (!this.selectedUsers.some(selected => selected.email === user.email)) {
          this.selectedUsers.push(user)
        }
      })
    },
    selectAll() {
      this.$refs.userTable.toggleAllSelection()
    },
    selectNone() {
      this.$refs.userTable.clearSelection()
      this.selectedUsers = []
    },
    selectReverse() {
      this.userList.forEach(user => {
        this.$refs.userTable.toggleRowSelection(user)
      })
    },
    parseManualEmails() {
      if (!this.manualEmails.trim()) return
      
      // 解析邮箱地址
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
      const emails = this.manualEmails.match(emailRegex) || []
      
      if (emails.length === 0) {
        this.$message.warning('未找到有效的邮箱地址')
        return
      }
      
      // 添加到选中列表
      emails.forEach(email => {
        if (!this.selectedUsers.some(user => user.email === email)) {
          this.selectedUsers.push({
            email: email,
            name: '手动输入',
            group: 'manual'
          })
        }
      })
      
      this.manualEmails = ''
      this.$message.success(`成功添加 ${emails.length} 个邮箱地址`)
    },
    confirmSelection() {
      const emails = this.selectedUsers.map(user => user.email)
      this.$emit('confirm', emails)
      this.dialogVisible = false
    },
    onDialogClose() {
      // 清理数据
      this.searchKeyword = ''
      this.filterGroup = ''
      this.manualEmails = ''
      this.currentPage = 1
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.loadUsers()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.loadUsers()
    },
    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      return d.toLocaleDateString('zh-CN')
    }
  }
}
</script>

<style scoped>
.recipient-selector {
  padding: 0;
}

.search-bar {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.quick-select {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.user-list {
  margin-bottom: 15px;
}

.pagination {
  text-align: center;
  margin-bottom: 15px;
}

.manual-input {
  margin-top: 10px;
}
</style>