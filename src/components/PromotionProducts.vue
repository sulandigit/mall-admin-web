<template>
  <div class="promotion-products">
    <h2 class="section-title">
      <i class="el-icon-goods"></i>
      限时促销商品
    </h2>
    
    <!-- 商品筛选 -->
    <div class="filter-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-select v-model="filterCategory" placeholder="商品分类" clearable @change="handleFilter">
            <el-option label="全部分类" value=""></el-option>
            <el-option label="电子产品" value="electronics"></el-option>
            <el-option label="服装鞋帽" value="clothing"></el-option>
            <el-option label="家居用品" value="home"></el-option>
            <el-option label="运动户外" value="sports"></el-option>
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="priceRange" placeholder="价格区间" clearable @change="handleFilter">
            <el-option label="全部价格" value=""></el-option>
            <el-option label="0-100元" value="0-100"></el-option>
            <el-option label="100-500元" value="100-500"></el-option>
            <el-option label="500-1000元" value="500-1000"></el-option>
            <el-option label="1000元以上" value="1000+"></el-option>
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="sortBy" placeholder="排序方式" @change="handleSort">
            <el-option label="综合排序" value="default"></el-option>
            <el-option label="价格从低到高" value="price_asc"></el-option>
            <el-option label="价格从高到低" value="price_desc"></el-option>
            <el-option label="折扣最大" value="discount_desc"></el-option>
            <el-option label="销量最高" value="sales_desc"></el-option>
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="refreshProducts" :loading="loading">
            <i class="el-icon-refresh"></i>
            刷新
          </el-button>
        </el-col>
      </el-row>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-spinner">
      <div class="spinner"></div>
    </div>
    
    <!-- 商品网格 -->
    <div v-else class="product-grid">
      <div 
        v-for="product in filteredProducts" 
        :key="product.id"
        class="product-card"
        @click="handleProductClick(product)">
        
        <div class="product-image-wrapper">
          <img 
            :src="product.image || '/static/images/default-product.png'" 
            :alt="product.name"
            class="product-image"
            @error="handleImageError"
          />
          <div v-if="product.discount > 0" class="discount-badge">
            {{ Math.round(product.discount * 10) }}折
          </div>
          <div v-if="product.isHot" class="hot-badge">
            HOT
          </div>
        </div>
        
        <div class="product-info">
          <h3 class="product-name" :title="product.name">{{ product.name }}</h3>
          
          <div class="product-price">
            <span class="current-price">¥{{ product.promotionPrice }}</span>
            <span v-if="product.originalPrice > product.promotionPrice" class="original-price">
              ¥{{ product.originalPrice }}
            </span>
            <span v-if="product.discount > 0" class="discount-text">
              {{ Math.round(product.discount * 10) }}折
            </span>
          </div>
          
          <div class="product-meta">
            <span class="sales-count">已售{{ product.salesCount || 0 }}件</span>
            <span v-if="product.stock !== undefined" class="stock-info">
              库存{{ product.stock }}
            </span>
          </div>
          
          <div class="product-actions">
            <el-button 
              type="primary" 
              size="small" 
              @click.stop="handleAddToCart(product)"
              :disabled="product.stock === 0">
              {{ product.stock === 0 ? '已售罄' : '立即购买' }}
            </el-button>
            <el-button 
              type="default" 
              size="small" 
              @click.stop="handleAddToWishlist(product)"
              icon="el-icon-star-off">
            </el-button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-if="!loading && filteredProducts.length === 0" class="empty-state">
      <i class="el-icon-goods" style="font-size: 4rem; color: #ddd;"></i>
      <p>暂无促销商品</p>
    </div>
    
    <!-- 加载更多 -->
    <div v-if="hasMore" class="load-more">
      <el-button @click="loadMore" :loading="loadingMore">
        加载更多
      </el-button>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'PromotionProducts',
  data() {
    return {
      filterCategory: '',
      priceRange: '',
      sortBy: 'default',
      loadingMore: false,
      hasMore: true
    }
  },
  computed: {
    ...mapState('holidayPromotion', [
      'promotionProducts',
      'isLoading'
    ]),
    
    loading() {
      return this.isLoading
    },
    
    filteredProducts() {
      let products = [...this.promotionProducts]
      
      // 分类筛选
      if (this.filterCategory) {
        products = products.filter(product => product.category === this.filterCategory)
      }
      
      // 价格筛选
      if (this.priceRange) {
        products = products.filter(product => {
          const price = product.promotionPrice || product.originalPrice
          switch (this.priceRange) {
            case '0-100':
              return price >= 0 && price <= 100
            case '100-500':
              return price > 100 && price <= 500
            case '500-1000':
              return price > 500 && price <= 1000
            case '1000+':
              return price > 1000
            default:
              return true
          }
        })
      }
      
      // 排序
      switch (this.sortBy) {
        case 'price_asc':
          products.sort((a, b) => (a.promotionPrice || a.originalPrice) - (b.promotionPrice || b.originalPrice))
          break
        case 'price_desc':
          products.sort((a, b) => (b.promotionPrice || b.originalPrice) - (a.promotionPrice || a.originalPrice))
          break
        case 'discount_desc':
          products.sort((a, b) => (b.discount || 0) - (a.discount || 0))
          break
        case 'sales_desc':
          products.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
          break
        case 'default':
        default:
          // 保持原有顺序，可以根据priority字段排序
          products.sort((a, b) => (b.priority || 0) - (a.priority || 0))
          break
      }
      
      return products
    }
  },
  mounted() {
    this.loadProducts()
  },
  methods: {
    ...mapActions('holidayPromotion', [
      'fetchPromotionProducts'
    ]),
    
    async loadProducts() {
      try {
        await this.fetchPromotionProducts({
          category: this.filterCategory,
          priceRange: this.priceRange
        })
      } catch (error) {
        this.$message.error('获取促销商品失败')
        console.error('获取促销商品失败:', error)
      }
    },
    
    handleFilter() {
      this.loadProducts()
    },
    
    handleSort() {
      // 排序在computed中处理
    },
    
    refreshProducts() {
      this.loadProducts()
    },
    
    async loadMore() {
      this.loadingMore = true
      try {
        // 这里应该实现分页加载逻辑
        await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟加载
        this.hasMore = false // 假设没有更多数据
      } catch (error) {
        this.$message.error('加载更多商品失败')
      } finally {
        this.loadingMore = false
      }
    },
    
    handleProductClick(product) {
      // 跳转到商品详情页
      this.$router.push(`/product/${product.id}`)
      this.$emit('product-click', product)
    },
    
    handleAddToCart(product) {
      if (product.stock === 0) {
        this.$message.warning('商品已售罄')
        return
      }
      
      // 这里应该调用加入购物车的API
      this.$message.success(`已将 ${product.name} 加入购物车`)
      this.$emit('add-to-cart', product)
    },
    
    handleAddToWishlist(product) {
      // 这里应该调用加入收藏的API
      this.$message.success(`已将 ${product.name} 加入收藏`)
      this.$emit('add-to-wishlist', product)
    },
    
    handleImageError(event) {
      event.target.src = '/static/images/default-product.png'
    }
  }
}
</script>

