<template>
  <div class="app-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>用户画像分析</h2>
        <p class="page-description">基于行为数据构建用户画像，洞察用户特征和偏好</p>
      </div>
      <div class="header-right">
        <el-select 
          v-model="selectedSegment" 
          placeholder="用户分群"
          size="small"
          style="margin-right: 10px;"
          @change="onSegmentChange"
        >
          <el-option label="全部用户" value=""></el-option>
          <el-option label="活跃用户" value="active"></el-option>
          <el-option label="新用户" value="new"></el-option>
          <el-option label="流失用户" value="churned"></el-option>
          <el-option label="高价值用户" value="high-value"></el-option>
        </el-select>
        <el-select 
          v-model="selectedPeriod" 
          placeholder="分析周期"
          size="small"
          style="margin-right: 10px;"
          @change="onPeriodChange"
        >
          <el-option label="近7天" value="7d"></el-option>
          <el-option label="近30天" value="30d"></el-option>
          <el-option label="近90天" value="90d"></el-option>
        </el-select>
        <el-button 
          :loading="isLoading"
          icon="el-icon-refresh"
          size="small"
          @click="refreshData"
        >
          刷新
        </el-button>
      </div>
    </div>

    <!-- 用户概览 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="overview-content">
            <div class="overview-icon">
              <i class="el-icon-user" style="color: #409EFF;"></i>
            </div>
            <div class="overview-info">
              <div class="overview-title">总用户数</div>
              <div class="overview-value">{{ formatNumber(totalUsers) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="overview-content">
            <div class="overview-icon">
              <i class="el-icon-star-on" style="color: #67C23A;"></i>
            </div>
            <div class="overview-info">
              <div class="overview-title">活跃用户数</div>
              <div class="overview-value">{{ formatNumber(activeUsers) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="overview-content">
            <div class="overview-icon">
              <i class="el-icon-trophy" style="color: #E6A23C;"></i>
            </div>
            <div class="overview-info">
              <div class="overview-title">平均活跃度</div>
              <div class="overview-value">{{ averageActivityScore.toFixed(1) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="overview-content">
            <div class="overview-icon">
              <i class="el-icon-pie-chart" style="color: #F56C6C;"></i>
            </div>
            <div class="overview-info">
              <div class="overview-title">用户分群数</div>
              <div class="overview-value">{{ totalSegments }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 行为特征分析 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="12">
        <el-card shadow="hover">
          <div slot="header" class="card-header">
            <span>用户行为特征分布</span>
            <el-select 
              v-model="selectedFeature" 
              size="mini"
              @change="updateFeatureChart"
            >
              <el-option label="访问频率" value="visitFrequency"></el-option>
              <el-option label="停留时长" value="sessionDuration"></el-option>
              <el-option label="页面深度" value="pageDepth"></el-option>
              <el-option label="设备类型" value="deviceType"></el-option>
            </el-select>
          </div>
          <div class="feature-chart-container">
            <ve-radar
              :data="behaviorFeatureData"
              :settings="radarSettings"
              :loading="loading.userProfile"
              height="350px"
            ></ve-radar>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <div slot="header" class="card-header">
            <span>用户分群分布</span>
          </div>
          <div class="segment-chart-container">
            <ve-pie
              :data="userSegmentData"
              :settings="pieSettings"
              :loading="loading.userProfile"
              height="300px"
            ></ve-pie>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 兴趣标签和活跃度分析 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="14">
        <el-card shadow="hover">
          <div slot="header" class="card-header">
            <span>用户兴趣标签云</span>
            <el-input
              v-model="tagSearchKeyword"
              placeholder="搜索标签"
              size="mini"
              prefix-icon="el-icon-search"
              style="width: 200px;"
              @input="onTagSearch"
            ></el-input>
          </div>
          <div class="tag-cloud-container">
            <div class="tag-cloud">
              <span
                v-for="tag in filteredInterestTags"
                :key="tag.name"
                class="interest-tag"
                :style="getTagStyle(tag)"
                @click="selectTag(tag)"
              >
                {{ tag.name }}
                <span class="tag-count">({{ formatNumber(tag.count) }})</span>
              </span>
            </div>
            <div v-if="filteredInterestTags.length === 0" class="no-tags">
              暂无标签数据
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card shadow="hover">
          <div slot="header" class="card-header">
            <span>活跃度分布</span>
          </div>
          <div class="activity-distribution">
            <div 
              v-for="level in activityLevels"
              :key="level.name"
              class="activity-level"
            >
              <div class="level-header">
                <span class="level-name">{{ level.name }}</span>
                <span class="level-percentage">{{ level.percentage.toFixed(1) }}%</span>
              </div>
              <div class="level-progress">
                <el-progress 
                  :percentage="level.percentage" 
                  :color="level.color"
                  :show-text="false"
                ></el-progress>
              </div>
              <div class="level-description">
                <span class="level-count">{{ formatNumber(level.count) }} 用户</span>
                <span class="level-score">评分: {{ level.scoreRange }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 用户行为矩阵和详细分析 -->
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card shadow="hover">
          <div slot="header" class="card-header">
            <span>用户行为矩阵</span>
            <div class="matrix-controls">
              <el-select v-model="matrixXAxis" size="mini" style="width: 120px; margin-right: 10px;">
                <el-option label="访问频率" value="visitFrequency"></el-option>
                <el-option label="会话时长" value="sessionDuration"></el-option>
                <el-option label="转化率" value="conversionRate"></el-option>
              </el-select>
              <el-select v-model="matrixYAxis" size="mini" style="width: 120px;">
                <el-option label="活跃度" value="activityScore"></el-option>
                <el-option label="价值分" value="valueScore"></el-option>
                <el-option label="忠诚度" value="loyaltyScore"></el-option>
              </el-select>
            </div>
          </div>
          <div class="matrix-container">
            <ve-scatter
              :data="behaviorMatrixData"
              :settings="scatterSettings"
              :loading="loading.userProfile"
              height="400px"
            ></ve-scatter>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div slot="header" class="card-header">
            <span>高价值用户特征</span>
          </div>
          <div class="high-value-features">
            <div 
              v-for="feature in highValueFeatures"
              :key="feature.name"
              class="feature-item"
            >
              <div class="feature-name">{{ feature.name }}</div>
              <div class="feature-metrics">
                <div class="metric-item">
                  <span class="metric-label">平均值:</span>
                  <span class="metric-value">{{ feature.average }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">占比:</span>
                  <span class="metric-value">{{ feature.percentage }}%</span>
                </div>
              </div>
              <div class="feature-trend" :class="getTrendClass(feature.trend)">
                <i :class="getTrendIcon(feature.trend)"></i>
                {{ formatTrend(feature.trend) }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  name: 'UserProfileAnalysis',
  data() {
    return {
      selectedSegment: '',
      selectedPeriod: '30d',
      selectedFeature: 'visitFrequency',
      tagSearchKeyword: '',
      matrixXAxis: 'visitFrequency',
      matrixYAxis: 'activityScore'
    }
  },
  computed: {
    ...mapState('behavior', ['userProfileData', 'loading']),
    ...mapGetters('behavior', ['isLoading']),
    
    // 行为特征数据
    behaviorFeatures() {
      return this.userProfileData.behaviorFeatures || []
    },
    
    // 兴趣标签数据
    interestTags() {
      return this.userProfileData.interestTags || []
    },
    
    // 用户分群数据
    userSegments() {
      return this.userProfileData.userSegments || []
    },
    
    // 过滤后的标签
    filteredInterestTags() {
      if (!this.tagSearchKeyword) {
        return this.interestTags
      }
      return this.interestTags.filter(tag => 
        tag.name.toLowerCase().includes(this.tagSearchKeyword.toLowerCase())
      )
    },
    
    // 概览统计
    totalUsers() {
      return this.userSegments.reduce((sum, segment) => sum + (segment.userCount || 0), 0)
    },
    
    activeUsers() {
      const activeSegment = this.userSegments.find(s => s.type === 'active')
      return activeSegment ? activeSegment.userCount : 0
    },
    
    averageActivityScore() {
      const scores = this.behaviorFeatures
        .filter(f => f.type === 'activityScore')
        .map(f => f.value || 0)
      return scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
    },
    
    totalSegments() {
      return this.userSegments.length
    },
    
    // 活跃度等级分布
    activityLevels() {
      const levels = [
        { name: '高活跃', min: 80, max: 100, color: '#67C23A' },
        { name: '中活跃', min: 60, max: 80, color: '#409EFF' },
        { name: '低活跃', min: 40, max: 60, color: '#E6A23C' },
        { name: '不活跃', min: 0, max: 40, color: '#F56C6C' }
      ]
      
      const totalUsers = this.totalUsers
      return levels.map(level => {
        const count = this.userSegments
          .filter(segment => segment.activityScore >= level.min && segment.activityScore < level.max)
          .reduce((sum, segment) => sum + segment.userCount, 0)
        
        return {
          ...level,
          count,
          percentage: totalUsers > 0 ? (count / totalUsers) * 100 : 0,
          scoreRange: `${level.min}-${level.max}`
        }
      })
    },
    
    // 雷达图数据
    behaviorFeatureData() {
      const features = this.behaviorFeatures.filter(f => f.category === this.selectedFeature)
      
      return {
        columns: ['特征', '用户数'],
        rows: features.map(feature => ({
          '特征': feature.name,
          '用户数': feature.userCount || 0
        }))
      }
    },
    
    // 用户分群饼图数据
    userSegmentData() {
      return {
        columns: ['分群', '用户数'],
        rows: this.userSegments.map(segment => ({
          '分群': segment.name,
          '用户数': segment.userCount || 0
        }))
      }
    },
    
    // 行为矩阵散点图数据
    behaviorMatrixData() {
      return {
        columns: [this.getAxisLabel(this.matrixXAxis), this.getAxisLabel(this.matrixYAxis), '用户数'],
        rows: this.userSegments.map(segment => ({
          [this.getAxisLabel(this.matrixXAxis)]: this.getAxisValue(segment, this.matrixXAxis),
          [this.getAxisLabel(this.matrixYAxis)]: this.getAxisValue(segment, this.matrixYAxis),
          '用户数': segment.userCount || 0
        }))
      }
    },
    
    // 高价值用户特征
    highValueFeatures() {
      return [
        {
          name: '平均会话时长',
          average: '8.5分钟',
          percentage: 25.3,
          trend: 15.2
        },
        {
          name: '页面访问深度',
          average: '12.3页',
          percentage: 32.1,
          trend: 8.7
        },
        {
          name: '转化率',
          average: '4.2%',
          percentage: 18.9,
          trend: -2.1
        },
        {
          name: '复购率',
          average: '65.4%',
          percentage: 41.2,
          trend: 12.8
        }
      ]
    },
    
    // 图表设置
    radarSettings() {
      return {
        radius: '70%'
      }
    },
    
    pieSettings() {
      return {
        radius: ['30%', '70%'],
        label: {
          formatter: '{b}: {c}人 ({d}%)'
        }
      }
    },
    
    scatterSettings() {
      return {
        symbolSize: function(data) {
          return Math.sqrt(data[2]) / 10 + 10
        }
      }
    }
  },
  async mounted() {
    await this.initData()
  },
  methods: {
    ...mapActions('behavior', ['fetchUserProfileData']),
    
    // 初始化数据
    async initData() {
      await this.fetchData()
    },
    
    // 获取数据
    async fetchData() {
      const params = {
        segmentType: this.selectedSegment,
        behaviorPeriod: this.selectedPeriod
      }
      
      try {
        await this.fetchUserProfileData(params)
      } catch (error) {
        this.$message.error('获取用户画像数据失败')
      }
    },
    
    // 刷新数据
    async refreshData() {
      await this.fetchData()
      this.$message.success('数据刷新成功')
    },
    
    // 分群变化
    async onSegmentChange() {
      await this.fetchData()
    },
    
    // 周期变化
    async onPeriodChange() {
      await this.fetchData()
    },
    
    // 更新特征图表
    updateFeatureChart() {
      // 特征类型切换，无需重新获取数据
    },
    
    // 标签搜索
    onTagSearch() {
      // 客户端过滤，无需重新获取数据
    },
    
    // 选择标签
    selectTag(tag) {
      console.log('选中标签:', tag)
      // 可以显示标签详情或进行其他操作
    },
    
    // 获取标签样式
    getTagStyle(tag) {
      const maxCount = Math.max(...this.interestTags.map(t => t.count))
      const minCount = Math.min(...this.interestTags.map(t => t.count))
      const ratio = (tag.count - minCount) / (maxCount - minCount) || 0
      
      const minSize = 12
      const maxSize = 24
      const fontSize = minSize + (maxSize - minSize) * ratio
      
      const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
      const color = colors[Math.floor(ratio * (colors.length - 1))]
      
      return {
        fontSize: `${fontSize}px`,
        color: color,
        fontWeight: ratio > 0.7 ? 'bold' : 'normal'
      }
    },
    
    // 获取坐标轴标签
    getAxisLabel(axis) {
      const labels = {
        visitFrequency: '访问频率',
        sessionDuration: '会话时长',
        conversionRate: '转化率',
        activityScore: '活跃度',
        valueScore: '价值分',
        loyaltyScore: '忠诚度'
      }
      return labels[axis] || axis
    },
    
    // 获取坐标轴值
    getAxisValue(segment, axis) {
      // 模拟数据，实际应从 segment 中获取对应的值
      const values = {
        visitFrequency: Math.random() * 100,
        sessionDuration: Math.random() * 60,
        conversionRate: Math.random() * 10,
        activityScore: segment.activityScore || Math.random() * 100,
        valueScore: Math.random() * 100,
        loyaltyScore: Math.random() * 100
      }
      return values[axis] || 0
    },
    
    // 获取趋势样式类
    getTrendClass(trend) {
      if (trend > 0) return 'trend-up'
      if (trend < 0) return 'trend-down'
      return 'trend-stable'
    },
    
    // 获取趋势图标
    getTrendIcon(trend) {
      if (trend > 0) return 'el-icon-arrow-up'
      if (trend < 0) return 'el-icon-arrow-down'
      return 'el-icon-minus'
    },
    
    // 工具方法
    formatNumber(num) {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
      }
      return num.toString()
    },
    
    formatTrend(trend) {
      if (trend === 0) return '0%'
      return trend > 0 ? `+${trend.toFixed(1)}%` : `${trend.toFixed(1)}%`
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #EBEEF5;
}

.header-left h2 {
  margin: 0 0 5px 0;
  color: #303133;
  font-size: 24px;
  font-weight: bold;
}

.page-description {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
}

.overview-card {
  height: 100px;
}

.overview-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.overview-icon {
  margin-right: 15px;
}

.overview-icon i {
  font-size: 36px;
}

.overview-info {
  flex: 1;
}

.overview-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.overview-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.feature-chart-container,
.segment-chart-container {
  height: 350px;
}

.tag-cloud-container {
  min-height: 300px;
  padding: 20px 0;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
}

.interest-tag {
  display: inline-block;
  padding: 8px 12px;
  background-color: #F5F7FA;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}

.interest-tag:hover {
  background-color: #E4E7ED;
  transform: scale(1.05);
}

.tag-count {
  font-size: 0.8em;
  color: #909399;
  margin-left: 5px;
}

.no-tags {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #909399;
  font-size: 14px;
}

.activity-distribution {
  padding: 10px 0;
}

.activity-level {
  margin-bottom: 20px;
}

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.level-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.level-percentage {
  font-size: 14px;
  font-weight: bold;
  color: #409EFF;
}

.level-progress {
  margin-bottom: 8px;
}

.level-description {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

.matrix-container {
  height: 400px;
}

.matrix-controls {
  display: flex;
  align-items: center;
}

.high-value-features {
  padding: 10px 0;
}

.feature-item {
  padding: 15px 0;
  border-bottom: 1px solid #F5F7FA;
}

.feature-item:last-child {
  border-bottom: none;
}

.feature-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
}

.feature-metrics {
  margin-bottom: 8px;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.metric-label {
  font-size: 12px;
  color: #909399;
}

.metric-value {
  font-size: 12px;
  color: #303133;
  font-weight: 500;
}

.feature-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
}

.trend-up {
  color: #67C23A;
}

.trend-down {
  color: #F56C6C;
}

.trend-stable {
  color: #909399;
}

.feature-trend i {
  margin-right: 4px;
}
</style>