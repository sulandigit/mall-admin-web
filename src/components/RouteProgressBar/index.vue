<template>
  <transition name="route-progress-fade">
    <div class="route-progress-container" v-if="routeLoading.loading">
      <div class="route-progress-bar">
        <div 
          class="progress-line" 
          :style="{ width: routeLoading.progress + '%' }"
          :class="{ 'error': routeLoading.error }"
        ></div>
      </div>
      <div class="route-loading-text" v-if="routeLoading.error">
        页面加载失败，正在重试...
      </div>
    </div>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'RouteProgressBar',
  computed: {
    ...mapGetters(['routeLoading'])
  }
}
</script>

<style lang="scss" scoped>
.route-progress-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 9998;
  
  .route-progress-bar {
    height: 3px;
    background-color: rgba(64, 158, 255, 0.1);
    overflow: hidden;
    
    .progress-line {
      height: 100%;
      background: linear-gradient(90deg, #409EFF 0%, #67C23A 100%);
      transition: width 0.3s ease;
      animation: progressGlow 2s ease-in-out infinite alternate;
      
      &.error {
        background: linear-gradient(90deg, #F56C6C 0%, #E6A23C 100%);
        animation: errorPulse 1s ease-in-out infinite;
      }
    }
  }
  
  .route-loading-text {
    position: absolute;
    top: 3px;
    right: 10px;
    font-size: 12px;
    color: #F56C6C;
    background: rgba(255, 255, 255, 0.9);
    padding: 2px 8px;
    border-radius: 2px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
}

.route-progress-fade-enter-active,
.route-progress-fade-leave-active {
  transition: opacity 0.3s ease;
}

.route-progress-fade-enter,
.route-progress-fade-leave-to {
  opacity: 0;
}

@keyframes progressGlow {
  0% { 
    box-shadow: 0 0 5px rgba(64, 158, 255, 0.5);
  }
  100% { 
    box-shadow: 0 0 20px rgba(64, 158, 255, 0.8);
  }
}

@keyframes errorPulse {
  0%, 100% { 
    opacity: 1;
  }
  50% { 
    opacity: 0.7;
  }
}
</style>