<template>
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <div>
        <i class="el-icon-data-analysis"></i>
        <span>限流监控面板</span>
        <el-button
          style="float:right"
          type="primary"
          @click="refreshStats()"
          size="small">
          刷新数据
        </el-button>
        <el-switch
          style="float:right;margin-right: 15px"
          v-model="autoRefresh"
          active-text="自动刷新"
          @change="handleAutoRefreshChange">
        </el-switch>
      </div>
      <div style="margin-top: 15px">
        <el-form :inline="true" :model="queryForm" size="small" label-width="100px">
          <el-form-item label="时间范围：">
            <el-date-picker
              v-model="queryForm.timeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="限流类型：">
            <el-select v-model="queryForm.limitType" placeholder="全部" clearable>
              <el-option label="IP限流" value="IP"></el-option>
              <el-option label="用户限流" value="USER"></el-option>
              <el-option label="API限流" value="API"></el-option>
              <el-option label="全局限流" value="GLOBAL"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-item">
            <div class="stats-title">总规则数</div>
            <div class="stats-value">{{overallStats.totalRules}}</div>
            <div class="stats-desc">
              <span class="stats-enabled">启用: {{overallStats.enabledRules}}</span>
              <span class="stats-disabled">禁用: {{overallStats.disabledRules}}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-item">
            <div class="stats-title">今日请求总数</div>
            <div class="stats-value">{{overallStats.todayRequests}}</div>
            <div class="stats-desc">
              <span class="stats-normal">通过: {{overallStats.todayAllowed}}</span>
              <span class="stats-blocked">拦截: {{overallStats.todayBlocked}}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-item">
            <div class="stats-title">限流拦截率</div>
            <div class="stats-value">{{overallStats.blockRate}}%</div>
            <div class="stats-desc">
              <span :class="getBlockRateClass()">{{getBlockRateStatus()}}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-item">
            <div class="stats-title">活跃规则数</div>
            <div class="stats-value">{{overallStats.activeRules}}</div>
            <div class="stats-desc">
              <span class="stats-desc-text">正在计数的规则</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表展示 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <div slot="header" class="chart-header">
            <span>请求趋势图</span>
            <el-select v-model="chartTimeRange" size="small" style="float: right; width: 120px">
              <el-option label="最近1小时" value="1h"></el-option>
              <el-option label="最近6小时" value="6h"></el-option>
              <el-option label="最近24小时" value="24h"></el-option>
              <el-option label="最近7天" value="7d"></el-option>
            </el-select>
          </div>
          <div id="requestTrendChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <div slot="header" class="chart-header">
            <span>限流类型分布</span>
          </div>
          <div id="limitTypeChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- TOP API 表格 -->
    <el-card class="operate-container" shadow="never" style="margin-top: 20px">
      <div slot="header" class="chart-header">
        <i class="el-icon-s-data"></i>
        <span>TOP 限流 API</span>
        <el-select v-model="topApiTimeRange" size="small" style="float: right; width: 120px">
          <el-option label="今日" value="today"></el-option>
          <el-option label="昨日" value="yesterday"></el-option>
          <el-option label="最近7天" value="7d"></el-option>
          <el-option label="最近30天" value="30d"></el-option>
        </el-select>
      </div>
      <div class="table-container">
        <el-table
          :data="topApiList"
          style="width: 100%;"
          v-loading="topApiLoading"
          border>
          <el-table-column label="排名" width="80" align="center">
            <template slot-scope="scope">
              <span class="rank-badge" :class="getRankClass(scope.$index)">{{scope.$index + 1}}</span>
            </template>
          </el-table-column>
          <el-table-column label="API路径" align="center">
            <template slot-scope="scope">{{scope.row.apiPath}}</template>
          </el-table-column>
          <el-table-column label="限流次数" width="120" align="center">
            <template slot-scope="scope">
              <span class="blocked-count">{{scope.row.blockedCount}}</span>
            </template>
          </el-table-column>
          <el-table-column label="总请求数" width="120" align="center">
            <template slot-scope="scope">{{scope.row.totalRequests}}</template>
          </el-table-column>
          <el-table-column label="拦截率" width="100" align="center">
            <template slot-scope="scope">
              <span :class="getApiBlockRateClass(scope.row.blockRate)">{{scope.row.blockRate}}%</span>
            </template>
          </el-table-column>
          <el-table-column label="限流规则" align="center">
            <template slot-scope="scope">{{scope.row.ruleName}}</template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template slot-scope="scope">
              <el-button size="mini" type="text" @click="viewRuleDetail(scope.row)">查看规则</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 实时日志 -->
    <el-card class="operate-container" shadow="never" style="margin-top: 20px">
      <div slot="header" class="chart-header">
        <i class="el-icon-document"></i>
        <span>实时限流日志</span>
        <el-button size="small" type="primary" @click="clearLogs" style="float: right">清空日志</el-button>
        <el-switch
          style="float:right;margin-right: 15px"
          v-model="realTimeLog"
          active-text="实时日志"
          @change="handleRealTimeLogChange">
        </el-switch>
      </div>
      <div class="log-container">
        <div class="log-item" v-for="(log, index) in realtimeLogs" :key="index" :class="getLogClass(log.level)">
          <span class="log-time">{{log.timestamp}}</span>
          <span class="log-level">{{log.level}}</span>
          <span class="log-content">{{log.message}}</span>
        </div>
        <div v-if="realtimeLogs.length === 0" class="no-logs">暂无日志数据</div>
      </div>
    </el-card>
  </div>
