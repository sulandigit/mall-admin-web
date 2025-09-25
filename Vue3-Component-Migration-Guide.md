# Mall-Admin-Web 组件迁移指南

## 概述

本指南详细说明了Mall-Admin-Web项目中25个Vue组件从Vue 2迁移到Vue 3的具体步骤、API变更和注意事项。每个组件都包含了迁移前后的代码对比和最佳实践建议。

## 迁移优先级分级

### 🔥 高优先级 (核心业务组件)
- `views/login/index.vue` - 登录页面
- `views/layout/Layout.vue` - 主布局
- `views/home/index.vue` - 首页仪表盘
- `views/layout/components/Navbar.vue` - 导航栏

### 🟡 中优先级 (重要功能组件)  
- `components/Breadcrumb/index.vue` - 面包屑导航
- `components/SvgIcon/index.vue` - SVG图标
- `views/layout/components/Sidebar/` - 侧边栏相关
- `views/404.vue` - 错误页面

### 🟢 低优先级 (辅助功能组件)
- `components/Hamburger/index.vue` - 汉堡菜单
- `components/ScrollBar/index.vue` - 滚动条
- `components/Tinymce/` - 富文本编辑器
- `components/Upload/` - 文件上传

## 核心组件迁移详解

### 1. 登录组件 (`views/login/index.vue`)

#### 🔍 现状分析
- 包含表单验证逻辑
- 使用Element UI表单组件
- 有用户状态管理
- 包含cookie操作

#### 🛠 迁移步骤

**第一步: Element Plus迁移**
```vue
<!-- 迁移前 (Element UI) -->
<template>
  <el-form ref="loginForm" :model="loginForm" :rules="loginRules">
    <el-form-item prop="username">
      <el-input v-model="loginForm.username" placeholder="请输入用户名">
        <span slot="prefix">
          <svg-icon icon-class="user" class="color-main"></svg-icon>
        </span>
      </el-input>
    </el-form-item>
  </el-form>
</template>

<!-- 迁移后 (Element Plus) -->
<template>
  <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules">
    <el-form-item prop="username">
      <el-input v-model="loginForm.username" placeholder="请输入用户名">
        <template #prefix>
          <svg-icon icon-class="user" class="color-main"></svg-icon>
        </template>
      </el-input>
    </el-form-item>
  </el-form>
</template>
```

**第二步: Composition API重构**
```javascript
// 迁移前 (Options API)
export default {
  name: 'login',
  data() {
    return {
      loginForm: {
        username: '',
        password: '',
      },
      loginRules: {
        username: [{required: true, trigger: 'blur', validator: validateUsername}],
        password: [{required: true, trigger: 'blur', validator: validatePass}]
      },
      loading: false
    }
  },
  methods: {
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true;
          this.$store.dispatch('Login', this.loginForm).then(() => {
            this.$router.push({path: '/'})
          })
        }
      })
    }
  }
}

// 迁移后 (Composition API)
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const store = useStore()
    const loginFormRef = ref()
    
    // 响应式数据
    const loginForm = reactive({
      username: '',
      password: ''
    })
    
    const loading = ref(false)
    
    // 表单验证规则
    const loginRules = {
      username: [{required: true, trigger: 'blur', validator: validateUsername}],
      password: [{required: true, trigger: 'blur', validator: validatePass}]
    }
    
    // 方法
    const handleLogin = async () => {
      try {
        const valid = await loginFormRef.value.validate()
        if (valid) {
          loading.value = true
          await store.dispatch('Login', loginForm)
          router.push({ path: '/' })
        }
      } catch (error) {
        ElMessage.error('登录失败')
      } finally {
        loading.value = false
      }
    }
    
    return {
      loginFormRef,
      loginForm,
      loginRules,
      loading,
      handleLogin
    }
  }
}
```

#### ✅ 迁移验证清单
- [ ] Element Plus组件正常显示
- [ ] 表单验证功能正常
- [ ] 登录流程正常工作
- [ ] 路由跳转正常
- [ ] 错误处理正常

