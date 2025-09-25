<template>
  <el-dialog
    title="批量导出商品"
    :visible.sync="dialogVisible"
    width="900px"
    :close-on-click-modal="false"
    class="export-dialog"
  >
    <!-- 导出配置 -->
    <div class="export-content">
      <export-config
        :category-options="categoryOptions"
        :brand-options="brandOptions"
        :preview-info="previewInfo"
        @preview-update="handlePreviewUpdate"
        ref="exportConfig"
      ></export-config>
    </div>

    <!-- 导出进度 -->
    <div v-if="exporting" class="export-progress">
      <el-alert
        title="正在导出商品数据..."
        type="info"
        :closable="false"
        show-icon
      >
        <div slot="default">
          <el-progress
            :percentage="exportProgress"
            :status="exportProgress === 100 ? 'success' : ''"
          ></el-progress>
          <p class="progress-text">{{ progressText }}</p>
        </div>
      </el-alert>
    </div>

    <!-- 导出结果 -->
    <div v-if="exportResult.success" class="export-result">
      <el-alert
        title="导出完成"
        type="success"
        :closable="false"
        show-icon
      >
        <div slot="default">
          <p>成功导出 <strong>{{ exportResult.recordCount }}</strong> 条商品数据</p>
          <p>文件大小：<strong>{{ exportResult.fileSize }}</strong></p>
          <div class="download-section">
            <el-button
              type="primary"
              icon="el-icon-download"
              @click="downloadFile"
              :loading="downloadLoading"
            >
              {{ downloadLoading ? '下载中...' : '下载文件' }}
            </el-button>
            <span class="download-tip">文件将在1小时后自动删除</span>
          </div>
        </div>
      </el-alert>
    </div>

    <!-- 导出错误 -->
    <div v-if="exportError" class="export-error">
      <el-alert
        title="导出失败"
        type="error"
        :closable="false"
        show-icon
      >
        <div slot="default">
          <p>{{ exportError }}</p>
          <el-button type="text" size="small" @click="retryExport">
            重新尝试
          </el-button>
        </div>
      </el-alert>
    </div>

    <!-- 底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">
        {{ exportResult.success ? '关闭' : '取消' }}
      </el-button>
      
      <el-button
        v-if="!exportResult.success && !exporting"
        type="primary"
        @click="startExport"
        :disabled="previewInfo.total === 0"
      >
        开始导出
      </el-button>
      
      <el-button
        v-if="exporting"
        type="danger"
        @click="cancelExport"
      >
        取消导出
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import ExportConfig from '@/components/ExportConfig'
import {
  getExportOptions,
  bulkExportProducts
} from '@/api/product'

