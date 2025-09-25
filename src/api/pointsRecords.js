import request from '@/utils/request'

/**
 * 积分记录API接口
 */

// 获取积分记录列表
export function fetchPointsRecords(params) {
  return request({
    url: '/points/records/list',
    method: 'get',
    params: params
  })
}

// 获取积分记录详情
export function getPointsRecord(id) {
  return request({
    url: `/points/records/${id}`,
    method: 'get'
  })
}

// 手动调整用户积分
export function adjustPoints(data) {
  return request({
    url: '/points/records/adjust',
    method: 'post',
    data: data
  })
}

// 导出积分记录
export function exportRecords(params) {
  return request({
    url: '/points/records/export',
    method: 'get',
    params: params,
    responseType: 'blob'
  })
}

// 获取用户积分余额
export function getMemberPoints(memberId) {
  return request({
    url: `/points/records/balance/${memberId}`,
    method: 'get'
  })
}

// 获取积分统计概览
export function getPointsStatistics(params) {
  return request({
    url: '/points/records/statistics',
    method: 'get',
    params: params
  })
}

// 获取积分流水明细
export function getPointsFlowDetails(memberId, params) {
  return request({
    url: `/points/records/flow/${memberId}`,
    method: 'get',
    params: params
  })
}

// 批量调整积分
export function batchAdjustPoints(data) {
  return request({
    url: '/points/records/batch/adjust',
    method: 'post',
    data: data
  })
}

// 撤销积分调整
export function revokePointsAdjustment(recordId) {
  return request({
    url: `/points/records/revoke/${recordId}`,
    method: 'put'
  })
}