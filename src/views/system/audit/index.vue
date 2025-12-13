<template>
  <div class="audit-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="page-title">
        <h2>审计管理</h2>
        <p>系统安全监控、合规性检查和审计报告生成</p>
      </div>
      <div class="page-actions">
        <el-button type="primary" @click="generateReport">
          <i class="el-icon-document"></i>
          生成报告
        </el-button>
        <el-button type="success" @click="exportData">
          <i class="el-icon-download"></i>
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 统计概览 -->
    <el-row :gutter="20" class="stats-overview">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon operations">
              <i class="el-icon-cpu"></i>
            </div>
            <div class="stat-info">
              <p class="stat-value">{{ statistics.totalOperations | formatNumber }}</p>
              <p class="stat-label">总操作数</p>
              <p class="stat-change positive">
                <i class="el-icon-arrow-up"></i>
                +12.5%
              </p>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon users">
              <i class="el-icon-user"></i>
            </div>
            <div class="stat-info">
              <p class="stat-value">{{ statistics.totalUsers | formatNumber }}</p>
              <p class="stat-label">活跃用户</p>
              <p class="stat-change positive">
                <i class="el-icon-arrow-up"></i>
                +8.3%
              </p>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon success">
              <i class="el-icon-circle-check"></i>
            </div>
            <div class="stat-info">
              <p class="stat-value">{{ statistics.successRate }}%</p>
              <p class="stat-label">成功率</p>
              <p class="stat-change positive">
                <i class="el-icon-arrow-up"></i>
                +2.1%
              </p>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon error">
              <i class="el-icon-warning-outline"></i>
            </div>
            <div class="stat-info">
              <p class="stat-value">{{ statistics.errorRate }}%</p>
              <p class="stat-label">异常率</p>
              <p class="stat-change negative">
                <i class="el-icon-arrow-down"></i>
                -1.2%
              </p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane label="统计分析" name="charts">
        <audit-chart />
      </el-tab-pane>
      
      <el-tab-pane label="数据追踪" name="tracking">
        <audit-table />
      </el-tab-pane>
      
      <el-tab-pane label="合规检查" name="compliance">
        <div class="compliance-section">
          <!-- 合规性检查结果 -->
          <el-card shadow="never">
            <div slot="header" class="card-header">
              <span>合规性检查结果</span>
              <el-button type="primary" size="mini" @click="runComplianceCheck">
                <i class="el-icon-refresh"></i>
                执行检查
              </el-button>
            </div>
            
            <div class="compliance-grid">
              <div class="compliance-item" v-for="item in complianceItems" :key="item.type">
                <div class="compliance-icon" :class="item.status">
                  <i :class="item.icon"></i>
                </div>
                <div class="compliance-info">
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.description }}</p>
                  <div class="compliance-meta">
                    <span class="check-time">检查时间: {{ item.checkTime }}</span>
                    <el-tag :type="item.status === 'pass' ? 'success' : 'danger'">
                      {{ item.status === 'pass' ? '通过' : '未通过' }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="报告中心" name="reports">
        <div class="reports-section">
          <!-- 报告生成 -->
          <el-card shadow="never">
            <div slot="header" class="card-header">
              <span>审计报告生成</span>
            </div>
            
            <el-form :model="reportForm" :inline="true" label-width="100px">
              <el-form-item label="报告类型">
                <el-select v-model="reportForm.reportType" style="width: 200px">
                  <el-option label="综合审计报告" value="comprehensive" />
                  <el-option label="安全审计报告" value="security" />
                  <el-option label="合规性报告" value="compliance" />
                  <el-option label="用户行为报告" value="behavior" />
                </el-select>
              </el-form-item>
              
              <el-form-item label="时间范围">
                <el-select v-model="reportForm.timeRange" style="width: 150px">
                  <el-option label="最近7天" value="week" />
                  <el-option label="最近30天" value="month" />
                  <el-option label="最近90天" value="quarter" />
                  <el-option label="自定义" value="custom" />
                </el-select>
              </el-form-item>
              
              <el-form-item v-if="reportForm.timeRange === 'custom'" label="自定义时间">
                <el-date-picker
                  v-model="reportForm.customTimeRange"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  format="yyyy-MM-dd HH:mm:ss"
                  value-format="yyyy-MM-dd HH:mm:ss"
                />
              </el-form-item>
              
              <el-form-item label="输出格式">
                <el-radio-group v-model="reportForm.format">
                  <el-radio label="pdf">PDF</el-radio>
                  <el-radio label="excel">Excel</el-radio>
                  <el-radio label="word">Word</el-radio>
                </el-radio-group>
              </el-form-item>
              
              <el-form-item>
                <el-button 
                  type="primary" 
                  @click="generateAuditReport"
                  :loading="reportGenerating"
                >
                  生成报告
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
          
          <!-- 历史报告 -->
          <el-card shadow="never" style="margin-top: 20px;">
            <div slot="header" class="card-header">
              <span>历史报告</span>
            </div>
            
            <el-table :data="historyReports" stripe>
              <el-table-column prop="name" label="报告名称" />
              <el-table-column prop="type" label="报告类型" width="120" />
              <el-table-column prop="createTime" label="生成时间" width="160" />
              <el-table-column prop="size" label="文件大小" width="100" />
              <el-table-column label="操作" width="120">
                <template slot-scope="scope">
                  <el-button type="text" @click="downloadReport(scope.row)">下载</el-button>
                  <el-button type="text" @click="deleteReport(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 导出数据对话框 -->
    <el-dialog
      title="导出审计数据"
      :visible.sync="exportDialogVisible"
      width="500px"
    >
      <el-form :model="exportForm" label-width="100px">
        <el-form-item label="数据类型">
          <el-checkbox-group v-model="exportForm.dataTypes">
            <el-checkbox label="operationLogs">操作日志</el-checkbox>
            <el-checkbox label="dataChanges">数据变更</el-checkbox>
            <el-checkbox label="securityAlerts">安全告警</el-checkbox>
            <el-checkbox label="statistics">统计数据</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="导出格式">
          <el-radio-group v-model="exportForm.format">
            <el-radio label="excel">Excel格式</el-radio>
            <el-radio label="csv">CSV格式</el-radio>
            <el-radio label="json">JSON格式</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="exportForm.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="exportDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmExportData" :loading="exportLoading">
          确认导出
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import AuditChart from './components/AuditChart'
import AuditTable from './components/AuditTable'

export default {
  name: 'AuditManagement',
  components: {
    AuditChart,
    AuditTable
  },
  data() {
    return {
      activeTab: 'charts',
      exportDialogVisible: false,
      
      // 报告表单
      reportForm: {
        reportType: 'comprehensive',
        timeRange: 'month',
        customTimeRange: [],
        format: 'pdf'
      },
      
      // 导出表单
      exportForm: {
        dataTypes: ['operationLogs'],
        format: 'excel',
        timeRange: []
      },
      
      // 合规性检查项目
      complianceItems: [
        {
          type: 'dataProtection',
          title: '数据保护合规',
          description: '检查个人数据处理是否符合GDPR等法规要求',
          status: 'pass',
          icon: 'el-icon-shield',
          checkTime: '2023-12-01 10:30:00'
        },
        {
          type: 'accessControl',
          title: '访问控制检查',
          description: '验证用户权限分配和访问控制策略',
          status: 'pass',
          icon: 'el-icon-lock',
          checkTime: '2023-12-01 10:30:00'
        },
        {
          type: 'auditTrail',
          title: '审计轨迹完整性',
          description: '确保操作日志记录完整且不可篡改',
          status: 'fail',
          icon: 'el-icon-document',
          checkTime: '2023-12-01 10:30:00'
        },
        {
          type: 'dataRetention',
          title: '数据保留策略',
          description: '检查数据保留期限设置是否合规',
          status: 'pass',
          icon: 'el-icon-time',
          checkTime: '2023-12-01 10:30:00'
        }
      ],
      
      // 历史报告
      historyReports: [
        {
          id: 1,
          name: '2023年12月综合审计报告',
          type: '综合报告',
          createTime: '2023-12-01 10:30:00',
          size: '2.5MB'
        },
        {
          id: 2,
          name: '2023年11月安全审计报告',
          type: '安全报告',
          createTime: '2023-11-30 15:20:00',
          size: '1.8MB'
        }
      ]
    }
  },
  computed: {
    ...mapGetters('audit', [
      'statistics',
      'reportGenerating',
      'exportLoading'
    ])
  },
  filters: {
    formatNumber(value) {
      if (!value) return '0'
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
  },
  async created() {
    await this.initData()
  },
  methods: {
    ...mapActions('audit', [
      'getAuditStatistics',
      'generateAuditReport',
      'exportAuditData'
    ]),

    // 初始化数据
    async initData() {
      try {
        await this.getAuditStatistics()
      } catch (error) {
        console.error('初始化数据失败:', error)
        this.$message.error('加载数据失败')
      }
    },

    // 标签页切换
    handleTabClick(tab) {
      // 根据需要加载对应数据
    },

    // 生成报告
    generateReport() {
      this.activeTab = 'reports'
    },

    // 导出数据
    exportData() {
      this.exportDialogVisible = true
    },

    // 生成审计报告
    async generateAuditReport() {
      try {
        const params = {
          reportType: this.reportForm.reportType,
          timeRange: this.reportForm.timeRange,
          format: this.reportForm.format
        }

        if (this.reportForm.timeRange === 'custom' && this.reportForm.customTimeRange.length === 2) {
          params.startTime = this.reportForm.customTimeRange[0]
          params.endTime = this.reportForm.customTimeRange[1]
        }

        await this.generateAuditReport(params)
        this.$message.success('报告生成成功')
        
        // 刷新历史报告列表
        // await this.loadHistoryReports()
      } catch (error) {
        console.error('生成报告失败:', error)
        this.$message.error('生成报告失败: ' + error.message)
      }
    },

    // 确认导出数据
    async confirmExportData() {
      try {
        const params = {
          dataTypes: this.exportForm.dataTypes,
          format: this.exportForm.format,
          filters: {}
        }

        if (this.exportForm.timeRange && this.exportForm.timeRange.length === 2) {
          params.filters.startTime = this.exportForm.timeRange[0]
          params.filters.endTime = this.exportForm.timeRange[1]
        }

        await this.exportAuditData(params)
        this.exportDialogVisible = false
        this.$message.success('导出成功')
      } catch (error) {
        console.error('导出失败:', error)
        this.$message.error('导出失败: ' + error.message)
      }
    },

    // 执行合规性检查
    runComplianceCheck() {
      this.$message.info('正在执行合规性检查...')
      // 模拟检查过程
      setTimeout(() => {
        this.$message.success('合规性检查完成')
      }, 2000)
    },

    // 下载报告
    downloadReport(report) {
      this.$message.success(`正在下载: ${report.name}`)
    },

    // 删除报告
    deleteReport(report) {
      this.$confirm(`确定要删除报告 "${report.name}" 吗？`, '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('删除成功')
        // 从列表中移除
        const index = this.historyReports.findIndex(item => item.id === report.id)
        if (index > -1) {
          this.historyReports.splice(index, 1)
        }
      }).catch(() => {
        // 用户取消删除
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.audit-management {
  padding: 20px;
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    
    .page-title {
      h2 {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
        color: #303133;
      }
      
      p {
        margin: 0;
        font-size: 14px;
        color: #909399;
      }
    }
    
    .page-actions {
      .el-button {
        margin-left: 12px;
      }
    }
  }
  
  .stats-overview {
    margin-bottom: 24px;
    
    .stat-card {
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.15);
      }
      
      .stat-content {
        display: flex;
        align-items: center;
        
        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          
          i {
            font-size: 24px;
            color: #fff;
          }
          
          &.operations {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          
          &.users {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }
          
          &.success {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          }
          
          &.error {
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
          }
        }
        
        .stat-info {
          flex: 1;
          
          .stat-value {
            margin: 0 0 4px 0;
            font-size: 28px;
            font-weight: 700;
            color: #303133;
          }
          
          .stat-label {
            margin: 0 0 4px 0;
            font-size: 14px;
            color: #909399;
          }
          
          .stat-change {
            margin: 0;
            font-size: 12px;
            
            &.positive {
              color: #67c23a;
            }
            
            &.negative {
              color: #f56c6c;
            }
            
            i {
              margin-right: 2px;
            }
          }
        }
      }
    }
  }
  
  .compliance-section {
    .compliance-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
      
      .compliance-item {
        display: flex;
        align-items: flex-start;
        padding: 20px;
        border: 1px solid #ebeef5;
        border-radius: 8px;
        transition: all 0.3s;
        
        &:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .compliance-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          
          &.pass {
            background: #f0f9ff;
            color: #67c23a;
          }
          
          &.fail {
            background: #fef0f0;
            color: #f56c6c;
          }
          
          i {
            font-size: 20px;
          }
        }
        
        .compliance-info {
          flex: 1;
          
          h4 {
            margin: 0 0 8px 0;
            font-size: 16px;
            font-weight: 600;
            color: #303133;
          }
          
          p {
            margin: 0 0 12px 0;
            font-size: 14px;
            color: #606266;
            line-height: 1.5;
          }
          
          .compliance-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            
            .check-time {
              font-size: 12px;
              color: #909399;
            }
          }
        }
      }
    }
  }
  
  .reports-section {
    .card-header {
      font-weight: 600;
    }
  }
}
</style>