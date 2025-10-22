/**
 * 菜单管理相关API接口
 * 用于管理系统菜单的增删改查等操作 - 2025
 */
import request from '@/utils/request'

/**
 * 获取菜单列表
 * @param {number} parentId 父级菜单ID
 * @param {Object} params 查询参数
 * @returns {Promise} 返回菜单列表数据 - 2025
 */
export function fetchList(parentId, params) {
  return request({
    url: '/menu/list/' + parentId,
    method: 'get',
    params: params
  })
}

/**
 * 删除菜单
 * @param {number} id 菜单ID
 * @returns {Promise} 返回删除结果 - 2025
 */
export function deleteMenu(id) {
  return request({
    url: '/menu/delete/' + id,
    method: 'post'
  })
}

/**
 * 创建新菜单
 * @param {Object} data 菜单数据
 * @returns {Promise} 返回创建结果 - 2025
 */
export function createMenu(data) {
  return request({
    url: '/menu/create',
    method: 'post',
    data: data
  })
}

/**
 * 更新菜单信息
 * @param {number} id 菜单ID
 * @param {Object} data 更新的菜单数据
 * @returns {Promise} 返回更新结果 - 2025
 */
export function updateMenu(id, data) {
  return request({
    url: '/menu/update/' + id,
    method: 'post',
    data: data
  })
}

/**
 * 获取单个菜单详情
 * @param {number} id 菜单ID
 * @returns {Promise} 返回菜单详情数据 - 2025
 */
export function getMenu(id) {
  return request({
    url: '/menu/' + id,
    method: 'get',
  })
}

/**
 * 更新菜单显示/隐藏状态
 * @param {number} id 菜单ID
 * @param {Object} params 状态参数
 * @returns {Promise} 返回更新结果 - 2025
 */
export function updateHidden(id, params) {
  return request({
    url: '/menu/updateHidden/' + id,
    method: 'post',
    params: params
  })
}

/**
 * 获取菜单树形结构列表
 * @returns {Promise} 返回树形菜单数据 - 2025
 */
export function fetchTreeList() {
  return request({
    url: '/menu/treeList',
    method: 'get'
  })
}

