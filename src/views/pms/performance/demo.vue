<template>
  <div class="demo-page">
    <!-- 演示说明头部 -->
    <div class="demo-header">
      <el-alert
        title="📊 商品性能分析报告 - 演示模式"
        type="info"
        show-icon
        :closable="false">
        <template slot="description">
          <p>这是一个完整的商品性能分析系统演示，包含了所有核心功能和真实的数据展示效果。</p>
          <div class="demo-features">
            <el-tag size="small" style="margin: 2px;">多维度筛选</el-tag>
            <el-tag size="small" style="margin: 2px;">数据可视化</el-tag>
            <el-tag size="small" style="margin: 2px;">实时图表</el-tag>
            <el-tag size="small" style="margin: 2px;">报告导出</el-tag>
            <el-tag size="small" style="margin: 2px;">响应式设计</el-tag>
          </div>
        </template>
      </el-alert>
    </div>

    <!-- 演示控制面板 -->
    <div class="demo-controls">
      <el-card shadow="never">
        <div slot="header">
          <span>🎮 演示控制面板</span>
        </div>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-button-group style="width: 100%;">
              <el-button 
                :type="demoMode === 'mock' ? 'primary' : ''"
                @click="setDemoMode('mock')"
                style="flex: 1;">
                模拟数据模式
              </el-button>
              <el-button 
                :type="demoMode === 'real' ? 'primary' : ''"
                @click="setDemoMode('real')"
                style="flex: 1;">
                真实API模式
              </el-button>
            </el-button-group>
          </el-col>
          <el-col :span="8">
            <el-button 
              type="success" 
              icon="el-icon-refresh"
              @click="refreshDemoData"
              style="width: 100%;">
              刷新演示数据
            </el-button>
          </el-col>
          <el-col :span="8">
            <el-button 
              type="warning" 
              icon="el-icon-lightning"
              @click="simulateRealtimeUpdate"
              style="width: 100%;">
              模拟实时更新
            </el-button>
          </el-col>
        </el-row>
        
        <div class="demo-status" style="margin-top: 15px;">
          <el-descriptions :column="3" size="small" border>
            <el-descriptions-item label="当前模式">
              <el-tag :type="demoMode === 'mock' ? 'success' : 'info'">
                {{ demoMode === 'mock' ? '模拟数据' : '真实API' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="数据更新时间">
              {{ lastUpdateTime }}
            </el-descriptions-item>
            <el-descriptions-item label="演示状态">
              <el-tag type="success">运行中</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-card>
    </div>

    <!-- 主要功能演示区域 -->
    <div class="demo-content">
      <!-- 嵌入实际的商品性能分析组件 -->
      <product-performance-main ref="performanceMain" />
    </div>

    <!-- 演示说明面板 -->
    <div class="demo-instructions">
      <el-collapse v-model="activeInstructions">
        <el-collapse-item title="📋 功能演示说明" name="1">
          <div class="instruction-content">
            <h4>🎯 核心功能演示</h4>
            <ul>
              <li><strong>筛选控制</strong>：尝试修改时间范围、商品分类、品牌等筛选条件，查看数据如何实时更新</li>
              <li><strong>指标卡片</strong>：观察销售额、销售数量、利润率、库存预警等关键指标的展示</li>
              <li><strong>图表可视化</strong>：体验销售趋势图、商品排行榜、分类分析、库存状态等图表的交互功能</li>
              <li><strong>报告导出</strong>：测试PDF和Excel格式的报告导出功能</li>
            </ul>
            
            <h4>🔧 交互体验</h4>
            <ul>
              <li><strong>图表切换</strong>：在销售趋势图中切换折线图、柱状图、面积图</li>
              <li><strong>排序功能</strong>：在商品排行中按销售额、销量、利润等不同维度排序</li>
              <li><strong>响应式布局</strong>：调整浏览器窗口大小，体验响应式设计效果</li>
              <li><strong>实时更新</strong>：点击"模拟实时更新"按钮查看数据实时刷新效果</li>
            </ul>
          </div>
        </el-collapse-item>

        <el-collapse-item title="💡 技术特性展示" name="2">
          <div class="instruction-content">
            <el-row :gutter="20">
              <el-col :span="12">
                <h4>前端技术栈</h4>
                <el-tag style="margin: 2px;">Vue 2.7.2</el-tag>
                <el-tag style="margin: 2px;">Element UI 2.3.7</el-tag>
                <el-tag style="margin: 2px;">ECharts 4.2.0</el-tag>
                <el-tag style="margin: 2px;">Vuex 3.0.1</el-tag>
              </el-col>
              <el-col :span="12">
                <h4>功能特性</h4>
                <el-tag style="margin: 2px;" type="success">组件化设计</el-tag>
                <el-tag style="margin: 2px;" type="success">状态管理</el-tag>
                <el-tag style="margin: 2px;" type="success">响应式布局</el-tag>
                <el-tag style="margin: 2px;" type="success">数据可视化</el-tag>
              </el-col>
            </el-row>
          </div>
        </el-collapse-item>

        <el-collapse-item title="🚀 快速体验指南" name="3">
          <div class="instruction-content">
            <el-steps :active="currentStep" direction="vertical">
              <el-step title="筛选数据" description="选择时间范围和商品分类，观察数据变化"></el-step>
              <el-step title="查看图表" description="体验各种图表的交互功能和数据展示"></el-step>
              <el-step title="分析表格" description="在数据表格中查看详细的商品性能信息"></el-step>
              <el-step title="导出报告" description="尝试导出PDF或Excel格式的分析报告"></el-step>
              <el-step title="响应式测试" description="调整窗口大小测试移动端适配效果"></el-step>
            </el-steps>
            
            <div style="margin-top: 20px;">
              <el-button type="primary" @click="startGuidedTour">开始引导体验</el-button>
              <el-button @click="skipToStep(currentStep + 1)">下一步</el-button>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script>
import ProductPerformanceMain from '../index.vue'
import mockApiService from '@/utils/mockApi'

export default {
  name: 'ProductPerformanceDemo',
  components: {
    ProductPerformanceMain
  },
  data() {
    return {
      demoMode: 'mock', // mock | real
      lastUpdateTime: new Date().toLocaleString(),
      activeInstructions: ['1'],
      currentStep: 0,
      guidedTourActive: false
    }
  },
  mounted() {
    this.initDemo()
  },
  methods: {
    // 初始化演示
    initDemo() {
      console.log('🎬 商品性能分析演示已启动')
      this.setDemoMode('mock')
      this.showWelcomeMessage()
    },

    // 显示欢迎消息
    showWelcomeMessage() {
      this.$notify({
        title: '欢迎体验商品性能分析系统！',
        message: '这是一个完整的功能演示，您可以体验所有核心功能。',
        type: 'success',
        duration: 4000
      })
    },

    // 设置演示模式
    setDemoMode(mode) {
      this.demoMode = mode
      const useMock = mode === 'mock'
      
      // 控制模拟API开关
      mockApiService.enable(useMock)
      
      this.$message({
        type: 'info',
        message: `已切换到${useMock ? '模拟数据' : '真实API'}模式`
      })
      
      // 刷新数据
      this.refreshDemoData()
    },

    // 刷新演示数据
    async refreshDemoData() {
      this.lastUpdateTime = new Date().toLocaleString()
      
      if (this.$refs.performanceMain) {
        try {
          await this.$refs.performanceMain.refreshData()
          this.$message.success('演示数据已刷新')
        } catch (error) {
          this.$message.error('数据刷新失败')
        }
      }
    },

    // 模拟实时更新
    async simulateRealtimeUpdate() {
      const loading = this.$loading({
        lock: true,
        text: '正在模拟实时数据更新...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })

      try {
        // 模拟实时数据获取
        await mockApiService.fetchRealTimeUpdate()
        
        // 刷新主要数据
        await this.refreshDemoData()
        
        this.$notify({
          title: '实时更新完成',
          message: '数据已更新到最新状态',
          type: 'success'
        })
      } catch (error) {
        this.$message.error('实时更新失败')
      } finally {
        loading.close()
      }
    },

    // 开始引导体验
    startGuidedTour() {
      this.guidedTourActive = true
      this.currentStep = 0
      
      this.$alert('引导体验即将开始，请按照步骤操作体验各项功能！', '开始体验', {
        confirmButtonText: '开始',
        type: 'info'
      }).then(() => {
        this.executeGuidedStep(0)
      })
    },

    // 跳转到指定步骤
    skipToStep(step) {
      if (step >= 0 && step < 5) {
        this.currentStep = step
        this.executeGuidedStep(step)
      }
    },

    // 执行引导步骤
    executeGuidedStep(step) {
      const steps = [
        () => this.highlightFilters(),
        () => this.highlightCharts(),
        () => this.highlightTables(),
        () => this.highlightExport(),
        () => this.highlightResponsive()
      ]
      
      if (steps[step]) {
        steps[step]()
      }
    },

    // 高亮筛选区域
    highlightFilters() {
      this.$message({
        type: 'info',
        message: '请尝试修改时间范围和筛选条件，观察数据变化'
      })
    },

    // 高亮图表区域
    highlightCharts() {
      this.$message({
        type: 'info',
        message: '请体验图表的交互功能，如切换图表类型、排序等'
      })
    },

    // 高亮表格区域
    highlightTables() {
      this.$message({
        type: 'info',
        message: '请查看详细的数据表格，尝试排序和分页功能'
      })
    },

    // 高亮导出功能
    highlightExport() {
      this.$message({
        type: 'info',
        message: '请尝试导出报告功能，支持PDF和Excel格式'
      })
    },

    // 高亮响应式设计
    highlightResponsive() {
      this.$message({
        type: 'info',
        message: '请调整浏览器窗口大小，体验响应式设计效果'
      })
      
      setTimeout(() => {
        this.$notify({
          title: '引导体验完成！',
          message: '您已体验了所有核心功能，可以继续自由探索。',
          type: 'success'
        })
        this.guidedTourActive = false
      }, 3000)
    }
  }
}
</script>

<style lang="scss" scoped>
.demo-page {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;

  .demo-header {
    margin-bottom: 20px;

    .demo-features {
      margin-top: 10px;
    }
  }

  .demo-controls {
    margin-bottom: 20px;

    .demo-status {
      border-top: 1px solid #e4e7ed;
      padding-top: 15px;
    }
  }

  .demo-content {
    margin-bottom: 30px;
  }

  .demo-instructions {
    .instruction-content {
      h4 {
        color: #409eff;
        margin-bottom: 10px;
      }

      ul {
        padding-left: 20px;
        
        li {
          margin-bottom: 8px;
          line-height: 1.6;
        }
      }
    }
  }
}

// 引导高亮效果
.guided-highlight {
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border: 2px solid #409eff;
    border-radius: 4px;
    animation: highlight-pulse 1.5s infinite;
  }
}

@keyframes highlight-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.02);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .demo-page {
    padding: 10px;

    .demo-controls {
      :deep(.el-col) {
        margin-bottom: 10px;
      }
    }
  }
}
</style>