<template>
  <div class="session-list">
    <!-- 头部操作栏 -->
    <div class="session-header">
      <div class="header-title">
        <span>会话列表</span>
        <el-badge :value="totalUnreadCount" :hidden="totalUnreadCount === 0" class="unread-badge">
          <i class="el-icon-chat-dot-round"></i>
        </el-badge>
      </div>
      
      <div class="header-actions">
        <el-tooltip content="刷新" placement="bottom">
          <el-button 
            type="text" 
            icon="el-icon-refresh"
            :loading="sessionLoading"
            @click="refreshSessions"
          />
        </el-tooltip>
        
        <el-dropdown @command="handleFilterCommand" trigger="click">
          <el-button type="text" icon="el-icon-more">
            <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="all" :class="{ active: currentFilter === 'all' }">
              全部会话
            </el-dropdown-item>
            <el-dropdown-item command="active" :class="{ active: currentFilter === 'active' }">
              进行中
            </el-dropdown-item>
            <el-dropdown-item command="waiting" :class="{ active: currentFilter === 'waiting' }">
              等待中
            </el-dropdown-item>
            <el-dropdown-item command="unread" :class="{ active: currentFilter === 'unread' }">
              未读消息
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="session-search">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索客户名称或会话内容"
        prefix-icon="el-icon-search"
        size="small"
        clearable
        @input="handleSearch"
      />
    </div>

    <!-- 会话列表 -->
    <div class="session-content">
      <el-scrollbar>
        <div class="session-items">
          <!-- 加载中 -->
          <div v-if="sessionLoading && sessions.length === 0" class="loading-state">
            <el-skeleton :rows="3" animated />
          </div>

          <!-- 会话项 -->
          <div
            v-for="session in filteredSessions"
            :key="session.id"
            :class="[
              'session-item',
              { 'active': isActiveSession(session.id) },
              { 'unread': session.unreadCount > 0 }
            ]"
            @click="selectSession(session)"
          >
            <!-- 客户头像 -->
            <div class="session-avatar">
              <el-avatar 
                :src="session.customer.avatar"
                :size="40"
                icon="el-icon-user-solid"
              />
              <!-- 在线状态指示器 -->
              <div 
                v-if="session.customer.online"
                class="online-indicator"
              ></div>
            </div>

            <!-- 会话信息 -->
            <div class="session-info">
              <div class="session-header-info">
                <div class="customer-name">
                  {{ session.customer.name }}
                  <el-tag 
                    v-if="session.customer.vipLevel" 
                    type="warning" 
                    size="mini"
                  >
                    VIP{{ session.customer.vipLevel }}
                  </el-tag>
                </div>
                <div class="session-time">
                  {{ formatRelativeTime(session.updatedAt) }}
                </div>
              </div>

              <div class="session-preview">
                <div class="last-message">
                  {{ getLastMessagePreview(session.lastMessage) }}
                </div>
                
                <div class="session-meta">
                  <el-tag 
                    :type="getSessionStatusType(session.status)" 
                    size="mini"
                  >
                    {{ getSessionStatusText(session.status) }}
                  </el-tag>
                  
                  <el-badge 
                    v-if="session.unreadCount > 0"
                    :value="session.unreadCount"
                    :max="99"
                    class="unread-count"
                  />
                </div>
              </div>
            </div>

            <!-- 操作菜单 -->
            <div class="session-actions" @click.stop>
              <el-dropdown @command="handleSessionCommand" trigger="click">
                <el-button type="text" icon="el-icon-more" size="mini" />
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item :command="{ action: 'accept', sessionId: session.id }">
                    接受会话
                  </el-dropdown-item>
                  <el-dropdown-item :command="{ action: 'transfer', sessionId: session.id }">
                    转接会话
                  </el-dropdown-item>
                  <el-dropdown-item :command="{ action: 'close', sessionId: session.id }" divided>
                    结束会话
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </div>

          <!-- 无会话时的提示 -->
          <div v-if="!sessionLoading && filteredSessions.length === 0" class="empty-state">
            <i class="el-icon-chat-dot-round"></i>
            <p v-if="searchKeyword">没有找到匹配的会话</p>
            <p v-else>暂无会话</p>
          </div>
        </div>
      </el-scrollbar>
    </div>

    <!-- 底部状态栏 -->
    <div class="session-footer">
      <div class="session-stats">
        <span>总计: {{ filteredSessions.length }}</span>
        <span v-if="totalUnreadCount > 0">未读: {{ totalUnreadCount }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  name: 'SessionList',

  data() {
    return {
      searchKeyword: '',
      currentFilter: 'all'
    }
  },

  computed: {
    ...mapState('chat', [
      'sessions',
      'activeSession',
      'sessionLoading'
    ]),
    
    ...mapGetters('chat', [
      'totalUnreadCount'
    ]),

    // 过滤后的会话列表
    filteredSessions() {
      let filtered = this.sessions

      // 按状态过滤
      if (this.currentFilter !== 'all') {
        switch (this.currentFilter) {
          case 'active':
            filtered = filtered.filter(s => s.status === 'active')
            break
          case 'waiting':
            filtered = filtered.filter(s => s.status === 'waiting')
            break
          case 'unread':
            filtered = filtered.filter(s => s.unreadCount > 0)
            break
        }
      }

      // 按关键词搜索
      if (this.searchKeyword.trim()) {
        const keyword = this.searchKeyword.toLowerCase()
        filtered = filtered.filter(session => {
          const customerName = session.customer.name.toLowerCase()
          const lastMessage = session.lastMessage?.content?.toLowerCase() || ''
          return customerName.includes(keyword) || lastMessage.includes(keyword)
        })
      }

      return filtered
    }
  },

  mounted() {
    this.loadSessions()
  },

  methods: {
    ...mapActions('chat', [
      'loadSessions',
      'switchSession'
    ]),

    // 选择会话
    async selectSession(session) {
      try {
        await this.switchSession(session)
        this.$emit('session-selected', session)
      } catch (error) {
        console.error('选择会话失败:', error)
        this.$message.error('选择会话失败')
      }
    },

    // 是否为活跃会话
    isActiveSession(sessionId) {
      return this.activeSession && this.activeSession.id === sessionId
    },

    // 刷新会话列表
    async refreshSessions() {
      try {
        await this.loadSessions()
        this.$message.success('会话列表已刷新')
      } catch (error) {
        console.error('刷新会话失败:', error)
        this.$message.error('刷新会话失败')
      }
    },

    // 处理过滤命令
    handleFilterCommand(command) {
      this.currentFilter = command
    },

    // 处理搜索
    handleSearch() {
      // 搜索逻辑在computed中处理
    },

    // 处理会话命令
    async handleSessionCommand({ action, sessionId }) {
      const session = this.sessions.find(s => s.id === sessionId)
      if (!session) return

      try {
        switch (action) {
          case 'accept':
            await this.acceptSession(session)
            break
          case 'transfer':
            this.$emit('transfer-session', session)
            break
          case 'close':
            await this.closeSession(session)
            break
        }
      } catch (error) {
        console.error(`执行会话操作失败: ${action}`, error)
        this.$message.error('操作失败')
      }
    },

    // 接受会话
    async acceptSession(session) {
      if (session.status === 'waiting') {
        await this.selectSession(session)
        this.$message.success('已接受会话')
      }
    },

    // 关闭会话
    async closeSession(session) {
      await this.$confirm(`确定要关闭与 ${session.customer.name} 的会话吗？`, '确认关闭', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      // 这里应该调用关闭会话的action
      this.$message.success('会话已关闭')
    },

    // 获取最后消息预览
    getLastMessagePreview(lastMessage) {
      if (!lastMessage) return '暂无消息'

      switch (lastMessage.messageType) {
        case 'text':
          return lastMessage.content
        case 'image':
          return '[图片]'
        case 'file':
          return '[文件]'
        case 'system':
          return lastMessage.content
        default:
          return '[消息]'
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
        'waiting': '等待',
        'active': '进行中',
        'closed': '已结束'
      }
      return textMap[status] || '未知'
    },

    // 格式化相对时间
    formatRelativeTime(timestamp) {
      const now = Date.now()
      const diff = now - timestamp
      const minute = 60 * 1000
      const hour = 60 * minute
      const day = 24 * hour

      if (diff < minute) {
        return '刚刚'
      } else if (diff < hour) {
        return `${Math.floor(diff / minute)}分钟前`
      } else if (diff < day) {
        return `${Math.floor(diff / hour)}小时前`
      } else {
        return new Date(timestamp).toLocaleDateString()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.session-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-right: 1px solid #e8eaec;
}

.session-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .header-title {
    display: flex;
    align-items: center;
    font-weight: 500;
    color: #303133;

    .unread-badge {
      margin-left: 8px;
    }
  }

  .header-actions {
    display: flex;
    gap: 4px;

    .el-button {
      padding: 4px;
    }
  }
}

.session-search {
  padding: 8px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.session-content {
  flex: 1;
  overflow: hidden;
}

.session-items {
  .session-item {
    padding: 12px 16px;
    border-bottom: 1px solid #f5f5f5;
    cursor: pointer;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    gap: 12px;
    position: relative;

    &:hover {
      background-color: #f9f9f9;
    }

    &.active {
      background-color: #e8f4ff;
      border-left: 3px solid #409EFF;
    }

    &.unread {
      background-color: #fff7e6;
    }
  }
}

.session-avatar {
  position: relative;
  flex-shrink: 0;

  .online-indicator {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 12px;
    height: 12px;
    background: #67C23A;
    border: 2px solid #fff;
    border-radius: 50%;
  }
}

.session-info {
  flex: 1;
  min-width: 0;

  .session-header-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;

    .customer-name {
      font-weight: 500;
      color: #303133;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .session-time {
      font-size: 12px;
      color: #909399;
      flex-shrink: 0;
    }
  }

  .session-preview {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .last-message {
      flex: 1;
      font-size: 13px;
      color: #666;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .session-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
  }
}

.session-actions {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s;

  .session-item:hover & {
    opacity: 1;
  }
}

.loading-state {
  padding: 16px;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #999;

  i {
    font-size: 48px;
    margin-bottom: 16px;
    display: block;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
}

.session-footer {
  padding: 8px 16px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;

  .session-stats {
    font-size: 12px;
    color: #666;

    span {
      margin-right: 16px;
    }
  }
}

::v-deep .el-dropdown-menu__item.active {
  color: #409EFF;
  background-color: #f0f9ff;
}
</style>