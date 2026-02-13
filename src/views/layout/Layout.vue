<template>
  <div class="app-wrapper" :class="classObj">
    <!-- 移动端遮罩层 -->
    <div 
      v-if="isMobileOrTablet && sidebar.opened" 
      class="drawer-bg" 
      @click="handleClickOutside"
    ></div>
    
    <sidebar class="sidebar-container"></sidebar>
    
    <div class="main-container">
      <navbar></navbar>
      <app-main></app-main>
    </div>
    
    <!-- 手势支持组件 -->
    <sidebar-gesture v-if="isMobileOrTablet"></sidebar-gesture>
  </div>
</template>

<script>
import { Navbar, Sidebar, AppMain } from './components'
import ResizeMixin from './mixin/ResizeHandler'
import SidebarGesture from '@/components/SidebarGesture'
import { mapGetters } from 'vuex'

export default {
  name: 'layout',
  components: {
    Navbar,
    Sidebar,
    AppMain,
    SidebarGesture
  },
  mixins: [ResizeMixin],
  computed: {
    ...mapGetters([
      'sidebar',
      'device',
      'isMobileOrTablet'
    ]),
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile',
        tablet: this.device === 'tablet',
        'mobile-device': this.isMobileOrTablet
      }
    }
  },
  methods: {
    /**
     * 处理点击遮罩层关闭侧边栏
     */
    handleClickOutside() {
      if (this.isMobileOrTablet && this.sidebar.opened) {
        this.$store.dispatch('CloseSideBar', { withoutAnimation: false })
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import "src/styles/mixin.scss";
  @import "src/styles/responsive-mixins.scss";
  
  .app-wrapper {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;
    
    // 移动设备遮罩层
    .drawer-bg {
      background: rgba(0, 0, 0, 0.3);
      width: 100%;
      top: 0;
      height: 100%;
      position: absolute;
      z-index: $z-index-sidebar-overlay;
      
      @include desktop-device {
        display: none;
      }
    }
    
    // 移动设备类型的特殊样式
    &.mobile-device {
      // 为移动设备优化渲染性能
      transform: translateZ(0);
      
      .main-container {
        // 加速渲染
        will-change: margin-left;
      }
    }
    
    // 平板设备的特殊优化
    &.tablet {
      .sidebar-container {
        // 平板设备上的侧边栏更宽一些
        @include tablet-only {
          width: 200px !important;
          
          &.hideSidebar {
            width: 36px !important;
          }
        }
      }
    }
  }
</style>
