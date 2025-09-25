<template>
  <div class="audit-chart">
    <!-- 用户活跃度图表 -->
    <el-card class="chart-card" shadow="never">
      <div slot="header" class="chart-header">
        <span>用户活跃度统计</span>
        <el-select v-model="userActivityTimeRange" size="mini" @change="loadUserActivity">
          <el-option label="最近7天" value="week" />
          <el-option label="最近30天" value="month" />
          <el-option label="最近90天" value="quarter" />
        </el-select>
      </div>
      <div class="chart-container" v-loading="chartLoading.userActivity">
        <ve-line
          :data="userActivityChartData"
          :settings="userActivitySettings"
          height="300px"
        />
      </div>
    </el-card>

    <!-- 功能使用率图表 -->
    <el-card class="chart-card" shadow="never">
      <div slot="header" class="chart-header">
        <span>功能使用率分布</span>
        <el-select v-model="featureUsageTimeRange" size="mini" @change="loadFeatureUsage">
          <el-option label="今日" value="day" />
          <el-option label="本周" value="week" />
          <el-option label="本月" value="month" />
        </el-select>
      </div>
      <div class="chart-container" v-loading="chartLoading.featureUsage">
        <ve-pie
          :data="featureUsageChartData"
          :settings="featureUsageSettings"
          height="300px"
        />
      </div>
    </el-card>

    <!-- 操作成功率图表 -->
    <el-card class="chart-card" shadow="never">
      <div slot="header" class="chart-header">
        <span>操作成功率趋势</span>
        <el-select v-model="successRateTimeRange" size="mini" @change="loadOperationSuccess">
          <el-option label="最近7天" value="week" />
          <el-option label="最近30天" value="month" />
        </el-select>
      </div>
      <div class="chart-container" v-loading="chartLoading.operationSuccess">
        <ve-line
          :data="operationSuccessChartData"
          :settings="operationSuccessSettings"
          height="300px"
        />
      </div>
    </el-card>

    <!-- 访问时段热力图 -->
    <el-card class="chart-card" shadow="never">
      <div slot="header" class="chart-header">
        <span>访问时段分布</span>
        <el-date-picker
          v-model="accessTimeDate"
          type="date"
          placeholder="选择日期"
          size="mini"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          @change="loadAccessTime"
        />
      </div>
      <div class="chart-container" v-loading="chartLoading.accessTime">
        <div class="heatmap-container">
          <div class="heatmap-grid">
            <div
              v-for="(hour, index) in 24"
              :key="index"
              class="heatmap-cell"
              :class="getHeatmapCellClass(accessTimeData[index])"
              :title="`${index}:00 - ${index + 1}:00 访问量: ${accessTimeData[index] || 0}`"
            >
              <span class="hour-label">{{ index }}时</span>
              <span class="access-count">{{ accessTimeData[index] || 0 }}</span>
            </div>
          </div>
          <div class="heatmap-legend">
            <span>少</span>
            <div class="legend-gradient"></div>
            <span>多</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 异常操作统计 -->
    <el-card class="chart-card" shadow="never">
      <div slot="header" class="chart-header">
        <span>异常操作统计</span>
        <el-select v-model="abnormalTimeRange" size="mini" @change="loadAbnormalOperations">
          <el-option label="最近7天" value="week" />
          <el-option label="最近30天" value="month" />
        </el-select>
      </div>
      <div class="chart-container" v-loading="chartLoading.abnormalOperation">
        <ve-bar
          :data="abnormalOperationChartData"
          :settings="abnormalOperationSettings"
          height="300px"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'AuditChart',
  data() {
    return {
      // 时间范围选择
      userActivityTimeRange: 'week',
      featureUsageTimeRange: 'week',
      successRateTimeRange: 'week',
      accessTimeDate: new Date().toISOString().split('T')[0],
      abnormalTimeRange: 'week',
      
      // 图表配置
      userActivitySettings: {
        xAxis: { name: '日期' },
        yAxis: { name: '活跃用户数' },
        line: { smooth: true }
      },
      featureUsageSettings: {
        dimension: ['功能模块'],
        metrics: ['使用次数']
      },
      operationSuccessSettings: {
        xAxis: { name: '日期' },
        yAxis: { name: '成功率(%)' },
        line: { smooth: true }
      },
      abnormalOperationSettings: {
        xAxis: { name: '异常类型' },
        yAxis: { name: '发生次数' }
      }
    }
  },
  computed: {
    ...mapGetters('audit', [
      'userActivityData',
      'featureUsageData',
      'operationSuccessData',
      'accessTimeData',
      'abnormalOperationData',
      'chartLoading'
    ]),
    
    // 用户活跃度图表数据
    userActivityChartData() {
      return {
        columns: ['日期', '活跃用户数'],
        rows: this.userActivityData.map(item => ({
          日期: item.date,
          活跃用户数: item.count
        }))
      }
    },
    
    // 功能使用率图表数据
    featureUsageChartData() {
      return {
        columns: ['功能模块', '使用次数'],
        rows: this.featureUsageData.map(item => ({
          功能模块: item.module,
          使用次数: item.count
        }))
      }
    },
    
    // 操作成功率图表数据
    operationSuccessChartData() {
      return {
        columns: ['日期', '成功率'],
        rows: this.operationSuccessData.map(item => ({
          日期: item.date,
          成功率: item.rate
        }))
      }
    },
    
    // 异常操作图表数据
    abnormalOperationChartData() {
      return {
        columns: ['异常类型', '发生次数'],
        rows: this.abnormalOperationData.map(item => ({
          异常类型: item.type,
          发生次数: item.count
        }))
      }
    }
  },
  async created() {
    await this.loadAllCharts()
  },
  methods: {
    ...mapActions('audit', [
      'getUserActivityStats',
      'getFeatureUsageStats',
      'getOperationSuccessStats',
      'getAccessTimeStats',
      'getAbnormalOperationStats'
    ]),

    // 加载所有图表
    async loadAllCharts() {
      await Promise.all([
        this.loadUserActivity(),
        this.loadFeatureUsage(),
        this.loadOperationSuccess(),
        this.loadAccessTime(),
        this.loadAbnormalOperations()
      ])
    },

    // 加载用户活跃度数据
    async loadUserActivity() {
      try {
        await this.getUserActivityStats({
          timeRange: this.userActivityTimeRange
        })
      } catch (error) {
        console.error('加载用户活跃度数据失败:', error)
      }
    },

    // 加载功能使用率数据
    async loadFeatureUsage() {
      try {
        await this.getFeatureUsageStats({
          timeRange: this.featureUsageTimeRange
        })
      } catch (error) {
        console.error('加载功能使用率数据失败:', error)
      }
    },

    // 加载操作成功率数据
    async loadOperationSuccess() {
      try {
        await this.getOperationSuccessStats({
          timeRange: this.successRateTimeRange
        })
      } catch (error) {
        console.error('加载操作成功率数据失败:', error)
      }
    },

    // 加载访问时段数据
    async loadAccessTime() {
      try {
        await this.getAccessTimeStats({
          date: this.accessTimeDate
        })
      } catch (error) {
        console.error('加载访问时段数据失败:', error)
      }
    },

    // 加载异常操作数据
    async loadAbnormalOperations() {
      try {
        await this.getAbnormalOperationStats({
          timeRange: this.abnormalTimeRange
        })
      } catch (error) {
        console.error('加载异常操作数据失败:', error)
      }
    },

    // 获取热力图单元格样式
    getHeatmapCellClass(value) {
      if (!value) return 'level-0'
      const maxValue = Math.max(...this.accessTimeData.filter(v => v))
      const level = Math.ceil((value / maxValue) * 4)
      return `level-${level}`
    }
  }
}
</script>

