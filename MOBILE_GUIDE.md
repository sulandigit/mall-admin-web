/**
 * 移动端适配使用指南
 * 详细说明如何使用新的移动端适配功能
 */

# 移动端适配使用指南

## 1. 项目配置

### 在main.js中注册移动端优化插件：

```javascript
import Vue from 'vue'
import MobileOptimizePlugin from '@/plugins/mobile-optimize'

// 注册移动端优化插件
Vue.use(MobileOptimizePlugin, {
  showMobileErrors: true,
  memoryLeakDetection: process.env.NODE_ENV === 'development'
})
```

### 更新样式文件引用：

确保在 `src/styles/index.scss` 中已经包含了新的样式文件：

```scss
@import './variables.scss';
@import './mixin.scss';
@import './transition.scss';
@import './element-ui.scss';
@import './sidebar.scss';
@import './responsive-mixins.scss';
@import './touch.scss';
```

## 2. 组件使用

### 2.1 响应式表格组件

```vue
<template>
  <mobile-table
    :data="tableData"
    :columns="columns"
    :force-card-mode="false"
    card-title="name"
    row-key="id"
    :show-pagination="true"
    :pagination-props="paginationProps"
    @card-click="handleCardClick"
    @row-click="handleRowClick"
  >
    <!-- 自定义列插槽 -->
    <template #status="{ row }">
      <el-tag :type="row.status === 1 ? 'success' : 'danger'">
        {{ row.status === 1 ? '启用' : '禁用' }}
      </el-tag>
    </template>
    
    <!-- 操作列插槽 -->
    <template #actions="{ row, index }">
      <el-button size="mini" @click="editRow(row)">编辑</el-button>
      <el-button size="mini" type="danger" @click="deleteRow(row)">删除</el-button>
    </template>
  </mobile-table>
</template>

<script>
import MobileTable from '@/components/MobileTable'

export default {
  components: {
    MobileTable
  },
  data() {
    return {
      tableData: [
        { id: 1, name: '商品1', price: 100, status: 1 },
        { id: 2, name: '商品2', price: 200, status: 0 }
      ],
      columns: [
        { prop: 'name', label: '商品名称' },
        { prop: 'price', label: '价格', hideOnMobile: false },
        { prop: 'status', label: '状态', hideOnTablet: false },
        { prop: 'actions', label: '操作', hideOnMobile: true }
      ],
      paginationProps: {
        total: 100,
        pageSize: 10,
        currentPage: 1
      }
    }
  },
  methods: {
    handleCardClick({ row, index }) {
      console.log('卡片点击:', row, index)
    },
    handleRowClick(row) {
      console.log('行点击:', row)
    },
    editRow(row) {
      console.log('编辑:', row)
    },
    deleteRow(row) {
      console.log('删除:', row)
    }
  }
}
</script>
```

### 2.2 响应式表单组件

```vue
<template>
  <mobile-form-layout
    title="用户信息"
    description="请填写完整的用户信息"
    :show-steps="true"
    :steps="steps"
    v-model="currentStep"
    :form-props="formProps"
    :submit-loading="submitLoading"
    @submit="handleSubmit"
    @cancel="handleCancel"
  >
    <!-- 第一步：基本信息 -->
    <template #step0>
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
      </el-form-item>
    </template>
    
    <!-- 第二步：详细信息 -->
    <template #step1>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号"></el-input>
      </el-form-item>
      <el-form-item label="地址" prop="address">
        <el-input type="textarea" v-model="form.address" placeholder="请输入地址"></el-input>
      </el-form-item>
    </template>
  </mobile-form-layout>
</template>

<script>
import MobileFormLayout from '@/components/MobileForm/layout'

export default {
  components: {
    MobileFormLayout
  },
  data() {
    return {
      currentStep: 0,
      submitLoading: false,
      form: {
        username: '',
        email: '',
        phone: '',
        address: ''
      },
      steps: [
        { title: '基本信息', description: '填写基本用户信息' },
        { title: '详细信息', description: '完善详细信息' }
      ],
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    formProps() {
      return {
        model: this.form,
        rules: this.rules,
        labelWidth: '100px'
      }
    }
  },
  methods: {
    handleSubmit(data) {
      this.submitLoading = true
      // 模拟提交
      setTimeout(() => {
        this.submitLoading = false
        this.$message.success('提交成功')
      }, 2000)
    },
    handleCancel() {
      this.$message.info('已取消')
    }
  }
}
</script>
```

## 3. 设备检测使用

