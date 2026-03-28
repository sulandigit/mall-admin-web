/**
 * API重试功能单元测试
 * 测试各种重试场景和配置
 */

import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import request from '@/utils/request'
import { 
  isRetryableError, 
  getAPIRetryConfig, 
  getRetryStats,
  clearRetryLogs,
  RETRY_STRATEGIES 
} from '@/utils/retryConfig'

// 创建axios mock
const mock = new MockAdapter(axios)

describe('API重试功能测试', () => {
  beforeEach(() => {
    // 清除重试日志
    clearRetryLogs()
    // 重置mock
    mock.reset()
  })

  afterEach(() => {
    mock.reset()
  })

  describe('重试条件测试', () => {
    test('网络错误应该重试', () => {
      const networkError = new Error('Network Error')
      expect(isRetryableError(networkError)).toBe(true)
    })

    test('5xx服务器错误应该重试', () => {
      const serverError = {
        response: { status: 500 }
      }
      expect(isRetryableError(serverError)).toBe(true)
    })

    test('408请求超时应该重试', () => {
      const timeoutError = {
        response: { status: 408 }
      }
      expect(isRetryableError(timeoutError)).toBe(true)
    })

    test('429请求过多应该重试', () => {
      const rateLimitError = {
        response: { status: 429 }
      }
      expect(isRetryableError(rateLimitError)).toBe(true)
    })

    test('401未授权不应该重试', () => {
      const authError = {
        response: { status: 401 }
      }
      expect(isRetryableError(authError)).toBe(false)
    })

    test('403禁止访问不应该重试', () => {
      const forbiddenError = {
        response: { status: 403 }
      }
      expect(isRetryableError(forbiddenError)).toBe(false)
    })
  })

  describe('重试配置测试', () => {
    test('订单接口应该使用关键策略', () => {
      const config = getAPIRetryConfig('/order/create')
      expect(config._strategy).toBe(RETRY_STRATEGIES.CRITICAL)
      expect(config.retries).toBe(5)
    })

    test('登录接口应该使用快速失败策略', () => {
      const config = getAPIRetryConfig('/admin/login')
      expect(config._strategy).toBe(RETRY_STRATEGIES.FAST_FAIL)
      expect(config.retries).toBe(1)
    })

    test('查询接口应该使用标准策略', () => {
      const config = getAPIRetryConfig('/product/list')
      expect(config._strategy).toBe(RETRY_STRATEGIES.NORMAL)
      expect(config.retries).toBe(3)
    })

    test('自定义配置应该覆盖默认配置', () => {
      const customConfig = { retries: 10 }
      const config = getAPIRetryConfig('/test/api', customConfig)
      expect(config.retries).toBe(10)
    })
  })

  describe('重试执行测试', () => {
    test('成功请求不应该重试', async () => {
      mock.onGet('/test/success').reply(200, { code: 200, data: 'success' })

      const response = await request({
        url: '/test/success',
        method: 'get'
      })

      expect(response.data).toBe('success')
      expect(mock.history.get.length).toBe(1)
    })

    test('网络错误应该重试指定次数', async () => {
      // 前两次失败，第三次成功
      mock.onGet('/test/retry')
        .replyOnce(() => Promise.reject(new Error('Network Error')))
        .replyOnce(() => Promise.reject(new Error('Network Error')))
        .replyOnce(200, { code: 200, data: 'success after retry' })

      const response = await request({
        url: '/test/retry',
        method: 'get',
        retry: { retries: 3, retryDelay: 100 }
      })

      expect(response.data).toBe('success after retry')
      expect(mock.history.get.length).toBe(3)
    }, 10000)

    test('超过最大重试次数应该失败', async () => {
      mock.onGet('/test/fail').reply(() => Promise.reject(new Error('Network Error')))

      try {
        await request({
          url: '/test/fail',
          method: 'get',
          retry: { retries: 2, retryDelay: 100 }
        })
        fail('应该抛出错误')
      } catch (error) {
        expect(error.message).toBe('Network Error')
        expect(mock.history.get.length).toBe(3) // 1次初始请求 + 2次重试
      }
    }, 10000)

    test('业务错误不应该重试', async () => {
      mock.onPost('/test/business-error').reply(400, { 
        code: 400, 
        message: '参数错误' 
      })

      try {
        await request({
          url: '/test/business-error',
          method: 'post',
          retry: { retries: 3 }
        })
        fail('应该抛出错误')
      } catch (error) {
        expect(mock.history.post.length).toBe(1) // 不应该重试
      }
    })
  })

  describe('延迟策略测试', () => {
    test('指数退避延迟计算', async () => {
      const startTime = Date.now()
      
      // 模拟前两次失败
      mock.onGet('/test/delay')
        .replyOnce(() => Promise.reject(new Error('Network Error')))
        .replyOnce(() => Promise.reject(new Error('Network Error')))
        .replyOnce(200, { code: 200, data: 'success' })

      await request({
        url: '/test/delay',
        method: 'get',
        retry: {
          retries: 2,
          retryDelay: 1000,
          retryDelayMultiplier: 2
        }
      })

      const endTime = Date.now()
      const totalTime = endTime - startTime
      
      // 第一次重试延迟1秒，第二次重试延迟2秒，总共至少3秒
      expect(totalTime).toBeGreaterThan(2500)
    }, 10000)
  })

  describe('自定义重试条件测试', () => {
    test('自定义重试条件应该生效', async () => {
      mock.onPost('/test/custom-retry').reply(400, { 
        code: 400, 
        message: '业务错误' 
      })

      try {
        await request({
          url: '/test/custom-retry',
          method: 'post',
          retry: {
            retries: 2,
            retryDelay: 100,
            retryCondition: (error) => {
              // 自定义条件：对所有错误都重试
              return true
            }
          }
        })
        fail('应该抛出错误')
      } catch (error) {
        expect(mock.history.post.length).toBe(3) // 1次初始 + 2次重试
      }
    }, 5000)
  })

  describe('便捷方法测试', () => {
    test('createCriticalRequest应该使用关键配置', async () => {
      mock.onPost('/test/critical').reply(500, 'Server Error')

      try {
        await request.createCriticalRequest()({
          url: '/test/critical',
          method: 'post'
        })
        fail('应该抛出错误')
      } catch (error) {
        // 关键请求应该重试5次
        expect(mock.history.post.length).toBe(6) // 1次初始 + 5次重试
      }
    }, 15000)

    test('createFastFailRequest应该快速失败', async () => {
      mock.onPost('/test/fast-fail').reply(500, 'Server Error')

      try {
        await request.createFastFailRequest()({
          url: '/test/fast-fail',
          method: 'post'
        })
        fail('应该抛出错误')
      } catch (error) {
        // 快速失败只重试1次
        expect(mock.history.post.length).toBe(2) // 1次初始 + 1次重试
      }
    }, 5000)

    test('createNoRetryRequest不应该重试', async () => {
      mock.onPost('/test/no-retry').reply(500, 'Server Error')

      try {
        await request.createNoRetryRequest()({
          url: '/test/no-retry',
          method: 'post'
        })
        fail('应该抛出错误')
      } catch (error) {
        expect(mock.history.post.length).toBe(1) // 只有1次请求，不重试
      }
    })
  })

  describe('日志记录测试', () => {
    test('重试过程应该记录日志', async () => {
      mock.onGet('/test/logging')
        .replyOnce(() => Promise.reject(new Error('Network Error')))
        .replyOnce(200, { code: 200, data: 'success' })

      await request({
        url: '/test/logging',
        method: 'get',
        retry: { retries: 2, retryDelay: 100 }
      })

      const stats = getRetryStats()
      expect(stats.logs.length).toBeGreaterThan(0)
      
      const successLog = stats.logs.find(log => log.level === 'info')
      expect(successLog).toBeDefined()
      expect(successLog.message).toContain('重试成功')
    }, 5000)
  })

  describe('并发请求测试', () => {
    test('多个并发请求应该独立重试', async () => {
      // 第一个请求：立即成功
      mock.onGet('/test/concurrent1').reply(200, { code: 200, data: 'success1' })
      
      // 第二个请求：重试一次后成功
      mock.onGet('/test/concurrent2')
        .replyOnce(() => Promise.reject(new Error('Network Error')))
        .replyOnce(200, { code: 200, data: 'success2' })

      const promises = [
        request({
          url: '/test/concurrent1',
          method: 'get',
          retry: { retries: 1, retryDelay: 100 }
        }),
        request({
          url: '/test/concurrent2',
          method: 'get',
          retry: { retries: 1, retryDelay: 100 }
        })
      ]

      const results = await Promise.all(promises)
      
      expect(results[0].data).toBe('success1')
      expect(results[1].data).toBe('success2')
      
      // 验证请求次数
      expect(mock.history.get.filter(req => req.url === '/test/concurrent1').length).toBe(1)
      expect(mock.history.get.filter(req => req.url === '/test/concurrent2').length).toBe(2)
    }, 5000)
  })
})

describe('重试统计功能测试', () => {
  beforeEach(() => {
    clearRetryLogs()
  })

  test('应该正确记录重试统计', async () => {
    mock.onGet('/test/stats')
      .replyOnce(() => Promise.reject(new Error('Network Error')))
      .replyOnce(200, { code: 200, data: 'success' })

    await request({
      url: '/test/stats',
      method: 'get',
      retry: { retries: 2, retryDelay: 50 }
    })

    const stats = getRetryStats()
    expect(stats.logs.length).toBeGreaterThan(0)
    
    const apiKey = 'get /test/stats'
    expect(stats.summary[apiKey]).toBeDefined()
    expect(stats.summary[apiKey].total).toBeGreaterThan(0)
  }, 5000)

  test('清除日志功能应该正常工作', () => {
    // 先确保有日志记录
    const statsBeforeClear = getRetryStats()
    
    clearRetryLogs()
    
    const statsAfterClear = getRetryStats()
    expect(statsAfterClear.logs).toEqual([])
    expect(statsAfterClear.summary).toEqual({})
  })
})