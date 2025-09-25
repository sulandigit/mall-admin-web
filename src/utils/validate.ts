/**
 * 验证相关的工具函数
 */

/**
 * 验证用户名是否合法
 * @param {string} str - 要验证的用户名
 * @returns {boolean} 验证结果
 */
export function isvalidUsername(str: string): boolean {
  // const valid_map = ['admin', 'test']
  // return valid_map.indexOf(str.trim()) >= 0
  return str.trim().length >= 3
}

/**
 * 验证URL是否合法
 * @param {string} textval - 要验证的URL
 * @returns {boolean} 验证结果
 */
export function validateURL(textval: string): boolean {
  const urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
  return urlregex.test(textval)
}

/**
 * 验证是否为小写字母
 * @param {string} str - 要验证的字符串
 * @returns {boolean} 验证结果
 */
export function validateLowerCase(str: string): boolean {
  const reg = /^[a-z]+$/
  return reg.test(str)
}

/**
 * 验证是否为大写字母
 * @param {string} str - 要验证的字符串
 * @returns {boolean} 验证结果
 */
export function validateUpperCase(str: string): boolean {
  const reg = /^[A-Z]+$/
  return reg.test(str)
}

/**
 * 验证是否为大小写字母
 * @param {string} str - 要验证的字符串
 * @returns {boolean} 验证结果
 */
export function validatAlphabets(str: string): boolean {
  const reg = /^[A-Za-z]+$/
  return reg.test(str)
}

/**
 * 验证电子邮件格式
 * @param {string} email - 要验证的邮箱地址
 * @returns {boolean} 验证结果
 */
export function validateEmail(email: string): boolean {
  const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return reg.test(email)
}

/**
 * 验证手机号码格式
 * @param {string} phone - 要验证的手机号码
 * @returns {boolean} 验证结果
 */
export function validatePhone(phone: string): boolean {
  const reg = /^1[3-9]\d{9}$/
  return reg.test(phone)
}

/**
 * 验证密码强度（至少包含字母和数字，长度不少于6位）
 * @param {string} password - 要验证的密码
 * @returns {boolean} 验证结果
 */
export function validatePassword(password: string): boolean {
  const reg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/
  return reg.test(password)
}

