<template>
  <!-- 使用v-memo优化操作按钮单元格 -->
  <div v-memo="memoDeps" class="product-action-buttons">
    <div class="button-row">
      <el-button
        size="mini"
        @click="handleView"
        :disabled="isProcessing"
      >
        查看
      </el-button>
      <el-button
        size="mini"
        @click="handleEdit"
        :disabled="isProcessing"
      >
        编辑
      </el-button>
    </div>
    <div class="button-row">
      <el-button
        size="mini"
        @click="handleViewLog"
        :disabled="isProcessing"
      >
        日志
      </el-button>
      <el-button
        size="mini"
        type="danger"
        @click="handleDelete"
        :disabled="isProcessing"
      >
        删除
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductActionButtons',
  
  props: {
    product: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    memoDeps: {
      type: Array,
      default: () => []
    }
  },
  
  data() {
    return {
      isProcessing: false
    }
  },
  
  methods: {
    // 查看商品
    async handleView() {
      await this.executeAction('view')
    },
    
    // 编辑商品
    async handleEdit() {
      await this.executeAction('edit')
    },
    
    // 查看日志
    async handleViewLog() {
      await this.executeAction('log')
    },
    
    // 删除商品
    async handleDelete() {
      if (this.isProcessing) return
      
      try {
        await this.$confirm('确定要删除这个商品吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await this.executeAction('delete')
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除操作失败:', error)
        }
      }
    },
    
    // 执行操作的通用方法
    async executeAction(action) {
      if (this.isProcessing) return
      
      this.isProcessing = true
      
      try {
        // 添加小延迟避免重复点击
        await new Promise(resolve => setTimeout(resolve, 100))
        
        this.$emit(action, {
          index: this.index,
          product: this.product
        })
      } finally {
        // 延迟重置处理状态
        setTimeout(() => {
          this.isProcessing = false
        }, 200)
      }
    }
  }
}
</script>

<style scoped>
.product-action-buttons {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 5px;
}

.button-row {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.el-button--mini {
  padding: 4px 8px;
  font-size: 12px;
  min-width: 50px;
}

/* 处理状态时的视觉反馈 */
.product-action-buttons .el-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 悬停效果优化 */
.el-button--mini:not(:disabled):hover {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}

.el-button--mini:not(:disabled):active {
  transform: translateY(0);
}
</style>