</template>

<script>
  import { getRateLimitStats } from '@/api/rateLimiting';
  import echarts from 'echarts';

  export default {
    name: 'rateLimitStats',
    data() {
      return {
        autoRefresh: false,
        realTimeLog: false,
        refreshTimer: null,
        logTimer: null,
        queryForm: {
          timeRange: [],
          limitType: null
        },
        chartTimeRange: '24h',
        topApiTimeRange: 'today',
        overallStats: {
          totalRules: 0,
          enabledRules: 0,
          disabledRules: 0,
          todayRequests: 0,
          todayAllowed: 0,
          todayBlocked: 0,
          blockRate: 0,
          activeRules: 0
        },
        topApiList: [],
        topApiLoading: false,
        realtimeLogs: [],
        requestTrendChart: null,
        limitTypeChart: null
      }
    },
    mounted() {
      this.initCharts();
      this.loadStats();
      this.loadTopApiStats();
    },
    beforeDestroy() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
      }
      if (this.logTimer) {
        clearInterval(this.logTimer);
      }
      if (this.requestTrendChart) {
        this.requestTrendChart.dispose();
      }
      if (this.limitTypeChart) {
        this.limitTypeChart.dispose();
      }
    },
    watch: {
      chartTimeRange() {
        this.loadRequestTrendData();
      },
      topApiTimeRange() {
        this.loadTopApiStats();
      }
    },
    methods: {
      loadStats() {
        const params = {
          type: 'overview',
          startTime: this.queryForm.timeRange[0],
          endTime: this.queryForm.timeRange[1],
          limitType: this.queryForm.limitType
        };
        
        getRateLimitStats(params).then(response => {
          this.overallStats = response.data;
          this.loadRequestTrendData();
          this.loadLimitTypeData();
        });
      },
      loadTopApiStats() {
        this.topApiLoading = true;
        const params = {
          type: 'topApi',
          timeRange: this.topApiTimeRange
        };
        
        getRateLimitStats(params).then(response => {
          this.topApiList = response.data;
          this.topApiLoading = false;
        });
      },
      loadRequestTrendData() {
        const params = {
          type: 'trend',
          timeRange: this.chartTimeRange
        };
        
        getRateLimitStats(params).then(response => {
          const data = response.data;
          this.updateRequestTrendChart(data);
        });
      },
      loadLimitTypeData() {
        const params = {
          type: 'distribution'
        };
        
        getRateLimitStats(params).then(response => {
          const data = response.data;
          this.updateLimitTypeChart(data);
        });
      },
      initCharts() {
        this.requestTrendChart = echarts.init(document.getElementById('requestTrendChart'));
        this.limitTypeChart = echarts.init(document.getElementById('limitTypeChart'));
        
        // 响应式调整
        window.addEventListener('resize', () => {
          this.requestTrendChart.resize();
          this.limitTypeChart.resize();
        });
      },
      updateRequestTrendChart(data) {
        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross'
            }
          },
          legend: {
            data: ['总请求', '限流拦截', '正常通过']
          },
          xAxis: {
            type: 'category',
            data: data.timeLabels
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              name: '总请求',
              type: 'line',
              data: data.totalRequests,
              itemStyle: { color: '#409EFF' }
            },
            {
              name: '限流拦截',
              type: 'line',
              data: data.blockedRequests,
              itemStyle: { color: '#F56C6C' }
            },
            {
              name: '正常通过',
              type: 'line',
              data: data.allowedRequests,
              itemStyle: { color: '#67C23A' }
            }
          ]
        };
        this.requestTrendChart.setOption(option);
      },
      updateLimitTypeChart(data) {
        const option = {
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          series: [
            {
              name: '限流类型',
              type: 'pie',
              radius: '70%',
              data: data,
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        };
        this.limitTypeChart.setOption(option);
      },
      refreshStats() {
        this.loadStats();
        this.loadTopApiStats();
        this.$message.success('数据已刷新');
      },
      handleAutoRefreshChange(val) {
        if (val) {
          this.refreshTimer = setInterval(() => {
            this.loadStats();
            this.loadTopApiStats();
          }, 30000); // 30秒刷新一次
        } else {
          if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
          }
        }
      },
      handleRealTimeLogChange(val) {
        if (val) {
          this.logTimer = setInterval(() => {
            this.loadRealtimeLogs();
          }, 2000); // 2秒刷新一次日志
        } else {
          if (this.logTimer) {
            clearInterval(this.logTimer);
            this.logTimer = null;
          }
        }
      },
      loadRealtimeLogs() {
        // 模拟实时日志数据
        const newLog = {
          timestamp: new Date().toLocaleTimeString(),
          level: Math.random() > 0.7 ? 'WARN' : 'INFO',
          message: this.generateLogMessage()
        };
        
        this.realtimeLogs.unshift(newLog);
        if (this.realtimeLogs.length > 50) {
          this.realtimeLogs.pop();
        }
      },
      generateLogMessage() {
        const messages = [
          'API /api/users 触发IP限流，来源: 192.168.1.100',
          'API /api/orders 正常访问，用户ID: 12345',
          'API /api/products 触发用户限流，用户ID: 67890',
          'API /api/payments 正常访问，IP: 10.0.0.1',
          'API /api/admin/users 触发全局限流'
        ];
        return messages[Math.floor(Math.random() * messages.length)];
      },
      clearLogs() {
        this.realtimeLogs = [];
        this.$message.success('日志已清空');
      },
      viewRuleDetail(row) {
        this.$router.push({
          name: 'rateLimit',
          query: { ruleId: row.ruleId }
        });
      },
      getBlockRateClass() {
        const rate = this.overallStats.blockRate;
        if (rate < 5) return 'stats-normal';
        if (rate < 20) return 'stats-warning';
        return 'stats-danger';
      },
      getBlockRateStatus() {
        const rate = this.overallStats.blockRate;
        if (rate < 5) return '正常';
        if (rate < 20) return '警告';
        return '高风险';
      },
      getRankClass(index) {
        if (index === 0) return 'rank-gold';
        if (index === 1) return 'rank-silver';
        if (index === 2) return 'rank-bronze';
        return 'rank-normal';
      },
      getApiBlockRateClass(rate) {
        if (rate < 10) return 'rate-normal';
        if (rate < 30) return 'rate-warning';
        return 'rate-danger';
      },
      getLogClass(level) {
        return level === 'WARN' ? 'log-warn' : 'log-info';
      }
    }
  }
