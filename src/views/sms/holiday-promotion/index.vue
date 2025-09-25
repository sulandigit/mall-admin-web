<template>
  <div class="holiday-promotion-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="title">{{ pageTitle }}</h1>
      <p class="subtitle">{{ pageSubtitle }}</p>
    </div>
    
    <!-- 配置模式切换按钮 -->
    <div class="config-toggle">
      <el-button 
        :type="isConfigMode ? 'warning' : 'primary'"
        class="toggle-btn"
        @click="handleToggleConfigMode">
        <i :class="isConfigMode ? 'el-icon-view' : 'el-icon-setting'"></i>
        {{ isConfigMode ? '预览模式' : '配置模式' }}
      </el-button>
    </div>
    
    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 促销横幅 -->
      <promotion-banner
        :banner-image="bannerSettings.image"
        :banner-title="bannerSettings.title"
        :banner-subtitle="bannerSettings.subtitle"
        :banner-link="bannerSettings.link"
        :show-countdown="bannerSettings.showCountdown"
        :action-button="bannerActionButton"
        @banner-click="handleBannerClick"
        @action-click="handleBannerAction"
        @countdown-finished="handleCountdownFinished"
      />
      
      <!-- 优惠券中心 -->
      <coupon-center 
        @coupon-received="handleCouponReceived"
      />
      
      <!-- 促销商品展示 -->
      <promotion-products 
        @product-click="handleProductClick"
        @add-to-cart="handleAddToCart"
        @add-to-wishlist="handleAddToWishlist"
      />
    </div>
    
    <!-- 活动配置面板 -->
    <activity-config
      :visible="showConfigPanel"
      @close="handleCloseConfig"
      @saved="handleConfigSaved"
      @preview="handlePreview"
    />
    
    <!-- 加载遮罩 -->
    <div v-if="pageLoading" class="page-loading">
      <div class="loading-content">
        <div class="loading-spinner">
          <div class="spinner"></div>
        </div>
        <p>正在加载双11促销活动...</p>
      </div>
    </div>
    
    <!-- 活动结束提示 -->
    <el-dialog
      title="活动提醒"
      :visible.sync="activityEndDialogVisible"
      width="400px"
      center>
      <div class="activity-end-content">
        <i class="el-icon-warning" style="font-size: 3rem; color: #E6A23C;"></i>
        <p>双11活动已结束，感谢您的参与！</p>
        <p>请关注我们后续的优惠活动。</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="activityEndDialogVisible = false">知道了</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import PromotionBanner from '@/components/PromotionBanner'
import CouponCenter from '@/components/CouponCenter'
import PromotionProducts from '@/components/PromotionProducts'
import ActivityConfig from '@/components/ActivityConfig'

