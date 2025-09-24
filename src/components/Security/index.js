/**
 * 安全组件索引文件
 * 统一导出所有安全相关组件
 */
import SafeForm from './SafeForm.vue'
import XSSProtection from './XSSProtection.vue'

// 组件列表
const components = {
  SafeForm,
  XSSProtection
}

// 安装函数
const install = function(Vue) {
  Object.keys(components).forEach(name => {
    Vue.component(name, components[name])
  })
}

// 如果是直接引入的
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export default {
  install,
  SafeForm,
  XSSProtection
}

// 单独导出组件
export {
  SafeForm,
  XSSProtection
}