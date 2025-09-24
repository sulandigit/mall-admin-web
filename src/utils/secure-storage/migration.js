/**
 * 数据迁移脚本
 * 实现从明文Cookie/LocalStorage到加密存储的渐进式迁移
 */

import Cookies from 'js-cookie'
import SecureStorageService from './SecureStorageService'
import { DATA_CLASSIFICATIONS } from './index'

/**
 * 迁移配置
 */
const MIGRATION_CONFIG = {
  // Cookie到加密存储的映射
  cookieMapping: {
    'loginToken': {
      targetKey: 'loginToken',
      classification: DATA_CLASSIFICATIONS.HIGH_SENSITIVE,
      expireTime: 30 * 60 * 1000 // 30分钟
    }
  },
  
  // LocalStorage到加密存储的映射
  localStorageMapping: {
    'userInfo': {
      targetKey: 'userInfo',
      classification: DATA_CLASSIFICATIONS.MEDIUM_SENSITIVE,
      expireTime: 24 * 60 * 60 * 1000 // 24小时
    },
    'appSettings': {
      targetKey: 'appSettings',
      classification: DATA_CLASSIFICATIONS.LOW_SENSITIVE,
      expireTime: 7 * 24 * 60 * 60 * 1000 // 7天
    }
  },
  
  // 需要清理的旧数据键名
  legacyKeys: [
    'token',
    'user',
    'settings',
    'config'
  ]
}

/**
 * 迁移状态管理
 */
class MigrationState {
  constructor() {
    this.storageKey = '_migration_state'
    this.state = this.loadState()
  }
  
  loadState() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : {
        version: '1.0.0',
        startTime: null,
        completedSteps: [],
        failedItems: [],
        totalItems: 0,
        processedItems: 0,
        isComplete: false
      }
    } catch (error) {
      console.error('Failed to load migration state:', error)
      return {
        version: '1.0.0',
        startTime: null,
        completedSteps: [],
        failedItems: [],
        totalItems: 0,
        processedItems: 0,
        isComplete: false
      }
    }
  }
  
  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state))
    } catch (error) {
      console.error('Failed to save migration state:', error)
    }
  }
  
  startMigration(totalItems) {
    this.state.startTime = Date.now()
    this.state.totalItems = totalItems
    this.state.processedItems = 0
    this.state.isComplete = false
    this.saveState()
  }
  
  markStepComplete(step) {
    if (!this.state.completedSteps.includes(step)) {
      this.state.completedSteps.push(step)
      this.saveState()
    }
  }
  
  recordProcessedItem(success = true) {
    this.state.processedItems++
    if (!success) {
      this.state.failedItems.push({
        timestamp: Date.now(),
        error: 'Processing failed'
      })
    }
    this.saveState()
  }
  
  markComplete() {
    this.state.isComplete = true
    this.state.completedAt = Date.now()
    this.saveState()
  }
  
  isStepCompleted(step) {
    return this.state.completedSteps.includes(step)
  }
  
  getProgress() {
    return this.state.totalItems > 0 
      ? Math.round((this.state.processedItems / this.state.totalItems) * 100)
      : 0
  }
}

/**
 * 主迁移函数
 * @param {Object} options - 迁移选项
 * @returns {Promise<Object>} 迁移结果
 */
