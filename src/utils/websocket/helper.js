/**
 * WebSocket相关工具函数
 */

/**
 * 获取WebSocket连接URL
 * @param {string} baseUrl 基础URL
 * @param {string} token 认证token
 * @returns {string} 完整的WebSocket URL
 */
export function getWebSocketUrl(baseUrl, token) {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = baseUrl || window.location.host
  return `${protocol}//${host}/ws/customer-service?token=${token}`
}

/**
 * 创建消息对象
 * @param {string} type 消息类型
 * @param {object} data 消息数据
 * @returns {object} 格式化的消息对象
 */
export function createMessage(type, data) {
  return {
    type,
    data,
    timestamp: Date.now(),
    id: generateMessageId()
  }
}

/**
 * 生成消息ID
 * @returns {string} 唯一消息ID
 */
export function generateMessageId() {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 验证消息格式
 * @param {object} message 消息对象
 * @returns {boolean} 是否为有效消息
 */
export function validateMessage(message) {
  if (!message || typeof message !== 'object') {
    return false
  }

  const { type, data } = message
  
  if (!type || typeof type !== 'string') {
    return false
  }

  // 基本的消息类型验证
  const validTypes = [
    'chat.message',
    'session.new',
    'session.close',
    'service.status',
    'system.notification',
    'ping',
    'pong'
  ]

  return validTypes.includes(type)
}

/**
 * 格式化聊天消息
 * @param {object} rawMessage 原始消息
 * @returns {object} 格式化后的消息
 */
export function formatChatMessage(rawMessage) {
  const {
    id,
    sessionId,
    content,
    messageType = 'text',
    sender,
    timestamp,
    status = 'sent'
  } = rawMessage

  return {
    id: id || generateMessageId(),
    sessionId,
    content,
    messageType,
    sender: {
      id: sender.id,
      name: sender.name,
      type: sender.type, // 'customer' | 'service'
      avatar: sender.avatar
    },
    timestamp: timestamp || Date.now(),
    status, // 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
    isOwn: sender.type === 'service' // 是否为当前客服发送的消息
  }
}

/**
 * 格式化会话对象
 * @param {object} rawSession 原始会话数据
 * @returns {object} 格式化后的会话
 */
export function formatSession(rawSession) {
  const {
    id,
    customer,
    service,
    status,
    createdAt,
    updatedAt,
    lastMessage,
    unreadCount = 0
  } = rawSession

  return {
    id,
    customer: {
      id: customer.id,
      name: customer.name,
      avatar: customer.avatar,
      vipLevel: customer.vipLevel
    },
    service: service ? {
      id: service.id,
      name: service.name,
      avatar: service.avatar
    } : null,
    status, // 'waiting' | 'active' | 'closed'
    createdAt,
    updatedAt,
    lastMessage: lastMessage ? formatChatMessage(lastMessage) : null,
    unreadCount
  }
}

/**
 * 连接状态映射
 */
export const CONNECTION_STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error',
  CLOSING: 'closing'
}

/**
 * 客服状态映射
 */
export const SERVICE_STATUS = {
  ONLINE: 'online',
  BUSY: 'busy',
  AWAY: 'away',
  OFFLINE: 'offline'
}

/**
 * 消息类型映射
 */
export const MESSAGE_TYPE = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  SYSTEM: 'system',
  EMOJI: 'emoji'
}

/**
 * 会话状态映射
 */
export const SESSION_STATUS = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  CLOSED: 'closed'
}

/**
 * 获取连接状态描述
 * @param {string} status 连接状态
 * @returns {string} 状态描述
 */
export function getConnectionStatusText(status) {
  const statusMap = {
    [CONNECTION_STATUS.DISCONNECTED]: '未连接',
    [CONNECTION_STATUS.CONNECTING]: '连接中',
    [CONNECTION_STATUS.CONNECTED]: '已连接',
    [CONNECTION_STATUS.RECONNECTING]: '重连中',
    [CONNECTION_STATUS.ERROR]: '连接错误',
    [CONNECTION_STATUS.CLOSING]: '断开中'
  }
  return statusMap[status] || '未知状态'
}

/**
 * 获取客服状态描述
 * @param {string} status 客服状态
 * @returns {string} 状态描述
 */
export function getServiceStatusText(status) {
  const statusMap = {
    [SERVICE_STATUS.ONLINE]: '在线',
    [SERVICE_STATUS.BUSY]: '忙碌',
    [SERVICE_STATUS.AWAY]: '离开',
    [SERVICE_STATUS.OFFLINE]: '离线'
  }
  return statusMap[status] || '未知状态'
}

/**
 * 获取会话状态描述
 * @param {string} status 会话状态
 * @returns {string} 状态描述
 */
export function getSessionStatusText(status) {
  const statusMap = {
    [SESSION_STATUS.WAITING]: '等待接入',
    [SESSION_STATUS.ACTIVE]: '进行中',
    [SESSION_STATUS.CLOSED]: '已结束'
  }
  return statusMap[status] || '未知状态'
}

/**
 * 检查是否支持WebSocket
 * @returns {boolean} 是否支持
 */
export function isWebSocketSupported() {
  return 'WebSocket' in window && window.WebSocket !== null
}

/**
 * 安全的JSON解析
 * @param {string} jsonString JSON字符串
 * @returns {object|null} 解析结果
 */
export function safeJSONParse(jsonString) {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('JSON解析失败:', error)
    return null
  }
}

/**
 * 安全的JSON序列化
 * @param {object} obj 要序列化的对象
 * @returns {string|null} 序列化结果
 */
export function safeJSONStringify(obj) {
  try {
    return JSON.stringify(obj)
  } catch (error) {
    console.error('JSON序列化失败:', error)
    return null
  }
}