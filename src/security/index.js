/**
 * 安全工具模块
 * 提供CSRF防护和其他安全功能的便捷接口
 */
import CSRFManager from './csrf-manager'
import TokenGenerator from './token-generator'
import TokenValidator from './token-validator'
import TokenStorage from './token-storage'

/**
 * 全局CSRF管理器实例
 */
let globalCSRFManager = null

/**
 * 初始化全局CSRF管理器
 * @param {object} config - 配置选项
 * @returns {CSRFManager} CSRF管理器实例
 */
export function initCSRF(config = {}) {
  if (!globalCSRFManager) {
    globalCSRFManager = new CSRFManager(config)
  }
  return globalCSRFManager
}

/**
 * 获取全局CSRF管理器
 * @returns {CSRFManager|null} CSRF管理器实例
 */
export function getCSRFManager() {
  return globalCSRFManager
}

/**
 * 获取CSRF令牌
 * @returns {Promise<string>} CSRF令牌
 */
export async function getCSRFToken() {
  if (!globalCSRFManager) {
    throw new Error('CSRF manager not initialized. Call initCSRF() first.')
  }
  return await globalCSRFManager.getToken()
}

/**
 * 验证CSRF令牌
 * @param {string} token - 要验证的令牌
 * @param {object} options - 验证选项
 * @returns {Promise<object>} 验证结果
 */
export async function validateCSRFToken(token, options = {}) {
  if (!globalCSRFManager) {
    throw new Error('CSRF manager not initialized. Call initCSRF() first.')
  }
  return await globalCSRFManager.validateToken(token, options)
}

/**
 * 刷新CSRF令牌
 * @param {object} options - 刷新选项
 * @returns {Promise<string>} 新的CSRF令牌
 */
export async function refreshCSRFToken(options = {}) {
  if (!globalCSRFManager) {
    throw new Error('CSRF manager not initialized. Call initCSRF() first.')
  }
  return await globalCSRFManager.refreshToken(options)
}

/**
 * 清除CSRF令牌
 * @returns {Promise<void>}
 */
export async function clearCSRFToken() {
  if (!globalCSRFManager) {
    return
  }
  await globalCSRFManager.clearToken()
}

/**
 * 获取CSRF令牌请求头
 * @returns {Promise<object>} 请求头对象
 */
export async function getCSRFHeader() {
  if (!globalCSRFManager) {
    throw new Error('CSRF manager not initialized. Call initCSRF() first.')
  }
  return await globalCSRFManager.getTokenHeader()
}

/**
 * 创建带CSRF保护的表单数据
 * @param {object} formData - 表单数据
 * @returns {Promise<object>} 包含CSRF令牌的表单数据
 */
export async function createSecureFormData(formData = {}) {
  try {
    const token = await getCSRFToken()
    return {
      ...formData,
      _csrf: token
    }
  } catch (error) {
    console.error('Failed to create secure form data:', error)
    return formData
  }
}

/**
 * 创建安全的Ajax请求配置
 * @param {object} config - 请求配置
 * @returns {Promise<object>} 包含CSRF令牌的请求配置
 */
export async function createSecureRequestConfig(config = {}) {
  try {
    const csrfHeader = await getCSRFHeader()
    return {
      ...config,
      headers: {
        ...config.headers,
        ...csrfHeader,
        'X-Requested-With': 'XMLHttpRequest'
      }
    }
  } catch (error) {
    console.error('Failed to create secure request config:', error)
    return config
  }
}

/**
 * 处理CSRF错误
 * @param {object} error - 错误对象
 * @param {object} options - 处理选项
 * @returns {Promise<any>} 处理结果
 */
export async function handleCSRFError(error, options = {}) {
  if (!globalCSRFManager) {
    throw error
  }

  if (error.isCSRFError || error.code?.includes('CSRF')) {
    try {
      const newToken = await globalCSRFManager.handleTokenError(error)
      
      if (options.onTokenRefresh) {
        options.onTokenRefresh(newToken)
      }
      
      return newToken
    } catch (retryError) {
      if (options.onError) {
        options.onError(retryError)
      }
      throw retryError
    }
  }
  
  throw error
}

/**
 * 检查CSRF功能是否可用
 * @returns {boolean} 是否可用
 */
export function isCSRFAvailable() {
  return globalCSRFManager !== null
}

/**
 * 获取CSRF状态信息
 * @returns {object} 状态信息
 */
export function getCSRFStatus() {
  if (!globalCSRFManager) {
    return {
      initialized: false,
      hasToken: false,
      strategy: null
    }
  }

  return {
    initialized: true,
    hasToken: !!globalCSRFManager.currentToken,
    strategy: globalCSRFManager.config.strategy,
    storageType: globalCSRFManager.config.storageType,
    autoRefresh: globalCSRFManager.config.autoRefresh
  }
}

/**
 * 销毁CSRF管理器
 */
export function destroyCSRF() {
  if (globalCSRFManager) {
    globalCSRFManager.destroy()
    globalCSRFManager = null
  }
}

// 导出核心类，供高级用户使用
export {
  CSRFManager,
  TokenGenerator,
  TokenValidator,
  TokenStorage
}

// 导出配置和初始化
export * from './csrf-config'
export * from './csrf-init'