<template>
  <div class="message-input">
    <!-- 工具栏 -->
    <div class="input-toolbar">
      <!-- 表情按钮 -->
      <el-popover
        placement="top-start"
        width="300"
        trigger="click"
        :disabled="disabled"
      >
        <emoji-picker @select-emoji="insertEmoji" />
        <el-button 
          slot="reference" 
          type="text" 
          icon="el-icon-sunny"
          :disabled="disabled"
          title="表情"
        />
      </el-popover>

      <!-- 文件上传 -->
      <el-upload
        ref="fileUpload"
        :action="uploadAction"
        :headers="uploadHeaders"
        :before-upload="beforeFileUpload"
        :on-success="onFileUploadSuccess"
        :on-error="onFileUploadError"
        :show-file-list="false"
        :disabled="disabled"
      >
        <el-button 
          type="text" 
          icon="el-icon-paperclip"
          :disabled="disabled"
          title="发送文件"
        />
      </el-upload>

      <!-- 图片上传 -->
      <el-upload
        ref="imageUpload"
        :action="uploadAction"
        :headers="uploadHeaders"
        :before-upload="beforeImageUpload"
        :on-success="onImageUploadSuccess"
        :on-error="onImageUploadError"
        :show-file-list="false"
        accept="image/*"
        :disabled="disabled"
      >
        <el-button 
          type="text" 
          icon="el-icon-picture"
          :disabled="disabled"
          title="发送图片"
        />
      </el-upload>

      <!-- 快捷回复 -->
      <el-dropdown @command="insertQuickReply" :disabled="disabled">
        <el-button 
          type="text" 
          icon="el-icon-chat-line-round"
          :disabled="disabled"
          title="快捷回复"
        />
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item 
            v-for="reply in quickReplies" 
            :key="reply.id"
            :command="reply.content"
          >
            {{ reply.title }}
          </el-dropdown-item>
          <el-dropdown-item divided command="manage">
            管理快捷回复
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <!-- 分隔符 -->
      <div class="toolbar-divider"></div>

      <!-- 发送模式切换 -->
      <el-tooltip content="Ctrl+Enter发送" placement="top">
        <el-button 
          type="text" 
          :icon="sendMode === 'enter' ? 'el-icon-check' : 'el-icon-refresh'"
          @click="toggleSendMode"
          :disabled="disabled"
        />
      </el-tooltip>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <el-input
        ref="messageInput"
        v-model="inputText"
        type="textarea"
        :placeholder="placeholder"
        :disabled="disabled"
        :autosize="{ minRows: 2, maxRows: 6 }"
        resize="none"
        @keydown.native="handleKeyDown"
        @input="handleInput"
      />
      
      <!-- 发送按钮 -->
      <div class="send-button">
        <el-button 
          type="primary"
          icon="el-icon-position"
          :disabled="!canSend"
          @click="sendMessage"
        >
          发送
        </el-button>
      </div>
    </div>

    <!-- 正在输入提示 -->
    <div v-if="isTyping" class="typing-indicator">
      <span>正在输入...</span>
    </div>

    <!-- 快捷回复管理对话框 -->
    <quick-reply-dialog
      :visible.sync="quickReplyDialogVisible"
    />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import EmojiPicker from './EmojiPicker'
import QuickReplyDialog from './QuickReplyDialog'

