import moment from 'moment'

/**
 * 格式化工具类
 * 根据当前语言环境格式化日期、时间、数字、货币等
 */
class FormatUtils {
  constructor(locale = 'zh-CN') {
    this.locale = locale
    this.setLocale(locale)
  }

  /**
   * 设置当前语言环境
   * @param {string} locale 语言代码
   */
  setLocale(locale) {
    this.locale = locale
    
    // 设置moment.js语言环境
    if (locale === 'en-US') {
      moment.locale('en')
    } else {
      moment.locale('zh-cn')
    }
  }

  /**
   * 格式化日期
   * @param {Date|string|number} date 日期
   * @param {string} format 格式字符串，可选
   * @returns {string} 格式化后的日期字符串
   */
  formatDate(date, format) {
    if (!date) return ''
    
    const momentDate = moment(date)
    if (!momentDate.isValid()) return ''
    
    if (format) {
      return momentDate.format(format)
    }
    
    // 根据语言环境返回默认格式
    if (this.locale === 'en-US') {
      return momentDate.format('MM/DD/YYYY')
    } else {
      return momentDate.format('YYYY年MM月DD日')
    }
  }

  /**
   * 格式化时间
   * @param {Date|string|number} date 日期时间
   * @param {boolean} use12Hour 是否使用12小时制
   * @returns {string} 格式化后的时间字符串
   */
  formatTime(date, use12Hour = false) {
    if (!date) return ''
    
    const momentDate = moment(date)
    if (!momentDate.isValid()) return ''
    
    if (this.locale === 'en-US' && use12Hour) {
      return momentDate.format('hh:mm:ss A')
    } else {
      return momentDate.format('HH:mm:ss')
    }
  }

  /**
   * 格式化日期时间
   * @param {Date|string|number} date 日期时间
   * @param {boolean} use12Hour 是否使用12小时制
   * @returns {string} 格式化后的日期时间字符串
   */
  formatDateTime(date, use12Hour = false) {
    if (!date) return ''
    
    const momentDate = moment(date)
    if (!momentDate.isValid()) return ''
    
    if (this.locale === 'en-US') {
      const timeFormat = use12Hour ? 'hh:mm:ss A' : 'HH:mm:ss'
      return momentDate.format(`MM/DD/YYYY ${timeFormat}`)
    } else {
      return momentDate.format('YYYY年MM月DD日 HH:mm:ss')
    }
  }

  /**
   * 格式化相对时间
   * @param {Date|string|number} date 日期时间
   * @returns {string} 相对时间字符串
   */
  formatRelativeTime(date) {
    if (!date) return ''
    
    const momentDate = moment(date)
    if (!momentDate.isValid()) return ''
    
    return momentDate.fromNow()
  }

  /**
   * 格式化数字
   * @param {number} number 数字
   * @param {number} decimals 小数位数
   * @returns {string} 格式化后的数字字符串
   */
  formatNumber(number, decimals = 0) {
    if (isNaN(number)) return ''
    
    const options = {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }
    
    return new Intl.NumberFormat(this.locale, options).format(number)
  }

  /**
   * 格式化货币
   * @param {number} amount 金额
   * @param {string} currency 货币代码
   * @param {number} decimals 小数位数
   * @returns {string} 格式化后的货币字符串
   */
  formatCurrency(amount, currency, decimals = 2) {
    if (isNaN(amount)) return ''
    
    // 根据语言环境选择默认货币
    if (!currency) {
      currency = this.locale === 'en-US' ? 'USD' : 'CNY'
    }
    
    const options = {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }
    
    return new Intl.NumberFormat(this.locale, options).format(amount)
  }

  /**
   * 格式化百分比
   * @param {number} value 数值（0-1之间或0-100之间）
   * @param {number} decimals 小数位数
   * @param {boolean} isDecimal 输入值是否为小数形式（0-1之间）
   * @returns {string} 格式化后的百分比字符串
   */
  formatPercentage(value, decimals = 2, isDecimal = true) {
    if (isNaN(value)) return ''
    
    const percentage = isDecimal ? value : value / 100
    
    const options = {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }
    
    return new Intl.NumberFormat(this.locale, options).format(percentage)
  }

  /**
   * 格式化文件大小
   * @param {number} bytes 字节数
   * @param {number} decimals 小数位数
   * @returns {string} 格式化后的文件大小字符串
   */
  formatFileSize(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = this.locale === 'en-US' 
      ? ['Bytes', 'KB', 'MB', 'GB', 'TB']
      : ['字节', 'KB', 'MB', 'GB', 'TB']
    
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
  }
}

// 创建全局实例
let formatUtils = new FormatUtils()

/**
 * 更新格式化工具的语言环境
 * @param {string} locale 语言代码
 */
export function updateFormatLocale(locale) {
  formatUtils.setLocale(locale)
}

// 导出工具方法
export const formatDate = (date, format) => formatUtils.formatDate(date, format)
export const formatTime = (date, use12Hour) => formatUtils.formatTime(date, use12Hour)
export const formatDateTime = (date, use12Hour) => formatUtils.formatDateTime(date, use12Hour)
export const formatRelativeTime = (date) => formatUtils.formatRelativeTime(date)
export const formatNumber = (number, decimals) => formatUtils.formatNumber(number, decimals)
export const formatCurrency = (amount, currency, decimals) => formatUtils.formatCurrency(amount, currency, decimals)
export const formatPercentage = (value, decimals, isDecimal) => formatUtils.formatPercentage(value, decimals, isDecimal)
export const formatFileSize = (bytes, decimals) => formatUtils.formatFileSize(bytes, decimals)

export default formatUtils