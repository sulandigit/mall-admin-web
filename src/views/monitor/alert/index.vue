<template>
  <div class="alert-monitor">
    <!-- 告警统计概览 -->
    <el-row :gutter="20" class="alert-overview">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon active">
              <i class="el-icon-warning"></i>
            </div>
            <div class="stat-content">
              <div class="stat-title">活跃告警</div>
              <div class="stat-value">{{ alertStats.active }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon resolved">
              <i class="el-icon-circle-check"></i>
            </div>
            <div class="stat-content">
              <div class="stat-title">已解决</div>
              <div class="stat-value">{{ alertStats.resolved }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon rules">
              <i class="el-icon-setting"></i>
            </div>
            <div class="stat-content">
              <div class="stat-title">告警规则</div>
              <div class="stat-value">{{ alertRules.length }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon total">
              <i class="el-icon-data-line"></i>
            </div>
            <div class="stat-content">
              <div class="stat-title">今日告警</div>
              <div class="stat-value">{{ alertStats.today }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 告警规则管理 -->
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card>
          <div slot="header">
            <span>告警规则配置</span>
            <el-button
              style="float: right;"
              type="primary"
              size="small"
              @click="showAddRuleDialog"
            >
              <i class="el-icon-plus"></i> 添加规则
            </el-button>
          </div>
          
          <el-table :data="alertRules" style="width: 100%">
            <el-table-column prop="name" label="规则名称" min-width="150"></el-table-column>
            <el-table-column prop="metric" label="监控指标" width="120"></el-table-column>
            <el-table-column prop="condition" label="条件" width="80" align="center"></el-table-column>
            <el-table-column prop="threshold" label="阈值" width="100"></el-table-column>
            <el-table-column prop="notificationMethod" label="通知方式" width="100">
              <template slot-scope="scope">
                <el-tag size="mini" :type="getNotificationTagType(scope.row.notificationMethod)">
                  {{ getNotificationText(scope.row.notificationMethod) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="enabled" label="状态" width="80" align="center">
              <template slot-scope="scope">
                <el-switch
                  v-model="scope.row.enabled"
                  @change="handleRuleToggle(scope.row)"
                ></el-switch>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" align="center">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="editRule(scope.row)">编辑</el-button>
                <el-button type="text" size="small" @click="deleteRule(scope.row)" style="color: #F56C6C;">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card>
          <div slot="header">
            <span>最近告警记录</span>
          </div>
          
          <div class="alert-history">
            <div v-for="alert in recentAlerts" :key="alert.id" class="alert-item">
              <div class="alert-info">
                <el-tag :type="getAlertLevelType(alert.level)" size="small">
                  {{ alert.level }}
                </el-tag>
                <div class="alert-message">{{ alert.message }}</div>
              </div>
              <div class="alert-time">{{ formatTime(alert.time) }}</div>
              <div class="alert-status">
                <el-tag
                  :type="alert.status === 'resolved' ? 'success' : 'warning'"
                  size="mini"
                >
                  {{ alert.status === 'resolved' ? '已解决' : '活跃' }}
                </el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加/编辑告警规则对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="ruleDialogVisible"
      width="600px"
      @close="resetRuleForm"
    >
      <el-form :model="ruleForm" :rules="ruleRules" ref="ruleForm" label-width="100px">
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="ruleForm.name" placeholder="请输入规则名称"></el-input>
        </el-form-item>
        
        <el-form-item label="监控指标" prop="metric">
          <el-select v-model="ruleForm.metric" placeholder="请选择监控指标" style="width: 100%">
            <el-option label="CPU使用率" value="cpu_usage"></el-option>
            <el-option label="内存使用率" value="memory_usage"></el-option>
            <el-option label="磁盘使用率" value="disk_usage"></el-option>
            <el-option label="响应时间" value="response_time"></el-option>
            <el-option label="错误率" value="error_rate"></el-option>
            <el-option label="并发连接数" value="connection_count"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="条件" prop="condition">
          <el-select v-model="ruleForm.condition" placeholder="请选择条件">
            <el-option label="大于" value=">"></el-option>
            <el-option label="小于" value="<"></el-option>
            <el-option label="等于" value="="></el-option>
            <el-option label="大于等于" value=">="></el-option>
            <el-option label="小于等于" value="<="></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="阈值" prop="threshold">
          <el-input-number
            v-model="ruleForm.threshold"
            :min="0"
            :max="100000"
            placeholder="请输入阈值"
            style="width: 100%"
          ></el-input-number>
        </el-form-item>
        
        <el-form-item label="通知方式" prop="notificationMethod">
          <el-select v-model="ruleForm.notificationMethod" placeholder="请选择通知方式">
            <el-option label="邮件" value="email"></el-option>
            <el-option label="短信" value="sms"></el-option>
            <el-option label="钉钉" value="dingtalk"></el-option>
            <el-option label="微信" value="wechat"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="启用状态">
          <el-switch v-model="ruleForm.enabled"></el-switch>
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="ruleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRule">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getAlertConfig, saveAlertConfig, getAlertHistory } from '@/api/monitor'

export default {
  name: 'AlertMonitor',
  data() {
    return {
      alertStats: {
        active: 5,
        resolved: 23,
        today: 12
      },
      
      alertRules: [],
      recentAlerts: [],
      
      ruleDialogVisible: false,
      isEditing: false,
      currentEditId: null,
      
      ruleForm: {
        name: '',
        metric: '',
        threshold: 0,
        condition: '>',
        notificationMethod: 'email',
        enabled: true
      },
      
      ruleRules: {
        name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
        metric: [{ required: true, message: '请选择监控指标', trigger: 'change' }],
        threshold: [{ required: true, message: '请输入阈值', trigger: 'blur' }],
        condition: [{ required: true, message: '请选择条件', trigger: 'change' }],
        notificationMethod: [{ required: true, message: '请选择通知方式', trigger: 'change' }]
      }
    }
  },
  
  computed: {
    dialogTitle() {
      return this.isEditing ? '编辑告警规则' : '添加告警规则'
    }
  },
  
  created() {
    this.loadData()
  },
  
  methods: {
    async loadData() {
      await Promise.all([
        this.loadAlertRules(),
        this.loadAlertHistory()
      ])
    },
    
    async loadAlertRules() {
      try {
        const response = await getAlertConfig()
        this.alertRules = response.data.rules
      } catch (error) {
        console.error('Failed to load alert rules:', error)
      }
    },
    
    async loadAlertHistory() {
      try {
        const response = await getAlertHistory()
        this.recentAlerts = response.data.alerts.slice(0, 10)
      } catch (error) {
        console.error('Failed to load alert history:', error)
      }
    },
    
    showAddRuleDialog() {
      this.isEditing = false
      this.currentEditId = null
      this.ruleDialogVisible = true
    },
    
    editRule(rule) {
      this.isEditing = true
      this.currentEditId = rule.id
      this.ruleForm = { ...rule }
      this.ruleDialogVisible = true
    },
    
    async deleteRule(rule) {
      try {
        await this.$confirm('确定要删除这个告警规则吗？', '确认删除', {
          type: 'warning'
        })
        
        const index = this.alertRules.findIndex(r => r.id === rule.id)
        if (index > -1) {
          this.alertRules.splice(index, 1)
          await this.saveAlertConfig()
          this.$message.success('删除成功')
        }
      } catch (error) {
        console.log('取消删除')
      }
    },
    
    async handleRuleToggle(rule) {
      try {
        await this.saveAlertConfig()
        this.$message.success(rule.enabled ? '规则已启用' : '规则已禁用')
      } catch (error) {
        console.error('Failed to toggle rule:', error)
        rule.enabled = !rule.enabled // 回滚状态
      }
    },
    
    async saveRule() {
      try {
        await this.$refs.ruleForm.validate()
        
        if (this.isEditing) {
          const index = this.alertRules.findIndex(r => r.id === this.currentEditId)
          if (index > -1) {
            this.alertRules[index] = { ...this.ruleForm, id: this.currentEditId }
          }
        } else {
          this.ruleForm.id = Date.now()
          this.alertRules.push({ ...this.ruleForm })
        }
        
        await this.saveAlertConfig()
        this.ruleDialogVisible = false
        this.$message.success(this.isEditing ? '修改成功' : '添加成功')
      } catch (error) {
        console.error('Validation failed:', error)
      }
    },
    
    async saveAlertConfig() {
      try {
        await saveAlertConfig({ rules: this.alertRules })
      } catch (error) {
        console.error('Failed to save alert config:', error)
        this.$message.error('保存失败')
      }
    },
    
    resetRuleForm() {
      this.ruleForm = {
        name: '',
        metric: '',
        threshold: 0,
        condition: '>',
        notificationMethod: 'email',
        enabled: true
      }
      this.$nextTick(() => {
        this.$refs.ruleForm && this.$refs.ruleForm.clearValidate()
      })
    },
    
    getNotificationTagType(method) {
      const types = {
        email: 'primary',
        sms: 'success',
        dingtalk: 'warning',
        wechat: 'info'
      }
      return types[method] || 'info'
    },
    
    getNotificationText(method) {
      const texts = {
        email: '邮件',
        sms: '短信',
        dingtalk: '钉钉',
        wechat: '微信'
      }
      return texts[method] || method
    },
    
    getAlertLevelType(level) {
      const types = {
        critical: 'danger',
        error: 'danger',
        warning: 'warning',
        info: 'info'
      }
      return types[level] || 'info'
    },
    
    formatTime(timeStr) {
      const time = new Date(timeStr)
      return time.toLocaleString()
    }
  }
}
</script>

<style scoped>
.alert-monitor {
  padding: 20px;
}

.alert-overview {
  margin-bottom: 20px;
}

.stat-card {
  height: 120px;
}

.stat-item {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.stat-icon i {
  font-size: 20px;
  color: white;
}

.stat-icon.active {
  background: linear-gradient(45deg, #F56C6C, #FF8A80);
}

.stat-icon.resolved {
  background: linear-gradient(45deg, #67C23A, #81C784);
}

.stat-icon.rules {
  background: linear-gradient(45deg, #409EFF, #64B5F6);
}

.stat-icon.total {
  background: linear-gradient(45deg, #E6A23C, #FFB74D);
}

.stat-content {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.alert-history {
  max-height: 400px;
  overflow-y: auto;
}

.alert-item {
  padding: 12px;
  border-bottom: 1px solid #EBEEF5;
  margin-bottom: 8px;
}

.alert-item:last-child {
  border-bottom: none;
}

.alert-info {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.alert-message {
  margin-left: 8px;
  font-size: 14px;
  color: #606266;
}

.alert-time {
  font-size: 12px;
  color: #C0C4CC;
  margin-bottom: 5px;
}

.alert-status {
  text-align: right;
}

.dialog-footer {
  text-align: right;
}
</style>