<template>
  <div class="metric-card">
    <el-card shadow="hover" :class="{ 'loading': loading }">
      <div class="metric-content">
        <!-- 图标区域 -->
        <div class="metric-icon" :style="{ backgroundColor: color + '20', color: color }">
          <i :class="icon" v-if="!loading"></i>
          <div class="loading-placeholder" v-else></div>
        </div>

        <!-- 数据区域 -->
        <div class="metric-data">
          <div class="metric-title">{{ title }}</div>
          <div class="metric-value" v-if="!loading">
            <span :style="{ color: color }">{{ value }}</span>
          </div>
          <div class="metric-value loading-text" v-else>
            <div class="loading-skeleton"></div>
          </div>

          <!-- 趋势显示 -->
          <div class="metric-trend" v-if="trend && !loading">
            <span 
              class="trend-value"
              :class="trendClass">
              <i :class="trendIcon"></i>
              {{ Math.abs(trend.value) }}%
            </span>
            <span class="trend-label">{{ trendLabel }}</span>
          </div>
          <div class="metric-trend loading" v-else-if="loading">
            <div class="loading-skeleton small"></div>
          </div>
        </div>

        <!-- 更多信息按钮 -->
        <div class="metric-actions" v-if="!loading">
          <el-tooltip content="查看详情" placement="top">
            <el-button 
              type="text" 
              icon="el-icon-more"
              size="small"
              @click="$emit('detail-click')"
              class="detail-btn">
            </el-button>
          </el-tooltip>
        </div>
      </div>

      <!-- 迷你图表（可选） -->
      <div class="metric-chart" v-if="chartData && !loading">
        <div class="mini-chart" ref="miniChart"></div>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'MetricCard',
  props: {
    title: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number],
      required: true
    },
    icon: {
      type: String,
      default: 'el-icon-data-line'
    },
    color: {
      type: String,
      default: '#409EFF'
    },
    trend: {
      type: Object,
      default: null
      // 格式: { value: 12.5, type: 'up'|'down' }
    },
    loading: {
      type: Boolean,
      default: false
    },
    chartData: {
      type: Array,
      default: null
    },
    subtitle: {
      type: String,
      default: ''
    }
  },
  computed: {
    trendClass() {
      if (!this.trend) return ''
      return this.trend.type === 'up' ? 'trend-up' : 'trend-down'
    },
    
    trendIcon() {
      if (!this.trend) return ''
      return this.trend.type === 'up' ? 'el-icon-top' : 'el-icon-bottom'
    },
    
    trendLabel() {
      if (!this.trend) return ''
      return this.trend.type === 'up' ? '较上期上升' : '较上期下降'
    }
  },
  mounted() {
    if (this.chartData && !this.loading) {
      this.$nextTick(() => {
        this.renderMiniChart()
      })
    }
  },
  watch: {
    chartData: {
      handler() {
        if (this.chartData && !this.loading) {
          this.$nextTick(() => {
            this.renderMiniChart()
          })
        }
      },
      deep: true
    },
    loading(newVal) {
      if (!newVal && this.chartData) {
        this.$nextTick(() => {
          this.renderMiniChart()
        })
      }
    }
  },
  methods: {
    // 渲染迷你图表
    renderMiniChart() {
      if (!this.chartData || !this.$refs.miniChart) return
      
      // 这里可以使用简单的SVG或Canvas来绘制迷你图表
      // 为了简化，这里只是显示一个简单的趋势线
      const container = this.$refs.miniChart
      container.innerHTML = ''
      
      const width = container.offsetWidth
      const height = container.offsetHeight
      
      if (width === 0 || height === 0) return
      
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svg.setAttribute('width', width)
      svg.setAttribute('height', height)
      
      // 计算数据点
      const points = this.chartData.map((value, index) => {
        const x = (index / (this.chartData.length - 1)) * width
        const y = height - (value / Math.max(...this.chartData)) * height
        return `${x},${y}`
      }).join(' ')
      
      // 创建路径
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'polyline')
      path.setAttribute('points', points)
      path.setAttribute('fill', 'none')
      path.setAttribute('stroke', this.color)
      path.setAttribute('stroke-width', '2')
      path.setAttribute('opacity', '0.8')
      
      svg.appendChild(path)
      container.appendChild(svg)
    }
  }
}
</script>

<style lang="scss" scoped>
.metric-card {
  height: 100%;

  .el-card {
    height: 100%;
    border: 1px solid #e4e7ed;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    &.loading {
      pointer-events: none;
    }

    :deep(.el-card__body) {
      padding: 20px;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  }

  .metric-content {
    display: flex;
    align-items: flex-start;
    gap: 15px;
    flex: 1;

    .metric-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      flex-shrink: 0;

      .loading-placeholder {
        width: 24px;
        height: 24px;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        border-radius: 4px;
      }
    }

    .metric-data {
      flex: 1;
      min-width: 0;

      .metric-title {
        font-size: 14px;
        color: #909399;
        margin-bottom: 8px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .metric-value {
        font-size: 28px;
        font-weight: 700;
        line-height: 1.2;
        margin-bottom: 8px;

        &.loading-text {
          height: 34px;
          display: flex;
          align-items: center;
        }
      }

      .metric-trend {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 12px;

        .trend-value {
          display: flex;
          align-items: center;
          gap: 2px;
          font-weight: 600;

          &.trend-up {
            color: #67c23a;
          }

          &.trend-down {
            color: #f56c6c;
          }
        }

        .trend-label {
          color: #909399;
        }

        &.loading {
          height: 16px;
        }
      }
    }

    .metric-actions {
      .detail-btn {
        color: #c0c4cc;
        padding: 0;
        min-height: auto;

        &:hover {
          color: #409eff;
        }
      }
    }
  }

  .metric-chart {
    margin-top: 15px;
    height: 40px;

    .mini-chart {
      width: 100%;
      height: 100%;
    }
  }

  // 加载骨架屏
  .loading-skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 4px;
    height: 100%;

    &.small {
      height: 16px;
      width: 80px;
    }
  }
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .metric-card {
    .el-card {
      :deep(.el-card__body) {
        padding: 15px;
      }
    }

    .metric-content {
      gap: 10px;

      .metric-icon {
        width: 40px;
        height: 40px;
        font-size: 20px;
      }

      .metric-data {
        .metric-title {
          font-size: 12px;
        }

        .metric-value {
          font-size: 24px;
        }

        .metric-trend {
          font-size: 11px;
        }
      }
    }

    .metric-chart {
      height: 30px;
      margin-top: 10px;
    }
  }
}

@media (max-width: 480px) {
  .metric-card {
    .metric-content {
      .metric-icon {
        width: 36px;
        height: 36px;
        font-size: 18px;
      }

      .metric-data {
        .metric-value {
          font-size: 20px;
        }
      }
    }
  }
}
</style>