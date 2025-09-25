# Mall Admin Web 快速开始指南

## 🚀 项目启动

### 1. 环境准备

确保您的系统已安装以下环境：

```bash
# 检查 Node.js 版本 (要求 >= 6.0.0)
node --version

# 检查 NPM 版本 (要求 >= 3.0.0)
npm --version
```

如果没有安装 Node.js，请从 [官网](https://nodejs.org/) 下载安装。

### 2. 安装依赖

```bash
# 进入项目目录
cd mall-admin-web

# 安装项目依赖
npm install
```

### 3. 启动项目

```bash
# 启动开发服务器
npm run dev

# 或者使用别名
npm start
```

启动成功后，浏览器会自动打开 `http://localhost:8090`

### 4. 登录系统

- 用户名：`admin`
- 密码：任意密码

## 🎯 功能演示

### 键盘快捷键系统

这是本项目的核心特色功能：

#### 快速访问快捷键面板
- 按 `Ctrl + /` 打开快捷键面板
- 按 `F1` 打开完整的快捷键帮助

#### 常用快捷键
```
Ctrl + S    保存当前表单
Ctrl + N    新建记录
Ctrl + F    聚焦搜索框
Delete      删除选中项
Esc         取消操作/关闭对话框
```

#### 导航快捷键
```
Alt + 1     跳转到首页
Alt + 2     跳转到商品管理
Alt + 3     跳转到订单管理
Alt + 4     跳转到营销管理
Alt + 5     跳转到权限管理
```

### 快捷键面板使用

1. 在导航栏右侧找到快捷键按钮 📋
2. 点击或按 `Ctrl + /` 打开快捷键面板
3. 面板显示当前页面可用的快捷键
4. 点击任意快捷键即可执行对应操作

### 权限控制演示

项目集成了完整的权限控制系统：

#### 指令式权限控制
```html
<!-- 只有拥有 user:create 权限的用户才能看到此按钮 -->
<el-button v-permission="'user:create'">新增用户</el-button>

<!-- 只有管理员角色才能看到此菜单 -->
<el-menu-item v-role="'admin'">系统设置</el-menu-item>
```

#### 编程式权限检查
```javascript
// 在组件中检查权限
if (this.$hasPermission('user:create')) {
  // 执行需要权限的操作
}

// 检查角色
if (this.$hasRole('admin')) {
  // 执行管理员操作
}
```

## 📁 项目结构

```
mall-admin-web/
├── src/
│   ├── api/                 # API 接口定义
│   ├── assets/             # 静态资源
│   ├── components/         # 公共组件
│   │   ├── ShortcutHelp/   # 快捷键帮助组件 🆕
│   │   ├── ShortcutPanel/  # 快捷键面板组件 🆕
│   │   └── ...
│   ├── mixins/             # 混入
│   │   └── keyboardShortcut.js  # 快捷键混入 🆕
│   ├── store/              # 状态管理
│   │   └── modules/
│   │       └── keyboard.js # 快捷键状态模块 🆕
│   ├── utils/              # 工具函数
│   │   ├── keyboardShortcut.js  # 快捷键处理器 🆕
│   │   └── permission.js        # 权限工具 🆕
│   └── views/              # 页面组件
├── static/                 # 静态文件
└── ...
```

## 🛠️ 开发指南

### 在组件中使用快捷键

1. **引入快捷键混入**
```javascript
import keyboardShortcutMixin from '@/mixins/keyboardShortcut'

export default {
  mixins: [keyboardShortcutMixin],
  methods: {
    // 自定义保存逻辑
    onShortcutSave() {
      // 处理 Ctrl+S 快捷键
      this.saveForm()
    }
  }
}
```

2. **自定义权限检查**
```javascript
import { permissionMixin } from '@/utils/permission'

export default {
  mixins: [permissionMixin],
  methods: {
    handleCreate() {
      if (!this.$hasPermission('user:create')) {
        this.$message.warning('没有创建权限')
        return
      }
      // 执行创建操作
    }
  }
}
```

### 添加新的 API 接口

1. 在 `src/api/` 目录下创建新的 API 文件
2. 使用统一的请求工具 `@/utils/request`
3. 遵循 RESTful API 设计规范

```javascript
import request from '@/utils/request'

export function fetchUserList(params) {
  return request({
    url: '/admin/user/list',
    method: 'get',
    params: params
  })
}
```

### 自定义快捷键

在组件中注册页面特定的快捷键：

```javascript
mounted() {
  // 注册页面特定快捷键
  this.registerPageShortcut('ctrl+shift+n', {
    name: '批量新增',
    category: 'custom',
    description: '批量新增用户',
    action: 'batchCreate'
  })
}
```

## 🐛 常见问题

### 1. 快捷键不生效

**原因**：可能是当前焦点在输入框中
**解决**：快捷键系统会忽略输入框中的按键，这是正常设计

### 2. 权限指令不生效

**原因**：用户角色或权限信息未正确加载
**解决**：检查用户登录状态和权限数据

### 3. 开发服务器启动失败

**原因**：端口被占用或依赖安装不完整
**解决**：
```bash
# 重新安装依赖
npm install

# 清除缓存
npm cache clean --force

# 使用不同端口
npm run dev -- --port 8091
```

## 📚 更多资源

- [Vue.js 官方文档](https://v2.vuejs.org/)
- [Element UI 组件库](https://element.eleme.io/)
- [项目完整实现报告](./PROJECT_IMPLEMENTATION_REPORT.md)

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

🎉 **恭喜！** 您已经成功了解了 Mall Admin Web 项目的核心功能。开始您的电商管理之旅吧！