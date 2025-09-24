/**
 * Vuex模块懒加载工具
 * 支持按需加载业务模块，减少初始化时间
 */

// 模块加载状态
const moduleLoadState = {
  loaded: new Set(),
  loading: new Set(),
  failed: new Set()
}

// 模块依赖关系
const moduleDependencies = {
  pms: [], // 商品管理无依赖
  oms: [], // 订单管理无依赖
  sms: [], // 营销管理无依赖
  ums: [], // 用户权限管理无依赖
}

// 模块加载器映射
const moduleLoaders = {
  pms: () => import('../modules/pms'),
  oms: () => import('../modules/oms'),
  sms: () => import('../modules/sms'),
  ums: () => import('../modules/ums')
}

// 路由到模块的映射
const routeModuleMapping = {
  '/pms': ['pms'],
  '/product': ['pms'],
  '/brand': ['pms'],
  '/productCate': ['pms'],
  '/productAttr': ['pms'],
  
  '/oms': ['oms'],
  '/order': ['oms'],
  '/returnApply': ['oms'],
  '/returnReason': ['oms'],
  
  '/sms': ['sms'],
  '/coupon': ['sms'],
  '/flash': ['sms'],
  '/advertise': ['sms'],
  '/subject': ['sms'],
  
  '/ums': ['ums'],
  '/admin': ['ums'],
  '/role': ['ums'],
  '/menu': ['ums'],
  '/resource': ['ums']
}

/**
 * 检查模块是否已加载
 * @param {string} moduleName 模块名称
 * @returns {boolean}
 */
function isModuleLoaded(moduleName) {
  return moduleLoadState.loaded.has(moduleName)
}

/**
 * 检查模块是否正在加载
 * @param {string} moduleName 模块名称
 * @returns {boolean}
 */
function isModuleLoading(moduleName) {
  return moduleLoadState.loading.has(moduleName)
}

/**
 * 检查模块是否加载失败
 * @param {string} moduleName 模块名称
 * @returns {boolean}
 */
function isModuleFailed(moduleName) {
  return moduleLoadState.failed.has(moduleName)
}

/**
 * 获取模块加载状态
 * @param {string} moduleName 模块名称
 * @returns {string} 'loaded' | 'loading' | 'failed' | 'not-loaded'
 */
function getModuleLoadState(moduleName) {
  if (isModuleLoaded(moduleName)) return 'loaded'
  if (isModuleLoading(moduleName)) return 'loading'
  if (isModuleFailed(moduleName)) return 'failed'
  return 'not-loaded'
}

/**
 * 解析模块依赖
 * @param {string} moduleName 模块名称
 * @returns {string[]} 依赖的模块列表
 */
function resolveDependencies(moduleName) {
  const dependencies = []
  const visited = new Set()
  
  function traverse(name) {
    if (visited.has(name)) return
    visited.add(name)
    
    const deps = moduleDependencies[name] || []
    deps.forEach(dep => {
      traverse(dep)
      if (!dependencies.includes(dep)) {
        dependencies.push(dep)
      }
    })
  }
  
  traverse(moduleName)
  return dependencies
}

/**
 * 动态加载单个模块
 * @param {Object} store Vuex store实例
 * @param {string} moduleName 模块名称
 * @returns {Promise<boolean>} 加载是否成功
 */