export async function migrateFromPlainStorage(options = {}) {
  const migrationState = new MigrationState()
  const secureStorage = new SecureStorageService()
  const results = {
    success: true,
    migratedCount: 0,
    failedCount: 0,
    skippedCount: 0,
    errors: [],
    details: {}
  }
  
  try {
    console.log('🔄 Starting secure storage migration...')
    
    // 如果已经完成迁移，直接返回
    if (migrationState.state.isComplete && !options.force) {
      console.log('✅ Migration already completed')
      return {
        ...results,
        alreadyCompleted: true,
        completedAt: migrationState.state.completedAt
      }
    }
    
    // 计算总迁移项目数
    const totalItems = await calculateTotalItems()
    migrationState.startMigration(totalItems)
    
    // 步骤1: 迁移Cookie数据
    if (!migrationState.isStepCompleted('cookies') || options.force) {
      console.log('📝 Migrating Cookie data...')
      const cookieResults = await migrateCookies(secureStorage, migrationState)
      results.migratedCount += cookieResults.migratedCount
      results.failedCount += cookieResults.failedCount
      results.errors.push(...cookieResults.errors)
      results.details.cookies = cookieResults
      migrationState.markStepComplete('cookies')
    }
    
    // 步骤2: 迁移LocalStorage数据
    if (!migrationState.isStepCompleted('localStorage') || options.force) {
      console.log('💾 Migrating LocalStorage data...')
      const localStorageResults = await migrateLocalStorage(secureStorage, migrationState)
      results.migratedCount += localStorageResults.migratedCount
      results.failedCount += localStorageResults.failedCount
      results.errors.push(...localStorageResults.errors)
      results.details.localStorage = localStorageResults
      migrationState.markStepComplete('localStorage')
    }
    
    // 步骤3: 清理旧数据
    if (!migrationState.isStepCompleted('cleanup') || options.force) {
      console.log('🧹 Cleaning up legacy data...')
      const cleanupResults = await cleanupLegacyData(migrationState)
      results.details.cleanup = cleanupResults
      migrationState.markStepComplete('cleanup')
    }
    
    // 步骤4: 验证迁移结果
    if (!migrationState.isStepCompleted('validation') || options.force) {
      console.log('✔️ Validating migration results...')
      const validationResults = await validateMigration(secureStorage)
      results.details.validation = validationResults
      
      if (!validationResults.success) {
        results.success = false
        results.errors.push('Migration validation failed')
      }
      
      migrationState.markStepComplete('validation')
    }
    
    // 标记迁移完成
    migrationState.markComplete()
    
    console.log('✅ Migration completed successfully')
    console.log(`📊 Migration summary: ${results.migratedCount} migrated, ${results.failedCount} failed`)
    
    return results
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    results.success = false
    results.errors.push(error.message)
    return results
  }
}

/**
 * 计算总迁移项目数
 * @returns {Promise<number>} 总项目数
 */
async function calculateTotalItems() {
  let totalItems = 0
  
  // 计算Cookie项目数
  totalItems += Object.keys(MIGRATION_CONFIG.cookieMapping).length
  
  // 计算LocalStorage项目数
  totalItems += Object.keys(MIGRATION_CONFIG.localStorageMapping).length
  
  return totalItems
}

/**
 * 迁移Cookie数据
 * @param {SecureStorageService} secureStorage - 安全存储服务
 * @param {MigrationState} migrationState - 迁移状态
 * @returns {Promise<Object>} 迁移结果
 */
async function migrateCookies(secureStorage, migrationState) {
  const results = {
    migratedCount: 0,
    failedCount: 0,
    skippedCount: 0,
    errors: []
  }
  
  try {
    for (const [cookieKey, config] of Object.entries(MIGRATION_CONFIG.cookieMapping)) {
      try {
        const cookieValue = Cookies.get(cookieKey)
        
        if (!cookieValue) {
          console.log(`⏭️ Cookie '${cookieKey}' not found, skipping`)
          results.skippedCount++
          migrationState.recordProcessedItem(true)
          continue
        }
        
        // 迁移到安全存储
        const success = await secureStorage.store(config.targetKey, cookieValue, {
          classification: config.classification,
          expireTime: Date.now() + config.expireTime
        })
        
        if (success) {
          console.log(`✅ Migrated cookie '${cookieKey}' to secure storage`)
          results.migratedCount++
          
          // 删除原始Cookie
          Cookies.remove(cookieKey)
          
        } else {
          throw new Error(`Failed to store ${cookieKey} in secure storage`)
        }
        
        migrationState.recordProcessedItem(true)
        
      } catch (error) {
        console.error(`❌ Failed to migrate cookie '${cookieKey}':`, error)
        results.failedCount++
        results.errors.push(`Cookie ${cookieKey}: ${error.message}`)
        migrationState.recordProcessedItem(false)
      }
    }
    
  } catch (error) {
    console.error('Cookie migration error:', error)
    results.errors.push(`Cookie migration: ${error.message}`)
  }
  
  return results
}

