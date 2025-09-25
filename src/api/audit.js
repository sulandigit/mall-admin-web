import request from '@/utils/request'

/**
 * 审计管理API接口
 */

/**
 * 获取审计统计数据
 * @param {Object} params 查询参数
 * @param {string} params.timeRange 时间范围 day|week|month|year
 * @param {string} params.startTime 开始时间
 * @param {string} params.endTime 结束时间
 * @returns {Promise} 请求Promise
 */
export function getAuditStatistics(params) {
  return request({
    url: '/audit/statistics',
    method: 'get',
    params
  })
}

/**
 * 获取用户活跃度统计
 * @param {Object} params 查询参数
 * @param {string} params.timeRange 时间范围
 * @param {string} params.dimension 统计维度
 * @returns {Promise} 请求Promise
 */
export function getUserActivityStats(params) {
  return request({
    url: '/audit/user-activity',
    method: 'get',
    params
  })
}

/**
 * 获取功能使用率统计
 * @param {Object} params 查询参数
 * @param {string} params.timeRange 时间范围
 * @returns {Promise} 请求Promise
 */
export function getFeatureUsageStats(params) {
  return request({
    url: '/audit/feature-usage',
    method: 'get',
    params
  })
}

/**
 * 获取操作成功率统计
 * @param {Object} params 查询参数
 * @param {string} params.timeRange 时间范围
 * @returns {Promise} 请求Promise
 */
export function getOperationSuccessStats(params) {
  return request({
    url: '/audit/operation-success',
    method: 'get',
    params
  })
}

/**
 * 获取访问时段分布统计
 * @param {Object} params 查询参数
 * @param {string} params.date 日期
 * @returns {Promise} 请求Promise
 */
export function getAccessTimeStats(params) {
  return request({
    url: '/audit/access-time',
    method: 'get',
    params
  })
}

/**
 * 获取异常操作统计
 * @param {Object} params 查询参数
 * @param {string} params.timeRange 时间范围
 * @param {string} params.riskLevel 风险级别
 * @returns {Promise} 请求Promise
 */
export function getAbnormalOperationStats(params) {
  return request({
    url: '/audit/abnormal-operations',
    method: 'get',
    params
  })
}

/**
 * 查询数据变更记录
 * @param {Object} params 查询参数
 * @param {number} params.pageNum 页码
 * @param {number} params.pageSize 每页大小
 * @param {string} params.tableName 表名
 * @param {string} params.recordId 记录ID
 * @param {string} params.changeType 变更类型
 * @param {string} params.startTime 开始时间
 * @param {string} params.endTime 结束时间
 * @returns {Promise} 请求Promise
 */
export function getDataChanges(params) {
  return request({
    url: '/audit/data-changes',
    method: 'get',
    params
  })
}

/**
 * 生成审计报告
 * @param {Object} params 报告参数
 * @param {string} params.reportType 报告类型
 * @param {string} params.timeRange 时间范围
 * @param {string} params.format 输出格式
 * @param {Array} params.includeModules 包含模块
 * @returns {Promise} 请求Promise
 */
export function generateAuditReport(params) {
  return request({
    url: '/audit/report',
    method: 'post',
    data: params,
    responseType: 'blob'
  })
}

/**
 * 获取安全告警列表
 * @param {Object} params 查询参数
 * @param {number} params.pageNum 页码
 * @param {number} params.pageSize 每页大小
 * @param {string} params.alertLevel 告警级别
 * @param {string} params.status 处理状态
 * @returns {Promise} 请求Promise
 */
export function getSecurityAlerts(params) {
  return request({
    url: '/audit/security-alerts',
    method: 'get',
    params
  })
}

/**
 * 处理安全告警
 * @param {string} alertId 告警ID
 * @param {Object} data 处理数据
 * @param {string} data.action 处理动作
 * @param {string} data.remark 处理备注
 * @returns {Promise} 请求Promise
 */
export function handleSecurityAlert(alertId, data) {
  return request({
    url: `/audit/security-alerts/${alertId}/handle`,
    method: 'post',
    data
  })
}

/**
 * 获取合规性检查结果
 * @param {Object} params 查询参数
 * @param {string} params.complianceType 合规类型
 * @param {string} params.timeRange 时间范围
 * @returns {Promise} 请求Promise
 */
export function getComplianceCheck(params) {
  return request({
    url: '/audit/compliance-check',
    method: 'get',
    params
  })
}

/**
 * 导出审计数据
 * @param {Object} params 导出参数
 * @param {string} params.dataType 数据类型
 * @param {string} params.format 导出格式
 * @param {Object} params.filters 过滤条件
 * @returns {Promise} 请求Promise
 */
export function exportAuditData(params) {
  return request({
    url: '/audit/export',
    method: 'post',
    data: params,
    responseType: 'blob'
  })
}