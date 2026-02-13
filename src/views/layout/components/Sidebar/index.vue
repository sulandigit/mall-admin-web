<template>
  <scroll-bar>
    <el-menu
      mode="vertical"
      :show-timeout="200"
      :default-active="$route.path"
      :collapse="isCollapse"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
    >
      <sidebar-item :routes="routes"></sidebar-item>
    </el-menu>
  </scroll-bar>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SidebarItem from './SidebarItem.vue'
import ScrollBar from '@/components/ScrollBar/index.vue'

export default {
  name: 'Sidebar',
  components: { SidebarItem, ScrollBar },
  setup() {
    const route = useRoute()
    
    // 临时使用默认值，后续接入Pinia
    const sidebar = computed(() => ({
      opened: true
    }))
    
    const routes = computed(() => [])
    
    const isCollapse = computed(() => !sidebar.value.opened)
    
    return {
      sidebar,
      routes,
      isCollapse
    }
  }
}
</script>
