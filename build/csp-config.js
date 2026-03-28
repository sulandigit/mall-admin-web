'use strict'

/**
 * CSP (Content Security Policy) 策略配置模块
 * 为商城管理后台系统提供分环境的CSP安全策略配置
 */

// 基础域名配置
const DOMAINS = {
  // 自身域名
  self: "'self'",
  
  // 后台API域名
  api: [
    '*.macrozheng.com',
    'localhost:8080',
    '127.0.0.1:8080'
  ],
  
  // 开发环境域名
  dev: [
    'localhost:*',
    '127.0.0.1:*',
    'ws://localhost:*',
    'ws://127.0.0.1:*'
  ],
  
  // Google服务域名
  google: [
    '*.googleapis.com',
    '*.googletagmanager.com',
    'fonts.googleapis.com',
    'fonts.gstatic.com'
  ],
  
  // 百度服务域名
  baidu: [
    '*.baidu.com',
    'hm.baidu.com'
  ],
  
  // CDN域名
  cdn: [
    'unpkg.com',
    '*.unpkg.com'
  ]
}

// CSP指令生成器
const CSPDirectives = {
  /**
   * 生成script-src指令
   * @param {boolean} isDev 是否为开发环境
   * @param {boolean} allowUnsafe 是否允许unsafe策略
   * @returns {string} script-src指令值
   */
  scriptSrc: (isDev = false, allowUnsafe = true) => {
    const sources = [DOMAINS.self]
    
    if (allowUnsafe) {
      sources.push("'unsafe-inline'", "'unsafe-eval'")
    }
    
    if (isDev) {
      sources.push(...DOMAINS.dev)
    }
    
    // 添加第三方脚本域名
    sources.push(...DOMAINS.google, ...DOMAINS.baidu)
    
    return sources.join(' ')
  },

  /**
   * 生成style-src指令
   * @param {boolean} isDev 是否为开发环境
   * @param {boolean} allowUnsafe 是否允许unsafe策略
   * @returns {string} style-src指令值
   */
  styleSrc: (isDev = false, allowUnsafe = true) => {
    const sources = [DOMAINS.self]
    
    if (allowUnsafe) {
      sources.push("'unsafe-inline'")
    }
    
    if (isDev) {
      sources.push(...DOMAINS.dev)
    }
    
    // 添加字体服务
    sources.push('fonts.googleapis.com')
    
    return sources.join(' ')
  },

  /**
   * 生成img-src指令
   * @param {boolean} isDev 是否为开发环境
   * @returns {string} img-src指令值
   */
  imgSrc: (isDev = false) => {
    const sources = [DOMAINS.self, 'data:', 'blob:']
    
    if (isDev) {
      sources.push(...DOMAINS.dev)
    }
    
    // 添加第三方图片源
    sources.push(...DOMAINS.google, ...DOMAINS.baidu)
    
    return sources.join(' ')
  },

  /**
   * 生成font-src指令
   * @param {boolean} isDev 是否为开发环境
   * @returns {string} font-src指令值
   */
  fontSrc: (isDev = false) => {
    const sources = [DOMAINS.self, 'data:']
    
    if (isDev) {
      sources.push(...DOMAINS.dev)
    }
    
    // 添加Google字体
    sources.push('fonts.gstatic.com')
    
    return sources.join(' ')
  },

  /**
   * 生成connect-src指令
   * @param {boolean} isDev 是否为开发环境
   * @returns {string} connect-src指令值
   */
  connectSrc: (isDev = false) => {
    const sources = [DOMAINS.self]
    
    if (isDev) {
      sources.push(...DOMAINS.dev)
    }
    
    // 添加API和第三方服务
    sources.push(...DOMAINS.api, ...DOMAINS.google, ...DOMAINS.baidu)
    
    return sources.join(' ')
  }
}

/**
 * 生成开发环境CSP策略
 * @param {Object} options 配置选项
 * @returns {Object} CSP策略对象
 */
function generateDevelopmentCSP(options = {}) {
  const {
    allowUnsafe = true,
    enableReporting = true,
    reportUri = null
  } = options

  const policy = {
    'default-src': DOMAINS.self,
    'script-src': CSPDirectives.scriptSrc(true, allowUnsafe),
    'style-src': CSPDirectives.styleSrc(true, allowUnsafe),
    'img-src': CSPDirectives.imgSrc(true),
    'font-src': CSPDirectives.fontSrc(true),
    'connect-src': CSPDirectives.connectSrc(true),
    'media-src': DOMAINS.self,
    'object-src': "'none'",
    'base-uri': DOMAINS.self,
    'form-action': DOMAINS.self,
    'frame-ancestors': "'none'",
    'upgrade-insecure-requests': ''
  }

  // 添加报告URI（开发环境可选）
  if (enableReporting && reportUri) {
    policy['report-uri'] = reportUri
  }

  return policy
}

