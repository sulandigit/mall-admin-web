import request from '@/utils/request'

// 获取大屏核心指标数据
export function getDashboardMetrics() {
  return request({
    url: '/dashboard/metrics',
    method: 'get'
  })
}

// 获取销售趋势数据
export function getSalesTrend(period = 'day') {
  return request({
    url: '/dashboard/sales-trend',
    method: 'get',
    params: { period }
  })
}

// 获取订单状态分布数据
export function getOrderStatusDistribution() {
  return request({
    url: '/dashboard/order-status',
    method: 'get'
  })
}

// 获取热销商品排行数据
export function getProductRanking(limit = 10) {
  return request({
    url: '/dashboard/product-ranking',
    method: 'get',
    params: { limit }
  })
}

// 获取用户地域分布数据
export function getUserLocationDistribution() {
  return request({
    url: '/dashboard/user-location',
    method: 'get'
  })
}

// 获取实时交易数据
export function getRealTimeTransactions(limit = 20) {
  return request({
    url: '/dashboard/real-time-transactions',
    method: 'get',
    params: { limit }
  })
}

// 获取用户增长趋势
export function getUserGrowthTrend(period = 'month') {
  return request({
    url: '/dashboard/user-growth',
    method: 'get',
    params: { period }
  })
}

// 获取商品分类销售分布
export function getCategorySalesDistribution() {
  return request({
    url: '/dashboard/category-sales',
    method: 'get'
  })
}

// 获取支付方式分布
export function getPaymentMethodDistribution() {
  return request({
    url: '/dashboard/payment-methods',
    method: 'get'
  })
}

// 获取客户满意度数据
export function getCustomerSatisfaction() {
  return request({
    url: '/dashboard/customer-satisfaction',
    method: 'get'
  })
}

// Mock数据生成函数（开发阶段使用）
export function getMockDashboardMetrics() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          code: 200,
          message: 'success',
          data: {
            totalSales: 128560.50,
            totalOrders: 3247,
            onlineUsers: 1856,
            conversionRate: 3.28,
            salesChange: 12.5,
            ordersChange: 8.3,
            usersChange: -2.1,
            conversionChange: 5.7
          }
        }
      })
    }, 500)
  })
}

export function getMockSalesTrend(period = 'day') {
  return new Promise((resolve) => {
    setTimeout(() => {
      let data = []
      const now = new Date()
      
      if (period === 'day') {
        // 今日每小时数据
        for (let i = 0; i < 24; i++) {
          data.push({
            time: `${i.toString().padStart(2, '0')}:00`,
            sales: Math.floor(Math.random() * 10000) + 5000,
            orders: Math.floor(Math.random() * 100) + 50
          })
        }
      } else if (period === 'week') {
        // 本周每天数据
        const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        weekDays.forEach(day => {
          data.push({
            time: day,
            sales: Math.floor(Math.random() * 50000) + 30000,
            orders: Math.floor(Math.random() * 500) + 300
          })
        })
      } else if (period === 'month') {
        // 本月每天数据
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        for (let i = 1; i <= daysInMonth; i++) {
          data.push({
            time: `${i}日`,
            sales: Math.floor(Math.random() * 80000) + 40000,
            orders: Math.floor(Math.random() * 800) + 400
          })
        }
      }
      
      resolve({
        data: {
          code: 200,
          message: 'success',
          data: data
        }
      })
    }, 300)
  })
}

export function getMockOrderStatus() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          code: 200,
          message: 'success',
          data: [
            { name: '待付款', value: 235, color: '#ff6b6b' },
            { name: '待发货', value: 432, color: '#4ecdc4' },
            { name: '已发货', value: 187, color: '#45b7d1' },
            { name: '已完成', value: 1893, color: '#96ceb4' },
            { name: '已取消', value: 89, color: '#feca57' }
          ]
        }
      })
    }, 300)
  })
}

export function getMockProductRanking() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const products = [
        'iPhone 14 Pro Max',
        'MacBook Pro M2',
        'AirPods Pro 2',
        'iPad Air 5',
        'Apple Watch Ultra',
        'Mac Studio',
        'HomePod mini',
        'Magic Keyboard',
        'AirTag 4件装',
        'iPhone 14'
      ]
      
      const data = products.map((name, index) => ({
        name,
        sales: Math.floor(Math.random() * 1000) + 500 - index * 50,
        revenue: Math.floor(Math.random() * 100000) + 50000 - index * 5000
      }))
      
      resolve({
        data: {
          code: 200,
          message: 'success',
          data: data
        }
      })
    }, 300)
  })
}

export function getMockUserLocation() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          code: 200,
          message: 'success',
          data: [
            { name: '广东', value: 2458 },
            { name: '浙江', value: 1876 },
            { name: '江苏', value: 1654 },
            { name: '北京', value: 1432 },
            { name: '上海', value: 1298 },
            { name: '山东', value: 987 },
            { name: '河南', value: 865 },
            { name: '四川', value: 743 },
            { name: '湖北', value: 621 },
            { name: '福建', value: 532 }
          ]
        }
      })
    }, 300)
  })
}

export function getMockRealTimeTransactions() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = []
      const now = new Date()
      
      for (let i = 0; i < 20; i++) {
        const time = new Date(now.getTime() - i * 30000) // 每30秒一条
        data.push({
          id: `T${Date.now()}${i}`,
          user: `用户${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`,
          product: ['iPhone 14', 'MacBook Pro', 'AirPods Pro', 'iPad Air', 'Apple Watch'][Math.floor(Math.random() * 5)],
          amount: (Math.random() * 10000 + 1000).toFixed(2),
          location: ['北京', '上海', '广州', '深圳', '杭州', '南京'][Math.floor(Math.random() * 6)],
          time: time.toLocaleTimeString('zh-CN')
        })
      }
      
      resolve({
        data: {
          code: 200,
          message: 'success',
          data: data
        }
      })
    }, 200)
  })
}