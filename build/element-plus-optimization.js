/**
 * Element Plus 性能优化配置
 * 针对 Vue 2.7 + Element Plus 的优化策略
 */

// 按需导入优化配置
const optimizationConfig = {
  // Element Plus 组件按需导入列表
  components: [
    // 基础组件
    'ElButton', 'ElButtonGroup',
    'ElInput', 'ElInputNumber', 'ElTextarea',
    'ElSelect', 'ElOption', 'ElOptionGroup',
    'ElForm', 'ElFormItem',
    
    // 数据展示
    'ElTable', 'ElTableColumn',
    'ElPagination',
    'ElCard',
    'ElTag', 'ElBadge',
    
    // 反馈组件
    'ElDialog', 'ElDrawer',
    'ElLoading', 'ElMessage', 'ElMessageBox', 'ElNotification',
    'ElAlert', 'ElPopover', 'ElTooltip',
    
    // 导航组件
    'ElMenu', 'ElMenuItem', 'ElSubmenu', 'ElMenuItemGroup',
    'ElBreadcrumb', 'ElBreadcrumbItem',
    'ElDropdown', 'ElDropdownMenu', 'ElDropdownItem',
    'ElTabs', 'ElTabPane',
    'ElSteps', 'ElStep',
    
    // 布局组件
    'ElRow', 'ElCol',
    'ElContainer', 'ElHeader', 'ElMain', 'ElAside', 'ElFooter',
    
    // 表单组件
    'ElRadio', 'ElRadioGroup', 'ElRadioButton',
    'ElCheckbox', 'ElCheckboxGroup', 'ElCheckboxButton',
    'ElSwitch',
    'ElDatePicker', 'ElTimePicker', 'ElTimeSelect',
    'ElUpload',
    'ElRate', 'ElSlider',
    'ElColorPicker',
    'ElTransfer',
    'ElCascader',
    'ElTree', 'ElTreeSelect',
    
    // 其他组件
    'ElCollapse', 'ElCollapseItem',
    'ElCarousel', 'ElCarouselItem',
    'ElImage',
    'ElBackTop',
    'ElDivider',
    'ElTimeline', 'ElTimelineItem',
    'ElProgress',
    'ElSkeleton', 'ElSkeletonItem',
    'ElEmpty',
    'ElDescriptions', 'ElDescriptionsItem',
    'ElResult',
    'ElStatistic'
  ],
  
  // 图标按需导入（常用图标）
  icons: [
    'Search', 'Edit', 'Delete', 'Plus', 'Minus',
    'Check', 'Close', 'Warning', 'Info', 'QuestionFilled',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'Upload', 'Download', 'Refresh', 'Setting',
    'User', 'Lock', 'View', 'Hide', 'Document',
    'Folder', 'FolderOpened', 'Picture', 'VideoCamera',
    'Phone', 'Message', 'ChatLineRound', 'Location',
    'Timer', 'Calendar', 'Clock', 'Coin',
    'ShoppingCart', 'Goods', 'Box', 'Present',
    'Tickets', 'Flag', 'Star', 'StarFilled'
  ]
}

// CSS 优化配置
const cssOptimization = {
  // 压缩配置
  compression: {
    // 移除未使用的CSS
    purgeCSS: true,
    // 压缩CSS
    minify: true,
    // 合并相同规则
    merge: true
  },
  
  // 主题变量优化
  variables: {
    // 主色调
    '--el-color-primary': '#409EFF',
    '--el-color-primary-light-3': '#79bbff',
    '--el-color-primary-light-5': '#a0cfff',
    '--el-color-primary-light-7': '#c6e2ff',
    '--el-color-primary-light-8': '#d9ecff',
    '--el-color-primary-light-9': '#ecf5ff',
    '--el-color-primary-dark-2': '#337ecc',
    
    // 功能色
    '--el-color-success': '#67C23A',
    '--el-color-warning': '#E6A23C',
    '--el-color-danger': '#F56C6C',
    '--el-color-error': '#F56C6C',
    '--el-color-info': '#909399',
    
    // 字体大小
    '--el-font-size-extra-large': '20px',
    '--el-font-size-large': '18px',
    '--el-font-size-medium': '16px',
    '--el-font-size-base': '14px',
    '--el-font-size-small': '13px',
    '--el-font-size-extra-small': '12px'
  }
}

// Webpack 优化建议
const webpackOptimization = {
  // 代码分割
  splitChunks: {
    cacheGroups: {
      elementPlus: {
        name: 'element-plus',
        test: /[\\/]node_modules[\\/]element-plus[\\/]/,
        chunks: 'all',
        priority: 10
      }
    }
  },
  
  // 外部依赖
  externals: {
    // 如果使用 CDN，可以配置外部依赖
    // 'element-plus': 'ElementPlus'
  }
}

// 性能监控配置
const performanceConfig = {
  // 组件渲染性能
  componentPerformance: {
    // 大表格优化
    tableVirtualScroll: true,
    // 懒加载阈值
    lazyLoadThreshold: 50,
    // 防抖延迟
    debounceDelay: 300
  },
  
  // 资源加载优化
  resourceOptimization: {
    // 图片懒加载
    imageLazyLoad: true,
    // 预加载关键资源
    preloadCriticalResources: true,
    // 资源缓存策略
    cacheStrategy: 'aggressive'
  }
}

// 兼容性检查
const compatibilityCheck = {
  // 浏览器支持
  browsers: [
    'Chrome >= 60',
    'Firefox >= 60',
    'Safari >= 12',
    'Edge >= 79'
  ],
  
  // Vue 版本检查
  vueVersion: '^2.7.0',
  
  // Element Plus 版本
  elementPlusVersion: '^2.4.0'
}

module.exports = {
  optimizationConfig,
  cssOptimization,
  webpackOptimization,
  performanceConfig,
  compatibilityCheck
}