<template>
  <el-menu class="navbar" mode="horizontal">
    <hamburger class="hamburger-container" :toggleClick="toggleSideBar" :isActive="sidebar.opened"></hamburger>
    <breadcrumb></breadcrumb>
    
    <!-- 主题切换按钮 -->
    <div class="theme-toggle-container">
      <theme-toggle @theme-changed="onThemeChanged" />
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
  </el-menu>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import ThemeToggle from '@/components/ThemeToggle'

export default {
  components: {
    Breadcrumb,
    Hamburger,
    ThemeToggle
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar'
    ])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('ToggleSideBar')
    },
    logout() {
      this.$store.dispatch('LogOut').then(() => {
        location.reload() // 为了重新实例化vue-router对象 避免bug
      })
    },
    onThemeChanged(newTheme) {
      this.$message({
        message: `已切换到${newTheme === 'dark' ? '暗色' : '亮色'}主题`,
        type: 'success',
        duration: 2000
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/styles/variables.scss";

.navbar {
  height: 50px;
  line-height: 50px;
  border-radius: 0px !important;
  position: relative;
  @include theme-background();
  border-bottom: 1px solid var(--theme-border-color) !important;
  @include theme-transition();
  
  .hamburger-container {
    line-height: 58px;
    height: 50px;
    float: left;
    padding: 0 10px;
  }
  
  .screenfull {
    position: absolute;
    right: 90px;
    top: 16px;
    color: red;
  }
  
  .theme-toggle-container {
    position: absolute;
    right: 85px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1000;
  }
  
  .avatar-container {
    height: 50px;
    display: inline-block;
    position: absolute;
    right: 35px;
    
    .avatar-wrapper {
      cursor: pointer;
      margin-top: 5px;
      position: relative;
      
      .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 10px;
      }
      
      .el-icon-caret-bottom {
        position: absolute;
        right: -20px;
        top: 25px;
        font-size: 12px;
        @include theme-text();
      }
    }
  }
}
</style>

