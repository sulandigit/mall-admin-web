/**
 * Vue CSRF防护插件
 * 以Vue插件形式集成CSRF防护系统
 */
import { setupCSRFProtection } from './csrf-init'
import SecurityComponents from '../components/Security'

/**
 * Vue CSRF防护插件
 */
export default {
  install(Vue, options = {}) {
    // 检查是否已安装
    if (Vue.prototype.$csrf) {
      console.warn('CSRF protection plugin already installed')
      return
    }
    
    // 安装安全组件
    Vue.use(SecurityComponents)
    
    // 设置CSRF防护
    const initPromise = setupCSRFProtection(Vue, options)
    
    // 添加实例属性和方法
    Vue.prototype.$csrf = {
      // 获取CSRF令牌
      async getToken() {
        const { getCSRFToken } = await import('./index')
        return getCSRFToken()
      },
      
      // 验证CSRF令牌
      async validateToken(token, options) {
        const { validateCSRFToken } = await import('./index')
        return validateCSRFToken(token, options)
      },
      
      // 刷新CSRF令牌
      async refreshToken(options) {
        const { refreshCSRFToken } = await import('./index')
        return refreshCSRFToken(options)
      },
      
      // 创建安全表单数据
      async createSecureFormData(formData) {
        const { createSecureFormData } = await import('./index')
        return createSecureFormData(formData)
      },
      
      // 获取CSRF状态
      getStatus() {
        const { getCSRFStatus } = require('./index')
        return getCSRFStatus()
      }
    }
    
    // 添加全局混入
    Vue.mixin({
      created() {
        // 在组件创建时自动初始化CSRF（如果需要）
        if (this.$options.csrf === true) {
          this.$csrf.getToken().catch(error => {
            console.error('Failed to initialize CSRF for component:', error)
          })
        }
      }
    })
    
    // 添加全局指令
    Vue.directive('csrf-protect', {
      bind(el, binding, vnode) {
        // 为表单添加CSRF保护
        if (el.tagName === 'FORM') {
          el.addEventListener('submit', async (event) => {
            try {
              const token = await Vue.prototype.$csrf.getToken()
              
              // 添加隐藏的CSRF字段
              let csrfInput = el.querySelector('input[name="_csrf"]')
              if (!csrfInput) {
                csrfInput = document.createElement('input')
                csrfInput.type = 'hidden'
                csrfInput.name = '_csrf'
                el.appendChild(csrfInput)
              }
              csrfInput.value = token
              
            } catch (error) {
              console.error('Failed to add CSRF token to form:', error)
              if (binding.modifiers.strict) {
                event.preventDefault()
              }
            }
          })
        }
      }
    })
    
    // 保存初始化Promise以供外部使用
    Vue.prototype.$csrfInit = initPromise
    
    console.info('Vue CSRF protection plugin installed')
  }
}

/**
 * 自动安装（如果在浏览器环境中直接引入）
 */
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(exports.default)
}