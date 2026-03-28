# 国际化多语言支持 - 使用指南

## 概述

本项目已成功集成Vue-i18n国际化支持，提供中英双语切换功能。

## 主要特性

- ✅ 支持中文（zh-CN）和英文（en-US）双语切换
- ✅ 语言选择持久化存储
- ✅ Element UI组件库语言同步切换
- ✅ 日期、时间、货币等格式化工具
- ✅ 语言切换组件
- ✅ 导航菜单国际化
- ✅ 国际化混入(mixin)提供便捷方法

## 目录结构

```
src/
├── i18n/                      # 国际化相关文件
│   ├── index.js              # i18n配置入口
│   ├── locales/              # 语言包目录
│   │   ├── zh-CN/           # 中文语言包
│   │   │   ├── common.js    # 通用文本
│   │   │   ├── menu.js      # 菜单文本
│   │   │   ├── form.js      # 表单文本
│   │   │   ├── table.js     # 表格文本
│   │   │   ├── message.js   # 消息提示文本
│   │   │   ├── business.js  # 业务模块文本
│   │   │   └── index.js     # 中文语言包入口
│   │   └── en-US/           # 英文语言包（相同结构）
│   ├── utils/               # 国际化工具
│   │   ├── formatters.js    # 格式化工具
│   │   └── helpers.js       # 辅助工具
│   └── mixins/              # 国际化混入
│       └── i18nMixin.js
├── store/modules/
│   └── i18n.js              # 国际化状态管理
└── components/
    └── LanguageSwitcher/    # 语言切换组件
        └── index.vue
```

## 使用方法

### 1. 基本翻译

在Vue组件中使用 `$t()` 方法：

```vue
<template>
  <div>
    <h1>{{ $t('menu.dashboard') }}</h1>
    <el-button>{{ $t('common.button.save') }}</el-button>
  </div>
</template>
```

### 2. 语言切换组件

在需要的地方添加语言切换组件：

```vue
<template>
  <language-switcher 
    :show-icon="true" 
    :show-text="true" 
    placement="bottom"
    @language-changed="onLanguageChanged"
  />
</template>

<script>
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default {
  components: {
    LanguageSwitcher
  },
  methods: {
    onLanguageChanged(locale) {
      console.log('语言已切换到:', locale)
    }
  }
}
</script>
```

### 3. 使用国际化混入

引入i18nMixin获得更多便捷方法：

```vue
<script>
import i18nMixin from '@/i18n/mixins/i18nMixin'

export default {
  mixins: [i18nMixin],
  mounted() {
    // 格式化日期
    console.log(this.$formatDate(new Date()))
    
    // 格式化货币
    console.log(this.$formatCurrency(1234.56))
    
    // 获取当前语言
    console.log(this.$currentLanguage)
    
    // 显示本地化消息
    this.$showSuccess('message.success.save')
  }
}
</script>
```

### 4. 格式化工具

直接导入格式化工具：

```javascript
import { formatDate, formatCurrency, formatNumber } from '@/i18n/utils/formatters'

// 格式化日期
const dateStr = formatDate(new Date()) // 中文: 2024年01月01日, 英文: 01/01/2024

// 格式化货币
const currencyStr = formatCurrency(1234.56) // 中文: ¥1,234.56, 英文: $1,234.56

// 格式化数字
const numberStr = formatNumber(1234567, 2) // 1,234,567.00
```

### 5. 在Vuex中切换语言

```javascript
// 切换到英文
this.$store.dispatch('i18n/changeLocale', 'en-US')

// 切换到中文
this.$store.dispatch('i18n/changeLocale', 'zh-CN')
```

## 语言包结构

### 命名规范

使用层级结构组织翻译键：

```javascript
// zh-CN/common.js
export default {
  button: {
    save: '保存',
    cancel: '取消',
    delete: '删除'
  },
  status: {
    enable: '启用',
    disable: '禁用'
  }
}
```

### 添加新的翻译

1. 在 `src/i18n/locales/zh-CN/` 和 `src/i18n/locales/en-US/` 对应文件中添加翻译键值对
2. 确保两种语言的键结构完全一致
3. 在组件中使用 `$t('模块.键名')` 访问

## 菜单国际化

路由配置中添加 `i18n` 字段：

```javascript
{
  path: '/product',
  name: 'product',
  component: () => import('@/views/product/index'),
  meta: {
    title: '商品管理',  // 默认标题
    icon: 'product',
    i18n: 'menu.product.title'  // 国际化键
  }
}
```

## Element UI组件国际化

Element UI组件的语言会自动随系统语言切换，无需额外配置。

## 最佳实践

1. **统一管理**: 所有文本都通过语言包管理，避免硬编码
2. **模块化**: 按功能模块分割语言包文件
3. **一致性**: 确保中英文语言包结构完全一致
4. **命名规范**: 使用有意义的层级结构命名翻译键
5. **测试**: 切换语言后测试所有功能正常

## 扩展新语言

1. 在 `src/i18n/locales/` 下创建新语言目录（如 `ja-JP`）
2. 复制现有语言包结构并翻译
3. 在 `src/i18n/index.js` 中添加新语言配置
4. 更新 `AVAILABLE_LOCALES` 数组

## 故障排除

### 常见问题

1. **翻译不显示**: 检查翻译键是否正确，语言包是否正确导入
2. **Element UI语言不切换**: 确保main.js中的Element UI配置正确
3. **格式化不正确**: 检查moment.js locale设置

### 调试工具

在浏览器控制台中查看：

```javascript
// 当前语言
console.log(vm.$i18n.locale)

// 所有翻译消息
console.log(vm.$i18n.messages)

// 检查翻译键是否存在
console.log(vm.$te('menu.dashboard'))
```

## 性能优化

- 语言包按需加载
- 合理的缓存策略
- 避免频繁的语言切换
- 大型应用可考虑懒加载语言包