---

### 2. 主布局组件 (`views/layout/Layout.vue`)

#### 🔍 现状分析
- 使用Element UI布局组件
- 响应式设计
- 侧边栏折叠功能

#### 🛠 迁移步骤

**Element Plus布局组件更新**
```vue
<!-- 迁移前 -->
<template>
  <div class="app-wrapper" :class="classObj">
    <div class="drawer-bg" @click="handleClickOutside"/>
    <sidebar class="sidebar-container"/>
    <div class="main-container">
      <navbar/>
      <app-main/>
    </div>
  </div>
</template>

<!-- 迁移后 -->
<template>
  <div class="app-wrapper" :class="classObj">
    <div v-if="device==='mobile'&&sidebar.opened" class="drawer-bg" @click="handleClickOutside"/>
    <sidebar class="sidebar-container"/>
    <div class="main-container">
      <div :class="{'fixed-header':fixedHeader}">
        <navbar/>
      </div>
      <app-main/>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import AppMain from './components/AppMain'

export default {
  name: 'Layout',
  components: {
    Navbar,
    Sidebar,
    AppMain
  },
  setup() {
    const store = useStore()
    
    const sidebar = computed(() => store.state.app.sidebar)
    const device = computed(() => store.state.app.device)
    const fixedHeader = computed(() => store.state.settings.fixedHeader)
    
    const classObj = computed(() => ({
      hideSidebar: !sidebar.value.opened,
      openSidebar: sidebar.value.opened,
      withoutAnimation: sidebar.value.withoutAnimation,
      mobile: device.value === 'mobile'
    }))
    
    const handleClickOutside = () => {
      store.dispatch('app/closeSideBar', { withoutAnimation: false })
    }
    
    return {
      sidebar,
      device,
      fixedHeader,
      classObj,
      handleClickOutside
    }
  }
}
</script>
```

---

### 3. 导航栏组件 (`views/layout/components/Navbar.vue`)

#### 🛠 Composition API重构

```javascript
// 迁移前 (Options API)
export default {
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'name'
    ])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    }
  }
}

// 迁移后 (Composition API)
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'Navbar',
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    
    // 计算属性
    const sidebar = computed(() => store.getters.sidebar)
    const avatar = computed(() => store.getters.avatar)
    const name = computed(() => store.getters.name)
    
    // 方法
    const toggleSideBar = () => {
      store.dispatch('app/toggleSideBar')
    }
    
    const logout = async () => {
      try {
        await store.dispatch('user/logout')
        router.push(`/login?redirect=${route.fullPath}`)
      } catch (error) {
        console.error('Logout failed:', error)
      }
    }
    
    return {
      sidebar,
      avatar,
      name,
      toggleSideBar,
      logout
    }
  }
}
```

---

### 4. 侧边栏组件 (`views/layout/components/Sidebar/index.vue`)

#### 🛠 路由处理更新

```vue
<template>
  <div :class="{'has-logo':showLogo}">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="false"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item
          v-for="route in routes"
          :key="route.path"
          :item="route"
          :base-path="route.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import variables from '@/styles/variables.scss'

export default {
  name: 'Sidebar',
  components: {
    SidebarItem,
    Logo
  },
  setup() {
    const route = useRoute()
    const store = useStore()
    
    const routes = computed(() => store.getters.permission_routes)
    const showLogo = computed(() => store.state.settings.sidebarLogo)
    const sidebar = computed(() => store.state.app.sidebar)
    
    const activeMenu = computed(() => {
      const { meta, path } = route
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    })
    
    const isCollapse = computed(() => !sidebar.value.opened)
    
    return {
      routes,
      showLogo,
      activeMenu,
      isCollapse,
      variables
    }
  }
}
</script>
```

## 公共组件迁移

### 1. 面包屑组件 (`components/Breadcrumb/index.vue`)

