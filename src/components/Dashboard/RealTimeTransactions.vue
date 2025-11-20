<template>
  <div class="real-time-transactions">
    <div class="transaction-header">
      <div class="transaction-stats">
        <div class="stat-item">
          <span class="label">实时交易笔数</span>
          <span class="value">{{ transactionCount }}</span>
        </div>
        <div class="stat-item">
          <span class="label">实时交易金额</span>
          <span class="value">¥{{ totalAmount.toFixed(2) }}</span>
        </div>
      </div>
      <div class="auto-refresh">
        <el-switch 
          v-model="autoRefresh" 
          active-text="自动刷新"
          @change="toggleAutoRefresh"
        ></el-switch>
      </div>
    </div>
    
    <div class="transaction-list" ref="transactionList">
      <div 
        v-for="(transaction, index) in transactions" 
        :key="transaction.id"
        class="transaction-item"
        :class="{ 'new-transaction': transaction.isNew }"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <div class="transaction-info">
          <div class="user-info">
            <i class="el-icon-user"></i>
            <span class="user-name">{{ transaction.user }}</span>
          </div>
          <div class="product-info">
            <i class="el-icon-goods"></i>
            <span class="product-name">{{ transaction.product }}</span>
          </div>
        </div>
        <div class="transaction-details">
          <div class="amount">¥{{ transaction.amount }}</div>
          <div class="location">
            <i class="el-icon-location"></i>
            {{ transaction.location }}
          </div>
          <div class="time">{{ transaction.time }}</div>
        </div>
        <div class="transaction-status">
          <div class="status-indicator success"></div>
          <span class="status-text">支付成功</span>
        </div>
      </div>
      
      <div v-if="!transactions.length" class="empty-state">
        <i class="el-icon-loading"></i>
        <p>加载交易数据中...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { getRealTimeTransactions, getMockRealTimeTransactions } from '@/api/dashboard'

export default {
  name: 'RealTimeTransactions',
  data() {
    return {
      transactions: [],
      autoRefresh: true,
      refreshTimer: null,
      transactionCount: 0,
      totalAmount: 0
    }
  },
  mounted() {
    this.loadData()
    this.startAutoRefresh()
  },
  beforeDestroy() {
    this.stopAutoRefresh()
  },
  methods: {
    async loadData() {
      try {
        // 尝试加载真实数据，失败则使用模拟数据
        let response
        try {
          response = await getRealTimeTransactions(20)
        } catch (error) {
          console.warn('使用模拟数据:', error.message)
          response = await getMockRealTimeTransactions()
        }
        
        if (response.data && response.data.data) {
          const newTransactions = response.data.data
          
          // 标记新交易
          const existingIds = new Set(this.transactions.map(t => t.id))
          newTransactions.forEach(transaction => {
            transaction.isNew = !existingIds.has(transaction.id)
          })
          
          this.transactions = newTransactions
          this.updateStats()
          
          // 滚动到顶部显示最新交易
          this.$nextTick(() => {
            if (this.$refs.transactionList) {
              this.$refs.transactionList.scrollTop = 0
            }
          })
          
          // 清除新交易标记
          setTimeout(() => {
            this.transactions.forEach(t => t.isNew = false)
          }, 2000)
        }
      } catch (error) {
        console.error('加载实时交易数据失败:', error)
        this.$message.error('加载实时交易数据失败')
      }
    },
    updateStats() {
      this.transactionCount = this.transactions.length
      this.totalAmount = this.transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0)
    },
    startAutoRefresh() {
      if (this.autoRefresh && !this.refreshTimer) {
        this.refreshTimer = setInterval(() => {
          this.loadData()
        }, 10000) // 每10秒刷新一次
      }
    },
    stopAutoRefresh() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer)
        this.refreshTimer = null
      }
    },
    toggleAutoRefresh(value) {
      if (value) {
        this.startAutoRefresh()
      } else {
        this.stopAutoRefresh()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.real-time-transactions {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 10px;
  
  .transaction-stats {
    display: flex;
    gap: 30px;
    
    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 5px;
      
      .label {
        font-size: 12px;
        color: #8892b0;
      }
      
      .value {
        font-size: 18px;
        font-weight: 600;
        color: #00d4ff;
      }
    }
  }
  
  .auto-refresh {
    .el-switch {
      ::v-deep .el-switch__core {
        background-color: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.2);
        
        &:after {
          background-color: #ffffff;
        }
      }
      
      ::v-deep.is-checked .el-switch__core {
        background-color: #00d4ff;
        border-color: #00d4ff;
      }
      
      ::v-deep .el-switch__label {
        color: #8892b0;
      }
    }
  }
}

.transaction-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 10px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 212, 255, 0.5);
    border-radius: 3px;
    
    &:hover {
      background: rgba(0, 212, 255, 0.7);
    }
  }
}

.transaction-item {
  display: flex;
  align-items: center;
  padding: 15px;
  margin-bottom: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: all 0.3s ease;
  animation: slideInRight 0.5s ease-out;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(0, 212, 255, 0.3);
    transform: translateX(5px);
  }
  
  &.new-transaction {
    border-color: #67c23a;
    box-shadow: 0 0 10px rgba(103, 194, 58, 0.3);
    animation: pulse 1s ease-in-out;
  }
}

.transaction-info {
  flex: 1;
  
  .user-info, .product-info {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 5px;
    
    i {
      color: #00d4ff;
      font-size: 14px;
    }
    
    .user-name, .product-name {
      font-size: 14px;
      color: #ffffff;
    }
    
    .product-name {
      color: #8892b0;
      font-size: 12px;
    }
  }
}

.transaction-details {
  flex: 1;
  text-align: center;
  
  .amount {
    font-size: 16px;
    font-weight: 600;
    color: #67c23a;
    margin-bottom: 5px;
  }
  
  .location {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: 12px;
    color: #8892b0;
    margin-bottom: 5px;
    
    i {
      font-size: 12px;
    }
  }
  
  .time {
    font-size: 12px;
    color: #8892b0;
  }
}

.transaction-status {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    
    &.success {
      background-color: #67c23a;
      box-shadow: 0 0 6px rgba(103, 194, 58, 0.6);
    }
  }
  
  .status-text {
    font-size: 12px;
    color: #67c23a;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #8892b0;
  
  i {
    font-size: 32px;
    margin-bottom: 10px;
    animation: rotate 2s linear infinite;
  }
  
  p {
    margin: 0;
    font-size: 14px;
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 10px rgba(103, 194, 58, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(103, 194, 58, 0.6);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .transaction-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .transaction-details {
    text-align: left;
    width: 100%;
  }
  
  .transaction-header {
    flex-direction: column;
    gap: 15px;
    
    .transaction-stats {
      justify-content: center;
    }
  }
}
</style>