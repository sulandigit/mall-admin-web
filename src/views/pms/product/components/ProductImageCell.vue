<template>
  <!-- 使用v-memo优化图片单元格渲染 -->
  <div v-memo="memoDeps" class="product-image-cell">
    <img 
      :src="product.pic" 
      :alt="product.name"
      class="product-image"
      loading="lazy"
      @error="handleImageError"
      @load="handleImageLoad"
    />
  </div>
</template>

<script>
export default {
  name: 'ProductImageCell',
  
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
    // 图片加载错误处理
    handleImageError(event) {
      event.target.src = require('@/assets/images/default-product.png')
    },
    
    // 图片加载完成
    handleImageLoad(event) {
      event.target.classList.add('loaded')
    }
  }
}
</script>

<style scoped>
.product-image-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
}

.product-image {
  height: 80px;
  max-width: 100px;
  object-fit: cover;
  border-radius: 4px;
  transition: opacity 0.3s ease;
  opacity: 0;
}

.product-image.loaded {
  opacity: 1;
}

.product-image:hover {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}
</style>