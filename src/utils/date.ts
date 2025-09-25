/**
 * 日期处理相关的工具函数
 */

import { DateFormatOptions } from '@/types/utils'

/**
 * 格式化日期
 * @param {Date} date - 要格式化的日期对象
 * @param {string} fmt - 格式化模式，默认 'yyyy-MM-dd hh:mm:ss'
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date: Date, fmt: string = 'yyyy-MM-dd hh:mm:ss'): string {
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  const o: { [key: string]: number } = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  for (const k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      const str = o[k] + ''
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str))
    }
  }
  return fmt
}

/**
 * 左侧填充0
 * @param {string} str - 要填充的字符串
 * @returns {string} 填充后的字符串
 */
function padLeftZero(str: string): string {
  return ('00' + str).substr(str.length)
}

/**
 * 字符串转换为日期对象
 * @param {string} dateStr - 日期字符串
 * @param {string} separator - 分隔符，默认为 '-'
 * @returns {Date} 日期对象
 */
export function str2Date(dateStr: string, separator: string = '-'): Date {
  const dateArr = dateStr.split(separator)
  const year = parseInt(dateArr[0])
  let month: number
  // 处理月份为04这样的情况
  if (dateArr[1].indexOf('0') === 0) {
    month = parseInt(dateArr[1].substring(1))
  } else {
    month = parseInt(dateArr[1])
  }
  const day = parseInt(dateArr[2])
  return new Date(year, month - 1, day)
}

/**
 * 获取当前时间戳
 * @returns {number} 时间戳
 */
export function getCurrentTimestamp(): number {
  return Date.now()
}

/**
 * 日期添加天数
 * @param {Date} date - 原始日期
 * @param {number} days - 要添加的天数
 * @returns {Date} 新的日期对象
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * 计算两个日期之间的天数差
 * @param {Date} date1 - 第一个日期
 * @param {Date} date2 - 第二个日期
 * @returns {number} 天数差
 */
export function daysBetween(date1: Date, date2: Date): number {
  const timeDiff = Math.abs(date2.getTime() - date1.getTime())
  return Math.ceil(timeDiff / (1000 * 3600 * 24))
}

/**
 * 检查是否为同一天
 * @param {Date} date1 - 第一个日期
 * @param {Date} date2 - 第二个日期
 * @returns {boolean} 是否为同一天
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}
