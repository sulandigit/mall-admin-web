import request from '@/utils/request'

/**
 * 获取历史收入数据
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @param {string} params.period - 时间周期 (daily, weekly, monthly)
 */
export function getHistoricalRevenue(params) {
  return request({
    url: '/revenue/historical',
    method: 'get',
    params
  })
}

/**
 * 执行收入预测
 * @param {Object} data - 预测参数
 * @param {string} data.algorithm - 预测算法 (linear, moving_average, exponential_smoothing)
 * @param {number} data.forecastPeriods - 预测周期数
 * @param {string} data.period - 时间周期 (daily, weekly, monthly)
 * @param {Array} data.historicalData - 历史数据
 */
export function executeForecast(data) {
  return request({
    url: '/revenue/forecast',
    method: 'post',
    data
  })
}

/**
 * 获取预测算法配置
 */
export function getForecastConfig() {
  return request({
    url: '/revenue/forecast/config',
    method: 'get'
  })
}

/**
 * 保存预测结果
 * @param {Object} data - 预测结果数据
 */
export function saveForecastResult(data) {
  return request({
    url: '/revenue/forecast/save',
    method: 'post',
    data
  })
}

/**
 * 获取预测历史记录
 * @param {Object} params - 查询参数
 */
export function getForecastHistory(params) {
  return request({
    url: '/revenue/forecast/history',
    method: 'get',
    params
  })
}

/**
 * 获取收入趋势分析
 * @param {Object} params - 查询参数
 */
export function getRevenueTrendAnalysis(params) {
  return request({
    url: '/revenue/trend-analysis',
    method: 'get',
    params
  })
}