// XSS防护 - HTML实体编码
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, (match) => map[match])
}

// 输入验证 - 检查是否包含潜在危险字符
export function validateInput(input: string): boolean {
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /vbscript:/gi,
    /data:text\/html/gi
  ]
  
  return !dangerousPatterns.some(pattern => pattern.test(input))
}

// CSP配置
export const cspConfig = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", "data:", "https:"],
  'font-src': ["'self'", "https:"],
  'connect-src': ["'self'"],
  'media-src': ["'self'"],
  'object-src': ["'none'"],
  'child-src': ["'self'"],
  'frame-ancestors': ["'none'"],
  'form-action': ["'self'"],
  'base-uri': ["'self'"]
}

// 敏感信息过滤
export function filterSensitiveInfo(data: any): any {
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth']
  
  if (typeof data === 'object' && data !== null) {
    const filtered = { ...data }
    
    Object.keys(filtered).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        filtered[key] = '***'
      } else if (typeof filtered[key] === 'object') {
        filtered[key] = filterSensitiveInfo(filtered[key])
      }
    })
    
    return filtered
  }
  
  return data
}

// 生成随机字符串
export function generateRandomString(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

// 检查环境是否为生产环境
export function isProduction(): boolean {
  return import.meta.env.MODE === 'production'
}

// 安全的本地存储操作
export const secureStorage = {
  set(key: string, value: any): void {
    try {
      const encrypted = btoa(JSON.stringify(value))
      localStorage.setItem(key, encrypted)
    } catch (error) {
      console.error('Storage set error:', error)
    }
  },
  
  get(key: string): any {
    try {
      const encrypted = localStorage.getItem(key)
      if (!encrypted) return null
      return JSON.parse(atob(encrypted))
    } catch (error) {
      console.error('Storage get error:', error)
      return null
    }
  },
  
  remove(key: string): void {
    localStorage.removeItem(key)
  },
  
  clear(): void {
    localStorage.clear()
  }
}