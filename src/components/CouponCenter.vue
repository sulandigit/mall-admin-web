<template>
  <div class="coupon-center">
    <h2 class="section-title">
      <i class="el-icon-tickets"></i>
      优惠券中心
    </h2>
    
    <!-- 筛选区域 -->
    <div class="filter-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-select v-model="filterType" placeholder="券类型" clearable @change="handleFilter">
            <el-option label="全部类型" value=""></el-option>
            <el-option label="满减券" value="0"></el-option>
            <el-option label="折扣券" value="1"></el-option>
            <el-option label="免邮券" value="2"></el-option>
            <el-option label="新人券" value="3"></el-option>
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="sortBy" placeholder="排序方式" @change="handleSort">
            <el-option label="面值从高到低" value="amount_desc"></el-option>
            <el-option label="面值从低到高" value="amount_asc"></el-option>
            <el-option label="即将过期" value="endTime_asc"></el-option>
            <el-option label="热门推荐" value="hot"></el-option>
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="refreshCoupons" :loading="loading">
            <i class="el-icon-refresh"></i>
            刷新
          </el-button>
        </el-col>
      </el-row>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-spinner">
      <div class="spinner"></div>
    </div>
    
    <!-- 优惠券网格 -->
    <div v-else class="coupon-grid">
      <coupon-card
        v-for="coupon in filteredCoupons"
        :key="coupon.id"
        :coupon="coupon"
        :is-received="isUserReceived(coupon.id)"
        :receive-status="getCouponReceiveStatus(coupon.id)"
        @receive="handleCouponReceive"
      />
    </div>
    
    <!-- 空状态 -->
    <div v-if="!loading && filteredCoupons.length === 0" class="empty-state">
      <i class="el-icon-tickets" style="font-size: 4rem; color: #ddd;"></i>
      <p>暂无优惠券</p>
    </div>
    
    <!-- 分页 -->
    <div v-if="pagination.total > 0" class="pagination-wrapper">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagination.pageNum"
        :page-size="pagination.pageSize"
        :page-sizes="[8, 12, 16, 20]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper">
      </el-pagination>
    </div>
    
    <!-- 领取确认弹窗 -->
    <el-dialog
      title="确认领取优惠券"
      :visible.sync="receiveDialogVisible"
      width="400px"
      center>
      <div v-if="selectedCoupon" class="receive-confirm">
        <div class="coupon-preview">
          <div class="preview-amount">¥{{ selectedCoupon.amount }}</div>
          <div class="preview-name">{{ selectedCoupon.name }}</div>
          <div class="preview-condition">
            <span v-if="selectedCoupon.minPoint > 0">满{{ selectedCoupon.minPoint }}元可用</span>
            <span v-else>无门槛使用</span>
          </div>
        </div>
        <p class="confirm-text">确认要领取这张优惠券吗？</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="receiveDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmReceive" :loading="receiving">
          确认领取
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import CouponCard from '@/components/CouponCard'

