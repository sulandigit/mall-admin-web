import LazyLoad from './lazy'

// 指令集合
const directives = {
  lazy: LazyLoad
}

// 安装指令的方法
const install = function(Vue) {
  Object.keys(directives).forEach(key => {
    Vue.directive(key, directives[key])
  })
}

// 导出单个指令，也可以导出整个对象
export { LazyLoad }

// 默认导出install方法
export default {
  install
}