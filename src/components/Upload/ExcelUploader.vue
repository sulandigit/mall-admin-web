<template>
  <div class="excel-uploader">
    <el-upload
      class="upload-excel"
      :action="dummyAction"
      :before-upload="handleBeforeUpload"
      :on-change="handleFileChange"
      :auto-upload="false"
      :show-file-list="false"
      accept=".xlsx,.xls"
      drag
    >
      <div class="upload-area">
        <i class="el-icon-upload"></i>
        <div class="upload-text">
          <p>将Excel文件拖拽到此处，或<em>点击选择文件</em></p>
          <div class="upload-tip">
            <p>支持 .xlsx 和 .xls 格式，文件大小不超过 10MB</p>
          </div>
        </div>
      </div>
    </el-upload>
    
    <!-- 文件信息展示 -->
    <div v-if="uploadedFile" class="file-info">
      <div class="file-item">
        <i class="el-icon-document"></i>
        <span class="file-name">{{ uploadedFile.name }}</span>
        <span class="file-size">{{ formatFileSize(uploadedFile.size) }}</span>
        <el-button 
          type="text" 
          icon="el-icon-delete" 
          @click="removeFile"
          class="remove-btn"
        >
          删除
        </el-button>
      </div>
    </div>

    <!-- 上传进度 -->
    <div v-if="uploading" class="upload-progress">
      <el-progress 
        :percentage="uploadProgress" 
        :status="uploadProgress === 100 ? 'success' : ''"
      ></el-progress>
      <p class="progress-text">{{ progressText }}</p>
    </div>

    <!-- 错误提示 -->
    <el-alert
      v-if="errorMessage"
      :title="errorMessage"
      type="error"
      :closable="false"
      class="error-alert"
    ></el-alert>
  </div>
</template>

<script>
export default {
  name: 'ExcelUploader',
  props: {
    // 是否正在上传
    uploading: {
      type: Boolean,
      default: false
    },
    // 上传进度
    uploadProgress: {
      type: Number,
      default: 0
    },
    // 进度文本
    progressText: {
      type: String,
      default: '正在上传...'
    },
    // 错误信息
    errorMessage: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      uploadedFile: null,
      dummyAction: '#' // 虚拟上传地址，实际通过事件处理
    }
  },
  methods: {
    handleBeforeUpload(file) {
      // 文件类型检查
      const isExcel = this.checkFileType(file)
      if (!isExcel) {
        this.$message.error('只能上传 Excel 格式的文件！')
        return false
      }

      // 文件大小检查 (10MB)
      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        this.$message.error('文件大小不能超过 10MB！')
        return false
      }

      return false // 阻止自动上传
    },

    handleFileChange(file, fileList) {
      if (file.status === 'ready') {
        // 文件选择成功，但还未上传
        this.uploadedFile = file.raw
        this.$emit('file-selected', file.raw)
      }
    },

    checkFileType(file) {
      const fileName = file.name
      const fileExtension = fileName.split('.').pop().toLowerCase()
      return ['xlsx', 'xls'].includes(fileExtension)
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    removeFile() {
      this.uploadedFile = null
      this.$emit('file-removed')
    },

    // 清空文件（外部调用）
    clearFile() {
      this.uploadedFile = null
    }
  }
}
</script>

<style scoped>
.excel-uploader {
  width: 100%;
}

.upload-area {
  text-align: center;
  padding: 40px 20px;
}

.upload-area i {
  font-size: 50px;
  color: #c0c4cc;
  margin-bottom: 20px;
}

.upload-text p {
  color: #606266;
  margin: 10px 0;
  font-size: 14px;
}

.upload-text em {
  color: #409eff;
  font-style: normal;
}

.upload-tip {
  margin-top: 15px;
}

.upload-tip p {
  color: #909399;
  font-size: 12px;
  margin: 5px 0;
}

.file-info {
  margin-top: 15px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-item i {
  color: #67c23a;
  font-size: 16px;
}

.file-name {
  flex: 1;
  color: #303133;
  font-size: 14px;
}

.file-size {
  color: #909399;
  font-size: 12px;
}

.remove-btn {
  color: #f56c6c;
  padding: 0;
}

.upload-progress {
  margin-top: 15px;
}

.progress-text {
  text-align: center;
  color: #606266;
  font-size: 14px;
  margin: 10px 0 0 0;
}

.error-alert {
  margin-top: 15px;
}

/* 拖拽状态样式 */
.upload-excel >>> .el-upload-dragger:hover {
  border-color: #409eff;
}

.upload-excel >>> .el-upload-dragger.is-dragover {
  background-color: rgba(64, 158, 255, 0.06);
  border: 2px dashed #409eff;
}
</style>