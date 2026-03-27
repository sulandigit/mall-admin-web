/**
 * 敏感信息加密存储系统
 * 主入口文件，导出所有核心组件
 */

import SecureStorageService from './SecureStorageService'
import EncryptionEngine from './EncryptionEngine'
import KeyManager from './KeyManager'
import DataClassifier from './DataClassifier'
import StorageAdapters from './adapters'
import SecurityMonitor from './SecurityMonitor'
import { migrateFromPlainStorage } from './migration'

// 创建默认实例
const secureStorage = new SecureStorageService()

export {
  SecureStorageService,
  EncryptionEngine,
  KeyManager,
  DataClassifier,
  StorageAdapters,
  SecurityMonitor,
  migrateFromPlainStorage,
  secureStorage as default
}

// 数据分类常量
export const DATA_CLASSIFICATIONS = {
  HIGH_SENSITIVE: 'high_sensitive',      // 高敏感：访问Token、刷新Token
  MEDIUM_SENSITIVE: 'medium_sensitive',  // 中敏感：用户信息、临时会话
  LOW_SENSITIVE: 'low_sensitive'         // 低敏感：应用配置
}

// 存储位置常量
export const STORAGE_LOCATIONS = {
  INDEXED_DB: 'indexeddb',
  LOCAL_STORAGE: 'localstorage',
  SESSION_STORAGE: 'sessionstorage',
  MEMORY: 'memory'
}

// 加密算法常量
export const ENCRYPTION_ALGORITHMS = {
  AES_256_GCM: 'aes-256-gcm',
  AES_128_CBC: 'aes-128-cbc',
  BASE64: 'base64'
}