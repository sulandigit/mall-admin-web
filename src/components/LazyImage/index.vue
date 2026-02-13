<template>
  <div class="lazy-image-container" :style="containerStyle">
    <img
      v-if="loaded && !error"
      :src="finalSrc"
      :alt="alt"
      :class="['lazy-image', loadedClass]"
      :style="imageStyle"
      @load="onImageLoad"
      @error="onImageError"
    />
    <img
      v-else-if="error"
      :src="errorImage"
      :alt="alt"
      :class="['lazy-image', 'lazy-error']"
      :style="imageStyle"
    />
    <div
      v-else
      :class="['lazy-placeholder', loadingClass]"
      :style="placeholderStyle"
    >
      <img
        v-if="placeholder && !loading"
        :src="placeholder"
        :alt="alt"
        :style="imageStyle"
      />
      <div v-if="loading" class="loading-spinner">
        <i class="el-icon-loading"></i>
      </div>
    </div>
  </div>
</template>

<script>
import { lazyLoadManager } from '@/utils/lazyLoadManager'
import { webpManager } from '@/utils/webpManager'

export default {
  name: 'LazyImage',
  props: {
    // 图片源地址
    src: {
      type: String,
      default: ''
    },
    // WebP格式图片地址
    webpSrc: {
      type: String,
      default: ''
    },
    // 占位图片
    placeholder: {
      type: String,
      default: '/static/placeholder.png'
    },
    // 错误图片
    errorImage: {
      type: String,
      default: '/static/error.png'
    },
    // 图片宽度
    width: {
      type: [String, Number],
      default: 'auto'
    },
    // 图片高度
    height: {
      type: [String, Number],
      default: 'auto'
    },
    // 图片描述
    alt: {
      type: String,
      default: ''
    },
    // 是否启用WebP
    enableWebP: {
      type: Boolean,
      default: true
    },
    // 加载中样式类
    loadingClass: {
      type: String,
      default: 'lazy-loading'
    },
    // 加载完成样式类
    loadedClass: {
      type: String,
      default: 'lazy-loaded'
    },
    // 懒加载阈值
    threshold: {
      type: String,
      default: '50px'
    }
  },
  data() {
    return {
      loading: false,
      loaded: false,
      error: false,
      inView: false,
      observer: null,
      finalSrc: ''
    }
  },
  computed: {
    containerStyle() {
      const style = {}
      if (this.width !== 'auto') {
        style.width = typeof this.width === 'number' ? `${this.width}px` : this.width
      }
      if (this.height !== 'auto') {
        style.height = typeof this.height === 'number' ? `${this.height}px` : this.height
      }
      return style
    },
    imageStyle() {
      return {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }
    },
    placeholderStyle() {
      return {
        ...this.imageStyle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }
    }
  },
  mounted() {
    this.initLazyLoad()
  },
  beforeDestroy() {
    this.destroyObserver()
  },
  methods: {
    initLazyLoad() {
      // 创建Intersection Observer
      this.observer = new IntersectionObserver(
        this.handleIntersection,
        {
          rootMargin: this.threshold
        }
      )
      
      // 开始观察当前元素
      this.observer.observe(this.$el)
    },
    
    handleIntersection(entries) {
      const entry = entries[0]
      if (entry.isIntersecting && !this.loaded && !this.loading) {
        this.inView = true
        this.loadImage()
        // 停止观察，图片只需要加载一次
        this.destroyObserver()
      }
    },
    
    async loadImage() {
      if (this.loading || this.loaded) return
      
      this.loading = true
      this.error = false
      
      try {
        // 确定最终使用的图片URL
        this.finalSrc = await this.getFinalImageSrc()
        
        // 预加载图片
        await this.preloadImage(this.finalSrc)
        
        this.loaded = true
        this.loading = false
        
        // 触发加载完成事件
        this.$emit('load', {
          src: this.finalSrc,
          width: this.width,
          height: this.height
        })
        
        // 记录加载统计
        lazyLoadManager.recordLoadSuccess(this.finalSrc)
        
      } catch (error) {
        this.error = true
        this.loading = false
        
        // 触发错误事件
        this.$emit('error', error)
        
        // 记录错误统计
        lazyLoadManager.recordLoadError(this.finalSrc, error)
      }
    },
    
    async getFinalImageSrc() {
      // 如果启用WebP且浏览器支持
      if (this.enableWebP && webpManager.isSupported()) {
        // 优先使用提供的WebP地址
        if (this.webpSrc) {
          return this.webpSrc
        }
        // 或者尝试自动生成WebP URL
        if (this.src) {
          const webpUrl = webpManager.convertToWebPUrl(this.src)
          if (webpUrl !== this.src) {
            try {
              await this.preloadImage(webpUrl)
              return webpUrl
            } catch {
              // WebP加载失败，降级到原格式
              return this.src
            }
          }
        }
      }
      
      return this.src
    },
    
    preloadImage(src) {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
      })
    },
    
    onImageLoad() {
      this.$emit('imageLoad')
    },
    
    onImageError() {
      this.error = true
      this.$emit('imageError')
    },
    
    destroyObserver() {
      if (this.observer) {
        this.observer.disconnect()
        this.observer = null
      }
    },
    
    // 手动重新加载图片
    reload() {
      this.loaded = false
      this.error = false
      this.loading = false
      this.loadImage()
    }
  }
}
</script>

<style scoped>
.lazy-image-container {
  position: relative;
  overflow: hidden;
  background-color: #f5f5f5;
}

.lazy-image {
  transition: opacity 0.3s ease-in-out;
}

.lazy-placeholder {
  background-color: #f5f5f5;
  color: #999;
}

.lazy-loading {
  animation: pulse 1.5s ease-in-out infinite;
}

.lazy-loaded {
  opacity: 1;
}

.lazy-error {
  opacity: 0.6;
  filter: grayscale(100%);
}

.loading-spinner {
  font-size: 24px;
  color: #409eff;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>