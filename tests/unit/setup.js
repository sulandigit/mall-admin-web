/**
 * Jest测试设置文件
 * 为测试环境提供必要的配置和模拟
 */

// 模拟crypto-js（如果在测试环境中不可用）
jest.mock('crypto-js', () => ({
  SHA256: jest.fn((data) => ({
    toString: jest.fn(() => 'mocked-sha256-hash-' + Math.random().toString(36))
  })),
  HmacSHA256: jest.fn((data, key) => ({
    toString: jest.fn(() => 'mocked-hmac-sha256-' + Math.random().toString(36))
  })),
  lib: {
    WordArray: {
      random: jest.fn((bytes) => ({
        words: [Math.floor(Math.random() * 1000000)]
      }))
    }
  }
}))

// 模拟js-cookie
jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn()
}))

// 模拟浏览器存储API
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
}

const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
})

// 模拟console方法（可选，用于减少测试输出噪音）
const originalConsoleError = console.error
const originalConsoleWarn = console.warn
const originalConsoleInfo = console.info

beforeEach(() => {
  // 重置所有模拟
  jest.clearAllMocks()
  
  // 重置存储模拟
  localStorageMock.clear.mockClear()
  sessionStorageMock.clear.mockClear()
  
  // 可以选择性地静默某些console输出
  if (process.env.SILENT_TESTS) {
    console.error = jest.fn()
    console.warn = jest.fn()
    console.info = jest.fn()
  }
})

afterEach(() => {
  // 恢复console方法
  if (process.env.SILENT_TESTS) {
    console.error = originalConsoleError
    console.warn = originalConsoleWarn
    console.info = originalConsoleInfo
  }
})

// 全局测试工具函数
global.testUtils = {
  // 创建模拟的Vue组件实例
  createMockVueInstance: () => ({
    $store: {
      dispatch: jest.fn(),
      getters: {},
      commit: jest.fn()
    },
    $emit: jest.fn(),
    $message: {
      error: jest.fn(),
      success: jest.fn(),
      warning: jest.fn()
    }
  }),
  
  // 等待异步操作完成
  waitForAsync: (ms = 0) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // 生成测试用的随机字符串
  generateRandomString: (length = 10) => {
    return Math.random().toString(36).substring(2, length + 2)
  },
  
  // 模拟网络请求错误
  createNetworkError: (code = 'NETWORK_ERROR', message = 'Network error') => {
    const error = new Error(message)
    error.code = code
    error.isCSRFError = code.includes('CSRF')
    return error
  }
}

// 设置默认超时
jest.setTimeout(10000)

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason)
  // 在测试中，我们可能想要让这些失败
  if (process.env.NODE_ENV === 'test') {
    throw reason
  }
})

console.log('Jest setup completed for CSRF security tests')