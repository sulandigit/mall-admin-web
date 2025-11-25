import request from '@/utils/request'

/**
 * 积分统计分析API接口
 */

// 获取积分数据概览
export function getPointsOverview(params) {
  return request({
    url: '/points/analytics/overview',
    method: 'get',
    params: params
  })
}

// 获取积分趋势数据
export function getPointsTrend(params) {
  return request({
    url: '/points/analytics/trend',
    method: 'get',
    params: params
  })
}

// 获取用户积分分布
export function getUserDistribution(params) {
  return request({
    url: '/points/analytics/distribution',
    method: 'get',
    params: params
  })
}

// 获取兑换统计数据
export function getExchangeStats(params) {
  return request({
    url: '/points/analytics/exchange',
    method: 'get',
    params: params
  })
}

// 获取积分获取统计
export function getEarnStats(params) {
  return request({
    url: '/points/analytics/earn',
    method: 'get',
    params: params
  })
}

// 获取积分消费统计
export function getConsumeStats(params) {
  return request({
    url: '/points/analytics/consume',
    method: 'get',
    params: params
  })
}

// 获取会员等级分布
export function getMemberLevelDistribution(params) {
  return request({
    url: '/points/analytics/level/distribution',
    method: 'get',
    params: params
  })
}

// 获取规则效果分析
export function getRuleEffectiveness(params) {
  return request({
    url: '/points/analytics/rules/effectiveness',
    method: 'get',
    params: params
  })
}

// 获取活跃用户积分分析
export function getActiveUserAnalysis(params) {
  return request({
    url: '/points/analytics/users/active',
    method: 'get',
    params: params
  })
}

// 获取积分过期统计
export function getExpirationStats(params) {
  return request({
    url: '/points/analytics/expiration',
    method: 'get',
    params: params
  })
}

// 导出统计报表
export function exportAnalyticsReport(type, params) {
  return request({
    url: `/points/analytics/export/${type}`,
    method: 'get',
    params: params,
    responseType: 'blob'
  })
}

// 获取实时积分数据
export function getRealTimeStats() {
  return request({
    url: '/points/analytics/realtime',
    method: 'get'
  })
}