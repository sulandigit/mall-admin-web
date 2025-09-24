/**
 * Vuex状态持久化插件
 * 支持自动持久化指定模块的状态到localStorage/sessionStorage
 */

// 默认配置
const defaultOptions = {
  // 持久化键前缀
  keyPrefix: 'mall-admin-',
  
  // 存储类型
  storage: 'local', // 'local' | 'session'
  
  // 需要持久化的模块配置
  modules: {
    app: {
      paths: ['sidebar', 'language', 'theme', 'size'],
      storage: 'local'
    },
    user: {
      paths: ['token', 'userInfo', 'loginTime'],
      storage: 'local',
      expires: 7 * 24 * 60 * 60 * 1000 // 7天过期
    },
    ui: {
      paths: ['fixedHeader', 'showTagsView'],
      storage: 'local'
    },
    common: {
      paths: ['configs', 'dictionaries'],
      storage: 'local',
      expires: 24 * 60 * 60 * 1000 // 24小时过期
    }
  },
  
  // 白名单mutations（不触发持久化）
  whitelist: [],
  
  // 黑名单mutations（不持久化这些mutations的变更）
  blacklist: [
    'SET_LOADING',
    'UPDATE_LAST_ACTIVITY',
    'SET_CLEANUP_TASK_RUNNING'
  ]
}

// 获取存储对象
function getStorage(storageType) {
  switch (storageType) {
    case 'session':
      return sessionStorage
    case 'local':
    default:
      return localStorage
  }
}

// 序列化数据
function serialize(data, expires) {
  const serializedData = {
    data,
    timestamp: Date.now()
  }
  
  if (expires) {
    serializedData.expires = Date.now() + expires
  }
  
  return JSON.stringify(serializedData)
}

// 反序列化数据
function deserialize(serializedData) {
  try {
    const parsed = JSON.parse(serializedData)
    
    // 检查是否过期
    if (parsed.expires && parsed.expires < Date.now()) {
      return null
    }
    
    return parsed.data
  } catch (error) {
    console.warn('Failed to deserialize data:', error)
    return null
  }
}

// 从对象路径获取值
function getValueByPath(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined
  }, obj)
}

// 设置对象路径的值
function setValueByPath(obj, path, value) {
  const keys = path.split('.')
  const lastKey = keys.pop()
  const target = keys.reduce((current, key) => {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {}
    }
    return current[key]
  }, obj)
  
  target[lastKey] = value
}

// 持久化指定模块的状态
function persistState(moduleName, state, config, options) {
  const storage = getStorage(config.storage || options.storage)
  const key = `${options.keyPrefix}${moduleName}`
  
  try {
    let dataToSave = {}
    
    if (config.paths && config.paths.length > 0) {
      // 只保存指定路径的数据
      config.paths.forEach(path => {
        const value = getValueByPath(state, path)
        if (value !== undefined) {
          setValueByPath(dataToSave, path, value)
        }
      })
    } else {
      // 保存整个模块状态
      dataToSave = state
    }
    
    const serializedData = serialize(dataToSave, config.expires)
    storage.setItem(key, serializedData)
  } catch (error) {
    console.warn(`Failed to persist state for module ${moduleName}:`, error)
  }
}

// 恢复指定模块的状态
function restoreState(moduleName, config, options) {
  const storage = getStorage(config.storage || options.storage)
  const key = `${options.keyPrefix}${moduleName}`
  
  try {
    const serializedData = storage.getItem(key)
    if (serializedData) {
      const data = deserialize(serializedData)
      return data
    }
  } catch (error) {
    console.warn(`Failed to restore state for module ${moduleName}:`, error)
    // 清除损坏的数据
    storage.removeItem(key)
  }
  
  return null
}

// 清除指定模块的持久化数据
function clearPersistedState(moduleName, config, options) {
  const storage = getStorage(config.storage || options.storage)
  const key = `${options.keyPrefix}${moduleName}`
  storage.removeItem(key)
}

// 检查mutation是否应该被持久化
function shouldPersist(mutation, options) {
  const { type } = mutation
  
  // 检查白名单
  if (options.whitelist.length > 0) {
    return options.whitelist.some(pattern => {
      if (typeof pattern === 'string') {
        return type === pattern
      } else if (pattern instanceof RegExp) {
        return pattern.test(type)
      }
      return false
    })
  }
  
  // 检查黑名单
  if (options.blacklist.length > 0) {
    return !options.blacklist.some(pattern => {
      if (typeof pattern === 'string') {
        return type === pattern
      } else if (pattern instanceof RegExp) {
        return pattern.test(type)
      }
      return false
    })
  }
  
  return true
}

