import request from '@/utils/request'

/**
 * 文件管理API
 */

/**
 * 上传单个文件
 * @param {FormData} formData - 文件表单数据
 */
export function uploadFile(formData) {
  return request({
    url: '/admin/file/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 批量上传文件
 * @param {FormData} formData - 文件表单数据
 */
export function batchUploadFiles(formData) {
  return request({
    url: '/admin/file/batch/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 获取文件列表
 * @param {Object} params - 查询参数
 */
export function fetchFileList(params) {
  return request({
    url: '/admin/file/list',
    method: 'get',
    params: params
  })
}

/**
 * 删除文件
 * @param {Number} id - 文件ID
 */
export function deleteFile(id) {
  return request({
    url: `/admin/file/delete/${id}`,
    method: 'post'
  })
}

/**
 * 批量删除文件
 * @param {Array} ids - 文件ID数组
 */
export function batchDeleteFiles(ids) {
  return request({
    url: '/admin/file/batch/delete',
    method: 'post',
    data: { ids }
  })
}

/**
 * 获取文件详情
 * @param {Number} id - 文件ID
 */
export function getFileInfo(id) {
  return request({
    url: `/admin/file/info/${id}`,
    method: 'get'
  })
}

/**
 * 更新文件信息
 * @param {Number} id - 文件ID
 * @param {Object} data - 文件信息
 */
export function updateFileInfo(id, data) {
  return request({
    url: `/admin/file/update/${id}`,
    method: 'post',
    data: data
  })
}

/**
 * 创建文件夹
 * @param {Object} data - 文件夹数据
 */
export function createFolder(data) {
  return request({
    url: '/admin/file/folder/create',
    method: 'post',
    data: data
  })
}

/**
 * 获取文件夹列表
 * @param {Object} params - 查询参数
 */
export function fetchFolderList(params) {
  return request({
    url: '/admin/file/folder/list',
    method: 'get',
    params: params
  })
}

/**
 * 删除文件夹
 * @param {Number} id - 文件夹ID
 */
export function deleteFolder(id) {
  return request({
    url: `/admin/file/folder/delete/${id}`,
    method: 'post'
  })
}

/**
 * 移动文件
 * @param {Object} data - 移动数据 {fileIds, targetFolderId}
 */
export function moveFiles(data) {
  return request({
    url: '/admin/file/move',
    method: 'post',
    data: data
  })
}

/**
 * 复制文件
 * @param {Object} data - 复制数据 {fileIds, targetFolderId}
 */
export function copyFiles(data) {
  return request({
    url: '/admin/file/copy',
    method: 'post',
    data: data
  })
}

/**
 * 重命名文件
 * @param {Number} id - 文件ID
 * @param {String} newName - 新文件名
 */
export function renameFile(id, newName) {
  return request({
    url: `/admin/file/rename/${id}`,
    method: 'post',
    data: { name: newName }
  })
}

/**
 * 获取文件存储统计
 */
export function getStorageStatistics() {
  return request({
    url: '/admin/file/storage/statistics',
    method: 'get'
  })
}

/**
 * 清理无效文件
 */
export function cleanInvalidFiles() {
  return request({
    url: '/admin/file/clean/invalid',
    method: 'post'
  })
}

/**
 * 压缩文件
 * @param {Array} fileIds - 文件ID数组
 * @param {String} zipName - 压缩包名称
 */
export function compressFiles(fileIds, zipName) {
  return request({
    url: '/admin/file/compress',
    method: 'post',
    data: { fileIds, zipName }
  })
}

/**
 * 解压文件
 * @param {Number} fileId - 压缩文件ID
 * @param {Number} targetFolderId - 目标文件夹ID
 */
export function extractFile(fileId, targetFolderId) {
  return request({
    url: '/admin/file/extract',
    method: 'post',
    data: { fileId, targetFolderId }
  })
}

/**
 * 获取文件下载链接
 * @param {Number} id - 文件ID
 */
export function getDownloadUrl(id) {
  return request({
    url: `/admin/file/download/url/${id}`,
    method: 'get'
  })
}

/**
 * 获取文件预览链接
 * @param {Number} id - 文件ID
 */
export function getPreviewUrl(id) {
  return request({
    url: `/admin/file/preview/url/${id}`,
    method: 'get'
  })
}

/**
 * 搜索文件
 * @param {Object} params - 搜索参数
 */
export function searchFiles(params) {
  return request({
    url: '/admin/file/search',
    method: 'get',
    params: params
  })
}