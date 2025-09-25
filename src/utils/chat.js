/**
 * 聊天相关工具函数
 */

/**
 * 格式化消息时间
 * @param {number} timestamp 时间戳
 * @param {boolean} showSeconds 是否显示秒
 * @returns {string} 格式化后的时间
 */
export function formatMessageTime(timestamp, showSeconds = false) {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  
  const timeDiff = today.getTime() - messageDate.getTime()
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24)
  
  const timeFormat = showSeconds 
    ? { hour: '2-digit', minute: '2-digit', second: '2-digit' }
    : { hour: '2-digit', minute: '2-digit' }
  
  if (daysDiff === 0) {
    // 今天
    return date.toLocaleTimeString('zh-CN', timeFormat)
  } else if (daysDiff === 1) {
    // 昨天
    return '昨天 ' + date.toLocaleTimeString('zh-CN', timeFormat)
  } else if (daysDiff < 7) {
    // 本周
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return weekdays[date.getDay()] + ' ' + date.toLocaleTimeString('zh-CN', timeFormat)
  } else {
    // 更早
    return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', timeFormat)
  }
}

/**
 * 格式化相对时间
 * @param {number} timestamp 时间戳
 * @returns {string} 相对时间描述
 */
export function formatRelativeTime(timestamp) {
  if (!timestamp) return ''
  
  const now = Date.now()
  const diff = now - timestamp
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  const year = 365 * day
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < week) {
    return `${Math.floor(diff / day)}天前`
  } else if (diff < month) {
    return `${Math.floor(diff / week)}周前`
  } else if (diff < year) {
    return `${Math.floor(diff / month)}个月前`
  } else {
    return `${Math.floor(diff / year)}年前`
  }
}

/**
 * 计算时长
 * @param {number} startTime 开始时间戳
 * @param {number} endTime 结束时间戳
 * @returns {string} 时长描述
 */
export function calculateDuration(startTime, endTime = Date.now()) {
  if (!startTime) return ''
  
  const duration = Math.floor((endTime - startTime) / 1000)
  
  if (duration < 60) {
    return `${duration}秒`
  } else if (duration < 3600) {
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    return `${minutes}分${seconds}秒`
  } else if (duration < 86400) {
    const hours = Math.floor(duration / 3600)
    const minutes = Math.floor((duration % 3600) / 60)
    return `${hours}小时${minutes}分钟`
  } else {
    const days = Math.floor(duration / 86400)
    const hours = Math.floor((duration % 86400) / 3600)
    return `${days}天${hours}小时`
  }
}

/**
 * 格式化文件大小
 * @param {number} bytes 字节数
 * @returns {string} 格式化后的文件大小
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 检测消息中的链接
 * @param {string} text 消息文本
 * @returns {Array} 链接数组
 */
export function detectLinks(text) {
  if (!text) return []
  
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const matches = text.match(urlRegex)
  return matches || []
}

/**
 * 检测消息中的表情
 * @param {string} text 消息文本
 * @returns {boolean} 是否包含表情
 */
export function hasEmoji(text) {
  if (!text) return false
  
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u
  return emojiRegex.test(text)
}

/**
 * 过滤敏感词
 * @param {string} text 原始文本
 * @returns {string} 过滤后的文本
 */
export function filterSensitiveWords(text) {
  if (!text) return ''
  
  // 简单的敏感词过滤示例
  const sensitiveWords = ['垃圾', '骗子', '差评']
  let filteredText = text
  
  sensitiveWords.forEach(word => {
    const regex = new RegExp(word, 'gi')
    filteredText = filteredText.replace(regex, '*'.repeat(word.length))
  })
  
  return filteredText
}

/**
 * 生成唯一ID
 * @param {string} prefix 前缀
 * @returns {string} 唯一ID
 */
export function generateUniqueId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 消息去重
 * @param {Array} messages 消息数组
 * @returns {Array} 去重后的消息数组
 */