/**
 * 生成生产环境CSP策略
 * @param {Object} options 配置选项
 * @returns {Object} CSP策略对象
 */
function generateProductionCSP(options = {}) {
  const {
    allowUnsafe = true, // 由于需要支持内联脚本，暂时保持true
    enableReporting = true,
    reportUri = '/api/csp-report'
  } = options

  const policy = {
    'default-src': DOMAINS.self,
    'script-src': CSPDirectives.scriptSrc(false, allowUnsafe),
    'style-src': CSPDirectives.styleSrc(false, allowUnsafe),
    'img-src': CSPDirectives.imgSrc(false),
    'font-src': CSPDirectives.fontSrc(false),
    'connect-src': CSPDirectives.connectSrc(false),
    'media-src': DOMAINS.self,
    'object-src': "'none'",
    'base-uri': DOMAINS.self,
    'form-action': DOMAINS.self,
    'frame-ancestors': "'none'",
    'upgrade-insecure-requests': ''
  }

  // 添加报告URI（生产环境推荐启用）
  if (enableReporting && reportUri) {
    policy['report-uri'] = reportUri
  }

  return policy
}

/**
 * 生成测试环境CSP策略
 * @param {Object} options 配置选项
 * @returns {Object} CSP策略对象
 */
function generateTestingCSP(options = {}) {
  // 测试环境策略介于开发和生产之间
  const devPolicy = generateDevelopmentCSP(options)
  const prodPolicy = generateProductionCSP(options)
  
  // 使用生产环境的严格策略，但保留开发环境的灵活性
  return {
    ...prodPolicy,
    'script-src': devPolicy['script-src'], // 保持开发环境的脚本策略
    'report-uri': options.reportUri || '/api/csp-report-test'
  }
}

/**
 * 将CSP策略对象转换为字符串
 * @param {Object} policy CSP策略对象
 * @returns {string} CSP策略字符串
 */
function policyToString(policy) {
  return Object.entries(policy)
    .filter(([_, value]) => value !== '')
    .map(([directive, value]) => `${directive} ${value}`)
    .join('; ')
}

/**
 * 验证CSP策略的有效性
 * @param {Object} policy CSP策略对象
 * @returns {Object} 验证结果
 */
function validatePolicy(policy) {
  const issues = []
  const warnings = []

  // 检查是否使用了不安全的策略
  Object.entries(policy).forEach(([directive, value]) => {
    if (typeof value === 'string') {
      if (value.includes("'unsafe-inline'")) {
        warnings.push(`${directive} contains 'unsafe-inline' which may pose security risks`)
      }
      if (value.includes("'unsafe-eval'")) {
        warnings.push(`${directive} contains 'unsafe-eval' which may pose security risks`)
      }
    }
  })

  // 检查必要的指令是否存在
  const requiredDirectives = ['default-src', 'script-src', 'style-src']
  requiredDirectives.forEach(directive => {
    if (!policy[directive]) {
      issues.push(`Missing required directive: ${directive}`)
    }
  })

  return {
    isValid: issues.length === 0,
    issues,
    warnings
  }
}

/**
 * 根据环境生成对应的CSP策略
 * @param {string} env 环境名称 ('development', 'production', 'testing')
 * @param {Object} options 配置选项
 * @returns {Object} 包含策略对象和字符串的结果
 */
function generateCSPForEnvironment(env, options = {}) {
  let policy

  switch (env) {
    case 'development':
      policy = generateDevelopmentCSP(options)
      break
    case 'production':
      policy = generateProductionCSP(options)
      break
    case 'testing':
      policy = generateTestingCSP(options)
      break
    default:
      throw new Error(`Unsupported environment: ${env}`)
  }

  const validation = validatePolicy(policy)
  const policyString = policyToString(policy)

  return {
    policy,
    policyString,
    validation,
    environment: env
  }
}

module.exports = {
  DOMAINS,
  CSPDirectives,
  generateDevelopmentCSP,
  generateProductionCSP,
  generateTestingCSP,
  generateCSPForEnvironment,
  policyToString,
  validatePolicy
}