<template>
  <el-dialog
    title="客服配置"
    :visible.sync="dialogVisible"
    width="600px"
    @closed="handleDialogClosed"
  >
    <el-form ref="configForm" :model="configForm" label-width="120px">
      <!-- 基本设置 -->
      <el-card class="config-section">
        <div slot="header">基本设置</div>
        
        <el-form-item label="自动接受会话">
          <el-switch
            v-model="configForm.autoAccept"
            active-text="开启"
            inactive-text="关闭"
          />
          <div class="form-tip">开启后将自动接受新的客户会话</div>
        </el-form-item>

        <el-form-item label="最大并发会话">
          <el-input-number
            v-model="configForm.maxSessions"
            :min="1"
            :max="50"
            size="small"
          />
          <div class="form-tip">同时处理的最大会话数量</div>
        </el-form-item>

        <el-form-item label="工作时间">
          <el-time-picker
            v-model="workingHours"
            is-range
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="HH:mm"
            value-format="HH:mm"
            size="small"
          />
          <div class="form-tip">设置您的工作时间段</div>
        </el-form-item>
      </el-card>

      <!-- 通知设置 -->
      <el-card class="config-section">
        <div slot="header">通知设置</div>
        
        <el-form-item label="消息提示音">
          <el-switch
            v-model="configForm.notificationSound"
            active-text="开启"
            inactive-text="关闭"
          />
          <el-button 
            type="text" 
            size="mini"
            @click="testSound"
            style="margin-left: 10px;"
          >
            测试音效
          </el-button>
        </el-form-item>

        <el-form-item label="桌面通知">
          <el-switch
            v-model="configForm.desktopNotification"
            active-text="开启"
            inactive-text="关闭"
          />
          <el-button 
            type="text" 
            size="mini"
            @click="requestNotificationPermission"
            style="margin-left: 10px;"
          >
            申请权限
          </el-button>
        </el-form-item>

        <el-form-item label="自动回复">
          <el-switch
            v-model="configForm.autoReply"
            active-text="开启"
            inactive-text="关闭"
          />
        </el-form-item>

        <el-form-item v-if="configForm.autoReply" label="自动回复内容">
          <el-input
            v-model="configForm.autoReplyMessage"
            type="textarea"
            :rows="3"
            placeholder="请输入自动回复内容"
          />
        </el-form-item>
      </el-card>

      <!-- 快捷键设置 -->
      <el-card class="config-section">
        <div slot="header">快捷键设置</div>
        
        <el-form-item label="发送消息">
          <el-select v-model="configForm.sendMessageKey" size="small">
            <el-option label="Enter" value="enter" />
            <el-option label="Ctrl + Enter" value="ctrl+enter" />
          </el-select>
        </el-form-item>

        <el-form-item label="快速回复">
          <el-input
            v-model="configForm.quickReplyKey"
            placeholder="例如: Alt + Q"
            size="small"
          />
        </el-form-item>

        <el-form-item label="切换会话">
          <el-input
            v-model="configForm.switchSessionKey"
            placeholder="例如: Ctrl + Tab"
            size="small"
          />
        </el-form-item>
      </el-card>

      <!-- 个性化设置 -->
      <el-card class="config-section">
        <div slot="header">个性化设置</div>
        
        <el-form-item label="主题色彩">
          <el-color-picker 
            v-model="configForm.themeColor"
            size="small"
          />
        </el-form-item>

        <el-form-item label="字体大小">
          <el-select v-model="configForm.fontSize" size="small">
            <el-option label="小" value="small" />
            <el-option label="中" value="medium" />
            <el-option label="大" value="large" />
          </el-select>
        </el-form-item>

        <el-form-item label="聊天气泡样式">
          <el-select v-model="configForm.bubbleStyle" size="small">
            <el-option label="圆角" value="rounded" />
            <el-option label="方角" value="square" />
            <el-option label="椭圆" value="oval" />
          </el-select>
        </el-form-item>
      </el-card>
    </el-form>

    <div slot="footer">
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button @click="resetConfig">重置</el-button>
      <el-button type="primary" @click="saveConfig">保存配置</el-button>
    </div>

    <!-- 测试音效 -->
    <audio ref="testAudio" preload="auto" src="/static/sounds/message.mp3"></audio>
  </el-dialog>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'ServiceConfigDialog',

  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      configForm: {
        autoAccept: false,
        maxSessions: 10,
        notificationSound: true,
        desktopNotification: false,
        autoReply: false,
        autoReplyMessage: '您好，我是客服小助手，请问有什么可以帮助您的吗？',
        sendMessageKey: 'enter',
        quickReplyKey: 'Alt + Q',
        switchSessionKey: 'Ctrl + Tab',
        themeColor: '#409EFF',
        fontSize: 'medium',
        bubbleStyle: 'rounded'
      },
      
      workingHours: ['09:00', '18:00']
    }
  },

  computed: {
    ...mapState('customerService', ['serviceConfig']),

    dialogVisible: {
      get() {
        return this.visible
      },
      set(value) {
        this.$emit('update:visible', value)
      }
    }
  },

  watch: {
    visible(newVal) {
      if (newVal) {
        this.loadConfig()
      }
    }
  },

  methods: {
    ...mapActions('customerService', [
      'updateServiceConfig',
      'loadServiceConfig'
    ]),

    // 加载配置
    loadConfig() {
      // 从store加载配置
      if (this.serviceConfig) {
        this.configForm = { ...this.serviceConfig }
        
        if (this.serviceConfig.workingHours) {
          this.workingHours = [
            this.serviceConfig.workingHours.start,
            this.serviceConfig.workingHours.end
          ]
        }
      }
    },

    // 保存配置
    async saveConfig() {
      try {
        const config = {
          ...this.configForm,
          workingHours: {
            start: this.workingHours[0],
            end: this.workingHours[1]
          }
        }

        await this.updateServiceConfig(config)
        this.$message.success('配置保存成功')
        this.dialogVisible = false
      } catch (error) {
        console.error('保存配置失败:', error)
        this.$message.error('保存配置失败')
      }
    },

    // 重置配置
    resetConfig() {
      this.$confirm('确定要重置所有配置吗？', '确认重置', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.configForm = {
          autoAccept: false,
          maxSessions: 10,
          notificationSound: true,
          desktopNotification: false,
          autoReply: false,
          autoReplyMessage: '您好，我是客服小助手，请问有什么可以帮助您的吗？',
          sendMessageKey: 'enter',
          quickReplyKey: 'Alt + Q',
          switchSessionKey: 'Ctrl + Tab',
          themeColor: '#409EFF',
          fontSize: 'medium',
          bubbleStyle: 'rounded'
        }
        this.workingHours = ['09:00', '18:00']
        this.$message.success('配置已重置')
      }).catch(() => {
        // 取消重置
      })
    },

    // 测试音效
    testSound() {
      if (this.$refs.testAudio) {
        this.$refs.testAudio.play().catch(error => {
          console.warn('播放测试音效失败:', error)
          this.$message.warning('音效播放失败，请检查浏览器设置')
        })
      }
    },

    // 申请通知权限
    requestNotificationPermission() {
      if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            this.$message.success('通知权限已获取')
            this.configForm.desktopNotification = true
          } else {
            this.$message.warning('通知权限被拒绝')
            this.configForm.desktopNotification = false
          }
        })
      } else {
        this.$message.error('当前浏览器不支持桌面通知')
      }
    },

    // 处理对话框关闭
    handleDialogClosed() {
      // 清理或重置操作
    }
  }
}
</script>

<style lang="scss" scoped>
.config-section {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  ::v-deep .el-card__header {
    padding: 12px 16px;
    background: #f5f7fa;
    border-bottom: 1px solid #ebeef5;
    font-weight: 500;
  }

  ::v-deep .el-card__body {
    padding: 16px;
  }
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

::v-deep .el-form-item {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

::v-deep .el-time-picker {
  width: 100%;
}
</style>