'use strict'

/**
 * CSP环境配置
 * 为不同环境提供特定的CSP配置选项
 */

const baseConfig = {
  // 基础域名配置
  domains: {
    // 后台API域名（根据实际情况修改）
    api: [
      '*.macrozheng.com',
      'localhost:8080',
      '127.0.0.1:8080'
    ],
    
    // CDN域名
    cdn: [
      'unpkg.com',
      '*.unpkg.com',
      'cdn.jsdelivr.net',
      '*.jsdelivr.net'
    ]
  },
  
  // 报告配置
  reporting: {
    // 开发环境报告端点
    devReportUri: '/api/csp-report-dev',
    
    // 测试环境报告端点
    testReportUri: '/api/csp-report-test',
    
    // 生产环境报告端点
    prodReportUri: '/api/csp-report'
  }
}

// 开发环境配置
const developmentConfig = {
  ...baseConfig,
  
  // CSP选项
  cspOptions: {
    allowUnsafe: true, // 开发环境允许不安全的内联脚本
    enableReporting: true,
    reportUri: baseConfig.reporting.devReportUri
  },
  
  // Webpack插件选项
  pluginOptions: {
    reportOnly: true, // 开发环境使用report-only模式
    verbose: true,
    validate: false // 开发环境不强制验证
  }
}

// 测试环境配置
const testingConfig = {
  ...baseConfig,
  
  // CSP选项
  cspOptions: {
    allowUnsafe: true, // 测试环境暂时允许不安全策略
    enableReporting: true,
    reportUri: baseConfig.reporting.testReportUri
  },
  
  // Webpack插件选项
  pluginOptions: {
    reportOnly: false, // 测试环境使用强制模式
    verbose: true,
    validate: true
  }
}

// 生产环境配置
const productionConfig = {
  ...baseConfig,
  
  // CSP选项
  cspOptions: {
    allowUnsafe: true, // 由于现有代码依赖，暂时保持true
    enableReporting: true,
    reportUri: baseConfig.reporting.prodReportUri
  },
  
  // Webpack插件选项
  pluginOptions: {
    reportOnly: false, // 生产环境使用强制模式
    verbose: false,
    validate: true
  }
}

// 导出配置
module.exports = {
  base: baseConfig,
  development: developmentConfig,
  testing: testingConfig,
  production: productionConfig,
  
  // 获取当前环境配置的辅助函数
  getCurrentConfig() {
    const env = process.env.NODE_ENV || 'development'
    return this[env] || this.development
  }
}