/**
 * 组件相关类型定义
 */

import Vue from 'vue'

// 基础组件 Props 接口
export interface BaseComponentProps {
  className?: string
  style?: string | object
}

// 表格列定义
export interface TableColumn {
  prop?: string
  label: string
  width?: string | number
  minWidth?: string | number
  fixed?: boolean | string
  sortable?: boolean | string
  align?: 'left' | 'center' | 'right'
  headerAlign?: 'left' | 'center' | 'right'
  showOverflowTooltip?: boolean
  formatter?: Function
  type?: 'selection' | 'index' | 'expand'
  index?: number | Function
  columnKey?: string
  filters?: Array<{ text: string; value: any }>
  filterMethod?: Function
  filteredValue?: any[]
}

// 分页组件 Props
export interface PaginationProps extends BaseComponentProps {
  currentPage: number
  pageSize: number
  total: number
  pageSizes?: number[]
  layout?: string
  background?: boolean
  small?: boolean
  hideOnSinglePage?: boolean
}

// 分页组件事件
export interface PaginationEvents {
  'current-change': (page: number) => void
  'size-change': (size: number) => void
  'prev-click': (page: number) => void
  'next-click': (page: number) => void
}

// 表单验证规则
export interface FormRule {
  required?: boolean
  message?: string
  type?: 'string' | 'number' | 'boolean' | 'method' | 'regexp' | 'integer' | 'float' | 'array' | 'object' | 'enum' | 'date' | 'url' | 'hex' | 'email'
  trigger?: 'blur' | 'change' | 'submit'
  min?: number
  max?: number
  len?: number
  pattern?: RegExp
  validator?: (rule: any, value: any, callback: Function) => void
  asyncValidator?: (rule: any, value: any, callback: Function) => Promise<void>
  transform?: (value: any) => any
}

// 表单验证规则集合
export interface FormRules {
  [key: string]: FormRule | FormRule[]
}

// 对话框 Props
export interface DialogProps extends BaseComponentProps {
  visible: boolean
  title?: string
  width?: string
  fullscreen?: boolean
  top?: string
  modal?: boolean
  modalAppendToBody?: boolean
  appendToBody?: boolean
  lockScroll?: boolean
  customClass?: string
  closeOnClickModal?: boolean
  closeOnPressEscape?: boolean
  showClose?: boolean
  beforeClose?: (done: Function) => void
  center?: boolean
  destroyOnClose?: boolean
}

// 上传组件 Props
export interface UploadProps extends BaseComponentProps {
  action: string
  headers?: object
  multiple?: boolean
  data?: object
  name?: string
  withCredentials?: boolean
  showFileList?: boolean
  drag?: boolean
  accept?: string
  beforeUpload?: (file: File) => boolean | Promise<File>
  beforeRemove?: (file: File, fileList: File[]) => boolean | Promise<boolean>
  onRemove?: (file: File, fileList: File[]) => void
  onChange?: (file: File, fileList: File[]) => void
  onPreview?: (file: File) => void
  onSuccess?: (response: any, file: File, fileList: File[]) => void
  onError?: (err: Error, file: File, fileList: File[]) => void
  onProgress?: (event: ProgressEvent, file: File, fileList: File[]) => void
  fileList?: File[]
  autoUpload?: boolean
  listType?: 'text' | 'picture' | 'picture-card'
  httpRequest?: Function
  disabled?: boolean
  limit?: number
  onExceed?: (files: File[], fileList: File[]) => void
}

// Vue 组件类型扩展
export interface VueComponent extends Vue {
  $refs: { [key: string]: Vue | Element | Vue[] | Element[] }
}