```vue
<template>
  <div>
    <!-- 根据设备类型显示不同内容 -->
    <div v-if="isMobile" class="mobile-content">
      手机端内容
    </div>
    <div v-else-if="isTablet" class="tablet-content">
      平板端内容
    </div>
    <div v-else class="desktop-content">
      桌面端内容
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters([
      'isMobile',
      'isTablet',
      'isDesktop',
      'isMobileOrTablet',
      'isTouchDevice',
      'currentBreakpoint'
    ])
  }
}
</script>
```

## 4. 手势操作

手势操作已自动集成到Layout组件中，支持：

- 从左边缘右滑展开侧边栏
- 在侧边栏区域左滑收起侧边栏
- 点击遮罩层关闭侧边栏

### 自定义手势：

```vue
<script>
import { createGestureRecognizer, GESTURE_TYPES } from '@/utils/gesture'

export default {
  mounted() {
    this.gestureRecognizer = createGestureRecognizer(this.$el, {
      swipeThreshold: 50
    })
    
    this.gestureRecognizer
      .on(GESTURE_TYPES.SWIPE_LEFT, this.handleSwipeLeft)
      .on(GESTURE_TYPES.SWIPE_RIGHT, this.handleSwipeRight)
      .on(GESTURE_TYPES.TAP, this.handleTap)
      .on(GESTURE_TYPES.LONG_PRESS, this.handleLongPress)
  },
  
  beforeDestroy() {
    if (this.gestureRecognizer) {
      this.gestureRecognizer.destroy()
    }
  },
  
  methods: {
    handleSwipeLeft(data) {
      console.log('左滑:', data)
    },
    handleSwipeRight(data) {
      console.log('右滑:', data)
    },
    handleTap(data) {
      console.log('点击:', data)
    },
    handleLongPress(data) {
      console.log('长按:', data)
    }
  }
}
</script>
```

## 5. 性能优化指令

### 图片懒加载：

```vue
<template>
  <!-- 基础懒加载 -->
  <img v-lazy="imageUrl" alt="图片" />
  
  <!-- 急切加载（提前加载） -->
  <img v-lazy.eager="imageUrl" alt="图片" />
  
  <!-- 图片优化 -->
  <img v-optimize-image.compress.placeholder="imageUrl" alt="图片" />
</template>
```

### 滚动优化：

```vue
<template>
  <!-- 平滑滚动 -->
  <div v-optimize-scroll.smooth class="scroll-container">
    滚动内容
  </div>
  
  <!-- 隐藏滚动条 -->
  <div v-optimize-scroll.hideScrollbar class="scroll-container">
    滚动内容
  </div>
</template>
```

### 触摸优化：

```vue
<template>
  <!-- 触摸反馈 -->
  <button v-optimize-touch.feedback @click="handleClick">
    点击按钮
  </button>
  
  <!-- 禁用选择和长按菜单 -->
  <div v-optimize-touch.noSelect.noCallout>
    不可选择的内容
  </div>
</template>
```

## 6. 响应式样式

### 使用响应式Mixins：

```scss
.my-component {
  @include responsive-padding($mobile-spacing-md, $desktop-spacing-lg);
  @include responsive-font-size($mobile-font-lg, $desktop-font-md);
  
  @include mobile-only {
    // 仅在手机端生效
    background-color: #f5f5f5;
  }
  
  @include tablet-only {
    // 仅在平板端生效
    background-color: #fafafa;
  }
  
  @include desktop-up {
    // 桌面端及以上
    background-color: white;
  }
  
  .button {
    @include touch-target();
    @include touch-feedback();
    @include responsive-border-radius();
  }
}
```

## 7. 缓存管理

```javascript
import { cacheManager } from '@/utils/performance'

// 设置缓存
cacheManager.set('user_data', userData, 30 * 60 * 1000) // 30分钟

// 获取缓存
const userData = cacheManager.get('user_data')

// 删除缓存
cacheManager.delete('user_data')

// 清空所有缓存
cacheManager.clear()
```

## 8. 性能监控

```javascript
import { performanceMonitor } from '@/utils/performance'

// 开始监控
performanceMonitor.start()

// 记录加载时间
performanceMonitor.recordLoadTime('page_load', 1500)

// 获取性能报告
const report = performanceMonitor.getReport()
console.log('性能报告:', report)
```

## 9. 注意事项

1. **内存管理**: 组件销毁时会自动清理定时器和观察者
2. **触摸优化**: 所有交互元素都已优化触摸体验
3. **性能**: 移动端自动启用硬件加速和优化渲染
4. **兼容性**: 保持桌面端功能完整性
5. **测试**: 建议在真机上测试手势和触摸功能

## 10. 浏览器支持

- iOS Safari 12+
- Chrome Mobile 70+
- Android WebView 70+
- 桌面端现代浏览器
