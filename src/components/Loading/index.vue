<template>
  <div class="loading-container" v-if="visible">
    <!-- 全局加载动画 -->
    <div v-if="type === 'global'" class="global-loading">
      <div class="loading-content">
        <div class="loading-logo">
          <img src="@/assets/logo.png" alt="logo" v-if="showLogo">
        </div>
        <div class="loading-spinner">
          <div class="spinner"></div>
        </div>
        <div class="loading-text">{{ text }}</div>
        <div class="loading-progress" v-if="showProgress">
          <el-progress :percentage="progress" :show-text="false"></el-progress>
          <span class="progress-text">{{ progress }}%</span>
        </div>
      </div>
    </div>

    <!-- 路由加载进度条 -->
    <div v-else-if="type === 'route'" class="route-loading">
      <div class="route-progress-bar">
        <div class="progress-line" :style="{ width: progress + '%' }"></div>
      </div>
    </div>

    <!-- 组件加载骨架屏 -->
    <div v-else-if="type === 'skeleton'" class="skeleton-loading">
      <div class="skeleton-header"></div>
      <div class="skeleton-content">
        <div class="skeleton-line" v-for="i in skeletonLines" :key="i"></div>
      </div>
    </div>

    <!-- 局部加载 -->
    <div v-else class="local-loading">
      <el-loading 
        :text="text"
        spinner="el-icon-loading"
        background="rgba(0, 0, 0, 0.8)">
      </el-loading>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Loading',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'local', // global, route, skeleton, local
      validator: value => ['global', 'route', 'skeleton', 'local'].includes(value)
    },
    text: {
      type: String,
      default: '加载中...'
    },
    progress: {
      type: Number,
      default: 0,
      validator: value => value >= 0 && value <= 100
    },
    showProgress: {
      type: Boolean,
      default: false
    },
    showLogo: {
      type: Boolean,
      default: true
    },
    skeletonLines: {
      type: Number,
      default: 3
    }
  }
}
</script>

<style lang="scss" scoped>
.loading-container {
  .global-loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;

    .loading-content {
      text-align: center;
      color: white;

      .loading-logo {
        margin-bottom: 30px;

        img {
          width: 80px;
          height: 80px;
          animation: logoFloat 2s ease-in-out infinite;
        }
      }

      .loading-spinner {
        margin-bottom: 20px;

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
      }

      .loading-text {
        font-size: 16px;
        margin-bottom: 20px;
        opacity: 0.9;
      }

      .loading-progress {
        width: 300px;
        margin: 0 auto;

        .progress-text {
          display: block;
          margin-top: 10px;
          font-size: 14px;
          opacity: 0.8;
        }
      }
    }
  }

  .route-loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 9998;

    .route-progress-bar {
      height: 3px;
      background-color: rgba(64, 158, 255, 0.2);
      overflow: hidden;

      .progress-line {
        height: 100%;
        background: linear-gradient(90deg, #409EFF 0%, #67C23A 100%);
        transition: width 0.3s ease;
        animation: progressGlow 2s ease-in-out infinite alternate;
      }
    }
  }

  .skeleton-loading {
    padding: 20px;

    .skeleton-header {
      height: 30px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: skeletonLoading 1.5s infinite;
      margin-bottom: 20px;
      border-radius: 4px;
    }

    .skeleton-content {
      .skeleton-line {
        height: 20px;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: skeletonLoading 1.5s infinite;
        margin-bottom: 10px;
        border-radius: 4px;

        &:nth-child(1) { width: 100%; }
        &:nth-child(2) { width: 80%; }
        &:nth-child(3) { width: 60%; }
      }
    }
  }

  .local-loading {
    position: relative;
    min-height: 100px;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes logoFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes progressGlow {
  0% { box-shadow: 0 0 5px rgba(64, 158, 255, 0.5); }
  100% { box-shadow: 0 0 20px rgba(64, 158, 255, 0.8); }
}

@keyframes skeletonLoading {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>