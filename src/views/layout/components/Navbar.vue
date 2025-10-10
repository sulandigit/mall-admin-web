<template>
  <el-menu class="navbar" mode="horizontal">
    <hamburger 
      class="hamburger-container" 
      :toggle-click="toggleSideBar" 
      :is-active="appStore.sidebarOpened"
    />
    <breadcrumb />
    <el-dropdown class="avatar-container" trigger="click">
      <div class="avatar-wrapper">
        <img class="user-avatar" :src="userStore.userAvatar || defaultAvatar">
        <el-icon class="el-icon-caret-bottom"><ArrowDown /></el-icon>
      </div>
      <template #dropdown>
        <el-dropdown-menu class="user-dropdown">
          <router-link class="inline-block" to="/">
            <el-dropdown-item>
              首页
            </el-dropdown-item>
          </router-link>
          <router-link class="inline-block" to="/demo">
            <el-dropdown-item>
              技术演示
            </el-dropdown-item>
          </router-link>
          <el-dropdown-item divided @click="logout">
            <span style="display:block;">退出</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowDown } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import Breadcrumb from '@/components/Breadcrumb/index.vue'
import Hamburger from '@/components/Hamburger/index.vue'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

// 默认头像
const defaultAvatar = 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif'

// 切换侧边栏
const toggleSideBar = (): void => {
  appStore.toggleSidebar()
}

// 退出登录
const logout = async (): Promise<void> => {
  try {
    await userStore.logout()
    ElMessage.success('退出成功')
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
    // 强制退出
    await userStore.fedLogout()
    router.push('/login')
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  line-height: 50px;
  border-radius: 0px !important;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  
  .hamburger-container {
    line-height: 58px;
    height: 50px;
    float: left;
    padding: 0 10px;
    cursor: pointer;
    transition: background 0.3s;
    
    &:hover {
      background: rgba(0, 0, 0, 0.025);
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
      display: flex;
      align-items: center;
      
      .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        margin-right: 8px;
      }
      
      .el-icon-caret-bottom {
        font-size: 12px;
      }
    }
  }
}

.inline-block {
  display: inline-block;
  text-decoration: none;
  color: inherit;
}
</style>

