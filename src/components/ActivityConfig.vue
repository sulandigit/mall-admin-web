<template>
  <div>
    <!-- 配置面板遮罩 -->
    <div 
      :class="['config-overlay', { visible: visible }]"
      @click="handleClose">
    </div>
    
    <!-- 配置面板 -->
    <div :class="['activity-config', { visible: visible }]">
      <div class="config-header">
        <h3 class="config-title">活动配置</h3>
        <el-button 
          type="text" 
          icon="el-icon-close" 
          class="close-btn"
          @click="handleClose">
        </el-button>
      </div>
      
      <div class="config-content">
        <!-- 基本信息配置 -->
        <div class="config-section">
          <h4 class="section-title">基本信息</h4>
          <el-form :model="configForm" :rules="configRules" ref="configForm" label-width="100px">
            <el-form-item label="活动标题" prop="title">
              <el-input v-model="configForm.title" placeholder="请输入活动标题"></el-input>
            </el-form-item>
            
            <el-form-item label="活动描述" prop="description">
              <el-input 
                v-model="configForm.description" 
                type="textarea" 
                :rows="3"
                placeholder="请输入活动描述">
              </el-input>
            </el-form-item>
            
            <el-form-item label="活动时间" prop="timeRange">
              <el-date-picker
                v-model="configForm.timeRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                @change="handleTimeRangeChange">
              </el-date-picker>
            </el-form-item>
            
            <el-form-item label="活动状态" prop="status">
              <el-radio-group v-model="configForm.status">
                <el-radio :label="0">未开始</el-radio>
                <el-radio :label="1">进行中</el-radio>
                <el-radio :label="2">已结束</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 横幅配置 -->
        <div class="config-section">
          <h4 class="section-title">横幅配置</h4>
          <el-form :model="bannerForm" label-width="100px">
            <el-form-item label="横幅图片">
              <el-upload
                class="banner-uploader"
                action="/api/upload"
                :show-file-list="false"
                :on-success="handleBannerUpload"
                :before-upload="beforeBannerUpload">
                <img v-if="bannerForm.image" :src="bannerForm.image" class="banner-preview">
                <i v-else class="el-icon-plus banner-uploader-icon"></i>
              </el-upload>
            </el-form-item>
            
            <el-form-item label="横幅标题">
              <el-input v-model="bannerForm.title" placeholder="请输入横幅标题"></el-input>
            </el-form-item>
            
            <el-form-item label="横幅副标题">
              <el-input v-model="bannerForm.subtitle" placeholder="请输入横幅副标题"></el-input>
            </el-form-item>
            
            <el-form-item label="跳转链接">
              <el-input v-model="bannerForm.link" placeholder="请输入跳转链接"></el-input>
            </el-form-item>
            
            <el-form-item label="显示倒计时">
              <el-switch v-model="bannerForm.showCountdown"></el-switch>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 优惠券配置 -->
        <div class="config-section">
          <h4 class="section-title">优惠券配置</h4>
          <div class="coupon-config">
            <el-button type="primary" size="small" @click="handleAddCoupon">
              <i class="el-icon-plus"></i>
              添加优惠券
            </el-button>
            
            <div class="coupon-list">
              <div 
                v-for="(coupon, index) in selectedCoupons" 
                :key="coupon.id"
                class="coupon-item">
                <div class="coupon-info">
                  <span class="coupon-name">{{ coupon.name }}</span>
                  <span class="coupon-amount">¥{{ coupon.amount }}</span>
                </div>
                <div class="coupon-actions">
                  <el-button 
                    type="text" 
                    size="small" 
                    @click="handleEditCoupon(index)">
                    编辑
                  </el-button>
                  <el-button 
                    type="text" 
                    size="small" 
                    @click="handleRemoveCoupon(index)">
                    删除
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 商品配置 -->
        <div class="config-section">
          <h4 class="section-title">促销商品配置</h4>
          <div class="product-config">
            <el-button type="primary" size="small" @click="handleSelectProducts">
              <i class="el-icon-goods"></i>
              选择商品
            </el-button>
            
            <div class="selected-products-count">
              已选择 {{ selectedProducts.length }} 个商品
            </div>
          </div>
        </div>
        
        <!-- 预览和保存 -->
        <div class="config-actions">
          <el-button @click="handlePreview">预览效果</el-button>
          <el-button type="primary" @click="handleSave" :loading="saving">
            保存配置
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </div>
    </div>
    
    <!-- 优惠券选择弹窗 -->
    <el-dialog
      title="选择优惠券"
      :visible.sync="couponSelectVisible"
      width="800px">
      <div class="coupon-select-list">
        <el-checkbox-group v-model="selectedCouponIds">
          <div 
            v-for="coupon in availableCoupons" 
            :key="coupon.id"
            class="coupon-select-item">
            <el-checkbox :label="coupon.id" class="coupon-checkbox">
              <div class="coupon-select-info">
                <span class="coupon-select-name">{{ coupon.name }}</span>
                <span class="coupon-select-amount">¥{{ coupon.amount }}</span>
              </div>
            </el-checkbox>
          </div>
        </el-checkbox-group>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="couponSelectVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmCouponSelect">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'ActivityConfig',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      configForm: {
        title: '双11狂欢节',
        description: '双11全场大促，优惠券满天飞！',
        timeRange: [],
        status: 0
      },
      bannerForm: {
        image: '',
        title: '双11狂欢节',
        subtitle: '全场5折起，优惠券免费领取',
        link: '',
        showCountdown: true
      },
      selectedCoupons: [],
      selectedProducts: [],
      saving: false,
      couponSelectVisible: false,
      selectedCouponIds: [],
      availableCoupons: [],
      
      configRules: {
        title: [
          { required: true, message: '请输入活动标题', trigger: 'blur' },
          { max: 50, message: '标题长度不能超过50个字符', trigger: 'blur' }
        ],
        description: [
          { max: 200, message: '描述长度不能超过200个字符', trigger: 'blur' }
        ],
        timeRange: [
          { required: true, message: '请选择活动时间', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    ...mapState('holidayPromotion', [
      'promotionConfig',
      'bannerSettings'
    ])
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.loadConfigData()
        this.loadAvailableCoupons()
      }
    }
  },
  methods: {
    ...mapActions('holidayPromotion', [
      'updatePromotionConfig',
      'updateBannerSettings'
    ]),
    
    loadConfigData() {
      // 加载现有配置数据
      this.configForm = {
        title: this.promotionConfig.title || '双11狂欢节',
        description: this.promotionConfig.description || '双11全场大促，优惠券满天飞！',
        timeRange: this.promotionConfig.startTime && this.promotionConfig.endTime 
          ? [this.promotionConfig.startTime, this.promotionConfig.endTime] 
          : [],
        status: this.promotionConfig.status || 0
      }
      
      this.bannerForm = {
        image: this.bannerSettings.image || '',
        title: this.bannerSettings.title || '双11狂欢节',
        subtitle: this.bannerSettings.subtitle || '全场5折起，优惠券免费领取',
        link: this.bannerSettings.link || '',
        showCountdown: this.bannerSettings.showCountdown !== false
      }
    },
    
    async loadAvailableCoupons() {
      try {
        // 这里应该调用API获取可用的优惠券列表
        // 暂时使用模拟数据
        this.availableCoupons = [
          { id: '1', name: '满100减20优惠券', amount: 20 },
          { id: '2', name: '新人专享8折券', amount: 0.8 },
          { id: '3', name: '免邮券', amount: 0 },
          { id: '4', name: '满500减100优惠券', amount: 100 }
        ]
      } catch (error) {
        console.error('获取优惠券列表失败:', error)
      }
    },
    
    handleClose() {
      this.$emit('close')
    },
    
    handleTimeRangeChange(timeRange) {
      if (timeRange && timeRange.length === 2) {
        this.configForm.startTime = timeRange[0]
        this.configForm.endTime = timeRange[1]
      }
    },
    
    handleBannerUpload(response) {
      this.bannerForm.image = response.data.url
    },
    
    beforeBannerUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2
      
      if (!isJPG) {
        this.$message.error('上传图片只能是 JPG/PNG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },
    
    handleAddCoupon() {
      this.couponSelectVisible = true
      this.selectedCouponIds = this.selectedCoupons.map(c => c.id)
    },
    
    confirmCouponSelect() {
      this.selectedCoupons = this.availableCoupons.filter(
        coupon => this.selectedCouponIds.includes(coupon.id)
      )
      this.couponSelectVisible = false
    },
    
    handleEditCoupon(index) {
      // 这里可以打开编辑优惠券的弹窗
      this.$message.info('编辑优惠券功能开发中')
    },
    
    handleRemoveCoupon(index) {
      this.selectedCoupons.splice(index, 1)
    },
    
    handleSelectProducts() {
      // 这里可以打开选择商品的弹窗
      this.$message.info('选择商品功能开发中')
    },
    
    handlePreview() {
      this.$emit('preview')
      this.handleClose()
    },
    
    async handleSave() {
      try {
        await this.$refs.configForm.validate()
        
        this.saving = true
        
        // 保存基本配置
        await this.updatePromotionConfig({
          ...this.configForm,
          startTime: this.configForm.timeRange[0],
          endTime: this.configForm.timeRange[1]
        })
        
        // 保存横幅配置
        await this.updateBannerSettings(this.bannerForm)
        
        this.$message.success('配置保存成功！')
        this.$emit('saved')
        this.handleClose()
      } catch (error) {
        console.error('保存配置失败:', error)
        this.$message.error('保存配置失败，请重试')
      } finally {
        this.saving = false
      }
    },
    
    handleReset() {
      this.$refs.configForm.resetFields()
      this.bannerForm = {
        image: '',
        title: '双11狂欢节',
        subtitle: '全场5折起，优惠券免费领取',
        link: '',
        showCountdown: true
      }
      this.selectedCoupons = []
      this.selectedProducts = []
    }
  }
}
</script>

<style scoped>
.config-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.4s ease;
}

