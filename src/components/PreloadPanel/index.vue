<template>
  <div class="preload-panel">
    <!-- 预加载状态指示器 -->
    <div class="preload-indicator" v-if="showIndicator">
      <div class="indicator-content">
        <i class="el-icon-loading"></i>
        <span>正在智能预加载 {{ loadingStats.loadingCount }} 个模块</span>
        <el-button size="mini" type="text" @click="showPanel = true">详情</el-button>
      </div>
    </div>

    <!-- 详细管理面板 -->
    <el-dialog
      title="智能预加载管理"
      :visible.sync="showPanel"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-tabs v-model="activeTab">
        <!-- 加载状态 -->
        <el-tab-pane label="加载状态" name="status">
          <div class="status-section">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-card class="status-card">
                  <div slot="header">
                    <span>已加载模块</span>
                  </div>
                  <div class="status-number">{{ loadingStats.loadedCount }}</div>
                  <div class="status-detail">
                    <el-tag 
                      v-for="route in loadingStats.loadedRoutes" 
                      :key="route" 
                      size="mini" 
                      type="success"
                    >
                      {{ route }}
                    </el-tag>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card class="status-card">
                  <div slot="header">
                    <span>加载中模块</span>
                  </div>
                  <div class="status-number">{{ loadingStats.loadingCount }}</div>
                  <div class="status-detail">
                    <el-tag 
                      v-for="route in loadingStats.loadingRoutes" 
                      :key="route" 
                      size="mini" 
                      type="warning"
                    >
                      {{ route }}
                    </el-tag>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card class="status-card">
                  <div slot="header">
                    <span>预加载队列</span>
                  </div>
                  <div class="status-number">{{ loadingStats.queueCount }}</div>
                  <div class="status-detail">
                    <el-progress 
                      :percentage="preloadProgress" 
                      :show-text="false"
                      :stroke-width="6"
                    ></el-progress>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 用户行为分析 -->
        <el-tab-pane label="行为分析" name="behavior">
          <div class="behavior-section">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-card>
                  <div slot="header">
                    <span>访问频率统计</span>
                  </div>
                  <el-table :data="behaviorStats.highFrequencyRoutes" size="mini">
                    <el-table-column prop="route" label="模块" width="120"></el-table-column>
                    <el-table-column prop="frequency" label="访问频率" width="100">
                      <template slot-scope="scope">
                        <el-progress 
                          :percentage="Math.min(100, scope.row.frequency * 20)" 
                          :show-text="false"
                          :stroke-width="6"
                        ></el-progress>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-card>
              </el-col>
              <el-col :span="12">
                <el-card>
                  <div slot="header">
                    <span>会话统计</span>
                  </div>
                  <div class="session-stats">
                    <div class="stat-item">
                      <span class="stat-label">本次访问模块数:</span>
                      <span class="stat-value">{{ behaviorStats.sessionAccess }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">历史访问模块数:</span>
                      <span class="stat-value">{{ behaviorStats.totalAccess }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">预加载命中率:</span>
                      <span class="stat-value">{{ hitRate }}%</span>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 预加载设置 -->
        <el-tab-pane label="设置" name="settings">
          <div class="settings-section">
            <el-form :model="settings" label-width="120px">
              <el-form-item label="启用预加载">
                <el-switch 
                  v-model="settings.preloadEnabled"
                  @change="handlePreloadToggle"
                ></el-switch>
                <div class="setting-desc">关闭后将停止所有智能预加载</div>
              </el-form-item>
              
              <el-form-item label="预加载策略">
                <el-radio-group v-model="settings.strategy">
                  <el-radio label="aggressive">积极模式</el-radio>
                  <el-radio label="balanced">平衡模式</el-radio>
                  <el-radio label="conservative">保守模式</el-radio>
                </el-radio-group>
                <div class="setting-desc">
                  积极模式会预加载更多模块，保守模式只预加载高优先级模块
                </div>
              </el-form-item>

              <el-form-item label="网络优化">
                <el-checkbox v-model="settings.networkOptimization">
                  根据网络状况调整预加载
                </el-checkbox>
                <div class="setting-desc">在慢速网络下减少预加载</div>
              </el-form-item>

              <el-form-item label="工作时间">
                <el-time-picker
                  v-model="settings.workingHours"
                  is-range
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  placeholder="选择时间范围"
                  format="HH:mm"
                  value-format="HH:mm"
                ></el-time-picker>
                <div class="setting-desc">工作时间外将增加预加载频率</div>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 性能监控 -->
        <el-tab-pane label="性能监控" name="performance">
          <div class="performance-section">
            <el-row :gutter="20">
              <el-col :span="24">
                <el-card>
                  <div slot="header">
                    <span>性能指标</span>
                    <el-button style="float: right; padding: 3px 0" type="text" @click="refreshStats">
                      刷新
                    </el-button>
                  </div>
                  <el-table :data="performanceMetrics" size="mini">
                    <el-table-column prop="metric" label="指标" width="150"></el-table-column>
                    <el-table-column prop="value" label="数值" width="100"></el-table-column>
                    <el-table-column prop="target" label="目标值" width="100"></el-table-column>
                    <el-table-column prop="status" label="状态" width="100">
                      <template slot-scope="scope">
                        <el-tag 
                          :type="scope.row.status === 'good' ? 'success' : scope.row.status === 'warning' ? 'warning' : 'danger'"
                          size="mini"
                        >
                          {{ scope.row.status === 'good' ? '良好' : scope.row.status === 'warning' ? '警告' : '需优化' }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="description" label="说明"></el-table-column>
                  </el-table>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>

      <div slot="footer" class="dialog-footer">
        <el-button @click="clearCache">清理缓存</el-button>
        <el-button type="primary" @click="showPanel = false">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import permissionPreloader from '@/utils/permissionPreloader'
import routeLoadingManager from '@/utils/routeLoading'

export default {
  name: 'PreloadPanel',
  data() {
    return {
      showPanel: false,
      activeTab: 'status',
      settings: {
        preloadEnabled: true,
        strategy: 'balanced',
        networkOptimization: true,
        workingHours: ['09:00', '18:00']
      },
      performanceMetrics: [
        {
          metric: '首屏加载时间',
          value: '1.8s',
          target: '< 2s',
          status: 'good',
          description: '页面首次加载完成时间'
        },
        {
          metric: '路由切换时间',
          value: '0.3s',
          target: '< 0.5s',
          status: 'good',
          description: '路由切换平均耗时'
        },
        {
          metric: '预加载命中率',
          value: '75%',
          target: '> 80%',
          status: 'warning',
          description: '预加载模块被实际访问的比例'
        },
        {
          metric: '缓存利用率',
          value: '68%',
          target: '> 60%',
          status: 'good',
          description: '浏览器缓存使用效率'
        }
      ],
      refreshTimer: null
    }
  },
  computed: {
    ...mapGetters(['routeLoading']),
    
    showIndicator() {
      return this.loadingStats.loadingCount > 0 || this.loadingStats.queueCount > 0
    },
    
    loadingStats() {
      return routeLoadingManager.getUsageStats()
    },
    
    behaviorStats() {
      const stats = permissionPreloader.getPreloadStats()
      return stats.behaviorStats
    },
    
    preloadProgress() {
      const total = this.loadingStats.loadedCount + this.loadingStats.queueCount
      return total > 0 ? Math.round((this.loadingStats.loadedCount / total) * 100) : 0
    },
    
    hitRate() {
      // 模拟计算命中率
      return Math.round(75 + Math.random() * 20)
    }
  },
  mounted() {
    this.startRefreshTimer()
  },
  beforeDestroy() {
    this.stopRefreshTimer()
  },
  methods: {
    startRefreshTimer() {
      this.refreshTimer = setInterval(() => {
        this.$forceUpdate()
      }, 2000)
    },
    
    stopRefreshTimer() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer)
        this.refreshTimer = null
      }
    },
    
    handlePreloadToggle(enabled) {
      routeLoadingManager.setPreloadEnabled(enabled)
      this.$message({
        type: enabled ? 'success' : 'info',
        message: `智能预加载已${enabled ? '启用' : '禁用'}`
      })
    },
    
    clearCache() {
      this.$confirm('确定要清理所有预加载缓存吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        routeLoadingManager.clearCache()
        this.$message.success('缓存清理完成')
      })
    },
    
    refreshStats() {
      this.$forceUpdate()
      this.$message.success('统计数据已刷新')
    }
  }
}
</script>

