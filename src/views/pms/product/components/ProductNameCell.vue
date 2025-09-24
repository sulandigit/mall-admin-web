<template>
  <!-- 使用v-memo优化商品名称单元格 -->
  <div v-memo="memoDeps" class="product-name-cell">
    <p class="product-name">{{ product.name }}</p>
    <p class="product-brand">品牌：{{ product.brandName }}</p>
  </div>
</template>

<script>
export default {
  name: 'ProductNameCell',
  
  props: {
    product: {
      type: Object,
      required: true
    },
    memoDeps: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped>
.product-name-cell {
  text-align: left;
  padding: 5px 10px;
}

.product-name {
  margin: 0 0 5px 0;
  font-weight: 500;
  color: #303133;
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
}

.product-brand {
  margin: 0;
  color: #909399;
  font-size: 12px;
  line-height: 1.2;
}
</style>