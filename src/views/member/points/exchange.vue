<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane label="兑换商品管理" name="items">
        <div class="filter-container">
          <el-input v-model="itemsQuery.itemName" placeholder="商品名称" style="width: 200px;" class="filter-item" />
          <el-select v-model="itemsQuery.itemType" placeholder="商品类型" clearable style="width: 120px" class="filter-item">
            <el-option label="实物商品" value="PRODUCT" />
            <el-option label="优惠券" value="COUPON" />
            <el-option label="服务" value="SERVICE" />
          </el-select>
          <el-button class="filter-item" type="primary" @click="handleItemsFilter">搜索</el-button>
          <el-button class="filter-item" type="primary" @click="handleCreateItem">添加商品</el-button>
        </div>

        <el-table v-loading="itemsLoading" :data="itemsList" border style="width: 100%;">
          <el-table-column label="ID" prop="id" width="80" />
          <el-table-column label="商品名称" prop="itemName" width="150" />
          <el-table-column label="商品类型" width="100">
            <template slot-scope="{row}">
              <el-tag :type="getItemTypeColor(row.itemType)">
                {{ getItemTypeName(row.itemType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="所需积分" prop="pointsCost" width="100" align="center" />
          <el-table-column label="库存数量" prop="stockQuantity" width="100" align="center" />
          <el-table-column label="状态" width="80">
            <template slot-scope="{row}">
              <el-tag :type="row.isActive ? 'success' : 'info'">
                {{ row.isActive ? '上架' : '下架' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180">
            <template slot-scope="{row}">
              <el-button type="primary" size="mini" @click="handleEditItem(row)">编辑</el-button>
              <el-button size="mini" type="danger" @click="handleDeleteItem(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="兑换记录管理" name="records">
        <div class="filter-container">
          <el-input v-model="recordsQuery.memberUsername" placeholder="会员用户名" style="width: 200px;" class="filter-item" />
          <el-select v-model="recordsQuery.status" placeholder="兑换状态" clearable style="width: 120px" class="filter-item">
            <el-option label="待审核" value="PENDING" />
            <el-option label="已通过" value="APPROVED" />
            <el-option label="已拒绝" value="REJECTED" />
            <el-option label="已发货" value="DELIVERED" />
          </el-select>
          <el-button class="filter-item" type="primary" @click="handleRecordsFilter">搜索</el-button>
        </div>

        <el-table v-loading="recordsLoading" :data="recordsList" border style="width: 100%;">
          <el-table-column label="ID" prop="id" width="80" />
          <el-table-column label="会员用户名" prop="memberUsername" width="120" />
          <el-table-column label="商品名称" prop="itemName" width="150" />
          <el-table-column label="消耗积分" prop="pointsCost" width="100" align="center" />
          <el-table-column label="兑换状态" width="100">
            <template slot-scope="{row}">
              <el-tag :type="getStatusColor(row.status)">
                {{ getStatusName(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" prop="createTime" width="160" />
          <el-table-column label="操作" width="120">
            <template slot-scope="{row}">
              <el-button v-if="row.status === 'PENDING'" type="success" size="mini" @click="handleAudit(row, 'APPROVED')">通过</el-button>
              <el-button v-if="row.status === 'PENDING'" type="danger" size="mini" @click="handleAudit(row, 'REJECTED')">拒绝</el-button>
              <el-button type="text" size="small" @click="handleRecordDetail(row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
export default {
  name: 'PointsExchange',
  data() {
    return {
      activeTab: 'items',
      itemsList: [],
      recordsList: [],
      itemsLoading: false,
      recordsLoading: false,
      itemsQuery: {
        page: 1,
        limit: 20,
        itemName: '',
        itemType: ''
      },
      recordsQuery: {
        page: 1,
        limit: 20,
        memberUsername: '',
        status: ''
      }
    }
  },
  created() {
    this.getItemsList()
  },
  methods: {
    handleTabClick(tab) {
      if (tab.name === 'items') {
        this.getItemsList()
      } else {
        this.getRecordsList()
      }
    },
    getItemsList() {
      this.itemsLoading = true
      this.$store.dispatch('fetchExchangeItems', this.itemsQuery)
        .then(response => {
          this.itemsList = response.data.list || []
        })
        .finally(() => {
          this.itemsLoading = false
        })
    },
    getRecordsList() {
      this.recordsLoading = true
      this.$store.dispatch('fetchExchangeRecords', this.recordsQuery)
        .then(response => {
          this.recordsList = response.data.list || []
        })
        .finally(() => {
          this.recordsLoading = false
        })
    },
    handleItemsFilter() {
      this.getItemsList()
    },
    handleRecordsFilter() {
      this.getRecordsList()
    },
    handleCreateItem() {
      this.$message('添加兑换商品功能开发中')
    },
    handleEditItem(row) {
      this.$message('编辑商品功能开发中')
    },
    handleDeleteItem(row) {
      this.$message('删除商品功能开发中')
    },
    handleAudit(row, status) {
      this.$message(`${status === 'APPROVED' ? '通过' : '拒绝'}审核功能开发中`)
    },
    handleRecordDetail(row) {
      this.$message('查看详情功能开发中')
    },
    getItemTypeName(type) {
      const names = {
        'PRODUCT': '实物',
        'COUPON': '优惠券',
        'SERVICE': '服务'
      }
      return names[type] || type
    },
    getItemTypeColor(type) {
      const colors = {
        'PRODUCT': 'success',
        'COUPON': 'warning',
        'SERVICE': 'info'
      }
      return colors[type] || ''
    },
    getStatusName(status) {
      const names = {
        'PENDING': '待审核',
        'APPROVED': '已通过',
        'REJECTED': '已拒绝',
        'DELIVERED': '已发货'
      }
      return names[status] || status
    },
    getStatusColor(status) {
      const colors = {
        'PENDING': 'warning',
        'APPROVED': 'success',
        'REJECTED': 'danger',
        'DELIVERED': 'info'
      }
      return colors[status] || ''
    }
  }
}
</script>