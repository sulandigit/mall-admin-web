import request from '@/utils/request'

/**
 * 获取库存周转率报表列表数据
 * @param {Object} params 查询参数
 * @param {string} params.startDate 开始日期
 * @param {string} params.endDate 结束日期  
 * @param {number} params.categoryId 商品分类ID
 * @param {number} params.brandId 品牌ID
 * @param {string} params.turnoverLevel 周转率级别
 * @param {number} params.pageNum 页码
 * @param {number} params.pageSize 每页数量
 * @param {string} params.sortField 排序字段
 * @param {string} params.sortOrder 排序方向
 */
export function fetchTurnoverList(params) {
  return request({
    url: '/report/inventory-turnover',
    method: 'get',
    params: params
  })
}

/**
 * 获取库存周转率趋势数据
 * @param {Object} params 查询参数
 * @param {string} params.startDate 开始日期
 * @param {string} params.endDate 结束日期
 * @param {string} params.granularity 时间粒度 (day/week/month/quarter)
 * @param {string} params.categoryIds 分类ID列表，逗号分隔
 */
export function fetchTurnoverTrend(params) {
  return request({
    url: '/report/inventory-turnover/trend',
    method: 'get',
    params: params
  })
}

/**
 * 导出库存周转率报表
 * @param {Object} params 查询参数
 */
export function exportTurnoverReport(params) {
  return request({
    url: '/report/inventory-turnover/export',
    method: 'post',
    data: params,
    responseType: 'blob'
  })
}

/**
 * 获取商品分类选项
 */
export function fetchCategoryOptions() {
  return request({
    url: '/productCategory/list/withChildren',
    method: 'get'
  })
}

/**
 * 获取品牌选项
 */
export function fetchBrandOptions() {
  return request({
    url: '/brand/listAll',
    method: 'get'
  })
}