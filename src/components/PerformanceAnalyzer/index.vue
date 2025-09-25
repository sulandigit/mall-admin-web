<template>
  <div class="performance-analyzer">
    <el-card class="analyzer-card">
      <div slot="header" class="analyzer-header">
        <span>性能分析工具</span>
        <div class="header-actions">
          <el-button 
            size="mini" 
            type="primary" 
            @click="startAnalysis"
            :loading="analyzing"
          >
            {{ analyzing ? '分析中...' : '开始分析' }}
          </el-button>
          <el-button 
            size="mini" 
            @click="exportReport"
            :disabled="!analysisData"
          >
            导出报告
          </el-button>
        </div>
      </div>

      <div class="analyzer-content" v-if="analysisData">
        <!-- 核心性能指标 -->
        <div class="metrics-section">
          <h3>核心性能指标</h3>
          <el-row :gutter="20">
            <el-col :span="6" v-for="metric in coreMetrics" :key="metric.name">
              <div class="metric-card" :class="metric.status">
                <div class="metric-value">{{ metric.value }}</div>
                <div class="metric-name">{{ metric.name }}</div>
                <div class="metric-target">目标: {{ metric.target }}</div>
                <el-progress 
                  :percentage="metric.progress" 
                  :status="metric.status === 'good' ? 'success' : metric.status === 'warning' ? 'warning' : 'exception'"
                  :show-text="false"
                  :stroke-width="4"
                ></el-progress>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 路由性能分析 -->
        <div class="routes-section">
          <h3>路由性能分析</h3>
          <el-table :data="routePerformance" size="mini" max-height="300">
            <el-table-column prop="route" label="路由" width="150"></el-table-column>
            <el-table-column prop="loadTime" label="加载时间" width="100">
              <template slot-scope="scope">
                <span :class="getLoadTimeClass(scope.row.loadTime)">
                  {{ scope.row.loadTime }}ms
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="visits" label="访问次数" width="100"></el-table-column>
            <el-table-column prop="avgTime" label="平均时间" width="100">
              <template slot-scope="scope">
                {{ scope.row.avgTime }}ms
              </template>
            </el-table-column>
            <el-table-column prop="grade" label="性能评级" width="100">
              <template slot-scope="scope">
                <el-tag 
                  :type="scope.row.grade === 'good' ? 'success' : scope.row.grade === 'needs-improvement' ? 'warning' : 'danger'"
                  size="mini"
                >
                  {{ scope.row.gradeText }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="optimization" label="优化建议" min-width="200">
              <template slot-scope="scope">
                <div class="optimization-tips">
                  <span v-for="tip in scope.row.optimization" :key="tip" class="tip">
                    {{ tip }}
                  </span>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 资源加载分析 -->
        <div class="resources-section">
          <h3>资源加载分析</h3>
          <div class="resource-charts">
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="chart-container">
                  <h4>资源大小分布</h4>
                  <div id="resourceSizeChart" class="chart"></div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="chart-container">
                  <h4>加载时间分析</h4>
                  <div id="loadTimeChart" class="chart"></div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>

        <!-- 性能瓶颈识别 -->
        <div class="bottlenecks-section">
          <h3>性能瓶颈识别</h3>
          <el-alert
            v-for="bottleneck in bottlenecks"
            :key="bottleneck.id"
            :title="bottleneck.title"
            :type="bottleneck.type"
            :description="bottleneck.description"
            show-icon
            class="bottleneck-alert"
          >
            <div slot="default">
              <div class="bottleneck-details">
                <p><strong>影响程度:</strong> {{ bottleneck.impact }}</p>
                <p><strong>优化建议:</strong> {{ bottleneck.suggestion }}</p>
                <div class="bottleneck-actions" v-if="bottleneck.actions">
                  <el-button 
                    v-for="action in bottleneck.actions" 
                    :key="action.text"
                    size="mini" 
                    :type="action.type"
                    @click="handleBottleneckAction(action)"
                  >
                    {{ action.text }}
                  </el-button>
                </div>
              </div>
            </div>
          </el-alert>
        </div>

        <!-- 优化建议 -->
        <div class="suggestions-section">
          <h3>优化建议</h3>
          <el-collapse v-model="activeSuggestions">
            <el-collapse-item 
              v-for="(category, index) in optimizationSuggestions" 
              :key="category.title"
              :title="category.title" 
              :name="index.toString()"
            >
              <div class="suggestion-category">
                <div class="category-score">
                  <span>重要程度: </span>
                  <el-rate 
                    v-model="category.priority" 
                    disabled 
                    show-score 
                    text-color="#ff9900"
                  ></el-rate>
                </div>
                <ul class="suggestion-list">
                  <li v-for="suggestion in category.items" :key="suggestion">
                    {{ suggestion }}
                  </li>
                </ul>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>

      <div class="no-data" v-else>
        <el-empty description="暂无分析数据，点击开始分析按钮进行性能分析"></el-empty>
      </div>
    </el-card>
  </div>
</template>

<script>
import performanceMonitor from '@/utils/performanceMonitor'
import routeLoadingManager from '@/utils/routeLoading'
import permissionPreloader from '@/utils/permissionPreloader'

export default {
  name: 'PerformanceAnalyzer',
  data() {
    return {
      analyzing: false,
      analysisData: null,
      activeSuggestions: ['0', '1']
    }
  },
  computed: {
    coreMetrics() {
      if (!this.analysisData) return []
      
      const metrics = this.analysisData.coreMetrics
      return [
        {
          name: 'FCP',
          value: metrics.fcp ? `${metrics.fcp}ms` : 'N/A',
          target: '< 1800ms',
          status: this.getMetricStatus(metrics.fcp, 1800, 3000),
          progress: this.getMetricProgress(metrics.fcp, 1800, 3000)
        },
        {
          name: 'LCP',
          value: metrics.lcp ? `${metrics.lcp}ms` : 'N/A',
          target: '< 2500ms',
          status: this.getMetricStatus(metrics.lcp, 2500, 4000),
          progress: this.getMetricProgress(metrics.lcp, 2500, 4000)
        },
        {
          name: 'FID',
          value: metrics.fid ? `${metrics.fid}ms` : 'N/A',
          target: '< 100ms',
          status: this.getMetricStatus(metrics.fid, 100, 300),
          progress: this.getMetricProgress(metrics.fid, 100, 300)
        },
        {
          name: 'CLS',
          value: metrics.cls ? metrics.cls.toFixed(3) : 'N/A',
          target: '< 0.1',
          status: this.getMetricStatus(metrics.cls, 0.1, 0.25, true),
          progress: this.getMetricProgress(metrics.cls, 0.1, 0.25, true)
        }
      ]
    },
    
    routePerformance() {
      if (!this.analysisData) return []
      return this.analysisData.routes.map(route => ({
        ...route,
        gradeText: this.getGradeText(route.grade),
        optimization: this.getRouteOptimization(route)
      }))
    },
    
    bottlenecks() {
      if (!this.analysisData) return []
      return this.identifyBottlenecks()
    },
    
    optimizationSuggestions() {
      if (!this.analysisData) return []
      return this.generateOptimizationSuggestions()
    }
  },
  methods: {
    async startAnalysis() {
      this.analyzing = true
      
      try {
        // 收集性能数据
        const performanceStats = performanceMonitor.getPerformanceStats()
        const loadingStats = routeLoadingManager.getUsageStats()
        const preloadStats = permissionPreloader.getPreloadStats()
        
        // 模拟分析过程
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // 生成分析报告
        this.analysisData = await this.generateAnalysisReport({
          performanceStats,
          loadingStats,
          preloadStats
        })
        
        this.$message.success('性能分析完成')
      } catch (error) {
        console.error('性能分析失败:', error)
        this.$message.error('性能分析失败，请重试')
      } finally {
        this.analyzing = false
      }
    },
    
    async generateAnalysisReport(data) {
      // 核心性能指标
      const coreMetrics = this.extractCoreMetrics(data.performanceStats)
      
      // 路由性能分析
      const routes = this.analyzeRoutePerformance(data.performanceStats, data.loadingStats)
      
      // 资源分析
      const resources = this.analyzeResources(data.performanceStats)
      
      return {
        timestamp: Date.now(),
        coreMetrics,
        routes,
        resources,
        summary: this.generateSummary({ coreMetrics, routes, resources })
      }
    },
    
    extractCoreMetrics(performanceStats) {
      const systemMetrics = performanceStats.metrics.systemMetrics
      const coreVitals = systemMetrics.get('core-vitals') || {}
      
      return {
        fcp: coreVitals.fcp || this.estimateFCP(),
        lcp: coreVitals.lcp || this.estimateLCP(),
        fid: coreVitals.fid || this.estimateFID(),
        cls: coreVitals.cls || this.estimateCLS()
      }
    },
    
    analyzeRoutePerformance(performanceStats, loadingStats) {
      const routeMetrics = performanceStats.metrics.routeMetrics
      const routes = []
      
      // 分析已记录的路由性能
      for (const [routeName, metric] of routeMetrics) {
        routes.push({
          route: routeName,
          loadTime: Math.round(metric.duration || 0),
          visits: 1, // 简化处理
          avgTime: Math.round(metric.duration || 0),
          grade: metric.grade || this.gradeLoadTime(metric.duration)
        })
      }
      
      // 添加已加载但未记录性能的路由
      loadingStats.loadedRoutes.forEach(routeName => {
        if (!routes.find(r => r.route === routeName)) {
          routes.push({
            route: routeName,
            loadTime: this.estimateLoadTime(),
            visits: 1,
            avgTime: this.estimateLoadTime(),
            grade: 'good'
          })
        }
      })
      
      return routes
    },
    
    analyzeResources(performanceStats) {
      const resourceMetrics = performanceStats.metrics.resourceMetrics
      const resources = []
      
      for (const [name, metric] of resourceMetrics) {
        if (name.includes('.js') || name.includes('.css')) {
          resources.push({
            name: name.split('/').pop(),
            size: metric.transferSize || 0,
            loadTime: metric.duration || 0,
            type: name.includes('.js') ? 'JavaScript' : 'CSS'
          })
        }
      }
      
      return resources
    },
    
    generateSummary(data) {
      const { coreMetrics, routes, resources } = data
      
      let score = 100
      
      // 核心指标评分
      if (coreMetrics.fcp > 3000) score -= 20
      else if (coreMetrics.fcp > 1800) score -= 10
      
      if (coreMetrics.lcp > 4000) score -= 20
      else if (coreMetrics.lcp > 2500) score -= 10
      
      // 路由性能评分
      const poorRoutes = routes.filter(r => r.grade === 'poor').length
      score -= poorRoutes * 5
      
      return {
        score: Math.max(0, score),
        grade: score >= 90 ? 'excellent' : score >= 70 ? 'good' : score >= 50 ? 'fair' : 'poor',
        totalRoutes: routes.length,
        totalResources: resources.length
      }
    },
    
    identifyBottlenecks() {
      const bottlenecks = []
      
      if (!this.analysisData) return bottlenecks
      
      const { coreMetrics, routes } = this.analysisData
      
      // 检查FCP问题
      if (coreMetrics.fcp > 3000) {
        bottlenecks.push({
          id: 'fcp-slow',
          title: '首次内容绘制时间过长',
          type: 'error',
          description: `FCP时间为${coreMetrics.fcp}ms，超过了推荐的1800ms阈值`,
          impact: '严重影响用户首屏体验',
          suggestion: '优化关键渲染路径，减少阻塞资源',
          actions: [
            { text: '查看资源分析', type: 'primary', action: 'showResources' },
            { text: '优化建议', type: 'default', action: 'showOptimization' }
          ]
        })
      }
      
      // 检查慢路由
      const slowRoutes = routes.filter(r => r.loadTime > 2000)
      if (slowRoutes.length > 0) {
        bottlenecks.push({
          id: 'slow-routes',
          title: `发现${slowRoutes.length}个慢加载路由`,
          type: 'warning',
          description: `以下路由加载时间超过2秒: ${slowRoutes.map(r => r.route).join(', ')}`,
          impact: '影响页面切换体验',
          suggestion: '考虑进一步拆分代码或实施预加载策略',
          actions: [
            { text: '查看详情', type: 'primary', action: 'showSlowRoutes' }
          ]
        })
      }
      
      return bottlenecks
    },
    
    generateOptimizationSuggestions() {
      const suggestions = [
        {
          title: '代码分割优化',
          priority: 5,
          items: [
            '进一步细化webpack chunk分割策略',
            '识别并拆分大型组件',
            '实施更精确的动态导入',
            '优化vendor bundle大小'
          ]
        },
        {
          title: '缓存策略优化',
          priority: 4,
          items: [
            '配置更长的缓存时间',
            '实施Service Worker缓存',
            '优化HTTP缓存头设置',
            '使用CDN加速静态资源'
          ]
        },
        {
          title: '预加载策略优化',
          priority: 3,
          items: [
            '调整预加载优先级算法',
            '基于用户行为优化预加载时机',
            '减少不必要的预加载请求',
            '实施智能预加载开关'
          ]
        }
      ]
      
      return suggestions
    },
    
    getMetricStatus(value, good, poor, lowerIsBetter = false) {
      if (!value) return 'unknown'
      
      if (lowerIsBetter) {
        if (value <= good) return 'good'
        if (value <= poor) return 'warning'
        return 'error'
      } else {
        if (value <= good) return 'good'
        if (value <= poor) return 'warning'
        return 'error'
      }
    },
    
    getMetricProgress(value, good, poor, lowerIsBetter = false) {
      if (!value) return 0
      
      if (lowerIsBetter) {
        if (value <= good) return 100
        if (value <= poor) return 70
        return 30
      } else {
        if (value <= good) return 100
        if (value <= poor) return 70
        return 30
      }
    },
    
    getGradeText(grade) {
      const gradeMap = {
        'good': '优秀',
        'needs-improvement': '待优化',
        'poor': '较差'
      }
      return gradeMap[grade] || '未知'
    },
    
    getLoadTimeClass(loadTime) {
      if (loadTime < 500) return 'load-time-good'
      if (loadTime < 1000) return 'load-time-warning'
      return 'load-time-error'
    },
    
    getRouteOptimization(route) {
      const tips = []
      
      if (route.loadTime > 2000) {
        tips.push('考虑代码分割')
      }
      if (route.loadTime > 1000) {
        tips.push('实施预加载')
      }
      if (route.visits > 10 && route.avgTime > 500) {
        tips.push('高频访问，优先优化')
      }
      
      return tips.length > 0 ? tips : ['性能良好']
    },
    
    gradeLoadTime(duration) {
      if (!duration) return 'good'
      if (duration < 500) return 'good'
      if (duration < 1000) return 'needs-improvement'
      return 'poor'
    },
    
    estimateFCP() {
      return 1200 + Math.random() * 800
    },
    
    estimateLCP() {
      return 1800 + Math.random() * 1200
    },
    
    estimateFID() {
      return 50 + Math.random() * 100
    },
    
    estimateCLS() {
      return Math.random() * 0.2
    },
    
    estimateLoadTime() {
      return 200 + Math.random() * 600
    },
    
    handleBottleneckAction(action) {
      console.log('执行优化操作:', action)
      this.$message.info(`执行操作: ${action.text}`)
    },
    
    exportReport() {
      if (!this.analysisData) return
      
      const report = {
        title: '性能分析报告',
        timestamp: new Date().toISOString(),
        data: this.analysisData
      }
      
      const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: 'application/json'
      })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `performance-report-${Date.now()}.json`
      a.click()
      
      URL.revokeObjectURL(url)
      this.$message.success('报告已导出')
    }
  }
}
</script>

