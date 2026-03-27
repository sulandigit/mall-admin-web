/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.scss' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module '*.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module 'js-cookie' {
  const Cookies: any
  export default Cookies
}

declare module 'nprogress' {
  const NProgress: any
  export default NProgress
}

declare module 'echarts' {
  const echarts: any
  export default echarts
}

// Vite环境变量
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_BASE_API: string
  readonly VITE_APP_ENV: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}