import Vue from 'vue'

import 'normalize.css/normalize.css'// A modern alternative to CSS resets

// 按需引入Element UI组件
import {
  Pagination, Dialog, Autocomplete, Dropdown, DropdownMenu, DropdownItem,
  Menu, Submenu, MenuItem, MenuItemGroup, Input, InputNumber, Radio, RadioGroup, RadioButton,
  Checkbox, CheckboxButton, CheckboxGroup, Switch, Select, Option, OptionGroup,
  Button, ButtonGroup, Table, TableColumn, DatePicker, TimeSelect, TimePicker,
  Popover, Tooltip, Breadcrumb, BreadcrumbItem, Form, FormItem, Tabs, TabPane,
  Tag, Tree, Alert, Slider, Icon, Row, Col, Upload, Progress, Spinner,
  Badge, Card, Rate, Steps, Step, Carousel, CarouselItem, Collapse, CollapseItem,
  Cascader, ColorPicker, Transfer, Container, Header, Aside, Main, Footer,
  Timeline, TimelineItem, Link, Divider, Image, Calendar, Backtop, PageHeader, CascaderPanel,
  Loading, MessageBox, Message, Notification
} from 'element-ui'
import locale from 'element-ui/lib/locale/lang/zh-CN'

import '@/styles/index.scss' // global css

import App from './App'
import router from './router'
import store from './store'

import '@/icons' // icon
import '@/permission' // permission control

// 注册Element UI组件
const components = [
  Pagination, Dialog, Autocomplete, Dropdown, DropdownMenu, DropdownItem,
  Menu, Submenu, MenuItem, MenuItemGroup, Input, InputNumber, Radio, RadioGroup, RadioButton,
  Checkbox, CheckboxButton, CheckboxGroup, Switch, Select, Option, OptionGroup,
  Button, ButtonGroup, Table, TableColumn, DatePicker, TimeSelect, TimePicker,
  Popover, Tooltip, Breadcrumb, BreadcrumbItem, Form, FormItem, Tabs, TabPane,
  Tag, Tree, Alert, Slider, Icon, Row, Col, Upload, Progress, Spinner,
  Badge, Card, Rate, Steps, Step, Carousel, CarouselItem, Collapse, CollapseItem,
  Cascader, ColorPicker, Transfer, Container, Header, Aside, Main, Footer,
  Timeline, TimelineItem, Link, Divider, Image, Calendar, Backtop, PageHeader, CascaderPanel
]

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

// 异步加载VCharts（仅在需要时加载）
let vchartsLoaded = false
Vue.prototype.$loadVCharts = function() {
  if (!vchartsLoaded) {
    return import('v-charts').then(module => {
      Vue.use(module.default)
      vchartsLoaded = true
      return module.default
    })
  }
  return Promise.resolve()
}

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