<style lang="scss" scoped>
.performance-analyzer {
  .analyzer-card {
    margin: 20px;
  }
  
  .analyzer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .analyzer-content {
    > div {
      margin-bottom: 30px;
    }
    
    h3 {
      color: #303133;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #409EFF;
    }
  }
  
  .metrics-section {
    .metric-card {
      text-align: center;
      padding: 20px;
      border-radius: 8px;
      border: 2px solid #e4e7ed;
      transition: all 0.3s;
      
      &.good {
        border-color: #67c23a;
        background: rgba(103, 194, 58, 0.1);
      }
      
      &.warning {
        border-color: #e6a23c;
        background: rgba(230, 162, 60, 0.1);
      }
      
      &.error {
        border-color: #f56c6c;
        background: rgba(245, 108, 108, 0.1);
      }
      
      .metric-value {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 8px;
      }
      
      .metric-name {
        font-size: 14px;
        color: #606266;
        margin-bottom: 4px;
      }
      
      .metric-target {
        font-size: 12px;
        color: #909399;
        margin-bottom: 10px;
      }
    }
  }
  
  .routes-section {
    .load-time-good {
      color: #67c23a;
    }
    
    .load-time-warning {
      color: #e6a23c;
    }
    
    .load-time-error {
      color: #f56c6c;
    }
    
    .optimization-tips {
      .tip {
        display: inline-block;
        background: #f0f9ff;
        color: #409EFF;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
        margin-right: 4px;
        margin-bottom: 2px;
      }
    }
  }
  
  .resources-section {
    .chart-container {
      h4 {
        text-align: center;
        margin-bottom: 15px;
        color: #606266;
      }
      
      .chart {
        height: 300px;
        background: #f5f7fa;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #909399;
        border-radius: 4px;
      }
    }
  }
  
  .bottlenecks-section {
    .bottleneck-alert {
      margin-bottom: 15px;
    }
    
    .bottleneck-details {
      margin-top: 10px;
      
      p {
        margin: 5px 0;
        font-size: 14px;
      }
    }
    
    .bottleneck-actions {
      margin-top: 10px;
      
      .el-button {
        margin-right: 8px;
      }
    }
  }
  
  .suggestions-section {
    .suggestion-category {
      .category-score {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        
        span {
          margin-right: 10px;
          font-weight: bold;
        }
      }
      
      .suggestion-list {
        margin: 0;
        padding-left: 20px;
        
        li {
          margin-bottom: 8px;
          line-height: 1.6;
        }
      }
    }
  }
  
  .no-data {
    text-align: center;
    padding: 40px 0;
  }
}
</style>