<template>
  <div class="chat-window">
    <!-- 聊天头部 -->
    <chat-header 
      :session="activeSession"
      :connection-status="connectionStatus"
      @close-session="handleCloseSession"
      @transfer-session="handleTransferSession"
    />
    
    <!-- 主要内容区域 -->
    <div class="chat-content">
      <!-- 消息列表 -->
      <div class="message-area">
        <message-list
          :messages="activeSessionMessages"
          :loading="messageLoading"
          @load-more="handleLoadMore"
        />
      </div>
      
      <!-- 消息输入区域 -->
      <div class="input-area">
        <message-input
          :disabled="!canSendMessage"
          :placeholder="inputPlaceholder"
          @send-message="handleSendMessage"
          @send-file="handleSendFile"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import ChatHeader from './ChatHeader'
import MessageList from './MessageList'
import MessageInput from './MessageInput'

export default {
  name: 'ChatWindow',
  
  components: {
    ChatHeader,
    MessageList,
    MessageInput
  },

  props: {
    sessionId: {
      type: String,
      default: ''
    }
  },

  computed: {
    ...mapState('chat', [
      'activeSession',
      'connectionStatus',
      'messageLoading'
    ]),
    
    ...mapGetters('chat', [
      'activeSessionMessages',
      'isConnected'
    ]),
    
    ...mapGetters('customerService', [
      'isWorking'
    ]),

    // 是否可以发送消息
    canSendMessage() {
      return this.activeSession && 
             this.isConnected && 
             this.isWorking &&
             this.activeSession.status === 'active'
    },

    // 输入框提示文本
    inputPlaceholder() {
      if (!this.activeSession) {
        return '请选择一个会话开始聊天'
      }
      if (!this.isConnected) {
        return '连接已断开，无法发送消息'
      }
      if (!this.isWorking) {
        return '请先设置为在线状态'
      }
      if (this.activeSession.status !== 'active') {
        return '会话已结束，无法发送消息'
      }
      return '输入消息...'
    }
  },

  watch: {
    // 监听sessionId变化
    sessionId: {
      handler(newSessionId) {
        if (newSessionId && newSessionId !== this.activeSession?.id) {
          this.switchToSession(newSessionId)
        }
      },
      immediate: true
    }
  },

  methods: {
    ...mapActions('chat', [
      'switchSession',
      'sendMessage',
      'closeSessionAction',
      'transferSessionAction',
      'loadSessionMessages'
    ]),

    // 切换到指定会话
    async switchToSession(sessionId) {
      try {
        // 从会话列表中找到对应会话
        const session = this.$store.state.chat.sessions.find(s => s.id === sessionId)
        if (session) {
          await this.switchSession(session)
        }
      } catch (error) {
        console.error('切换会话失败:', error)
        this.$message.error('切换会话失败')
      }
    },

    // 处理发送消息
    async handleSendMessage(content, messageType = 'text') {
      if (!this.activeSession) {
        this.$message.warning('请先选择一个会话')
        return
      }

      try {
        await this.sendMessage({
          sessionId: this.activeSession.id,
          content,
          messageType
        })
      } catch (error) {
        console.error('发送消息失败:', error)
        this.$message.error('发送消息失败')
      }
    },

    // 处理发送文件
    async handleSendFile(file) {
      try {
        // 这里需要先上传文件，然后发送文件消息
        const uploadResponse = await this.$api.customerService.uploadFile(file)
        if (uploadResponse.data) {
          await this.handleSendMessage({
            fileUrl: uploadResponse.data.url,
            fileName: file.name,
            fileSize: file.size
          }, 'file')
        }
      } catch (error) {
        console.error('发送文件失败:', error)
        this.$message.error('发送文件失败')
      }
    },

    // 处理关闭会话
    async handleCloseSession(reason) {
      if (!this.activeSession) return

      try {
        await this.$confirm(`确定要关闭与 ${this.activeSession.customer.name} 的会话吗？`, '确认关闭', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await this.closeSessionAction({
          sessionId: this.activeSession.id,
          reason
        })

        this.$message.success('会话已关闭')
      } catch (error) {
        if (error !== 'cancel') {
          console.error('关闭会话失败:', error)
          this.$message.error('关闭会话失败')
        }
      }
    },

    // 处理转接会话
    async handleTransferSession(targetServiceId) {
      if (!this.activeSession) return

      try {
        await this.transferSessionAction({
          sessionId: this.activeSession.id,
          targetServiceId
        })

        this.$message.success('会话转接成功')
      } catch (error) {
        console.error('转接会话失败:', error)
        this.$message.error('转接会话失败')
      }
    },

    // 加载更多消息
    async handleLoadMore() {
      if (!this.activeSession) return

      try {
        await this.loadSessionMessages(this.activeSession.id)
      } catch (error) {
        console.error('加载更多消息失败:', error)
        this.$message.error('加载更多消息失败')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.chat-window {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.message-area {
  flex: 1;
  overflow: hidden;
}

.input-area {
  border-top: 1px solid #e8eaec;
  background: #fafafa;
}
</style>