export default {
  name: 'MessageInput',

  components: {
    EmojiPicker,
    QuickReplyDialog
  },

  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: '输入消息...'
    }
  },

  data() {
    return {
      inputText: '',
      sendMode: 'enter', // 'enter' | 'ctrl-enter'
      isTyping: false,
      typingTimer: null,
      quickReplyDialogVisible: false
    }
  },

  computed: {
    ...mapState('customerService', ['quickReplies']),
    ...mapGetters(['token']),

    // 是否可以发送
    canSend() {
      return !this.disabled && this.inputText.trim().length > 0
    },

    // 上传地址
    uploadAction() {
      return '/api/chat/upload'
    },

    // 上传请求头
    uploadHeaders() {
      return {
        'Authorization': `Bearer ${this.token}`
      }
    }
  },

  mounted() {
    // 加载快捷回复
    this.loadQuickReplies()
  },

  methods: {
    // 处理键盘事件
    handleKeyDown(event) {
      if (this.disabled) return

      // Enter键发送
      if (event.key === 'Enter') {
        if (this.sendMode === 'enter' && !event.shiftKey && !event.ctrlKey) {
          event.preventDefault()
          this.sendMessage()
        } else if (this.sendMode === 'ctrl-enter' && event.ctrlKey) {
          event.preventDefault()
          this.sendMessage()
        }
      }

      // Esc键清空输入
      if (event.key === 'Escape') {
        this.inputText = ''
      }
    },

    // 处理输入事件
    handleInput() {
      this.showTypingIndicator()
    },

    // 显示正在输入指示器
    showTypingIndicator() {
      this.isTyping = true
      
      if (this.typingTimer) {
        clearTimeout(this.typingTimer)
      }
      
      this.typingTimer = setTimeout(() => {
        this.isTyping = false
      }, 1000)
    },

    // 发送消息
    sendMessage() {
      if (!this.canSend) return

      const content = this.inputText.trim()
      this.$emit('send-message', content, 'text')
      this.inputText = ''
      this.isTyping = false
      
      // 重新聚焦输入框
      this.$nextTick(() => {
        this.$refs.messageInput.focus()
      })
    },

    // 插入表情
    insertEmoji(emoji) {
      const textarea = this.$refs.messageInput.$el.querySelector('textarea')
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      
      const before = this.inputText.substring(0, start)
      const after = this.inputText.substring(end)
      
      this.inputText = before + emoji + after
      
      // 设置光标位置
      this.$nextTick(() => {
        const newPosition = start + emoji.length
        textarea.setSelectionRange(newPosition, newPosition)
        textarea.focus()
      })
    },

    // 插入快捷回复
    insertQuickReply(content) {
      if (content === 'manage') {
        this.quickReplyDialogVisible = true
        return
      }

      // 如果输入框为空，直接替换
      if (!this.inputText.trim()) {
        this.inputText = content
      } else {
        // 否则追加
        this.inputText += '\n' + content
      }

      this.$nextTick(() => {
        this.$refs.messageInput.focus()
      })
    },

    // 切换发送模式
    toggleSendMode() {
      this.sendMode = this.sendMode === 'enter' ? 'ctrl-enter' : 'enter'
      
      const modeText = this.sendMode === 'enter' ? 'Enter发送' : 'Ctrl+Enter发送'
      this.$message.success(`已切换到 ${modeText} 模式`)
    },

    // 文件上传前检查
    beforeFileUpload(file) {
      const isValidSize = file.size / 1024 / 1024 < 10 // 限制10MB
      
      if (!isValidSize) {
        this.$message.error('文件大小不能超过10MB')
        return false
      }

      this.$message.info('正在上传文件...')
      return true
    },

    // 图片上传前检查
    beforeImageUpload(file) {
      const isImage = file.type.startsWith('image/')
      const isValidSize = file.size / 1024 / 1024 < 5 // 限制5MB
      
      if (!isImage) {
        this.$message.error('只能上传图片文件')
        return false
      }
      
      if (!isValidSize) {
        this.$message.error('图片大小不能超过5MB')
        return false
      }

      this.$message.info('正在上传图片...')
      return true
    },

    // 文件上传成功
    onFileUploadSuccess(response, file) {
      if (response.code === 200 && response.data) {
        this.$emit('send-file', {
          fileUrl: response.data.url,
          fileName: file.name,
          fileSize: file.size
        })
        this.$message.success('文件发送成功')
      } else {
        this.$message.error('文件上传失败')
      }
    },

    // 图片上传成功
    onImageUploadSuccess(response, file) {
      if (response.code === 200 && response.data) {
        this.$emit('send-message', {
          imageUrl: response.data.url,
          imageName: file.name
        }, 'image')
        this.$message.success('图片发送成功')
      } else {
        this.$message.error('图片上传失败')
      }
    },

    // 文件上传失败
    onFileUploadError(error) {
      console.error('文件上传失败:', error)
      this.$message.error('文件上传失败，请重试')
    },

    // 图片上传失败
    onImageUploadError(error) {
      console.error('图片上传失败:', error)
      this.$message.error('图片上传失败，请重试')
    },

    // 加载快捷回复
    async loadQuickReplies() {
      try {
        await this.$store.dispatch('customerService/loadQuickReplies')
      } catch (error) {
        console.error('加载快捷回复失败:', error)
      }
    },

    // 聚焦输入框
    focus() {
      this.$refs.messageInput.focus()
    },

    // 清空输入
    clear() {
      this.inputText = ''
    }
  }
}
</script>

<style lang="scss" scoped>
.message-input {
  background: #fff;
  border-top: 1px solid #e8eaec;
}

.input-toolbar {
  padding: 8px 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 4px;

  .el-button {
    padding: 8px;
    
    &:hover {
      color: #409EFF;
    }
  }

  .toolbar-divider {
    width: 1px;
    height: 20px;
    background: #e8eaec;
    margin: 0 8px;
  }
}

.input-area {
  padding: 12px 16px;
  display: flex;
  gap: 12px;
  align-items: flex-end;

  .el-textarea {
    flex: 1;
  }

  ::v-deep .el-textarea__inner {
    border: none;
    background: #f5f5f5;
    border-radius: 6px;
    padding: 8px 12px;
    line-height: 1.4;
    resize: none;
    
    &:focus {
      background: #fff;
      border: 1px solid #409EFF;
    }
  }

  .send-button {
    .el-button {
      padding: 8px 16px;
      border-radius: 6px;
    }
  }
}

.typing-indicator {
  padding: 0 16px 8px;
  font-size: 12px;
  color: #999;
  
  span {
    &::after {
      content: '';
      animation: typing 1.5s infinite;
    }
  }
}

@keyframes typing {
  0%, 60%, 100% {
    opacity: 1;
  }
  30% {
    opacity: 0;
  }
}
</style>