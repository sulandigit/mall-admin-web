<template>
  <el-menu class="navbar" mode="horizontal">
    <hamburger class="hamburger-container" :toggleClick="toggleSideBar" :isActive="sidebar.opened"></hamburger>
    <breadcrumb></breadcrumb>
    
    <!-- 快捷键按钮 -->
    <div class="shortcut-actions">
      <el-tooltip content="快捷键面板 (Ctrl + /)" placement="bottom">
        <el-button 
          type="text" 
          icon="el-icon-s-operation" 
          @click="toggleShortcutPanel"
          class="shortcut-btn">
        </el-button>
      </el-tooltip>
      
      <el-tooltip content="快捷键帮助 (F1)" placement="bottom">
        <el-button 
          type="text" 
          icon="el-icon-question" 
          @click="showShortcutHelp"
          class="shortcut-btn">
        </el-button>
      </el-tooltip>
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
import { mapGetters, mapActions } from 'vuex'
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
    ...mapActions([
      'ToggleShortcutPanel',
      'ShowHelpDialog'
    ]),
    toggleSideBar() {
      this.$store.dispatch('ToggleSideBar')
    },
    logout() {
      this.$store.dispatch('LogOut').then(() => {
        location.reload() // 为了重新实例化vue-router对象 避免bug
      })
    },
    /**
     * 切换快捷键面板
     */
    toggleShortcutPanel() {
      this.ToggleShortcutPanel()
    },
    /**
     * 显示快捷键帮助
     */
    showShortcutHelp() {
      this.ShowHelpDialog()
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.navbar {
  height: 50px;
  line-height: 50px;
  border-radius: 0px !important;
  position: relative;
  
  .hamburger-container {
    line-height: 58px;
    height: 50px;
    float: left;
    padding: 0 10px;
  }
  
  .shortcut-actions {
    float: right;
    margin-right: 20px;
    
    .shortcut-btn {
      padding: 0;
      margin: 0 8px;
      font-size: 16px;
      color: #909399;
      
      &:hover {
        color: #409EFF;
      }
    }
  }
  
  .avatar-container {
    height: 50px;
    margin-right: 30px;
    
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
      }
    }
  }
}
</style>

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
      }
    }
  }
}
</style>

