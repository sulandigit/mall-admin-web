import request from '@/utils/request'

/**
 * 日志管理API接口
 */

/**
 * 查询操作日志列表
 * @param {Object} params 查询参数
 * @param {number} params.pageNum 页码
 * @param {number} params.pageSize 每页大小
 * @param {string} params.username 用户名
 * @param {string} params.operationType 操作类型
 * @param {string} params.moduleName 模块名称
 * @param {string} params.startTime 开始时间
 * @param {string} params.endTime 结束时间
 * @param {string} params.ipAddress IP地址
 * @param {string} params.status 操作状态
 * @returns {Promise} 请求Promise
 */
export function fetchLogList(params) {
  return request({
    url: '/logs',
    method: 'get',
    params
  })
}

/**
 * 查询日志详情
 * @param {string} id 日志ID
 * @returns {Promise} 请求Promise
 */
export function fetchLogDetail(id) {
  return request({
    url: `/logs/${id}`,
    method: 'get'
  })
}

/**
 * 批量提交日志
 * @param {Array} logs 日志数组
 * @returns {Promise} 请求Promise
 */
export function submitLogs(logs) {
  return request({
    url: '/logs/batch',
    method: 'post',
    data: { logs }
  })
}

/**
 * 导出日志
 * @param {Object} params 导出参数
 * @param {string} params.format 导出格式 excel|pdf|csv
 * @param {Array} params.fields 导出字段
 * @param {Object} params.filters 过滤条件
 * @returns {Promise} 请求Promise
 */
export function exportLogs(params) {
  return request({
    url: '/logs/export',
    method: 'post',
    data: params,
    responseType: 'blob'
  })
}

/**
 * 删除日志
 * @param {string} id 日志ID
 * @returns {Promise} 请求Promise
 */
export function deleteLog(id) {
  return request({
    url: `/logs/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除日志
 * @param {Array} ids 日志ID数组
 * @returns {Promise} 请求Promise
 */
export function batchDeleteLogs(ids) {
  return request({
    url: '/logs/batch',
    method: 'delete',
    data: { ids }
  })
}

/**
 * 获取日志统计信息
 * @param {Object} params 统计参数
 * @param {string} params.timeRange 时间范围
 * @param {string} params.dimension 统计维度
 * @returns {Promise} 请求Promise
 */
export function getLogStatistics(params) {
  return request({
    url: '/logs/statistics',
    method: 'get',
    params
  })
}

/**
 * 获取操作类型列表
 * @returns {Promise} 请求Promise
 */
export function getOperationTypes() {
  return request({
    url: '/logs/operation-types',
    method: 'get'
  })
}

/**
 * 获取模块名称列表
 * @returns {Promise} 请求Promise
 */
export function getModuleNames() {
  return request({
    url: '/logs/module-names',
    method: 'get'
  })
}