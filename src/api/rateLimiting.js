import request from '@/utils/request'

/**
 * 获取限流规则列表
 */
export function fetchRateLimitList(params) {
  return request({
    url: '/rateLimiting/list',
    method: 'get',
    params: params
  })
}

/**
 * 创建限流规则
 */
export function createRateLimit(data) {
  return request({
    url: '/rateLimiting/create',
    method: 'post',
    data: data
  })
}

/**
 * 更新限流规则
 */
export function updateRateLimit(id, data) {
  return request({
    url: '/rateLimiting/update/' + id,
    method: 'post',
    data: data
  })
}

/**
 * 删除限流规则
 */
export function deleteRateLimit(id) {
  return request({
    url: '/rateLimiting/delete/' + id,
    method: 'post'
  })
}

/**
 * 批量删除限流规则
 */
export function deleteBatchRateLimit(params) {
  return request({
    url: '/rateLimiting/delete/batch',
    method: 'post',
    params: params
  })
}

/**
 * 修改限流规则状态
 */
export function updateRateLimitStatus(id, params) {
  return request({
    url: '/rateLimiting/update/status/' + id,
    method: 'post',
    params: params
  })
}

/**
 * 获取限流规则详情
 */
export function getRateLimitDetail(id) {
  return request({
    url: '/rateLimiting/' + id,
    method: 'get'
  })
}

/**
 * 获取API路径列表（用于下拉选择）
 */
export function fetchApiPathList() {
  return request({
    url: '/rateLimiting/apiPaths',
    method: 'get'
  })
}

/**
 * 获取限流统计信息
 */
export function getRateLimitStats(params) {
  return request({
    url: '/rateLimiting/stats',
    method: 'get',
    params: params
  })
}

/**
 * 重置限流计数器
 */
export function resetRateLimitCounter(id) {
  return request({
    url: '/rateLimiting/reset/' + id,
    method: 'post'
  })
}

/**
 * 测试限流规则
 */
export function testRateLimit(data) {
  return request({
    url: '/rateLimiting/test',
    method: 'post',
    data: data
  })
}

/**
 * 导出限流规则
 */
export function exportRateLimitRules(params) {
  return request({
    url: '/rateLimiting/export',
    method: 'get',
    params: params,
    responseType: 'blob'
  })
}

/**
 * 导入限流规则
 */
export function importRateLimitRules(data) {
  return request({
    url: '/rateLimiting/import',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}