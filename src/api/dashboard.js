import request from '@/utils/request'

/**
 * 仪表盘数据管理API
 */

/**
 * 获取仪表盘概览数据
 */
export function getDashboardOverview() {
  return request({
    url: '/admin/dashboard/overview',
    method: 'get'
  })
}

/**
 * 获取今日统计数据
 */
export function getTodayStatistics() {
  return request({
    url: '/admin/dashboard/today',
    method: 'get'
  })
}

/**
 * 获取订单统计数据
 * @param {Object} params - 查询参数 {startDate, endDate, type}
 */
export function getOrderStatistics(params) {
  return request({
    url: '/admin/dashboard/order/statistics',
    method: 'get',
    params: params
  })
}

/**
 * 获取销售统计数据
 * @param {Object} params - 查询参数 {startDate, endDate, type}
 */
export function getSalesStatistics(params) {
  return request({
    url: '/admin/dashboard/sales/statistics',
    method: 'get',
    params: params
  })
}

/**
 * 获取商品统计数据
 */
export function getProductStatistics() {
  return request({
    url: '/admin/dashboard/product/statistics',
    method: 'get'
  })
}

/**
 * 获取用户统计数据
 */
export function getUserStatistics() {
  return request({
    url: '/admin/dashboard/user/statistics',
    method: 'get'
  })
}

/**
 * 获取待处理事务统计
 */
export function getPendingTasks() {
  return request({
    url: '/admin/dashboard/pending/tasks',
    method: 'get'
  })
}

/**
 * 获取热销商品排行
 * @param {Object} params - 查询参数 {limit, startDate, endDate}
 */
export function getHotProducts(params) {
  return request({
    url: '/admin/dashboard/hot/products',
    method: 'get',
    params: params
  })
}

/**
 * 获取最新订单
 * @param {Object} params - 查询参数 {limit}
 */
export function getLatestOrders(params) {
  return request({
    url: '/admin/dashboard/latest/orders',
    method: 'get',
    params: params
  })
}

/**
 * 获取地区销售统计
 * @param {Object} params - 查询参数 {startDate, endDate}
 */
export function getRegionSales(params) {
  return request({
    url: '/admin/dashboard/region/sales',
    method: 'get',
    params: params
  })
}

/**
 * 获取访问统计数据
 * @param {Object} params - 查询参数 {startDate, endDate, type}
 */
export function getVisitStatistics(params) {
  return request({
    url: '/admin/dashboard/visit/statistics',
    method: 'get',
    params: params
  })
}

/**
 * 获取实时数据
 */
export function getRealTimeData() {
  return request({
    url: '/admin/dashboard/realtime',
    method: 'get'
  })
}

/**
 * 获取趋势分析数据
 * @param {Object} params - 查询参数 {type, period}
 */
export function getTrendAnalysis(params) {
  return request({
    url: '/admin/dashboard/trend/analysis',
    method: 'get',
    params: params
  })
}

/**
 * 获取转化率数据
 * @param {Object} params - 查询参数 {startDate, endDate}
 */
export function getConversionRate(params) {
  return request({
    url: '/admin/dashboard/conversion/rate',
    method: 'get',
    params: params
  })
}

/**
 * 获取关键指标数据
 * @param {Array} indicators - 指标列表
 */
export function getKeyIndicators(indicators) {
  return request({
    url: '/admin/dashboard/key/indicators',
    method: 'post',
    data: { indicators }
  })
}

/**
 * 导出仪表盘数据
 * @param {Object} params - 导出参数
 */
export function exportDashboardData(params) {
  return request({
    url: '/admin/dashboard/export',
    method: 'post',
    data: params,
    responseType: 'blob'
  })
}