async function loadModule(store, moduleName) {
  // 检查模块是否已存在
  if (store.hasModule(moduleName)) {
    moduleLoadState.loaded.add(moduleName)
    return true
  }
  
  // 检查是否正在加载
  if (isModuleLoading(moduleName)) {
    // 等待当前加载完成
    while (isModuleLoading(moduleName)) {
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    return isModuleLoaded(moduleName)
  }
  
  // 检查是否有加载器
  const loader = moduleLoaders[moduleName]
  if (!loader) {
    console.warn(`No loader found for module: ${moduleName}`)
    return false
  }
  
  try {
    moduleLoadState.loading.add(moduleName)
    moduleLoadState.failed.delete(moduleName)
    
    console.log(`Loading module: ${moduleName}`)
    
    // 加载依赖模块
    const dependencies = resolveDependencies(moduleName)
    for (const dep of dependencies) {
      if (!isModuleLoaded(dep)) {
        const success = await loadModule(store, dep)
        if (!success) {
          throw new Error(`Failed to load dependency: ${dep}`)
        }
      }
    }
    
    // 动态导入模块
    const moduleDefinition = await loader()
    const module = moduleDefinition.default || moduleDefinition
    
    // 注册模块到store
    store.registerModule(moduleName, module)
    
    moduleLoadState.loaded.add(moduleName)
    moduleLoadState.loading.delete(moduleName)
    
    console.log(`Module loaded successfully: ${moduleName}`)
    
    // 触发模块加载完成事件
    store.dispatch('notification/showSuccess', {
      title: '模块加载',
      content: `${moduleName}模块加载完成`,
      autoClose: true
    }).catch(() => {}) // 忽略错误，因为notification模块可能还未加载
    
    return true
    
  } catch (error) {
    console.error(`Failed to load module ${moduleName}:`, error)
    
    moduleLoadState.failed.add(moduleName)
    moduleLoadState.loading.delete(moduleName)
    
    return false
  }
}

/**
 * 批量加载多个模块
 * @param {Object} store Vuex store实例
 * @param {string[]} moduleNames 模块名称列表
 * @returns {Promise<Object>} 加载结果 { success: string[], failed: string[] }
 */
async function loadModules(store, moduleNames) {
  const results = {
    success: [],
    failed: []
  }
  
  // 并发加载所有模块
  const loadPromises = moduleNames.map(async (moduleName) => {
    const success = await loadModule(store, moduleName)
    if (success) {
      results.success.push(moduleName)
    } else {
      results.failed.push(moduleName)
    }
    return { moduleName, success }
  })
  
  await Promise.all(loadPromises)
  
  return results
}

/**
 * 根据路由路径加载相关模块
 * @param {Object} store Vuex store实例
 * @param {string} routePath 路由路径
 * @returns {Promise<boolean>} 是否成功加载所有相关模块
 */
async function loadModulesForRoute(store, routePath) {
  const requiredModules = []
  
  // 查找路由对应的模块
  Object.keys(routeModuleMapping).forEach(pattern => {
    if (routePath.startsWith(pattern)) {
      requiredModules.push(...routeModuleMapping[pattern])
    }
  })
  
  if (requiredModules.length === 0) {
    return true // 无需加载模块
  }
  
  // 去重
  const uniqueModules = [...new Set(requiredModules)]
  
  // 过滤已加载的模块
  const unloadedModules = uniqueModules.filter(moduleName => !isModuleLoaded(moduleName))
  
  if (unloadedModules.length === 0) {
    return true // 所有模块都已加载
  }
  
  console.log(`Loading modules for route ${routePath}:`, unloadedModules)
  
  const result = await loadModules(store, unloadedModules)
  
  if (result.failed.length > 0) {
    console.error(`Failed to load modules for route ${routePath}:`, result.failed)
    return false
  }
  
  return true
}

/**
 * 预加载模块
 * @param {Object} store Vuex store实例
 * @param {string[]} moduleNames 要预加载的模块名称列表
 */
async function preloadModules(store, moduleNames = []) {
  const defaultPreloadModules = ['pms'] // 默认预加载商品管理模块
  const modulesToPreload = moduleNames.length > 0 ? moduleNames : defaultPreloadModules
  
  console.log('Preloading modules:', modulesToPreload)
  
  // 延迟预加载，避免影响初始化性能
  setTimeout(async () => {
    await loadModules(store, modulesToPreload)
  }, 2000)
}

/**
 * 卸载模块
 * @param {Object} store Vuex store实例
 * @param {string} moduleName 模块名称
 */
function unloadModule(store, moduleName) {
  if (store.hasModule(moduleName)) {
    store.unregisterModule(moduleName)
    moduleLoadState.loaded.delete(moduleName)
    moduleLoadState.loading.delete(moduleName)
    moduleLoadState.failed.delete(moduleName)
    
    console.log(`Module unloaded: ${moduleName}`)
  }
}

/**
 * 获取所有模块的加载状态
 * @returns {Object} 模块加载状态统计
 */
function getModuleLoadStatistics() {
  const allModules = Object.keys(moduleLoaders)
  
  return {
    total: allModules.length,
    loaded: moduleLoadState.loaded.size,
    loading: moduleLoadState.loading.size,
    failed: moduleLoadState.failed.size,
    notLoaded: allModules.length - moduleLoadState.loaded.size - moduleLoadState.loading.size - moduleLoadState.failed.size,
    modules: {
      loaded: Array.from(moduleLoadState.loaded),
      loading: Array.from(moduleLoadState.loading),
      failed: Array.from(moduleLoadState.failed),
      notLoaded: allModules.filter(name => 
        !moduleLoadState.loaded.has(name) && 
        !moduleLoadState.loading.has(name) && 
        !moduleLoadState.failed.has(name)
      )
    }
  }
}

/**
 * 创建模块懒加载插件
 * @param {Object} options 配置选项
 * @returns {Function} Vuex插件函数
 */
function createLazyLoadPlugin(options = {}) {
  const {
    preload = [],
    autoPreload = true,
    preloadDelay = 2000
  } = options
  
  return (store) => {
    // 添加模块加载器到store实例
    store.$moduleLoader = {
      loadModule: (moduleName) => loadModule(store, moduleName),
      loadModules: (moduleNames) => loadModules(store, moduleNames),
      loadModulesForRoute: (routePath) => loadModulesForRoute(store, routePath),
      preloadModules: (moduleNames) => preloadModules(store, moduleNames),
      unloadModule: (moduleName) => unloadModule(store, moduleName),
      isModuleLoaded,
      isModuleLoading,
      isModuleFailed,
      getModuleLoadState,
      getModuleLoadStatistics
    }
    
    // 自动预加载
    if (autoPreload) {
      setTimeout(() => {
        preloadModules(store, preload)
      }, preloadDelay)
    }
  }
}

export {
  loadModule,
  loadModules,
  loadModulesForRoute,
  preloadModules,
  unloadModule,
  isModuleLoaded,
  isModuleLoading,
  isModuleFailed,
  getModuleLoadState,
  getModuleLoadStatistics,
  createLazyLoadPlugin
}

export default {
  loadModule,
  loadModules,
  loadModulesForRoute,
  preloadModules,
  unloadModule,
  isModuleLoaded,
  isModuleLoading,
  isModuleFailed,
  getModuleLoadState,
  getModuleLoadStatistics,
  createLazyLoadPlugin
}