// Element Plus 组件自动导入配置
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')

// 由于使用webpack 3，使用手动配置方式
const elementPlusConfig = {
  // 自动导入Element Plus组件
  components: {
    resolvers: [
      ElementPlusResolver({
        // 自动导入样式
        importStyle: 'sass'
      })
    ]
  },
  
  // 按需导入的组件列表
  includedComponents: [
    'ElButton', 'ElInput', 'ElSelect', 'ElForm', 'ElFormItem',
    'ElTable', 'ElTableColumn', 'ElPagination', 'ElCard',
    'ElDialog', 'ElLoading', 'ElMessage', 'ElMessageBox',
    'ElMenu', 'ElMenuItem', 'ElSubmenu', 'ElBreadcrumb', 'ElBreadcrumbItem',
    'ElDropdown', 'ElDropdownMenu', 'ElDropdownItem',
    'ElRow', 'ElCol', 'ElRadio', 'ElRadioGroup', 'ElCheckbox', 'ElCheckboxGroup',
    'ElSwitch', 'ElUpload', 'ElDatePicker', 'ElTimePicker', 'ElCascader',
    'ElTree', 'ElTabs', 'ElTabPane', 'ElTag', 'ElBadge', 'ElAlert',
    'ElSteps', 'ElStep', 'ElTooltip', 'ElPopover', 'ElCollapse', 'ElCollapseItem'
  ]
}

module.exports = elementPlusConfig