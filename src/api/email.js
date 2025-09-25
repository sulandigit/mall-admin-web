import request from '@/utils/request'

// 邮件模板相关接口
export function fetchTemplateList(params) {
  return request({
    url: '/email/template/list',
    method: 'get',
    params: params
  })
}

export function createTemplate(data) {
  return request({
    url: '/email/template/create',
    method: 'post',
    data: data
  })
}

export function updateTemplate(id, data) {
  return request({
    url: '/email/template/update/' + id,
    method: 'post',
    data: data
  })
}

export function deleteTemplate(id) {
  return request({
    url: '/email/template/delete/' + id,
    method: 'get'
  })
}

export function getTemplate(id) {
  return request({
    url: '/email/template/' + id,
    method: 'get'
  })
}

export function previewTemplate(data) {
  return request({
    url: '/email/template/preview',
    method: 'post',
    data: data
  })
}

export function updateTemplateStatus(data) {
  return request({
    url: '/email/template/update/status',
    method: 'post',
    data: data
  })
}

// 邮件发送相关接口
export function sendSingleEmail(data) {
  return request({
    url: '/email/send/single',
    method: 'post',
    data: data
  })
}

export function sendBatchEmail(data) {
  return request({
    url: '/email/send/batch',
    method: 'post',
    data: data
  })
}

export function getRecipientList(params) {
  return request({
    url: '/email/recipient/list',
    method: 'get',
    params: params
  })
}

export function validateEmailList(data) {
  return request({
    url: '/email/send/validate',
    method: 'post',
    data: data
  })
}

export function getBatchSendProgress(taskId) {
  return request({
    url: '/email/send/progress/' + taskId,
    method: 'get'
  })
}

// 发送记录相关接口
export function fetchRecordList(params) {
  return request({
    url: '/email/record/list',
    method: 'get',
    params: params
  })
}

export function getRecordDetail(id) {
  return request({
    url: '/email/record/' + id,
    method: 'get'
  })
}

export function retryFailedEmail(id) {
  return request({
    url: '/email/record/retry/' + id,
    method: 'post'
  })
}

export function deleteRecord(id) {
  return request({
    url: '/email/record/delete/' + id,
    method: 'get'
  })
}

export function exportRecords(params) {
  return request({
    url: '/email/record/export',
    method: 'get',
    params: params,
    responseType: 'blob'
  })
}

// 邮件配置相关接口
export function getEmailConfig() {
  return request({
    url: '/email/config',
    method: 'get'
  })
}

export function updateEmailConfig(data) {
  return request({
    url: '/email/config',
    method: 'put',
    data: data
  })
}

export function testSMTPConnection(data) {
  return request({
    url: '/email/config/test',
    method: 'post',
    data: data
  })
}

export function getTemplateTypes() {
  return request({
    url: '/email/template/types',
    method: 'get'
  })
}

export function getTemplateVariables(type) {
  return request({
    url: '/email/template/variables/' + type,
    method: 'get'
  })
}