/**
 * Element Plus 适配层
 * 提供与Element UI兼容的API接口
 */

import { ElMessage, ElMessageBox, ElLoading, ElNotification } from 'element-plus'

// 消息提示适配
export const Message = {
  success: (message, options = {}) => {
    return ElMessage.success({
      message,
      ...options
    })
  },
  error: (message, options = {}) => {
    return ElMessage.error({
      message,
      ...options
    })
  },
  warning: (message, options = {}) => {
    return ElMessage.warning({
      message,
      ...options
    })
  },
  info: (message, options = {}) => {
    return ElMessage.info({
      message,
      ...options
    })
  },
  close: ElMessage.closeAll
}

// 确认对话框适配
export const MessageBox = {
  confirm: (message, title = '提示', options = {}) => {
    return ElMessageBox.confirm(message, title, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      ...options
    })
  },
  alert: (message, title = '提示', options = {}) => {
    return ElMessageBox.alert(message, title, {
      confirmButtonText: '确定',
      ...options
    })
  },
  prompt: (message, title = '提示', options = {}) => {
    return ElMessageBox.prompt(message, title, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      ...options
    })
  }
}

// 加载提示适配
export const Loading = {
  service: (options = {}) => {
    return ElLoading.service({
      text: '加载中...',
      background: 'rgba(0, 0, 0, 0.7)',
      ...options
    })
  }
}

// 通知适配
export const Notification = {
  success: (options = {}) => {
    return ElNotification.success({
      title: '成功',
      duration: 4500,
      ...options
    })
  },
  error: (options = {}) => {
    return ElNotification.error({
      title: '错误',
      duration: 4500,
      ...options
    })
  },
  warning: (options = {}) => {
    return ElNotification.warning({
      title: '警告',
      duration: 4500,
      ...options
    })
  },
  info: (options = {}) => {
    return ElNotification.info({
      title: '消息',
      duration: 4500,
      ...options
    })
  }
}

// 为了向后兼容，在Vue实例上挂载这些方法
export const installElementPlusCompat = (Vue) => {
  Vue.prototype.$message = Message
  Vue.prototype.$msgbox = MessageBox
  Vue.prototype.$alert = MessageBox.alert
  Vue.prototype.$confirm = MessageBox.confirm
  Vue.prototype.$prompt = MessageBox.prompt
  Vue.prototype.$loading = Loading
  Vue.prototype.$notify = Notification
}

export default {
  Message,
  MessageBox,
  Loading,
  Notification,
  installElementPlusCompat
}