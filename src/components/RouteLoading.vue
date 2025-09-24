<template>
  <div class="route-loading" v-if="isLoading">
    <div class="loading-content">
      <div class="loading-spinner">
        <i class="el-icon-loading"></i>
      </div>
      <p class="loading-text">页面加载中...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RouteLoading',
  data() {
    return {
      isLoading: true
    }
  },
  mounted() {
    // 模拟加载时间，实际项目中可以根据需要调整
    setTimeout(() => {
      this.isLoading = false
    }, 300)
  }
}
</script>

<style lang="scss" scoped>
.route-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  
  .loading-content {
    text-align: center;
    
    .loading-spinner {
      font-size: 24px;
      color: #409EFF;
      margin-bottom: 15px;
      
      i {
        animation: rotating 2s linear infinite;
      }
    }
    
    .loading-text {
      color: #606266;
      font-size: 14px;
      margin: 0;
    }
  }
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>