.config-overlay.visible {
  opacity: 1;
  visibility: visible;
}

.activity-config {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: #fff;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.3);
  transform: translateX(100%);
  transition: transform 0.4s ease;
  z-index: 1001;
  overflow-y: auto;
}

.activity-config.visible {
  transform: translateX(0);
}

.config-header {
  background: #FF4757;
  color: #fff;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
}

.close-btn:hover {
  opacity: 0.8;
}

.config-content {
  padding: 20px;
}

.config-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
  padding-bottom: 5px;
  border-bottom: 2px solid #FF4757;
}

.banner-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-uploader:hover {
  border-color: #409EFF;
}

.banner-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.banner-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.coupon-config,
.product-config {
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 15px;
}

.coupon-list {
  margin-top: 15px;
}

.coupon-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 10px;
}

.coupon-info {
  display: flex;
  flex-direction: column;
}

.coupon-name {
  font-weight: bold;
  margin-bottom: 4px;
}

.coupon-amount {
  color: #FF4757;
  font-weight: bold;
}

.selected-products-count {
  margin-top: 10px;
  color: #666;
  font-size: 0.9rem;
}

.config-actions {
  padding-top: 20px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.coupon-select-list {
  max-height: 400px;
  overflow-y: auto;
}

.coupon-select-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.coupon-select-item:last-child {
  border-bottom: none;
}

.coupon-checkbox {
  width: 100%;
}

.coupon-select-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-left: 10px;
}

.coupon-select-amount {
  color: #FF4757;
  font-weight: bold;
}

@media (max-width: 768px) {
  .activity-config {
    width: 100%;
  }
  
  .config-content {
    padding: 15px;
  }
  
  .config-actions {
    flex-direction: column;
  }
}
</style>