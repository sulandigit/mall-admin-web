<template>
  <scroll-bar>
    <el-menu
      mode="vertical"
      :show-timeout="200"
      :default-active="$route.path"
      :collapse="isCollapse"
      :background-color="menuBackgroundColor"
      :text-color="menuTextColor"
      :active-text-color="menuActiveTextColor"
      class="sidebar-menu"
    >
      <sidebar-item :routes="routes"></sidebar-item>
    </el-menu>
  </scroll-bar>
</template>

<script>
import { mapGetters } from 'vuex'
import SidebarItem from './SidebarItem'
import ScrollBar from '@/components/ScrollBar'

export default {
  components: { SidebarItem, ScrollBar },
  computed: {
    ...mapGetters([
      'sidebar',
      'routers',
      'currentTheme',
      'themeConfig'
    ]),
    routes() {
      // return this.$router.options.routes
      return this.routers
    },
    isCollapse() {
      return !this.sidebar.opened
    },
    // 动态菜单颜色
    menuBackgroundColor() {
      return this.themeConfig[this.currentTheme].menuBg
    },
    menuTextColor() {
      return this.currentTheme === 'light' ? '#bfcbd9' : '#CFD3DC'
    },
    menuActiveTextColor() {
      return '#409EFF'
    }
  }
}
</script>
