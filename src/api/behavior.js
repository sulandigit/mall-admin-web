import request from '@/utils/request'

/**
 * 获取行为追踪仪表板数据
 * @param {Object} params - 查询参数
 * @param {String} params.timeRange - 时间范围 (1d/7d/30d)
 * @param {Boolean} params.refresh - 是否强制刷新
 */
export function getDashboardData(params) {
  return request({
    url: '/behavior/dashboard',
    method: 'get',
    params: params
  })
}

/**
 * 获取页面访问分析数据
 * @param {Object} params - 查询参数
 * @param {String} params.startDate - 开始日期
 * @param {String} params.endDate - 结束日期
 * @param {Number} params.limit - 返回数量限制
 */
export function getPageVisitData(params) {
  return request({
    url: '/behavior/page-visits',
    method: 'get',
    params: params
  })
}

/**
 * 获取停留时间分析数据
 * @param {Object} params - 查询参数
 * @param {Array} params.dateRange - 日期范围
 * @param {String} params.pageType - 页面类型筛选
 */
export function getStayTimeData(params) {
  return request({
    url: '/behavior/stay-time',
    method: 'get',
    params: params
  })
}

/**
 * 获取跳出率分析数据
 * @param {Object} params - 查询参数
 * @param {String} params.period - 统计周期
 * @param {Number} params.threshold - 异常阈值
 */
export function getBounceRateData(params) {
  return request({
    url: '/behavior/bounce-rate',
    method: 'get',
    params: params
  })
}

/**
 * 获取用户画像分析数据
 * @param {Object} params - 查询参数
 * @param {String} params.segmentType - 分群类型
 * @param {String} params.behaviorPeriod - 行为分析周期
 */
export function getUserProfileData(params) {
  return request({
    url: '/behavior/user-profile',
    method: 'get',
    params: params
  })
}

/**
 * 获取实时行为数据
 * @param {Object} params - 查询参数
 */
export function getRealTimeData(params) {
  return request({
    url: '/behavior/realtime',
    method: 'get',
    params: params
  })
}

/**
 * 导出行为分析报告
 * @param {Object} params - 导出参数
 * @param {String} params.reportType - 报告类型
 * @param {String} params.format - 导出格式 (excel/pdf)
 */
export function exportBehaviorReport(params) {
  return request({
    url: '/behavior/export',
    method: 'get',
    params: params,
    responseType: 'blob'
  })
}

/**
 * 获取行为异常预警
 * @param {Object} params - 查询参数
 */
export function getBehaviorAlerts(params) {
  return request({
    url: '/behavior/alerts',
    method: 'get',
    params: params
  })
}