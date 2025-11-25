<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.memberUsername" placeholder="会员用户名" style="width: 200px;" class="filter-item" />
      <el-select v-model="listQuery.changeType" placeholder="变动类型" clearable style="width: 120px" class="filter-item">
        <el-option label="获得" value="EARN" />
        <el-option label="消费" value="CONSUME" />
        <el-option label="过期" value="EXPIRE" />
        <el-option label="调整" value="ADJUST" />
      </el-select>
      <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" class="filter-item" />
      <el-button class="filter-item" type="primary" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" type="success" @click="handleAdjust">手动调整积分</el-button>
    </div>

    <el-table v-loading="listLoading" :data="list" border style="width: 100%;">
      <el-table-column label="ID" prop="id" width="80" />
      <el-table-column label="会员用户名" prop="memberUsername" width="120" />
      <el-table-column label="变动类型" width="100">
        <template slot-scope="{row}">
          <el-tag :type="getChangeTypeColor(row.changeType)">
            {{ getChangeTypeName(row.changeType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="积分变动" width="100" align="center">
        <template slot-scope="{row}">
          <span :style="{color: row.pointsChange > 0 ? '#67C23A' : '#F56C6C'}">
            {{ row.pointsChange > 0 ? '+' : '' }}{{ row.pointsChange }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="变动后余额" prop="pointsBalance" width="120" align="center" />
      <el-table-column label="变动原因" prop="description" />
      <el-table-column label="创建时间" prop="createTime" width="160" />
      <el-table-column label="操作" width="100">
        <template slot-scope="{row}">
          <el-button type="text" size="small" @click="handleDetail(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'

export default {
  name: 'PointsRecords',
  components: { Pagination },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 20,
        memberUsername: '',
        changeType: ''
      },
      dateRange: null
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      const params = { ...this.listQuery }
      if (this.dateRange) {
        params.startDate = this.dateRange[0]
        params.endDate = this.dateRange[1]
      }
      this.$store.dispatch('fetchPointsRecords', params)
        .then(response => {
          this.list = response.data.list || []
          this.total = response.data.total || 0
        })
        .finally(() => {
          this.listLoading = false
        })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleAdjust() {
      this.$message('手动调整积分功能开发中')
    },
    handleDetail(row) {
      this.$message('查看详情功能开发中')
    },
    getChangeTypeName(type) {
      const names = {
        'EARN': '获得',
        'CONSUME': '消费',
        'EXPIRE': '过期',
        'ADJUST': '调整'
      }
      return names[type] || type
    },
    getChangeTypeColor(type) {
      const colors = {
        'EARN': 'success',
        'CONSUME': 'warning',
        'EXPIRE': 'danger',
        'ADJUST': 'info'
      }
      return colors[type] || ''
    }
  }
}
</script>