</script>

<style scoped>
.stats-card {
  text-align: center;
}

.stats-item {
  padding: 20px;
}

.stats-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.stats-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.stats-desc {
  font-size: 12px;
  color: #999;
}

.stats-enabled {
  color: #67C23A;
  margin-right: 10px;
}

.stats-disabled {
  color: #F56C6C;
}

.stats-normal {
  color: #67C23A;
}

.stats-blocked {
  color: #F56C6C;
}

.stats-warning {
  color: #E6A23C;
}

.stats-danger {
  color: #F56C6C;
}

.stats-desc-text {
  color: #999;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rank-badge {
  display: inline-block;
  width: 24px;
  height: 24px;
  line-height: 24px;
  border-radius: 50%;
  color: white;
  font-weight: bold;
  font-size: 12px;
}

.rank-gold {
  background: linear-gradient(45deg, #FFD700, #FFA500);
}

.rank-silver {
  background: linear-gradient(45deg, #C0C0C0, #808080);
}

.rank-bronze {
  background: linear-gradient(45deg, #CD7F32, #A0522D);
}

.rank-normal {
  background: #909399;
}

.blocked-count {
  color: #F56C6C;
  font-weight: bold;
}

.rate-normal {
  color: #67C23A;
}

.rate-warning {
  color: #E6A23C;
}

.rate-danger {
  color: #F56C6C;
}

.log-container {
  height: 300px;
  overflow-y: auto;
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
}

.log-item {
  margin-bottom: 8px;
  padding: 8px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
}

.log-info {
  background: rgba(64, 158, 255, 0.1);
  border-left: 3px solid #409EFF;
}

.log-warn {
  background: rgba(245, 108, 108, 0.1);
  border-left: 3px solid #F56C6C;
}

.log-time {
  color: #666;
  margin-right: 10px;
}

.log-level {
  display: inline-block;
  width: 50px;
  text-align: center;
  margin-right: 10px;
  font-weight: bold;
}

.log-content {
  color: #333;
}

.no-logs {
  text-align: center;
  color: #999;
  padding: 50px;
}
</style>