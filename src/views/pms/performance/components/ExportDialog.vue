<template>
  <el-dialog
    title="导出报告"
    :visible="value"
    @input="$emit('input', $event)"
    width="500px"
    :close-on-click-modal="false">
    
    <el-form :model="exportConfig" label-width="100px">
      <el-form-item label="报告格式">
        <el-radio-group v-model="exportConfig.format">
          <el-radio label="pdf">PDF报告</el-radio>
          <el-radio label="excel">Excel报告</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="报告内容">
        <el-checkbox-group v-model="exportConfig.sections">
          <el-checkbox label="summary">概览数据</el-checkbox>
          <el-checkbox label="trends">趋势分析</el-checkbox>
          <el-checkbox label="ranking">商品排行</el-checkbox>
          <el-checkbox label="category">分类分析</el-checkbox>
          <el-checkbox label="inventory">库存状态</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="时间范围">
        <el-radio-group v-model="exportConfig.timeRange">
          <el-radio label="current">当前筛选时间</el-radio>
          <el-radio label="custom">自定义时间</el-radio>
        </el-radio-group>
        
        <el-date-picker
          v-if="exportConfig.timeRange === 'custom'"
          v-model="exportConfig.customRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          style="width: 100%; margin-top: 10px;">
        </el-date-picker>
      </el-form-item>

      <el-form-item label="报告详情" v-if="exportConfig.format === 'pdf'">
        <el-checkbox-group v-model="exportConfig.pdfOptions">
          <el-checkbox label="charts">包含图表</el-checkbox>
          <el-checkbox label="tables">包含数据表</el-checkbox>
          <el-checkbox label="analysis">包含分析建议</el-checkbox>
          <el-checkbox label="watermark">添加水印</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="Excel选项" v-if="exportConfig.format === 'excel'">
        <el-checkbox-group v-model="exportConfig.excelOptions">
          <el-checkbox label="rawData">原始数据</el-checkbox>
          <el-checkbox label="pivot">数据透视表</el-checkbox>
          <el-checkbox label="charts">图表工作表</el-checkbox>
          <el-checkbox label="formulas">计算公式</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="报告名称">
        <el-input 
          v-model="exportConfig.fileName"
          placeholder="请输入报告文件名">
        </el-input>
      </el-form-item>

      <el-form-item label="发送方式">
        <el-checkbox-group v-model="exportConfig.deliveryMethods">
          <el-checkbox label="download">直接下载</el-checkbox>
          <el-checkbox label="email">邮件发送</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="邮件地址" v-if="exportConfig.deliveryMethods.includes('email')">
        <el-input 
          v-model="exportConfig.emailAddress"
          placeholder="请输入邮箱地址">
        </el-input>
      </el-form-item>
    </el-form>

    <div class="export-preview" v-if="exportConfig.sections.length > 0">
      <h4>报告预览</h4>
      <div class="preview-sections">
        <el-tag 
          v-for="section in selectedSections"
          :key="section.value"
          size="small"
          style="margin: 2px;">
          {{ section.label }}
        </el-tag>
      </div>
      <div class="preview-info">
        <p><strong>格式:</strong> {{ exportConfig.format.toUpperCase() }}</p>
        <p><strong>预计大小:</strong> {{ estimatedSize }}</p>
        <p><strong>预计时间:</strong> {{ estimatedTime }}</p>
      </div>
    </div>

    <span slot="footer">
      <el-button @click="$emit('input', false)">取消</el-button>
      <el-button 
        type="primary" 
        @click="handleExport"
        :loading="exporting">
        {{ exporting ? '导出中...' : '开始导出' }}
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'ExportDialog',
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      exporting: false,
      exportConfig: {
        format: 'pdf',
        sections: ['summary', 'trends', 'ranking'],
        timeRange: 'current',
        customRange: [],
        pdfOptions: ['charts', 'tables'],
        excelOptions: ['rawData', 'pivot'],
        fileName: '',
        deliveryMethods: ['download'],
        emailAddress: ''
      },
      sectionOptions: [
        { value: 'summary', label: '概览数据' },
        { value: 'trends', label: '趋势分析' },
        { value: 'ranking', label: '商品排行' },
        { value: 'category', label: '分类分析' },
        { value: 'inventory', label: '库存状态' }
      ]
    }
  },
  computed: {
    selectedSections() {
      return this.sectionOptions.filter(option => 
        this.exportConfig.sections.includes(option.value)
      )
    },
    
    estimatedSize() {
      const baseSize = this.exportConfig.format === 'pdf' ? 2 : 1
      const sectionCount = this.exportConfig.sections.length
      const totalSize = baseSize + (sectionCount * 0.5)
      return totalSize.toFixed(1) + 'MB'
    },
    
    estimatedTime() {
      const sectionCount = this.exportConfig.sections.length
      const baseTime = this.exportConfig.format === 'pdf' ? 30 : 15
      const totalTime = baseTime + (sectionCount * 10)
      return totalTime + '秒'
    }
  },
  watch: {
    value(newVal) {
      if (newVal) {
        this.resetConfig()
      }
    }
  },
  methods: {
    // 重置配置
    resetConfig() {
      this.exportConfig.fileName = `商品性能分析报告_${new Date().toLocaleDateString()}`
    },

    // 处理导出
    async handleExport() {
      // 验证配置
      if (this.exportConfig.sections.length === 0) {
        this.$message.warning('请至少选择一个报告内容')
        return
      }

      if (!this.exportConfig.fileName.trim()) {
        this.$message.warning('请输入报告文件名')
        return
      }

      if (this.exportConfig.deliveryMethods.includes('email') && !this.exportConfig.emailAddress.trim()) {
        this.$message.warning('请输入邮箱地址')
        return
      }

      this.exporting = true
      
      try {
        await this.$emit('export', {
          format: this.exportConfig.format,
          options: { ...this.exportConfig }
        })
        
        this.$message.success('报告导出成功')
        this.$emit('input', false)
      } catch (error) {
        this.$message.error('报告导出失败')
        console.error('Export failed:', error)
      } finally {
        this.exporting = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.export-preview {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;

  h4 {
    margin: 0 0 10px 0;
    color: #303133;
  }

  .preview-sections {
    margin-bottom: 10px;
  }

  .preview-info {
    font-size: 12px;
    color: #606266;

    p {
      margin: 5px 0;
    }
  }
}

// 表单样式调整
:deep(.el-form) {
  .el-form-item {
    margin-bottom: 20px;
  }

  .el-checkbox-group {
    .el-checkbox {
      display: block;
      margin-bottom: 8px;
      margin-right: 0;
    }
  }

  .el-radio-group {
    .el-radio {
      display: block;
      margin-bottom: 8px;
      margin-right: 0;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  :deep(.el-dialog) {
    width: 90% !important;
    margin: 5vh auto;
  }
}
</style>