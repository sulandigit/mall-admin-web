<template>
  <transition name="error-toast">
    <div v-if="visible" class="error-toast" :class="typeClass">
      <div class="error-toast-content">
        <div class="error-icon">
          <i :class="iconClass"></i>
        </div>
        <div class="error-body">
          <div class="error-title">{{ title }}</div>
          <div class="error-message">{{ message }}</div>
          <div class="error-actions" v-if="showActions">
            <el-button size="mini" type="text" @click="retry" v-if="retryable">
              重试
            </el-button>
            <el-button size="mini" type="text" @click="dismiss">
              知道了
            </el-button>
          </div>
        </div>
        <div class="error-close" @click="dismiss">
          <i class="el-icon-close"></i>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'ErrorToast',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'error',
      validator: value => ['error', 'warning', 'info'].includes(value)
    },
    title: {
      type: String,
      default: '操作失败'
    },
    message: {
      type: String,
      required: true
    },
    retryable: {
      type: Boolean,
      default: false
    },
    showActions: {
      type: Boolean,
      default: true
    },
    duration: {
      type: Number,
      default: 4000
    },
    onRetry: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      timer: null
    }
  },
  computed: {
    typeClass() {
      return `error-toast--${this.type}`
    },
    iconClass() {
      const iconMap = {
        error: 'el-icon-error',
        warning: 'el-icon-warning',
        info: 'el-icon-info'
      }
      return iconMap[this.type] || iconMap.error
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.startTimer()
      } else {
        this.clearTimer()
      }
    }
  },
  methods: {
    startTimer() {
      if (this.duration > 0) {
        this.timer = setTimeout(() => {
          this.dismiss()
        }, this.duration)
      }
    },
    clearTimer() {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
    },
    dismiss() {
      this.$emit('dismiss')
    },
    retry() {
      if (this.onRetry) {
        this.onRetry()
      }
      this.$emit('retry')
    }
  },
  beforeDestroy() {
    this.clearTimer()
  }
}
</script>

<style scoped>
.error-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  min-width: 300px;
  max-width: 500px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.error-toast--error {
  border-left: 4px solid #f56c6c;
}

.error-toast--warning {
  border-left: 4px solid #e6a23c;
}

.error-toast--info {
  border-left: 4px solid #409eff;
}

.error-toast-content {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  position: relative;
}

.error-icon {
  font-size: 20px;
  margin-right: 12px;
  margin-top: 2px;
}

.error-toast--error .error-icon {
  color: #f56c6c;
}

.error-toast--warning .error-icon {
  color: #e6a23c;
}

.error-toast--info .error-icon {
  color: #409eff;
}

.error-body {
  flex: 1;
}

.error-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.error-message {
  font-size: 13px;
  color: #606266;
  line-height: 1.4;
  margin-bottom: 8px;
}

.error-actions {
  margin-top: 8px;
}

.error-actions .el-button {
  padding: 0;
  margin-right: 16px;
  font-size: 12px;
}

.error-close {
  position: absolute;
  top: 12px;
  right: 12px;
  cursor: pointer;
  color: #c0c4cc;
  font-size: 14px;
  transition: color 0.2s;
}

.error-close:hover {
  color: #909399;
}

/* 动画效果 */
.error-toast-enter-active,
.error-toast-leave-active {
  transition: all 0.3s ease;
}

.error-toast-enter {
  transform: translateX(100%);
  opacity: 0;
}

.error-toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>