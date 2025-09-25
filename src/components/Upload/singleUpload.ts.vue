<template> 
  <div>
    <el-upload
      :action="useOss ? ossUploadUrl : minioUploadUrl"
      :data="useOss ? dataObj : null"
      list-type="picture"
      :multiple="false" 
      :show-file-list="showFileList"
      :file-list="fileList"
      :before-upload="beforeUpload"
      :on-remove="handleRemove"
      :on-success="handleUploadSuccess"
      :on-preview="handlePreview">
      <el-button size="small" type="primary">点击上传</el-button>
      <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过10MB</div>
    </el-upload>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="fileList[0].url" alt="">
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { policy } from '@/api/oss'
import { UploadProps } from '@/types/components'

// 上传文件接口
interface FileItem {
  name: string
  url: string
}

// OSS 上传数据接口
interface OssUploadData {
  policy: string
  signature: string
  key: string
  ossaccessKeyId: string
  dir: string
  host: string
}

// 上传响应接口
interface UploadResponse {
  data: {
    url: string
  }
}

@Component({
  name: 'SingleUpload'
})
export default class SingleUpload extends Vue implements UploadProps {
  @Prop({ type: String, default: '' })
  value!: string

  // 数据属性
  private dataObj: OssUploadData = {
    policy: '',
    signature: '',
    key: '',
    ossaccessKeyId: '',
    dir: '',
    host: ''
  }

  private dialogVisible: boolean = false
  private useOss: boolean = false // 使用oss->true;使用MinIO->false
  private ossUploadUrl: string = 'http://macro-oss.oss-cn-shenzhen.aliyuncs.com'
  private minioUploadUrl: string = 'http://localhost:8080/minio/upload'

  // 计算属性
  get imageUrl(): string {
    return this.value
  }

  get imageName(): string | null {
    if (this.value != null && this.value !== '') {
      return this.value.substr(this.value.lastIndexOf('/') + 1)
    } else {
      return null
    }
  }

  get fileList(): FileItem[] {
    return [{
      name: this.imageName || '',
      url: this.imageUrl
    }]
  }

  get showFileList(): boolean {
    return this.value !== null && this.value !== '' && this.value !== undefined
  }

  // 方法
  private emitInput(val: string): void {
    this.$emit('input', val)
  }

  private handleRemove(file: File, fileList: File[]): void {
    this.emitInput('')
  }

  private handlePreview(file: File): void {
    this.dialogVisible = true
  }

  private beforeUpload(file: File): boolean | Promise<boolean> {
    if (!this.useOss) {
      // 不使用oss不需要获取策略
      return true
    }
    
    return new Promise((resolve, reject) => {
      policy().then(response => {
        this.dataObj.policy = response.data.policy
        this.dataObj.signature = response.data.signature
        this.dataObj.ossaccessKeyId = response.data.accessKeyId
        this.dataObj.key = response.data.dir + '/${filename}'
        this.dataObj.dir = response.data.dir
        this.dataObj.host = response.data.host
        resolve(true)
      }).catch(err => {
        console.log(err)
        reject(false)
      })
    })
  }

  private handleUploadSuccess(res: UploadResponse, file: File): void {
    this.fileList.pop()
    let url = this.dataObj.host + '/' + this.dataObj.dir + '/' + file.name
    if (!this.useOss) {
      // 不使用oss直接获取图片路径
      url = res.data.url
    }
    this.fileList.push({ name: file.name, url: url })
    this.emitInput(this.fileList[0].url)
  }
}
</script>

<style scoped>
/* 组件样式 */
</style>