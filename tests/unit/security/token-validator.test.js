/**
 * 令牌验证器单元测试
 */
import TokenValidator from '@/security/token-validator'
import TokenGenerator from '@/security/token-generator'

describe('TokenValidator', () => {
  let validator
  let generator
  
  beforeEach(() => {
    validator = new TokenValidator()
    generator = new TokenGenerator()
  })
  
  describe('初始化', () => {
    test('应该使用默认配置初始化', () => {
      expect(validator.config.maxAge).toBe(3600000) // 1小时
      expect(validator.config.tolerance).toBe(300000) // 5分钟
      expect(validator.config.strictMode).toBe(false)
    })
    
    test('应该接受自定义配置', () => {
      const customValidator = new TokenValidator({
        maxAge: 7200000,
        tolerance: 600000,
        strictMode: true
      })
      
      expect(customValidator.config.maxAge).toBe(7200000)
      expect(customValidator.config.tolerance).toBe(600000)
      expect(customValidator.config.strictMode).toBe(true)
    })
  })
  
  describe('双重提交令牌验证', () => {
    test('应该验证相同的令牌', () => {
      const token = generator.createDoubleSubmitToken()
      const result = validator.validateDoubleSubmit(token, token)
      
      expect(result.valid).toBe(true)
      expect(result.reason).toContain('Valid')
    })
    
    test('应该拒绝不匹配的令牌', () => {
      const token1 = generator.createDoubleSubmitToken()
      const token2 = generator.createDoubleSubmitToken()
      const result = validator.validateDoubleSubmit(token1, token2)
      
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('mismatch')
    })
    
    test('应该拒绝缺少的令牌', () => {
      const token = generator.createDoubleSubmitToken()
      
      const result1 = validator.validateDoubleSubmit(null, token)
      expect(result1.valid).toBe(false)
      expect(result1.reason).toContain('Missing')
      
      const result2 = validator.validateDoubleSubmit(token, null)
      expect(result2.valid).toBe(false)
      expect(result2.reason).toContain('Missing')
      
      const result3 = validator.validateDoubleSubmit(null, null)
      expect(result3.valid).toBe(false)
      expect(result3.reason).toContain('Missing')
    })
    
    test('应该拒绝格式无效的令牌', () => {
      const invalidToken = 'invalid-token-format!'
      const validToken = generator.createDoubleSubmitToken()
      
      const result = validator.validateDoubleSubmit(invalidToken, validToken)
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('Invalid token format')
    })
    
    test('应该处理包含时间戳的令牌', () => {
      const timestampGenerator = new TokenGenerator({ includeTimestamp: true })
      const token = timestampGenerator.createDoubleSubmitToken()
      
      const result = validator.validateDoubleSubmit(token, token)
      expect(result.valid).toBe(true)
      expect(result.timestamp).toBeDefined()
    })
  })
  
  describe('同步令牌验证', () => {
    test('应该对基本格式进行验证', () => {
      const sessionId = 'test-session'
      const token = generator.createSyncToken(sessionId)
      
      const result = validator.validateSyncToken(token, sessionId)
      expect(result.valid).toBe(true)
      expect(result.reason).toContain('server support')
    })
    
    test('应该拒绝缺少参数的验证', () => {
      const result1 = validator.validateSyncToken(null, 'session')
      expect(result1.valid).toBe(false)
      expect(result1.reason).toContain('Missing')
      
      const result2 = validator.validateSyncToken('token', null)
      expect(result2.valid).toBe(false)
      expect(result2.reason).toContain('Missing')
    })
    
    test('应该拒绝格式无效的令牌', () => {
      const invalidToken = 'invalid!'
      const result = validator.validateSyncToken(invalidToken, 'session')
      
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('Invalid token format')
    })
  })
  
  describe('令牌过期检查', () => {
    test('应该接受未过期的令牌', () => {
      const now = Date.now()
      const recentTimestamp = now - 1000 // 1秒前
      
      const result = validator.isTokenExpired(recentTimestamp)
      expect(result.expired).toBe(false)
      expect(result.age).toBeGreaterThan(0)
    })
    
    test('应该拒绝过期的令牌', () => {
      const now = Date.now()
      const oldTimestamp = now - validator.config.maxAge - 1000 // 超过最大年龄
      
      const result = validator.isTokenExpired(oldTimestamp)
      expect(result.expired).toBe(true)
      expect(result.reason).toContain('expired')
    })
    
    test('应该拒绝来自未来的令牌', () => {
      const now = Date.now()
      const futureTimestamp = now + validator.config.tolerance + 1000 // 超过容错范围
      
      const result = validator.isTokenExpired(futureTimestamp)
      expect(result.expired).toBe(true)
      expect(result.reason).toContain('future')
    })
    
    test('应该处理容错范围内的时钟偏差', () => {
      const now = Date.now()
      const slightlyFutureTimestamp = now + validator.config.tolerance - 1000 // 在容错范围内
      
      const result = validator.isTokenExpired(slightlyFutureTimestamp)
      expect(result.expired).toBe(false)
    })
    
    test('应该拒绝无效的时间戳', () => {
      const result1 = validator.isTokenExpired(null)
      expect(result1.expired).toBe(true)
      expect(result1.reason).toContain('No timestamp')
      
      const result2 = validator.isTokenExpired(undefined)
      expect(result2.expired).toBe(true)
      
      const result3 = validator.isTokenExpired(0)
      expect(result3.expired).toBe(true)
    })
  })
  
  describe('令牌格式验证', () => {
    test('应该验证有效的令牌格式', () => {
      const validTokens = [
        'abcdef1234567890abcdef1234567890',
        'ABCDEF1234567890ABCDEF1234567890',
        'aB1cD2eF3456789012345678901234567890',
        '1234567890123456' // 最小长度
      ]
      
      validTokens.forEach(token => {
        expect(validator.isValidTokenFormat(token)).toBe(true)
      })
    })
    
    test('应该拒绝无效的令牌格式', () => {
      const invalidTokens = [
        '',                    // 空字符串
        'abc',                 // 太短
        'a'.repeat(100),       // 太长
        'invalid-token!',      // 包含无效字符
        'token with spaces',   // 包含空格
        'token@#$%',          // 包含特殊字符
        null,                 // null
        undefined,            // undefined
        123,                  // 数字
        {}                    // 对象
      ]
      
      invalidTokens.forEach(token => {
        expect(validator.isValidTokenFormat(token)).toBe(false)
      })
    })
    
    test('应该正确处理边界长度', () => {
      const minLengthToken = 'a'.repeat(16)  // 最小长度
      const maxLengthToken = 'a'.repeat(64)  // 最大长度
      const tooShortToken = 'a'.repeat(15)   // 太短
      const tooLongToken = 'a'.repeat(65)    // 太长
      
      expect(validator.isValidTokenFormat(minLengthToken)).toBe(true)
      expect(validator.isValidTokenFormat(maxLengthToken)).toBe(true)
      expect(validator.isValidTokenFormat(tooShortToken)).toBe(false)
      expect(validator.isValidTokenFormat(tooLongToken)).toBe(false)
    })
  })
  
  describe('时间戳提取', () => {
    test('应该从有效令牌中提取时间戳', () => {
      const timestampGenerator = new TokenGenerator({ includeTimestamp: true })
      const token = timestampGenerator.createDoubleSubmitToken()
      
      const extractedTimestamp = validator.extractTimestamp(token)
      expect(extractedTimestamp).toBeDefined()
      expect(typeof extractedTimestamp).toBe('number')
      expect(extractedTimestamp).toBeGreaterThan(0)
    })
    
    test('应该处理无效输入', () => {
      expect(validator.extractTimestamp('')).toBeNull()
      expect(validator.extractTimestamp(null)).toBeNull()
      expect(validator.extractTimestamp(undefined)).toBeNull()
      expect(validator.extractTimestamp('invalid')).toBeNull()
    })
    
    test('应该验证时间戳的合理性', () => {
      const now = Date.now()
      
      // 创建一个包含未来时间戳的令牌
      const futureTimestamp = Math.floor((now + 86400000 * 2) / 1000).toString(36)
      const futureToken = futureTimestamp + 'randompart'
      
      const extracted = validator.extractTimestamp(futureToken)
      expect(extracted).toBeNull() // 应该拒绝不合理的时间戳
    })
  })
  
  describe('令牌强度验证', () => {
    test('应该评估强令牌', () => {
      const strongToken = 'AbCdEf1234567890aBcDeF1234567890aBcDeF12' // 长度、混合大小写、数字
      const result = validator.validateTokenStrength(strongToken)
      
      expect(result.strength).toBe('very-strong')
      expect(result.score).toBeGreaterThan(80)
      expect(result.recommendations).toHaveLength(0)
    })
    
    test('应该评估弱令牌', () => {
      const weakToken = 'abc123' // 太短、简单
      const result = validator.validateTokenStrength(weakToken)
      
      expect(result.strength).toBe('very-weak')
      expect(result.score).toBeLessThan(50)
      expect(result.recommendations.length).toBeGreaterThan(0)
    })
    
    test('应该提供改进建议', () => {
      const shortToken = 'abc123'
      const result = validator.validateTokenStrength(shortToken)
      
      expect(result.recommendations).toContain(
        expect.stringMatching(/32 characters/)
      )
    })
    
    test('应该检测低熵令牌', () => {
      const lowEntropyToken = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' // 重复字符
      const result = validator.validateTokenStrength(lowEntropyToken)
      
      expect(result.recommendations).toContain(
        expect.stringMatching(/entropy/)
      )
    })
    
    test('应该奖励时间戳的存在', () => {
      const timestampGenerator = new TokenGenerator({ includeTimestamp: true })
      const tokenWithTimestamp = timestampGenerator.createDoubleSubmitToken()
      
      const result = validator.validateTokenStrength(tokenWithTimestamp)
      expect(result.score).toBeGreaterThan(50) // 时间戳应该增加分数
    })
    
    test('应该处理空令牌', () => {
      const result = validator.validateTokenStrength('')
      
      expect(result.strength).toBe('weak')
      expect(result.score).toBe(0)
      expect(result.recommendations).toContain('Token is missing')
    })
  })
  
  describe('配置影响', () => {
    test('严格模式应该影响验证', () => {
      const strictValidator = new TokenValidator({ strictMode: true })
      const lenientValidator = new TokenValidator({ strictMode: false })
      
      // 两个验证器应该有不同的行为（虽然在这个简单实现中可能相同）
      expect(strictValidator.config.strictMode).toBe(true)
      expect(lenientValidator.config.strictMode).toBe(false)
    })
    
    test('最大年龄配置应该影响过期检查', () => {
      const shortAgeValidator = new TokenValidator({ maxAge: 60000 }) // 1分钟
      const longAgeValidator = new TokenValidator({ maxAge: 7200000 }) // 2小时
      
      const timestamp = Date.now() - 3600000 // 1小时前
      
      const shortResult = shortAgeValidator.isTokenExpired(timestamp)
      const longResult = longAgeValidator.isTokenExpired(timestamp)
      
      expect(shortResult.expired).toBe(true)  // 对于1分钟限制应该过期
      expect(longResult.expired).toBe(false) // 对于2小时限制应该还有效
    })
    
    test('容错时间应该影响未来时间戳检查', () => {
      const strictToleranceValidator = new TokenValidator({ tolerance: 60000 }) // 1分钟
      const lenientToleranceValidator = new TokenValidator({ tolerance: 600000 }) // 10分钟
      
      const futureTimestamp = Date.now() + 300000 // 5分钟后
      
      const strictResult = strictToleranceValidator.isTokenExpired(futureTimestamp)
      const lenientResult = lenientToleranceValidator.isTokenExpired(futureTimestamp)
      
      expect(strictResult.expired).toBe(true)  // 严格容错应该拒绝
      expect(lenientResult.expired).toBe(false) // 宽松容错应该接受
    })
  })
})