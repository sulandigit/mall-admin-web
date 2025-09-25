/**
 * 实时销售指标Dashboard API服务
 */
import request from '@/utils/request'

/**
 * 获取KPI指标数据
 * @param {Object} params - 查询参数
 * @param {string} params.timeRange - 时间范围: 'today', 'week', 'month'
 * @param {Array} params.metrics - 指标列表
 */
export function getKPIMetrics(params) {
  return request({
    url: '/api/dashboard/kpi',
    method: 'get',
    params
  })
}

/**
 * 获取销售趋势数据
 * @param {Object} params - 查询参数
 * @param {string} params.period - 时间周期
 * @param {string} params.dimension - 数据维度
 */
export function getSalesTrends(params) {
  return request({
    url: '/api/dashboard/trends',
    method: 'get',
    params
  })
}

/**
 * 获取实时数据快照
 */
export function getRealTimeSnapshot() {
  return request({
    url: '/api/dashboard/realtime',
    method: 'get'
  })
}

/**
 * 获取告警信息
 * @param {Object} params - 查询参数
 * @param {string} params.level - 告警级别
 * @param {string} params.type - 告警类型
 */
export function getAlerts(params) {
  return request({
    url: '/api/dashboard/alerts',
    method: 'get',
    params
  })
}

/**
 * 获取产品性能数据
 * @param {Object} params - 查询参数
 */
export function getProductPerformance(params) {
  return request({
    url: '/api/dashboard/products/performance',
    method: 'get',
    params
  })
}

/**
 * 获取地域销售分布
 * @param {Object} params - 查询参数
 */
export function getRegionalSales(params) {
  return request({
    url: '/api/dashboard/sales/regional',
    method: 'get',
    params
  })
}

/**
 * 获取最近订单列表
 * @param {Object} params - 查询参数
 * @param {number} params.limit - 限制条数
 */
export function getRecentOrders(params) {
  return request({
    url: '/api/dashboard/orders/recent',
    method: 'get',
    params
  })
}

/**
 * 获取分类销售分布
 * @param {Object} params - 查询参数
 */
export function getCategorySales(params) {
  return request({
    url: '/api/dashboard/sales/category',
    method: 'get',
    params
  })
}

/**
 * 获取小时级销售趋势
 * @param {Object} params - 查询参数
 */
export function getHourlySales(params) {
  return request({
    url: '/api/dashboard/sales/hourly',
    method: 'get',
    params
  })
}

/**
 * 获取用户行为数据
 * @param {Object} params - 查询参数
 */
export function getUserBehavior(params) {
  return request({
    url: '/api/dashboard/users/behavior',
    method: 'get',
    params
  })
}

/**
 * 获取销售目标完成情况
 * @param {Object} params - 查询参数
 */
export function getSalesTarget(params) {
  return request({
    url: '/api/dashboard/sales/target',
    method: 'get',
    params
  })
}

/**
 * 导出销售报表
 * @param {Object} params - 导出参数
 */
export function exportSalesReport(params) {
  return request({
    url: '/api/dashboard/export/sales',
    method: 'post',
    data: params,
    responseType: 'blob'
  })
}

// WebSocket连接管理
export class DashboardWebSocket {
  constructor(url, options = {}) {
    this.url = url
    this.options = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 5,
      ...options
    }
    this.ws = null
    this.reconnectAttempts = 0
    this.listeners = new Map()
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url)
        
        this.ws.onopen = (event) => {
          console.log('WebSocket连接已建立')
          this.reconnectAttempts = 0
          this.emit('connected', event)
          resolve(event)
        }
        
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            this.emit('message', data)
          } catch (error) {
            console.error('解析WebSocket消息失败:', error)
          }
        }
        
        this.ws.onclose = (event) => {
          console.log('WebSocket连接已关闭')
          this.emit('disconnected', event)
          
          // 自动重连
          if (this.reconnectAttempts < this.options.maxReconnectAttempts) {
            setTimeout(() => {
              this.reconnectAttempts++
              console.log(`尝试重连 (${this.reconnectAttempts}/${this.options.maxReconnectAttempts})`)
              this.connect()
            }, this.options.reconnectInterval)
          }
        }
        
        this.ws.onerror = (error) => {
          console.error('WebSocket连接错误:', error)
          this.emit('error', error)
          reject(error)
        }
        
      } catch (error) {
        reject(error)
      }
    })
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.warn('WebSocket未连接，无法发送消息')
    }
  }

  // 订阅数据频道
  subscribe(channel) {
    this.send({
      type: 'subscribe',
      channel
    })
  }

  // 取消订阅
  unsubscribe(channel) {
    this.send({
      type: 'unsubscribe',
      channel
    })
  }

  // 事件监听
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  // 移除事件监听
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  // 触发事件
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`事件回调执行失败 [${event}]:`, error)
        }
      })
    }
  }

  // 获取连接状态
  get readyState() {
    return this.ws ? this.ws.readyState : WebSocket.CLOSED
  }

  get isConnected() {
    return this.readyState === WebSocket.OPEN
  }
}