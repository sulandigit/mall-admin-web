<template>
  <div class="app-wrapper" :class="classObj">
    <Sidebar class="sidebar-container" />
    <div class="main-container">
      <Navbar />
      <AppMain />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import Navbar from './components/Navbar.vue'
import Sidebar from './components/Sidebar.vue'
import AppMain from './components/AppMain.vue'

// 使用 Pinia store
const appStore = useAppStore()

// 计算属性
const sidebar = computed(() => appStore.sidebar)
const device = computed(() => appStore.device)
const classObj = computed(() => ({
  hideSidebar: !sidebar.value.opened,
  withoutAnimation: sidebar.value.withoutAnimation,
  mobile: device.value === 'mobile'
}))

// 响应式处理函数
const handleResize = () => {
  const rect = document.body.getBoundingClientRect()
  const isMobile = rect.width - 1 < 992
  
  if (isMobile) {
    appStore.toggleDevice('mobile')
    appStore.closeSidebar(true)
  } else {
    appStore.toggleDevice('desktop')
  }
}

// 生命周期钩子
onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
@import '@/styles/mixin.scss';

.app-wrapper {
  @include clearfix;
  position: relative;
  height: 100%;
  width: 100%;
  
  &.mobile {
    .sidebar-container {
      transition: transform 0.28s;
      width: 210px !important;
    }
    
    &.hideSidebar {
      .sidebar-container {
        pointer-events: none;
        transition-duration: 0.3s;
        transform: translate3d(-210px, 0, 0);
      }
    }
  }
  
  &.withoutAnimation {
    .sidebar-container,
    .main-container {
      transition: none;
    }
  }
}

.hideSidebar {
  .sidebar-container {
    width: 64px !important;
  }
  
  .main-container {
    margin-left: 64px;
  }
}
</style>
