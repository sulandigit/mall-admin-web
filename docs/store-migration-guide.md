# Vuex Store 迁移指南

## 概述

本指南将帮助您将现有的 mall-admin-web 项目迁移到新的 Vuex Store 架构。新架构提供了更好的模块化、缓存机制、状态持久化和性能优化。

## 迁移前准备

### 1. 备份现有代码
```bash
git checkout -b store-migration-backup
git add .
git commit -m "Backup before store migration"
```

### 2. 检查依赖版本
确保以下依赖版本兼容：
- Vue: 2.x
- Vuex: 3.x
- Vue Router: 3.x

## 迁移步骤

### 第一步：更新 Store 结构

#### 1.1 保持现有模块兼容性
现有的 `app`、`user`、`permission` 模块已经升级，但保持向后兼容：

```javascript
// 旧的访问方式仍然有效
this.$store.getters.sidebar
this.$store.getters.token
this.$store.getters.roles

// 新的命名空间访问方式
this.$store.getters['app/sidebar']
this.$store.getters['user/token']
this.$store.getters['user/roles']
```

#### 1.2 更新组件中的状态访问

**原有方式（仍然支持）：**
```javascript
import { mapGetters } from 'vuex'

computed: {
  ...mapGetters([
    'sidebar',
    'device',
    'token',
    'avatar',
    'name',
    'roles'
  ])
}
```

**推荐的新方式：**
```javascript
import { mapGetters } from 'vuex'

computed: {
  ...mapGetters('app', ['sidebar', 'device', 'language', 'theme']),
  ...mapGetters('user', ['token', 'avatar', 'name', 'roles', 'isLoggedIn']),
  ...mapGetters('ui', ['breadcrumb', 'tabs', 'fullscreen'])
}
```

### 第二步：更新 Actions 调用

#### 2.1 核心模块 Actions

**用户相关操作：**
```javascript
// 旧方式（仍然支持，但推荐使用新方式）
this.$store.dispatch('Login', userInfo)
this.$store.dispatch('GetInfo')
this.$store.dispatch('LogOut')

// 新方式（推荐）
this.$store.dispatch('user/login', userInfo)
this.$store.dispatch('user/getInfo')
this.$store.dispatch('user/logout')
```

**应用状态操作：**
```javascript
// 旧方式
this.$store.dispatch('ToggleSideBar')
this.$store.dispatch('CloseSideBar', { withoutAnimation: false })

// 新方式
this.$store.dispatch('app/toggleSideBar')
this.$store.dispatch('app/closeSideBar', { withoutAnimation: false })
```

#### 2.2 新增模块 Actions

**商品管理（PMS）：**
```javascript
// 获取商品列表
await this.$store.dispatch('pms/fetchProductList', {
  pageNum: 1,
  pageSize: 10,
  keyword: 'search term'
})

// 创建商品
await this.$store.dispatch('pms/createProduct', productData)

// 获取分类列表
await this.$store.dispatch('pms/fetchCategories')
```

**订单管理（OMS）：**
```javascript
// 获取订单列表
await this.$store.dispatch('oms/fetchOrderList', params)

// 关闭订单
await this.$store.dispatch('oms/closeOrder', { ids: [1, 2, 3] })
```

### 第三步：使用新功能

#### 3.1 消息通知系统

```javascript
// 显示不同类型的消息
this.$store.dispatch('notification/showSuccess', {
  title: '操作成功',
  content: '数据保存成功'
})

this.$store.dispatch('notification/showError', {
  title: '操作失败',
  content: '网络连接错误'
})

// 在组件中监听未读消息
computed: {
  unreadCount() {
    return this.$store.getters['notification/unreadCount']
  }
}
```

#### 3.2 缓存系统

```javascript
// 设置缓存
await this.$store.dispatch('cache/setCache', {
  key: 'productList',
  data: products,
  type: 'local', // 'memory', 'local', 'session'
  expiry: Date.now() + 5 * 60 * 1000 // 5分钟后过期
})

// 获取缓存
const cacheResult = await this.$store.dispatch('cache/getCache', {
  key: 'productList'
})

if (cacheResult.hit) {
  // 使用缓存数据
  this.products = cacheResult.data
} else {
  // 从API获取数据
  this.fetchProducts()
}
```

#### 3.3 UI 状态管理

```javascript
// 添加标签页
this.$store.dispatch('ui/addTab', {
  name: 'ProductDetail',
  path: '/product/detail/123',
  title: '商品详情',
  closable: true
})

// 设置面包屑
this.$store.dispatch('ui/setBreadcrumb', [
  { text: '首页', to: '/' },
  { text: '商品管理', to: '/product' },
  { text: '商品详情', to: '' }
])
```

#### 3.4 通用配置和字典

```javascript
// 获取字典数据
computed: {
  genderOptions() {
    return this.$store.getters['common/getDictionary']('gender')
  },
  
  orderStatusOptions() {
    return this.$store.getters['common/getDictionary']('orderStatus')
  }
}

// 获取配置
computed: {
  pageSize() {
    return this.$store.getters['common/getConfig']('pagination.defaultPageSize', 10)
  }
}

// 获取常量
computed: {
  maxFileSize() {
    return this.$store.getters['common/getConstant']('upload.maxSize')
  }
}
```

### 第四步：路由整合

#### 4.1 在路由守卫中使用新的状态

