/**
 * CSRF管理器单元测试
 */
import CSRFManager from '@/security/csrf-manager'
import TokenGenerator from '@/security/token-generator'
import TokenValidator from '@/security/token-validator'
import TokenStorage from '@/security/token-storage'

describe('CSRFManager', () => {
  let csrfManager
  
  beforeEach(() => {
    // 为每个测试创建新的CSRF管理器实例
    csrfManager = new CSRFManager({
      debug: false,
      autoRefresh: false,
      storageType: 'memory'
    })
  })
  
  afterEach(() => {
    if (csrfManager) {
      csrfManager.destroy()
    }
  })
  
  describe('初始化', () => {
    test('应该正确初始化CSRF管理器', () => {
      expect(csrfManager).toBeDefined()
      expect(csrfManager.generator).toBeInstanceOf(TokenGenerator)
      expect(csrfManager.validator).toBeInstanceOf(TokenValidator)
      expect(csrfManager.storage).toBeInstanceOf(TokenStorage)
    })
    
    test('应该使用默认配置', () => {
      const defaultManager = new CSRFManager()
      expect(defaultManager.config.strategy).toBe('double-submit')
      expect(defaultManager.config.tokenLength).toBe(32)
      expect(defaultManager.config.expireTime).toBe(3600000)
      defaultManager.destroy()
    })
    
    test('应该接受自定义配置', () => {
      const customManager = new CSRFManager({
        strategy: 'sync-token',
        tokenLength: 64,
        expireTime: 7200000
      })
      
      expect(customManager.config.strategy).toBe('sync-token')
      expect(customManager.config.tokenLength).toBe(64)
      expect(customManager.config.expireTime).toBe(7200000)
      customManager.destroy()
    })
  })
  
  describe('令牌生成', () => {
    test('应该生成有效的CSRF令牌', async () => {
      const token = await csrfManager.generateToken()
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })
    
    test('生成的令牌应该是唯一的', async () => {
      const token1 = await csrfManager.generateToken()
      const token2 = await csrfManager.generateToken()
      
      expect(token1).not.toBe(token2)
    })
    
    test('应该根据策略生成不同类型的令牌', async () => {
      // 双重提交策略
      const doubleSubmitManager = new CSRFManager({
        strategy: 'double-submit',
        storageType: 'memory'
      })
      const doubleSubmitToken = await doubleSubmitManager.generateToken()
      
      // 同步令牌策略
      const syncTokenManager = new CSRFManager({
        strategy: 'sync-token',
        storageType: 'memory'
      })
      const syncToken = await syncTokenManager.generateToken({
        sessionId: 'test-session'
      })
      
      expect(doubleSubmitToken).toBeDefined()
      expect(syncToken).toBeDefined()
      expect(doubleSubmitToken).not.toBe(syncToken)
      
      doubleSubmitManager.destroy()
      syncTokenManager.destroy()
    })
  })
  
  describe('令牌获取', () => {
    test('应该返回当前有效令牌', async () => {
      const generatedToken = await csrfManager.generateToken()
      const retrievedToken = await csrfManager.getToken()
      
      expect(retrievedToken).toBe(generatedToken)
    })
    
    test('没有令牌时应该生成新令牌', async () => {
      const token = await csrfManager.getToken()
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
    })
    
    test('过期令牌应该被自动刷新', async () => {
      // 创建一个快速过期的管理器
      const shortLivedManager = new CSRFManager({
        expireTime: 100, // 100ms
        storageType: 'memory'
      })
      
      const token1 = await shortLivedManager.generateToken()
      
      // 等待令牌过期
      await new Promise(resolve => setTimeout(resolve, 150))
      
      const token2 = await shortLivedManager.getToken()
      
      expect(token2).not.toBe(token1)
      shortLivedManager.destroy()
    })
  })
  
  describe('令牌验证', () => {
    test('应该验证有效令牌', async () => {
      const token = await csrfManager.generateToken()
      const result = await csrfManager.validateToken(token)
      
      expect(result.valid).toBe(true)
    })
    
    test('应该拒绝无效令牌', async () => {
      const result = await csrfManager.validateToken('invalid-token')
      
      expect(result.valid).toBe(false)
      expect(result.reason).toBeDefined()
    })
    
    test('应该拒绝空令牌', async () => {
      const result = await csrfManager.validateToken('')
      
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('missing')
    })
  })
  
  describe('令牌刷新', () => {
    test('应该生成新的令牌', async () => {
      const originalToken = await csrfManager.generateToken()
      const refreshedToken = await csrfManager.refreshToken()
      
      expect(refreshedToken).not.toBe(originalToken)
      expect(refreshedToken).toBeDefined()
    })
    
    test('刷新后旧令牌应该失效', async () => {
      const originalToken = await csrfManager.generateToken()
      await csrfManager.refreshToken()
      
      // 验证旧令牌应该失效
      const result = await csrfManager.validateToken(originalToken)
      expect(result.valid).toBe(false)
    })
  })
  
  describe('令牌清除', () => {
    test('应该清除当前令牌', async () => {
      await csrfManager.generateToken()
      await csrfManager.clearToken()
      
      expect(csrfManager.currentToken).toBeNull()
    })
    
    test('清除后获取令牌应该生成新令牌', async () => {
      const token1 = await csrfManager.generateToken()
      await csrfManager.clearToken()
      const token2 = await csrfManager.getToken()
      
      expect(token2).not.toBe(token1)
    })
  })
  
  describe('错误处理', () => {
    test('应该处理令牌生成错误', async () => {
      // 模拟存储错误
      const errorManager = new CSRFManager({
        storageType: 'memory'
      })
      
      // 破坏存储
      errorManager.storage.storeToken = jest.fn().mockRejectedValue(new Error('Storage error'))
      
      await expect(errorManager.generateToken()).rejects.toThrow('CSRF token generation failed')
      errorManager.destroy()
    })
    
    test('应该处理验证错误', async () => {
      const result = await csrfManager.validateToken(null)
      
      expect(result.valid).toBe(false)
      expect(result.reason).toBeDefined()
    })
    
    test('应该在最大重试次数后停止重试', async () => {
      const error = {
        code: 'CSRF_TOKEN_EXPIRED',
        message: 'Token expired'
      }
      
      // 设置最大重试次数为1
      csrfManager.config.maxRetries = 1
      csrfManager.retryCount = 2 // 已经超过最大重试次数
      
      await expect(csrfManager.handleTokenError(error)).rejects.toThrow('Max retries exceeded')
    })
  })
  
  describe('请求头生成', () => {
    test('应该生成正确的请求头', async () => {
      const token = await csrfManager.generateToken()
      const headers = await csrfManager.getTokenHeader()
      
      expect(headers).toHaveProperty('X-CSRF-Token')
      expect(headers['X-CSRF-Token']).toBe(token)
    })
    
    test('没有令牌时应该返回空对象', async () => {
      // 模拟获取令牌失败
      csrfManager.getToken = jest.fn().mockRejectedValue(new Error('No token'))
      
      const headers = await csrfManager.getTokenHeader()
      expect(headers).toEqual({})
    })
  })
})