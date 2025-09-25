<template>
  <div class="customer-behavior-layout">
    <!-- 侧边导航 -->
    <div class="sidebar">
      <div class="sidebar-header">
        <h3>客户行为分析</h3>
      </div>
      <el-menu
        :default-active="currentRoute"
        class="sidebar-menu"
        router
        :collapse="false"
      >
        <el-menu-item index="/customer-behavior/dashboard">
          <i class="el-icon-dashboard"></i>
          <span slot="title">行为仪表板</span>
        </el-menu-item>
        <el-menu-item index="/customer-behavior/page-visit">
          <i class="el-icon-view"></i>
          <span slot="title">页面访问统计</span>
        </el-menu-item>
        <el-menu-item index="/customer-behavior/stay-time">
          <i class="el-icon-time"></i>
          <span slot="title">停留时间分析</span>
        </el-menu-item>
        <el-menu-item index="/customer-behavior/bounce-rate">
          <i class="el-icon-warning"></i>
          <span slot="title">跳出率分析</span>
        </el-menu-item>
        <el-menu-item index="/customer-behavior/user-profile">
          <i class="el-icon-user"></i>
          <span slot="title">用户画像分析</span>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomerBehaviorLayout',
  computed: {
    currentRoute() {
      return this.$route.path
    }
  }
}
</script>

<style scoped>
.customer-behavior-layout {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 250px;
  background-color: #304156;
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
}

.sidebar-header {
  padding: 20px;
  background-color: #263445;
  color: #fff;
  text-align: center;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.sidebar-menu {
  border: none;
  background-color: #304156;
}

.sidebar-menu .el-menu-item {
  color: #bfcbd9;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-menu .el-menu-item:hover {
  background-color: #263445;
  color: #409EFF;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #409EFF;
  color: #fff;
}

.sidebar-menu .el-menu-item i {
  margin-right: 8px;
  font-size: 16px;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  background-color: #f0f2f5;
}
</style>