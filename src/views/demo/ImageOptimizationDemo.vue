<template>
  <div class="image-optimization-demo">
    <el-card class="demo-card">
      <div slot="header" class="card-header">
        <span>图片优化功能演示</span>
        <el-button-group style="float: right;">
          <el-button size="small" @click="refreshStats">刷新统计</el-button>
          <el-button size="small" @click="runPerformanceTest">性能测试</el-button>
          <el-button size="small" @click="showConfig = !showConfig">配置</el-button>
        </el-button-group>
      </div>

      <!-- 功能状态 -->
      <el-row :gutter="20" class="status-section">
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="status-item">
              <i class="el-icon-picture status-icon" :class="{ 'status-active': isWebPSupported }"></i>
              <div class="status-text">
                <div>WebP支持</div>
                <div class="status-value">{{ webpSupportStatus }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="status-item">
              <i class="el-icon-loading status-icon status-active"></i>
              <div class="status-text">
                <div>懒加载</div>
                <div class="status-value">{{ lazyLoadStats.loadedImages }}/{{ lazyLoadStats.totalImages }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="status-item">
              <i class="el-icon-time status-icon status-active"></i>
              <div class="status-text">
                <div>平均加载时间</div>
                <div class="status-value">{{ Math.round(lazyLoadStats.averageLoadTime) }}ms</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="status-item">
              <i class="el-icon-circle-check status-icon status-active"></i>
              <div class="status-text">
                <div>WebP转换率</div>
                <div class="status-value">{{ webpStats.conversionRate }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 配置面板 -->
      <el-collapse-transition>
        <el-card v-show="showConfig" class="config-panel">
          <div slot="header">配置设置</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <h4>懒加载配置</h4>
              <el-form label-width="120px" size="small">
                <el-form-item label="触发距离">
                  <el-input v-model="lazyLoadConfig.threshold" placeholder="50px"></el-input>
                </el-form-item>
                <el-form-item label="最大重试次数">
                  <el-input-number v-model="lazyLoadConfig.maxRetries" :min="1" :max="10"></el-input-number>
                </el-form-item>
                <el-form-item label="启用统计">
                  <el-switch v-model="lazyLoadConfig.enableStats"></el-switch>
                </el-form-item>
              </el-form>
            </el-col>
            <el-col :span="12">
              <h4>WebP配置</h4>
              <el-form label-width="120px" size="small">
                <el-form-item label="压缩质量">
                  <el-slider v-model="webpConfig.quality" :min="10" :max="100" show-input></el-slider>
                </el-form-item>
                <el-form-item label="启用降级">
                  <el-switch v-model="webpConfig.enableFallback"></el-switch>
                </el-form-item>
                <el-form-item label="自动转换">
                  <el-switch v-model="webpConfig.autoConvert"></el-switch>
                </el-form-item>
              </el-form>
            </el-col>
          </el-row>
          <div style="text-align: center; margin-top: 20px;">
            <el-button type="primary" @click="saveConfig">保存配置</el-button>
            <el-button @click="resetConfig">重置配置</el-button>
          </div>
        </el-card>
      </el-collapse-transition>

      <!-- LazyImage 演示 -->
      <el-card class="demo-section">
        <div slot="header">LazyImage 组件演示</div>
        <el-row :gutter="20">
          <el-col :span="8" v-for="(image, index) in demoImages" :key="index">
            <div class="image-demo-item">
              <lazy-image
                :src="image.url"
                :width="200"
                :height="150"
                :alt="image.name"
                :enable-webp="enableWebP"
                @load="onImageLoad"
                @error="onImageError"
              />
              <div class="image-info">
                <div class="image-name">{{ image.name }}</div>
                <div class="image-size">{{ image.size }}</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- WebPUpload 演示 -->
      <el-card class="demo-section">
        <div slot="header">WebPUpload 组件演示</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <h4>单图上传</h4>
            <webp-upload
              v-model="singleUploadValue"
              :auto-convert="autoConvert"
              :quality="webpQuality"
              @success="onUploadSuccess"
              @error="onUploadError"
            />
            <div v-if="singleUploadValue" class="upload-result">
              <p>上传结果: {{ singleUploadValue }}</p>
            </div>
          </el-col>
          <el-col :span="12">
            <h4>多图上传</h4>
            <webp-upload
              v-model="multiUploadValue"
              :multiple="true"
              :limit="5"
              :auto-convert="autoConvert"
              :quality="webpQuality"
              @success="onUploadSuccess"
              @error="onUploadError"
            />
            <div v-if="multiUploadValue.length" class="upload-result">
              <p>已上传 {{ multiUploadValue.length }} 张图片</p>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- EnhancedUpload 演示 -->
      <el-card class="demo-section">
        <div slot="header">EnhancedUpload 组件演示</div>
        <enhanced-upload
          v-model="enhancedUploadValue"
          :multiple="true"
          :limit="8"
          :auto-convert="autoConvert"
          :show-stats="true"
          :webp-quality="webpQuality"
          @success="onUploadSuccess"
          @error="onUploadError"
        />
      </el-card>

      <!-- 性能测试结果 -->
      <el-card v-if="performanceResults" class="demo-section">
        <div slot="header">性能测试结果</div>
        <el-row :gutter="20">
          <el-col :span="6" v-for="(result, key) in performanceResults.results" :key="key">
            <el-card shadow="hover">
              <div class="perf-result">
                <h4>{{ getTestName(key) }}</h4>
                <div class="perf-score" :class="getScoreClass(result.score || 0)">
                  {{ result.score || 0 }}分
                </div>
                <div class="perf-details">
                  <div v-for="(value, metric) in result" :key="metric" v-if="metric !== 'score'">
                    {{ getMetricName(metric) }}: {{ formatMetricValue(value, metric) }}
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <div class="performance-summary">
          <h4>测试总结</h4>
          <div class="summary-score">
            <span class="score-label">总体评分:</span>
            <span class="score-value" :class="getScoreClass(performanceResults.summary.performance.score)">
              {{ performanceResults.summary.performance.score }}分 ({{ performanceResults.summary.performance.grade }})
            </span>
          </div>
          
          <div v-if="performanceResults.summary.recommendations.length" class="recommendations">
            <h5>优化建议:</h5>
            <ul>
              <li v-for="(rec, index) in performanceResults.summary.recommendations" :key="index">
                {{ rec }}
              </li>
            </ul>
          </div>
        </div>
      </el-card>
    </el-card>

    <!-- 性能测试进度对话框 -->
    <el-dialog
      title="性能测试进行中"
      :visible.sync="testingPerformance"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="400px"
    >
      <div class="test-progress">
        <el-progress :percentage="testProgress" :status="testStatus"></el-progress>
        <p class="test-info">{{ testInfo }}</p>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelPerformanceTest">取消测试</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import LazyImage from '@/components/LazyImage'
import WebPUpload from '@/components/WebPUpload'
import EnhancedUpload from '@/components/Upload/EnhancedUpload'
import { imageOptimizationConfig } from '@/utils/imageOptimizationConfig'
import { ImageOptimizationPerformanceTester } from '@/utils/performanceTester'

export default {
  name: 'ImageOptimizationDemo',
  components: {
    LazyImage,
    WebPUpload,
    EnhancedUpload
  },
  data() {
    return {
      showConfig: false,
      
      // 配置数据
      lazyLoadConfig: {
        threshold: '50px',
        maxRetries: 3,
        enableStats: true
      },
      webpConfig: {
        quality: 80,
        enableFallback: true,
        autoConvert: true
      },
      
      // 上传相关
      singleUploadValue: '',
      multiUploadValue: [],
      enhancedUploadValue: [],
      autoConvert: true,
      webpQuality: 80,
      enableWebP: true,
      
      // 演示图片
      demoImages: [
        { name: '风景图片', url: 'https://picsum.photos/400/300?random=1', size: '150KB' },
        { name: '人物图片', url: 'https://picsum.photos/400/300?random=2', size: '200KB' },
        { name: '建筑图片', url: 'https://picsum.photos/400/300?random=3', size: '180KB' },
        { name: '动物图片', url: 'https://picsum.photos/400/300?random=4', size: '160KB' },
        { name: '植物图片', url: 'https://picsum.photos/400/300?random=5', size: '140KB' },
        { name: '美食图片', url: 'https://picsum.photos/400/300?random=6', size: '170KB' }
      ],
      
      // 性能测试
      performanceResults: null,
      testingPerformance: false,
      testProgress: 0,
      testStatus: '',
      testInfo: '准备开始测试...',
      performanceTester: null
    }
  },
  computed: {
    ...mapGetters('imageOptimization', [
      'isWebPSupported',
      'isWebPEnabled',
      'webpSupportStatus',
      'lazyLoadStats',
      'webpStats'
    ])
  },
  created() {
    this.performanceTester = new ImageOptimizationPerformanceTester()
    this.loadConfig()
    this.refreshStats()
  },
  methods: {
    ...mapActions('imageOptimization', [
      'refreshStats',
      'updateLazyLoadConfig',
      'updateWebPConfig'
    ]),

    // 加载配置
    loadConfig() {
      this.lazyLoadConfig = {
        ...this.lazyLoadConfig,
        ...imageOptimizationConfig.get('lazyLoad')
      }
      this.webpConfig = {
        ...this.webpConfig,
        ...imageOptimizationConfig.get('webp')
      }
    },

    // 保存配置
    async saveConfig() {
      try {
        await this.updateLazyLoadConfig(this.lazyLoadConfig)
        await this.updateWebPConfig(this.webpConfig)
        
        imageOptimizationConfig.update({
          'lazyLoad.threshold': this.lazyLoadConfig.threshold,
          'lazyLoad.maxRetries': this.lazyLoadConfig.maxRetries,
          'lazyLoad.enableStats': this.lazyLoadConfig.enableStats,
          'webp.quality': this.webpConfig.quality,
          'webp.enableFallback': this.webpConfig.enableFallback,
          'webp.autoConvert': this.webpConfig.autoConvert
        })
        
        this.$message.success('配置保存成功')
      } catch (error) {
        this.$message.error('配置保存失败: ' + error.message)
      }
    },

    // 重置配置
    resetConfig() {
      imageOptimizationConfig.reset()
      this.loadConfig()
      this.$message.success('配置已重置')
    },

    // 图片加载成功
    onImageLoad(imageInfo) {
      console.log('图片加载成功:', imageInfo)
    },

    // 图片加载失败
    onImageError(error) {
      console.warn('图片加载失败:', error)
    },

    // 上传成功
    onUploadSuccess(fileInfo) {
      console.log('上传成功:', fileInfo)
      this.$message.success(`文件 ${fileInfo.name} 上传成功`)
    },

    // 上传失败
    onUploadError(error) {
      console.error('上传失败:', error)
      this.$message.error('上传失败')
    },

    // 运行性能测试
    async runPerformanceTest() {
      this.testingPerformance = true
      this.testProgress = 0
      this.testStatus = ''
      this.testInfo = '初始化测试环境...'

      try {
        // 模拟测试进度
        const progressInterval = setInterval(() => {
          if (this.testProgress < 90) {
            this.testProgress += Math.random() * 10
            this.updateTestInfo()
          }
        }, 1000)

        const results = await this.performanceTester.startPerformanceTest({
          testDuration: 30000,
          imageCount: 20,
          testTypes: ['lazy', 'webp', 'cache']
        })

        clearInterval(progressInterval)
        this.testProgress = 100
        this.testStatus = 'success'
        this.testInfo = '测试完成'

        setTimeout(() => {
          this.testingPerformance = false
          this.performanceResults = results
        }, 1000)

      } catch (error) {
        this.testStatus = 'exception'
        this.testInfo = '测试失败: ' + error.message
        setTimeout(() => {
          this.testingPerformance = false
        }, 2000)
      }
    },

    // 取消性能测试
    cancelPerformanceTest() {
      this.testingPerformance = false
      this.performanceTester.cleanup()
    },

    // 更新测试信息
    updateTestInfo() {
      const infos = [
        '正在测试懒加载性能...',
        '正在测试WebP转换性能...',
        '正在测试缓存性能...',
        '正在分析测试结果...'
      ]
      const index = Math.floor(this.testProgress / 25)
      this.testInfo = infos[Math.min(index, infos.length - 1)]
    },

    // 获取测试名称
    getTestName(key) {
      const names = {
        lazyLoading: '懒加载测试',
        webpConversion: 'WebP转换测试',
        cachePerformance: '缓存性能测试',
        memoryUsage: '内存使用测试'
      }
      return names[key] || key
    },

    // 获取指标名称
    getMetricName(metric) {
      const names = {
        loadTime: '加载时间',
        savedRequests: '节省请求',
        conversionTime: '转换时间',
        compressionRatio: '压缩率',
        spaceSaved: '节省空间',
        hitRate: '命中率',
        memoryIncrease: '内存增长'
      }
      return names[metric] || metric
    },

    // 格式化指标值
    formatMetricValue(value, metric) {
      if (typeof value === 'number') {
        if (metric.includes('Time')) {
          return value.toFixed(1) + 'ms'
        } else if (metric.includes('Rate') || metric.includes('Ratio')) {
          return (value * 100).toFixed(1) + '%'
        } else if (metric.includes('Size') || metric.includes('Space')) {
          return this.formatFileSize(value)
        }
        return value.toFixed(1)
      }
      return value
    },

    // 格式化文件大小
    formatFileSize(bytes) {
      if (!bytes) return '0 B'
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(1024))
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
    },

    // 获取分数样式类
    getScoreClass(score) {
      if (score >= 80) return 'score-excellent'
      if (score >= 60) return 'score-good'
      if (score >= 40) return 'score-fair'
      return 'score-poor'
    }
  }
}
</script>

<style scoped>
.image-optimization-demo {
  padding: 20px;
}

.demo-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-section {
  margin-bottom: 20px;
}

.status-item {
  display: flex;
  align-items: center;
  padding: 15px;
}

.status-icon {
  font-size: 24px;
  margin-right: 12px;
  color: #ddd;
}

.status-icon.status-active {
  color: #67c23a;
}

.status-text {
  flex: 1;
}

.status-value {
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
}

.config-panel {
  margin-bottom: 20px;
}

.demo-section {
  margin-bottom: 20px;
}

.image-demo-item {
  text-align: center;
  margin-bottom: 20px;
}

.image-info {
  margin-top: 8px;
}

.image-name {
  font-weight: 500;
  color: #303133;
}

.image-size {
  font-size: 12px;
  color: #909399;
}

.upload-result {
  margin-top: 10px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
}

.perf-result {
  text-align: center;
  padding: 20px;
}

.perf-result h4 {
  margin: 0 0 16px 0;
  color: #303133;
}

.perf-score {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 16px;
}

.score-excellent {
  color: #67c23a;
}

.score-good {
  color: #e6a23c;
}

.score-fair {
  color: #f56c6c;
}

.score-poor {
  color: #f56c6c;
}

.perf-details {
  font-size: 12px;
  color: #606266;
  text-align: left;
}

.perf-details > div {
  margin-bottom: 4px;
}

.performance-summary {
  margin-top: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.summary-score {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.score-label {
  font-size: 16px;
  margin-right: 12px;
}

.score-value {
  font-size: 24px;
  font-weight: bold;
}

.recommendations {
  margin-top: 16px;
}

.recommendations h5 {
  margin: 0 0 8px 0;
  color: #303133;
}

.recommendations ul {
  margin: 0;
  padding-left: 20px;
}

.recommendations li {
  margin-bottom: 4px;
  color: #606266;
}

.test-progress {
  text-align: center;
  padding: 20px;
}

.test-info {
  margin-top: 16px;
  color: #606266;
}

@media screen and (max-width: 768px) {
  .image-optimization-demo {
    padding: 10px;
  }
  
  .status-section .el-col {
    margin-bottom: 12px;
  }
  
  .perf-result {
    padding: 15px;
  }
  
  .perf-score {
    font-size: 24px;
  }
}
</style>