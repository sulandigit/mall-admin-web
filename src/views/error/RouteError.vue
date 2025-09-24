<template>
  <div class="route-error">
    <div class="error-content">
      <h2>页面加载失败</h2>
      <p>很抱歉，页面加载时出现了问题。</p>
      <el-button @click="retry" type="primary">重试</el-button>
      <el-button @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RouteError',
  methods: {
    retry() {
      // 重新加载当前路由
      this.$router.go(0)
    },
    goHome() {
      this.$router.push('/')
    }
  }
}
</script>

<style lang="scss" scoped>
.route-error {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
  
  .error-content {
    text-align: center;
    padding: 40px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    
    h2 {
      color: #303133;
      margin-bottom: 20px;
    }
    
    p {
      color: #606266;
      margin-bottom: 30px;
    }
    
    .el-button {
      margin: 0 10px;
    }
  }
}
</style>