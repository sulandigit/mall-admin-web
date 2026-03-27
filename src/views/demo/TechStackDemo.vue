<template>
  <div class="demo-page">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>Vue 3 + TypeScript 新特性演示</span>
          <el-button type="primary" @click="resetDemo">重置演示</el-button>
        </div>
      </template>

      <!-- Composition API 演示 -->
      <div class="demo-section">
        <h3>1. Composition API + TypeScript</h3>
        <div class="demo-content">
          <el-input
            v-model="userInput"
            placeholder="输入内容测试响应式"
            style="width: 300px; margin-right: 10px"
          />
          <el-button @click="addToList">添加到列表</el-button>
        </div>
        <div class="result">
          <p>输入内容: {{ userInput }}</p>
          <p>字符长度: {{ inputLength }}</p>
          <ul>
            <li v-for="(item, index) in itemList" :key="index">
              {{ item }} - {{ formatTime(new Date()) }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Pinia 状态管理演示 -->
      <div class="demo-section">
        <h3>2. Pinia 状态管理</h3>
        <div class="demo-content">
          <el-button @click="toggleSidebar">
            {{ appStore.sidebarOpened ? '关闭' : '打开' }}侧边栏
          </el-button>
          <el-button @click="switchDevice" type="success">
            切换设备 (当前: {{ appStore.deviceType }})
          </el-button>
        </div>
        <div class="result">
          <p>侧边栏状态: {{ appStore.sidebarOpened ? '打开' : '关闭' }}</p>
          <p>设备类型: {{ appStore.deviceType }}</p>
        </div>
      </div>

      <!-- 性能优化演示 -->
      <div class="demo-section">
        <h3>3. 性能优化功能</h3>
        <div class="demo-content">
          <el-button @click="triggerThrottleDemo">节流函数演示</el-button>
          <el-button @click="triggerDebounceDemo" type="warning">防抖函数演示</el-button>
          <el-button @click="loadPerformanceData" type="info">加载性能数据</el-button>
        </div>
        <div class="result">
          <p>节流触发次数: {{ throttleCount }}</p>
          <p>防抖触发次数: {{ debounceCount }}</p>
          <p>性能数据: {{ performanceData }}</p>
        </div>
      </div>

      <!-- 安全功能演示 -->
      <div class="demo-section">
        <h3>4. 安全功能</h3>
        <div class="demo-content">
          <el-input
            v-model="securityInput"
            placeholder="输入HTML代码测试XSS防护"
            style="width: 400px; margin-right: 10px"
          />
          <el-button @click="testSecurity">测试安全过滤</el-button>
        </div>
        <div class="result">
          <p>原始输入: <code>{{ securityInput }}</code></p>
          <p>过滤后: <code>{{ escapedInput }}</code></p>
          <p>验证结果: {{ securityValid ? '安全' : '包含危险代码' }}</p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { throttle, debounce } from '@/utils/performance'
import { escapeHtml, validateInput } from '@/utils/security'
import { ElMessage } from 'element-plus'

// 使用Pinia store
const appStore = useAppStore()

// 响应式数据
const userInput = ref<string>('')
const itemList = ref<string[]>([])
const throttleCount = ref<number>(0)
const debounceCount = ref<number>(0)
const performanceData = ref<string>('未加载')
const securityInput = ref<string>('<script>alert("XSS")</script>')
const escapedInput = ref<string>('')
const securityValid = ref<boolean>(true)

// 计算属性
const inputLength = computed(() => userInput.value.length)

// 节流和防抖函数
const throttledFunction = throttle(() => {
  throttleCount.value++
  ElMessage.success(`节流函数触发: ${throttleCount.value}`)
}, 1000)

const debouncedFunction = debounce(() => {
  debounceCount.value++
  ElMessage.success(`防抖函数触发: ${debounceCount.value}`)
}, 1000)

// 方法定义
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString()
}

const addToList = (): void => {
  if (userInput.value.trim()) {
    itemList.value.push(userInput.value)
    userInput.value = ''
    ElMessage.success('添加成功')
  }
}

const toggleSidebar = (): void => {
  appStore.toggleSidebar()
  ElMessage.info(`侧边栏已${appStore.sidebarOpened ? '打开' : '关闭'}`)
}

const switchDevice = (): void => {
  const newDevice = appStore.deviceType === 'desktop' ? 'mobile' : 'desktop'
  appStore.toggleDevice(newDevice)
  ElMessage.info(`设备切换为: ${newDevice}`)
}

const triggerThrottleDemo = (): void => {
  throttledFunction()
}

const triggerDebounceDemo = (): void => {
  debouncedFunction()
}

const loadPerformanceData = (): void => {
  // 模拟性能数据加载
  const metrics = {
    loadTime: Math.round(Math.random() * 1000) + 500,
    renderTime: Math.round(Math.random() * 100) + 50,
    memoryUsage: Math.round(Math.random() * 50) + 20
  }
  performanceData.value = `加载: ${metrics.loadTime}ms, 渲染: ${metrics.renderTime}ms, 内存: ${metrics.memoryUsage}MB`
  ElMessage.success('性能数据已加载')
}

const testSecurity = (): void => {
  escapedInput.value = escapeHtml(securityInput.value)
  securityValid.value = validateInput(securityInput.value)
  
  if (securityValid.value) {
    ElMessage.success('输入内容安全')
  } else {
    ElMessage.warning('检测到潜在危险代码')
  }
}

const resetDemo = (): void => {
  userInput.value = ''
  itemList.value = []
  throttleCount.value = 0
  debounceCount.value = 0
  performanceData.value = '未加载'
  securityInput.value = '<script>alert("XSS")</script>'
  escapedInput.value = ''
  securityValid.value = true
  ElMessage.success('演示已重置')
}

// 生命周期
onMounted(() => {
  ElMessage.success('Vue 3 + TypeScript 演示组件已加载')
  testSecurity() // 初始化安全演示
})
</script>

<style scoped lang="scss">
.demo-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.demo-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fafafa;

  h3 {
    margin-top: 0;
    color: #409eff;
  }
}

.demo-content {
  margin-bottom: 15px;
  
  .el-button {
    margin-right: 10px;
    margin-bottom: 10px;
  }
}

.result {
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border-left: 4px solid #409eff;

  p {
    margin: 5px 0;
    line-height: 1.6;
  }

  code {
    background-color: #e6f7ff;
    padding: 2px 4px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
  }

  ul {
    margin: 10px 0;
    padding-left: 20px;

    li {
      margin: 5px 0;
    }
  }
}
</style>