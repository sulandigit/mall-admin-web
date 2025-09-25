<template>
  <el-dialog
    title="快捷回复管理"
    :visible.sync="dialogVisible"
    width="600px"
    @closed="handleDialogClosed"
  >
    <!-- 操作栏 -->
    <div class="quick-reply-actions">
      <el-button 
        type="primary" 
        icon="el-icon-plus"
        @click="showAddDialog"
      >
        添加快捷回复
      </el-button>
      
      <el-input
        v-model="searchKeyword"
        placeholder="搜索快捷回复"
        prefix-icon="el-icon-search"
        size="small"
        style="width: 200px; margin-left: auto;"
        clearable
      />
    </div>

    <!-- 快捷回复列表 -->
    <div class="quick-reply-list">
      <el-table
        :data="filteredReplies"
        v-loading="loading"
        style="width: 100%"
        max-height="400"
      >
        <el-table-column prop="title" label="标题" width="150" />
        <el-table-column prop="content" label="内容" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="100">
          <template slot-scope="scope">
            <el-tag size="mini">{{ scope.row.category || '默认' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="useCount" label="使用次数" width="80" align="center" />
        <el-table-column label="操作" width="120" align="center">
          <template slot-scope="scope">
            <el-button 
              type="text" 
              size="mini"
              @click="editReply(scope.row)"
            >
              编辑
            </el-button>
            <el-button 
              type="text" 
              size="mini"
              style="color: #f56c6c"
              @click="deleteReply(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      :title="editMode ? '编辑快捷回复' : '添加快捷回复'"
      :visible.sync="formDialogVisible"
      width="500px"
      append-to-body
      @closed="resetForm"
    >
      <el-form
        ref="replyForm"
        :model="replyForm"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="标题" prop="title">
          <el-input 
            v-model="replyForm.title"
            placeholder="请输入快捷回复标题"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="分类" prop="category">
          <el-select 
            v-model="replyForm.category"
            placeholder="请选择分类"
            allow-create
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="category in categories"
              :key="category"
              :label="category"
              :value="category"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="replyForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入快捷回复内容"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="快捷键">
          <el-input
            v-model="replyForm.shortcut"
            placeholder="例如: ctrl+1 (可选)"
            maxlength="20"
          />
          <div class="form-tip">设置快捷键后可通过键盘快速插入</div>
        </el-form-item>
      </el-form>
      
      <div slot="footer">
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          :loading="submitting"
          @click="submitForm"
        >
          {{ editMode ? '更新' : '添加' }}
        </el-button>
      </div>
    </el-dialog>

    <div slot="footer">
      <el-button @click="dialogVisible = false">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'QuickReplyDialog',

  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      searchKeyword: '',
      formDialogVisible: false,
      editMode: false,
      loading: false,
      submitting: false,
      
      replyForm: {
        id: '',
        title: '',
        content: '',
        category: '',
        shortcut: ''
      },
      
      formRules: {
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' },
          { min: 1, max: 50, message: '标题长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入内容', trigger: 'blur' },
          { min: 1, max: 500, message: '内容长度在 1 到 500 个字符', trigger: 'blur' }
        ]
      }
    }
  },

  computed: {
    ...mapState('customerService', ['quickReplies']),

    dialogVisible: {
      get() {
        return this.visible
      },
      set(value) {
        this.$emit('update:visible', value)
      }
    },

    // 过滤后的快捷回复
    filteredReplies() {
      if (!this.searchKeyword.trim()) {
        return this.quickReplies
      }
      
      const keyword = this.searchKeyword.toLowerCase()
      return this.quickReplies.filter(reply => {
        return reply.title.toLowerCase().includes(keyword) ||
               reply.content.toLowerCase().includes(keyword) ||
               (reply.category && reply.category.toLowerCase().includes(keyword))
      })
    },

    // 分类列表
    categories() {
      const categorySet = new Set()
      this.quickReplies.forEach(reply => {
        if (reply.category) {
          categorySet.add(reply.category)
        }
      })
      return Array.from(categorySet)
    }
  },

  watch: {
    visible(newVal) {
      if (newVal) {
        this.loadQuickReplies()
      }
    }
  },

  methods: {
    ...mapActions('customerService', [
      'loadQuickReplies',
      'saveQuickReplyAction',
      'deleteQuickReplyAction'
    ]),

    // 加载快捷回复列表
    async loadQuickReplies() {
      this.loading = true
      try {
        await this.$store.dispatch('customerService/loadQuickReplies')
      } catch (error) {
        console.error('加载快捷回复失败:', error)
        this.$message.error('加载快捷回复失败')
      } finally {
        this.loading = false
      }
    },

    // 显示添加对话框
    showAddDialog() {
      this.editMode = false
      this.formDialogVisible = true
    },

    // 编辑快捷回复
    editReply(reply) {
      this.editMode = true
      this.replyForm = {
        id: reply.id,
        title: reply.title,
        content: reply.content,
        category: reply.category || '',
        shortcut: reply.shortcut || ''
      }
      this.formDialogVisible = true
    },

    // 删除快捷回复
    async deleteReply(reply) {
      try {
        await this.$confirm(`确定要删除快捷回复"${reply.title}"吗？`, '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await this.deleteQuickReplyAction(reply.id)
        this.$message.success('删除成功')
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除快捷回复失败:', error)
          this.$message.error('删除失败')
        }
      }
    },

    // 提交表单
    async submitForm() {
      try {
        await this.$refs.replyForm.validate()
        
        this.submitting = true
        await this.saveQuickReplyAction(this.replyForm)
        
        this.$message.success(this.editMode ? '更新成功' : '添加成功')
        this.formDialogVisible = false
      } catch (error) {
        if (error.message) {
          console.error('保存快捷回复失败:', error)
          this.$message.error('保存失败')
        }
      } finally {
        this.submitting = false
      }
    },

    // 重置表单
    resetForm() {
      this.replyForm = {
        id: '',
        title: '',
        content: '',
        category: '',
        shortcut: ''
      }
      if (this.$refs.replyForm) {
        this.$refs.replyForm.clearValidate()
      }
    },

    // 处理对话框关闭
    handleDialogClosed() {
      this.searchKeyword = ''
      this.resetForm()
    }
  }
}
</script>

<style lang="scss" scoped>
.quick-reply-actions {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.quick-reply-list {
  .el-table {
    border: 1px solid #ebeef5;
  }
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

::v-deep .el-dialog__body {
  padding-top: 10px;
}

::v-deep .el-table th {
  background-color: #f5f7fa;
}
</style>