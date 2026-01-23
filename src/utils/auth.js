import Cookies from 'js-cookie'
import { encrypt, decrypt, isEncrypted } from './crypto'

const TokenKey = 'loginToken'

/**
 * Cookie安全配置
 * secure: 仅在HTTPS下传输（生产环境）
 * sameSite: 防止CSRF攻击
 * expires: 7天过期
 * 2026
 */
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production'
  return {
    expires: 7,
    secure: isProduction,
    sameSite: 'Strict'
  }
}

/**
 * 获取Token
 * 自动解密存储的加密Token
 * 2026
 */
export function getToken() {
  const encryptedToken = Cookies.get(TokenKey)
  if (!encryptedToken) return null
  // 兼容处理：检查是否为加密格式
  if (isEncrypted(encryptedToken)) {
    return decrypt(encryptedToken)
  }
  return encryptedToken
}

/**
 * 设置Token
 * 加密后存储并使用安全Cookie配置
 * 2026
 */
export function setToken(token) {
  if (!token) return false
  const encryptedToken = encrypt(token)
  return Cookies.set(TokenKey, encryptedToken, getCookieOptions())
}

/**
 * 移除Token
 * 清除Cookie中的Token
 * 2026
 */
export function removeToken() {
  return Cookies.remove(TokenKey, getCookieOptions())
}
