import request from '@/utils/request'

/**
 * 获取品牌列表
 * @param {Object} params 查询参数
 * @returns {Promise} 返回品牌列表数据
 * s-s-t-t-T 2026
 */
export function fetchList(params) {
  return request({
    url:'/brand/list',
    method:'get',
    params:params
  })
}

/**
 * 创建品牌
 * @param {Object} data 品牌数据
 * @returns {Promise} 返回创建结果
 * s-s-t-t-T 2026
 */
export function createBrand(data) {
  return request({
    url:'/brand/create',
    method:'post',
    data:data
  })
}

/**
 * 更新品牌显示状态
 * @param {Object} data 包含品牌ID和显示状态的数据
 * @returns {Promise} 返回更新结果
 * s-s-t-t-T 2026
 */
export function updateShowStatus(data) {
  return request({
    url:'/brand/update/showStatus',
    method:'post',
    data:data
  })
}

/**
 * 更新品牌制造商状态
 * @param {Object} data 包含品牌ID和制造商状态的数据
 * @returns {Promise} 返回更新结果
 * s-s-t-t-T 2026
 */
export function updateFactoryStatus(data) {
  return request({
    url:'/brand/update/factoryStatus',
    method:'post',
    data:data
  })
}

/**
 * 删除品牌
 * @param {Number} id 品牌ID
 * @returns {Promise} 返回删除结果
 * s-s-t-t-T 2026
 */
export function deleteBrand(id) {
  return request({
    url:'/brand/delete/'+id,
    method:'get',
  })
}

/**
 * 获取品牌详情
 * @param {Number} id 品牌ID
 * @returns {Promise} 返回品牌详情数据
 * s-s-t-t-T 2026
 */
export function getBrand(id) {
  return request({
    url:'/brand/'+id,
    method:'get',
  })
}

/**
 * 更新品牌信息
 * @param {Number} id 品牌ID
 * @param {Object} data 品牌数据
 * @returns {Promise} 返回更新结果
 * s-s-t-t-T 2026
 */
export function updateBrand(id,data) {
  return request({
    url:'/brand/update/'+id,
    method:'post',
    data:data
  })
}