<style scoped>
.promotion-products {
  margin-bottom: 30px;
}

.section-title {
  font-size: 1.8rem;
  color: #fff;
  text-align: center;
  margin-bottom: 20px;
  font-weight: bold;
}

.filter-section {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  padding: 0 20px;
}

.product-card {
  background: #fff;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 8px 16px rgba(255, 71, 87, 0.3);
  transition: all 0.3s ease;
  animation: slideInUp 0.6s ease-out;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(255, 71, 87, 0.4);
}

.product-image-wrapper {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.discount-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #FF4757;
  color: #fff;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.hot-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #FFD700;
  color: #333;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.product-info {
  padding: 15px;
}

.product-name {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 2.4em;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.current-price {
  font-size: 1.5rem;
  color: #FF4757;
  font-weight: bold;
}

.original-price {
  text-decoration: line-through;
  color: #999;
  font-size: 1rem;
}

.discount-text {
  background: #FF4757;
  color: #fff;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: bold;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-size: 0.9rem;
  color: #666;
}

.stock-info {
  color: #28a745;
}

.product-actions {
  display: flex;
  gap: 10px;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #fff;
}

.empty-state p {
  margin-top: 20px;
  font-size: 1.1rem;
}

.load-more {
  text-align: center;
  margin-top: 30px;
}

@keyframes slideInUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    padding: 0 10px;
  }
  
  .filter-section {
    padding: 15px;
  }
  
  .product-name {
    font-size: 1rem;
  }
  
  .current-price {
    font-size: 1.3rem;
  }
}

@media (max-width: 480px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>