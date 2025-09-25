<template>
  <el-card class="filter-container" shadow="never">
    <div>
      <i class="el-icon-search"></i>
      <span>筛选搜索</span>
      <el-button
        style="float: right"
        @click="handleSearch"
        type="primary"
        size="small">
        查询结果
      </el-button>
      <el-button
        style="float: right;margin-right: 15px"
        @click="handleReset"
        size="small">
        重置
      </el-button>
    </div>
    <div style="margin-top: 15px">
      <el-form :inline="true" :model="filterForm" size="small" label-width="140px">
        <!-- 日期范围选择 -->
        <el-form-item label="统计时间：">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions"
            style="width: 300px">
          </el-date-picker>
        </el-form-item>
        
        <!-- 快速时间选择 -->
        <el-form-item label="快速选择：">
          <el-select v-model="quickTimeRange" placeholder="选择时间段" @change="handleQuickTimeChange" clearable style="width: 150px">
            <el-option
              v-for="item in quickTimeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        
        <!-- 商品分类 -->
        <el-form-item label="商品分类：">
          <el-cascader
            v-model="filterForm.categoryIds"
            :options="categoryOptions"
            :props="cascaderProps"
            clearable
            placeholder="请选择分类"
            style="width: 250px">
          </el-cascader>
        </el-form-item>
        
        <!-- 商品品牌 -->
        <el-form-item label="商品品牌：">
          <el-select v-model="filterForm.brandId" placeholder="请选择品牌" clearable style="width: 150px">
            <el-option
              v-for="item in brandOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        
        <!-- 周转率级别 -->
        <el-form-item label="周转率级别：">
          <el-select v-model="filterForm.turnoverLevel" placeholder="全部级别" clearable style="width: 150px">
            <el-option
              v-for="item in turnoverLevelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
              <span :style="{ color: item.color }">{{ item.label }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        
        <!-- 商品搜索 -->
        <el-form-item label="商品名称：">
          <el-input
            v-model="filterForm.keyword"
            placeholder="请输入商品名称"
            style="width: 200px"
            clearable>
          </el-input>
        </el-form-item>
        
        <!-- 库存价值范围 -->
        <el-form-item label="库存价值：">
          <el-input
            v-model="filterForm.minInventoryValue"
            placeholder="最小值"
            style="width: 100px"
            type="number">
          </el-input>
          <span style="margin: 0 10px">-</span>
          <el-input
            v-model="filterForm.maxInventoryValue"
            placeholder="最大值"
            style="width: 100px"
            type="number">
          </el-input>
        </el-form-item>
      </el-form>
    </div>
  </el-card>
</template>

<script>
import { fetchCategoryOptions, fetchBrandOptions } from '@/api/inventoryTurnover'
import TurnoverCalculator from '@/utils/turnoverCalculator'

export default {
  name: 'FilterPanel',
  data() {
    return {
      filterForm: {
        dateRange: [],
        categoryIds: [],
        brandId: null,
        turnoverLevel: null,
        keyword: '',
        minInventoryValue: '',
        maxInventoryValue: ''
      },
      quickTimeRange: null,
      categoryOptions: [],
      brandOptions: [],
      quickTimeOptions: [
        { label: '近7天', value: 'week' },
        { label: '近30天', value: 'month' },
        { label: '近90天', value: 'quarter' },
        { label: '近一年', value: 'year' }
      ],
      cascaderProps: {
        checkStrictly: true,
        emitPath: false
      },
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      }
    }
  },
  computed: {
    turnoverLevelOptions() {
      return TurnoverCalculator.getTurnoverLevelOptions()
    }
  },
  mounted() {
    this.initDefaultDateRange()
    this.loadCategoryOptions()
    this.loadBrandOptions()
  },
  methods: {
    /**
     * 初始化默认日期范围（近30天）
     */
    initDefaultDateRange() {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      
      this.filterForm.dateRange = [
        this.formatDate(start),
        this.formatDate(end)
      ]
      this.quickTimeRange = 'month'
    },
    
    /**
     * 格式化日期
     */
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    
    /**
     * 快速时间选择处理
     */
    handleQuickTimeChange(value) {
      if (!value) {
        this.filterForm.dateRange = []
        return
      }
      
      const end = new Date()
      const start = new Date()
      
      switch (value) {
        case 'week':
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
          break
        case 'month':
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
          break
        case 'quarter':
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
          break
        case 'year':
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 365)
          break
      }
      
      this.filterForm.dateRange = [
        this.formatDate(start),
        this.formatDate(end)
      ]
    },
    
    /**
     * 加载商品分类选项
     */
    async loadCategoryOptions() {
      try {
        const response = await fetchCategoryOptions()
        if (response.code === 200) {
          this.categoryOptions = this.transformCategoryData(response.data)
        }
      } catch (error) {
        console.error('加载商品分类失败:', error)
      }
    },
    
    /**
     * 加载品牌选项
     */
    async loadBrandOptions() {
      try {
        const response = await fetchBrandOptions()
        if (response.code === 200) {
          this.brandOptions = response.data || []
        }
      } catch (error) {
        console.error('加载品牌列表失败:', error)
      }
    },
    
    /**
     * 转换分类数据为级联选择器格式
     */
    transformCategoryData(categories) {
      return categories.map(category => ({
        value: category.id,
        label: category.name,
        children: category.children ? this.transformCategoryData(category.children) : []
      }))
    },
    
    /**
     * 处理搜索
     */
    handleSearch() {
      // 验证必填项
      if (!this.filterForm.dateRange || this.filterForm.dateRange.length !== 2) {
        this.$message.warning('请选择统计时间范围')
        return
      }
      
      // 构建查询参数
      const params = {
        dateRange: this.filterForm.dateRange,
        startDate: this.filterForm.dateRange[0],
        endDate: this.filterForm.dateRange[1],
        categoryId: this.filterForm.categoryIds.length > 0 ? this.filterForm.categoryIds[this.filterForm.categoryIds.length - 1] : null,
        brandId: this.filterForm.brandId,
        turnoverLevel: this.filterForm.turnoverLevel,
        keyword: this.filterForm.keyword.trim(),
        minInventoryValue: this.filterForm.minInventoryValue ? parseFloat(this.filterForm.minInventoryValue) : null,
        maxInventoryValue: this.filterForm.maxInventoryValue ? parseFloat(this.filterForm.maxInventoryValue) : null
      }
      
      // 发送搜索事件
      this.$emit('search', params)
    },
    
    /**
     * 重置筛选条件
     */
    handleReset() {
      this.filterForm = {
        dateRange: [],
        categoryIds: [],
        brandId: null,
        turnoverLevel: null,
        keyword: '',
        minInventoryValue: '',
        maxInventoryValue: ''
      }
      this.quickTimeRange = null
      this.initDefaultDateRange()
      
      // 发送重置事件
      this.$emit('reset')
    }
  }
}
</script>

<style scoped>
.filter-container {
  margin-bottom: 20px;
}

.filter-container .el-form-item {
  margin-bottom: 15px;
}
</style>