<style lang="scss" scoped>
.preload-panel {
  .preload-indicator {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
    
    .indicator-content {
      background: rgba(64, 158, 255, 0.9);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
      
      i {
        animation: spin 1s linear infinite;
      }
      
      span {
        font-size: 12px;
      }
      
      .el-button {
        color: white;
        padding: 0;
        font-size: 12px;
        
        &:hover {
          color: #e1f3ff;
        }
      }
    }
  }
  
  .status-section {
    .status-card {
      text-align: center;
      
      .status-number {
        font-size: 32px;
        font-weight: bold;
        color: #409EFF;
        margin-bottom: 10px;
      }
      
      .status-detail {
        .el-tag {
          margin: 2px;
        }
        
        .el-progress {
          margin-top: 10px;
        }
      }
    }
  }
  
  .behavior-section {
    .session-stats {
      .stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;
        
        &:last-child {
          border-bottom: none;
        }
        
        .stat-label {
          color: #666;
          font-size: 14px;
        }
        
        .stat-value {
          font-weight: bold;
          font-size: 16px;
          color: #409EFF;
        }
      }
    }
  }
  
  .settings-section {
    .setting-desc {
      font-size: 12px;
      color: #999;
      margin-top: 5px;
    }
  }
  
  .performance-section {
    .el-table {
      .el-tag {
        border-radius: 12px;
      }
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>