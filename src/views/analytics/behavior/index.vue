<template>
  <div class="app-container">
    <!-- 筛选工具栏 2026 -->
    <div class="filter-container">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        align="right"
        unlink-panels
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :picker-options="pickerOptions"
        @change="handleDateChange"
        style="margin-right: 10px;">
      </el-date-picker>
      <el-select v-model="selectedModule" placeholder="选择模块" clearable style="width: 150px; margin-right: 10px;" @change="handleModuleChange">
        <el-option
          v-for="item in moduleOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <el-button type="primary" icon="el-icon-download" @click="handleExport">导出数据</el-button>
      <el-button type="danger" icon="el-icon-delete" @click="handleClear">清空数据</el-button>
    </div>

    <!-- 统计卡片 2026 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #409EFF;">
            <i class="el-icon-view"></i>
          </div>
          <div class="stat-content">
            <div class="stat-title">总访问次数</div>
            <div class="stat-value">{{ statistics.totalVisits }}</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #67C23A;">
            <i class="el-icon-time"></i>
          </div>
          <div class="stat-content">
            <div class="stat-title">总停留时长</div>
            <div class="stat-value">{{ formatDuration(statistics.totalDuration) }}</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #E6A23C;">
            <i class="el-icon-timer"></i>
          </div>
          <div class="stat-content">
            <div class="stat-title">平均停留时长</div>
            <div class="stat-value">{{ formatDuration(statistics.avgDuration) }}</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #F56C6C;">
            <i class="el-icon-document"></i>
          </div>
          <div class="stat-content">
            <div class="stat-title">访问页面数</div>
            <div class="stat-value">{{ statistics.uniquePages }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 访问趋势图 2026 -->
    <el-card class="chart-card">
      <div slot="header" class="chart-header">
        <span>访问趋势</span>
      </div>
      <ve-line
        :data="trendChartData"
        :settings="trendChartSettings"
        :extend="trendChartExtend"
        height="300px">
      </ve-line>
    </el-card>

    <!-- 模块分布和页面排行 2026 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card class="chart-card">
          <div slot="header" class="chart-header">
            <span>模块访问分布</span>
          </div>
          <ve-pie
            :data="moduleChartData"
            :settings="moduleChartSettings"
            height="300px">
          </ve-pie>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <div slot="header" class="chart-header">
            <span>页面访问排行 (Top 10)</span>
          </div>
          <ve-histogram
            :data="pageRankChartData"
            :settings="pageRankChartSettings"
            :extend="pageRankChartExtend"
            height="300px">
          </ve-histogram>
        </el-card>
      </el-col>
    </el-row>

    <!-- 访问明细表格 2026 -->
    <el-card class="table-card" style="margin-top: 20px;">
      <div slot="header" class="chart-header">
        <span>页面访问统计</span>
      </div>
      <el-table
        :data="pageTableData"
        style="width: 100%"
        :default-sort="{prop: 'visits', order: 'descending'}">
        <el-table-column prop="title" label="页面名称" min-width="200">
          <template slot-scope="scope">
            {{ scope.row.title || scope.row.path }}
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路径" min-width="180"></el-table-column>
        <el-table-column prop="moduleName" label="所属模块" width="120"></el-table-column>
        <el-table-column prop="visits" label="访问次数" width="100" sortable></el-table-column>
        <el-table-column prop="totalDuration" label="总停留时长" width="120" sortable>
          <template slot-scope="scope">
            {{ formatDuration(scope.row.totalDuration) }}
          </template>
        </el-table-column>
        <el-table-column prop="avgDuration" label="平均停留" width="100" sortable>
          <template slot-scope="scope">
            {{ formatDuration(scope.row.avgDuration) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import {
  getStatistics,
  downloadCSV,
  clearAllRecords,
  formatDuration,
  getModuleName,
  getModuleNameMap
} from '@/utils/behavior'

export default {
  name: 'BehaviorAnalytics',
  data() {
    return {
      dateRange: null,
      selectedModule: '',
      statistics: {
        totalVisits: 0,
        totalDuration: 0,
        avgDuration: 0,
        uniquePages: 0,
        pageStats: [],
        moduleStats: [],
        dailyStats: []
      },
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      // 趋势图配置 2026
      trendChartSettings: {
        xAxisType: 'time',
        area: true,
        axisSite: { right: ['avgDuration'] },
        labelMap: { 'visits': '访问次数', 'avgDuration': '平均停留(秒)' },
        yAxisName: ['次数', '秒']
      },
      trendChartExtend: {
        series: {
          smooth: true
        }
      },
      // 模块分布图配置 2026
      moduleChartSettings: {
        radius: 100,
        offsetY: 150,
        dataType: 'percent'
      },
      // 页面排行图配置 2026
      pageRankChartSettings: {
        metrics: ['visits'],
        dimension: ['title'],
        labelMap: { 'visits': '访问次数' }
      },
      pageRankChartExtend: {
        series: {
          barMaxWidth: 30
        }
      }
    }
  },
  computed: {
    // 模块选项 2026
    moduleOptions() {
      const map = getModuleNameMap()
      return Object.keys(map).map(key => ({
        value: key,
        label: map[key]
      }))
    },
    // 趋势图数据 2026
    trendChartData() {
      const rows = this.statistics.dailyStats.map(item => ({
        date: item.date,
        visits: item.visits,
        avgDuration: Math.round(item.avgDuration / 1000)
      }))
      return {
        columns: ['date', 'visits', 'avgDuration'],
        rows: rows
      }
    },
    // 模块分布图数据 2026
    moduleChartData() {
      const rows = this.statistics.moduleStats.map(item => ({
        module: getModuleName(item.module),
        visits: item.visits
      }))
      return {
        columns: ['module', 'visits'],
        rows: rows
      }
    },
    // 页面排行图数据 2026
    pageRankChartData() {
      const rows = this.statistics.pageStats.slice(0, 10).map(item => ({
        title: item.title || item.path,
        visits: item.visits
      }))
      return {
        columns: ['title', 'visits'],
        rows: rows
      }
    },
    // 页面表格数据 2026
    pageTableData() {
      return this.statistics.pageStats.map(item => ({
        ...item,
        moduleName: getModuleName(item.module)
      }))
    }
  },
  created() {
    this.loadStatistics()
  },
  methods: {
    formatDuration,
    // 加载统计数据 2026
    loadStatistics() {
      const options = {}
      if (this.dateRange && this.dateRange.length === 2) {
        options.startDate = this.dateRange[0]
        options.endDate = this.dateRange[1]
      }
      if (this.selectedModule) {
        options.module = this.selectedModule
      }
      this.statistics = getStatistics(options)
    },
    // 日期变化处理 2026
    handleDateChange() {
      this.loadStatistics()
    },
    // 模块变化处理 2026
    handleModuleChange() {
      this.loadStatistics()
    },
    // 导出数据 2026
    handleExport() {
      const options = {}
      if (this.dateRange && this.dateRange.length === 2) {
        options.startDate = this.dateRange[0]
        options.endDate = this.dateRange[1]
      }
      if (this.selectedModule) {
        options.module = this.selectedModule
      }
      const success = downloadCSV(options)
      if (success) {
        this.$message.success('导出成功')
      } else {
        this.$message.warning('没有数据可导出')
      }
    },
    // 清空数据 2026
    handleClear() {
      this.$confirm('确定要清空所有行为记录数据吗？此操作不可恢复。', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        clearAllRecords()
        this.loadStatistics()
        this.$message.success('数据已清空')
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.filter-container {
  padding: 20px;
  background: #fff;
  margin-bottom: 20px;
  border-radius: 4px;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 4px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
}

.stat-icon i {
  font-size: 28px;
  color: #fff;
}

.stat-content {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.chart-card {
  background: #fff;
}

.chart-header {
  font-weight: bold;
  color: #303133;
}

.table-card {
  background: #fff;
}
</style>