```vue
<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item,index) in levelList" :key="item.path">
        <span v-if="item.redirect==='noRedirect'||index==levelList.length-1" class="no-redirect">{{ item.meta.title }}</span>
        <a v-else @click.prevent="handleLink(item)">{{ item.meta.title }}</a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'Breadcrumb',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const levelList = ref([])
    
    const getBreadcrumb = () => {
      let matched = route.matched.filter(item => item.meta && item.meta.title)
      const first = matched[0]
      
      if (!isDashboard(first)) {
        matched = [{ path: '/dashboard', meta: { title: '首页' }}].concat(matched)
      }
      
      levelList.value = matched.filter(item => item.meta && item.meta.title && item.meta.breadcrumb !== false)
    }
    
    const isDashboard = (route) => {
      const name = route && route.name
      if (!name) {
        return false
      }
      return name.trim().toLocaleLowerCase() === 'Dashboard'.toLocaleLowerCase()
    }
    
    const handleLink = (item) => {
      const { redirect, path } = item
      if (redirect) {
        router.push(redirect)
        return
      }
      router.push(path)
    }
    
    // 监听路由变化
    watch(route, getBreadcrumb, { immediate: true })
    
    return {
      levelList,
      handleLink
    }
  }
}
</script>
```

### 2. SVG图标组件 (`components/SvgIcon/index.vue`)

```vue
<template>
  <div v-if="isExternal" :style="styleExternalIcon" class="svg-external-icon svg-icon" v-on="$attrs" />
  <svg v-else :class="svgClass" aria-hidden="true" v-on="$attrs">
    <use :xlink:href="iconName" />
  </svg>
</template>

<script>
import { computed } from 'vue'
import { isExternal } from '@/utils/validate'

export default {
  name: 'SvgIcon',
  props: {
    iconClass: {
      type: String,
      required: true
    },
    className: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const isExternalIcon = computed(() => isExternal(props.iconClass))
    
    const iconName = computed(() => `#icon-${props.iconClass}`)
    
    const svgClass = computed(() => {
      if (props.className) {
        return 'svg-icon ' + props.className
      } else {
        return 'svg-icon'
      }
    })
    
    const styleExternalIcon = computed(() => ({
      mask: `url(${props.iconClass}) no-repeat 50% 50%`,
      '-webkit-mask': `url(${props.iconClass}) no-repeat 50% 50%`
    }))
    
    return {
      isExternal: isExternalIcon,
      iconName,
      svgClass,
      styleExternalIcon
    }
  }
}
</script>
```

## 业务页面组件迁移

### 订单管理页面示例

```vue
<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-card class="filter-container" shadow="never">
      <el-form :model="listQuery" ref="searchFormRef" size="small" :inline="true">
        <el-form-item label="订单号：">
          <el-input v-model="listQuery.orderSn" class="input-width" placeholder="订单号" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearchList()">查询搜索</el-button>
          <el-button @click="handleResetSearch()">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 数据表格 -->
    <div class="table-container">
      <el-table ref="orderTable" :data="list" style="width: 100%;" @selection-change="handleSelectionChange" v-loading="listLoading">
        <el-table-column type="selection" width="60" align="center"></el-table-column>
        <el-table-column label="订单号" width="180" align="center">
          <template #default="scope">{{ scope.row.orderSn }}</template>
        </el-table-column>
        <el-table-column label="提交时间" width="180" align="center">
          <template #default="scope">{{ formatDateTime(scope.row.createTime) }}</template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 分页组件 -->
    <div class="pagination-container">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        layout="total, sizes,prev, pager, next,jumper"
        :current-page.sync="listQuery.pageNum"
        :page-size="listQuery.pageSize"
        :page-sizes="[5,10,15]"
        :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { fetchList } from '@/api/order'
import { formatDateTime } from '@/utils/date'

