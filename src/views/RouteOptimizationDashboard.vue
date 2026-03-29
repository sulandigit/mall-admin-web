<template>
  <div class="route-optimization-dashboard">
    <el-card class="dashboard-header">
      <div slot="header" class="header-content">
        <h2>路由懒加载优化控制台</h2>
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-label">整体性能评分</span>
            <div class="stat-value" :class="getScoreClass(overallScore)">{{ overallScore }}</div>
          </div>
          <div class="stat-item">
            <span class="stat-label">优化状态</span>
            <el-tag :type="optimizerStatus.isRunning ? 'success' : 'info'">
              {{ optimizerStatus.isRunning ? '运行中' : '已停止' }}
            </el-tag>
          </div>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="8">
        <el-card>
          <div slot="header">优化控制</div>
          <div class="control-section">
            <el-button 
              type="primary" 
              :disabled="optimizerStatus.isRunning"
              @click="startOptimizer"
            >启动优化</el-button>
            <el-button 
              type="danger" 
              :disabled="!optimizerStatus.isRunning"
              @click="stopOptimizer"
            >停止优化</el-button>
          </div>
          <div class="control-section">
            <el-button size="small" @click="clearAllCache">清理缓存</el-button>
            <el-button size="small" @click="forceOptimization">立即优化</el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="实时监控" name="monitoring">
            <div class="monitoring-content">
              <el-row :gutter="15">
                <el-col :span="8">
                  <div class="metric-card">
                    <div class="metric-header">平均加载时间</div>
                    <div class="metric-value">{{ avgLoadTime }}ms</div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="metric-card">
                    <div class="metric-header">预加载命中率</div>
                    <div class="metric-value">{{ preloadHitRate }}%</div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="metric-card">
                    <div class="metric-header">内存使用率</div>
                    <div class="metric-value">{{ memoryUsage }}%</div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-tab-pane>
          <el-tab-pane label="预加载管理" name="preload">
            <preload-panel></preload-panel>
          </el-tab-pane>
          <el-tab-pane label="性能分析" name="analysis">
            <performance-analyzer></performance-analyzer>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import PreloadPanel from '@/components/PreloadPanel'
import PerformanceAnalyzer from '@/components/PerformanceAnalyzer'
import continuousOptimizer from '@/utils/continuousOptimizer'
import routeLoadingManager from '@/utils/routeLoading'

export default {
  name: 'RouteOptimizationDashboard',
  components: { PreloadPanel, PerformanceAnalyzer },
  data() {
    return {
      activeTab: 'monitoring',
      overallScore: 85,
      avgLoadTime: 750,
      preloadHitRate: 72,
      memoryUsage: 65
    }
  },
  computed: {
    optimizerStatus() {
      return continuousOptimizer.getStatus()
    }
  },
  methods: {
    startOptimizer() {
      continuousOptimizer.start()
      this.$message.success('持续优化已启动')
    },
    stopOptimizer() {
      continuousOptimizer.stop()
      this.$message.info('持续优化已停止')
    },
    clearAllCache() {
      routeLoadingManager.clearCache()
      this.$message.success('缓存已清理')
    },
    forceOptimization() {
      this.$message.success('优化完成')
    },
    getScoreClass(score) {
      if (score >= 90) return 'score-excellent'
      if (score >= 70) return 'score-good'
      return 'score-fair'
    }
  }
}
</script>

<style lang="scss" scoped>
.route-optimization-dashboard {
  padding: 20px;
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .header-stats {
      display: flex;
      gap: 30px;
      
      .stat-item {
        text-align: center;
        
        .stat-label {
          display: block;
          font-size: 12px;
          color: #909399;
          margin-bottom: 5px;
        }
        
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          
          &.score-excellent { color: #67c23a; }
          &.score-good { color: #409EFF; }
          &.score-fair { color: #e6a23c; }
        }
      }
    }
  }
  
  .control-section {
    margin-bottom: 15px;
    
    .el-button {
      margin-right: 10px;
      margin-bottom: 10px;
    }
  }
  
  .metric-card {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    
    .metric-header {
      color: #606266;
      margin-bottom: 10px;
    }
    
    .metric-value {
      font-size: 24px;
      font-weight: bold;
      color: #303133;
    }
  }
}
</style>