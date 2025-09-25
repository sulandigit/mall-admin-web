<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.ruleName" placeholder="规则名称" style="width: 200px;" class="filter-item" />
      <el-select v-model="listQuery.ruleType" placeholder="规则类型" clearable style="width: 120px" class="filter-item">
        <el-option label="获取积分" value="EARN" />
        <el-option label="消费积分" value="CONSUME" />
      </el-select>
      <el-button class="filter-item" type="primary" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" type="primary" @click="handleCreate">添加规则</el-button>
    </div>

    <el-table v-loading="listLoading" :data="list" border style="width: 100%;">
      <el-table-column label="ID" prop="id" width="65" />
      <el-table-column label="规则名称" prop="ruleName" />
      <el-table-column label="规则类型" width="100px">
        <template slot-scope="{row}">
          <el-tag :type="row.ruleType === 'EARN' ? 'success' : 'warning'">
            {{ row.ruleType === 'EARN' ? '获取' : '消费' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template slot-scope="{row}">
          <el-tag :type="row.isActive ? 'success' : 'info'">
            {{ row.isActive ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'PointsRules',
  data() {
    return {
      list: [],
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 20,
        ruleName: '',
        ruleType: ''
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      this.$store.dispatch('fetchPointsRules', this.listQuery)
        .then(response => {
          this.list = response.data.list || []
        })
        .finally(() => {
          this.listLoading = false
        })
    },
    handleFilter() {
      this.getList()
    },
    handleCreate() {
      this.$message('创建功能开发中')
    },
    handleUpdate(row) {
      this.$message('编辑功能开发中')
    },
    handleDelete(row) {
      this.$message('删除功能开发中')
    }
  }
}
</script>