/**
 * 迁移LocalStorage数据
 * @param {SecureStorageService} secureStorage - 安全存储服务
 * @param {MigrationState} migrationState - 迁移状态
 * @returns {Promise<Object>} 迁移结果
 */
async function migrateLocalStorage(secureStorage, migrationState) {
  const results = {
    migratedCount: 0,
    failedCount: 0,
    skippedCount: 0,
    errors: []
  }
  
  try {
    for (const [storageKey, config] of Object.entries(MIGRATION_CONFIG.localStorageMapping)) {
      try {
        const storageValue = localStorage.getItem(storageKey)
        
        if (!storageValue) {
          console.log(`⏭️ LocalStorage '${storageKey}' not found, skipping`)
          results.skippedCount++
          migrationState.recordProcessedItem(true)
          continue
        }
        
        // 尝试解析JSON数据
        let parsedValue
        try {
          parsedValue = JSON.parse(storageValue)
        } catch (parseError) {
          // 如果不是JSON，直接使用原始值
          parsedValue = storageValue
        }
        
        // 迁移到安全存储
        const success = await secureStorage.store(config.targetKey, parsedValue, {
          classification: config.classification,
          expireTime: Date.now() + config.expireTime
        })
        
        if (success) {
          console.log(`✅ Migrated localStorage '${storageKey}' to secure storage`)
          results.migratedCount++
          
          // 删除原始LocalStorage项
          localStorage.removeItem(storageKey)
          
        } else {
          throw new Error(`Failed to store ${storageKey} in secure storage`)
        }
        
        migrationState.recordProcessedItem(true)
        
      } catch (error) {
        console.error(`❌ Failed to migrate localStorage '${storageKey}':`, error)
        results.failedCount++
        results.errors.push(`LocalStorage ${storageKey}: ${error.message}`)
        migrationState.recordProcessedItem(false)
      }
    }
    
  } catch (error) {
    console.error('LocalStorage migration error:', error)
    results.errors.push(`LocalStorage migration: ${error.message}`)
  }
  
  return results
}

/**
 * 清理遗留数据
 * @param {MigrationState} migrationState - 迁移状态
 * @returns {Promise<Object>} 清理结果
 */
async function cleanupLegacyData(migrationState) {
  const results = {
    cleanedCookies: 0,
    cleanedLocalStorage: 0,
    errors: []
  }
  
  try {
    // 清理遗留的Cookie
    for (const key of MIGRATION_CONFIG.legacyKeys) {
      try {
        if (Cookies.get(key)) {
          Cookies.remove(key)
          results.cleanedCookies++
          console.log(`🧹 Cleaned legacy cookie: ${key}`)
        }
      } catch (error) {
        results.errors.push(`Cookie cleanup ${key}: ${error.message}`)
      }
    }
    
    // 清理遗留的LocalStorage项
    for (const key of MIGRATION_CONFIG.legacyKeys) {
      try {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key)
          results.cleanedLocalStorage++
          console.log(`🧹 Cleaned legacy localStorage: ${key}`)
        }
      } catch (error) {
        results.errors.push(`LocalStorage cleanup ${key}: ${error.message}`)
      }
    }
    
  } catch (error) {
    console.error('Legacy data cleanup error:', error)
    results.errors.push(`Cleanup: ${error.message}`)
  }
  
  return results
}

/**
 * 验证迁移结果
 * @param {SecureStorageService} secureStorage - 安全存储服务
 * @returns {Promise<Object>} 验证结果
 */