<style lang="scss" scoped>
.audit-chart {
  .chart-card {
    margin-bottom: 20px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
    }
    
    .chart-container {
      min-height: 300px;
    }
  }
  
  // 热力图样式
  .heatmap-container {
    padding: 20px 0;
    
    .heatmap-grid {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 8px;
      margin-bottom: 20px;
      
      .heatmap-cell {
        aspect-ratio: 1;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        transition: all 0.3s;
        cursor: pointer;
        
        &:hover {
          transform: scale(1.1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        
        .hour-label {
          font-weight: 600;
          margin-bottom: 2px;
        }
        
        .access-count {
          font-size: 10px;
          opacity: 0.8;
        }
        
        &.level-0 {
          background: #f5f7fa;
          color: #909399;
        }
        
        &.level-1 {
          background: #c6e2ff;
          color: #409eff;
        }
        
        &.level-2 {
          background: #79bbff;
          color: #fff;
        }
        
        &.level-3 {
          background: #409eff;
          color: #fff;
        }
        
        &.level-4 {
          background: #1890ff;
          color: #fff;
        }
      }
    }
    
    .heatmap-legend {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 12px;
      color: #909399;
      
      .legend-gradient {
        width: 100px;
        height: 12px;
        background: linear-gradient(to right, #f5f7fa, #1890ff);
        border-radius: 6px;
      }
    }
  }
}
</style>