export default {
  name: 'CouponCenter',
  components: {
    CouponCard
  },
  data() {
    return {
      filterType: '',
      sortBy: 'hot',
      receiveDialogVisible: false,
      selectedCoupon: null,
      receiving: false
    }
  },
  computed: {
    ...mapState('holidayPromotion', [
      'couponList',
      'userReceivedCoupons',
      'isLoading',
      'couponReceiveStatus',
      'pagination'
    ]),
    
    loading() {
      return this.isLoading
    },
    
    filteredCoupons() {
      let coupons = [...this.couponList]
      
      // 类型筛选
      if (this.filterType !== '') {
        coupons = coupons.filter(coupon => coupon.type === parseInt(this.filterType))
      }
      
      // 排序
      switch (this.sortBy) {
        case 'amount_desc':
          coupons.sort((a, b) => b.amount - a.amount)
          break
        case 'amount_asc':
          coupons.sort((a, b) => a.amount - b.amount)
          break
        case 'endTime_asc':
          coupons.sort((a, b) => new Date(a.endTime) - new Date(b.endTime))
          break
        case 'hot':
          coupons.sort((a, b) => {
            if (a.isHot && !b.isHot) return -1
            if (!a.isHot && b.isHot) return 1
            return b.amount - a.amount
          })
          break
      }
      
      return coupons
    }
  },
  mounted() {
    this.loadCoupons()
    this.loadUserReceivedCoupons()
  },
  methods: {
    ...mapActions('holidayPromotion', [
      'fetchCouponList',
      'receiveCoupon',
      'fetchUserReceivedCoupons'
    ]),
    
    async loadCoupons() {
      try {
        await this.fetchCouponList()
      } catch (error) {
        this.$message.error('获取优惠券列表失败')
        console.error('获取优惠券列表失败:', error)
      }
    },
    
    async loadUserReceivedCoupons() {
      try {
        // 这里应该从用户信息中获取用户ID
        const userId = this.$store.state.user.id || 1
        await this.fetchUserReceivedCoupons(userId)
      } catch (error) {
        console.error('获取用户已领取优惠券失败:', error)
      }
    },
    
    handleFilter() {
      this.loadCoupons()
    },
    
    handleSort() {
      // 排序在computed中处理，这里可以添加其他逻辑
    },
    
    refreshCoupons() {
      this.loadCoupons()
      this.loadUserReceivedCoupons()
    },
    
    handleSizeChange(size) {
      this.$store.commit('holidayPromotion/SET_PAGINATION', { pageSize: size, pageNum: 1 })
      this.loadCoupons()
    },
    
    handleCurrentChange(page) {
      this.$store.commit('holidayPromotion/SET_PAGINATION', { pageNum: page })
      this.loadCoupons()
    },
    
    handleCouponReceive({ couponId, coupon }) {
      this.selectedCoupon = coupon
      this.receiveDialogVisible = true
    },
    
    async confirmReceive() {
      if (!this.selectedCoupon) return
      
      this.receiving = true
      try {
        const userId = this.$store.state.user.id || 1
        await this.receiveCoupon({
          couponId: this.selectedCoupon.id,
          userId: userId
        })
        
        this.$message.success('优惠券领取成功！')
        this.receiveDialogVisible = false
        this.selectedCoupon = null
        
        // 刷新用户已领取的优惠券列表
        await this.loadUserReceivedCoupons()
      } catch (error) {
        let errorMessage = '领取失败，请稍后重试'
        if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message
        }
        this.$message.error(errorMessage)
        console.error('领取优惠券失败:', error)
      } finally {
        this.receiving = false
      }
    },
    
    isUserReceived(couponId) {
      return this.userReceivedCoupons.some(coupon => coupon.couponId === couponId)
    },
    
    getCouponReceiveStatus(couponId) {
      return this.couponReceiveStatus[couponId] || ''
    }
  }
}
</script>

<style scoped>
.coupon-center {
  margin-bottom: 30px;
}

.section-title {
  font-size: 1.8rem;
  color: #fff;
  text-align: center;
  margin-bottom: 20px;
  font-weight: bold;
}

.filter-section {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.coupon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 0 20px;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #fff;
}

.empty-state p {
  margin-top: 20px;
  font-size: 1.1rem;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  padding: 20px;
}

.receive-confirm {
  text-align: center;
}

.coupon-preview {
  background: linear-gradient(45deg, #FF6B6B 0%, #FF8E53 100%);
  color: #fff;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.preview-amount {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.preview-name {
  font-size: 1.1rem;
  margin-bottom: 5px;
}

.preview-condition {
  font-size: 0.9rem;
  opacity: 0.9;
}

.confirm-text {
  font-size: 1rem;
  color: #333;
  margin: 0;
}

@media (max-width: 768px) {
  .coupon-grid {
    grid-template-columns: 1fr;
    padding: 0 10px;
  }
  
  .filter-section {
    padding: 15px;
  }
}

@media (min-width: 1024px) {
  .coupon-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>