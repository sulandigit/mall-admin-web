<template>
  <div class="export-config">
    <!-- 筛选条件配置 -->
    <el-card class="filter-card" shadow="never">
      <div slot="header" class="card-header">
        <span>筛选条件</span>
        <el-button type="text" size="small" @click="resetFilters">重置筛选</el-button>
      </div>
      
      <el-form :model="filters" label-width="100px" size="small">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品分类">
              <el-cascader
                v-model="filters.categoryIds"
                :options="categoryOptions"
                :props="{ multiple: true, checkStrictly: true }"
                placeholder="请选择商品分类"
                clearable
                collapse-tags
              ></el-cascader>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品品牌">
              <el-select
                v-model="filters.brandIds"
                multiple
                placeholder="请选择品牌"
                clearable
                collapse-tags
              >
                <el-option
                  v-for="brand in brandOptions"
                  :key="brand.id"
                  :label="brand.name"
                  :value="brand.id"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="上架状态">
              <el-select v-model="filters.publishStatus" placeholder="全部" clearable>
                <el-option label="全部" value=""></el-option>
                <el-option label="已上架" value="1"></el-option>
                <el-option label="未上架" value="0"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存状态">
              <el-select v-model="filters.stockStatus" placeholder="全部" clearable>
                <el-option label="全部" value=""></el-option>
                <el-option label="有库存" value="1"></el-option>
                <el-option label="缺货" value="0"></el-option>
                <el-option label="库存预警" value="2"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="价格区间">
              <el-input
                v-model="filters.minPrice"
                placeholder="最低价"
                style="width: 45%"
                type="number"
              ></el-input>
              <span style="margin: 0 8px">-</span>
              <el-input
                v-model="filters.maxPrice"
                placeholder="最高价"
                style="width: 45%"
                type="number"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="创建时间">
              <el-date-picker
                v-model="filters.createTimeRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="yyyy-MM-dd"
                style="width: 100%"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row>
          <el-col :span="24">
            <el-form-item label="关键词搜索">
              <el-input
                v-model="filters.keyword"
                placeholder="商品名称、货号模糊搜索"
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 导出字段配置 -->
    <el-card class="fields-card" shadow="never">
      <div slot="header" class="card-header">
        <span>导出字段</span>
        <div>
          <el-button type="text" size="small" @click="selectAllFields">全选</el-button>
          <el-button type="text" size="small" @click="clearAllFields">全不选</el-button>
        </div>
      </div>
      
      <div class="fields-selection">
        <el-row :gutter="20">
          <el-col :span="6" v-for="group in fieldGroups" :key="group.name">
            <div class="field-group">
              <div class="group-header">
                <el-checkbox
                  :indeterminate="group.indeterminate"
                  v-model="group.checkAll"
                  @change="handleGroupCheckAllChange(group)"
                >
                  {{ group.label }}
                </el-checkbox>
              </div>
              <div class="group-content">
                <el-checkbox-group v-model="selectedFields" @change="handleFieldChange">
                  <el-checkbox
                    v-for="field in group.fields"
                    :key="field.key"
                    :label="field.key"
                    class="field-checkbox"
                  >
                    {{ field.label }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 导出格式配置 -->
    <el-card class="format-card" shadow="never">
      <div slot="header">
        <span>导出设置</span>
      </div>
      
      <el-form label-width="100px" size="small">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="导出格式">
              <el-radio-group v-model="exportFormat">
                <el-radio label="excel">Excel格式 (.xlsx)</el-radio>
                <el-radio label="csv">CSV格式 (.csv)</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="文件名称">
              <el-input
                v-model="fileName"
                placeholder="默认：商品导出_日期时间"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 预览信息 -->
    <el-card v-if="previewInfo.total > 0" class="preview-card" shadow="never">
      <div slot="header">
        <span>导出预览</span>
      </div>
      
      <div class="preview-content">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="preview-item">
              <span class="preview-label">预计导出记录：</span>
              <span class="preview-value">{{ previewInfo.total }} 条</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="preview-item">
              <span class="preview-label">预计文件大小：</span>
              <span class="preview-value">{{ previewInfo.fileSize }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="preview-item">
              <span class="preview-label">选择字段数：</span>
              <span class="preview-value">{{ selectedFields.length }} 个</span>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'ExportConfig',
  props: {
    // 分类选项
    categoryOptions: {
      type: Array,
      default: () => []
    },
    // 品牌选项
    brandOptions: {
      type: Array,
      default: () => []
    },
    // 预览信息
    previewInfo: {
      type: Object,
      default: () => ({
        total: 0,
        fileSize: '0 KB'
      })
    }
  },
  data() {
    return {
      // 筛选条件
      filters: {
        categoryIds: [],
        brandIds: [],
        publishStatus: '',
        stockStatus: '',
        minPrice: '',
        maxPrice: '',
        createTimeRange: [],
        keyword: ''
      },
      
      // 选中的导出字段
      selectedFields: [
        'name', 'productSn', 'categoryName', 'brandName', 'price', 'stock'
      ],
      
      // 导出格式
      exportFormat: 'excel',
      
      // 文件名称
      fileName: '',
      
      // 字段分组
      fieldGroups: [
        {
          name: 'basic',
          label: '基础信息',
          checkAll: false,
          indeterminate: true,
          fields: [
            { key: 'name', label: '商品名称' },
            { key: 'subTitle', label: '副标题' },
            { key: 'productSn', label: '商品货号' },
            { key: 'description', label: '商品描述' },
            { key: 'keywords', label: '关键词' }
          ]
        },
        {
          name: 'category',
          label: '分类品牌',
          checkAll: false,
          indeterminate: true,
          fields: [
            { key: 'categoryName', label: '商品分类' },
            { key: 'brandName', label: '品牌名称' }
          ]
        },
        {
          name: 'price',
          label: '价格库存',
          checkAll: false,
          indeterminate: true,
          fields: [
            { key: 'price', label: '销售价格' },
            { key: 'originalPrice', label: '市场价格' },
            { key: 'stock', label: '库存数量' },
            { key: 'lowStock', label: '预警库存' },
            { key: 'unit', label: '计量单位' },
            { key: 'weight', label: '商品重量' }
          ]
        },
        {
          name: 'status',
          label: '状态信息',
          checkAll: false,
          indeterminate: false,
          fields: [
            { key: 'publishStatus', label: '上架状态' },
            { key: 'newStatus', label: '新品状态' },
            { key: 'recommendStatus', label: '推荐状态' },
            { key: 'verifyStatus', label: '审核状态' },
            { key: 'sort', label: '排序值' }
          ]
        },
        {
          name: 'time',
          label: '时间信息',
          checkAll: false,
          indeterminate: false,
          fields: [
            { key: 'createTime', label: '创建时间' },
            { key: 'updateTime', label: '更新时间' }
          ]
        }
      ]
    }
  },
  watch: {
    // 监听筛选条件变化，触发预览更新
    filters: {
      handler() {
        this.updatePreview()
      },
      deep: true
    },
    // 监听字段选择变化
    selectedFields() {
      this.updateFieldGroupStatus()
      this.updatePreview()
    }
  },
  mounted() {
    // 初始化字段组状态
    this.updateFieldGroupStatus()
    // 生成默认文件名
    this.generateDefaultFileName()
  },
  methods: {
    // 重置筛选条件
    resetFilters() {
      this.filters = {
        categoryIds: [],
        brandIds: [],
        publishStatus: '',
        stockStatus: '',
        minPrice: '',
        maxPrice: '',
        createTimeRange: [],
        keyword: ''
      }
    },
    
    // 全选字段
    selectAllFields() {
      this.selectedFields = []
      this.fieldGroups.forEach(group => {
        group.fields.forEach(field => {
          this.selectedFields.push(field.key)
        })
      })
    },
    
    // 取消全选
    clearAllFields() {
      this.selectedFields = []
    },
    
    // 处理字段组全选变化
    handleGroupCheckAllChange(group) {
      const groupFieldKeys = group.fields.map(field => field.key)
      
      if (group.checkAll) {
        // 全选该组
        groupFieldKeys.forEach(key => {
          if (!this.selectedFields.includes(key)) {
            this.selectedFields.push(key)
          }
        })
      } else {
        // 取消全选该组
        this.selectedFields = this.selectedFields.filter(key => 
          !groupFieldKeys.includes(key)
        )
      }
    },
    
    // 处理字段变化
    handleFieldChange() {
      this.updateFieldGroupStatus()
    },
    
    // 更新字段组状态
    updateFieldGroupStatus() {
      this.fieldGroups.forEach(group => {
        const groupFieldKeys = group.fields.map(field => field.key)
        const selectedCount = groupFieldKeys.filter(key => 
          this.selectedFields.includes(key)
        ).length
        
        group.checkAll = selectedCount === groupFieldKeys.length
        group.indeterminate = selectedCount > 0 && selectedCount < groupFieldKeys.length
      })
    },
    
    // 生成默认文件名
    generateDefaultFileName() {
      const now = new Date()
      const dateStr = now.toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_')
      this.fileName = `商品导出_${dateStr}`
    },
    
    // 更新预览信息
    updatePreview() {
      // 这里应该调用API获取预览信息
      this.$emit('preview-update', {
        filters: this.filters,
        fields: this.selectedFields
      })
    },
    
    // 获取导出配置
    getExportConfig() {
      return {
        filters: this.filters,
        fields: this.selectedFields,
        format: this.exportFormat,
        fileName: this.fileName || this.generateDefaultFileName()
      }
    },
    
    // 验证配置
    validateConfig() {
      if (this.selectedFields.length === 0) {
        this.$message.warning('请至少选择一个导出字段')
        return false
      }
      return true
    }
  }
}
</script>

<style scoped>
.export-config {
  width: 100%;
}

.export-config .el-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fields-selection {
  width: 100%;
}

.field-group {
  margin-bottom: 20px;
}

.group-header {
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.group-content {
  padding-left: 20px;
}

.field-checkbox {
  display: block;
  margin-bottom: 8px;
  margin-right: 0;
}

.preview-card {
  border: 2px dashed #dcdfe6;
  background-color: #fafafa;
}

.preview-content {
  padding: 10px 0;
}

.preview-item {
  text-align: center;
}

.preview-label {
  color: #606266;
  font-size: 14px;
}

.preview-value {
  color: #303133;
  font-size: 16px;
  font-weight: bold;
  margin-left: 5px;
}

/* 覆盖Element UI默认样式 */
.export-config >>> .el-card__header {
  padding: 15px 20px;
  background-color: #f5f7fa;
}

.export-config >>> .el-card__body {
  padding: 20px;
}

.export-config >>> .el-checkbox__label {
  font-size: 13px;
}

.export-config >>> .el-form-item {
  margin-bottom: 15px;
}
</style>