import request from '@/utils/request'

/**
 * 积分规则API接口
 */

// 获取积分规则列表
export function fetchPointsRules(params) {
  return request({
    url: '/points/rules/list',
    method: 'get',
    params: params
  })
}

// 创建积分规则
export function createPointsRule(data) {
  return request({
    url: '/points/rules/create',
    method: 'post',
    data: data
  })
}

// 更新积分规则
export function updatePointsRule(id, data) {
  return request({
    url: `/points/rules/update/${id}`,
    method: 'put',
    data: data
  })
}

// 删除积分规则
export function deletePointsRule(id) {
  return request({
    url: `/points/rules/delete/${id}`,
    method: 'delete'
  })
}

// 启用/禁用规则
export function toggleRuleStatus(id, status) {
  return request({
    url: `/points/rules/toggle/${id}`,
    method: 'put',
    data: { status }
  })
}

// 获取规则详情
export function getPointsRule(id) {
  return request({
    url: `/points/rules/${id}`,
    method: 'get'
  })
}

// 批量删除规则
export function batchDeleteRules(ids) {
  return request({
    url: '/points/rules/batch/delete',
    method: 'post',
    data: { ids }
  })
}

// 验证规则配置
export function validateRule(data) {
  return request({
    url: '/points/rules/validate',
    method: 'post',
    data: data
  })
}