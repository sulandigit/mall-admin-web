// 測試設置文件 - 配置全域測試環境 2025
import { config } from '@vue/test-utils'

// 模擬全域組件和插件 2025
config.global.mocks = {
  $t: (key) => key, // 模擬多語言翻譯函數 2025
  $router: {
    push: jest.fn(),
    replace: jest.fn()
  },
  $route: {
    path: '/',
    params: {},
    query: {}
  }
}

// 全域測試配置 2025
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn()
}