export function deduplicateMessages(messages) {
  if (!Array.isArray(messages)) return []
  
  const seen = new Set()
  return messages.filter(message => {
    const key = `${message.id}_${message.timestamp}_${message.content}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

/**
 * 消息排序
 * @param {Array} messages 消息数组
 * @param {string} order 排序方式 'asc' | 'desc'
 * @returns {Array} 排序后的消息数组
 */
export function sortMessages(messages, order = 'asc') {
  if (!Array.isArray(messages)) return []
  
  return [...messages].sort((a, b) => {
    const timeA = a.timestamp || 0
    const timeB = b.timestamp || 0
    
    return order === 'asc' ? timeA - timeB : timeB - timeA
  })
}

/**
 * 高亮搜索关键词
 * @param {string} text 原始文本
 * @param {string} keyword 搜索关键词
 * @returns {string} 高亮后的HTML
 */
export function highlightKeyword(text, keyword) {
  if (!text || !keyword) return text
  
  const regex = new RegExp(`(${keyword})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

/**
 * 检查是否为工作时间
 * @param {Object} workingHours 工作时间配置 {start: '09:00', end: '18:00'}
 * @param {Date} date 检查的时间，默认为当前时间
 * @returns {boolean} 是否为工作时间
 */
export function isWorkingTime(workingHours, date = new Date()) {
  if (!workingHours || !workingHours.start || !workingHours.end) {
    return true // 如果没有配置工作时间，默认为工作时间
  }
  
  const currentTime = date.toTimeString().slice(0, 5) // HH:MM格式
  return currentTime >= workingHours.start && currentTime <= workingHours.end
}

/**
 * 获取消息类型图标
 * @param {string} messageType 消息类型
 * @returns {string} 图标类名
 */
export function getMessageTypeIcon(messageType) {
  const iconMap = {
    'text': 'el-icon-chat-line-round',
    'image': 'el-icon-picture',
    'file': 'el-icon-document',
    'system': 'el-icon-info',
    'emoji': 'el-icon-sunny'
  }
  return iconMap[messageType] || 'el-icon-chat-line-round'
}

/**
 * 消息内容预览
 * @param {Object} message 消息对象
 * @param {number} maxLength 最大长度
 * @returns {string} 预览文本
 */
export function getMessagePreview(message, maxLength = 50) {
  if (!message) return ''
  
  let preview = ''
  
  switch (message.messageType) {
    case 'text':
      preview = message.content
      break
    case 'image':
      preview = '[图片]'
      break
    case 'file':
      preview = `[文件] ${message.content.fileName || '未知文件'}`
      break
    case 'system':
      preview = message.content
      break
    case 'emoji':
      preview = message.content
      break
    default:
      preview = '[消息]'
  }
  
  return preview.length > maxLength 
    ? preview.substring(0, maxLength) + '...'
    : preview
}

/**
 * 验证消息内容
 * @param {string} content 消息内容
 * @param {string} type 消息类型
 * @returns {Object} 验证结果 {valid: boolean, message: string}
 */
export function validateMessageContent(content, type = 'text') {
  if (!content || content.trim().length === 0) {
    return { valid: false, message: '消息内容不能为空' }
  }
  
  switch (type) {
    case 'text':
      if (content.length > 1000) {
        return { valid: false, message: '文本消息不能超过1000个字符' }
      }
      break
    case 'file':
      // 验证文件消息格式
      if (!content.fileUrl || !content.fileName) {
        return { valid: false, message: '文件消息格式不正确' }
      }
      break
  }
  
  return { valid: true, message: '' }
}

/**
 * 转义HTML特殊字符
 * @param {string} text 原始文本
 * @returns {string} 转义后的文本
 */
export function escapeHtml(text) {
  if (!text) return ''
  
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;'
  }
  
  return text.replace(/[&<>"']/g, match => htmlEscapes[match])
}

/**
 * 解析消息中的@用户
 * @param {string} text 消息文本
 * @returns {Array} @用户列表
 */
export function parseAtUsers(text) {
  if (!text) return []
  
  const atRegex = /@(\w+)/g
  const matches = []
  let match
  
  while ((match = atRegex.exec(text)) !== null) {
    matches.push(match[1])
  }
  
  return matches
}