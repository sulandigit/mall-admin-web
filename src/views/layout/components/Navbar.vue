<template>
  <el-menu class="navbar" 
           mode="horizontal" 
           role="menubar"
           aria-label="顶部导航菜单">
    <!-- 菜单切换按钮 -->
    <div class="hamburger-container" 
         role="button"
         tabindex="0"
         :aria-label="sidebar.opened ? '折叠侧边栏' : '展开侧边栏'"
         :aria-expanded="sidebar.opened.toString()"
         @click="toggleSideBar"
         @keydown.enter="toggleSideBar"
         @keydown.space.prevent="toggleSideBar">
      <hamburger :toggleClick="toggleSideBar" :isActive="sidebar.opened"></hamburger>
    </div>
    
    <!-- 面包屑导航 -->
    <nav role="navigation" aria-label="面包屑导航">
      <breadcrumb></breadcrumb>
    </nav>
    
    <!-- 用户菜单 -->
    <el-dropdown class="avatar-container" 
                 trigger="click"
                 @command="handleCommand"
                 aria-label="用户菜单">
      <div class="avatar-wrapper" 
           role="button"
           tabindex="0"
           aria-haspopup="true"
           :aria-expanded="false"
           aria-label="打开用户菜单">
        <img class="user-avatar" 
             :src="avatar" 
             :alt="'用户头像'"
             role="img">
        <i class="el-icon-caret-bottom" aria-hidden="true"></i>
      </div>
      <el-dropdown-menu class="user-dropdown" 
                        slot="dropdown"
                        role="menu"
                        aria-label="用户操作菜单">
        <el-dropdown-item command="home" role="menuitem">
          <router-link class="inlineBlock" to="/" tabindex="-1">
            <span>首页</span>
          </router-link>
        </el-dropdown-item>
        <el-dropdown-item divided command="logout" role="menuitem">
          <span>退出</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </el-menu>
</template>

<script>
import { mapGetters } from 'vuex'
import { liveAnnouncer } from '@/utils/accessibility'
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
      'avatar'
    ])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('ToggleSideBar')
      const message = this.sidebar.opened ? '侧边栏已折叠' : '侧边栏已展开'
      liveAnnouncer.announce(message)
    },
    handleCommand(command) {
      switch(command) {
        case 'home':
          this.$router.push('/')
          liveAnnouncer.announce('正在跳转到首页')
          break
        case 'logout':
          this.logout()
          break
      }
    },
    logout() {
      this.$confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('LogOut').then(() => {
          liveAnnouncer.announce('已成功退出登录')
          location.reload() // 为了重新实例化vue-router对象 避免bug
        })
      }).catch(() => {
        liveAnnouncer.announce('已取消退出操作')
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.navbar {
  height: 50px;
  line-height: 50px;
  border-radius: 0px !important;
  
  .hamburger-container {
    line-height: 58px;
    height: 50px;
    float: left;
    padding: 0 10px;
    cursor: pointer;
    
    &:focus {
      outline: 2px solid #409EFF;
      outline-offset: 2px;
    }
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }
  
  .screenfull {
    position: absolute;
    right: 90px;
    top: 16px;
    color: red;
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
      padding: 5px;
      border-radius: 4px;
      
      &:focus {
        outline: 2px solid #409EFF;
        outline-offset: 2px;
      }
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.1);
      }
      
      .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        border: 2px solid transparent;
        transition: border-color 0.3s;
      }
      
      &:focus .user-avatar {
        border-color: #409EFF;
      }
      
      .el-icon-caret-bottom {
        position: absolute;
        right: -15px;
        top: 25px;
        font-size: 12px;
      }
    }
  }
}

/* 无障碍改进 */
.inlineBlock {
  display: inline-block;
  width: 100%;
  text-decoration: none;
  color: inherit;
  
  &:focus {
    outline: 2px solid #409EFF;
    outline-offset: -2px;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .navbar {
    border-bottom: 2px solid #000;
  }
  
  .hamburger-container:focus,
  .avatar-wrapper:focus {
    outline: 3px solid #000;
  }
}

/* 减少动画模式 */
@media (prefers-reduced-motion: reduce) {
  .avatar-wrapper,
  .user-avatar {
    transition: none;
  }
}
</style>

