/**
 * 令牌生成器单元测试
 */
import TokenGenerator from '@/security/token-generator'

describe('TokenGenerator', () => {
  let generator
  
  beforeEach(() => {
    generator = new TokenGenerator()
  })
  
  describe('初始化', () => {
    test('应该使用默认配置初始化', () => {
      expect(generator.config.tokenLength).toBe(32)
      expect(generator.config.includeTimestamp).toBe(true)
    })
    
    test('应该接受自定义配置', () => {
      const customGenerator = new TokenGenerator({
        tokenLength: 64,
        includeTimestamp: false
      })
      
      expect(customGenerator.config.tokenLength).toBe(64)
      expect(customGenerator.config.includeTimestamp).toBe(false)
    })
  })
  
  describe('随机字符串生成', () => {
    test('应该生成指定长度的随机字符串', () => {
      const length = 16
      const randomString = generator.generateRandomString(length)
      
      expect(randomString).toBeDefined()
      expect(randomString.length).toBe(length)
      expect(typeof randomString).toBe('string')
    })
    
    test('生成的字符串应该只包含允许的字符', () => {
      const randomString = generator.generateRandomString(32)
      const allowedChars = /^[A-Za-z0-9]+$/
      
      expect(allowedChars.test(randomString)).toBe(true)
    })
    
    test('每次生成的字符串应该不同', () => {
      const string1 = generator.generateRandomString(32)
      const string2 = generator.generateRandomString(32)
      
      expect(string1).not.toBe(string2)
    })
    
    test('应该处理不同的长度参数', () => {
      expect(generator.generateRandomString(8).length).toBe(8)
      expect(generator.generateRandomString(16).length).toBe(16)
      expect(generator.generateRandomString(64).length).toBe(64)
    })
  })
  
  describe('双重提交令牌生成', () => {
    test('应该生成双重提交令牌', () => {
      const token = generator.createDoubleSubmitToken()
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })
    
    test('包含时间戳的令牌应该包含时间信息', () => {
      const timestampGenerator = new TokenGenerator({
        includeTimestamp: true,
        tokenLength: 32
      })
      
      const token = timestampGenerator.createDoubleSubmitToken()
      const extractedTimestamp = timestampGenerator.extractTimestamp(token)
      
      expect(extractedTimestamp).toBeDefined()
      expect(extractedTimestamp).toBeGreaterThan(0)
    })
    
    test('不包含时间戳的令牌应该纯随机', () => {
      const noTimestampGenerator = new TokenGenerator({
        includeTimestamp: false,
        tokenLength: 32
      })
      
      const token = noTimestampGenerator.createDoubleSubmitToken()
      const extractedTimestamp = noTimestampGenerator.extractTimestamp(token)
      
      expect(extractedTimestamp).toBeNull()
    })
    
    test('每次生成的令牌应该不同', () => {
      const token1 = generator.createDoubleSubmitToken()
      const token2 = generator.createDoubleSubmitToken()
      
      expect(token1).not.toBe(token2)
    })
  })
  
  describe('同步令牌生成', () => {
    test('应该生成同步令牌', () => {
      const sessionId = 'test-session-123'
      const token = generator.createSyncToken(sessionId)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })
    
    test('相同会话ID应该生成不同令牌（因为时间戳）', () => {
      const sessionId = 'test-session-123'
      const token1 = generator.createSyncToken(sessionId)
      
      // 稍等一下确保时间戳不同
      setTimeout(() => {
        const token2 = generator.createSyncToken(sessionId)
        expect(token1).not.toBe(token2)
      }, 10)
    })
    
    test('不同会话ID应该生成不同令牌', () => {
      const token1 = generator.createSyncToken('session-1')
      const token2 = generator.createSyncToken('session-2')
      
      expect(token1).not.toBe(token2)
    })
    
    test('使用密钥应该生成HMAC令牌', () => {
      const sessionId = 'test-session'
      const secret = 'test-secret'
      
      const token1 = generator.createSyncToken(sessionId, secret)
      const token2 = generator.createSyncToken(sessionId, secret)
      
      expect(token1).toBeDefined()
      expect(token2).toBeDefined()
      // 由于包含时间戳，即使相同输入也应该不同
      expect(token1).not.toBe(token2)
    })
  })
  
  describe('时间戳令牌生成', () => {
    test('应该生成包含时间戳的令牌', () => {
      const result = generator.generateTimestampToken()
      
      expect(result).toHaveProperty('token')
      expect(result).toHaveProperty('timestamp')
      expect(result).toHaveProperty('expireAt')
      
      expect(typeof result.token).toBe('string')
      expect(typeof result.timestamp).toBe('number')
      expect(typeof result.expireAt).toBe('number')
      
      expect(result.expireAt).toBeGreaterThan(result.timestamp)
    })
    
    test('应该使用自定义过期时间', () => {
      const customExpireTime = 1800000 // 30分钟
      const result = generator.generateTimestampToken(customExpireTime)
      
      const expectedExpireTime = result.timestamp + customExpireTime
      expect(result.expireAt).toBe(expectedExpireTime)
    })
    
    test('时间戳应该合理', () => {
      const result = generator.generateTimestampToken()
      const now = Date.now()
      
      // 时间戳应该在当前时间附近（允许少量误差）
      expect(Math.abs(result.timestamp - now)).toBeLessThan(1000)
    })
  })
  
  describe('令牌格式验证', () => {
    test('应该验证有效的令牌格式', () => {
      const validToken = generator.createDoubleSubmitToken()
      expect(generator.isValidTokenFormat(validToken)).toBe(true)
    })
    
    test('应该拒绝无效的令牌格式', () => {
      expect(generator.isValidTokenFormat('')).toBe(false)
      expect(generator.isValidTokenFormat(null)).toBe(false)
      expect(generator.isValidTokenFormat(undefined)).toBe(false)
      expect(generator.isValidTokenFormat(123)).toBe(false)
      expect(generator.isValidTokenFormat('abc')).toBe(false) // 太短
      expect(generator.isValidTokenFormat('a'.repeat(100))).toBe(false) // 太长
      expect(generator.isValidTokenFormat('invalid-chars-!')).toBe(false) // 无效字符
    })
    
    test('应该接受边界长度的令牌', () => {
      const minLengthToken = 'a'.repeat(16)
      const maxLengthToken = 'a'.repeat(64)
      
      expect(generator.isValidTokenFormat(minLengthToken)).toBe(true)
      expect(generator.isValidTokenFormat(maxLengthToken)).toBe(true)
    })
  })
  
  describe('时间戳提取', () => {
    test('应该从包含时间戳的令牌中提取时间戳', () => {
      const timestampGenerator = new TokenGenerator({
        includeTimestamp: true
      })
      
      const token = timestampGenerator.createDoubleSubmitToken()
      const extractedTimestamp = timestampGenerator.extractTimestamp(token)
      
      expect(extractedTimestamp).toBeDefined()
      expect(typeof extractedTimestamp).toBe('number')
      expect(extractedTimestamp).toBeGreaterThan(0)
    })
    
    test('无法从不包含时间戳的令牌中提取时间戳', () => {
      const noTimestampGenerator = new TokenGenerator({
        includeTimestamp: false
      })
      
      const timestamp = noTimestampGenerator.extractTimestamp('randomtoken123')
      expect(timestamp).toBeNull()
    })
    
    test('应该处理无效的令牌', () => {
      expect(generator.extractTimestamp('')).toBeNull()
      expect(generator.extractTimestamp(null)).toBeNull()
      expect(generator.extractTimestamp('invalid')).toBeNull()
    })
    
    test('应该验证提取的时间戳合理性', () => {
      // 模拟一个包含未来时间戳的令牌
      const futureTimestamp = Math.floor((Date.now() + 86400000 * 2) / 1000).toString(36)
      const futureToken = futureTimestamp + 'randomstring'
      
      const extracted = generator.extractTimestamp(futureToken)
      expect(extracted).toBeNull() // 应该拒绝未来时间戳
    })
  })
  
  describe('配置处理', () => {
    test('应该正确处理字符集配置', () => {
      const customCharsetGenerator = new TokenGenerator({
        charset: 'ABCDEF123456'
      })
      
      const token = customCharsetGenerator.generateRandomString(32)
      const validChars = /^[ABCDEF123456]+$/
      
      expect(validChars.test(token)).toBe(true)
    })
    
    test('应该处理算法配置', () => {
      const customAlgorithmGenerator = new TokenGenerator({
        algorithm: 'SHA512'
      })
      
      // 生成器应该能够正常工作，即使算法不同
      const token = customAlgorithmGenerator.createDoubleSubmitToken()
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
    })
  })
})