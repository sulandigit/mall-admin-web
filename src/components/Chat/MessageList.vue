<template>
  <div class="message-list" ref="messageContainer">
    <!-- 加载更多按钮 -->
    <div v-if="canLoadMore" class="load-more">
      <el-button 
        type="text" 
        :loading="loading"
        @click="$emit('load-more')"
      >
        {{ loading ? '加载中...' : '加载更多消息' }}
      </el-button>
    </div>

    <!-- 消息列表 -->
    <div class="messages">
      <div
        v-for="message in messages"
        :key="message.id"
        :class="[
          'message-item',
          { 'own-message': message.isOwn },
          { 'system-message': message.messageType === 'system' }
        ]"
      >
        <!-- 时间分隔线 -->
        <div v-if="shouldShowTime(message)" class="time-divider">
          <span>{{ formatMessageTime(message.timestamp) }}</span>
        </div>

        <!-- 消息内容 -->
        <div class="message-content">
          <!-- 发送者头像 -->
          <div v-if="!message.isOwn" class="avatar">
            <el-avatar 
              :src="message.sender.avatar"
              :size="32"
              icon="el-icon-user-solid"
            />
          </div>

          <!-- 消息气泡 -->
          <div class="message-bubble">
            <!-- 发送者信息 -->
            <div v-if="!message.isOwn" class="sender-info">
              <span class="sender-name">{{ message.sender.name }}</span>
              <span class="message-time">{{ formatTime(message.timestamp) }}</span>
            </div>

            <!-- 消息体 -->
            <div class="message-body">
              <!-- 文本消息 -->
              <div v-if="message.messageType === 'text'" class="text-message">
                {{ message.content }}
              </div>

              <!-- 图片消息 -->
              <div v-else-if="message.messageType === 'image'" class="image-message">
                <el-image
                  :src="message.content.imageUrl"
                  :preview-src-list="[message.content.imageUrl]"
                  fit="cover"
                  style="max-width: 200px; max-height: 200px"
                />
              </div>

              <!-- 文件消息 -->
              <div v-else-if="message.messageType === 'file'" class="file-message">
                <div class="file-info">
                  <i class="el-icon-document"></i>
                  <div class="file-details">
                    <div class="file-name">{{ message.content.fileName }}</div>
                    <div class="file-size">{{ formatFileSize(message.content.fileSize) }}</div>
                  </div>
                  <el-button 
                    type="text" 
                    size="mini"
                    @click="downloadFile(message.content)"
                  >
                    下载
                  </el-button>
                </div>
              </div>

              <!-- 系统消息 -->
              <div v-else-if="message.messageType === 'system'" class="system-message-content">
                {{ message.content }}
              </div>

              <!-- 表情消息 -->
              <div v-else-if="message.messageType === 'emoji'" class="emoji-message">
                <span class="emoji">{{ message.content }}</span>
              </div>

              <!-- 未知类型消息 -->
              <div v-else class="unknown-message">
                <span>不支持的消息类型</span>
              </div>
            </div>

            <!-- 消息状态（仅自己发送的消息） -->
            <div v-if="message.isOwn" class="message-status">
              <span class="message-time">{{ formatTime(message.timestamp) }}</span>
              <i 
                :class="getStatusIcon(message.status)"
                :style="{ color: getStatusColor(message.status) }"
                :title="getStatusText(message.status)"
              ></i>
            </div>
          </div>

          <!-- 自己的头像 -->
          <div v-if="message.isOwn" class="avatar">
            <el-avatar 
              :src="currentUserAvatar"
              :size="32"
              icon="el-icon-user-solid"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 无消息提示 -->
    <div v-if="!loading && messages.length === 0" class="no-messages">
      <i class="el-icon-chat-dot-round"></i>
      <p>还没有消息，开始聊天吧</p>
    </div>

    <!-- 加载中提示 -->
    <div v-if="loading && messages.length === 0" class="loading-messages">
      <el-loading-spinner></el-loading-spinner>
      <p>加载消息中...</p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'MessageList',

  props: {
    messages: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    canLoadMore: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      lastScrollHeight: 0,
      isScrollToBottom: true
    }
  },

  computed: {
    ...mapGetters(['avatar']),
    
    currentUserAvatar() {
      return this.avatar || ''
    }
  },

  watch: {
    messages: {
      handler() {
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      },
      deep: true
    }
  },

  mounted() {
    this.scrollToBottom()
    this.addScrollListener()
  },

  beforeDestroy() {
    this.removeScrollListener()
  },

  methods: {
    // 滚动到底部
    scrollToBottom() {
      const container = this.$refs.messageContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },

    // 添加滚动监听
    addScrollListener() {
      const container = this.$refs.messageContainer
      if (container) {
        container.addEventListener('scroll', this.handleScroll)
      }
    },

    // 移除滚动监听
    removeScrollListener() {
      const container = this.$refs.messageContainer
      if (container) {
        container.removeEventListener('scroll', this.handleScroll)
      }
    },

    // 处理滚动事件
    handleScroll(event) {
      const container = event.target
      const { scrollTop, scrollHeight, clientHeight } = container
      
      // 判断是否滚动到底部
      this.isScrollToBottom = scrollTop + clientHeight >= scrollHeight - 10
    },

    // 是否显示时间分隔线
    shouldShowTime(message) {
      const messageIndex = this.messages.findIndex(m => m.id === message.id)
      if (messageIndex === 0) return true
      
      const prevMessage = this.messages[messageIndex - 1]
      const timeDiff = message.timestamp - prevMessage.timestamp
      
      // 超过5分钟显示时间
      return timeDiff > 5 * 60 * 1000
    },

    // 格式化消息时间（用于分隔线）
    formatMessageTime(timestamp) {
      const date = new Date(timestamp)
      const now = new Date()
      const isToday = date.toDateString() === now.toDateString()
      
      if (isToday) {
        return date.toLocaleTimeString('zh-CN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      } else {
        return date.toLocaleString('zh-CN', {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    },

    // 格式化时间（用于消息）
    formatTime(timestamp) {
      const date = new Date(timestamp)
      return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    },

    // 格式化文件大小
    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    // 下载文件
    downloadFile(fileContent) {
      const link = document.createElement('a')
      link.href = fileContent.fileUrl
      link.download = fileContent.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },

    // 获取状态图标
    getStatusIcon(status) {
      const iconMap = {
        'sending': 'el-icon-loading',
        'sent': 'el-icon-check',
        'delivered': 'el-icon-success',
        'read': 'el-icon-success',
        'failed': 'el-icon-close'
      }
      return iconMap[status] || 'el-icon-question'
    },

    // 获取状态颜色
    getStatusColor(status) {
      const colorMap = {
        'sending': '#409EFF',
        'sent': '#909399',
        'delivered': '#67C23A',
        'read': '#67C23A',
        'failed': '#F56C6C'
      }
      return colorMap[status] || '#909399'
    },

    // 获取状态文本
    getStatusText(status) {
      const textMap = {
        'sending': '发送中',
        'sent': '已发送',
        'delivered': '已送达',
        'read': '已读',
        'failed': '发送失败'
      }
      return textMap[status] || '未知状态'
    }
  }
}
</script>

<style lang="scss" scoped>
.message-list {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
  background: #f5f5f5;
}

.load-more {
  text-align: center;
  margin-bottom: 16px;
}

.messages {
  .message-item {
    margin-bottom: 16px;

    &.system-message {
      .message-content {
        justify-content: center;

        .message-bubble {
          background: #e8f4ff;
          color: #409EFF;
          border-radius: 12px;
          padding: 8px 12px;
          font-size: 12px;
          border: none;
          box-shadow: none;
        }
      }
    }
  }
}

.time-divider {
  text-align: center;
  margin: 16px 0;
  
  span {
    background: rgba(0, 0, 0, 0.1);
    color: #666;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
  }
}

.message-content {
  display: flex;
  align-items: flex-end;
  gap: 8px;

  .own-message & {
    flex-direction: row-reverse;
  }
}

.avatar {
  flex-shrink: 0;
}

.message-bubble {
  max-width: 60%;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  .own-message & {
    background: #409EFF;
    color: #fff;

    .message-body {
      color: #fff;
    }
  }
}

.sender-info {
  padding: 8px 12px 4px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 12px;
  color: #666;

  .sender-name {
    font-weight: 500;
    margin-right: 8px;
  }

  .own-message & {
    border-bottom-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.8);
  }
}

.message-body {
  padding: 12px;

  .text-message {
    line-height: 1.4;
    word-break: break-word;
  }

  .image-message {
    padding: 0;
    
    .el-image {
      display: block;
      border-radius: 4px;
      overflow: hidden;
    }
  }

  .file-message {
    .file-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      background: #f9f9f9;
      border-radius: 4px;

      .own-message & {
        background: rgba(255, 255, 255, 0.1);
      }

      i {
        font-size: 24px;
        color: #409EFF;
      }

      .file-details {
        flex: 1;

        .file-name {
          font-weight: 500;
          margin-bottom: 2px;
        }

        .file-size {
          font-size: 12px;
          color: #666;

          .own-message & {
            color: rgba(255, 255, 255, 0.8);
          }
        }
      }
    }
  }

  .emoji-message {
    .emoji {
      font-size: 32px;
      line-height: 1;
    }
  }

  .system-message-content {
    text-align: center;
    font-size: 12px;
  }

  .unknown-message {
    color: #999;
    font-style: italic;
  }
}

.message-status {
  padding: 4px 12px;
  text-align: right;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;

  i {
    font-size: 14px;
  }
}

.no-messages, .loading-messages {
  text-align: center;
  padding: 40px 20px;
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
</style>