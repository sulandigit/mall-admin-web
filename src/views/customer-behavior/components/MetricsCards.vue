<template>
  <div class="metrics-cards">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="metrics-card" shadow="hover">
          <div class="metrics-icon">
            <i class="el-icon-view" style="color: #409EFF;"></i>
          </div>
          <div class="metrics-content">
            <div class="metrics-title">总访问量</div>
            <div class="metrics-value">{{ formatNumber(totalVisits) }}</div>
            <div class="metrics-change" :class="visitChangeClass">
              <i :class="visitChangeIcon"></i>
              {{ visitChangeText }}
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="metrics-card" shadow="hover">
          <div class="metrics-icon">
            <i class="el-icon-time" style="color: #67C23A;"></i>
          </div>
          <div class="metrics-content">
            <div class="metrics-title">平均停留时间</div>
            <div class="metrics-value">{{ formatTime(averageStayTime) }}</div>
            <div class="metrics-change" :class="timeChangeClass">
              <i :class="timeChangeIcon"></i>
              {{ timeChangeText }}
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="metrics-card" shadow="hover">
          <div class="metrics-icon">
            <i class="el-icon-warning" style="color: #E6A23C;"></i>
          </div>
          <div class="metrics-content">
            <div class="metrics-title">跳出率</div>
            <div class="metrics-value">{{ formatPercent(bounceRate) }}</div>
            <div class="metrics-change" :class="bounceChangeClass">
              <i :class="bounceChangeIcon"></i>
              {{ bounceChangeText }}
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="metrics-card" shadow="hover">
          <div class="metrics-icon">
            <i class="el-icon-user" style="color: #F56C6C;"></i>
          </div>
          <div class="metrics-content">
            <div class="metrics-title">当前在线</div>
            <div class="metrics-value">{{ formatNumber(currentVisitors) }}</div>
            <div class="metrics-realtime">
              <span class="realtime-dot"></span>
              实时数据
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'MetricsCards',
  props: {
    totalVisits: {
      type: Number,
      default: 0
    },
    averageStayTime: {
      type: Number,
      default: 0
    },
    bounceRate: {
      type: Number,
      default: 0
    },
    currentVisitors: {
      type: Number,
      default: 0
    },
    // 趋势数据用于计算变化
    trendData: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    // 访问量变化
    visitChangeText() {
      const change = this.calculateChange('visits')
      return change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`
    },
    visitChangeClass() {
      const change = this.calculateChange('visits')
      return change > 0 ? 'metrics-change-up' : change < 0 ? 'metrics-change-down' : 'metrics-change-stable'
    },
    visitChangeIcon() {
      const change = this.calculateChange('visits')
      return change > 0 ? 'el-icon-arrow-up' : change < 0 ? 'el-icon-arrow-down' : 'el-icon-minus'
    },
    
    // 停留时间变化
    timeChangeText() {
      const change = this.calculateChange('stayTime')
      return change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`
    },
    timeChangeClass() {
      const change = this.calculateChange('stayTime')
      return change > 0 ? 'metrics-change-up' : change < 0 ? 'metrics-change-down' : 'metrics-change-stable'
    },
    timeChangeIcon() {
      const change = this.calculateChange('stayTime')
      return change > 0 ? 'el-icon-arrow-up' : change < 0 ? 'el-icon-arrow-down' : 'el-icon-minus'
    },
    
    // 跳出率变化
    bounceChangeText() {
      const change = this.calculateChange('bounceRate')
      return change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`
    },
    bounceChangeClass() {
      const change = this.calculateChange('bounceRate')
      // 跳出率增高是负面的，所以颜色相反
      return change > 0 ? 'metrics-change-down' : change < 0 ? 'metrics-change-up' : 'metrics-change-stable'
    },
    bounceChangeIcon() {
      const change = this.calculateChange('bounceRate')
      return change > 0 ? 'el-icon-arrow-up' : change < 0 ? 'el-icon-arrow-down' : 'el-icon-minus'
    }
  },
  methods: {
    // 格式化数字
    formatNumber(num) {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
      }
      return num.toString()
    },
    
    // 格式化时间（秒转换为分:秒）
    formatTime(seconds) {
      if (seconds < 60) {
        return `${seconds.toFixed(0)}s`
      }
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = Math.floor(seconds % 60)
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    },
    
    // 格式化百分比
    formatPercent(rate) {
      return `${(rate * 100).toFixed(1)}%`
    },
    
    // 计算变化百分比
    calculateChange(metric) {
      if (!this.trendData || this.trendData.length < 2) {
        return 0
      }
      
      const current = this.trendData[this.trendData.length - 1]
      const previous = this.trendData[this.trendData.length - 2]
      
      if (!current || !previous || !previous[metric] || previous[metric] === 0) {
        return 0
      }
      
      return ((current[metric] - previous[metric]) / previous[metric]) * 100
    }
  }
}
</script>

<style scoped>
.metrics-cards {
  margin-bottom: 20px;
}

.metrics-card {
  height: 120px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.metrics-card:hover {
  transform: translateY(-2px);
}

.metrics-card .el-card__body {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 20px;
}

.metrics-icon {
  margin-right: 15px;
}

.metrics-icon i {
  font-size: 40px;
}

.metrics-content {
  flex: 1;
}

.metrics-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.metrics-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.metrics-change {
  font-size: 12px;
  display: flex;
  align-items: center;
}

.metrics-change i {
  margin-right: 4px;
}

.metrics-change-up {
  color: #67C23A;
}

.metrics-change-down {
  color: #F56C6C;
}

.metrics-change-stable {
  color: #909399;
}

.metrics-realtime {
  font-size: 12px;
  color: #67C23A;
  display: flex;
  align-items: center;
}

.realtime-dot {
  width: 6px;
  height: 6px;
  background-color: #67C23A;
  border-radius: 50%;
  margin-right: 4px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>