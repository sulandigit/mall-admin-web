# mall-admin-web 团队代码规范

## 1. 代码规范目标

- 建立统一的代码风格标准
- 提供实时的语法错误和潜在问题检测  
- 集成自动代码格式化功能
- 确保团队开发的一致性
- 提升代码可读性和维护性

## 2. 工具配置

### 2.1 ESLint 规则

我们使用 ESLint 7.x 系列配合以下插件：

- `eslint-plugin-vue@^7.20.0` - Vue.js 特定规则
- `@vue/eslint-config-standard@^6.1.0` - JavaScript 标准规则
- `eslint-config-prettier@^8.6.0` - 禁用与 Prettier 冲突的规则
- `@babel/eslint-parser@^7.19.0` - Babel 语法解析支持

### 2.2 Prettier 配置

代码格式化标准：

- 使用单引号
- 不使用分号结尾
- 2空格缩进
- 行宽100字符
- ES5兼容的尾随逗号

## 3. 命名规范

### 3.1 文件和目录命名

```
components/           # 组件目录使用小写
├── UserProfile/     # 组件目录使用PascalCase
│   └── index.vue   # 主文件使用index.vue
├── ProductList/
│   ├── index.vue
│   └── components/  # 子组件目录
views/               # 页面目录使用小写
├── user/           # 模块目录使用小写
│   ├── profile.vue # 页面文件使用kebab-case
│   └── settings.vue
api/                # API目录使用小写
├── user.js         # API文件使用小写
└── product.js
```

### 3.2 Vue 组件命名

#### 组件名称
```javascript
// ✅ 推荐：组件名使用PascalCase
export default {
  name: 'UserProfile'
}

// ❌ 避免：单词组件名
export default {
  name: 'Profile'
}
```

#### 组件使用
```vue
<template>
  <!-- ✅ 推荐：模板中使用PascalCase -->
  <UserProfile :user-name="userName" />
  
  <!-- ❌ 避免：使用camelCase -->
  <userProfile :userName="userName" />
</template>
```

### 3.3 变量和函数命名

```javascript
// ✅ 推荐：camelCase命名
const userName = 'John'
const userInfo = { name: 'John', age: 25 }

function getUserName() {
  return userName
}

const handleButtonClick = () => {
  // 处理点击事件
}

// ✅ 推荐：常量使用UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com'
const MAX_RETRY_COUNT = 3

// ✅ 推荐：私有变量使用下划线前缀
const _privateVariable = 'private'
```

### 3.4 CSS 类名

```vue
<template>
  <div class="user-profile">
    <div class="user-profile__header">
      <img class="user-profile__avatar" />
    </div>
  </div>
</template>

<style scoped>
/* ✅ 推荐：使用BEM命名规范 */
.user-profile { }
.user-profile__header { }
.user-profile__avatar { }
.user-profile--active { }

/* ❌ 避免：嵌套过深或随意命名 */
.user .profile .header .img { }
</style>
```

## 4. Vue 组件规范

### 4.1 组件结构顺序

```vue
<template>
  <!-- 模板内容 -->
</template>

<script>
// 1. 导入第三方库
import Vue from 'vue'
import { mapGetters } from 'vuex'

// 2. 导入组件
import UserCard from '@/components/UserCard'

// 3. 导入工具函数
import { formatDate } from '@/utils/date'

export default {
  name: 'ComponentName',          // 组件名称
  
  components: {                   // 组件注册
    UserCard
  },
  
  props: {                        // 属性定义
    userName: {
      type: String,
      required: true,
      default: ''
    }
  },
  
  data() {                        // 数据
    return {
      loading: false,
      userList: []
    }
  },
  
  computed: {                     // 计算属性
    ...mapGetters(['currentUser']),
    
    displayName() {
      return this.userName || 'Anonymous'
    }
  },
  
  watch: {                        // 监听器
    userName: {
      handler(newVal) {
        this.fetchUserData(newVal)
      },
      immediate: true
    }
  },
  
  created() {                     // 生命周期钩子
    this.init()
  },
  
  methods: {                      // 方法
    init() {
      this.fetchUserData()
    },
    
    async fetchUserData() {
      this.loading = true
      try {
        const response = await getUserInfo()
        this.userList = response.data
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
/* 样式 */
</style>
```

