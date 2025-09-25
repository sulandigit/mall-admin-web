import request from '@/utils/request'

/**
 * 客服聊天相关API
 */

// 获取会话列表
export function getSessionList(params) {
  return request({
    url: '/api/chat/sessions',
    method: 'get',
    params
  })
}

// 获取会话详情
export function getSessionDetail(sessionId) {
  return request({
    url: `/api/chat/sessions/${sessionId}`,
    method: 'get'
  })
}

// 获取消息历史
export function getMessageHistory(sessionId, params) {
  return request({
    url: `/api/chat/sessions/${sessionId}/messages`,
    method: 'get',
    params
  })
}

// 发送消息 (HTTP fallback)
export function sendMessage(data) {
  return request({
    url: '/api/chat/messages',
    method: 'post',
    data
  })
}

// 上传文件
export function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/api/chat/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 更新客服状态
export function updateServiceStatus(status) {
  return request({
    url: '/api/service/status',
    method: 'put',
    data: { status }
  })
}

// 获取客服状态
export function getServiceStatus() {
  return request({
    url: '/api/service/status',
    method: 'get'
  })
}

// 结束会话
export function closeSession(sessionId, reason) {
  return request({
    url: `/api/chat/sessions/${sessionId}/close`,
    method: 'post',
    data: { reason }
  })
}

// 转接会话
export function transferSession(sessionId, targetServiceId) {
  return request({
    url: `/api/chat/sessions/${sessionId}/transfer`,
    method: 'post',
    data: { targetServiceId }
  })
}

// 获取快捷回复模板
export function getQuickReplies() {
  return request({
    url: '/api/service/quick-replies',
    method: 'get'
  })
}

// 保存快捷回复模板
export function saveQuickReply(data) {
  return request({
    url: '/api/service/quick-replies',
    method: 'post',
    data
  })
}

// 获取客户信息
export function getCustomerInfo(customerId) {
  return request({
    url: `/api/customers/${customerId}`,
    method: 'get'
  })
}

// 获取客服统计数据
export function getServiceAnalytics(params) {
  return request({
    url: '/api/service/analytics',
    method: 'get',
    params
  })
}

// 获取在线客服列表
export function getOnlineServices() {
  return request({
    url: '/api/service/online',
    method: 'get'
  })
}