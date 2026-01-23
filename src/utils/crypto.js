/**
 * 敏感信息加密工具模块
 * 提供对token等敏感数据的加密和解密功能
 * 2026
 */

// 简单的混淆密钥，生产环境建议使用更复杂的密钥管理方案
const CRYPTO_KEY = 'mall_admin_secure_key_2026'

/**
 * Base64编码
 * @param {string} str 待编码字符串
 * @returns {string} 编码后的字符串
 */
function base64Encode(str) {
  try {
    return window.btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode('0x' + p1)
    }))
  } catch (e) {
    console.error('Base64编码失败:', e)
    return str
  }
}

/**
 * Base64解码
 * @param {string} str 待解码字符串
 * @returns {string} 解码后的字符串
 */
function base64Decode(str) {
  try {
    return decodeURIComponent(window.atob(str).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
  } catch (e) {
    console.error('Base64解码失败:', e)
    return str
  }
}

/**
 * 简单异或加密
 * @param {string} text 待加密文本
 * @param {string} key 密钥
 * @returns {string} 加密后的文本
 * 2026
 */
function xorEncrypt(text, key) {
  let result = ''
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
  }
  return result
}

/**
 * 加密敏感数据
 * @param {string} data 待加密的敏感数据
 * @returns {string} 加密后的数据
 * 2026
 */
export function encrypt(data) {
  if (!data) return ''
  try {
    // 添加时间戳增加唯一性
    const timestamp = Date.now().toString(36)
    const dataWithTimestamp = timestamp + '|' + data
    // 先异或加密再Base64编码
    const encrypted = xorEncrypt(dataWithTimestamp, CRYPTO_KEY)
    return base64Encode(encrypted)
  } catch (e) {
    console.error('加密失败:', e)
    return data
  }
}

/**
 * 解密敏感数据
 * @param {string} encryptedData 已加密的数据
 * @returns {string} 解密后的原始数据
 * 2026
 */
export function decrypt(encryptedData) {
  if (!encryptedData) return ''
  try {
    // 先Base64解码再异或解密
    const decoded = base64Decode(encryptedData)
    const decrypted = xorEncrypt(decoded, CRYPTO_KEY)
    // 移除时间戳部分
    const pipeIndex = decrypted.indexOf('|')
    if (pipeIndex !== -1) {
      return decrypted.substring(pipeIndex + 1)
    }
    return decrypted
  } catch (e) {
    console.error('解密失败:', e)
    return encryptedData
  }
}

/**
 * 验证数据是否为有效的加密格式
 * @param {string} data 待验证的数据
 * @returns {boolean} 是否为有效加密数据
 * 2026
 */
export function isEncrypted(data) {
  if (!data) return false
  try {
    const decoded = base64Decode(data)
    const decrypted = xorEncrypt(decoded, CRYPTO_KEY)
    return decrypted.includes('|')
  } catch (e) {
    return false
  }
}
