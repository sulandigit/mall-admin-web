import Cookies from 'js-cookie'
import secureStorage, { DATA_CLASSIFICATIONS } from './secure-storage'
import { autoMigrate, needsMigration } from './secure-storage/migration'

const TokenKey = 'loginToken'
const MIGRATION_CHECKED = '_migration_checked'

// 确保迁移已执行
let migrationPromise = null

/**
 * 确保迁移已完成
 * @returns {Promise<void>}
 */
async function ensureMigration() {
  if (!migrationPromise) {
    migrationPromise = (async () => {
      try {
        // 检查是否已经检查过迁移
        const migrationChecked = sessionStorage.getItem(MIGRATION_CHECKED)
        
        if (!migrationChecked) {
          console.log('🔄 Checking for data migration...')
          
          if (await needsMigration()) {
            console.log('📦 Starting automatic migration...')
            const success = await autoMigrate()
            
            if (success) {
              console.log('✅ Migration completed successfully')
            } else {
              console.warn('⚠️ Migration completed with some issues')
            }
          }
          
          // 标记迁移检查已完成
          sessionStorage.setItem(MIGRATION_CHECKED, 'true')
        }
      } catch (error) {
        console.error('❌ Migration check failed:', error)
      }
    })()
  }
  
  return migrationPromise
}

/**
 * 获取Token - 优先从加密存储获取，回退到Cookie
 * @returns {Promise<string|null>} Token值
 */
export async function getToken() {
  try {
    // 确保迁移已完成
    await ensureMigration()
    
    // 优先从加密存储获取
    const secureToken = await secureStorage.retrieve(TokenKey)
    if (secureToken) {
      return secureToken
    }
    
    // 回退到Cookie（兼容性支持）
    const cookieToken = Cookies.get(TokenKey)
    if (cookieToken) {
      // 如果在Cookie中找到Token，迁移到加密存储
      try {
        await secureStorage.store(TokenKey, cookieToken, {
          classification: DATA_CLASSIFICATIONS.HIGH_SENSITIVE,
          expireTime: Date.now() + 30 * 60 * 1000 // 30分钟过期
        })
        
        // 迁移成功后删除Cookie
        Cookies.remove(TokenKey)
        console.log('🔄 Token migrated from Cookie to secure storage')
        
        return cookieToken
      } catch (error) {
        console.error('Token migration error:', error)
        return cookieToken
      }
    }
    
    return null
    
  } catch (error) {
    console.error('Get token error:', error)
    
    // 发生错误时回退到Cookie
    return Cookies.get(TokenKey) || null
  }
}

/**
 * 设置Token - 同时存储到加密存储和Cookie（向后兼容）
 * @param {string} token - Token值
 * @param {Object} options - 选项
 * @returns {Promise<boolean>} 是否成功
 */
export async function setToken(token, options = {}) {
  try {
    // 确保迁移已完成
    await ensureMigration()
    
    const expireTime = options.expireTime || (Date.now() + 30 * 60 * 1000) // 默认30分钟
    
    // 存储到加密存储
    const secureSuccess = await secureStorage.store(TokenKey, token, {
      classification: DATA_CLASSIFICATIONS.HIGH_SENSITIVE,
      expireTime: expireTime
    })
    
    if (secureSuccess) {
      console.log('✅ Token stored in secure storage')
      
      // 如果需要向后兼容，也存储到Cookie
      if (options.fallbackToCookie !== false) {
        try {
          // 计算Cookie过期时间（天数）
          const expireDays = Math.max(1, Math.ceil((expireTime - Date.now()) / (24 * 60 * 60 * 1000)))
          const cookieSuccess = Cookies.set(TokenKey, token, { expires: expireDays })
          
          if (cookieSuccess) {
            console.log('📝 Token also stored in Cookie for compatibility')
          }
        } catch (cookieError) {
          console.warn('Cookie fallback failed:', cookieError)
        }
      }
      
      return true
    } else {
      // 如果加密存储失败，回退到Cookie
      console.warn('⚠️ Secure storage failed, falling back to Cookie')
      return Cookies.set(TokenKey, token, options)
    }
    
  } catch (error) {
    console.error('Set token error:', error)
    
    // 发生错误时回退到Cookie
    return Cookies.set(TokenKey, token, options)
  }
}

/**
 * 删除Token - 从所有存储位置删除
 * @returns {Promise<boolean>} 是否成功
 */
export async function removeToken() {
  try {
    // 确保迁移已完成
    await ensureMigration()
    
    // 从加密存储删除
    const secureSuccess = await secureStorage.remove(TokenKey)
    
    // 从Cookie删除（兼容性）
    const cookieSuccess = Cookies.remove(TokenKey)
    
    console.log('🗑️ Token removed from all storage locations')
    
    return secureSuccess || cookieSuccess
    
  } catch (error) {
    console.error('Remove token error:', error)
    
    // 发生错误时仍尝试删除Cookie
    return Cookies.remove(TokenKey)
  }
}

/**
 * 检查Token是否存在
 * @returns {Promise<boolean>} Token是否存在
 */
export async function hasToken() {
  try {
    const token = await getToken()
    return token !== null && token !== undefined && token !== ''
  } catch (error) {
    console.error('Check token error:', error)
    return false
  }
}

/**
 * 检查Token是否过期
 * @returns {Promise<boolean>} Token是否过期
 */
export async function isTokenExpired() {
  try {
    await ensureMigration()
    return await secureStorage.isExpired(TokenKey)
  } catch (error) {
    console.error('Check token expiration error:', error)
    return true // 出错时假设已过期
  }
}

/**
 * 刷新Token（延长过期时间）
 * @param {number} extendMinutes - 延长的分钟数，默认30分钟
 * @returns {Promise<boolean>} 是否成功
 */
export async function refreshToken(extendMinutes = 30) {
  try {
    const currentToken = await getToken()
    
    if (!currentToken) {
      return false
    }
    
    // 重新设置Token以延长过期时间
    return await setToken(currentToken, {
      expireTime: Date.now() + extendMinutes * 60 * 1000
    })
    
  } catch (error) {
    console.error('Refresh token error:', error)
    return false
  }
}

/**
 * 获取Token的元信息
 * @returns {Promise<Object|null>} Token元信息
 */
export async function getTokenMeta() {
  try {
    await ensureMigration()
    
    // 这里可以从安全存储获取更详细的元信息
    // 目前只返回基本信息
    const token = await getToken()
    const expired = await isTokenExpired()
    
    return token ? {
      exists: true,
      expired: expired,
      length: token.length,
      type: token.includes('.') ? 'JWT' : 'simple'
    } : null
    
  } catch (error) {
    console.error('Get token meta error:', error)
    return null
  }
}

// 向后兼容的同步方法（不推荐使用，但保持兼容性）
export function getTokenSync() {
  console.warn('⚠️ getTokenSync is deprecated, use getToken() instead')
  return Cookies.get(TokenKey)
}

export function setTokenSync(token) {
  console.warn('⚠️ setTokenSync is deprecated, use setToken() instead')
  return Cookies.set(TokenKey, token)
}

export function removeTokenSync() {
  console.warn('⚠️ removeTokenSync is deprecated, use removeToken() instead')
  return Cookies.remove(TokenKey)
}
