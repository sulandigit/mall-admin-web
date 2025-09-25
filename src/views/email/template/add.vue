<template>
  <div class="app-container">
    <el-card>
      <div slot="header">
        <span>添加邮件模板</span>
        <div style="float: right">
          <el-button @click="goBack">返回</el-button>
          <el-button type="primary" @click="onSubmit" :loading="submitLoading">保存</el-button>
        </div>
      </div>
      
      <el-form 
        :model="template" 
        :rules="rules" 
        ref="templateForm" 
        label-width="140px"
        class="template-form">
        
        <el-form-item label="模板名称" prop="name">
          <el-input 
            v-model="template.name" 
            maxlength="50"
            show-word-limit
            placeholder="请输入模板名称">
          </el-input>
        </el-form-item>
        
        <el-form-item label="邮件主题" prop="subject">
          <el-input 
            v-model="template.subject" 
            maxlength="100"
            show-word-limit
            placeholder="请输入邮件主题">
          </el-input>
        </el-form-item>
        
        <el-form-item label="模板类型" prop="type">
          <el-select v-model="template.type" placeholder="请选择模板类型" style="width: 100%">
            <el-option
              v-for="type in templateTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value">
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="邮件内容" prop="content">
          <div class="editor-container">
            <tinymce-editor
              v-model="template.content"
              :height="400"
              @change="onContentChange">
            </tinymce-editor>
          </div>
        </el-form-item>
        
        <el-form-item label="模板变量">
          <div class="variables-container">
            <el-tag
              v-for="(variable, index) in template.variables"
              :key="index"
              closable
              @close="removeVariable(index)"
              style="margin-right: 10px; margin-bottom: 10px;">
              {{ variable.name }} - {{ variable.description }}
            </el-tag>
            <el-button 
              v-if="newVariable.show" 
              size="small" 
              @click="addVariable">
              + 新变量
            </el-button>
          </div>
          
          <div v-if="newVariable.adding" style="margin-top: 10px;">
            <el-row :gutter="10">
              <el-col :span="8">
                <el-input 
                  v-model="newVariable.name" 
                  placeholder="变量名" 
                  size="small">
                </el-input>
              </el-col>
              <el-col :span="10">
                <el-input 
                  v-model="newVariable.description" 
                  placeholder="变量描述" 
                  size="small">
                </el-input>
              </el-col>
              <el-col :span="6">
                <el-button size="small" type="primary" @click="confirmAddVariable">确定</el-button>
                <el-button size="small" @click="cancelAddVariable">取消</el-button>
              </el-col>
            </el-row>
          </div>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-radio-group v-model="template.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input 
            v-model="template.remark"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
            placeholder="请输入备注信息">
          </el-input>
        </el-form-item>
        
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import TinymceEditor from '@/components/Tinymce'

export default {
  name: 'AddEmailTemplate',
  components: {
    TinymceEditor
  },
  data() {
    return {
      submitLoading: false,
      template: {
        name: '',
        subject: '',
        type: '',
        content: '',
        variables: [],
        status: 1,
        remark: ''
      },
      newVariable: {
        show: true,
        adding: false,
        name: '',
        description: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入模板名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        subject: [
          { required: true, message: '请输入邮件主题', trigger: 'blur' },
          { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择模板类型', trigger: 'change' }
        ],
        content: [
          { required: true, message: '请输入邮件内容', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapState('email', {
      templateTypes: state => state.templateTypes
    })
  },
  methods: {
    ...mapActions('email', [
      'createTemplate'
    ]),
    async onSubmit() {
      try {
        await this.$refs.templateForm.validate()
        
        this.submitLoading = true
        await this.createTemplate(this.template)
        
        this.$message({
          message: '模板创建成功',
          type: 'success',
          duration: 1000
        })
        
        this.goBack()
      } catch (error) {
        if (error.message) {
          this.$message.error('创建失败：' + error.message)
        }
      } finally {
        this.submitLoading = false
      }
    },
    goBack() {
      this.$router.push({ path: '/email/template' })
    },
    onContentChange(content) {
      this.template.content = content
      this.$refs.templateForm.validateField('content')
    },
    addVariable() {
      this.newVariable.adding = true
      this.newVariable.show = false
    },
    confirmAddVariable() {
      if (!this.newVariable.name || !this.newVariable.description) {
        this.$message.warning('请填写完整的变量信息')
        return
      }
      
      // 检查变量名是否已存在
      if (this.template.variables.some(v => v.name === this.newVariable.name)) {
        this.$message.warning('变量名已存在')
        return
      }
      
      this.template.variables.push({
        name: this.newVariable.name,
        description: this.newVariable.description
      })
      
      this.cancelAddVariable()
    },
    cancelAddVariable() {
      this.newVariable.adding = false
      this.newVariable.show = true
      this.newVariable.name = ''
      this.newVariable.description = ''
    },
    removeVariable(index) {
      this.template.variables.splice(index, 1)
    }
  }
}
</script>

<style scoped>
.template-form {
  max-width: 800px;
}

.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.variables-container {
  min-height: 40px;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fafafa;
}
</style>