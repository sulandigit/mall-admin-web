import request from '@/utils/request'

/**
 * 商品性能分析API接口
 */

// 获取商品性能分析汇总数据
export function fetchPerformanceSummary(params) {
  return request({
    url: '/product/performance/summary',
    method: 'get',
    params: params
  })
}

// 获取商品排行数据
export function fetchProductRanking(params) {
  return request({
    url: '/product/performance/ranking',
    method: 'get',
    params: params
  })
}

// 获取库存预警数据
export function fetchInventoryStatus(params) {
  return request({
    url: '/product/performance/inventory',
    method: 'get',
    params: params
  })
}

// 获取分类分析数据
export function fetchCategoryAnalysis(params) {
  return request({
    url: '/product/performance/category',
    method: 'get',
    params: params
  })
}

// 获取销售趋势数据
export function fetchSalesTrend(params) {
  return request({
    url: '/product/performance/trend',
    method: 'get',
    params: params
  })
}

// 获取品牌表现数据
export function fetchBrandPerformance(params) {
  return request({
    url: '/product/performance/brand',
    method: 'get',
    params: params
  })
}

// 导出性能报告 (PDF)
export function exportPerformanceReport(params) {
  return request({
    url: '/product/performance/export/pdf',
    method: 'post',
    data: params,
    responseType: 'blob'
  })
}

// 导出性能报告 (Excel)
export function exportPerformanceExcel(params) {
  return request({
    url: '/product/performance/export/excel',
    method: 'post',
    data: params,
    responseType: 'blob'
  })
}

// 获取商品分类列表（用于筛选）
export function fetchProductCategories() {
  return request({
    url: '/productCategory/list/withChildren',
    method: 'get'
  })
}

// 获取品牌列表（用于筛选）
export function fetchBrandList() {
  return request({
    url: '/brand/listAll',
    method: 'get'
  })
}