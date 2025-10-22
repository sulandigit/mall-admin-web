/**
 * 优惠券管理API接口模块
 * 提供优惠券的增删改查等操作接口 - 2025
 */
import request from '@/utils/request'

/**
 * 获取优惠券列表
 * @param {Object} params - 查询参数对象
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.name - 优惠券名称（可选）
 * @param {number} params.type - 优惠券类型（可选）
 * @returns {Promise} 返回优惠券列表数据 - 2025
 */
export function fetchList(params) {
  return request({
    url:'/coupon/list',
    method:'get',
    params:params
  })
}

/**
 * 创建新的优惠券
 * @param {Object} data - 优惠券数据对象
 * @param {string} data.name - 优惠券名称
 * @param {number} data.type - 优惠券类型
 * @param {number} data.amount - 优惠金额
 * @param {string} data.startTime - 开始时间
 * @param {string} data.endTime - 结束时间
 * @returns {Promise} 返回创建结果 - 2025
 */
export function createCoupon(data) {
  return request({
    url:'/coupon/create',
    method:'post',
    data:data
  })
}

/**
 * 根据ID获取单个优惠券详情
 * @param {number|string} id - 优惠券ID
 * @returns {Promise} 返回优惠券详情数据 - 2025
 */
export function getCoupon(id) {
  return request({
    url:'/coupon/'+id,
    method:'get',
  })
}

/**
 * 更新优惠券信息
 * @param {number|string} id - 优惠券ID
 * @param {Object} data - 需要更新的优惠券数据
 * @param {string} data.name - 优惠券名称（可选）
 * @param {number} data.type - 优惠券类型（可选）
 * @param {number} data.amount - 优惠金额（可选）
 * @param {string} data.startTime - 开始时间（可选）
 * @param {string} data.endTime - 结束时间（可选）
 * @returns {Promise} 返回更新结果 - 2025
 */
export function updateCoupon(id,data) {
  return request({
    url:'/coupon/update/'+id,
    method:'post',
    data:data
  })
}

/**
 * 删除指定的优惠券
 * @param {number|string} id - 要删除的优惠券ID
 * @returns {Promise} 返回删除结果 - 2025
 */
export function deleteCoupon(id) {
  return request({
    url:'/coupon/delete/'+id,
    method:'post',
  })
}
