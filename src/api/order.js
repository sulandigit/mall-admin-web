import request from '@/utils/request'

// 订单相关API - 使用重试功能优化
// 这些API会根据retryConfig.js中的配置自动应用合适的重试策略

// 查询订单列表 - 使用默认重试策略
export function fetchList(params) {
  return request({
    url: '/order/list',
    method: 'get',
    params: params
    // 自动应用 NORMAL 重试策略（3次重试）
  })
}

// 关闭订单 - 关键业务操作，使用高重试
export function closeOrder(params) {
  return request.createCriticalRequest()({
    url: '/order/update/close',
    method: 'post',
    params: params
  })
}

// 删除订单 - 关键业务操作，使用高重试
export function deleteOrder(params) {
  return request.createCriticalRequest()({
    url: '/order/delete',
    method: 'post',
    params: params
  })
}

// 订单发货 - 关键业务操作
export function deliveryOrder(data) {
  return request.createCriticalRequest()({
    url: '/order/update/delivery',
    method: 'post',
    data: data
  })
}

// 获取订单详情 - 查询操作，使用默认重试
export function getOrderDetail(id) {
  return request({
    url: '/order/' + id,
    method: 'get'
    // 自动应用基于URL的重试策略
  })
}

// 更新收货人信息 - 重要操作，自定义重试配置
export function updateReceiverInfo(data) {
  return request({
    url: '/order/update/receiverInfo',
    method: 'post',
    data: data,
    retry: {
      retries: 5, // 收货信息更新失败影响较大，重试5次
      retryDelay: 1500
    }
  })
}

// 更新订单金额 - 关键财务操作，最高优先级重试
export function updateMoneyInfo(data) {
  return request({
    url: '/order/update/moneyInfo',
    method: 'post',
    data: data,
    retry: {
      retries: 8, // 金额操作最重要，重试8次
      retryDelay: 2000,
      retryDelayMax: 30000,
      retryCondition: (error) => {
        // 对于金额操作，除了明确的业务错误外都要重试
        if (!error.response) return true
        const status = error.response.status
        // 400通常是业务逻辑错误，不重试
        return status !== 400
      }
    }
  })
}

// 更新订单备注 - 普通操作，使用标准重试
export function updateOrderNote(params) {
  return request({
    url: '/order/update/note',
    method: 'post',
    params: params
    // 使用默认重试配置
  })
}

// 新增：批量操作订单状态
export async function batchUpdateOrderStatus(orderIds, status) {
  // 批量操作使用自定义重试逻辑
  const results = []
  
  for (const orderId of orderIds) {
    try {
      const result = await request({
        url: `/order/update/status/${orderId}`,
        method: 'post',
        data: { status },
        retry: {
          retries: 3,
          retryDelay: 1000,
          // 批量操作中单个失败不影响其他
          retryCondition: (error) => {
            if (!error.response) return true
            // 404表示订单不存在，不重试
            return error.response.status !== 404
          }
        }
      })
      results.push({ orderId, success: true, data: result })
    } catch (error) {
      results.push({ 
        orderId, 
        success: false, 
        error: error.response?.data?.message || error.message 
      })
    }
  }
  
  return results
}

// 新增：订单导出功能（长时间操作）
export function exportOrders(params) {
  return request({
    url: '/order/export',
    method: 'post',
    data: params,
    timeout: 300000, // 5分钟超时
    retry: {
      retries: 6,
      retryDelay: 5000,
      retryDelayMax: 60000,
      retryDelayMultiplier: 1.5
    }
  })
}