export default {
  name: 'BulkExportDialog',
  components: {
    ExportConfig
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialogVisible: false,
      
      // 配置选项
      categoryOptions: [],
      brandOptions: [],
      
      // 预览信息
      previewInfo: {
        total: 0,
        fileSize: '0 KB'
      },
      
      // 导出状态
      exporting: false,
      exportProgress: 0,
      progressText: '准备导出...',
      exportTaskId: null,
      progressTimer: null,
      
      // 导出结果
      exportResult: {
        success: false,
        downloadUrl: '',
        fileName: '',
        fileSize: '',
        recordCount: 0
      },
      
      // 错误处理
      exportError: '',
      downloadLoading: false,
      
      // 取消导出标识
      cancelRequested: false
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val) {
        this.initDialog()
      }
    },
    
    dialogVisible(val) {
      this.$emit('update:visible', val)
      if (!val) {
        this.cleanup()
      }
    }
  },
  methods: {
    // 初始化对话框
    async initDialog() {
      this.resetState()
      await this.loadExportOptions()
    },
    
    // 重置状态
    resetState() {
      this.exporting = false
      this.exportProgress = 0
      this.progressText = '准备导出...'
      this.exportTaskId = null
      this.exportResult = {
        success: false,
        downloadUrl: '',
        fileName: '',
        fileSize: '',
        recordCount: 0
      }
      this.exportError = ''
      this.downloadLoading = false
      this.cancelRequested = false
      
      if (this.progressTimer) {
        clearInterval(this.progressTimer)
        this.progressTimer = null
      }
    },
    
    // 加载导出选项
    async loadExportOptions() {
      try {
        const response = await getExportOptions()
        if (response.data.success) {
          const data = response.data.data
          this.categoryOptions = this.formatCategoryOptions(data.categories || [])
          this.brandOptions = data.brands || []
        }
      } catch (error) {
        console.error('加载导出选项失败:', error)
        this.$message.error('加载配置选项失败')
      }
    },
    
    // 格式化分类选项为级联格式
    formatCategoryOptions(categories) {
      const buildTree = (items, parentId = 0) => {
        return items
          .filter(item => item.parentId === parentId)
          .map(item => ({
            value: item.id,
            label: item.name,
            children: buildTree(items, item.id)
          }))
          .filter(item => item.children.length > 0 || parentId !== 0)
      }
      
      return buildTree(categories)
    },
    
    // 处理预览更新
    async handlePreviewUpdate(config) {
      try {
        // 这里应该调用API获取预览信息
        // 为了演示，使用模拟数据
        await this.simulatePreviewUpdate(config)
      } catch (error) {
        console.error('更新预览失败:', error)
      }
    },
    
    // 模拟预览更新（实际应该调用API）
    async simulatePreviewUpdate(config) {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 根据筛选条件和字段数量估算记录数和文件大小
      let estimatedTotal = 1000 // 基础数量
      
      // 根据筛选条件调整
      if (config.filters.categoryIds && config.filters.categoryIds.length > 0) {
        estimatedTotal = Math.floor(estimatedTotal * 0.7)
      }
      if (config.filters.brandIds && config.filters.brandIds.length > 0) {
        estimatedTotal = Math.floor(estimatedTotal * 0.8)
      }
      if (config.filters.publishStatus) {
        estimatedTotal = Math.floor(estimatedTotal * 0.6)
      }
      if (config.filters.keyword) {
        estimatedTotal = Math.floor(estimatedTotal * 0.3)
      }
      
      // 估算文件大小（每行约1KB，每个字段约50字节）
      const estimatedSize = Math.floor(estimatedTotal * config.fields.length * 50 / 1024)
      let sizeText = estimatedSize < 1024 ? `${estimatedSize} KB` : `${(estimatedSize / 1024).toFixed(1)} MB`
      
      this.previewInfo = {
        total: estimatedTotal,
        fileSize: sizeText
      }
    },
    
    // 开始导出
    async startExport() {
      const config = this.$refs.exportConfig.getExportConfig()
      
      if (!this.$refs.exportConfig.validateConfig()) {
        return
      }
      
      try {
        this.exporting = true
        this.exportProgress = 0
        this.progressText = '准备导出...'
        this.exportError = ''
        this.cancelRequested = false
        
        const response = await bulkExportProducts(config)
        
        if (response.data.success) {
          const data = response.data.data
          
          // 如果是异步导出，开始轮询进度
          if (data.taskId) {
            this.exportTaskId = data.taskId
            this.startProgressPolling()
          } else {
            // 同步导出，直接处理结果
            this.handleExportSuccess(data)
          }
        } else {
          this.exportError = response.data.message || '导出失败'
          this.exporting = false
        }
      } catch (error) {
        console.error('导出失败:', error)
        this.exportError = '导出请求失败，请重试'
        this.exporting = false
      }
    },
    
    // 开始进度轮询
    startProgressPolling() {
      this.progressTimer = setInterval(async () => {
        if (this.cancelRequested) {
          this.stopProgressPolling()
          return
        }
        
        try {
          // 这里应该调用检查导出进度的API
          // 为了演示，使用模拟进度
          await this.simulateProgress()
        } catch (error) {
          console.error('获取导出进度失败:', error)
          this.stopProgressPolling()
          this.exportError = '获取导出进度失败'
          this.exporting = false
        }
      }, 1000)
    },
    
    // 模拟进度更新
    async simulateProgress() {
      this.exportProgress += Math.random() * 15 + 5
      
      if (this.exportProgress >= 30 && this.exportProgress < 60) {
        this.progressText = '正在查询数据...'
      } else if (this.exportProgress >= 60 && this.exportProgress < 90) {
        this.progressText = '正在生成文件...'
      } else if (this.exportProgress >= 90) {
        this.progressText = '正在上传文件...'
      }
      
      if (this.exportProgress >= 100) {
        this.exportProgress = 100
        this.progressText = '导出完成'
        
        // 模拟导出成功
        setTimeout(() => {
          this.handleExportSuccess({
            downloadUrl: 'http://example.com/export/products_20231201.xlsx',
            fileName: 'products_20231201.xlsx',
            fileSize: this.previewInfo.fileSize,
            recordCount: this.previewInfo.total
          })
        }, 1000)
        
        this.stopProgressPolling()
      }
    },
    
    // 停止进度轮询
    stopProgressPolling() {
      if (this.progressTimer) {
        clearInterval(this.progressTimer)
        this.progressTimer = null
      }
    },
    
    // 处理导出成功
    handleExportSuccess(data) {
      this.exportResult = {
        success: true,
        downloadUrl: data.downloadUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        recordCount: data.recordCount
      }
      this.exporting = false
      this.$message.success('导出完成')
    },
    
    // 下载文件
    async downloadFile() {
      if (!this.exportResult.downloadUrl) {
        this.$message.error('下载链接无效')
        return
      }
      
      try {
        this.downloadLoading = true
        
        // 创建隐藏的下载链接
        const link = document.createElement('a')
        link.href = this.exportResult.downloadUrl
        link.download = this.exportResult.fileName
        link.style.display = 'none'
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        this.$message.success('文件下载已开始')
      } catch (error) {
        console.error('下载失败:', error)
        this.$message.error('下载失败，请重试')
      } finally {
        this.downloadLoading = false
      }
    },
    
    // 取消导出
    async cancelExport() {
      this.$confirm('确定要取消导出吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.cancelRequested = true
        this.stopProgressPolling()
        this.exporting = false
        this.exportProgress = 0
        this.progressText = '导出已取消'
        
        // 如果有任务ID，调用取消API
        if (this.exportTaskId) {
          this.cancelExportTask()
        }
      }).catch(() => {
        // 用户取消了取消操作
      })
    },
    
    // 取消导出任务
    async cancelExportTask() {
      try {
        // 这里应该调用取消导出的API
        // await cancelExportTask(this.exportTaskId)
        console.log('取消导出任务:', this.exportTaskId)
      } catch (error) {
        console.error('取消导出任务失败:', error)
      }
    },
    
    // 重新尝试导出
    retryExport() {
      this.exportError = ''
      this.startExport()
    },
    
    // 关闭对话框
    handleClose() {
      if (this.exporting) {
        this.$message.warning('导出进行中，请稍候或取消导出后关闭')
        return
      }
      
      this.dialogVisible = false
    },
    
    // 清理资源
    cleanup() {
      this.stopProgressPolling()
      this.resetState()
    }
  },
  
  beforeDestroy() {
    this.cleanup()
  }
}
</script>

<style scoped>
.export-dialog {
  .export-content {
    margin-bottom: 20px;
  }
  
  .export-progress {
    margin: 20px 0;
    
    .progress-text {
      text-align: center;
      color: #606266;
      font-size: 14px;
      margin: 10px 0 0 0;
    }
  }
  
  .export-result,
  .export-error {
    margin: 20px 0;
  }
  
  .download-section {
    margin-top: 15px;
    text-align: center;
    
    .download-tip {
      margin-left: 15px;
      color: #909399;
      font-size: 12px;
    }
  }
}

.dialog-footer {
  text-align: right;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

/* 覆盖Element UI样式 */
.export-dialog >>> .el-dialog__body {
  padding: 20px 25px;
  max-height: 70vh;
  overflow-y: auto;
}

.export-dialog >>> .el-alert .el-alert__content {
  width: 100%;
}

.export-dialog >>> .el-progress {
  margin: 15px 0;
}
</style>