### 4.2 Props 规范

```javascript
// ✅ 推荐：完整的props定义
props: {
  // 基础类型检查
  userName: String,
  
  // 完整定义
  userAge: {
    type: Number,
    required: true,
    default: 0,
    validator(value) {
      return value >= 0
    }
  },
  
  // 对象类型默认值
  userInfo: {
    type: Object,
    default: () => ({})
  },
  
  // 数组类型默认值
  permissions: {
    type: Array,
    default: () => []
  }
}

// ❌ 避免：只使用数组形式
props: ['userName', 'userAge']
```

### 4.3 事件规范

```vue
<template>
  <!-- ✅ 推荐：事件名使用kebab-case -->
  <UserCard 
    @user-click="handleUserClick"
    @user-profile-update="handleProfileUpdate"
  />
</template>

<script>
export default {
  methods: {
    handleUserClick(user) {
      // ✅ 推荐：emit事件使用kebab-case
      this.$emit('user-selected', user)
    },
    
    handleProfileUpdate(profile) {
      // ✅ 推荐：提供清晰的事件数据
      this.$emit('profile-updated', {
        user: this.currentUser,
        profile: profile,
        timestamp: Date.now()
      })
    }
  }
}
</script>
```

## 5. JavaScript 编码规范

### 5.1 变量声明

```javascript
// ✅ 推荐：使用const和let
const API_URL = 'https://api.example.com'
let isLoading = false

// ✅ 推荐：解构赋值
const { name, age } = user
const [first, second] = items

// ❌ 避免：使用var
var userName = 'John'
```

### 5.2 函数定义

```javascript
// ✅ 推荐：箭头函数用于简单表达式
const getUserName = user => user.name
const sum = (a, b) => a + b

// ✅ 推荐：普通函数用于复杂逻辑
function processUserData(users) {
  // 复杂的处理逻辑
  return users.map(user => ({
    ...user,
    displayName: `${user.firstName} ${user.lastName}`
  }))
}

// ✅ 推荐：async/await处理异步
async function fetchUserData(userId) {
  try {
    const response = await api.getUser(userId)
    return response.data
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}
```

### 5.3 对象和数组操作

```javascript
// ✅ 推荐：使用展开语法
const newUser = { ...existingUser, name: 'New Name' }
const newItems = [...existingItems, newItem]

// ✅ 推荐：数组方法链式调用
const activeUsers = users
  .filter(user => user.status === 'active')
  .map(user => ({ ...user, displayName: user.name }))
  .sort((a, b) => a.name.localeCompare(b.name))

// ✅ 推荐：使用可选链操作符
const userName = user?.profile?.name || 'Unknown'
```

## 6. 注释规范

### 6.1 函数注释

```javascript
/**
 * 获取用户信息
 * @param {string} userId - 用户ID
 * @param {Object} options - 配置选项
 * @param {boolean} options.includeProfile - 是否包含用户资料
 * @returns {Promise<Object>} 用户信息对象
 */
async function getUserInfo(userId, options = {}) {
  // 实现逻辑
}
```

### 6.2 Vue组件注释

```vue
<template>
  <!-- 用户资料卡片组件 -->
  <div class="user-profile-card">
    <!-- 用户头像区域 -->
    <div class="avatar-section">
      <img :src="user.avatar" :alt="user.name" />
    </div>
  </div>
</template>

<script>
/**
 * 用户资料卡片组件
 * 用于显示用户基本信息和操作按钮
 */
export default {
  name: 'UserProfileCard'
  // ...
}
</script>
```

## 7. 错误处理规范

### 7.1 API错误处理

