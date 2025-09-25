<template>
  <div class="promotion-banner" @click="handleBannerClick">
    <div class="banner-background">
      <img 
        v-if="bannerImage" 
        :src="bannerImage" 
        alt="双11促销横幅"
        class="banner-image"
        @error="handleImageError"
      />
      <div v-else class="default-banner"></div>
    </div>
    
    <div class="banner-content">
      <div class="banner-text">
        <h1 class="banner-title">{{ bannerTitle }}</h1>
        <p class="banner-subtitle">{{ bannerSubtitle }}</p>
      </div>
      
      <div v-if="showCountdown && countdownEndTime" class="banner-countdown">
        <countdown-timer 
          :end-time="countdownEndTime"
          @finished="handleCountdownFinished"
          @tick="handleCountdownTick"
        />
      </div>
      
      <div class="banner-actions">
        <el-button 
          v-if="actionButton.show"
          :type="actionButton.type"
          :size="actionButton.size"
          class="action-btn"
          @click.stop="handleActionClick">
          {{ actionButton.text }}
        </el-button>
      </div>
    </div>
    
    <!-- 装饰元素 -->
    <div class="decoration-elements">
      <div class="floating-element element-1">🎁</div>
      <div class="floating-element element-2">🎉</div>
      <div class="floating-element element-3">💰</div>
      <div class="floating-element element-4">🏆</div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import CountdownTimer from '@/components/CountdownTimer'

export default {
  name: 'PromotionBanner',
  components: {
    CountdownTimer
  },
  props: {
    bannerImage: {
      type: String,
      default: ''
    },
    bannerTitle: {
      type: String,
      default: '双11狂欢节'
    },
    bannerSubtitle: {
      type: String,
      default: '全场5折起，优惠券免费领取！'
    },
    bannerLink: {
      type: String,
      default: ''
    },
    showCountdown: {
      type: Boolean,
      default: true
    },
    actionButton: {
      type: Object,
      default: () => ({
        show: true,
        text: '立即抢购',
        type: 'primary',
        size: 'medium'
      })
    }
  },
  computed: {
    ...mapState('holidayPromotion', [
      'countdownEndTime',
      'bannerSettings'
    ])
  },
  data() {
    return {
      imageLoadError: false
    }
  },
  methods: {
    handleBannerClick() {
      if (this.bannerLink) {
        if (this.bannerLink.startsWith('http')) {
          window.open(this.bannerLink, '_blank')
        } else {
          this.$router.push(this.bannerLink)
        }
      }
      this.$emit('banner-click')
    },
    
    handleActionClick() {
      this.$emit('action-click')
    },
    
    handleImageError() {
      this.imageLoadError = true
      console.warn('横幅图片加载失败')
    },
    
    handleCountdownFinished() {
      this.$emit('countdown-finished')
      this.$message.info('活动已结束')
    },
    
    handleCountdownTick(timeData) {
      this.$emit('countdown-tick', timeData)
    }
  }
}
</script>

<style scoped>
.promotion-banner {
  position: relative;
  margin-bottom: 30px;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 8px 16px rgba(255, 71, 87, 0.3);
  animation: fadeIn 1s ease-out;
  cursor: pointer;
  transition: transform 0.3s ease;
  min-height: 300px;
  background: linear-gradient(135deg, #FF4757 0%, #FFA500 100%);
}

.promotion-banner:hover {
  transform: scale(1.02);
}

.banner-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-banner {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #FF4757 0%, #FFA500 100%);
}

.banner-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  text-align: center;
  padding: 20px;
}

.banner-text {
  margin-bottom: 20px;
}

.banner-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  animation: slideInDown 0.8s ease-out;
}

.banner-subtitle {
  font-size: 1.5rem;
  margin-bottom: 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  animation: slideInUp 0.8s ease-out 0.2s backwards;
}

.banner-countdown {
  margin: 20px 0;
  animation: fadeIn 1s ease-out 0.4s backwards;
}

.banner-actions {
  animation: slideInUp 0.8s ease-out 0.6s backwards;
}

.action-btn {
  font-size: 1.1rem;
  padding: 12px 30px;
  border-radius: 25px;
  background: #FFD700;
  color: #333;
  border: none;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #FFC107;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

.decoration-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.floating-element {
  position: absolute;
  font-size: 2rem;
  animation: float 3s ease-in-out infinite;
}

.element-1 {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.element-2 {
  top: 20%;
  right: 15%;
  animation-delay: 0.5s;
}

.element-3 {
  bottom: 20%;
  left: 15%;
  animation-delay: 1s;
}

.element-4 {
  bottom: 10%;
  right: 10%;
  animation-delay: 1.5s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInDown {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .promotion-banner {
    min-height: 250px;
  }
  
  .banner-title {
    font-size: 2rem;
  }
  
  .banner-subtitle {
    font-size: 1.2rem;
  }
  
  .action-btn {
    font-size: 1rem;
    padding: 10px 25px;
  }
  
  .floating-element {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .promotion-banner {
    min-height: 200px;
    margin-bottom: 20px;
  }
  
  .banner-title {
    font-size: 1.5rem;
  }
  
  .banner-subtitle {
    font-size: 1rem;
  }
  
  .banner-content {
    padding: 15px;
  }
}
</style>