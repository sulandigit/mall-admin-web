/**
 * Jest测试配置
 * 专门为CSRF安全模块测试配置
 */
module.exports = {
  // 测试环境
  testEnvironment: 'jsdom',
  
  // 模块路径映射
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // 测试文件匹配模式
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.js',
    '<rootDir>/tests/unit/**/*.spec.js'
  ],
  
  // 收集覆盖率的文件
  collectCoverageFrom: [
    'src/security/**/*.{js,vue}',
    '!src/security/index.js',
    '!**/node_modules/**'
  ],
  
  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/security/csrf-manager.js': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './src/security/token-generator.js': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/security/token-validator.js': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  
  // 设置文件
  setupFilesAfterEnv: [
    '<rootDir>/tests/unit/setup.js'
  ],
  
  // 转换配置
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '^.+\\.js$': 'babel-jest'
  },
  
  // 模块文件扩展名
  moduleFileExtensions: [
    'js',
    'json',
    'vue'
  ],
  
  // 忽略的转换模式
  transformIgnorePatterns: [
    'node_modules/(?!(crypto-js)/)'
  ],
  
  // 测试超时
  testTimeout: 10000,
  
  // 清除模拟
  clearMocks: true,
  
  // 恢复模拟
  restoreMocks: true,
  
  // 详细输出
  verbose: true,
  
  // 覆盖率报告格式
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],
  
  // 覆盖率输出目录
  coverageDirectory: '<rootDir>/tests/coverage',
  
  // 全局变量
  globals: {
    'vue-jest': {
      babelConfig: {
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                node: 'current'
              }
            }
          ]
        ]
      }
    }
  }
}