async function validateMigration(secureStorage) {
  const results = {
    success: true,
    validatedItems: 0,
    errors: []
  }
  
  try {
    // 验证Cookie迁移
    for (const [cookieKey, config] of Object.entries(MIGRATION_CONFIG.cookieMapping)) {
      try {
        const retrievedValue = await secureStorage.retrieve(config.targetKey)
        
        if (retrievedValue !== null) {
          results.validatedItems++
          console.log(`✔️ Validated migration of '${cookieKey}'`)
        } else {
          throw new Error(`Failed to retrieve migrated data for ${cookieKey}`)
        }
        
      } catch (error) {
        console.error(`❌ Validation failed for '${cookieKey}':`, error)
        results.success = false
        results.errors.push(`Cookie validation ${cookieKey}: ${error.message}`)
      }
    }
    
    // 验证LocalStorage迁移
    for (const [storageKey, config] of Object.entries(MIGRATION_CONFIG.localStorageMapping)) {
      try {
        const retrievedValue = await secureStorage.retrieve(config.targetKey)
        
        if (retrievedValue !== null) {
          results.validatedItems++
          console.log(`✔️ Validated migration of '${storageKey}'`)
        } else {
          // 某些数据可能不存在，这是正常的
          console.log(`ℹ️ No data found for '${storageKey}' (may not have existed)`)
        }
        
      } catch (error) {
        console.error(`❌ Validation failed for '${storageKey}':`, error)
        results.success = false
        results.errors.push(`LocalStorage validation ${storageKey}: ${error.message}`)
      }
    }
    
  } catch (error) {
    console.error('Migration validation error:', error)
    results.success = false
    results.errors.push(`Validation: ${error.message}`)
  }
  
  return results
}

/**
 * 检查是否需要迁移
 * @returns {Promise<boolean>} 是否需要迁移
 */
export async function needsMigration() {
  try {
    const migrationState = new MigrationState()
    
    // 如果已经完成迁移，不需要再次迁移
    if (migrationState.state.isComplete) {
      return false
    }
    
    // 检查是否存在需要迁移的数据
    let hasLegacyData = false
    
    // 检查Cookie
    for (const cookieKey of Object.keys(MIGRATION_CONFIG.cookieMapping)) {
      if (Cookies.get(cookieKey)) {
        hasLegacyData = true
        break
      }
    }
    
    // 检查LocalStorage
    if (!hasLegacyData) {
      for (const storageKey of Object.keys(MIGRATION_CONFIG.localStorageMapping)) {
        if (localStorage.getItem(storageKey)) {
          hasLegacyData = true
          break
        }
      }
    }
    
    return hasLegacyData
    
  } catch (error) {
    console.error('Migration check error:', error)
    return false
  }
}

/**
 * 获取迁移状态
 * @returns {Object} 迁移状态信息
 */
export function getMigrationStatus() {
  try {
    const migrationState = new MigrationState()
    return {
      ...migrationState.state,
      progress: migrationState.getProgress()
    }
  } catch (error) {
    console.error('Get migration status error:', error)
    return {
      version: '1.0.0',
      isComplete: false,
      progress: 0,
      error: error.message
    }
  }
}

/**
 * 重置迁移状态（用于测试或重新迁移）
 * @returns {boolean} 是否成功重置
 */
export function resetMigrationState() {
  try {
    localStorage.removeItem('_migration_state')
    console.log('🔄 Migration state reset')
    return true
  } catch (error) {
    console.error('Reset migration state error:', error)
    return false
  }
}

/**
 * 自动迁移（在应用启动时调用）
 * @param {Object} options - 迁移选项
 * @returns {Promise<boolean>} 是否成功完成迁移
 */
export async function autoMigrate(options = {}) {
  try {
    const shouldMigrate = await needsMigration()
    
    if (!shouldMigrate) {
      console.log('ℹ️ No migration needed')
      return true
    }
    
    console.log('🚀 Starting automatic migration...')
    const results = await migrateFromPlainStorage({
      ...options,
      silent: true
    })
    
    if (results.success) {
      console.log('✅ Automatic migration completed successfully')
      return true
    } else {
      console.error('❌ Automatic migration failed:', results.errors)
      return false
    }
    
  } catch (error) {
    console.error('Auto migration error:', error)
    return false
  }
}

// 导出配置以供外部使用
export { MIGRATION_CONFIG }