export default {
  name: 'OrderList',
  setup() {
    // 响应式数据
    const searchFormRef = ref()
    const orderTable = ref()
    const listLoading = ref(false)
    const list = ref([])
    const total = ref(0)
    const multipleSelection = ref([])
    
    const listQuery = reactive({
      pageNum: 1,
      pageSize: 5,
      orderSn: ''
    })
    
    // 方法
    const handleSearchList = () => {
      listQuery.pageNum = 1
      getList()
    }
    
    const handleResetSearch = () => {
      searchFormRef.value.resetFields()
      getList()
    }
    
    const handleSizeChange = (val) => {
      listQuery.pageNum = 1
      listQuery.pageSize = val
      getList()
    }
    
    const handleCurrentChange = (val) => {
      listQuery.pageNum = val
      getList()
    }
    
    const handleSelectionChange = (val) => {
      multipleSelection.value = val
    }
    
    const getList = async () => {
      listLoading.value = true
      try {
        const response = await fetchList(listQuery)
        list.value = response.data.list
        total.value = response.data.total
      } catch (error) {
        console.error('Failed to fetch list:', error)
      } finally {
        listLoading.value = false
      }
    }
    
    // 生命周期
    onMounted(() => {
      getList()
    })
    
    return {
      searchFormRef,
      orderTable,
      listLoading,
      list,
      total,
      multipleSelection,
      listQuery,
      handleSearchList,
      handleResetSearch,
      handleSizeChange,
      handleCurrentChange,
      handleSelectionChange,
      formatDateTime
    }
  }
}
</script>
```

## Composables抽取建议

### 1. 表格数据管理 (useTable)

```javascript
// composables/useTable.js
import { ref, reactive } from 'vue'

export function useTable(fetchApi, initialQuery = {}) {
  const loading = ref(false)
  const list = ref([])
  const total = ref(0)
  const multipleSelection = ref([])
  
  const listQuery = reactive({
    pageNum: 1,
    pageSize: 10,
    ...initialQuery
  })
  
  const getList = async () => {
    loading.value = true
    try {
      const response = await fetchApi(listQuery)
      list.value = response.data.list
      total.value = response.data.total
    } catch (error) {
      console.error('Failed to fetch list:', error)
    } finally {
      loading.value = false
    }
  }
  
  const handleSizeChange = (val) => {
    listQuery.pageNum = 1
    listQuery.pageSize = val
    getList()
  }
  
  const handleCurrentChange = (val) => {
    listQuery.pageNum = val
    getList()
  }
  
  const handleSelectionChange = (val) => {
    multipleSelection.value = val
  }
  
  const handleSearch = () => {
    listQuery.pageNum = 1
    getList()
  }
  
  return {
    loading,
    list,
    total,
    multipleSelection,
    listQuery,
    getList,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange,
    handleSearch
  }
}
```

### 2. 表单处理 (useForm)

```javascript
// composables/useForm.js
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

export function useForm(initialData = {}, rules = {}) {
  const formRef = ref()
  const loading = ref(false)
  const formData = reactive({ ...initialData })
  
  const validate = () => {
    return formRef.value.validate()
  }
  
  const resetForm = () => {
    formRef.value.resetFields()
  }
  
  const clearValidate = () => {
    formRef.value.clearValidate()
  }
  
  const submitForm = async (submitApi) => {
    try {
      const valid = await validate()
      if (valid) {
        loading.value = true
        await submitApi(formData)
        ElMessage.success('操作成功')
        return true
      }
    } catch (error) {
      ElMessage.error('操作失败')
      return false
    } finally {
      loading.value = false
    }
  }
  
  return {
    formRef,
    loading,
    formData,
    formRules: rules,
    validate,
    resetForm,
    clearValidate,
    submitForm
  }
}
```

### 3. 用户认证 (useAuth)

```javascript
// composables/useAuth.js
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export function useAuth() {
  const store = useStore()
  const router = useRouter()
  
  const user = computed(() => store.state.user.userInfo)
  const token = computed(() => store.state.user.token)
  const isLoggedIn = computed(() => !!token.value)
  const permissions = computed(() => store.state.user.permissions)
  
  const login = async (credentials) => {
    await store.dispatch('user/login', credentials)
  }
  
  const logout = async () => {
    await store.dispatch('user/logout')
    router.push('/login')
  }
  
  const hasPermission = (permission) => {
    return permissions.value.includes(permission)
  }
  
  const hasRole = (role) => {
    return user.value.roles.includes(role)
  }
  
  return {
    user,
    token,
    isLoggedIn,
    permissions,
    login,
    logout,
    hasPermission,
    hasRole
  }
}
```

## 迁移测试策略

### 1. 单元测试示例

```javascript
// tests/unit/Login.spec.js
import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/login/index.vue'

