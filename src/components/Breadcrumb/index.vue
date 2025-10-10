<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item, index) in levelList" :key="item.path">
        <span v-if="item.redirect === 'noredirect' || index === levelList.length - 1" class="no-redirect">
          {{ item.meta?.title }}
        </span>
        <a v-else @click.prevent="handleLink(item)">
          {{ item.meta?.title }}
        </a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { RouteLocationMatched } from 'vue-router'

const route = useRoute()
const router = useRouter()

const levelList = ref<RouteLocationMatched[]>([])

// 获取面包屑导航列表
const getBreadcrumb = () => {
  // 过滤出有meta.title的路由
  let matched = route.matched.filter(item => item.meta && item.meta.title)
  
  // 如果不是首页，添加首页到面包屑
  const first = matched[0]
  if (!isDashboard(first)) {
    matched = [{ path: '/home', meta: { title: '首页' } } as RouteLocationMatched].concat(matched)
  }
  
  levelList.value = matched.filter(item => 
    item.meta && 
    item.meta.title && 
    item.meta.breadcrumb !== false
  )
}

// 判断是否是首页
const isDashboard = (route: RouteLocationMatched): boolean => {
  const name = route?.name
  if (!name) {
    return false
  }
  return (name as string).trim().toLowerCase() === 'home'
}

// 处理面包屑点击
const handleLink = (item: RouteLocationMatched) => {
  const { redirect, path } = item
  if (redirect) {
    router.push(redirect as string)
    return
  }
  router.push(path)
}

// 监听路由变化
watch(() => route.path, () => {
  getBreadcrumb()
}, { immediate: true })
</script>

<style lang="scss" scoped>
.app-breadcrumb.el-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
  margin-left: 8px;

  .no-redirect {
    color: #97a8be;
    cursor: text;
  }
}

.breadcrumb-enter-active,
.breadcrumb-leave-active {
  transition: all 0.5s;
}

.breadcrumb-enter-from,
.breadcrumb-leave-active {
  opacity: 0;
  transform: translateX(20px);
}

.breadcrumb-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>