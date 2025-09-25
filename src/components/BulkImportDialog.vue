<template>
  <el-dialog
    title="批量导入商品"
    :visible.sync="dialogVisible"
    width="800px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :before-close="handleClose"
    class="import-dialog"
  >
    <!-- 步骤指示器 -->
    <div class="steps-container">
      <el-steps :active="currentStep" finish-status="success" align-center>
        <el-step title="下载模板"></el-step>
        <el-step title="上传文件"></el-step>
        <el-step title="数据预览"></el-step>
        <el-step title="确认导入"></el-step>
      </el-steps>
    </div>

    <!-- 步骤内容 -->
    <div class="step-content">
      <!-- 第一步：下载模板 -->
      <div v-if="currentStep === 0" class="step-panel">
        <div class="template-download">
          <div class="instruction">
            <h3>导入说明</h3>
            <ol>
              <li>请先下载Excel导入模板，按照模板格式填写商品信息</li>
              <li>必填字段：商品名称、商品货号、商品分类、品牌名称、商品价格、库存数量</li>
              <li>商品货号必须唯一，重复的货号将导致导入失败</li>
              <li>商品分类和品牌名称必须在系统中已存在</li>
              <li>价格和库存必须为有效数字</li>
              <li>单次最多导入1000条商品数据</li>
            </ol>
          </div>
          
          <div class="download-section">
            <el-button
              type="primary"
              icon="el-icon-download"
              :loading="downloading"
              @click="downloadTemplate"
              size="large"
            >
              {{ downloading ? '下载中...' : '下载Excel模板' }}
            </el-button>
            
            <div class="template-info">
              <p><i class="el-icon-info"></i>模板包含示例数据，请参考填写格式</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 第二步：上传文件 -->
      <div v-if="currentStep === 1" class="step-panel">
        <excel-uploader
          :uploading="uploading"
          :upload-progress="uploadProgress"
          :progress-text="progressText"
          :error-message="uploadError"
          @file-selected="handleFileSelected"
          @file-removed="handleFileRemoved"
          ref="uploader"
        ></excel-uploader>
        
        <div v-if="uploadedFile && !uploading" class="upload-actions">
          <el-button
            type="primary"
            :loading="validating"
            @click="validateFile"
          >
            {{ validating ? '验证中...' : '开始验证数据' }}
          </el-button>
        </div>
      </div>

      <!-- 第三步：数据预览 -->
      <div v-if="currentStep === 2" class="step-panel">
        <data-preview
          :preview-data="previewData"
          :error-rows="errorRows"
          :total-rows="totalRows"
          :valid-rows="validRows"
          :loading="previewLoading"
        ></data-preview>
      </div>

      <!-- 第四步：确认导入 -->
      <div v-if="currentStep === 3" class="step-panel">
        <div class="import-confirm">
          <div class="confirm-info">
            <el-alert
              :title="importResultTitle"
              :type="importResultType"
              :closable="false"
              show-icon
            >
              <div slot="default">
                <p v-if="importResult.successCount > 0">
                  成功导入 <strong>{{ importResult.successCount }}</strong> 条商品数据
                </p>
                <p v-if="importResult.failureCount > 0">
                  导入失败 <strong>{{ importResult.failureCount }}</strong> 条商品数据
                </p>
                <div v-if="importResult.details && importResult.details.length > 0" class="result-details">
                  <el-button type="text" size="small" @click="showResultDetail = !showResultDetail">
                    {{ showResultDetail ? '隐藏' : '查看' }}详细结果
                  </el-button>
                </div>
              </div>
            </el-alert>
          </div>
          
          <!-- 导入结果详情 -->
          <div v-if="showResultDetail && importResult.details" class="result-detail">
            <el-table
              :data="importResult.details"
              border
              size="small"
              max-height="300"
            >
              <el-table-column prop="row" label="行号" width="80" align="center"></el-table-column>
              <el-table-column prop="productSn" label="商品货号" width="120" align="center"></el-table-column>
              <el-table-column prop="name" label="商品名称" min-width="150"></el-table-column>
              <el-table-column prop="status" label="状态" width="100" align="center">
                <template slot-scope="scope">
                  <el-tag :type="scope.row.status === 'success' ? 'success' : 'danger'" size="small">
                    {{ scope.row.status === 'success' ? '成功' : '失败' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="message" label="备注" min-width="200"></el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      
      <el-button
        v-if="currentStep > 0 && currentStep < 3"
        @click="prevStep"
      >
        上一步
      </el-button>
      
      <el-button
        v-if="currentStep === 0"
        type="primary"
        @click="nextStep"
        :disabled="!templateDownloaded"
      >
        下一步
      </el-button>
      
      <el-button
        v-if="currentStep === 1"
        type="primary"
        @click="validateAndNext"
        :disabled="!uploadedFile || validating"
        :loading="validating"
      >
        验证并预览
      </el-button>
      
      <el-button
        v-if="currentStep === 2"
        type="primary"
        @click="confirmImport"
        :disabled="validRows === 0"
        :loading="importing"
      >
        {{ importing ? '导入中...' : `确认导入 (${validRows}条)` }}
      </el-button>
      
      <el-button
        v-if="currentStep === 3"
        type="primary"
        @click="handleClose"
      >
        完成
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import ExcelUploader from '@/components/Upload/ExcelUploader'
import DataPreview from '@/components/DataPreview'
import {
  downloadImportTemplate,
  uploadAndValidateExcel,
  confirmBulkImport
} from '@/api/product'
import {
  ImportExportErrorHandler,
  UserFeedbackManager,
  RetryManager,
  FileOperationUtils
} from '@/utils/importExportUtils'

export default {
  name: 'BulkImportDialog',
  components: {
    ExcelUploader,
    DataPreview
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
      currentStep: 0,
      
      // 工具实例
      feedbackManager: null,
      retryManager: new RetryManager(),
      
      // 模板下载
      downloading: false,
      templateDownloaded: false,
      
      // 文件上传
      uploadedFile: null,
      uploading: false,
      uploadProgress: 0,
      progressText: '正在上传...',
      uploadError: '',
      
      // 数据验证
      validating: false,
      previewLoading: false,
      
      // 预览数据
      previewData: [],
      errorRows: [],
      totalRows: 0,
      validRows: 0,
      importId: null,
      
      // 导入确认
      importing: false,
      importResult: {
        successCount: 0,
        failureCount: 0,
        details: []
      },
      showResultDetail: false
    }
  },
  
  created() {
    this.feedbackManager = new UserFeedbackManager(this)
  },
  
  computed: {
    importResultTitle() {
      if (this.importResult.failureCount === 0) {
        return '导入成功'
      } else if (this.importResult.successCount === 0) {
        return '导入失败'
      } else {
        return '部分导入成功'
      }
    },
    
    importResultType() {
      if (this.importResult.failureCount === 0) {
        return 'success'
      } else if (this.importResult.successCount === 0) {
        return 'error'
      } else {
        return 'warning'
      }
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val) {
        this.resetDialog()
      }
    },
    
    dialogVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    // 重置对话框状态
    resetDialog() {
      this.currentStep = 0
      this.templateDownloaded = false
      this.uploadedFile = null
      this.uploadError = ''
      this.previewData = []
      this.errorRows = []
      this.totalRows = 0
      this.validRows = 0
      this.importId = null
      this.importResult = {
        successCount: 0,
        failureCount: 0,
        details: []
      }
      this.showResultDetail = false
      
      // 清空上传器
      if (this.$refs.uploader) {
        this.$refs.uploader.clearFile()
      }
    },
    
    // 下载模板
    async downloadTemplate() {
      try {
        this.downloading = true
        
        const response = await this.retryManager.executeWithRetry(
          () => downloadImportTemplate(),
          '下载导入模板'
        )
        
        // 创建下载链接
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        
        FileOperationUtils.downloadFile(
          URL.createObjectURL(blob),
          '商品导入模板.xlsx'
        )
        
        this.templateDownloaded = true
        this.feedbackManager.showSuccess('模板下载成功')
      } catch (error) {
        const errorInfo = ImportExportErrorHandler.handleApiError(error, '下载模板')
        this.feedbackManager.showError(errorInfo.message)
      } finally {
        this.downloading = false
      }
    },
    
    // 文件选择处理
    handleFileSelected(file) {
      // 验证文件
      const validationError = ImportExportErrorHandler.handleFileValidationError(file)
      if (validationError) {
        this.uploadError = validationError.message
        this.feedbackManager.showError(validationError.message)
        return
      }
      
      this.uploadedFile = file
      this.uploadError = ''
    },
    
    // 文件移除处理
    handleFileRemoved() {
      this.uploadedFile = null
      this.uploadError = ''
    },
    
    // 验证文件
    async validateFile() {
      if (!this.uploadedFile) {
        this.feedbackManager.showWarning('请先选择要上传的文件')
        return
      }
      
      try {
        this.validating = true
        this.uploadError = ''
        
        const formData = new FormData()
        formData.append('file', this.uploadedFile)
        
        const response = await this.retryManager.executeWithRetry(
          () => uploadAndValidateExcel(formData),
          '文件验证'
        )
        
        if (response.data.success) {
          const data = response.data.data
          this.previewData = data.previewData || []
          this.errorRows = data.errorRows || []
          this.totalRows = data.totalRows || 0
          this.validRows = data.validRows || 0
          this.importId = data.importId
          
          // 生成错误报告
          const errorReport = ImportExportErrorHandler.generateErrorReport(this.errorRows)
          if (errorReport.hasErrors) {
            this.feedbackManager.showWarning(`文件验证完成，发现 ${errorReport.totalErrors} 个错误`)
          } else {
            this.feedbackManager.showSuccess('文件验证完成，数据格式正确')
          }
          
          this.nextStep()
        } else {
          this.uploadError = response.data.message || '文件验证失败'
          this.feedbackManager.showError(this.uploadError)
        }
      } catch (error) {
        const errorInfo = ImportExportErrorHandler.handleApiError(error, '文件验证')
        this.uploadError = errorInfo.message
        this.feedbackManager.showError(errorInfo.message)
      } finally {
        this.validating = false
      }
    },
    
    // 验证并下一步
    async validateAndNext() {
      await this.validateFile()
    },
    
    // 确认导入
    async confirmImport() {
      if (!this.importId) {
        this.$message.error('导入数据无效，请重新上传文件')
        return
      }
      
      try {
        this.importing = true
        
        const response = await confirmBulkImport({
          importId: this.importId,
          skipErrors: this.errorRows.length > 0
        })
        
        if (response.data.success) {
          const data = response.data.data
          this.importResult = {
            successCount: data.successCount || 0,
            failureCount: data.failureCount || 0,
            details: data.importResults || []
          }
          
          this.nextStep()
          this.$emit('import-success', this.importResult)
        } else {
          this.$message.error(response.data.message || '导入失败')
        }
      } catch (error) {
        console.error('导入失败:', error)
        this.$message.error('导入失败，请重试')
      } finally {
        this.importing = false
      }
    },
    
    // 下一步
    nextStep() {
      if (this.currentStep < 3) {
        this.currentStep++
      }
    },
    
    // 上一步
    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--
      }
    },
    
    // 关闭对话框
    handleClose() {
      if (this.uploading || this.validating || this.importing) {
        this.$message.warning('操作进行中，请稍候...')
        return
      }
      
      this.dialogVisible = false
    }
  }
}
</script>

