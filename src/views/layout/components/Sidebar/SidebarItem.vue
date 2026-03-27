<template>
  <div v-if="!item.meta?.hidden">
    <!-- 单个路由或者只有一个显示的子路由 -->
    <template v-if="hasOneShowingChild(item.children, item) && (!onlyOneChild?.children || onlyOneChild.noShowingChildren) && !item.alwaysShow">
      <app-link v-if="onlyOneChild?.meta" :to="resolvePath(onlyOneChild.path)">
        <el-menu-item :index="resolvePath(onlyOneChild.path)" :class="{ 'submenu-title-noDropdown': !isNest }">
          <svg-icon v-if="onlyOneChild.meta.icon" :icon-class="onlyOneChild.meta.icon" class="menu-icon" />
          <template #title>
            <span>{{ onlyOneChild.meta.title }}</span>
          </template>
        </el-menu-item>
      </app-link>
    </template>

    <!-- 多个子路由 -->
    <el-sub-menu v-else :index="resolvePath(item.path)">
      <template #title>
        <svg-icon v-if="item.meta?.icon" :icon-class="item.meta.icon" class="menu-icon" />
        <span>{{ item.meta?.title }}</span>
      </template>
      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(child.path)"
        class="nest-menu"
      />
    </el-sub-menu>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import AppLink from './AppLink.vue'
import SvgIcon from '@/components/SvgIcon/index.vue'

interface Props {
  item: RouteRecordRaw
  isNest?: boolean
  basePath?: string
}

const props = withDefaults(defineProps<Props>(), {
  isNest: false,
  basePath: ''
})

const onlyOneChild = ref<RouteRecordRaw | null>(null)

// 判断是否只有一个显示的子路由
const hasOneShowingChild = (children: RouteRecordRaw[] = [], parent: RouteRecordRaw): boolean => {
  const showingChildren = children.filter((item: RouteRecordRaw) => {
    if (item.meta?.hidden) {
      return false
    } else {
      // 临时设置(will be used if only has one showing child)
      onlyOneChild.value = item
      return true
    }
  })

  // 当只有一个子路由时，默认显示该子路由
  if (showingChildren.length === 1) {
    return true
  }

  // 没有子路由时，显示父路由
  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: '', noShowingChildren: true } as RouteRecordRaw & { noShowingChildren: boolean }
    return true
  }

  return false
}

// 解析路径
const resolvePath = (routePath: string): string => {
  if (routePath.startsWith('/')) {
    return routePath
  }
  if (props.basePath.endsWith('/')) {
    return props.basePath + routePath
  }
  return props.basePath + '/' + routePath
}
</script>

<style lang="scss" scoped>
.menu-icon {
  margin-right: 5px;
  width: 18px;
  height: 18px;
}

.nest-menu {
  :deep(.el-sub-menu__title) {
    padding-left: 40px !important;
  }
  
  :deep(.el-menu-item) {
    padding-left: 40px !important;
  }
}
</style>
