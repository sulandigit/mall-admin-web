<template>
  <div class="cache-monitor">
    <!-- 缓存状态指示器 -->
    <div class="cache-indicator" :class="cacheStatusClass" @click="togglePanel">
      <i :class="cacheIconClass"></i>
      <span class="cache-count">{{ cacheCount }}</span>
      <el-tooltip content="点击查看缓存详情" placement="top">
        <div class="indicator-body"></div>
      </el-tooltip>
    </div>

    <!-- 缓存管理面板 -->
    <el-drawer
      title="缓存管理"
      :visible.sync="panelVisible"
      direction="rtl"
      size="400px"
      :before-close="handleClose">
      
      <!-- 缓存概览 -->
      <div class="cache-overview">
        <el-card shadow="never">
          <div slot="header" class="clearfix">
            <span class="section-title">缓存概览</span>
            <el-button 
              style="float: right; padding: 3px 0" 
              type="text" 
              @click="refreshData">
              <i class="el-icon-refresh"></i>
            </el-button>
          </div>
          
          <div class="overview-stats">
            <div class="stat-item">
              <div class="stat-value">{{ cacheInfo.total }}</div>
              <div class="stat-label">已缓存页面</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ Math.round(cacheInfo.usage * 100) }}%</div>
              <div class="stat-label">缓存使用率</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ hitRate }}%</div>
              <div class="stat-label">命中率</div>
            </div>
          </div>

          <!-- 缓存使用率进度条 -->
          <div class="usage-progress">
            <el-progress 
              :percentage="Math.round(cacheInfo.usage * 100)"
              :color="getProgressColor(cacheInfo.usage)"
              :stroke-width="8">
            </el-progress>
          </div>
        </el-card>
      </div>

      <!-- 缓存组件列表 -->
      <div class="cache-list">
        <el-card shadow="never">
          <div slot="header" class="clearfix">
            <span class="section-title">缓存组件 ({{ cacheInfo.total }}/{{ cacheInfo.maxSize }})</span>
            <el-button 
              style="float: right; padding: 3px 0" 
              type="text" 
              @click="clearAllCache">
              清空所有
            </el-button>
          </div>
          
          <div class="cache-items">
            <div 
              v-for="component in cacheInfo.components" 
              :key="component.name"
              class="cache-item">
              <div class="item-info">
                <div class="item-name">{{ getComponentTitle(component.name) }}</div>
                <div class="item-meta">
                  <span class="cache-time">{{ formatCacheAge(component.timestamp) }}</span>
                  <span class="access-count">访问 {{ component.accessCount || 0 }} 次</span>
                </div>
              </div>
              <div class="item-actions">
                <el-button 
                  type="text" 
                  size="mini" 
                  @click="refreshComponent(component.name)">
                  刷新
                </el-button>
                <el-button 
                  type="text" 
                  size="mini" 
                  @click="removeComponent(component.name)">
                  移除
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 性能报告 -->
      <div class="performance-report">
        <el-card shadow="never">
          <div slot="header" class="clearfix">
            <span class="section-title">性能统计</span>
          </div>
          
          <div class="performance-stats">
            <div class="perf-item">
              <span class="perf-label">总命中次数:</span>
              <span class="perf-value">{{ performanceReport.performance.totalHits || 0 }}</span>
            </div>
            <div class="perf-item">
              <span class="perf-label">总未命中次数:</span>
              <span class="perf-value">{{ performanceReport.performance.totalMisses || 0 }}</span>
            </div>
            <div class="perf-item">
              <span class="perf-label">清理次数:</span>
              <span class="perf-value">{{ performanceReport.performance.cleanupCount || 0 }}</span>
            </div>
            <div class="perf-item" v-if="performanceReport.performance.lastCleanTime">
              <span class="perf-label">最后清理:</span>
              <span class="perf-value">{{ formatTime(performanceReport.performance.lastCleanTime) }}</span>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 缓存设置 -->
      <div class="cache-settings">
        <el-card shadow="never">
          <div slot="header" class="clearfix">
            <span class="section-title">缓存设置</span>
          </div>
          
          <el-form size="small" label-width="120px">
            <el-form-item label="最大缓存数量:">
              <el-input-number 
                v-model="cacheConfig.maxCacheSize"
                :min="5"
                :max="50"
                @change="updateCacheConfig"
                size="small">
              </el-input-number>
            </el-form-item>
            <el-form-item label="默认超时(分钟):">
              <el-input-number 
                v-model="cacheTimeoutMinutes"
                :min="5"
                :max="120"
                @change="updateCacheTimeout"
                size="small">
              </el-input-number>
            </el-form-item>
            <el-form-item label="启用LRU清理:">
              <el-switch 
                v-model="cacheConfig.enableLRU"
                @change="updateCacheConfig">
              </el-switch>
            </el-form-item>
            <el-form-item label="启用超时清理:">
              <el-switch 
                v-model="cacheConfig.enableTimeout"
                @change="updateCacheConfig">
              </el-switch>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import cacheControlService from '@/utils/cacheControl'

