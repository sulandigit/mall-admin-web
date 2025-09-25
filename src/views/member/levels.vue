<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" type="primary" @click="handleCreate">添加等级</el-button>
      <el-button class="filter-item" @click="handleSort">排序调整</el-button>
    </div>

    <el-table v-loading="listLoading" :data="list" border style="width: 100%;">
      <el-table-column label="排序" prop="sortOrder" width="80" align="center" />
      <el-table-column label="等级名称" prop="levelName" width="120" />
      <el-table-column label="等级编码" prop="levelCode" width="120" />
      <el-table-column label="积分范围" width="180" align="center">
        <template slot-scope="{row}">
          <span>{{ row.minPoints }} - {{ row.maxPoints || '∞' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="积分倍率" prop="pointsMultiplier" width="100" align="center">
        <template slot-scope="{row}">
          <span>{{ row.pointsMultiplier }}x</span>
        </template>
      </el-table-column>
      <el-table-column label="等级图标" width="100" align="center">
        <template slot-scope="{row}">
          <img v-if="row.levelIcon" :src="row.levelIcon" style="width: 24px; height: 24px;" />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template slot-scope="{row}">
          <el-tag :type="row.isActive ? 'success' : 'info'">
            {{ row.isActive ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">编辑</el-button>
          <el-button type="text" size="mini" @click="handleBenefits(row)">权益配置</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 等级表单对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogFormVisible" width="600px">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px">
        <el-form-item label="等级名称" prop="levelName">
          <el-input v-model="temp.levelName" placeholder="请输入等级名称" />
        </el-form-item>
        <el-form-item label="等级编码" prop="levelCode">
          <el-input v-model="temp.levelCode" placeholder="请输入等级编码" />
        </el-form-item>
        <el-form-item label="最低积分" prop="minPoints">
          <el-input-number v-model="temp.minPoints" :min="0" />
        </el-form-item>
        <el-form-item label="最高积分" prop="maxPoints">
          <el-input-number v-model="temp.maxPoints" :min="0" placeholder="不填表示无上限" />
        </el-form-item>
        <el-form-item label="积分倍率" prop="pointsMultiplier">
          <el-input-number v-model="temp.pointsMultiplier" :min="0.1" :step="0.1" />
        </el-form-item>
        <el-form-item label="等级颜色" prop="levelColor">
          <el-color-picker v-model="temp.levelColor" />
        </el-form-item>
        <el-form-item label="排序权重" prop="sortOrder">
          <el-input-number v-model="temp.sortOrder" :min="0" />
        </el-form-item>
        <el-form-item label="等级描述" prop="description">
          <el-input v-model="temp.description" type="textarea" rows="3" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确定</el-button>
      </div>
    </el-dialog>

    <!-- 权益配置对话框 -->
    <el-dialog title="等级权益配置" :visible.sync="benefitsDialogVisible" width="800px">
      <div class="benefits-config">
        <el-form label-width="120px">
          <el-form-item label="折扣优惠">
            <el-input-number v-model="benefits.discount" :min="0" :max="100" />
            <span style="margin-left: 10px;">%</span>
          </el-form-item>
          <el-form-item label="免邮门槛">
            <el-input-number v-model="benefits.freeShipping" :min="0" />
            <span style="margin-left: 10px;">元</span>
          </el-form-item>
          <el-form-item label="生日积分倍率">
            <el-input-number v-model="benefits.birthdayMultiplier" :min="1" :step="0.1" />
          </el-form-item>
          <el-form-item label="专属客服">
            <el-switch v-model="benefits.exclusiveService" />
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="benefitsDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveBenefits">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'MemberLevels',
  data() {
    return {
      list: [],
      listLoading: false,
      dialogFormVisible: false,
      benefitsDialogVisible: false,
      dialogStatus: '',
      dialogTitle: '',
      temp: {
        id: undefined,
        levelName: '',
        levelCode: '',
        minPoints: 0,
        maxPoints: null,
        pointsMultiplier: 1.0,
        levelColor: '#409EFF',
        sortOrder: 0,
        description: ''
      },
      benefits: {
        discount: 0,
        freeShipping: 0,
        birthdayMultiplier: 1,
        exclusiveService: false
      },
      currentLevelId: null,
      rules: {
        levelName: [{ required: true, message: '请输入等级名称', trigger: 'blur' }],
        levelCode: [{ required: true, message: '请输入等级编码', trigger: 'blur' }],
        minPoints: [{ required: true, message: '请输入最低积分', trigger: 'blur' }],
        pointsMultiplier: [{ required: true, message: '请输入积分倍率', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      this.$store.dispatch('fetchMemberLevels')
        .then(response => {
          this.list = response.data.list || response.data || []
        })
        .finally(() => {
          this.listLoading = false
        })
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        levelName: '',
        levelCode: '',
        minPoints: 0,
        maxPoints: null,
        pointsMultiplier: 1.0,
        levelColor: '#409EFF',
        sortOrder: 0,
        description: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogTitle = '添加等级'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogTitle = '编辑等级'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleBenefits(row) {
      this.currentLevelId = row.id
      // 加载当前等级的权益配置
      this.benefits = {
        discount: 0,
        freeShipping: 0,
        birthdayMultiplier: 1,
        exclusiveService: false
      }
      this.benefitsDialogVisible = true
    },
    handleDelete(row) {
      this.$confirm('确认删除该等级?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message('删除功能开发中')
      })
    },
    handleSort() {
      this.$message('排序调整功能开发中')
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.$message('创建功能开发中')
          this.dialogFormVisible = false
        }
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.$message('更新功能开发中')
          this.dialogFormVisible = false
        }
      })
    },
    saveBenefits() {
      this.$message('保存权益配置功能开发中')
      this.benefitsDialogVisible = false
    }
  }
}
</script>

<style scoped>
.filter-container {
  padding-bottom: 10px;
}
.filter-item {
  display: inline-block;
  vertical-align: middle;
  margin-bottom: 10px;
}
.benefits-config {
  padding: 20px 0;
}
</style>