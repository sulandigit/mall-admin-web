// Element UI 按需引入配置
// 基于组件使用统计分析结果，引入高频使用的组件

import {
  // 基础组件 - 高频使用
  Button,
  Input,
  Select,
  Option,
  Radio,
  RadioGroup,
  RadioButton,
  Checkbox,
  CheckboxGroup,
  Switch,
  DatePicker,
  TimePicker,
  Cascader,
  
  // 布局组件 - 高频使用
  Row,
  Col,
  Card,
  
  // 表单组件 - 高频使用
  Form,
  FormItem,
  
  // 数据展示组件 - 高频使用
  Table,
  TableColumn,
  Pagination,
  
  // 导航组件
  Menu,
  MenuItem,
  Submenu,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Steps,
  Step,
  
  // 反馈组件
  Dialog,
  Popover,
  
  // 其他组件
  Upload,
  Transfer,
  Tree,
  Tabs,
  TabPane,
  
  // 面包屑导航
  Breadcrumb,
  BreadcrumbItem,
  
  // 消息提示
  Loading,
  MessageBox,
  Message,
  Notification
} from 'element-ui'

import locale from 'element-ui/lib/locale/lang/zh-CN'

const components = [
  Button,
  Input,
  Select,
  Option,
  Radio,
  RadioGroup,
  RadioButton,
  Checkbox,
  CheckboxGroup,
  Switch,
  DatePicker,
  TimePicker,
  Cascader,
  Row,
  Col,
  Card,
  Form,
  FormItem,
  Table,
  TableColumn,
  Pagination,
  Menu,
  MenuItem,
  Submenu,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Steps,
  Step,
  Dialog,
  Popover,
  Upload,
  Transfer,
  Tree,
  Tabs,
  TabPane,
  Breadcrumb,
  BreadcrumbItem
]

const install = function (Vue, opts = {}) {
  locale.use(opts.locale || locale)
  
  components.forEach(component => {
    Vue.component(component.name, component)
  })

  Vue.use(Loading.directive)

  Vue.prototype.$loading = Loading.service
  Vue.prototype.$msgbox = MessageBox
  Vue.prototype.$alert = MessageBox.alert
  Vue.prototype.$confirm = MessageBox.confirm
  Vue.prototype.$prompt = MessageBox.prompt
  Vue.prototype.$notify = Notification
  Vue.prototype.$message = Message

  return Vue
}

export default {
  install,
  locale: locale.use,
  ...components
}