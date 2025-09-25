<template>
  <div class="app-container">
    <!-- 筛选搜索 -->
    <el-card class="filter-container" shadow="never">
      <div>
        <i class="el-icon-search"></i>
        <span>筛选搜索</span>
        <el-button
          style="float: right"
          @click="searchTemplateList()"
          type="primary"
          size="small">
          查询结果
        </el-button>
      </div>
      <div style="margin-top: 15px">
        <el-form :inline="true" :model="listQuery" size="small" label-width="140px">
          <el-form-item label="模板名称：">
            <el-input 
              style="width: 203px" 
              v-model="listQuery.keyword" 
              placeholder="输入模板名称">
            </el-input>
          </el-form-item>
          <el-form-item label="模板类型：">
            <el-select 
              v-model="listQuery.type" 
              placeholder="选择模板类型" 
              clearable
              style="width: 203px">
              <el-option
                v-for="type in templateTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="状态：">
            <el-select 
              v-model="listQuery.status" 
              placeholder="选择状态" 
              clearable
              style="width: 203px">
              <el-option label="启用" :value="1"></el-option>
              <el-option label="禁用" :value="0"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 操作按钮 -->
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>数据列表</span>
      <el-button
        class="btn-add"
        @click="addTemplate()"
        size="mini">
        添加模板
      </el-button>
    </el-card>

    <!-- 数据表格 -->
    <div class="table-container">
      <el-table 
        ref="templateTable"
        :data="list"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        v-loading="listLoading"
        border>
        <el-table-column type="selection" width="60" align="center"></el-table-column>
        <el-table-column label="编号" width="80" align="center">
          <template slot-scope="scope">{{ scope.row.id }}</template>
        </el-table-column>
        <el-table-column label="模板名称" align="center" min-width="150">
          <template slot-scope="scope">{{ scope.row.name }}</template>
        </el-table-column>
        <el-table-column label="邮件主题" align="center" min-width="200">
          <template slot-scope="scope">{{ scope.row.subject }}</template>
        </el-table-column>
        <el-table-column label="模板类型" width="120" align="center">
          <template slot-scope="scope">
            <el-tag :type="getTypeTagType(scope.row.type)">
              {{ getTypeName(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="变量数量" width="100" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.variables ? scope.row.variables.length : 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-switch
              @change="handleStatusChange(scope.$index, scope.row)"
              :active-value="1"
              :inactive-value="0"
              v-model="scope.row.status">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180" align="center">
          <template slot-scope="scope">{{ formatDate(scope.row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template slot-scope="scope">
            <el-button
              size="mini"
              @click="previewTemplate(scope.$index, scope.row)">
              预览
            </el-button>
            <el-button
              size="mini"
              @click="editTemplate(scope.$index, scope.row)">
              编辑
            </el-button>
            <el-button
              size="mini"
              type="danger"
              @click="deleteTemplate(scope.$index, scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 批量操作 -->
    <div class="batch-operate-container">
      <el-select
        size="small"
        v-model="operateType" 
        placeholder="批量操作">
        <el-option
          v-for="item in operates"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <el-button
        style="margin-left: 20px"
        class="search-button"
        @click="handleBatchOperate()"
        type="primary"
        size="small">
        确定
      </el-button>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        layout="total, sizes,prev, pager, next,jumper"
        :page-size="listQuery.pageSize"
        :page-sizes="[5,10,15]"
        :current-page.sync="listQuery.pageNum"
        :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { updateTemplateStatus } from '@/api/email'

export default {
  name: 'EmailTemplateList',
  data() {
    return {
      operates: [
        {
          label: "启用模板",
          value: "enableTemplate"
        },
        {
          label: "禁用模板", 
          value: "disableTemplate"
        }
      ],
      operateType: null,
      listQuery: {
        keyword: null,
        type: null,
        status: null,
        pageNum: 1,
        pageSize: 10
      },
      multipleSelection: []
    }
  },
  computed: {
    ...mapState('email', {
      list: state => state.templateList,
      total: state => state.templateTotal,
      listLoading: state => state.templateLoading,
      templateTypes: state => state.templateTypes
    })
  },
  created() {
    this.getList()
  },
  methods: {
    ...mapActions('email', [
      'fetchTemplateList',
      'deleteTemplate'
    ]),
    getList() {
      this.fetchTemplateList(this.listQuery)
    },
    searchTemplateList() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    addTemplate() {
      this.$router.push({ path: '/email/template/add' })
    },
    editTemplate(index, row) {
      this.$router.push({ path: '/email/template/edit/' + row.id })
    },
    previewTemplate(index, row) {
      this.$router.push({ path: '/email/template/preview/' + row.id })
    },
    async deleteTemplate(index, row) {
      try {
        await this.$confirm('是否要删除该邮件模板？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await this.deleteTemplate(row.id)
        this.$message({
          message: '删除成功',
          type: 'success',
          duration: 1000
        })
        this.getList()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败：' + error.message)
        }
      }
    },
    async handleStatusChange(index, row) {
      try {
        await updateTemplateStatus({
          id: row.id,
          status: row.status
        })
        this.$message({
          message: '状态更新成功',
          type: 'success',
          duration: 1000
        })
      } catch (error) {
        row.status = row.status === 1 ? 0 : 1
        this.$message.error('状态更新失败：' + error.message)
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    async handleBatchOperate() {
      if (this.multipleSelection.length < 1) {
        this.$message({
          message: '请选择要操作的模板',
          type: 'warning',
          duration: 1000
        })
        return
      }
      
      if (!this.operateType) {
        this.$message({
          message: '请選择批量操作类型',
          type: 'warning',
          duration: 1000
        })
        return
      }

      const status = this.operateType === 'enableTemplate' ? 1 : 0
      const action = this.operateType === 'enableTemplate' ? '启用' : '禁用'
      
      try {
        await this.$confirm(`是否要${action}这些模板？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const promises = this.multipleSelection.map(item => 
          updateTemplateStatus({ id: item.id, status: status })
        )
        
        await Promise.all(promises)
        this.$message({
          message: `批量${action}成功`,
          type: 'success',
          duration: 1000
        })
        this.getList()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error(`批量${action}失败：` + error.message)
        }
      }
    },
    handleSizeChange(val) {
      this.listQuery.pageSize = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.pageNum = val
      this.getList()
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
.filter-container {
  margin-bottom: 10px;
}

.operate-container {
  margin-bottom: 10px;
}

.btn-add {
  float: right;
  margin-right: 20px;
}

.table-container {
  margin-bottom: 10px;
}

.batch-operate-container {
  margin-bottom: 20px;
}

.pagination-container {
  text-align: right;
}
</style>