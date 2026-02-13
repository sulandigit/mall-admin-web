<template>
  <!-- 使用v-memo优化SKU库存单元格 -->
  <div v-memo="memoDeps" class="sku-stock-cell">
    <el-button 
      type="primary" 
      icon="el-icon-edit" 
      @click="handleShowSkuEdit" 
      circle 
      size="mini"
      :loading="isLoading"
    />
  </div>
</template>

<script>
export default {
  name: 'SkuStockCell',
  
  props: {
    product: {
      type: Object,
      required: true
    },
    memoDeps: {
      type: Array,
      default: () => []
    }
  },
  
  data() {
    return {
      isLoading: false
    }
  },
  
  methods: {
    async handleShowSkuEdit() {
      if (this.isLoading) return
      
      this.isLoading = true
      
      try {
        // 模拟异步操作延迟
        await new Promise(resolve => setTimeout(resolve, 100))
        
        this.$emit('show-sku-edit', {
          index: this.$parent.$index,
          product: this.product
        })
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>

<style scoped>
.sku-stock-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
}

.el-button--mini.is-circle {
  width: 24px;
  height: 24px;
  padding: 0;
}
</style>