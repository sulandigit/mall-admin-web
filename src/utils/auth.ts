import Cookies from 'js-cookie'
import { CookieOptions } from '@/types/utils'

const TokenKey: string = 'loginToken'

/**
 * 获取存储的登录令牌
 * @returns {string | undefined} 返回令牌字符串或undefined
 */
export function getToken(): string | undefined {
  return Cookies.get(TokenKey)
}

/**
 * 设置登录令牌
 * @param {string} token - 要存储的令牌
 * @param {CookieOptions} options - Cookie配置选项
 * @returns {string | undefined}
 */
export function setToken(token: string, options?: CookieOptions): string | undefined {
  return Cookies.set(TokenKey, token, options)
}

/**
 * 移除登录令牌
 */
export function removeToken(): void {
  Cookies.remove(TokenKey)
}