describe('Login.vue', () => {
  let wrapper
  let store
  let router
  
  beforeEach(() => {
    store = createStore({
      modules: {
        user: {
          namespaced: true,
          actions: {
            login: vi.fn()
          }
        }
      }
    })
    
    router = createRouter({
      history: createWebHistory(),
      routes: []
    })
    
    wrapper = mount(Login, {
      global: {
        plugins: [store, router]
      }
    })
  })
  
  it('renders login form', () => {
    expect(wrapper.find('.login-form-layout').exists()).toBe(true)
  })
  
  it('validates required fields', async () => {
    const submitButton = wrapper.find('el-button[type="primary"]')
    await submitButton.trigger('click')
    
    // 验证表单验证是否触发
    expect(wrapper.find('.el-form-item__error').exists()).toBe(true)
  })
})
```

### 2. 组件测试检查清单

每个组件迁移后需要验证:

#### 功能测试
- [ ] 组件正常渲染
- [ ] Props传递正确
- [ ] Events触发正常
- [ ] 插槽内容显示
- [ ] 条件渲染正确

#### 交互测试
- [ ] 用户输入响应
- [ ] 按钮点击事件
- [ ] 表单提交流程
- [ ] 路由跳转正确
- [ ] 状态更新同步

#### 样式测试
- [ ] CSS样式正确应用
- [ ] 响应式布局正常
- [ ] 主题变量生效
- [ ] 动画效果正常

## 常见问题和解决方案

### 1. ref访问问题
```javascript
// Vue 2
this.$refs.formRef.validate()

// Vue 3 - 错误方式
const formRef = ref()
formRef.validate() // ❌ 错误

// Vue 3 - 正确方式
const formRef = ref()
formRef.value.validate() // ✅ 正确
```

### 2. 事件监听器问题
```vue
<!-- Vue 2 -->
<el-input @input="handleInput" />

<!-- Vue 3 - 需要检查事件名称变更 -->
<el-input @input="handleInput" /> <!-- 大部分保持不变 -->
```

### 3. v-model语法变更
```vue
<!-- Vue 2 -->
<custom-component v-model="value" />

<!-- Vue 3 - 默认prop名称变更 -->
<custom-component v-model="value" /> <!-- modelValue代替value -->
```

### 4. 全局属性访问
```javascript
// Vue 2
this.$http
this.$message

// Vue 3
import { getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
proxy.$http
proxy.$message
```

## 迁移验收标准

### 整体验收
- [ ] 所有组件成功迁移到Vue 3
- [ ] 功能完整性100%保持
- [ ] 用户体验无降级
- [ ] 性能指标达到预期
- [ ] 代码质量符合标准

### 各组件验收标准
- [ ] 组件API调用正确
- [ ] 响应式数据正常工作
- [ ] 生命周期钩子正确执行
- [ ] 事件处理正常
- [ ] 样式显示正确
- [ ] 无控制台错误或警告

## 迁移时间估算

| 组件类型 | 数量 | 预估时间/个 | 总时间 |
|---------|------|-------------|--------|
| 核心业务组件 | 4个 | 2天 | 8天 |
| 重要功能组件 | 8个 | 1天 | 8天 |
| 辅助功能组件 | 13个 | 0.5天 | 6.5天 |
| **总计** | **25个** | - | **22.5天** |

*注: 实际时间可能因组件复杂度和团队熟练度而有所不同*

---

*此迁移指南将在实际迁移过程中持续完善，确保每个组件都能成功迁移到Vue 3。*