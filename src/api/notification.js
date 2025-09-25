import request from '@/utils/request'

/**
 * 通知消息管理API
 */

/**
 * 获取通知列表
 * @param {Object} params - 查询参数
 */
export function fetchNotificationList(params) {
  return request({
    url: '/admin/notification/list',
    method: 'get',
    params: params
  })
}

/**
 * 创建通知
 * @param {Object} data - 通知数据
 */
export function createNotification(data) {
  return request({
    url: '/admin/notification/create',
    method: 'post',
    data: data
  })
}

/**
 * 更新通知
 * @param {Number} id - 通知ID
 * @param {Object} data - 通知数据
 */
export function updateNotification(id, data) {
  return request({
    url: `/admin/notification/update/${id}`,
    method: 'post',
    data: data
  })
}

/**
 * 删除通知
 * @param {Number} id - 通知ID
 */
export function deleteNotification(id) {
  return request({
    url: `/admin/notification/delete/${id}`,
    method: 'post'
  })
}

/**
 * 标记通知为已读
 * @param {Number} id - 通知ID
 */
export function markNotificationAsRead(id) {
  return request({
    url: `/admin/notification/read/${id}`,
    method: 'post'
  })
}

/**
 * 批量标记通知为已读
 * @param {Array} ids - 通知ID数组
 */
export function batchMarkNotificationsAsRead(ids) {
  return request({
    url: '/admin/notification/batch/read',
    method: 'post',
    data: { ids }
  })
}

/**
 * 获取未读通知数量
 */
export function getUnreadNotificationCount() {
  return request({
    url: '/admin/notification/unread/count',
    method: 'get'
  })
}

/**
 * 获取系统消息列表
 * @param {Object} params - 查询参数
 */
export function fetchSystemMessageList(params) {
  return request({
    url: '/admin/message/system/list',
    method: 'get',
    params: params
  })
}

/**
 * 发送系统消息
 * @param {Object} data - 消息数据
 */
export function sendSystemMessage(data) {
  return request({
    url: '/admin/message/system/send',
    method: 'post',
    data: data
  })
}

/**
 * 获取用户消息列表
 * @param {Object} params - 查询参数
 */
export function fetchUserMessageList(params) {
  return request({
    url: '/admin/message/user/list',
    method: 'get',
    params: params
  })
}

/**
 * 发送用户消息
 * @param {Object} data - 消息数据
 */
export function sendUserMessage(data) {
  return request({
    url: '/admin/message/user/send',
    method: 'post',
    data: data
  })
}

/**
 * 获取消息模板列表
 */
export function fetchMessageTemplateList() {
  return request({
    url: '/admin/message/template/list',
    method: 'get'
  })
}

/**
 * 创建消息模板
 * @param {Object} data - 模板数据
 */
export function createMessageTemplate(data) {
  return request({
    url: '/admin/message/template/create',
    method: 'post',
    data: data
  })
}

/**
 * 更新消息模板
 * @param {Number} id - 模板ID
 * @param {Object} data - 模板数据
 */
export function updateMessageTemplate(id, data) {
  return request({
    url: `/admin/message/template/update/${id}`,
    method: 'post',
    data: data
  })
}

/**
 * 删除消息模板
 * @param {Number} id - 模板ID
 */
export function deleteMessageTemplate(id) {
  return request({
    url: `/admin/message/template/delete/${id}`,
    method: 'post'
  })
}

/**
 * 获取邮件配置
 */
export function getEmailConfig() {
  return request({
    url: '/admin/message/email/config',
    method: 'get'
  })
}

/**
 * 更新邮件配置
 * @param {Object} data - 邮件配置数据
 */
export function updateEmailConfig(data) {
  return request({
    url: '/admin/message/email/config/update',
    method: 'post',
    data: data
  })
}

/**
 * 测试邮件发送
 * @param {Object} data - 测试邮件数据
 */
export function testEmailSend(data) {
  return request({
    url: '/admin/message/email/test',
    method: 'post',
    data: data
  })
}

/**
 * 获取短信配置
 */
export function getSmsConfig() {
  return request({
    url: '/admin/message/sms/config',
    method: 'get'
  })
}

/**
 * 更新短信配置
 * @param {Object} data - 短信配置数据
 */
export function updateSmsConfig(data) {
  return request({
    url: '/admin/message/sms/config/update',
    method: 'post',
    data: data
  })
}

/**
 * 测试短信发送
 * @param {Object} data - 测试短信数据
 */
export function testSmsSend(data) {
  return request({
    url: '/admin/message/sms/test',
    method: 'post',
    data: data
  })
}