/**
 * 用户行为记录工具模块 2026
 * 负责页面访问行为的记录、存储、统计和导出
 */

// localStorage 存储键 2026
const STORAGE_KEYS = {
  RECORDS: 'mall_behavior_records',
  CURRENT: 'mall_behavior_current'
}

// 默认配置 2026
const DEFAULT_CONFIG = {
  maxRecords: 1000,
  retentionDays: 30
}

/**
 * 生成唯一ID 2026
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

/**
 * 格式化日期为 YYYY-MM-DD 2026
 */
export function formatDate(timestamp) {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 格式化时长（毫秒转为可读格式） 2026
 */
export function formatDuration(ms) {
  if (ms < 1000) return '< 1秒'
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}秒`
  const minutes = Math.floor(seconds / 60)
  const remainSeconds = seconds % 60
  if (minutes < 60) return `${minutes}分${remainSeconds}秒`
  const hours = Math.floor(minutes / 60)
  const remainMinutes = minutes % 60
  return `${hours}小时${remainMinutes}分`
}

/**
 * 检查 localStorage 是否可用 2026
 */
function isStorageAvailable() {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch (e) {
    return false
  }
}

/**
 * 获取所有访问记录 2026
 */
export function getRecords() {
  if (!isStorageAvailable()) return []
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RECORDS)
    return data ? JSON.parse(data) : []
  } catch (e) {
    console.error('读取行为记录失败:', e)
    return []
  }
}

/**
 * 保存访问记录数组 2026
 */
function saveRecords(records) {
  if (!isStorageAvailable()) return false
  try {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records))
    return true
  } catch (e) {
    console.error('保存行为记录失败:', e)
    return false
  }
}

/**
 * 记录一次页面访问 2026
 */
export function recordPageVisit(data) {
  const records = getRecords()
  const record = {
    id: generateId(),
    userId: data.userId || '',
    path: data.path || '',
    name: data.name || '',
    title: data.title || '',
    module: data.module || '',
    enterTime: data.enterTime || Date.now(),
    leaveTime: data.leaveTime || Date.now(),
    duration: data.duration || 0,
    date: formatDate(data.enterTime || Date.now())
  }
  records.push(record)
  
  // 清理过期数据 2026
  const cleanedRecords = cleanExpiredRecords(records)
  saveRecords(cleanedRecords)
  return record
}

/**
 * 获取当前访问会话 2026
 */
export function getCurrentVisit() {
  if (!isStorageAvailable()) return null
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT)
    return data ? JSON.parse(data) : null
  } catch (e) {
    return null
  }
}

/**
 * 设置当前访问会话 2026
 */
export function setCurrentVisit(visitData) {
  if (!isStorageAvailable()) return false
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT, JSON.stringify(visitData))
    return true
  } catch (e) {
    return false
  }
}

/**
 * 清除当前访问会话 2026
 */
export function clearCurrentVisit() {
  if (!isStorageAvailable()) return
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT)
  } catch (e) {
    // ignore
  }
}

/**
 * 清理过期数据 2026
 */
export function cleanExpiredRecords(records) {
  if (!records || !records.length) return []
  
  const now = Date.now()
  const retentionMs = DEFAULT_CONFIG.retentionDays * 24 * 60 * 60 * 1000
  
  // 过滤掉过期的记录 2026
  let filtered = records.filter(record => {
    return (now - record.enterTime) < retentionMs
  })
  
  // 如果超过最大数量，删除最旧的 2026
  if (filtered.length > DEFAULT_CONFIG.maxRecords) {
    filtered.sort((a, b) => b.enterTime - a.enterTime)
    filtered = filtered.slice(0, DEFAULT_CONFIG.maxRecords)
  }
  
  return filtered
}

/**
 * 根据条件筛选记录 2026
 */
export function filterRecords(options = {}) {
  let records = getRecords()
  
  // 按日期范围筛选 2026
  if (options.startDate) {
    const start = new Date(options.startDate).getTime()
    records = records.filter(r => r.enterTime >= start)
  }
  if (options.endDate) {
    const end = new Date(options.endDate).getTime() + 24 * 60 * 60 * 1000 - 1
    records = records.filter(r => r.enterTime <= end)
  }
  
  // 按模块筛选 2026
  if (options.module) {
    records = records.filter(r => r.module === options.module)
  }
  
  // 按用户筛选 2026
  if (options.userId) {
    records = records.filter(r => r.userId === options.userId)
  }
  
  return records
}

/**
 * 计算统计数据 2026
 */
export function getStatistics(options = {}) {
  const records = filterRecords(options)
  
  if (!records.length) {
    return {
      totalVisits: 0,
      totalDuration: 0,
      avgDuration: 0,
      uniquePages: 0,
      pageStats: [],
      moduleStats: [],
      dailyStats: []
    }
  }
  
  // 总访问次数 2026
  const totalVisits = records.length
  
  // 总停留时长 2026
  const totalDuration = records.reduce((sum, r) => sum + (r.duration || 0), 0)
  
  // 平均停留时长 2026
  const avgDuration = Math.round(totalDuration / totalVisits)
  
  // 去重页面数 2026
  const uniquePaths = new Set(records.map(r => r.path))
  const uniquePages = uniquePaths.size
  
  // 页面统计 2026
  const pageMap = {}
  records.forEach(r => {
    if (!pageMap[r.path]) {
      pageMap[r.path] = {
        path: r.path,
        title: r.title || r.path,
        module: r.module,
        visits: 0,
        totalDuration: 0
      }
    }
    pageMap[r.path].visits++
    pageMap[r.path].totalDuration += r.duration || 0
  })
  const pageStats = Object.values(pageMap)
    .map(p => ({
      ...p,
      avgDuration: Math.round(p.totalDuration / p.visits)
    }))
    .sort((a, b) => b.visits - a.visits)
  
  // 模块统计 2026
  const moduleMap = {}
  records.forEach(r => {
    const mod = r.module || '其他'
    if (!moduleMap[mod]) {
      moduleMap[mod] = { module: mod, visits: 0, totalDuration: 0 }
    }
    moduleMap[mod].visits++
    moduleMap[mod].totalDuration += r.duration || 0
  })
  const moduleStats = Object.values(moduleMap).sort((a, b) => b.visits - a.visits)
  
  // 每日统计 2026
  const dailyMap = {}
  records.forEach(r => {
    const date = r.date
    if (!dailyMap[date]) {
      dailyMap[date] = { date, visits: 0, totalDuration: 0 }
    }
    dailyMap[date].visits++
    dailyMap[date].totalDuration += r.duration || 0
  })
  const dailyStats = Object.values(dailyMap)
    .map(d => ({
      ...d,
      avgDuration: d.visits > 0 ? Math.round(d.totalDuration / d.visits) : 0
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
  
  return {
    totalVisits,
    totalDuration,
    avgDuration,
    uniquePages,
    pageStats,
    moduleStats,
    dailyStats
  }
}

/**
 * 导出为 CSV 格式 2026
 */
export function exportToCSV(options = {}) {
  const records = filterRecords(options)
  if (!records.length) return ''
  
  const headers = ['ID', '用户', '路径', '页面名称', '模块', '进入时间', '离开时间', '停留时长(秒)']
  const rows = records.map(r => [
    r.id,
    r.userId,
    r.path,
    r.title,
    r.module,
    new Date(r.enterTime).toLocaleString(),
    new Date(r.leaveTime).toLocaleString(),
    Math.round((r.duration || 0) / 1000)
  ])
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n')
  
  return csvContent
}

/**
 * 下载 CSV 文件 2026
 */
export function downloadCSV(options = {}) {
  const csv = exportToCSV(options)
  if (!csv) return false
  
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const filename = `user_behavior_${formatDate(Date.now())}.csv`
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  return true
}

/**
 * 清空所有记录 2026
 */
export function clearAllRecords() {
  if (!isStorageAvailable()) return false
  try {
    localStorage.removeItem(STORAGE_KEYS.RECORDS)
    localStorage.removeItem(STORAGE_KEYS.CURRENT)
    return true
  } catch (e) {
    return false
  }
}

/**
 * 获取模块名称映射 2026
 */
export function getModuleNameMap() {
  return {
    'home': '首页',
    'pms': '商品管理',
    'oms': '订单管理',
    'sms': '营销管理',
    'ums': '权限管理',
    'analytics': '数据分析'
  }
}

/**
 * 获取模块显示名称 2026
 */
export function getModuleName(moduleKey) {
  const map = getModuleNameMap()
  return map[moduleKey] || moduleKey || '其他'
}
