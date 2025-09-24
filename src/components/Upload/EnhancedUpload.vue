<template>
  <div class="enhanced-upload-container">
    <!-- 主上传区域 -->
    <div class="upload-area">
      <webp-upload
        v-model="uploadValue"
        :multiple="multiple"
        :auto-convert="autoConvert"
        :quality="webpQuality"
        :max-size="maxSize"
        :limit="limit"
        :list-type="listType"
        :use-oss="useOss"
        @success="handleUploadSuccess"
        @error="handleUploadError"
        @progress="handleProgress"
      >
        <template v-if="!multiple && showUploadButton">
          <el-button size="small" type="primary" :disabled="uploading">
            <i class="el-icon-upload"></i>
            {{ uploading ? '上传中...' : '选择图片' }}
          </el-button>
        </template>
      </webp-upload>
    </div>

    <!-- 图片预览网格 -->
    <div v-if="previewImages.length > 0" class="image-preview-grid">
      <div
        v-for="(image, index) in previewImages"
        :key="index"
        class="image-preview-item"
        @click="showImagePreview(image)"
      >
        <!-- 使用LazyImage组件显示预览图 -->
        <lazy-image
          :src="image.url"
          :webp-src="image.webpUrl"
          :enable-webp="enableWebP"
          :width="previewSize"
          :height="previewSize"
          :alt="image.name"
          class="preview-image"
          @load="onImageLoad"
          @error="onImageError"
        />
        
        <!-- 图片信息覆盖层 -->
        <div class="image-overlay">
          <div class="image-info">
            <span class="image-name">{{ image.name }}</span>
            <span v-if="image.size" class="image-size">{{ formatFileSize(image.size) }}</span>
          </div>
          
          <div class="image-actions">
            <el-button
              type="text"
              size="mini"
              icon="el-icon-view"
              @click.stop="showImagePreview(image)"
            >
              预览
            </el-button>
            <el-button
              type="text"
              size="mini"
              icon="el-icon-delete"
              @click.stop="removeImage(index)"
            >
              删除
            </el-button>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="image.loading" class="loading-overlay">
          <i class="el-icon-loading"></i>
          <span>{{ image.progress }}%</span>
        </div>

        <!-- WebP标识 -->
        <div v-if="image.isWebP" class="webp-badge">
          WebP
        </div>
      </div>
    </div>

    <!-- 上传统计信息 -->
    <div v-if="showStats" class="upload-stats">
      <el-row :gutter="16">
        <el-col :span="6">
          <div class="stat-item">
            <span class="stat-label">总数量</span>
            <span class="stat-value">{{ previewImages.length }}/{{ limit }}</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <span class="stat-label">总大小</span>
            <span class="stat-value">{{ formatFileSize(totalSize) }}</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <span class="stat-label">WebP数量</span>
            <span class="stat-value">{{ webpCount }}</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <span class="stat-label">节省空间</span>
            <span class="stat-value">{{ formatFileSize(savedBytes) }}</span>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 图片预览对话框 -->
    <el-dialog
      :visible.sync="previewDialogVisible"
      title="图片预览"
      width="80%"
      append-to-body
    >
      <div class="preview-dialog-content">
        <lazy-image
          v-if="currentPreviewImage"
          :src="currentPreviewImage.url"
          :webp-src="currentPreviewImage.webpUrl"
          :enable-webp="enableWebP"
          width="100%"
          :alt="currentPreviewImage.name"
        />
        
        <!-- 图片详细信息 -->
        <div class="preview-image-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="文件名">
              {{ currentPreviewImage?.name }}
            </el-descriptions-item>
            <el-descriptions-item label="文件大小">
              {{ formatFileSize(currentPreviewImage?.size) }}
            </el-descriptions-item>
            <el-descriptions-item label="格式">
              {{ currentPreviewImage?.type }}
            </el-descriptions-item>
            <el-descriptions-item label="WebP优化">
              {{ currentPreviewImage?.isWebP ? '已启用' : '未启用' }}
            </el-descriptions-item>
            <el-descriptions-item v-if="currentPreviewImage?.dimensions" label="尺寸">
              {{ currentPreviewImage.dimensions.width }} × {{ currentPreviewImage.dimensions.height }}
            </el-descriptions-item>
            <el-descriptions-item v-if="currentPreviewImage?.uploadTime" label="上传时间">
              {{ formatDate(currentPreviewImage.uploadTime) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import WebPUpload from '@/components/WebPUpload'
import LazyImage from '@/components/LazyImage'
import { mapGetters } from 'vuex'

export default {
  name: 'EnhancedUpload',
  components: {
    WebPUpload,
    LazyImage
  },
  props: {
    // 上传值
    value: {
      type: [String, Array],
      default: () => []
    },
    // 是否多选
    multiple: {
      type: Boolean,
      default: false
    },
    // 最大上传数量
    limit: {
      type: Number,
      default: 5
    },
    // 最大文件大小(MB)
    maxSize: {
      type: Number,
      default: 10
    },
    // 是否自动转换WebP
    autoConvert: {
      type: Boolean,
      default: true
    },
    // WebP质量
    webpQuality: {
      type: Number,
      default: 80
    },
    // 预览图尺寸
    previewSize: {
      type: [String, Number],
      default: 150
    },
    // 列表类型
    listType: {
      type: String,
      default: 'picture-card'
    },
    // 是否使用OSS
    useOss: {
      type: Boolean,
      default: false
    },
    // 是否启用WebP
    enableWebP: {
      type: Boolean,
      default: true
    },
    // 是否显示统计信息
    showStats: {
      type: Boolean,
      default: true
    },
    // 是否显示上传按钮
    showUploadButton: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      uploadValue: this.multiple ? [] : '',
      previewImages: [],
      uploading: false,
      previewDialogVisible: false,
      currentPreviewImage: null,
      uploadProgress: {}
    }
  },
  computed: {
    ...mapGetters('imageOptimization', [
      'isWebPSupported',
      'isWebPEnabled'
    ]),
    
    // WebP图片数量
    webpCount() {
      return this.previewImages.filter(img => img.isWebP).length
    },
    
    // 总文件大小
    totalSize() {
      return this.previewImages.reduce((total, img) => total + (img.size || 0), 0)
    },
    
    // 节省的字节数
    savedBytes() {
      return this.previewImages.reduce((total, img) => {
        return total + (img.savedBytes || 0)
      }, 0)
    }
  },
  watch: {
    value: {
      handler(newValue) {
        this.initPreviewImages(newValue)
      },
      immediate: true
    },
    
    uploadValue(newValue) {
      this.$emit('input', newValue)
    }
  },
  methods: {
    /**
     * 初始化预览图片
     */
    initPreviewImages(value) {
      if (!value) {
        this.previewImages = []
        return
      }

      const urls = Array.isArray(value) ? value : [value]
      this.previewImages = urls.map((url, index) => ({
        id: `existing_${index}`,
        name: this.getFileNameFromUrl(url),
        url: url,
        webpUrl: this.getWebPUrl(url),
        isWebP: this.isWebPUrl(url),
        size: 0,
        type: this.getFileTypeFromUrl(url),
        loading: false,
        uploadTime: null
      }))
    },

    /**
     * 从URL获取文件名
     */
    getFileNameFromUrl(url) {
      if (!url) return ''
      return url.substring(url.lastIndexOf('/') + 1)
    },

    /**
     * 从URL获取文件类型
     */
    getFileTypeFromUrl(url) {
      if (!url) return ''
      const extension = url.substring(url.lastIndexOf('.') + 1).toLowerCase()
      return `image/${extension === 'jpg' ? 'jpeg' : extension}`
    },

    /**
     * 获取WebP版本的URL
     */
    getWebPUrl(url) {
      if (this.isWebPUrl(url)) return url
      return url.replace(/\.(jpg|jpeg|png)(\?.*)?$/i, '.webp$2')
    },

    /**
     * 判断是否为WebP URL
     */
    isWebPUrl(url) {
      return /\.webp(\?.*)?$/i.test(url)
    },

    /**
     * 处理上传成功
     */
    handleUploadSuccess(fileInfo, fileList) {
      const imageInfo = {
        id: `upload_${Date.now()}`,
        name: fileInfo.name,
        url: fileInfo.url,
        webpUrl: fileInfo.webpUrl || fileInfo.url,
        isWebP: this.isWebPUrl(fileInfo.url),
        size: fileInfo.size,
        type: fileInfo.type,
        loading: false,
        uploadTime: Date.now(),
        savedBytes: fileInfo.savedBytes || 0
      }

      if (this.multiple) {
        this.previewImages.push(imageInfo)
      } else {
        this.previewImages = [imageInfo]
      }

      this.uploading = false
      this.updateUploadValue()

      this.$emit('success', imageInfo, this.previewImages)
    },

    /**
     * 处理上传错误
     */
    handleUploadError(error, file, fileList) {
      this.uploading = false
      this.$emit('error', error, file, fileList)
    },

    /**
     * 处理上传进度
     */
    handleProgress(event, file, fileList) {
      this.uploading = true
      const progress = Math.round(event.percent)
      
      // 更新对应图片的进度
      const imageIndex = this.previewImages.findIndex(img => 
        img.name === file.name && img.loading
      )
      
      if (imageIndex > -1) {
        this.$set(this.previewImages[imageIndex], 'progress', progress)
      }

      this.$emit('progress', event, file, fileList)
    },

    /**
     * 移除图片
     */
    removeImage(index) {
      this.previewImages.splice(index, 1)
      this.updateUploadValue()
      this.$emit('remove', index, this.previewImages)
    },

    /**
     * 显示图片预览
     */
    showImagePreview(image) {
      this.currentPreviewImage = image
      this.previewDialogVisible = true
    },

    /**
     * 更新上传值
     */
    updateUploadValue() {
      const urls = this.previewImages.map(img => img.url)
      this.uploadValue = this.multiple ? urls : (urls[0] || '')
    },

    /**
     * 图片加载完成
     */
    onImageLoad(imageInfo) {
      // 可以在这里添加图片加载成功的处理逻辑
      this.$emit('image-load', imageInfo)
    },

    /**
     * 图片加载错误
     */
    onImageError(error) {
      // 可以在这里添加图片加载失败的处理逻辑
      this.$emit('image-error', error)
    },

    /**
     * 格式化文件大小
     */
    formatFileSize(bytes) {
      if (!bytes) return '0 B'
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(1024))
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
    },

    /**
     * 格式化日期
     */
    formatDate(timestamp) {
      if (!timestamp) return ''
      return new Date(timestamp).toLocaleString()
    },

    /**
     * 清空所有图片
     */
    clearAll() {
      this.previewImages = []
      this.updateUploadValue()
      this.$emit('clear')
    },

    /**
     * 获取图片列表
     */
    getImageList() {
      return this.previewImages
    }
  }
}
</script>

<style scoped>
.enhanced-upload-container {
  width: 100%;
}

.upload-area {
  margin-bottom: 20px;
}

.image-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.image-preview-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.image-preview-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: 12px;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.image-preview-item:hover .image-overlay {
  transform: translateY(0);
}

.image-info {
  margin-bottom: 8px;
}

.image-name {
  display: block;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-size {
  font-size: 12px;
  opacity: 0.8;
}

.image-actions {
  display: flex;
  gap: 8px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.loading-overlay i {
  font-size: 24px;
  margin-bottom: 8px;
}

.webp-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #67c23a;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
}

.upload-stats {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  margin-top: 20px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.preview-dialog-content {
  text-align: center;
}

.preview-image-info {
  margin-top: 20px;
  text-align: left;
}

@media screen and (max-width: 768px) {
  .image-preview-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
  
  .upload-stats .el-col {
    margin-bottom: 12px;
  }
}
</style>