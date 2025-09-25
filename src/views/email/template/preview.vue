<template>
  <div class="app-container">
    <el-card v-loading="pageLoading">
      <div slot="header">
        <span>预览邮件模板</span>
        <div style="float: right">
          <el-button @click="goBack">返回</el-button>
          <el-button type="primary" @click="editTemplate">编辑模板</el-button>
        </div>
      </div>
      
      <div class="preview-container">
        <!-- 模板基本信息 -->
        <div class="template-info">
          <el-descriptions title="模板信息" :column="2" border>
            <el-descriptions-item label="模板ID">{{ template.id }}</el-descriptions-item>
            <el-descriptions-item label="模板名称">{{ template.name }}</el-descriptions-item>
            <el-descriptions-item label="邮件主题">{{ template.subject }}</el-descriptions-item>
            <el-descriptions-item label="模板类型">
              <el-tag :type="getTypeTagType(template.type)">
                {{ getTypeName(template.type) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="template.status === 1 ? 'success' : 'danger'">
                {{ template.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDate(template.createTime) }}</el-descriptions-item>
          </el-descriptions>
        </div>
        
        <!-- 模板变量 -->
        <div class="variables-section" v-if="template.variables && template.variables.length > 0">
          <h3>模板变量</h3>
          <el-table :data="template.variables" border style="width: 100%">
            <el-table-column prop="name" label="变量名" width="200"></el-table-column>
            <el-table-column prop="description" label="描述"></el-table-column>
            <el-table-column label="示例值" width="200">
              <template slot-scope="scope">
                <el-input 
                  v-model="variableValues[scope.row.name]" 
                  size="small"
                  placeholder="输入示例值"
                  @input="updatePreview">
                </el-input>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <!-- 预览控制 -->
        <div class="preview-controls">
          <h3>邮件预览</h3>
          <div class="controls-bar">
            <el-button-group>
              <el-button 
                :type="previewMode === 'html' ? 'primary' : 'default'"
                @click="previewMode = 'html'">
                HTML预览
              </el-button>
              <el-button 
                :type="previewMode === 'source' ? 'primary' : 'default'"
                @click="previewMode = 'source'">
                源码查看
              </el-button>
            </el-button-group>
            <el-button 
              type="success" 
              @click="generatePreview"
              :loading="previewLoading">
              刷新预览
            </el-button>
          </div>
        </div>
        
        <!-- 邮件预览内容 -->
        <div class="preview-content">
          <!-- 邮件主题预览 -->
          <div class="subject-preview">
            <label>邮件主题：</label>
            <span class="subject-text">{{ processedSubject }}</span>
          </div>
          
          <!-- HTML预览 -->
          <div v-if="previewMode === 'html'" class="html-preview">
            <div class="email-frame">
              <iframe 
                ref="previewFrame"
                :srcdoc="processedContent"
                frameborder="0"
                style="width: 100%; min-height: 500px;">
              </iframe>
            </div>
          </div>
          
          <!-- 源码查看 -->
          <div v-if="previewMode === 'source'" class="source-preview">
            <pre><code>{{ processedContent }}</code></pre>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { previewTemplate } from '@/api/email'

export default {
  name: 'PreviewEmailTemplate',
  data() {
    return {
      pageLoading: true,
      previewLoading: false,
      templateId: null,
      template: {
        id: null,
        name: '',
        subject: '',
        type: '',
        content: '',
        variables: [],
        status: 1,
        createTime: null
      },
      variableValues: {},
      previewMode: 'html',
      processedContent: '',
      processedSubject: ''
    }
  },
  computed: {
    ...mapState('email', {
      templateTypes: state => state.templateTypes,
      currentTemplate: state => state.currentTemplate
    })
  },
  created() {
    this.templateId = this.$route.params.id
    this.getTemplateDetail()
  },
  methods: {
    ...mapActions('email', [
      'getTemplate'
    ]),
    async getTemplateDetail() {
      try {
        this.pageLoading = true
        await this.getTemplate(this.templateId)
        if (this.currentTemplate) {
          this.template = { ...this.currentTemplate }
          // 初始化变量值
          if (this.template.variables) {
            this.template.variables.forEach(variable => {
              this.$set(this.variableValues, variable.name, this.getDefaultValue(variable.name))
            })
          }
          this.updatePreview()
        }
      } catch (error) {
        this.$message.error('获取模板详情失败：' + error.message)
        this.goBack()
      } finally {
        this.pageLoading = false
      }
    },
    async generatePreview() {
      try {
        this.previewLoading = true
        const response = await previewTemplate({
          content: this.template.content,
          subject: this.template.subject,
          variables: this.variableValues
        })
        this.processedContent = response.data.content
        this.processedSubject = response.data.subject
      } catch (error) {
        this.$message.error('生成预览失败：' + error.message)
      } finally {
        this.previewLoading = false
      }
    },
    updatePreview() {
      // 简单的变量替换预览
      let content = this.template.content || ''
      let subject = this.template.subject || ''
      
      Object.keys(this.variableValues).forEach(key => {
        const value = this.variableValues[key] || `{${key}}`
        const regex = new RegExp(`\\{\\{${key}\\}\\}|\\{${key}\\}`, 'g')
        content = content.replace(regex, value)
        subject = subject.replace(regex, value)
      })
      
      this.processedContent = content
      this.processedSubject = subject
    },
    getDefaultValue(variableName) {
      // 根据变量名生成默认示例值
      const defaults = {
        'userName': '张三',
        'userEmail': 'zhangsan@example.com',
        'orderNumber': 'ORD202301001',
        'productName': '示例商品',
        'amount': '199.00',
        'date': new Date().toLocaleDateString('zh-CN'),
        'time': new Date().toLocaleString('zh-CN'),
        'companyName': '示例公司'
      }
      return defaults[variableName] || `示例${variableName}`
    },
    goBack() {
      this.$router.push({ path: '/email/template' })
    },
    editTemplate() {
      this.$router.push({ path: '/email/template/edit/' + this.templateId })
    },
    getTypeName(type) {
      const typeObj = this.templateTypes.find(item => item.value === type)
      return typeObj ? typeObj.label : type
    },
    getTypeTagType(type) {
      const typeMap = {
        'order': 'primary',
        'promotion': 'success', 
        'notification': 'info',
        'welcome': 'warning',
        'password': 'danger'
      }
      return typeMap[type] || 'info'
    },
    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      return d.toLocaleString('zh-CN')
    }
  }
}
</script>

<style scoped>
.preview-container {
  max-width: 1000px;
}

.template-info {
  margin-bottom: 20px;
}

.variables-section {
  margin-bottom: 20px;
}

.variables-section h3 {
  margin-bottom: 10px;
  color: #303133;
}

.preview-controls {
  margin-bottom: 20px;
}

.preview-controls h3 {
  margin-bottom: 10px;
  color: #303133;
}

.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-content {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.subject-preview {
  padding: 15px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
}

.subject-preview label {
  font-weight: bold;
  color: #606266;
  margin-right: 10px;
}

.subject-text {
  font-size: 16px;
  color: #303133;
}

.html-preview {
  background-color: #fff;
}

.email-frame {
  width: 100%;
  min-height: 500px;
}

.source-preview {
  padding: 20px;
  background-color: #f5f5f5;
  max-height: 600px;
  overflow-y: auto;
}

.source-preview pre {
  margin: 0;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>