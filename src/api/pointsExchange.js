import request from '@/utils/request'

/**
 * 积分兑换API接口
 */

// 获取兑换商品列表
export function fetchExchangeItems(params) {
  return request({
    url: '/points/exchange/items',
    method: 'get',
    params: params
  })
}

// 创建兑换商品
export function createExchangeItem(data) {
  return request({
    url: '/points/exchange/items/create',
    method: 'post',
    data: data
  })
}

// 更新兑换商品
export function updateExchangeItem(id, data) {
  return request({
    url: `/points/exchange/items/update/${id}`,
    method: 'put',
    data: data
  })
}

// 删除兑换商品
export function deleteExchangeItem(id) {
  return request({
    url: `/points/exchange/items/delete/${id}`,
    method: 'delete'
  })
}

// 获取兑换商品详情
export function getExchangeItem(id) {
  return request({
    url: `/points/exchange/items/${id}`,
    method: 'get'
  })
}

// 获取兑换记录列表
export function fetchExchangeRecords(params) {
  return request({
    url: '/points/exchange/records',
    method: 'get',
    params: params
  })
}

// 审核兑换申请
export function auditExchange(id, data) {
  return request({
    url: `/points/exchange/audit/${id}`,
    method: 'put',
    data: data
  })
}

// 批量审核兑换申请
export function batchAuditExchange(data) {
  return request({
    url: '/points/exchange/batch/audit',
    method: 'put',
    data: data
  })
}

// 获取兑换记录详情
export function getExchangeRecord(id) {
  return request({
    url: `/points/exchange/records/${id}`,
    method: 'get'
  })
}

// 更新发货信息
export function updateDeliveryInfo(recordId, data) {
  return request({
    url: `/points/exchange/delivery/${recordId}`,
    method: 'put',
    data: data
  })
}

// 取消兑换
export function cancelExchange(recordId, reason) {
  return request({
    url: `/points/exchange/cancel/${recordId}`,
    method: 'put',
    data: { reason }
  })
}

// 批量删除兑换商品
export function batchDeleteItems(ids) {
  return request({
    url: '/points/exchange/items/batch/delete',
    method: 'post',
    data: { ids }
  })
}

// 批量上下架商品
export function batchToggleItemStatus(ids, status) {
  return request({
    url: '/points/exchange/items/batch/toggle',
    method: 'put',
    data: { ids, status }
  })
}