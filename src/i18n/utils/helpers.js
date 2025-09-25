/**
 * 国际化辅助工具函数
 * 提供便捷的国际化操作方法
 */

/**
 * 获取浏览器首选语言
 * @returns {string} 语言代码
 */
export function getBrowserLanguage() {
  const language = navigator.language || navigator.userLanguage
  return language.toLowerCase()
}

/**
 * 检查是否支持指定语言
 * @param {string} locale 语言代码
 * @param {Array} supportedLocales 支持的语言列表
 * @returns {boolean} 是否支持
 */
export function isSupportedLocale(locale, supportedLocales) {
  return supportedLocales.some(supported => 
    locale.toLowerCase().indexOf(supported.toLowerCase()) > -1
  )
}

/**
 * 获取匹配的语言代码
 * @param {string} browserLanguage 浏览器语言
 * @param {Array} supportedLocales 支持的语言列表
 * @returns {string|null} 匹配的语言代码或null
 */
export function getMatchedLocale(browserLanguage, supportedLocales) {
  // 精确匹配
  let matched = supportedLocales.find(locale => 
    locale.toLowerCase() === browserLanguage.toLowerCase()
  )
  
  if (matched) return matched
  
  // 前缀匹配（如 en-US 匹配 en）
  matched = supportedLocales.find(locale => 
    browserLanguage.toLowerCase().startsWith(locale.toLowerCase()) ||
    locale.toLowerCase().startsWith(browserLanguage.toLowerCase())
  )
  
  return matched || null
}

/**
 * 创建翻译键路径
 * @param {string} module 模块名
 * @param {string} key 键名
 * @returns {string} 完整的翻译键路径
 */
export function createI18nKey(module, key) {
  return `${module}.${key}`
}

/**
 * 提取对象中的所有翻译键
 * @param {Object} obj 语言包对象
 * @param {string} prefix 前缀
 * @returns {Array} 翻译键数组
 */
export function extractI18nKeys(obj, prefix = '') {
  const keys = []
  
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys.push(...extractI18nKeys(obj[key], fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  
  return keys
}

/**
 * 比较两个语言包的差异
 * @param {Object} source 源语言包
 * @param {Object} target 目标语言包
 * @returns {Object} 差异报告
 */
export function compareI18nMessages(source, target) {
  const sourceKeys = new Set(extractI18nKeys(source))
  const targetKeys = new Set(extractI18nKeys(target))
  
  const missing = Array.from(sourceKeys).filter(key => !targetKeys.has(key))
  const extra = Array.from(targetKeys).filter(key => !sourceKeys.has(key))
  
  return {
    missing,
    extra,
    total: sourceKeys.size,
    coverage: ((sourceKeys.size - missing.length) / sourceKeys.size * 100).toFixed(2)
  }
}

/**
 * 深度合并语言包对象
 * @param {Object} target 目标对象
 * @param {Object} source 源对象
 * @returns {Object} 合并后的对象
 */
export function mergeI18nMessages(target, source) {
  const result = { ...target }
  
  for (const key in source) {
    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
      result[key] = mergeI18nMessages(result[key] || {}, source[key])
    } else {
      result[key] = source[key]
    }
  }
  
  return result
}

/**
 * 验证翻译键是否存在
 * @param {string} key 翻译键
 * @param {Object} messages 语言包对象
 * @returns {boolean} 是否存在
 */
export function hasI18nKey(key, messages) {
  const keys = key.split('.')
  let current = messages
  
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k]
    } else {
      return false
    }
  }
  
  return true
}

/**
 * 获取翻译值
 * @param {string} key 翻译键
 * @param {Object} messages 语言包对象
 * @param {string} fallback 回退值
 * @returns {string} 翻译值
 */
export function getI18nValue(key, messages, fallback = '') {
  const keys = key.split('.')
  let current = messages
  
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k]
    } else {
      return fallback || key
    }
  }
  
  return typeof current === 'string' ? current : fallback || key
}

/**
 * 插值替换
 * @param {string} template 模板字符串
 * @param {Object} params 参数对象
 * @returns {string} 替换后的字符串
 */
export function interpolate(template, params = {}) {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return params.hasOwnProperty(key) ? params[key] : match
  })
}

/**
 * 获取本地化的表单验证规则
 * @param {Function} t 翻译函数
 * @returns {Object} 验证规则对象
 */
export function getLocalizedValidationRules(t) {
  return {
    required: {
      required: true,
      message: t('form.rule.required'),
      trigger: 'blur'
    },
    email: {
      type: 'email',
      message: t('form.rule.emailFormat'),
      trigger: 'blur'
    },
    phone: {
      pattern: /^1[3-9]\d{9}$/,
      message: t('form.rule.phoneFormat'),
      trigger: 'blur'
    },
    url: {
      type: 'url',
      message: t('form.rule.urlFormat'),
      trigger: 'blur'
    },
    number: {
      type: 'number',
      message: t('form.rule.number'),
      trigger: 'blur'
    }
  }
}

/**
 * 本地化存储键名
 * @param {string} key 基础键名
 * @param {string} locale 语言代码
 * @returns {string} 本地化的键名
 */
export function getLocalizedStorageKey(key, locale) {
  return `${key}_${locale}`
}

export default {
  getBrowserLanguage,
  isSupportedLocale,
  getMatchedLocale,
  createI18nKey,
  extractI18nKeys,
  compareI18nMessages,
  mergeI18nMessages,
  hasI18nKey,
  getI18nValue,
  interpolate,
  getLocalizedValidationRules,
  getLocalizedStorageKey
}