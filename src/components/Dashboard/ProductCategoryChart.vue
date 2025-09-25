<template>
  <el-card class="chart-card">
    <div slot="header" class="chart-header">
      <span class="chart-title">商品分类销售分布</span>
      <div class="chart-controls">
        <el-button 
          size="mini" 
          icon="el-icon-refresh" 
          @click="handleRefresh"
          :loading="loading"
        >
          刷新
        </el-button>
      </div>
    </div>
    
    <div class="chart-content" v-loading="loading">
      <ve-pie 
        :data="chartData"
        :settings="pieSettings"
        :extend="chartExtend"
        :height="height"
      />
    </div>
    
    <div class="category-stats">
      <div 
        v-for="(item, index) in categoryData" 
        :key="index"
        class="category-item"
      >
        <div class="category-indicator" :style="{ backgroundColor: colors[index % colors.length] }"></div>
        <div class="category-info">
          <div class="category-name">{{ item.name }}</div>
          <div class="category-value">{{ item.value }}%</div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'ProductCategoryChart',
  
  props: {
    height: {
      type: String,
      default: '300px'
    }
  },
  
  data() {
    return {
      colors: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
    }
  },
  
  computed: {
    ...mapState('salesDashboard', ['productPerformance', 'uiState']),
    
    loading() {
      return this.uiState.loading
    },
    
    categoryData() {
      return this.productPerformance.categoryDistribution || []
    },
    
    chartData() {
      return {
        columns: ['分类', '占比'],
        rows: this.categoryData.map(item => ({
          '分类': item.name,
          '占比': item.value
        }))
      }
    },
    
    pieSettings() {
      return {
        dimension: ['分类'],
        metrics: ['占比']
      }
    },
    
    chartExtend() {
      return {
        color: this.colors,
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c}% ({d}%)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: 'transparent',
          textStyle: {
            color: '#fff'
          }
        },
        legend: {
          show: false
        },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          }
        }]
      }
    }
  },
  
  methods: {
    handleRefresh() {
      this.$store.dispatch('salesDashboard/fetchProductPerformance')
    }
  }
}
</script>

<style lang="scss" scoped>
.chart-card {
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .chart-title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }
  }
  
  .chart-content {
    min-height: 300px;
  }
  
  .category-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
    margin-top: 16px;
    
    .category-item {
      display: flex;
      align-items: center;
      padding: 8px;
      background: #F8F9FA;
      border-radius: 4px;
      
      .category-indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-right: 8px;
      }
      
      .category-info {
        flex: 1;
        
        .category-name {
          font-size: 12px;
          color: #606266;
          margin-bottom: 2px;
        }
        
        .category-value {
          font-size: 14px;
          font-weight: 500;
          color: #303133;
        }
      }
    }
  }
}
</style>