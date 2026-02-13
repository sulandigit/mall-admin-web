<template>
  <el-menu class="navbar" mode="horizontal">
    <hamburger 
      class="hamburger-container" 
      :toggleClick="toggleSideBar" 
      :isActive="sidebar.opened"
    ></hamburger>
    
    <!-- 桌面端显示面包屑导航 -->
    <breadcrumb v-if="!isMobileOrTablet" class="breadcrumb-container"></breadcrumb>
    
    <!-- 移动端显示页面标题 -->
    <div v-else class="page-title">
      <span>{{ pageTitle }}</span>
    </div>
    
    <div class="navbar-right">
      <!-- 只在平板和桌面端显示的操作按钮 -->
      <div v-if="!isMobile" class="toolbar">
        <!-- 可以在这里添加其他工具按钮 -->
      </div>
      
      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <img class="user-avatar" :src="avatar">
          <i class="el-icon-caret-bottom"></i>
        </div>
        <el-dropdown-menu class="user-dropdown" slot="dropdown">
          <router-link class="inlineBlock" to="/">
            <el-dropdown-item>
              首页
            </el-dropdown-item>
          </router-link>
          <el-dropdown-item divided>
            <span @click="logout" style="display:block;">退出</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </el-menu>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'

export default {
  components: {
    Breadcrumb,
    Hamburger
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'isMobile',
      'isMobileOrTablet'
    ]),
    /**
     * 获取当前页面标题
     */
    pageTitle() {
      // 从路由元数据中获取标题
      if (this.$route.meta && this.$route.meta.title) {
        return this.$route.meta.title
      }
      
      // 如果没有路由标题，使用面包屑的最后一级
      const matched = this.$route.matched
      if (matched && matched.length > 0) {
        const lastMatch = matched[matched.length - 1]
        if (lastMatch.meta && lastMatch.meta.title) {
          return lastMatch.meta.title
        }
      }
      
      return '后台管理'
    }
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('ToggleSideBar')
    },
    logout() {
      this.$store.dispatch('LogOut').then(() => {
        location.reload() // 为了重新实例化vue-router对象 避免bug
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/styles/responsive-mixins.scss";

.navbar {
  height: 50px;
  line-height: 50px;
  border-radius: 0px !important;
  display: flex;
  align-items: center;
  position: relative;
  
  @include mobile-device {
    height: 56px; // 移动端高度稍大
    line-height: 56px;
    padding: 0 $mobile-spacing-sm;
    
    // 为安全区域适配
    @supports (padding: max(0px)) {
      padding-left: max($mobile-spacing-sm, env(safe-area-inset-left));
      padding-right: max($mobile-spacing-sm, env(safe-area-inset-right));
    }
  }
  
  .hamburger-container {
    line-height: 58px;
    height: 50px;
    float: left;
    cursor: pointer;
    
    @include mobile-device {
      @include touch-target();
      height: 56px;
      line-height: 56px;
      padding: 0 $mobile-spacing-sm;
    }
  }
  
  .breadcrumb-container {
    float: left;
    margin-left: $desktop-spacing-md;
    
    @include tablet-only {
      margin-left: $mobile-spacing-sm;
    }
  }
  
  .page-title {
    flex: 1;
    margin-left: $mobile-spacing-sm;
    font-size: $mobile-font-lg;
    font-weight: 500;
    color: $text-color-primary;
    
    @include text-truncate();
  }
  
  .navbar-right {
    display: flex;
    align-items: center;
    margin-left: auto;
    
    .toolbar {
      display: flex;
      align-items: center;
      margin-right: $desktop-spacing-md;
      
      @include tablet-only {
        margin-right: $mobile-spacing-sm;
      }
    }
  }
  
  .screenfull {
    position: absolute;
    right: 90px;
    top: 16px;
    color: red;
    
    @include mobile-device {
      display: none; // 移动端隐藏
    }
  }
  
  .avatar-container {
    height: 50px;
    display: inline-block;
    
    @include mobile-device {
      height: 56px;
      
      .avatar-wrapper {
        @include touch-target();
        @include touch-feedback();
      }
    }
    
    .avatar-wrapper {
      cursor: pointer;
      margin-top: 5px;
      position: relative;
      display: flex;
      align-items: center;
      
      @include mobile-device {
        margin-top: 8px;
      }
      
      .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        
        @include mobile-device {
          width: 36px;
          height: 36px;
          border-radius: 8px;
        }
      }
      
      .el-icon-caret-bottom {
        margin-left: 8px;
        font-size: 12px;
        color: $text-color-secondary;
        
        @include mobile-device {
          margin-left: 6px;
        }
      }
    }
  }
}

// 下拉菜单移动端优化
.user-dropdown {
  @include mobile-device {
    .el-dropdown-menu__item {
      @include touch-target();
      @include responsive-padding($mobile-spacing-md, $desktop-spacing-sm);
      font-size: $mobile-font-md;
    }
  }
}
</style>