```javascript
// ✅ 推荐：统一的错误处理
async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, options)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('API request failed:', error)
    
    // 根据错误类型进行不同处理
    if (error.name === 'TypeError') {
      throw new Error('网络连接错误')
    }
    
    throw error
  }
}
```

### 7.2 Vue组件错误边界

```javascript
// 全局错误处理
Vue.config.errorHandler = (err, vm, info) => {
  console.error('Vue error:', err)
  console.error('Component:', vm)
  console.error('Error info:', info)
  
  // 发送错误到监控服务
  reportError(err, { component: vm, info })
}
```

## 8. 代码提交规范

### 8.1 Commit Message 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 8.2 类型说明

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档修改
- `style`: 代码格式修改
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建工具或辅助工具修改

### 8.3 示例

```
feat(user): 添加用户资料页面

- 实现用户基本信息展示
- 添加头像上传功能
- 集成用户权限检查

Closes #123
```

## 9. 性能规范

### 9.1 Vue组件性能

```javascript
// ✅ 推荐：使用计算属性缓存
computed: {
  expensiveValue() {
    return this.items.reduce((sum, item) => {
      return sum + item.price * item.quantity
    }, 0)
  }
}

// ✅ 推荐：使用v-memo优化列表渲染
<template>
  <div v-for="item in list" :key="item.id" v-memo="[item.id, item.status]">
    {{ item.name }}
  </div>
</template>

// ✅ 推荐：组件懒加载
const UserProfile = () => import('@/components/UserProfile')
```

### 9.2 资源优化

```javascript
// ✅ 推荐：图片懒加载
<img v-lazy="user.avatar" :alt="user.name" />

// ✅ 推荐：路由懒加载
const routes = [
  {
    path: '/user',
    component: () => import('@/views/user/index.vue')
  }
]
```

## 10. 安全规范

### 10.1 XSS防护

```vue
<template>
  <!-- ✅ 推荐：使用文本插值 -->
  <div>{{ userInput }}</div>
  
  <!-- ❌ 避免：直接使用v-html -->
  <div v-html="userInput"></div>
  
  <!-- ✅ 推荐：必要时进行清理 -->
  <div v-html="sanitizedHtml"></div>
</template>
```

### 10.2 数据验证

```javascript
// ✅ 推荐：输入验证
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// ✅ 推荐：API参数验证
async function updateUser(userId, userData) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid user ID')
  }
  
  if (!userData || typeof userData !== 'object') {
    throw new Error('Invalid user data')
  }
  
  // 继续处理...
}
```

## 11. 代码审查检查清单

### 11.1 基础检查

- [ ] 代码是否通过ESLint检查
- [ ] 代码是否经过Prettier格式化
- [ ] 变量和函数命名是否清晰
- [ ] 是否有未使用的导入或变量

### 11.2 Vue组件检查

- [ ] 组件名是否使用PascalCase
- [ ] Props是否有完整的类型定义
- [ ] 事件名是否使用kebab-case
- [ ] 是否正确使用scoped样式

### 11.3 逻辑检查

- [ ] 错误处理是否完善
- [ ] 异步操作是否正确处理
- [ ] 是否有潜在的内存泄漏
- [ ] 性能是否有优化空间

## 12. 工具和插件推荐

### 12.1 VS Code插件

- Vetur - Vue语法支持
- ESLint - 代码检查
- Prettier - 代码格式化
- Auto Rename Tag - 自动重命名标签
- Path Intellisense - 路径自动补全
- GitLens - Git增强工具

### 12.2 Chrome插件

- Vue.js devtools - Vue开发者工具
- React Developer Tools - 组件调试

## 13. 参考资料

- [Vue.js 风格指南](https://cn.vuejs.org/v2/style-guide/)
- [ESLint 规则文档](https://eslint.org/docs/rules/)
- [Prettier 配置选项](https://prettier.io/docs/en/options.html)
- [JavaScript 标准规范](https://standardjs.com/rules-zhcn.html)

---

本规范将持续更新，请关注项目文档的最新版本。如有问题或建议，请通过Issue或团队沟通渠道反馈。