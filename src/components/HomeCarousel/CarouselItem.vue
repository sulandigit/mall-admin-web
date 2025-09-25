<template>
  <div 
    class="carousel-item"
    :class="{ 'is-active': isActive }"
    @click="handleClick"
  >
    <!-- 图片容器 -->
    <div class="carousel-item-image">
      <img 
        :src="imageUrl" 
        :alt="title"
        @load="handleImageLoad"
        @error="handleImageError"
        :class="{ 'loaded': imageLoaded, 'error': imageError }"
      />
      
      <!-- 加载占位符 -->
      <div v-if="!imageLoaded && !imageError" class="image-placeholder">
        <i class="el-icon-loading"></i>
        <span>加载中...</span>
      </div>
      
      <!-- 错误占位符 -->
      <div v-if="imageError" class="image-error">
        <i class="el-icon-picture-outline"></i>
        <span>图片加载失败</span>
      </div>
      
      <!-- 遮罩层 -->
      <div class="carousel-item-overlay" v-if="title || linkUrl">
        <!-- 标题 -->
        <div v-if="title" class="carousel-item-title">
          {{ title }}
        </div>
        
        <!-- 链接提示 -->
        <div v-if="linkUrl" class="carousel-item-link-hint">
          <i class="el-icon-link"></i>
          <span>点击查看详情</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CarouselItem',
  props: {
    // 图片地址
    imageUrl: {
      type: String,
      required: true
    },
    // 标题文本
    title: {
      type: String,
      default: ''
    },
    // 点击跳转链接
    linkUrl: {
      type: String,
      default: ''
    },
    // 是否为当前激活项
    isActive: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      imageLoaded: false,
      imageError: false
    }
  },
  methods: {
    /**
     * 处理图片加载成功
     */
    handleImageLoad() {
      this.imageLoaded = true
      this.imageError = false
      this.$emit('image-load')
    },
    
    /**
     * 处理图片加载失败
     */
    handleImageError() {
      this.imageLoaded = false
      this.imageError = true
      this.$emit('image-error')
    },
    
    /**
     * 处理点击事件
     */
    handleClick() {
      const item = {
        imageUrl: this.imageUrl,
        title: this.title,
        linkUrl: this.linkUrl
      }
      
      // 触发点击事件
      this.$emit('click', item)
      
      // 如果有链接，打开新窗口
      if (this.linkUrl) {
        window.open(this.linkUrl, '_blank')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.carousel-item {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  position: relative;
  cursor: pointer;
  overflow: hidden;
}

.carousel-item-image {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #f5f7fa;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.3s;
    opacity: 0;
    
    &.loaded {
      opacity: 1;
    }
    
    &.error {
      display: none;
    }
  }
}

.image-placeholder,
.image-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 16px;
  background: #f5f7fa;
  
  i {
    font-size: 48px;
    margin-bottom: 12px;
  }
}

.image-error {
  color: #F56C6C;
}

.carousel-item-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: 40px 30px 20px;
  transform: translateY(100%);
  transition: transform 0.3s;
}

.carousel-item:hover .carousel-item-overlay {
  transform: translateY(0);
}

.carousel-item-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  line-height: 1.4;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.carousel-item-link-hint {
  display: flex;
  align-items: center;
  font-size: 14px;
  opacity: 0.9;
  
  i {
    margin-right: 6px;
    font-size: 16px;
  }
}

// 悬停效果
.carousel-item:hover {
  .carousel-item-image img.loaded {
    transform: scale(1.05);
  }
}

// 激活状态
.carousel-item.is-active {
  .carousel-item-image img.loaded {
    animation: fadeInScale 0.5s ease-out;
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(1.1);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .carousel-item-overlay {
    padding: 20px 15px 15px;
  }
  
  .carousel-item-title {
    font-size: 18px;
    margin-bottom: 6px;
  }
  
  .carousel-item-link-hint {
    font-size: 12px;
    
    i {
      font-size: 14px;
    }
  }
  
  .image-placeholder,
  .image-error {
    font-size: 14px;
    
    i {
      font-size: 32px;
      margin-bottom: 8px;
    }
  }
}

@media (max-width: 480px) {
  .carousel-item-overlay {
    padding: 15px 10px 10px;
  }
  
  .carousel-item-title {
    font-size: 16px;
  }
  
  .carousel-item-link-hint {
    font-size: 11px;
  }
}
</style>