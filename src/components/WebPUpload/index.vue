<template>
  <div class="webp-upload-container">
    <el-upload
      :action="uploadUrl"
      :data="uploadData"
      :headers="uploadHeaders"
      :multiple="multiple"
      :file-list="fileList"
      :before-upload="beforeUpload"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadError"
      :on-remove="handleRemove"
      :on-preview="handlePreview"
      :on-progress="handleProgress"
      :limit="limit"
      :on-exceed="handleExceed"
      :accept="acceptTypes"
      :list-type="listType"
      :show-file-list="showFileList"
      :disabled="disabled"
    >
      <slot>
        <el-button v-if="listType !== 'picture-card'" size="small" type="primary" :disabled="disabled">
          <i class="el-icon-upload"></i> 选择图片
        </el-button>
        <i v-else class="el-icon-plus"></i>
      </slot>
      <div slot="tip" class="el-upload__tip">
        <div>支持格式：{{ acceptFormats }}</div>
        <div>文件大小：不超过{{ maxSize }}MB</div>
        <div v-if="autoConvert">自动转换为WebP格式，压缩质量：{{ quality }}%</div>
      </div>
    </el-upload>

    <!-- 预览对话框 -->
    <el-dialog :visible.sync="previewVisible" append-to-body>
      <img width="100%" :src="previewImageUrl" alt="预览图片">
    </el-dialog>

    <!-- 转换进度对话框 -->
    <el-dialog
      title="图片处理中"
      :visible.sync="convertDialogVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="400px"
    >
      <div class="convert-progress">
        <el-progress
          :percentage="convertProgress"
          :status="convertStatus"
        ></el-progress>
        <p class="convert-info">{{ convertInfo }}</p>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelConvert" :disabled="convertProgress === 100">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { policy } from '@/api/oss'
import { webpManager } from '@/utils/webpManager'

