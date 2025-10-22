module.exports = {
  // 測試環境配置 2025
  testEnvironment: 'jsdom',
  
  // 模塊文件擴展名 2025
  moduleFileExtensions: ['js', 'json', 'vue'],
  
  // 轉換配置 2025
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '^.+\\.js$': 'babel-jest'
  },
  
  // 模塊名稱映射 2025
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // 收集覆蓋率的文件 2025
  collectCoverageFrom: [
    'src/**/*.{js,vue}',
    '!src/main.js',
    '!**/node_modules/**'
  ],
  
  // 測試文件匹配模式 2025
  testMatch: [
    '**/tests/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)'
  ],
  
  // 設置文件 2025
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
}