export default {
  name: 'HolidayPromotionPage',
  components: {
    PromotionBanner,
    CouponCenter,
    PromotionProducts,
    ActivityConfig
  },
  data() {
    return {
      pageLoading: true,
      showConfigPanel: false,
      activityEndDialogVisible: false,
      bannerActionButton: {
        show: true,
        text: '立即抢购',
        type: 'primary',
        size: 'medium'
      }
    }
  },
  computed: {
    ...mapState('holidayPromotion', [
      'promotionConfig',
      'bannerSettings',
      'isConfigMode',
      'countdownEndTime'
    ]),
    
    pageTitle() {
      return this.promotionConfig.title || '双11狂欢节'
    },
    
    pageSubtitle() {
      return this.promotionConfig.description || '全场5折起，优惠券免费领取！'
    }
  },
  async mounted() {
    await this.initializePage()
  },
  methods: {
    ...mapActions('holidayPromotion', [
      'fetchPromotionConfig',
      'fetchCouponList',
      'fetchPromotionProducts',
      'toggleConfigMode',
      'resetState'
    ]),
    
    async initializePage() {
      try {
        this.pageLoading = true
        
        // 并行加载所有初始数据
        await Promise.all([
          this.loadPromotionConfig(),
          this.loadInitialData()
        ])
        
        // 检查活动状态
        this.checkActivityStatus()
        
      } catch (error) {
        console.error('页面初始化失败:', error)
        this.$message.error('页面加载失败，请刷新重试')
      } finally {
        this.pageLoading = false
      }
    },
    
    async loadPromotionConfig() {
      try {
        await this.fetchPromotionConfig()
      } catch (error) {
        console.error('获取促销配置失败:', error)
        // 使用默认配置
      }
    },
    
    async loadInitialData() {
      try {
        // 并行加载优惠券和商品数据
        await Promise.all([
          this.fetchCouponList(),
          this.fetchPromotionProducts()
        ])
      } catch (error) {
        console.error('加载初始数据失败:', error)
      }
    },
    
    checkActivityStatus() {
      if (this.promotionConfig.status === 2) {
        // 活动已结束
        this.activityEndDialogVisible = true
      } else if (this.countdownEndTime) {
        const now = new Date().getTime()
        const endTime = new Date(this.countdownEndTime).getTime()
        if (endTime <= now) {
          this.activityEndDialogVisible = true
        }
      }
    },
    
    handleToggleConfigMode() {
      this.toggleConfigMode()
      if (this.isConfigMode) {
        this.showConfigPanel = true
      }
    },
    
    handleCloseConfig() {
      this.showConfigPanel = false
      if (this.isConfigMode) {
        this.toggleConfigMode()
      }
    },
    
    handleConfigSaved() {
      this.$message.success('配置已保存')
      // 重新加载数据
      this.loadPromotionConfig()
    },
    
    handlePreview() {
      this.showConfigPanel = false
      this.$message.info('已切换到预览模式')
    },
    
    handleBannerClick() {
      // 横幅点击事件
      console.log('横幅被点击')
    },
    
    handleBannerAction() {
      // 横幅按钮点击事件
      this.$message.info('立即抢购功能开发中')
    },
    
    handleCountdownFinished() {
      this.activityEndDialogVisible = true
      this.$message.info('双11活动已结束')
    },
    
    handleCouponReceived(couponData) {
      this.$message.success(`成功领取优惠券：${couponData.name}`)
    },
    
    handleProductClick(product) {
      // 商品点击事件
      console.log('商品被点击:', product)
    },
    
    handleAddToCart(product) {
      this.$message.success(`${product.name} 已加入购物车`)
    },
    
    handleAddToWishlist(product) {
      this.$message.success(`${product.name} 已加入收藏`)
    },
    
    // 页面刷新方法
    async refreshPage() {
      this.resetState()
      await this.initializePage()
    }
  },
  
  // 页面离开时清理
  beforeDestroy() {
    this.resetState()
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/holiday-promotion.scss';

.holiday-promotion-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #FF4757 0%, #FFA500 100%);
  padding: 20px;
  position: relative;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
  animation: fadeIn 1s ease-out;
}

.title {
  font-size: 3rem;
  font-weight: bold;
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  margin-bottom: 10px;
  animation: slideInUp 0.8s ease-out;
}

.subtitle {
  font-size: 1.2rem;
  color: #FFD700;
  margin: 0;
  animation: slideInUp 0.8s ease-out 0.2s backwards;
}

.config-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.toggle-btn {
  background: #fff;
  color: #FF4757;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  font-weight: bold;
  box-shadow: 0 8px 16px rgba(255, 71, 87, 0.3);
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(255, 71, 87, 0.4);
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
}

.page-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 71, 87, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  color: #fff;
}

.loading-spinner {
  margin-bottom: 20px;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 6px solid rgba(255, 255, 255, 0.3);
  border-top: 6px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.activity-end-content {
  text-align: center;
  padding: 20px;
}

.activity-end-content p {
  margin: 10px 0;
  font-size: 1rem;
  color: #333;
}

/* 动画定义 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .holiday-promotion-page {
    padding: 10px;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
  
  .config-toggle {
    top: 10px;
    right: 10px;
  }
  
  .toggle-btn {
    padding: 8px 16px;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 1.5rem;
  }
  
  .page-header {
    margin-bottom: 20px;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .holiday-promotion-page {
    background: linear-gradient(135deg, #8B0000 0%, #B8860B 100%);
  }
}

/* 打印样式 */
@media print {
  .config-toggle,
  .page-loading {
    display: none !important;
  }
  
  .holiday-promotion-page {
    background: #fff !important;
    color: #000 !important;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .title,
  .subtitle {
    text-shadow: none;
    font-weight: bold;
  }
  
  .toggle-btn {
    border: 2px solid #000;
  }
}

/* 减少动画模式 */
@media (prefers-reduced-motion: reduce) {
  .title,
  .subtitle,
  .page-header,
  .toggle-btn,
  .spinner {
    animation: none !important;
    transition: none !important;
  }
}
</style>