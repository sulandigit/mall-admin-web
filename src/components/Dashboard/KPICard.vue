<template>
  <el-card class=\"kpi-card\" :class=\"{
    'trend-up': trend === 'up',
    'trend-down': trend === 'down',
    'trend-stable': trend === 'stable'
  }\">
    <div class=\"kpi-header\">
      <div class=\"kpi-icon\">
        <i :class=\"iconClass\" :style=\"{ color: iconColor }\"></i>
      </div>
      <div class=\"kpi-info\">
        <div class=\"kpi-title\">{{ title }}</div>
        <div class=\"kpi-subtitle\" v-if=\"subtitle\">{{ subtitle }}</div>
      </div>
    </div>
    
    <div class=\"kpi-content\">
      <div class=\"kpi-value\" :style=\"{ color: valueColor }\">
        {{ formattedValue }}
      </div>
      
      <div class=\"kpi-change\" v-if=\"showChange\">
        <span class=\"change-percentage\" :class=\"changeClass\">
          <i :class=\"trendIcon\"></i>
          {{ Math.abs(percentage) }}%
        </span>
        <span class=\"change-text\">{{ changeText }}</span>
      </div>
    </div>
    
    <div class=\"kpi-footer\" v-if=\"showFooter\">
      <div class=\"update-time\">
        <i class=\"el-icon-time\"></i>
        {{ lastUpdateText }}
      </div>
      <div class=\"more-info\" v-if=\"showMore\" @click=\"handleMoreClick\">
        <span>查看详情</span>
        <i class=\"el-icon-arrow-right\"></i>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if=\"loading\" class=\"kpi-loading\">
      <i class=\"el-icon-loading\"></i>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'KPICard',
  props: {
    // 基础属性
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      default: ''
    },
    value: {
      type: [Number, String],
      required: true
    },
    
    // 图标配置
    icon: {
      type: String,
      default: 'el-icon-data-line'
    },
    iconColor: {
      type: String,
      default: '#409EFF'
    },
    
    // 趋势配置
    trend: {
      type: String,
      default: 'stable',
      validator: value => ['up', 'down', 'stable'].includes(value)
    },
    percentage: {
      type: Number,
      default: 0
    },
    
    // 格式化配置
    format: {
      type: String,
      default: 'number' // 'number', 'currency', 'percentage'
    },
    precision: {
      type: Number,
      default: 2
    },
    
    // 显示配置
    showChange: {
      type: Boolean,
      default: true
    },
    showFooter: {
      type: Boolean,
      default: true
    },
    showMore: {
      type: Boolean,
      default: false
    },
    
    // 状态
    loading: {
      type: Boolean,
      default: false
    },
    lastUpdate: {
      type: [String, Date],
      default: null
    },
    
    // 自定义样式
    valueColor: {
      type: String,
      default: '#303133'
    }
  },
  
  computed: {
    iconClass() {
      return this.icon
    },
    
    formattedValue() {
      if (this.loading) return '--'
      
      const value = Number(this.value)
      if (isNaN(value)) return this.value
      
      switch (this.format) {
        case 'currency':
          return `¥${value.toLocaleString('zh-CN', {
            minimumFractionDigits: this.precision,
            maximumFractionDigits: this.precision
          })}`
        case 'percentage':
          return `${value.toFixed(this.precision)}%`
        default:
          return value.toLocaleString('zh-CN', {
            minimumFractionDigits: this.precision,
            maximumFractionDigits: this.precision
          })
      }
    },
    
    trendIcon() {
      switch (this.trend) {
        case 'up':
          return 'el-icon-arrow-up'
        case 'down':
          return 'el-icon-arrow-down'
        default:
          return 'el-icon-minus'
      }
    },
    
    changeClass() {
      return {
        'trend-positive': this.trend === 'up',
        'trend-negative': this.trend === 'down',
        'trend-neutral': this.trend === 'stable'
      }
    },
    
    changeText() {
      if (this.trend === 'stable') return '与昨日持平'
      return this.trend === 'up' ? '较昨日上升' : '较昨日下降'
    },
    
    lastUpdateText() {
      if (!this.lastUpdate) return '暂无更新'
      
      const date = new Date(this.lastUpdate)
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) return '刚刚更新'
      if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前更新`
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前更新`
      
      return date.toLocaleDateString('zh-CN')
    }
  },
  
  methods: {
    handleMoreClick() {
      this.$emit('more-click', {
        title: this.title,
        value: this.value,
        trend: this.trend
      })
    }
  }
}
</script>

<style lang=\"scss\" scoped>
.kpi-card {
  position: relative;
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
  
  &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
  
  // 趋势样式
  &.trend-up {
    border-left: 4px solid #67C23A;
  }
  
  &.trend-down {
    border-left: 4px solid #F56C6C;
  }
  
  &.trend-stable {
    border-left: 4px solid #E6A23C;
  }
}

.kpi-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  
  .kpi-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(64, 158, 255, 0.1);
    margin-right: 12px;
    
    i {
      font-size: 24px;
    }
  }
  
  .kpi-info {
    flex: 1;
    
    .kpi-title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
      margin-bottom: 4px;
    }
    
    .kpi-subtitle {
      font-size: 12px;
      color: #909399;
    }
  }
}

.kpi-content {
  margin-bottom: 16px;
  
  .kpi-value {
    font-size: 28px;
    font-weight: bold;
    line-height: 1.2;
    margin-bottom: 8px;
  }
  
  .kpi-change {
    display: flex;
    align-items: center;
    font-size: 14px;
    
    .change-percentage {
      display: flex;
      align-items: center;
      margin-right: 8px;
      font-weight: 500;
      
      i {
        margin-right: 4px;
        font-size: 12px;
      }
      
      &.trend-positive {
        color: #67C23A;
      }
      
      &.trend-negative {
        color: #F56C6C;
      }
      
      &.trend-neutral {
        color: #E6A23C;
      }
    }
    
    .change-text {
      color: #909399;
    }
  }
}

.kpi-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #EBEEF5;
  font-size: 12px;
  color: #C0C4CC;
  
  .update-time {
    display: flex;
    align-items: center;
    
    i {
      margin-right: 4px;
    }
  }
  
  .more-info {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #409EFF;
    transition: color 0.3s ease;
    
    &:hover {
      color: #66b1ff;
    }
    
    i {
      margin-left: 4px;
      font-size: 10px;
    }
  }
}

.kpi-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  
  i {
    font-size: 24px;
    color: #409EFF;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .kpi-card {
    .kpi-header {
      .kpi-icon {
        width: 40px;
        height: 40px;
        
        i {
          font-size: 20px;
        }
      }
    }
    
    .kpi-content {
      .kpi-value {
        font-size: 24px;
      }
    }
  }
}
</style>