<style scoped>
.import-dialog {
  .steps-container {
    margin-bottom: 30px;
  }
  
  .step-content {
    min-height: 400px;
    padding: 20px 0;
  }
  
  .step-panel {
    width: 100%;
  }
}

.template-download {
  text-align: center;
  
  .instruction {
    text-align: left;
    margin-bottom: 30px;
    padding: 20px;
    background-color: #f5f7fa;
    border-radius: 4px;
    
    h3 {
      color: #303133;
      margin-bottom: 15px;
    }
    
    ol {
      color: #606266;
      line-height: 1.8;
      
      li {
        margin-bottom: 8px;
      }
    }
  }
  
  .download-section {
    padding: 40px 0;
    
    .template-info {
      margin-top: 20px;
      
      p {
        color: #909399;
        font-size: 14px;
        
        i {
          margin-right: 5px;
          color: #409eff;
        }
      }
    }
  }
}

.upload-actions {
  text-align: center;
  margin-top: 20px;
}

.import-confirm {
  .confirm-info {
    margin-bottom: 20px;
  }
  
  .result-details {
    margin-top: 10px;
  }
  
  .result-detail {
    margin-top: 15px;
  }
}

.dialog-footer {
  text-align: right;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

/* 覆盖Element UI样式 */
.import-dialog >>> .el-dialog__body {
  padding: 20px 25px;
}

.import-dialog >>> .el-steps {
  .el-step__title {
    font-size: 14px;
  }
}
</style>