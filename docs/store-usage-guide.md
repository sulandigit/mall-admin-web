# Vuex Store 使用文档

## 目录

1. [架构概览](#架构概览)
2. [核心模块](#核心模块)
3. [业务模块](#业务模块)
4. [功能模块](#功能模块)
5. [最佳实践](#最佳实践)
6. [API参考](#api参考)

## 架构概览

新的 Vuex Store 采用模块化架构，按功能领域划分为三大类：

```
src/store/
├── index.js              # Store 主配置文件
├── getters.js            # 全局 getters
├── modules/              # 模块目录
│   ├── app.js            # 应用状态
│   ├── user.js           # 用户认证
│   ├── permission.js     # 权限管理
│   ├── ui.js             # 界面状态
│   ├── pms.js            # 商品管理
│   ├── oms.js            # 订单管理
│   ├── sms.js            # 营销管理
│   ├── ums.js            # 用户权限管理
│   ├── common.js         # 通用数据
│   ├── cache.js          # 缓存管理
│   └── notification.js   # 消息通知
├── plugins/              # Store 插件
│   └── persistence.js    # 持久化插件
└── utils/               # 工具函数
    └── moduleLoader.js   # 模块懒加载
```

## 核心模块

### App 模块 (`app`)

管理应用全局状态，包括侧边栏、设备类型、主题等。

**状态字段：**
- `sidebar`: 侧边栏状态
- `device`: 设备类型 ('desktop' | 'mobile')
- `language`: 当前语言
- `theme`: 当前主题
- `loading`: 全局加载状态
- `size`: 组件尺寸

**使用示例：**
```javascript
// 获取状态
computed: {
  ...mapGetters('app', ['sidebar', 'device', 'theme', 'loading'])
}

// 触发操作
methods: {
  toggleSidebar() {
    this.$store.dispatch('app/toggleSideBar')
  },
  
  changeTheme(theme) {
    this.$store.dispatch('app/setTheme', theme)
  }
}
```

### User 模块 (`user`)

管理用户认证和会话状态。

**状态字段：**
- `token`: 认证令牌
- `userInfo`: 用户详细信息
- `roles`: 用户角色
- `permissions`: 用户权限
- `loginTime`: 登录时间
- `lastActivity`: 最后活动时间

**使用示例：**
```javascript
// 用户登录
async login() {
  try {
    await this.$store.dispatch('user/login', {
      username: this.form.username,
      password: this.form.password
    })
    
    // 获取用户信息
    await this.$store.dispatch('user/getInfo')
    
    this.$router.push('/')
  } catch (error) {
    this.$message.error('登录失败')
  }
}

// 检查权限
computed: {
  canEdit() {
    return this.$store.getters['user/hasPermission']('product:edit')
  }
}
```

### Permission 模块 (`permission`)

管理路由权限和菜单权限。

**使用示例：**
```javascript
// 生成路由
async generateRoutes() {
  const userInfo = await this.$store.dispatch('user/getInfo')
  
  await this.$store.dispatch('permission/generateRoutes', {
    menus: userInfo.menus,
    username: userInfo.username
  })
  
  const accessRoutes = this.$store.getters['permission/addRouters']
  this.$router.addRoutes(accessRoutes)
}
```

### UI 模块 (`ui`)

管理界面状态，如面包屑、标签页等。

**使用示例：**
```javascript
// 添加标签页
addTab(route) {
  this.$store.dispatch('ui/addTab', {
    name: route.name,
    path: route.path,
    title: route.meta.title,
    closable: true
  })
}

// 设置面包屑
setBreadcrumb() {
  const breadcrumb = [
    { text: '首页', to: '/' },
    { text: '商品管理', to: '/product' },
    { text: '商品列表', to: '' }
  ]
  this.$store.dispatch('ui/setBreadcrumb', breadcrumb)
}
```

## 业务模块

### PMS 商品管理模块 (`pms`)

管理商品、分类、品牌等相关数据。

**主要功能：**
- 商品列表管理
- 商品分类管理
- 品牌管理
- 商品属性管理

**使用示例：**
```javascript
// 获取商品列表
async fetchProducts() {
  this.loading = true
  try {
    await this.$store.dispatch('pms/fetchProductList', {
      pageNum: this.currentPage,
      pageSize: this.pageSize,
      keyword: this.searchKeyword
    })
    
    this.products = this.$store.getters['pms/products']
    this.total = this.$store.getters['pms/productTotal']
  } finally {
    this.loading = false
  }
}

// 创建商品
async createProduct() {
  await this.$store.dispatch('pms/createProduct', this.form)
  this.$message.success('商品创建成功')
  this.fetchProducts()
}
```

### OMS 订单管理模块 (`oms`)

管理订单和退货申请相关数据。

**使用示例：**
```javascript
// 获取订单列表
async fetchOrders() {
  await this.$store.dispatch('oms/fetchOrderList', {
    pageNum: 1,
    pageSize: 10,
    status: this.statusFilter
  })
  
  this.orders = this.$store.getters['oms/orders']
}

// 关闭订单
async closeOrder(orderId) {
  await this.$store.dispatch('oms/closeOrder', {
    ids: [orderId],
    note: '管理员关闭'
  })
  
  this.$message.success('订单已关闭')
  this.fetchOrders()
}
```

### SMS 营销管理模块 (`sms`)

管理优惠券、秒杀活动、广告等营销相关数据。

**使用示例：**
```javascript
// 获取优惠券列表
async fetchCoupons() {
  await this.$store.dispatch('sms/fetchCouponList', {
    pageNum: 1,
    pageSize: 10,
    name: this.searchName
  })
  
  this.coupons = this.$store.getters['sms/coupons']
}

// 创建优惠券
async createCoupon() {
  await this.$store.dispatch('sms/createCoupon', this.couponForm)
  this.$message.success('优惠券创建成功')
}
```

### UMS 用户权限管理模块 (`ums`)

管理后台用户、角色、权限等。

**使用示例：**
```javascript
// 获取管理员列表
async fetchAdmins() {
  await this.$store.dispatch('ums/fetchAdminList', {
    pageNum: 1,
    pageSize: 10,
    keyword: this.searchKeyword
  })
  
  this.admins = this.$store.getters['ums/adminUsers']
}

// 分配角色
async allocRoles(adminId, roleIds) {
  await this.$store.dispatch('ums/allocAdminRoles', {
    adminId,
    roleIds
  })
  
  this.$message.success('角色分配成功')
}
```

## 功能模块

### Common 通用模块 (`common`)

管理字典数据、系统配置和常量。

**使用示例：**
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
```

### Cache 缓存模块 (`cache`)

提供多级缓存功能，支持内存、本地存储和会话存储。

**使用示例：**
```javascript
// 设置缓存
async cacheData() {
  await this.$store.dispatch('cache/setCache', {
    key: 'productList',
    data: this.products,
    type: 'local',
    expiry: Date.now() + 5 * 60 * 1000 // 5分钟过期
  })
}

// 获取缓存
async getCachedData() {
  const result = await this.$store.dispatch('cache/getCache', {
    key: 'productList'
  })
  
  if (result.hit) {
    this.products = result.data
    return true
  }
  
  return false
}
```

### Notification 消息通知模块 (`notification`)

统一管理系统消息和通知。

**使用示例：**
```javascript
// 显示成功消息
showSuccess() {
  this.$store.dispatch('notification/showSuccess', {
    title: '操作成功',
    content: '数据保存成功'
  })
}

// 显示错误消息
showError(error) {
  this.$store.dispatch('notification/showError', {
    title: '操作失败',
    content: error.message || '未知错误'
  })
}

// 监听未读消息
computed: {
  unreadCount() {
    return this.$store.getters['notification/unreadCount']
  }
}
```

## 最佳实践

### 1. 状态访问

**推荐使用命名空间方式：**
```javascript
// ✅ 推荐
computed: {
  ...mapGetters('user', ['isLoggedIn', 'userInfo']),
  ...mapGetters('app', ['loading', 'theme'])
}

// ❌ 不推荐（虽然仍然支持）
computed: {
  ...mapGetters(['token', 'name'])
}
```

### 2. 异步操作处理

```javascript
// ✅ 正确的错误处理
async fetchData() {
  this.loading = true
  
  try {
    await this.$store.dispatch('pms/fetchProductList')
    this.products = this.$store.getters['pms/products']
  } catch (error) {
    this.$store.dispatch('notification/showError', {
      title: '加载失败',
      content: error.message
    })
  } finally {
    this.loading = false
  }
}
```

### 3. 缓存策略

```javascript
// ✅ 智能缓存使用
async loadData() {
  // 先尝试从缓存获取
  const cached = await this.$store.dispatch('cache/getCache', {
    key: 'categoryList'
  })
  
  if (cached.hit) {
    this.categories = cached.data
    return
  }
  
  // 缓存未命中，从API获取
  const response = await this.$store.dispatch('pms/fetchCategories')
  
  // 缓存新数据
  await this.$store.dispatch('cache/setCache', {
    key: 'categoryList',
    data: response,
    type: 'memory',
    expiry: Date.now() + 10 * 60 * 1000 // 10分钟
  })
  
  this.categories = response
}
```

### 4. 权限控制

```javascript
// ✅ 组件级权限控制
computed: {
  canCreate() {
    return this.$store.getters['user/hasPermission']('product:create')
  },
  
  canEdit() {
    return this.$store.getters['user/hasPermission']('product:edit')
  }
},

// 在模板中使用
// <el-button v-if="canCreate" @click="createProduct">创建商品</el-button>
```

### 5. 模块懒加载

```javascript
// ✅ 路由级模块加载
export default {
  async beforeRouteEnter(to, from, next) {
    const store = this.$store
    
    // 确保相关模块已加载
    if (!store.$moduleLoader.isModuleLoaded('pms')) {
      await store.$moduleLoader.loadModule('pms')
    }
    
    next()
  }
}
```

## API参考

### 全局 Getters

```javascript
// 快捷访问（向后兼容）
this.$store.getters.sidebar
this.$store.getters.token
this.$store.getters.isLoggedIn

// 组合数据
this.$store.getters.userProfile      // 用户完整信息
this.$store.getters.appStatus        // 应用状态摘要
this.$store.getters.businessSummary  // 业务数据摘要
```

### 持久化 API

```javascript
// 手动持久化
this.$store.$persistence.persistModule('user')

// 检查持久化数据
this.$store.$persistence.hasPersistedData('app')

// 获取持久化信息
this.$store.$persistence.getPersistedInfo('user')

// 清除持久化数据
this.$store.$persistence.clearModule('cache')
this.$store.$persistence.clearAll()
```

### 模块加载 API

```javascript
// 加载单个模块
await this.$store.$moduleLoader.loadModule('pms')

// 批量加载
const result = await this.$store.$moduleLoader.loadModules(['pms', 'oms'])

// 检查加载状态
this.$store.$moduleLoader.isModuleLoaded('pms')
this.$store.$moduleLoader.getModuleLoadState('pms')

// 获取加载统计
this.$store.$moduleLoader.getModuleLoadStatistics()
```

### 开发调试 API

```javascript
// 开发环境可用
window.$storeDebug.getModuleStats()     // 模块加载统计
window.$storeDebug.getCacheStats()      // 缓存统计
window.$storeDebug.getNotificationStats() // 通知统计
window.$storeDebug.clearAllPersistence() // 清除持久化数据
window.$storeDebug.testNotifications()  // 测试通知功能
```

## 性能监控

### 缓存命中率监控

```javascript
// 定期检查缓存性能
setInterval(() => {
  const stats = this.$store.getters['cache/statistics']
  console.log(`Cache hit rate: ${stats.hitRate}%`)
}, 30000)
```

### 模块加载监控

```javascript
// 监控模块加载状态
const stats = this.$store.$moduleLoader.getModuleLoadStatistics()
console.log('Module load stats:', stats)
```

这个新的 Vuex Store 架构为 mall-admin-web 项目提供了强大的状态管理能力，包括模块化设计、智能缓存、状态持久化和性能优化等特性。通过合理使用这些功能，可以显著提升应用的性能和用户体验。