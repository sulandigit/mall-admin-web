<template>
  <div class="app-wrapper" :class="classObj" role="application" aria-label="商城管理后台">
    <!-- 跳转链接 -->
    <a href="#main-content" class="skip-link" v-skip-link="'#main-content'">跳转到主要内容</a>
    
    <!-- 侧边栏导航 -->
    <nav class="sidebar-container" 
         role="navigation" 
         aria-label="主导航菜单"
         :aria-expanded="sidebar.opened.toString()">
      <sidebar></sidebar>
    </nav>
    
    <!-- 主要内容区域 -->
    <div class="main-container" role="main">
      <!-- 顶部导航栏 -->
      <header role="banner" aria-label="顶部导航">
        <navbar></navbar>
      </header>
      
      <!-- 主要内容 -->
      <main id="main-content" tabindex="-1" aria-label="主要内容区域">
        <app-main></app-main>
      </main>
    </div>
  </div>
</template>

<script>
import { Navbar, Sidebar, AppMain } from './components'
import ResizeMixin from './mixin/ResizeHandler'

export default {
  name: 'layout',
  components: {
    Navbar,
    Sidebar,
    AppMain
  },
  mixins: [ResizeMixin],
  computed: {
    sidebar() {
      return this.$store.state.app.sidebar
    },
    device() {
      return this.$store.state.app.device
    },
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import "src/styles/mixin.scss";
  .app-wrapper {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;
  }
</style>
