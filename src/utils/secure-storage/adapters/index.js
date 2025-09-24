/**
 * 存储适配器入口文件
 * 统一管理各种存储方式的适配器
 */

import IndexedDBAdapter from './IndexedDBAdapter'
import LocalStorageAdapter from './LocalStorageAdapter'
import SessionStorageAdapter from './SessionStorageAdapter'
import MemoryAdapter from './MemoryAdapter'
import { STORAGE_LOCATIONS } from '../index'

export default class StorageAdapters {
  constructor() {
    // 初始化各种存储适配器
    this.adapters = new Map()
    
    try {
      this.adapters.set(STORAGE_LOCATIONS.INDEXED_DB, new IndexedDBAdapter())
    } catch (error) {
      console.warn('IndexedDB not available:', error)
    }
    
    try {
      this.adapters.set(STORAGE_LOCATIONS.LOCAL_STORAGE, new LocalStorageAdapter())
    } catch (error) {
      console.warn('LocalStorage not available:', error)
    }
    
    try {
      this.adapters.set(STORAGE_LOCATIONS.SESSION_STORAGE, new SessionStorageAdapter())
    } catch (error) {
      console.warn('SessionStorage not available:', error)
    }
    
    // 内存存储总是可用
    this.adapters.set(STORAGE_LOCATIONS.MEMORY, new MemoryAdapter())
  }

  /**
   * 获取指定类型的适配器
   * @param {string} storageType - 存储类型
   * @returns {Object|null} 适配器实例
   */
  getAdapter(storageType) {
    return this.adapters.get(storageType) || null
  }

  /**
   * 检查存储类型是否支持
   * @param {string} storageType - 存储类型
   * @returns {boolean} 是否支持
   */
  isSupported(storageType) {
    const adapter = this.getAdapter(storageType)
    return adapter && adapter.isSupported()
  }

  /**
   * 写入数据
   * @param {string} storageType - 存储类型
   * @param {string} key - 键名
   * @param {any} value - 值
   * @returns {Promise<boolean>} 是否成功
   */
  async write(storageType, key, value) {
    const adapter = this.getAdapter(storageType)
    if (!adapter) {
      console.error(`Storage adapter not found: ${storageType}`)
      return false
    }
    
    try {
      return await adapter.write(key, value)
    } catch (error) {
      console.error(`Storage write error (${storageType}):`, error)
      return false
    }
  }

  /**
   * 读取数据
   * @param {string} storageType - 存储类型
   * @param {string} key - 键名
   * @returns {Promise<any>} 读取的数据
   */
  async read(storageType, key) {
    const adapter = this.getAdapter(storageType)
    if (!adapter) {
      console.error(`Storage adapter not found: ${storageType}`)
      return null
    }
    
    try {
      return await adapter.read(key)
    } catch (error) {
      console.error(`Storage read error (${storageType}):`, error)
      return null
    }
  }

  /**
   * 删除数据
   * @param {string} storageType - 存储类型
   * @param {string} key - 键名
   * @returns {Promise<boolean>} 是否成功
   */
  async delete(storageType, key) {
    const adapter = this.getAdapter(storageType)
    if (!adapter) {
      console.error(`Storage adapter not found: ${storageType}`)
      return false
    }
    
    try {
      return await adapter.delete(key)
    } catch (error) {
      console.error(`Storage delete error (${storageType}):`, error)
      return false
    }
  }

  /**
   * 清空存储
   * @param {string} storageType - 存储类型
   * @returns {Promise<boolean>} 是否成功
   */
  async clear(storageType) {
    const adapter = this.getAdapter(storageType)
    if (!adapter) {
      console.error(`Storage adapter not found: ${storageType}`)
      return false
    }
    
    try {
      return await adapter.clear()
    } catch (error) {
      console.error(`Storage clear error (${storageType}):`, error)
      return false
    }
  }

  /**
   * 获取存储大小
   * @param {string} storageType - 存储类型
   * @returns {Promise<number>} 存储大小（字节）
   */
  async getSize(storageType) {
    const adapter = this.getAdapter(storageType)
    if (!adapter || !adapter.getSize) {
      return 0
    }
    
    try {
      return await adapter.getSize()
    } catch (error) {
      console.error(`Storage size check error (${storageType}):`, error)
      return 0
    }
  }

  /**
   * 获取所有键名
   * @param {string} storageType - 存储类型
   * @returns {Promise<Array<string>>} 键名数组
   */
  async getKeys(storageType) {
    const adapter = this.getAdapter(storageType)
    if (!adapter || !adapter.getKeys) {
      return []
    }
    
    try {
      return await adapter.getKeys()
    } catch (error) {
      console.error(`Get keys error (${storageType}):`, error)
      return []
    }
  }

  /**
   * 获取所有可用的存储类型
   * @returns {Array<string>} 可用的存储类型
   */
  getAvailableStorageTypes() {
    return Array.from(this.adapters.keys()).filter(type => this.isSupported(type))
  }

  /**
   * 选择最佳存储类型
   * @param {Array<string>} preferredTypes - 优先选择的存储类型
   * @returns {string|null} 最佳存储类型
   */
  getBestStorageType(preferredTypes = []) {
    // 按优先级顺序检查
    for (const type of preferredTypes) {
      if (this.isSupported(type)) {
        return type
      }
    }
    
    // 如果没有优先类型可用，使用默认顺序
    const defaultOrder = [
      STORAGE_LOCATIONS.INDEXED_DB,
      STORAGE_LOCATIONS.LOCAL_STORAGE,
      STORAGE_LOCATIONS.SESSION_STORAGE,
      STORAGE_LOCATIONS.MEMORY
    ]
    
    for (const type of defaultOrder) {
      if (this.isSupported(type)) {
        return type
      }
    }
    
    return null
  }

  /**
   * 获取存储统计信息
   * @returns {Promise<Object>} 统计信息
   */
  async getStats() {
    const stats = {}
    
    for (const [type, adapter] of this.adapters.entries()) {
      try {
        stats[type] = {
          supported: adapter.isSupported(),
          size: await this.getSize(type),
          keys: await this.getKeys(type)
        }
      } catch (error) {
        stats[type] = {
          supported: false,
          error: error.message
        }
      }
    }
    
    return stats
  }
}

// 导出各个适配器类
export {
  IndexedDBAdapter,
  LocalStorageAdapter,
  SessionStorageAdapter,
  MemoryAdapter
}