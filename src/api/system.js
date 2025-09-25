import request from '@/utils/request'

/**
 * 系统配置管理API
 */

/**
 * 获取系统配置列表
 * @param {Object} params - 查询参数
 */
export function fetchSystemConfigList(params) {
  return request({
    url: '/admin/config/list',
    method: 'get',
    params: params
  })
}

/**
 * 创建系统配置
 * @param {Object} data - 配置数据
 */
export function createSystemConfig(data) {
  return request({
    url: '/admin/config/create',
    method: 'post',
    data: data
  })
}

/**
 * 更新系统配置
 * @param {Number} id - 配置ID
 * @param {Object} data - 配置数据
 */
export function updateSystemConfig(id, data) {
  return request({
    url: `/admin/config/update/${id}`,
    method: 'post',
    data: data
  })
}

/**
 * 删除系统配置
 * @param {Number} id - 配置ID
 */
export function deleteSystemConfig(id) {
  return request({
    url: `/admin/config/delete/${id}`,
    method: 'post'
  })
}

/**
 * 获取系统配置详情
 * @param {Number} id - 配置ID
 */
export function getSystemConfig(id) {
  return request({
    url: `/admin/config/${id}`,
    method: 'get'
  })
}

/**
 * 按配置键获取配置值
 * @param {String} key - 配置键
 */
export function getConfigByKey(key) {
  return request({
    url: `/admin/config/key/${key}`,
    method: 'get'
  })
}

/**
 * 批量更新系统配置
 * @param {Array} configs - 配置数组
 */
export function batchUpdateSystemConfig(configs) {
  return request({
    url: '/admin/config/batch/update',
    method: 'post',
    data: configs
  })
}

/**
 * 获取系统信息
 */
export function getSystemInfo() {
  return request({
    url: '/admin/system/info',
    method: 'get'
  })
}

/**
 * 获取系统日志
 * @param {Object} params - 查询参数
 */
export function getSystemLogs(params) {
  return request({
    url: '/admin/system/logs',
    method: 'get',
    params: params
  })
}

/**
 * 清理系统缓存
 */
export function clearSystemCache() {
  return request({
    url: '/admin/system/cache/clear',
    method: 'post'
  })
}

/**
 * 备份数据库
 */
export function backupDatabase() {
  return request({
    url: '/admin/system/database/backup',
    method: 'post'
  })
}

/**
 * 获取备份列表
 */
export function getBackupList() {
  return request({
    url: '/admin/system/database/backups',
    method: 'get'
  })
}

/**
 * 下载备份文件
 * @param {String} filename - 备份文件名
 */
export function downloadBackup(filename) {
  return request({
    url: `/admin/system/database/download/${filename}`,
    method: 'get',
    responseType: 'blob'
  })
}