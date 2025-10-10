/**
 * 支持重试功能的API调用示例
 * 展示如何在不同场景下使用自动重试功能
 */

import request from '@/utils/request'

// ================ 基础用法示例 ================

/**
 * 标准API调用 - 自动应用基于URL的重试策略
 */
export function fetchProductList(params) {
  return request({
    url: '/product/list',
    method: 'get',
    params: params
    // 系统会自动应用 NORMAL 重试策略
  })
}

/**
 * 关键业务操作 - 使用高重试次数的请求
 */
export function createOrder(data) {
  // 使用预定义的关键业务请求函数
  return request.createCriticalRequest()({
    url: '/order/create',
    method: 'post',
    data: data
  })
}

/**
 * 快速失败操作 - 实时性要求高的接口
 */
export function uploadFile(file) {
  return request.createFastFailRequest()({
    url: '/upload/file',
    method: 'post',
    data: file
  })
}

/**
 * 禁用重试 - 敏感操作，只执行一次
 */
export function logout() {
  return request.createNoRetryRequest()({
    url: '/admin/logout',
    method: 'post'
  })
}

// ================ 自定义重试配置示例 ================

/**
 * 自定义重试参数的API调用
 */
export function fetchCriticalData(params) {
  return request({
    url: '/statistics/critical',
    method: 'get',
    params: params,
    retry: {
      retries: 5,           // 重试5次
      retryDelay: 2000,     // 基础延迟2秒
      retryDelayMax: 20000, // 最大延迟20秒
      retryDelayMultiplier: 1.5 // 延迟倍数1.5
    }
  })
}

/**
 * 条件性重试 - 只对特定错误重试
 */
export function sensitiveOperation(data) {
  return request({
    url: '/sensitive/operation',
    method: 'post',
    data: data,
    retry: {
      retries: 2,
      retryCondition: (error) => {
        // 只对服务器错误和网络错误重试，不对业务错误重试
        if (!error.response) return true // 网络错误
        const status = error.response.status
        return status >= 500 // 只重试5xx错误
      }
    }
  })
}

// ================ 高级用法示例 ================

/**
 * 创建带有默认重试配置的请求函数
 */
const heavyRetryRequest = request.createRequest({
  retries: 10,
  retryDelay: 3000,
  retryDelayMax: 60000
})

export function syncLargeData(data) {
  return heavyRetryRequest({
    url: '/sync/large-data',
    method: 'post',
    data: data,
    timeout: 120000 // 2分钟超时
  })
}

/**
 * 批量操作的重试策略
 */
export async function batchProcessItems(items) {
  const results = []
  
  for (const item of items) {
    try {
      const result = await request({
        url: '/process/item',
        method: 'post',
        data: item,
        retry: {
          retries: 3,
          retryDelay: 1000,
          // 批量操作中，对于单个失败项目快速失败
          retryCondition: (error) => {
            if (!error.response) return true
            // 对于400错误（通常是数据问题）不重试
            return error.response.status !== 400
          }
        }
      })
      results.push({ success: true, data: result })
    } catch (error) {
      results.push({ success: false, error: error.message })
    }
  }
  
  return results
}

// ================ 监控和调试示例 ================

/**
 * 带有详细日志的API调用
 */
export async function debugApiCall(config) {
  console.log('开始API调用:', config)
  
  try {
    const response = await request(config)
    console.log('API调用成功:', response)
    return response
  } catch (error) {
    console.error('API调用失败:', error)
    
    // 获取重试统计信息
    import('@/utils/retryConfig').then(({ getRetryStats }) => {
      const stats = getRetryStats()
      console.log('重试统计:', stats)
    })
    
    throw error
  }
}

// ================ 业务场景示例 ================

/**
 * 用户登录 - 快速失败，避免长时间等待
 */
export function userLogin(credentials) {
  return request.createFastFailRequest()({
    url: '/admin/login',
    method: 'post',
    data: credentials
  })
}

/**
 * 订单支付 - 关键操作，高重试次数
 */
export function processPayment(paymentData) {
  return request.createCriticalRequest()({
    url: '/payment/process',
    method: 'post',
    data: paymentData
  })
}

/**
 * 数据导出 - 长时间操作，需要耐心重试
 */
export function exportData(params) {
  return request({
    url: '/export/data',
    method: 'post',
    data: params,
    timeout: 300000, // 5分钟超时
    retry: {
      retries: 8,
      retryDelay: 5000,
      retryDelayMax: 60000,
      retryDelayMultiplier: 1.3
    }
  })
}

/**
 * 实时数据查询 - 无重试，保证时效性
 */
export function getRealTimeData() {
  return request.createNoRetryRequest()({
    url: '/realtime/data',
    method: 'get'
  })
}

/**
 * 文件分片上传 - 每个分片可以重试
 */
export async function uploadFileChunks(file, chunkSize = 1024 * 1024) {
  const chunks = []
  for (let i = 0; i < file.size; i += chunkSize) {
    chunks.push(file.slice(i, i + chunkSize))
  }
  
  const uploadResults = []
  
  for (let i = 0; i < chunks.length; i++) {
    try {
      const result = await request({
        url: '/upload/chunk',
        method: 'post',
        data: {
          chunk: chunks[i],
          index: i,
          total: chunks.length,
          filename: file.name
        },
        retry: {
          retries: 5, // 每个分片重试5次
          retryDelay: 1000
        }
      })
      uploadResults.push(result)
    } catch (error) {
      console.error(`分片 ${i} 上传失败:`, error)
      throw new Error(`文件上传失败：分片 ${i} 处理失败`)
    }
  }
  
  // 完成分片上传后，合并文件
  return request.createCriticalRequest()({
    url: '/upload/merge',
    method: 'post',
    data: {
      filename: file.name,
      totalChunks: chunks.length
    }
  })
}

// ================ 工具函数 ================

/**
 * 获取当前重试统计信息
 */
export async function getApiRetryStatistics() {
  const { getRetryStats } = await import('@/utils/retryConfig')
  return getRetryStats()
}

/**
 * 清除重试日志
 */
export async function clearApiRetryLogs() {
  const { clearRetryLogs } = await import('@/utils/retryConfig')
  clearRetryLogs()
}