<template>
  <!-- 使用v-memo优化价格单元格 -->
  <div v-memo="memoDeps" class="product-price-cell">
    <p class="price">价格：<span class="price-value">￥{{ formatPrice(product.price) }}</span></p>
    <p class="product-sn">货号：{{ product.productSn }}</p>
  </div>
</template>

<script>
export default {
  name: 'ProductPriceCell',
  
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
  
  methods: {
    // 格式化价格显示
    formatPrice(price) {
      if (price == null || price === '') return '0.00'
      return parseFloat(price).toFixed(2)
    }
  }
}
</script>

<style scoped>
.product-price-cell {
  text-align: left;
  padding: 5px 10px;
}

.price {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #303133;
}

.price-value {
  font-weight: 600;
  color: #E6A23C;
}

.product-sn {
  margin: 0;
  color: #909399;
  font-size: 12px;
}
</style>