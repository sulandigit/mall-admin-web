import logger, { OPERATION_TYPES } from './logger'

/**
 * HTTP请求拦截器
 * 自动记录API调用日志
 */

/**
 * 获取模块名称
 * @param {string} url 请求URL
 * @returns {string} 模块名称
 */
function getModuleName(url) {
  const moduleMap = {
    '/api/brand': '品牌管理',
    '/api/product': '商品管理',
    '/api/order': '订单管理',
    '/api/coupon': '优惠券管理',
    '/api/admin': '用户管理',
    '/api/role': '角色管理',
    '/api/menu': '菜单管理',
    '/api/resource': '资源管理',
    '/api/logs': '日志管理',
    '/api/audit': '审计管理'
  }
  
  for (const [pattern, name] of Object.entries(moduleMap)) {
    if (url.includes(pattern)) {
      return name
    }
  }
  
  return '系统操作'
}

/**
 * 获取操作类型
 * @param {string} method HTTP方法
 * @param {string} url 请求URL
 * @returns {string} 操作类型
 */
function getOperationType(method, url) {
  const upperMethod = method.toUpperCase()
  
  if (url.includes('/login')) return OPERATION_TYPES.LOGIN
  if (url.includes('/logout')) return OPERATION_TYPES.LOGOUT
  if (url.includes('/export')) return OPERATION_TYPES.EXPORT
  if (url.includes('/batch')) return OPERATION_TYPES.BATCH
  
  switch (upperMethod) {
    case 'GET':
      return OPERATION_TYPES.QUERY
    case 'POST':
      return OPERATION_TYPES.CREATE
    case 'PUT':
    case 'PATCH':
      return OPERATION_TYPES.UPDATE
    case 'DELETE':
      return OPERATION_TYPES.DELETE
    default:
      return 'UNKNOWN'
  }
}

/**
 * 生成操作描述
 * @param {string} method HTTP方法
 * @param {string} url 请求URL
 * @param {string} moduleName 模块名称
 * @returns {string} 操作描述
 */
function getOperationDesc(method, url, moduleName) {
  const operationType = getOperationType(method, url)
  
  const descMap = {
    [OPERATION_TYPES.LOGIN]: '用户登录',
    [OPERATION_TYPES.LOGOUT]: '用户登出',
    [OPERATION_TYPES.CREATE]: `创建${moduleName}`,
    [OPERATION_TYPES.UPDATE]: `更新${moduleName}`,
    [OPERATION_TYPES.DELETE]: `删除${moduleName}`,
    [OPERATION_TYPES.QUERY]: `查询${moduleName}`,
    [OPERATION_TYPES.EXPORT]: `导出${moduleName}`,
    [OPERATION_TYPES.BATCH]: `批量操作${moduleName}`
  }
  
  return descMap[operationType] || `${method} ${url}`
}

/**
 * 是否需要记录日志
 * @param {string} url 请求URL
 * @returns {boolean} 是否记录
 */
function shouldLog(url) {
  const excludePatterns = [
    '/api/logs', // 避免日志接口的无限循环
    '/api/auth/check', // 认证检查
    '/api/health', // 健康检查
    '/api/static' // 静态资源
  ]
  
  return !excludePatterns.some(pattern => url.includes(pattern))
}

/**
 * 请求拦截器
 * @param {Object} config axios请求配置
 * @returns {Object} 修改后的配置
 */
export function requestInterceptor(config) {
  // 记录请求开始时间
  config.startTime = Date.now()
  
  // 为每个请求生成唯一ID
  config.requestId = 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  
  return config
}

/**
 * 响应拦截器
 * @param {Object} response axios响应对象
 * @returns {Object} 响应数据
 */
export function responseInterceptor(response) {
  const config = response.config
  const endTime = Date.now()
  const duration = endTime - (config.startTime || endTime)
  
  // 检查是否需要记录日志
  if (shouldLog(config.url)) {
    const moduleName = getModuleName(config.url)
    const operationType = getOperationType(config.method, config.url)
    const operationDesc = getOperationDesc(config.method, config.url, moduleName)
    
    // 记录成功的操作日志
    logger.log({
      operationType,
      moduleName,
      operationDesc,
      requestMethod: config.method?.toUpperCase(),
      requestUrl: config.url,
      requestParam: config.data || config.params,
      responseData: response.data,
      duration,
      status: 'SUCCESS'
    })
  }
  
  return response
}

/**
 * 错误拦截器
 * @param {Object} error axios错误对象
 * @returns {Promise} 拒绝的Promise
 */
export function errorInterceptor(error) {
  const config = error.config
  const endTime = Date.now()
  const duration = endTime - (config?.startTime || endTime)
  
  // 检查是否需要记录日志
  if (config && shouldLog(config.url)) {
    const moduleName = getModuleName(config.url)
    const operationType = getOperationType(config.method, config.url)
    const operationDesc = getOperationDesc(config.method, config.url, moduleName)
    
    // 记录失败的操作日志
    logger.log({
      operationType,
      moduleName,
      operationDesc,
      requestMethod: config.method?.toUpperCase(),
      requestUrl: config.url,
      requestParam: config.data || config.params,
      responseData: error.response?.data,
      duration,
      status: 'FAILED',
      errorMsg: error.message || error.toString()
    })
  }
  
  return Promise.reject(error)
}

/**
 * 安装拦截器到axios实例
 * @param {Object} axiosInstance axios实例
 */
export function installInterceptors(axiosInstance) {
  // 请求拦截器
  axiosInstance.interceptors.request.use(
    requestInterceptor,
    error => {
      console.error('请求拦截器错误:', error)
      return Promise.reject(error)
    }
  )
  
  // 响应拦截器
  axiosInstance.interceptors.response.use(
    responseInterceptor,
    errorInterceptor
  )
}

export default {
  requestInterceptor,
  responseInterceptor,
  errorInterceptor,
  installInterceptors
}