declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module 'element-ui'
declare module 'element-ui/lib/locale/lang/zh-CN'
declare module 'element-ui/lib/locale'
declare module 'js-cookie'
declare module 'nprogress'
declare module 'normalize.css'
declare module 'echarts'
declare module 'v-charts'
declare module 'v-distpicker'

// 全局类型声明
declare global {
  interface Window {
    __VUE_DEVTOOLS_GLOBAL_HOOK__?: any
  }
}

// 模块扩展
declare module 'vue/types/vue' {
  interface Vue {
    $message: any
    $confirm: any
    $loading: any
    $notify: any
  }
}

export {}