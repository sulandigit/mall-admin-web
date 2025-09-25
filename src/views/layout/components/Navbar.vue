<template>
  <el-menu class="navbar" mode="horizontal">
    <hamburger class="hamburger-container" :toggleClick="toggleSideBar" :isActive="sidebar.opened"></hamburger>
    <breadcrumb></breadcrumb>
    
    <!-- 语言切换组件 -->
    <div class="language-container">
      <language-switcher 
        :show-icon="true" 
        :show-text="true" 
        placement="bottom" 
        class="position-header"
        @language-changed="onLanguageChanged"
      />
    </div>
    
    <el-dropdown class="avatar-container" trigger="click">
      <div class="avatar-wrapper">
        <img class="user-avatar" :src="avatar">
        <i class="el-icon-caret-bottom"></i>
      </div>
      <el-dropdown-menu class="user-dropdown" slot="dropdown">
        <router-link class="inlineBlock" to="/">
          <el-dropdown-item>
            {{ $t('menu.dashboard') }}
          </el-dropdown-item>
        </router-link>
        <el-dropdown-item divided>
          <span @click="logout" style="display:block;">{{ $t('common.action.logout') || '退出' }}</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </el-menu>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default {
  components: {
    Breadcrumb,
    Hamburger,
    LanguageSwitcher
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
    onLanguageChanged(locale) {
      // 语言切换后的回调，可以在这里做一些业务操作
      console.log('Language changed to:', locale)
      
      // 可以在这里重新加载某些数据或重置某些状态
      // this.fetchData()
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
  }
  .screenfull {
    position: absolute;
    right: 90px;
    top: 16px;
    color: red;
  }
  
  // 语言切换组件样式
  .language-container {
    position: absolute;
    right: 120px;
    top: 0;
    height: 50px;
    display: flex;
    align-items: center;
    
    ::v-deep .language-switcher {
      &.position-header {
        .language-trigger {
          color: #606266;
          
          .language-text {
            color: #606266;
          }
          
          &:hover {
            background-color: rgba(0, 0, 0, 0.05);
          }
        }
      }
    }
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

