<template>
  <div :class="['coupon-card', { 'hot-coupon': coupon.isHot }]">
    <div class="coupon-header">
      <div class="coupon-amount">
        ¥{{ coupon.amount }}
        <span v-if="coupon.type === 1" style="font-size: 0.6em;">折</span>
      </div>
      <div class="coupon-type">
        {{ formatCouponType(coupon.type) }}
      </div>
    </div>
    
    <div class="coupon-info">
      <div class="coupon-name">{{ coupon.name }}</div>
      <div class="coupon-condition">
        <span v-if="coupon.minPoint > 0">满{{ coupon.minPoint }}元可用</span>
        <span v-else>无门槛</span>
      </div>
    </div>
    
    <div class="coupon-footer">
      <div class="coupon-validity">
        {{ formatValidityPeriod(coupon.startTime, coupon.endTime) }}
      </div>
      <el-button 
        :class="['receive-btn', receiveBtnClass]"
        :disabled="isReceived || isReceiving || isOutOfStock"
        @click="handleReceive"
        size="small">
        {{ receiveBtnText }}
      </el-button>
    </div>
    
    <div v-if="coupon.totalStock" :class="['stock-info', { 'low-stock': isLowStock }]">
      剩余{{ coupon.remainStock }}/{{ coupon.totalStock }}
    </div>
  </div>
</template>

<script>
import { formatDate } from '@/utils/date'

export default {
  name: 'CouponCard',
  props: {
    coupon: {
      type: Object,
      required: true,
      default: () => ({
        id: '',
        name: '',
        amount: 0,
        type: 0, // 0:满减券, 1:折扣券, 2:免邮券
        minPoint: 0,
        startTime: '',
        endTime: '',
        totalStock: 0,
        remainStock: 0,
        isHot: false,
        receiveLimit: 1
      })
    },
    isReceived: {
      type: Boolean,
      default: false
    },
    receiveStatus: {
      type: String,
      default: '', // '', 'receiving', 'received', 'error'
      validator: value => ['', 'receiving', 'received', 'error'].includes(value)
    }
  },
  computed: {
    isReceiving() {
      return this.receiveStatus === 'receiving'
    },
    
    isOutOfStock() {
      return this.coupon.totalStock > 0 && this.coupon.remainStock <= 0
    },
    
    isLowStock() {
      return this.coupon.totalStock > 0 && this.coupon.remainStock <= this.coupon.totalStock * 0.1
    },
    
    receiveBtnClass() {
      if (this.isReceived) return 'received'
      if (this.isReceiving) return 'receiving'
      return ''
    },
    
    receiveBtnText() {
      if (this.isOutOfStock) return '已抢完'
      if (this.isReceived) return '已领取'
      if (this.isReceiving) return '领取中...'
      return '立即领取'
    }
  },
  methods: {
    handleReceive() {
      if (this.isReceived || this.isReceiving || this.isOutOfStock) {
        return
      }
      
      this.$emit('receive', {
        couponId: this.coupon.id,
        coupon: this.coupon
      })
    },
    
    formatCouponType(type) {
      const typeMap = {
        0: '满减券',
        1: '折扣券',
        2: '免邮券',
        3: '新人券'
      }
      return typeMap[type] || '优惠券'
    },
    
    formatValidityPeriod(startTime, endTime) {
      if (!startTime || !endTime) {
        return '长期有效'
      }
      
      const start = formatDate(new Date(startTime), 'MM-dd')
      const end = formatDate(new Date(endTime), 'MM-dd')
      return `${start} 至 ${end}`
    }
  }
}
</script>

<style scoped>
.coupon-card {
  background: #fff;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 8px 16px rgba(255, 71, 87, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  animation: slideInUp 0.6s ease-out;
}

.coupon-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(255, 71, 87, 0.4);
}

.coupon-card.hot-coupon::before {
  content: 'HOT';
  position: absolute;
  top: 10px;
  right: -20px;
  background: #FF4757;
  color: #fff;
  padding: 5px 30px;
  font-size: 12px;
  font-weight: bold;
  transform: rotate(45deg);
}

.coupon-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.coupon-amount {
  font-size: 2rem;
  font-weight: bold;
  color: #FF4757;
}

.coupon-type {
  background: #FFD700;
  color: #333;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}

.coupon-info {
  margin-bottom: 15px;
}

.coupon-name {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

.coupon-condition {
  color: #666;
  font-size: 0.9rem;
}

.coupon-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.coupon-validity {
  font-size: 0.8rem;
  color: #999;
}

.receive-btn {
  background: #FF4757;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.receive-btn:hover:not(:disabled) {
  background: #FF3742;
  transform: scale(1.05);
}

.receive-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.receive-btn.received {
  background: #28a745;
}

.receive-btn.received:hover {
  transform: none;
}

.receive-btn.receiving {
  background: #ffc107;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.stock-info {
  position: absolute;
  bottom: 10px;
  left: 20px;
  font-size: 0.8rem;
  color: #999;
}

.stock-info.low-stock {
  color: #FF4757;
  font-weight: bold;
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
</style>