export default {
  name: 'CacheMonitor',
  
  data() {
    return {
      panelVisible: false,
      performanceReport: {
        performance: {}
      },
      cacheConfig: {
        maxCacheSize: 10,
        defaultTimeout: 30 * 60 * 1000,
        enableLRU: true,
        enableTimeout: true
      },
      routeTitleMap: {
        home: '仪表盘',
        product: '商品列表',
        productCate: '商品分类',
        brand: '品牌管理',
        order: '订单列表',
        coupon: '优惠券列表',
        admin: '用户列表',
        role: '角色列表',
        menu: '菜单列表'
      }
    }
  },

  computed: {
    ...mapGetters([
      'cachedViews',
      'cacheInfo',
      'cacheCount'
    ]),
    
    cacheStatusClass() {
      const usage = this.cacheInfo.usage
      if (usage >= 0.8) return 'status-danger'
      if (usage >= 0.6) return 'status-warning'
      return 'status-normal'
    },
    
    cacheIconClass() {
      return this.cacheCount > 0 ? 'el-icon-folder-opened' : 'el-icon-folder'
    },
    
    hitRate() {
      const report = this.performanceReport.performance
      const total = (report.totalHits || 0) + (report.totalMisses || 0)
      return total > 0 ? Math.round((report.totalHits || 0) / total * 100) : 0
    },
    
    cacheTimeoutMinutes: {
      get() {
        return Math.round(this.cacheConfig.defaultTimeout / (60 * 1000))
      },
      set(value) {
        this.cacheConfig.defaultTimeout = value * 60 * 1000
      }
    }
  },

  created() {
    this.loadCacheConfig()
    this.loadPerformanceReport()
    
    // 定期更新性能报告
    this.reportTimer = setInterval(() => {
      this.loadPerformanceReport()
    }, 30000) // 30秒更新一次
  },

  beforeDestroy() {
    if (this.reportTimer) {
      clearInterval(this.reportTimer)
    }
  },

  methods: {
    togglePanel() {
      this.panelVisible = !this.panelVisible
      if (this.panelVisible) {
        this.refreshData()
      }
    },

    handleClose() {
      this.panelVisible = false
    },

    refreshData() {
      this.loadPerformanceReport()
      this.$forceUpdate()
    },

    loadCacheConfig() {
      this.cacheConfig = { ...cacheControlService.getConfig() }
    },

    loadPerformanceReport() {
      this.performanceReport = cacheControlService.getPerformanceReport()
    },

    async updateCacheConfig() {
      try {
        await cacheControlService.updateConfig(this.cacheConfig)
        this.$message.success('缓存配置已更新')
      } catch (error) {
        this.$message.error('更新缓存配置失败')
      }
    },

    updateCacheTimeout() {
      this.updateCacheConfig()
    },

    async refreshComponent(componentName) {
      try {
        await this.$store.dispatch('refreshCache', componentName)
        this.$message.success('缓存已刷新')
        this.refreshData()
      } catch (error) {
        this.$message.error('刷新缓存失败')
      }
    },

    async removeComponent(componentName) {
      try {
        await this.$store.dispatch('delCachedView', componentName)
        this.$message.success('缓存已移除')
        this.refreshData()
      } catch (error) {
        this.$message.error('移除缓存失败')
      }
    },

    async clearAllCache() {
      try {
        await this.$confirm('确定要清空所有缓存吗？', '确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await cacheControlService.clearAllCache()
        this.$message.success('所有缓存已清空')
        this.refreshData()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('清空缓存失败')
        }
      }
    },

    getComponentTitle(routeName) {
      return this.routeTitleMap[routeName] || routeName
    },

    formatCacheAge(timestamp) {
      if (!timestamp) return '未知'
      
      const now = Date.now()
      const age = now - timestamp
      
      if (age < 60000) {
        return `${Math.floor(age / 1000)}秒前`
      } else if (age < 3600000) {
        return `${Math.floor(age / 60000)}分钟前`
      } else {
        return `${Math.floor(age / 3600000)}小时前`
      }
    },

    formatTime(timestamp) {
      if (!timestamp) return ''
      return new Date(timestamp).toLocaleString('zh-CN')
    },

    getProgressColor(usage) {
      if (usage >= 0.8) return '#F56C6C'
      if (usage >= 0.6) return '#E6A23C'
      return '#67C23A'
    }
  }
}
</script>

<style scoped>
.cache-monitor {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 2000;
}

.cache-indicator {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  position: relative;
}

.cache-indicator:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.2);
}

.status-normal {
  background: linear-gradient(135deg, #67C23A, #85CE61);
  color: white;
}

.status-warning {
  background: linear-gradient(135deg, #E6A23C, #EEBD7E);
  color: white;
}

.status-danger {
  background: linear-gradient(135deg, #F56C6C, #F89898);
  color: white;
}

.cache-count {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #409EFF;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

.section-title {
  font-weight: bold;
  color: #303133;
}

.cache-overview {
  margin-bottom: 20px;
}

.overview-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.usage-progress {
  margin-top: 15px;
}

.cache-list {
  margin-bottom: 20px;
}

.cache-items {
  max-height: 300px;
  overflow-y: auto;
}

.cache-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #EBEEF5;
}

.cache-item:last-child {
  border-bottom: none;
}

.item-info {
  flex: 1;
}

.item-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.item-meta {
  font-size: 12px;
  color: #909399;
}

.cache-time {
  margin-right: 10px;
}

.item-actions {
  display: flex;
  gap: 5px;
}

.performance-report {
  margin-bottom: 20px;
}

.performance-stats {
  space-y: 8px;
}

.perf-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
}

.perf-label {
  color: #606266;
  font-size: 13px;
}

.perf-value {
  color: #303133;
  font-weight: 500;
  font-size: 13px;
}

.cache-settings {
  margin-bottom: 20px;
}

/* 深度选择器，修改Element UI样式 */
::v-deep .el-drawer__body {
  padding: 20px;
  background-color: #f8f9fa;
}

::v-deep .el-card {
  margin-bottom: 15px;
  border: none;
}

::v-deep .el-card__header {
  border-bottom: 1px solid #EBEEF5;
  padding: 15px 20px;
}

::v-deep .el-card__body {
  padding: 20px;
}
</style>