```javascript
// router/index.js
import store from '@/store'

router.beforeEach(async (to, from, next) => {
  // 检查登录状态
  if (store.getters['user/isLoggedIn']) {
    // 更新用户活动时间
    store.dispatch('user/updateActivity')
    
    // 检查会话是否过期
    const isValid = await store.dispatch('user/checkSessionExpiry')
    if (!isValid) {
      store.dispatch('notification/showWarning', {
        title: '会话过期',
        content: '请重新登录'
      })
      next('/login')
      return
    }
    
    // 根据路由加载相应的模块
    if (store.$moduleLoader) {
      await store.$moduleLoader.loadModulesForRoute(to.path)
    }
  }
  
  next()
})
```

#### 4.2 路由级别的模块懒加载

```javascript
// 在路由组件中按需加载模块
export default {
  async beforeRouteEnter(to, from, next) {
    const store = this.$store
    
    // 确保PMS模块已加载
    if (store.$moduleLoader && !store.$moduleLoader.isModuleLoaded('pms')) {
      await store.$moduleLoader.loadModule('pms')
    }
    
    next()
  }
}
```

## 性能优化建议

### 1. 使用缓存策略

```javascript
// 在组件中实现智能缓存
async fetchData() {
  // 先尝试从缓存获取
  const cached = await this.$store.dispatch('cache/getCache', {
    key: 'productList'
  })
  
  if (cached.hit) {
    this.products = cached.data
    this.loading = false
    return
  }
  
  // 缓存未命中，从API获取
  this.loading = true
  try {
    const response = await this.$store.dispatch('pms/fetchProductList')
    
    // 缓存数据
    await this.$store.dispatch('cache/setCache', {
      key: 'productList',
      data: response.list,
      type: 'memory',
      expiry: Date.now() + 5 * 60 * 1000
    })
    
    this.products = response.list
  } finally {
    this.loading = false
  }
}
```

### 2. 合理使用持久化

```javascript
// 敏感数据设置较短的过期时间
const persistenceConfig = {
  modules: {
    user: {
      paths: ['token', 'userInfo'],
      expires: 7 * 24 * 60 * 60 * 1000 // 7天
    },
    app: {
      paths: ['theme', 'language'],
      // 永久保存用户偏好
    }
  }
}
```

### 3. 监控性能指标

```javascript
// 在开发环境中监控缓存性能
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const cacheStats = this.$store.getters['cache/statistics']
    console.log('Cache hit rate:', cacheStats.hitRate + '%')
  }, 30000)
}
```

## 常见问题解决

### 1. 模块加载失败

```javascript
// 处理模块加载失败的情况
try {
  await this.$store.$moduleLoader.loadModule('pms')
} catch (error) {
  this.$store.dispatch('notification/showError', {
    title: '模块加载失败',
    content: '请刷新页面重试'
  })
}
```

### 2. 状态同步问题

```javascript
// 确保状态在组件间正确同步
watch: {
  '$store.state.user.token'(newVal, oldVal) {
    if (!newVal && oldVal) {
      // token被清除，执行登出逻辑
      this.$router.push('/login')
    }
  }
}
```

### 3. 内存泄漏预防

```javascript
// 在组件销毁时清理
beforeDestroy() {
  // 清理特定缓存
  this.$store.dispatch('cache/deleteCache', {
    key: 'componentSpecificData'
  })
  
  // 清理过期通知
  this.$store.dispatch('notification/cleanupExpiredNotifications')
}
```

## 测试迁移结果

### 1. 功能测试清单

- [ ] 用户登录/登出功能正常
- [ ] 权限验证工作正确
- [ ] 菜单显示和路由跳转正常
- [ ] 侧边栏状态保持正确
- [ ] 主题和语言切换正常
- [ ] 数据列表加载和分页正常
- [ ] 表单提交和验证正常
- [ ] 消息通知显示正确

### 2. 性能测试

```javascript
// 测试缓存命中率
const stats = this.$store.getters['cache/statistics']
console.log('Cache hit rate:', stats.hitRate)

// 测试模块加载时间
console.time('module-load')
await this.$store.$moduleLoader.loadModule('pms')
console.timeEnd('module-load')
```

### 3. 浏览器开发工具验证

```javascript
// 在控制台检查状态
console.log('Store state:', window.$store.state)
console.log('Module load stats:', window.$storeDebug.getModuleStats())
console.log('Cache stats:', window.$storeDebug.getCacheStats())
```

## 回滚计划

如果迁移出现问题，可以快速回滚：

```bash
# 回滚到迁移前的版本
git checkout store-migration-backup
git checkout -b rollback-from-migration

# 或者选择性恢复某些文件
git checkout store-migration-backup -- src/store/
```

## 后续优化建议

1. **监控和日志**：添加性能监控和错误日志收集
2. **缓存策略优化**：根据实际使用情况调整缓存时间
3. **模块拆分**：将大型业务模块进一步细分
4. **SSR支持**：如需服务端渲染，考虑状态序列化
5. **TypeScript迁移**：逐步迁移到TypeScript以获得更好的类型安全

## 支持和帮助

如果在迁移过程中遇到问题：

1. 查看控制台错误信息
2. 检查浏览器开发工具中的Vuex状态
3. 使用开发环境的调试功能：`window.$storeDebug`
4. 参考单元测试用例了解正确用法

迁移完成后，您将拥有一个更加健壮、高性能和易维护的状态管理系统！