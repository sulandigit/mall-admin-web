<template>
  <div class="log-search">
    <el-form 
      :model="searchForm" 
      :inline="true" 
      ref="searchForm"
      class="search-form"
    >
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="searchForm.username"
          placeholder="请输入用户名"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>
      
      <el-form-item label="操作类型" prop="operationType">
        <el-select
          v-model="searchForm.operationType"
          placeholder="请选择操作类型"
          clearable
          style="width: 150px"
        >
          <el-option
            v-for="item in operationTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="模块名称" prop="moduleName">
        <el-select
          v-model="searchForm.moduleName"
          placeholder="请选择模块"
          clearable
          style="width: 150px"
        >
          <el-option
            v-for="item in moduleNameOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="操作时间" prop="timeRange">
        <el-date-picker
          v-model="searchForm.timeRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="yyyy-MM-dd HH:mm:ss"
          value-format="yyyy-MM-dd HH:mm:ss"
          style="width: 350px"
        />
      </el-form-item>
      
      <el-form-item label="IP地址" prop="ipAddress">
        <el-input
          v-model="searchForm.ipAddress"
          placeholder="请输入IP地址"
          clearable
          style="width: 150px"
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>
      
      <el-form-item label="操作状态" prop="status">
        <el-select
          v-model="searchForm.status"
          placeholder="请选择状态"
          clearable
          style="width: 120px"
        >
          <el-option label="成功" value="SUCCESS" />
          <el-option label="失败" value="FAILED" />
        </el-select>
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="handleSearch" :loading="loading">
          <i class="el-icon-search"></i>
          查询
        </el-button>
        <el-button @click="handleReset">
          <i class="el-icon-refresh"></i>
          重置
        </el-button>
        <el-button type="success" @click="handleExport" :loading="exportLoading">
          <i class="el-icon-download"></i>
          导出
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'LogSearch',
  data() {
    return {
      // 默认操作类型选项
      defaultOperationTypes: [
        { label: '登录', value: 'LOGIN' },
        { label: '登出', value: 'LOGOUT' },
        { label: '创建', value: 'CREATE' },
        { label: '更新', value: 'UPDATE' },
        { label: '删除', value: 'DELETE' },
        { label: '查询', value: 'QUERY' },
        { label: '导出', value: 'EXPORT' },
        { label: '批量操作', value: 'BATCH' }
      ],
      // 默认模块选项
      defaultModuleNames: [
        { label: '商品管理', value: '商品管理' },
        { label: '订单管理', value: '订单管理' },
        { label: '用户管理', value: '用户管理' },
        { label: '权限管理', value: '权限管理' },
        { label: '营销管理', value: '营销管理' },
        { label: '系统管理', value: '系统管理' }
      ]
    }
  },
  computed: {
    ...mapGetters('log', [
      'searchForm',
      'operationTypeOptions',
      'moduleNameOptions',
      'loading',
      'exportLoading'
    ]),
    // 合并默认选项和动态选项
    operationTypeOptions() {
      return this.$store.getters['log/operationTypeOptions'].length > 0
        ? this.$store.getters['log/operationTypeOptions']
        : this.defaultOperationTypes
    },
    moduleNameOptions() {
      return this.$store.getters['log/moduleNameOptions'].length > 0
        ? this.$store.getters['log/moduleNameOptions']
        : this.defaultModuleNames
    }
  },
  created() {
    // 初始化选项数据
    this.initOptions()
  },
  methods: {
    // 初始化选项数据
    async initOptions() {
      try {
        await Promise.all([
          this.$store.dispatch('log/getOperationTypes'),
          this.$store.dispatch('log/getModuleNames')
        ])
      } catch (error) {
        console.error('初始化选项数据失败:', error)
      }
    },
    
    // 处理搜索
    handleSearch() {
      this.$emit('search')
    },
    
    // 处理重置
    handleReset() {
      this.$refs.searchForm.resetFields()
      this.$store.dispatch('log/resetSearchForm')
      this.$emit('reset')
    },
    
    // 处理导出
    handleExport() {
      this.$emit('export')
    }
  }
}
</script>

<style lang="scss" scoped>
.log-search {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
  
  .search-form {
    .el-form-item {
      margin-bottom: 20px;
    }
  }
}
</style>