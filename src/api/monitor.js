import request from '@/utils/request'

// 获取系统性能监控数据
export function getSystemMetrics() {
  return new Promise((resolve) => {
    // 模拟API响应延迟
    setTimeout(() => {
      resolve({
        data: {
          cpu: {
            usage: Math.floor(Math.random() * 80) + 20, // 20-100%
            cores: 8,
            temperature: Math.floor(Math.random() * 20) + 40 // 40-60°C
          },
          memory: {
            total: 16384, // MB
            used: Math.floor(Math.random() * 8192) + 4096, // 4-12GB
            usage: 0
          },
          disk: {
            total: 512000, // MB
            used: Math.floor(Math.random() * 300000) + 100000,
            usage: 0
          },
          network: {
            inbound: Math.floor(Math.random() * 1000) + 100, // KB/s
            outbound: Math.floor(Math.random() * 500) + 50
          }
        }
      })
    }, 100)
  })
}

// 获取网络性能监控数据
export function getNetworkMetrics() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = new Date()
      const data = []
      
      // 生成最近24小时的数据
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000)
        data.push({
          time: time.toISOString(),
          responseTime: Math.floor(Math.random() * 200) + 50, // 50-250ms
          requestCount: Math.floor(Math.random() * 1000) + 100,
          errorRate: Math.random() * 5, // 0-5%
          throughput: Math.floor(Math.random() * 500) + 200 // 200-700 req/min
        })
      }
      
      resolve({
        data: {
          current: {
            responseTime: data[data.length - 1].responseTime,
            requestCount: data[data.length - 1].requestCount,
            errorRate: data[data.length - 1].errorRate,
            throughput: data[data.length - 1].throughput
          },
          history: data
        }
      })
    }, 150)
  })
}

// 获取数据库性能监控数据
export function getDatabaseMetrics() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          connections: {
            active: Math.floor(Math.random() * 80) + 20,
            idle: Math.floor(Math.random() * 20) + 10,
            max: 100
          },
          queries: {
            total: Math.floor(Math.random() * 10000) + 5000,
            slow: Math.floor(Math.random() * 50) + 10,
            avgResponseTime: Math.floor(Math.random() * 100) + 20
          },
          locks: {
            waiting: Math.floor(Math.random() * 5),
            deadlocks: Math.floor(Math.random() * 2)
          },
          cache: {
            hitRate: Math.floor(Math.random() * 20) + 80, // 80-100%
            size: Math.floor(Math.random() * 500) + 200 // MB
          }
        }
      })
    }, 120)
  })
}

// 获取应用性能监控数据
export function getApplicationMetrics() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = new Date()
      const data = []
      
      // 生成最近7天的数据
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        data.push({
          date: date.toISOString().split('T')[0],
          activeUsers: Math.floor(Math.random() * 5000) + 1000,
          pageViews: Math.floor(Math.random() * 50000) + 10000,
          bounce: Math.random() * 30 + 20, // 20-50%
          avgSessionTime: Math.floor(Math.random() * 300) + 120 // 2-7分钟
        })
      }
      
      resolve({
        data: {
          current: {
            onlineUsers: Math.floor(Math.random() * 200) + 50,
            totalUsers: Math.floor(Math.random() * 10000) + 5000,
            errorRate: Math.random() * 2, // 0-2%
            avgLoadTime: Math.floor(Math.random() * 2000) + 500 // 0.5-2.5s
          },
          history: data
        }
      })
    }, 130)
  })
}

// 获取告警配置
export function getAlertConfig() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          rules: [
            {
              id: 1,
              name: 'CPU使用率告警',
              metric: 'cpu_usage',
              threshold: 80,
              condition: '>',
              enabled: true,
              notificationMethod: 'email'
            },
            {
              id: 2,
              name: '内存使用率告警', 
              metric: 'memory_usage',
              threshold: 85,
              condition: '>',
              enabled: true,
              notificationMethod: 'sms'
            },
            {
              id: 3,
              name: '响应时间告警',
              metric: 'response_time',
              threshold: 500,
              condition: '>',
              enabled: false,
              notificationMethod: 'email'
            }
          ]
        }
      })
    }, 100)
  })
}

// 保存告警配置
export function saveAlertConfig(config) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: '告警配置保存成功'
      })
    }, 200)
  })
}

// 获取告警历史
export function getAlertHistory() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = new Date()
      const alerts = []
      
      // 生成最近的告警记录
      for (let i = 0; i < 10; i++) {
        const time = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        alerts.push({
          id: i + 1,
          time: time.toISOString(),
          level: ['warning', 'error', 'critical'][Math.floor(Math.random() * 3)],
          message: [
            'CPU使用率超过阈值',
            '内存使用率过高',
            '响应时间过长',
            '数据库连接数过多',
            '磁盘空间不足'
          ][Math.floor(Math.random() * 5)],
          status: ['resolved', 'active'][Math.floor(Math.random() * 2)]
        })
      }
      
      resolve({
        data: {
          alerts: alerts.sort((a, b) => new Date(b.time) - new Date(a.time))
        }
      })
    }, 100)
  })
}