export default {
  name: 'WebPUpload',
  props: {
    // 上传文件值
    value: {
      type: [String, Array],
      default: () => []
    },
    // 是否多选
    multiple: {
      type: Boolean,
      default: false
    },
    // 是否自动转换WebP
    autoConvert: {
      type: Boolean,
      default: true
    },
    // WebP压缩质量
    quality: {
      type: Number,
      default: 80,
      validator: (value) => value >= 0 && value <= 100
    },
    // 最大文件大小(MB)
    maxSize: {
      type: Number,
      default: 10
    },
    // 最大上传数量
    limit: {
      type: Number,
      default: 5
    },
    // 接受的文件类型
    accept: {
      type: String,
      default: 'image/jpeg,image/png,image/webp'
    },
    // 列表类型
    listType: {
      type: String,
      default: 'picture-card'
    },
    // 是否显示文件列表
    showFileList: {
      type: Boolean,
      default: true
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 使用OSS还是MinIO
    useOss: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      fileList: [],
      previewVisible: false,
      previewImageUrl: '',
      convertDialogVisible: false,
      convertProgress: 0,
      convertStatus: '',
      convertInfo: '',
      convertCancelled: false,
      dataObj: {
        policy: '',
        signature: '',
        key: '',
        ossaccessKeyId: '',
        dir: '',
        host: ''
      },
      ossUploadUrl: 'http://macro-oss.oss-cn-shenzhen.aliyuncs.com',
      minioUploadUrl: 'http://localhost:8080/minio/upload'
    }
  },
  computed: {
    uploadUrl() {
      return this.useOss ? this.ossUploadUrl : this.minioUploadUrl
    },
    uploadData() {
      return this.useOss ? this.dataObj : null
    },
    uploadHeaders() {
      return {}
    },
    acceptTypes() {
      return this.accept
    },
    acceptFormats() {
      return this.accept.split(',').map(type => 
        type.replace('image/', '').toUpperCase()
      ).join('、')
    }
  },
  watch: {
    value: {
      handler(newValue) {
        this.initFileList(newValue)
      },
      immediate: true
    }
  },
  methods: {
    initFileList(value) {
      if (!value) {
        this.fileList = []
        return
      }

      if (typeof value === 'string') {
        this.fileList = value ? [{ name: this.getFileName(value), url: value }] : []
      } else if (Array.isArray(value)) {
        this.fileList = value.map(url => ({
          name: this.getFileName(url),
          url: url
        }))
      }
    },

    getFileName(url) {
      if (!url) return ''
      return url.substring(url.lastIndexOf('/') + 1)
    },

    async beforeUpload(file) {
      // 文件类型验证
      if (!this.validateFileType(file)) {
        this.$message.error('不支持的文件格式')
        return false
      }

      // 文件大小验证
      if (!this.validateFileSize(file)) {
        this.$message.error(`文件大小不能超过${this.maxSize}MB`)
        return false
      }

      // 获取上传策略（如果使用OSS）
      if (this.useOss) {
        try {
          await this.getUploadPolicy()
        } catch (error) {
          this.$message.error('获取上传策略失败')
          return false
        }
      }

      // WebP转换处理
      if (this.autoConvert && this.shouldConvertToWebP(file)) {
        try {
          const convertedFile = await this.convertToWebP(file)
          return convertedFile
        } catch (error) {
          this.$message.error('图片转换失败')
          return false
        }
      }

      return true
    },

    validateFileType(file) {
      const acceptTypes = this.accept.split(',')
      return acceptTypes.some(type => {
        if (type.includes('*')) {
          const mainType = type.split('/')[0]
          return file.type.startsWith(mainType)
        }
        return file.type === type
      })
    },

    validateFileSize(file) {
      return file.size / 1024 / 1024 < this.maxSize
    },

    shouldConvertToWebP(file) {
      // 只对JPEG和PNG格式进行WebP转换
      return ['image/jpeg', 'image/png'].includes(file.type)
    },

    async convertToWebP(file) {
      return new Promise((resolve, reject) => {
        this.convertDialogVisible = true
        this.convertProgress = 0
        this.convertStatus = ''
        this.convertInfo = '准备转换图片...'
        this.convertCancelled = false

        const reader = new FileReader()
        reader.onload = (e) => {
          const img = new Image()
          img.onload = () => {
            try {
              this.convertInfo = '正在转换为WebP格式...'
              this.convertProgress = 30

              const canvas = document.createElement('canvas')
              const ctx = canvas.getContext('2d')
              
              canvas.width = img.width
              canvas.height = img.height
              ctx.drawImage(img, 0, 0)

              this.convertProgress = 60
              this.convertInfo = '正在压缩图片...'

              canvas.toBlob(
                (blob) => {
                  if (this.convertCancelled) {
                    reject(new Error('转换已取消'))
                    return
                  }

                  this.convertProgress = 100
                  this.convertStatus = 'success'
                  this.convertInfo = '转换完成'

                  // 创建新的File对象
                  const webpFile = new File(
                    [blob],
                    file.name.replace(/\.(jpg|jpeg|png)$/i, '.webp'),
                    { type: 'image/webp' }
                  )

                  setTimeout(() => {
                    this.convertDialogVisible = false
                    resolve(webpFile)
                  }, 1000)
                },
                'image/webp',
                this.quality / 100
              )
            } catch (error) {
              this.convertStatus = 'exception'
              this.convertInfo = '转换失败'
              setTimeout(() => {
                this.convertDialogVisible = false
                reject(error)
              }, 1000)
            }
          }
          img.src = e.target.result
        }
        reader.readAsDataURL(file)
      })
    },

    cancelConvert() {
      this.convertCancelled = true
      this.convertDialogVisible = false
    },

    async getUploadPolicy() {
      const response = await policy()
      this.dataObj = {
        policy: response.data.policy,
        signature: response.data.signature,
        ossaccessKeyId: response.data.accessKeyId,
        key: response.data.dir + '/${filename}',
        dir: response.data.dir,
        host: response.data.host
      }
    },

    handleUploadSuccess(response, file, fileList) {
      let url = ''
      
      if (this.useOss) {
        url = this.dataObj.host + '/' + this.dataObj.dir + '/' + file.name
      } else {
        url = response.data.url
      }

      const fileInfo = {
        name: file.name,
        url: url,
        size: file.size,
        type: file.raw ? file.raw.type : file.type
      }

      this.fileList.push(fileInfo)
      this.emitInput()

      this.$emit('success', fileInfo, fileList)
      this.$message.success('上传成功')
    },

    handleUploadError(error, file, fileList) {
      this.$emit('error', error, file, fileList)
      this.$message.error('上传失败')
    },

    handleRemove(file, fileList) {
      this.fileList = fileList
      this.emitInput()
      this.$emit('remove', file, fileList)
    },

    handlePreview(file) {
      this.previewImageUrl = file.url
      this.previewVisible = true
      this.$emit('preview', file)
    },

    handleProgress(event, file, fileList) {
      this.$emit('progress', event, file, fileList)
    },

    handleExceed(files, fileList) {
      this.$message.warning(`最多只能上传${this.limit}张图片`)
      this.$emit('exceed', files, fileList)
    },

    emitInput() {
      if (this.multiple) {
        this.$emit('input', this.fileList.map(file => file.url))
      } else {
        this.$emit('input', this.fileList.length > 0 ? this.fileList[0].url : '')
      }
    },

    // 清空文件列表
    clearFiles() {
      this.fileList = []
      this.emitInput()
    },

    // 获取文件列表
    getFileList() {
      return this.fileList
    }
  }
}
</script>

<style scoped>
.webp-upload-container {
  width: 100%;
}

.convert-progress {
  text-align: center;
  padding: 20px 0;
}

.convert-info {
  margin-top: 15px;
  color: #666;
  font-size: 14px;
}

.el-upload__tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.el-upload__tip div {
  line-height: 1.5;
}
</style>