// 获取mutation所属的模块名
function getModuleName(mutation) {
  const { type } = mutation
  const parts = type.split('/')
  return parts.length > 1 ? parts[0] : null
}

// 创建持久化插件
function createPersistencePlugin(userOptions = {}) {
  const options = {
    ...defaultOptions,
    ...userOptions,
    modules: {
      ...defaultOptions.modules,
      ...userOptions.modules
    }
  }
  
  return (store) => {
    // 恢复持久化的状态
    Object.keys(options.modules).forEach(moduleName => {
      const config = options.modules[moduleName]
      const persistedState = restoreState(moduleName, config, options)
      
      if (persistedState) {
        try {
          // 使用replaceState恢复状态
          const currentState = store.state
          if (config.paths && config.paths.length > 0) {
            // 只恢复指定路径的数据
            config.paths.forEach(path => {
              const value = getValueByPath(persistedState, path)
              if (value !== undefined && currentState[moduleName]) {
                setValueByPath(currentState[moduleName], path, value)
              }
            })
          } else {
            // 恢复整个模块状态
            if (currentState[moduleName]) {
              Object.assign(currentState[moduleName], persistedState)
            }
          }
        } catch (error) {
          console.warn(`Failed to restore state for module ${moduleName}:`, error)
        }
      }
    })
    
    // 监听mutations，自动持久化状态
    store.subscribe((mutation, state) => {
      if (!shouldPersist(mutation, options)) {
        return
      }
      
      const moduleName = getModuleName(mutation)
      if (moduleName && options.modules[moduleName]) {
        const config = options.modules[moduleName]
        persistState(moduleName, state[moduleName], config, options)
      }
    })
    
    // 提供手动持久化方法
    store.$persistence = {
      // 手动持久化指定模块
      persistModule(moduleName) {
        if (options.modules[moduleName]) {
          const config = options.modules[moduleName]
          const state = store.state[moduleName]
          if (state) {
            persistState(moduleName, state, config, options)
          }
        }
      },
      
      // 手动恢复指定模块
      restoreModule(moduleName) {
        if (options.modules[moduleName]) {
          const config = options.modules[moduleName]
          const persistedState = restoreState(moduleName, config, options)
          
          if (persistedState) {
            // 这里需要通过mutations来更新状态
            // 具体实现依赖于各模块的mutations
            console.log(`Restored state for module ${moduleName}:`, persistedState)
          }
        }
      },
      
      // 清除指定模块的持久化数据
      clearModule(moduleName) {
        if (options.modules[moduleName]) {
          const config = options.modules[moduleName]
          clearPersistedState(moduleName, config, options)
        }
      },
      
      // 清除所有持久化数据
      clearAll() {
        Object.keys(options.modules).forEach(moduleName => {
          const config = options.modules[moduleName]
          clearPersistedState(moduleName, config, options)
        })
      },
      
      // 获取持久化配置
      getConfig() {
        return options
      },
      
      // 检查模块是否有持久化数据
      hasPersistedData(moduleName) {
        if (options.modules[moduleName]) {
          const config = options.modules[moduleName]
          const storage = getStorage(config.storage || options.storage)
          const key = `${options.keyPrefix}${moduleName}`
          return storage.getItem(key) !== null
        }
        return false
      },
      
      // 获取持久化数据的元信息
      getPersistedInfo(moduleName) {
        if (options.modules[moduleName]) {
          const config = options.modules[moduleName]
          const storage = getStorage(config.storage || options.storage)
          const key = `${options.keyPrefix}${moduleName}`
          const serializedData = storage.getItem(key)
          
          if (serializedData) {
            try {
              const parsed = JSON.parse(serializedData)
              return {
                timestamp: parsed.timestamp,
                expires: parsed.expires,
                isExpired: parsed.expires ? parsed.expires < Date.now() : false,
                size: serializedData.length
              }
            } catch (error) {
              return null
            }
          }
        }
        return null
      }
    }
  }
}

export default createPersistencePlugin
export {
  createPersistencePlugin,
  defaultOptions,
  serialize,
  deserialize,
  getValueByPath,
  setValueByPath
}