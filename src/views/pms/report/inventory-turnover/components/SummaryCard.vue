<template>
  <div class="summary-cards">
    <el-row :gutter="20">
      <!-- 总商品数 -->
      <el-col :span="6">
        <el-card class="summary-card" shadow="hover">
          <div class="card-content">
            <div class="card-icon total-products">
              <i class="el-icon-goods"></i>
            </div>
            <div class="card-info">
              <div class="card-title">统计商品总数</div>
              <div class="card-value">{{ formatNumber(summaryData.totalProducts) }}</div>
              <div class="card-desc">个商品</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 平均周转率 -->
      <el-col :span="6">
        <el-card class="summary-card" shadow="hover">
          <div class="card-content">
            <div class="card-icon avg-turnover">
              <i class="el-icon-refresh"></i>
            </div>
            <div class="card-info">
              <div class="card-title">平均周转率</div>
              <div class="card-value">{{ formatTurnoverRate(summaryData.averageTurnoverRate) }}</div>
              <div class="card-desc">
                <span :class="getTrendClass(summaryData.turnoverRateGrowth)">
                  <i :class="getTrendIcon(summaryData.turnoverRateGrowth)"></i>
                  {{ formatGrowthRate(summaryData.turnoverRateGrowth) }}
                </span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 快速周转商品数 -->
      <el-col :span="6">
        <el-card class="summary-card" shadow="hover">
          <div class="card-content">
            <div class="card-icon fast-moving">
              <i class="el-icon-top"></i>
            </div>
            <div class="card-info">
              <div class="card-title">快速周转商品</div>
              <div class="card-value">{{ formatNumber(summaryData.fastMovingCount) }}</div>
              <div class="card-desc">
                占比 {{ formatPercentage(summaryData.fastMovingCount, summaryData.totalProducts) }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 滞销风险库存 -->
      <el-col :span="6">
        <el-card class="summary-card" shadow="hover">
          <div class="card-content">
            <div class="card-icon high-risk">
              <i class="el-icon-warning"></i>
            </div>
            <div class="card-info">
              <div class="card-title">滞销风险库存</div>
              <div class="card-value">{{ formatCurrency(summaryData.highRiskInventory) }}</div>
              <div class="card-desc">
                占总库存 {{ formatPercentage(summaryData.highRiskInventory, summaryData.totalInventoryValue) }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 详细统计 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="8">
        <el-card class="detail-card" shadow="never">
          <div slot="header" class="card-header">
            <span>周转率分布</span>
          </div>
          <div class="distribution-item">
            <div class="level-info">
              <el-tag type="success" effect="light">快速周转</el-tag>
              <span class="level-desc">(≥4.0次)</span>
            </div>
            <div class="level-value">{{ summaryData.fastMovingCount || 0 }}个</div>
          </div>
          <div class="distribution-item">
            <div class="level-info">
              <el-tag type="primary" effect="light">正常周转</el-tag>
              <span class="level-desc">(2.0-3.9次)</span>
            </div>
            <div class="level-value">{{ summaryData.normalMovingCount || 0 }}个</div>
          </div>
          <div class="distribution-item">
            <div class="level-info">
              <el-tag type="warning" effect="light">缓慢周转</el-tag>
              <span class="level-desc">(1.0-1.9次)</span>
            </div>
            <div class="level-value">{{ summaryData.slowMovingCount || 0 }}个</div>
          </div>
          <div class="distribution-item">
            <div class="level-info">
              <el-tag type="danger" effect="light">滞销风险</el-tag>
              <span class="level-desc">(<1.0次)</span>
            </div>
            <div class="level-value">{{ summaryData.riskMovingCount || 0 }}个</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="detail-card" shadow="never">
          <div slot="header" class="card-header">
            <span>库存价值统计</span>
          </div>
          <div class="value-item">
            <div class="value-label">总库存价值</div>
            <div class="value-amount">{{ formatCurrency(summaryData.totalInventoryValue) }}</div>
          </div>
          <div class="value-item">
            <div class="value-label">快速周转库存</div>
            <div class="value-amount success">{{ formatCurrency(summaryData.fastMovingInventory) }}</div>
          </div>
          <div class="value-item">
            <div class="value-label">正常周转库存</div>
            <div class="value-amount primary">{{ formatCurrency(summaryData.normalMovingInventory) }}</div>
          </div>
          <div class="value-item">
            <div class="value-label">滞销风险库存</div>
            <div class="value-amount danger">{{ formatCurrency(summaryData.highRiskInventory) }}</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="detail-card" shadow="never">
          <div slot="header" class="card-header">
            <span>管理建议</span>
          </div>
          <div class="suggestion-list">
            <div class="suggestion-item" v-for="(suggestion, index) in managementSuggestions" :key="index">
              <i :class="suggestion.icon" :style="{ color: suggestion.color }"></i>
              <span>{{ suggestion.text }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import TurnoverCalculator from '@/utils/turnoverCalculator'

export default {
  name: 'SummaryCard',
  props: {
    summaryData: {
      type: Object,
      default: () => ({
        totalProducts: 0,
        averageTurnoverRate: 0,
        fastMovingCount: 0,
        normalMovingCount: 0,
        slowMovingCount: 0,
        riskMovingCount: 0,
        totalInventoryValue: 0,
        fastMovingInventory: 0,
        normalMovingInventory: 0,
        highRiskInventory: 0,
        turnoverRateGrowth: 0
      })
    }
  },
  computed: {
    /**
     * 管理建议
     */
    managementSuggestions() {
      const suggestions = []
      
      // 滞销风险提醒
      if (this.summaryData.riskMovingCount > 0) {
        suggestions.push({
          icon: 'el-icon-warning',
          color: '#F56C6C',
          text: `${this.summaryData.riskMovingCount}个商品存在滞销风险，建议制定促销策略`
        })
      }
      
      // 缓慢周转提醒
      if (this.summaryData.slowMovingCount > 0) {
        suggestions.push({
          icon: 'el-icon-info',
          color: '#E6A23C',
          text: `${this.summaryData.slowMovingCount}个商品周转缓慢，建议适当减少采购`
        })
      }
      
      // 快速周转推荐
      if (this.summaryData.fastMovingCount > 0) {
        suggestions.push({
          icon: 'el-icon-success',
          color: '#67C23A',
          text: `${this.summaryData.fastMovingCount}个商品周转良好，可考虑增加库存`
        })
      }
      
      // 整体建议
      const avgRate = this.summaryData.averageTurnoverRate || 0
      if (avgRate < 2.0) {
        suggestions.push({
          icon: 'el-icon-edit',
          color: '#409EFF',
          text: '整体周转率偏低，建议优化库存结构'
        })
      }
      
      return suggestions.length > 0 ? suggestions : [{
        icon: 'el-icon-check',
        color: '#67C23A',
        text: '库存周转状况良好，继续保持'
      }]
    }
  },
  methods: {
    /**
     * 格式化数字
     */
    formatNumber(value) {
      return TurnoverCalculator.formatNumber(value, 0)
    },
    
    /**
     * 格式化周转率
     */
    formatTurnoverRate(value) {
      return TurnoverCalculator.formatNumber(value, 2) + '次'
    },
    
    /**
     * 格式化货币
     */
    formatCurrency(value) {
      return TurnoverCalculator.formatCurrency(value)
    },
    
    /**
     * 格式化百分比
     */
    formatPercentage(value, total) {
      if (!total || total <= 0) return '0%'
      const percentage = (parseFloat(value) / parseFloat(total)) * 100
      return TurnoverCalculator.formatNumber(percentage, 1) + '%'
    },
    
    /**
     * 格式化增长率
     */
    formatGrowthRate(value) {
      if (!value) return '0%'
      const prefix = value > 0 ? '+' : ''
      return prefix + TurnoverCalculator.formatNumber(value, 1) + '%'
    },
    
    /**
     * 获取趋势样式类
     */
    getTrendClass(value) {
      if (value > 0) return 'trend-up'
      if (value < 0) return 'trend-down'
      return 'trend-neutral'
    },
    
    /**
     * 获取趋势图标
     */
    getTrendIcon(value) {
      if (value > 0) return 'el-icon-top'
      if (value < 0) return 'el-icon-bottom'
      return 'el-icon-minus'
    }
  }
}
</script>

<style lang="scss" scoped>
.summary-cards {
  margin-bottom: 20px;
}

.summary-card {
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  .card-content {
    display: flex;
    align-items: center;
    padding: 10px 0;
  }
  
  .card-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;
    
    i {
      font-size: 24px;
      color: white;
    }
    
    &.total-products {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    &.avg-turnover {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
    
    &.fast-moving {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }
    
    &.high-risk {
      background: linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%);
    }
  }
  
  .card-info {
    flex: 1;
  }
  
  .card-title {
    font-size: 14px;
    color: #909399;
    margin-bottom: 8px;
  }
  
  .card-value {
    font-size: 28px;
    font-weight: bold;
    color: #303133;
    margin-bottom: 5px;
  }
  
  .card-desc {
    font-size: 12px;
    color: #909399;
    
    .trend-up {
      color: #67C23A;
    }
    
    .trend-down {
      color: #F56C6C;
    }
    
    .trend-neutral {
      color: #909399;
    }
  }
}

.detail-card {
  border-radius: 8px;
  
  .card-header {
    font-weight: bold;
    color: #303133;
  }
  
  .distribution-item, .value-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #EBEEF5;
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  .level-info {
    display: flex;
    align-items: center;
    
    .level-desc {
      margin-left: 8px;
      font-size: 12px;
      color: #909399;
    }
  }
  
  .level-value {
    font-weight: bold;
    color: #303133;
  }
  
  .value-label {
    color: #606266;
    font-size: 14px;
  }
  
  .value-amount {
    font-weight: bold;
    color: #303133;
    
    &.success {
      color: #67C23A;
    }
    
    &.primary {
      color: #409EFF;
    }
    
    &.danger {
      color: #F56C6C;
    }
  }
  
  .suggestion-list {
    .suggestion-item {
      display: flex;
      align-items: center;
      padding: 10px 0;
      font-size: 13px;
      line-height: 1.5;
      
      i {
        margin-right: 8px;
        font-size: 14px;
      }
    }
  }
}
</style>