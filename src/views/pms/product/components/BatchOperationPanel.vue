<template>
  <!-- 使用v-memo优化批量操作面板 -->
  <div 
    v-memo="panelMemoDeps" 
    class="batch-operation-panel"
    :class="{ 'has-selection': hasSelectedProducts }"
  >
    <div class="batch-controls">
      <div class="selection-info">
        <span class="selection-count">
          已选择 <strong>{{ selectedProductsCount }}</strong> 个商品
        </span>
        <el-button 
          v-if="hasSelectedProducts"
          type="text" 
          size="mini" 
          @click="handleClearSelection"
        >
          清空选择
        </el-button>
      </div>
      
      <div class="operation-controls">
        <el-select
          v-model="operateType"
          placeholder="批量操作"
          size="small"
          style="width: 150px"
          :disabled="!hasSelectedProducts || isProcessing"
        >
          <el-option-group label="状态操作">
            <el-option
              v-for="item in statusOperations"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-option-group>
          <el-option-group label="其他操作">
            <el-option
              v-for="item in otherOperations"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-option-group>
        </el-select>
        
        <el-button
          type="primary"
          size="small"
          :disabled="!operateType || !hasSelectedProducts"
          :loading="isProcessing"
          @click="handleBatchOperate"
          style="margin-left: 10px"
        >
          执行操作
        </el-button>
      </div>
    </div>
    
    <!-- 操作进度条 -->
    <div v-if="isProcessing" class="operation-progress">
      <el-progress 
        :percentage="progressPercentage" 
        :status="progressStatus"
        :show-text="false"
        :stroke-width="2"
      />
      <span class="progress-text">{{ progressText }}</span>
    </div>
    
    <!-- 操作历史（可选） -->
    <div v-if="showHistory && operationHistory.length > 0" class="operation-history">
      <div class="history-header">
        <span>最近操作</span>
        <el-button type="text" size="mini" @click="clearHistory">清空历史</el-button>
      </div>
      <div class="history-list">
        <div 
          v-for="(item, index) in recentHistory" 
          :key="index"
          class="history-item"
        >
          <span class="history-action">{{ item.actionText }}</span>
          <span class="history-count">{{ item.count }}个商品</span>
          <span class="history-time">{{ formatTime(item.timestamp) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BatchOperationPanel',
  
  props: {
    selectedProducts: {
      type: Array,
      default: () => []
    },
    batchOperations: {
      type: Object,
      default: () => ({})
    },
    showHistory: {
      type: Boolean,
      default: true
    }
  },
  
  data() {
    return {
      operateType: null,
      isProcessing: false,
      progressPercentage: 0,
      progressStatus: '',
      progressText: '',
      
      // 操作历史
      operationHistory: [],
      
      // 状态操作选项
      statusOperations: [
        { label: '商品上架', value: 'publishOn' },
        { label: '商品下架', value: 'publishOff' },
        { label: '设为推荐', value: 'recommendOn' },
        { label: '取消推荐', value: 'recommendOff' },
        { label: '设为新品', value: 'newOn' },
        { label: '取消新品', value: 'newOff' }
      ],
      
      // 其他操作选项
      otherOperations: [
        { label: '转移到分类', value: 'transferCategory' },
        { label: '移入回收站', value: 'recycle' },
        { label: '批量删除', value: 'batchDelete' }
      ]
    }
  },
  
  computed: {
    // 是否有选中的商品
    hasSelectedProducts() {
      return this.selectedProducts && this.selectedProducts.length > 0
    },
    
    // 选中商品数量
    selectedProductsCount() {
      return this.selectedProducts ? this.selectedProducts.length : 0
    },
    
    // 面板memo依赖
    panelMemoDeps() {
      return [
        this.selectedProductsCount,
        this.operateType,
        this.isProcessing,
        this.progressPercentage
      ]
    },
    
    // 最近的操作历史（只显示最近5条）
    recentHistory() {
      return this.operationHistory.slice(0, 5)
    }
  },
  
  watch: {
    // 监听选中商品变化，自动清空操作类型
    selectedProducts() {
      if (!this.hasSelectedProducts) {
        this.operateType = null
      }
    }
  },
  
  methods: {
    // 执行批量操作
    async handleBatchOperate() {
      if (!this.operateType || !this.hasSelectedProducts) {
        this.$message.warning('请选择操作类型和商品')
        return
      }
      
      // 确认操作
      const operationLabel = this.getOperationLabel(this.operateType)
      try {
        await this.$confirm(
          `确定要对${this.selectedProductsCount}个商品执行"${operationLabel}"操作吗？`,
          '批量操作确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
      } catch {
        return // 用户取消
      }
      
      // 开始处理
      this.startProcessing(operationLabel)
      
      try {
        // 模拟批量处理进度
        await this.simulateProgress()
        
        // 触发批量操作事件
        this.$emit('batch-operate', this.operateType)
        
        // 记录操作历史
        this.recordOperation(operationLabel, this.selectedProductsCount)
        
        // 操作成功
        this.finishProcessing('success', `${operationLabel}操作完成`)
        
        // 清空操作类型
        this.operateType = null
        
      } catch (error) {
        this.finishProcessing('exception', `${operationLabel}操作失败`)
        throw error
      }
    },
    
    // 清空选择
    handleClearSelection() {
      this.$emit('clear-selection')
      this.operateType = null
    },
    
    // 开始处理
    startProcessing(actionText) {
      this.isProcessing = true
      this.progressPercentage = 0
      this.progressStatus = ''
      this.progressText = `正在执行${actionText}...`
    },
    
    // 结束处理
    finishProcessing(status, message) {
      this.progressPercentage = 100
      this.progressStatus = status
      this.progressText = message
      
      // 延迟隐藏进度条
      setTimeout(() => {
        this.isProcessing = false
        this.progressPercentage = 0
        this.progressStatus = ''
        this.progressText = ''
      }, 2000)
    },
    
    // 模拟进度更新
    async simulateProgress() {
      const steps = 10
      const stepDelay = 100
      
      for (let i = 1; i <= steps; i++) {
        await new Promise(resolve => setTimeout(resolve, stepDelay))
        this.progressPercentage = (i / steps) * 90 // 保留10%给实际处理
      }
    },
    
    // 获取操作标签
    getOperationLabel(value) {
      const allOperations = [...this.statusOperations, ...this.otherOperations]
      const operation = allOperations.find(op => op.value === value)
      return operation ? operation.label : value
    },
    
    // 记录操作历史
    recordOperation(actionText, count) {
      this.operationHistory.unshift({
        actionText,
        count,
        timestamp: Date.now()
      })
      
      // 只保留最近20条历史
      if (this.operationHistory.length > 20) {
        this.operationHistory = this.operationHistory.slice(0, 20)
      }
    },
    
    // 清空历史
    clearHistory() {
      this.operationHistory = []
    },
    
    // 格式化时间
    formatTime(timestamp) {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) { // 1分钟内
        return '刚刚'
      } else if (diff < 3600000) { // 1小时内
        return `${Math.floor(diff / 60000)}分钟前`
      } else if (diff < 86400000) { // 1天内
        return `${Math.floor(diff / 3600000)}小时前`
      } else {
        return date.toLocaleDateString()
      }
    }
  }
}
</script>

<style scoped>
.batch-operation-panel {
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.batch-operation-panel.has-selection {
  border-color: #409eff;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.1);
}

.batch-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.selection-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.selection-count {
  color: #606266;
  font-size: 14px;
}

.selection-count strong {
  color: #409eff;
  font-weight: 600;
}

.operation-controls {
  display: flex;
  align-items: center;
}

.operation-progress {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-text {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}

.operation-history {
  margin-top: 16px;
  border-top: 1px solid #ebeef5;
  padding-top: 16px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.history-header span {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.history-list {
  max-height: 120px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  margin-bottom: 4px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
}

.history-action {
  color: #303133;
  font-weight: 500;
}

.history-count {
  color: #409eff;
}

.history-time {
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .batch-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .selection-info {
    justify-content: center;
  }
  
  .operation-controls {
    justify-content: center;
  }
  
  .operation-progress {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
}

/* 空状态样式 */
.batch-operation-panel:not(.has-selection) {
  opacity: 0.6;
}

.batch-operation-panel:not(.has-selection) .operation-controls {
  pointer-events: none;
}

/* 动画效果 */
.operation-progress {
  animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>