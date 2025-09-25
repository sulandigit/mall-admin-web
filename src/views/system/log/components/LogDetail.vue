<template>
  <el-dialog
    title="操作日志详情"
    :visible.sync="visible"
    width="80%"
    :before-close="handleClose"
    top="5vh"
  >
    <div class="log-detail" v-if="logDetail">
      <!-- 基本信息 -->
      <el-card class="detail-card" shadow="never">
        <div slot="header" class="card-header">
          <i class="el-icon-info"></i>
          基本信息
        </div>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="detail-item">
              <label>操作时间：</label>
              <span>{{ formatTime(logDetail.operationTime) }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-item">
              <label>用户名：</label>
              <span>{{ logDetail.username }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-item">
              <label>用户ID：</label>
              <span>{{ logDetail.userId }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-item">
              <label>操作类型：</label>
              <el-tag :type="getOperationTypeTagType(logDetail.operationType)">
                {{ getOperationTypeLabel(logDetail.operationType) }}
              </el-tag>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-item">
              <label>模块名称：</label>
              <span>{{ logDetail.moduleName }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-item">
              <label>操作状态：</label>
              <el-tag :type="logDetail.status === 'SUCCESS' ? 'success' : 'danger'">
                {{ logDetail.status === 'SUCCESS' ? '成功' : '失败' }}
              </el-tag>
            </div>
          </el-col>
        </el-row>
        
        <div class="detail-item">
          <label>操作描述：</label>
          <span>{{ logDetail.operationDesc }}</span>
        </div>
      </el-card>

      <!-- 请求信息 -->
      <el-card class="detail-card" shadow="never">
        <div slot="header" class="card-header">
          <i class="el-icon-upload"></i>
          请求信息
        </div>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="detail-item">
              <label>请求方法：</label>
              <el-tag :type="getMethodTagType(logDetail.requestMethod)">
                {{ logDetail.requestMethod }}
              </el-tag>
            </div>
          </el-col>
          <el-col :span="16">
            <div class="detail-item">
              <label>请求路径：</label>
              <code class="code-text">{{ logDetail.requestUrl }}</code>
            </div>
          </el-col>
        </el-row>
        
        <div class="detail-item" v-if="logDetail.requestParam">
          <label>请求参数：</label>
          <div class="json-viewer">
            <pre>{{ formatJson(logDetail.requestParam) }}</pre>
          </div>
        </div>
      </el-card>

      <!-- 响应信息 -->
      <el-card class="detail-card" shadow="never">
        <div slot="header" class="card-header">
          <i class="el-icon-download"></i>
          响应信息
        </div>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="detail-item">
              <label>执行时长：</label>
              <span :class="getDurationClass(logDetail.duration)">
                {{ logDetail.duration || 0 }} ms
              </span>
            </div>
          </el-col>
          <el-col :span="16">
            <div class="detail-item" v-if="logDetail.errorMsg">
              <label>错误信息：</label>
              <span class="error-msg">{{ logDetail.errorMsg }}</span>
            </div>
          </el-col>
        </el-row>
        
        <div class="detail-item" v-if="logDetail.responseData">
          <label>响应数据：</label>
          <div class="json-viewer">
            <el-collapse v-model="activeCollapse">
              <el-collapse-item title="点击查看响应数据" name="response">
                <pre>{{ formatJson(logDetail.responseData) }}</pre>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </el-card>

      <!-- 环境信息 -->
      <el-card class="detail-card" shadow="never">
        <div slot="header" class="card-header">
          <i class="el-icon-monitor"></i>
          环境信息
        </div>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="detail-item">
              <label>IP地址：</label>
              <span>{{ logDetail.ipAddress }}</span>
            </div>
          </el-col>
          <el-col :span="16">
            <div class="detail-item">
              <label>浏览器信息：</label>
              <span class="user-agent">{{ formatUserAgent(logDetail.userAgent) }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关闭</el-button>
      <el-button type="primary" @click="handleExportDetail">导出详情</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'LogDetail',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    logDetail: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      activeCollapse: []
    }
  },
  methods: {
    // 格式化时间
    formatTime(time) {
      if (!time) return ''
      return new Date(time).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    },
    
    // 格式化JSON
    formatJson(data) {
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data)
        } catch (e) {
          return data
        }
      }
      return JSON.stringify(data, null, 2)
    },
    
    // 格式化用户代理信息
    formatUserAgent(userAgent) {
      if (!userAgent) return ''
      
      // 提取浏览器和操作系统信息
      const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge|IE)\/?([\d.]+)?/)
      const osMatch = userAgent.match(/(Windows|Mac|Linux|Android|iOS)/)
      
      let result = ''
      if (browserMatch) {
        result += `${browserMatch[1]} ${browserMatch[2] || ''}`
      }
      if (osMatch) {
        result += ` (${osMatch[1]})`
      }
      
      return result || userAgent
    },
    
    // 获取操作类型标签样式
    getOperationTypeTagType(type) {
      const typeMap = {
        'LOGIN': 'success',
        'LOGOUT': 'info',
        'CREATE': 'primary',
        'UPDATE': 'warning',
        'DELETE': 'danger',
        'QUERY': '',
        'EXPORT': 'success',
        'BATCH': 'warning'
      }
      return typeMap[type] || ''
    },
    
    // 获取操作类型标签文本
    getOperationTypeLabel(type) {
      const labelMap = {
        'LOGIN': '登录',
        'LOGOUT': '登出',
        'CREATE': '创建',
        'UPDATE': '更新',
        'DELETE': '删除',
        'QUERY': '查询',
        'EXPORT': '导出',
        'BATCH': '批量'
      }
      return labelMap[type] || type
    },
    
    // 获取HTTP方法标签样式
    getMethodTagType(method) {
      const typeMap = {
        'GET': 'success',
        'POST': 'primary',
        'PUT': 'warning',
        'DELETE': 'danger',
        'PATCH': 'info'
      }
      return typeMap[method] || ''
    },
    
    // 获取耗时样式类
    getDurationClass(duration) {
      if (duration > 3000) {
        return 'duration-slow'
      } else if (duration > 1000) {
        return 'duration-medium'
      }
      return 'duration-fast'
    },
    
    // 关闭对话框
    handleClose() {
      this.$emit('close')
    },
    
    // 导出详情
    handleExportDetail() {
      if (!this.logDetail) return
      
      const detailData = {
        基本信息: {
          操作时间: this.formatTime(this.logDetail.operationTime),
          用户名: this.logDetail.username,
          用户ID: this.logDetail.userId,
          操作类型: this.getOperationTypeLabel(this.logDetail.operationType),
          模块名称: this.logDetail.moduleName,
          操作描述: this.logDetail.operationDesc,
          操作状态: this.logDetail.status === 'SUCCESS' ? '成功' : '失败'
        },
        请求信息: {
          请求方法: this.logDetail.requestMethod,
          请求路径: this.logDetail.requestUrl,
          请求参数: this.logDetail.requestParam
        },
        响应信息: {
          执行时长: `${this.logDetail.duration || 0} ms`,
          错误信息: this.logDetail.errorMsg,
          响应数据: this.logDetail.responseData
        },
        环境信息: {
          IP地址: this.logDetail.ipAddress,
          浏览器信息: this.formatUserAgent(this.logDetail.userAgent)
        }
      }
      
      // 导出为JSON文件
      const dataStr = JSON.stringify(detailData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `日志详情_${this.logDetail.username}_${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
      
      this.$message.success('导出成功')
    }
  }
}
</script>

<style lang="scss" scoped>
.log-detail {
  .detail-card {
    margin-bottom: 20px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .card-header {
      font-weight: 600;
      
      i {
        margin-right: 8px;
        color: #409eff;
      }
    }
  }
  
  .detail-item {
    margin-bottom: 16px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    label {
      display: inline-block;
      width: 100px;
      font-weight: 600;
      color: #606266;
    }
    
    span {
      color: #303133;
    }
  }
  
  .code-text {
    background: #f5f7fa;
    padding: 4px 8px;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 12px;
  }
  
  .json-viewer {
    margin-top: 8px;
    
    pre {
      background: #f5f7fa;
      padding: 16px;
      border-radius: 4px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 12px;
      line-height: 1.4;
      max-height: 300px;
      overflow-y: auto;
      margin: 0;
    }
  }
  
  .error-msg {
    color: #f56c6c;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  }
  
  .user-agent {
    font-size: 12px;
    color: #909399;
  }
  
  // 耗时样式
  .duration-fast {
    color: #67c23a;
    font-weight: 600;
  }
  
  .duration-medium {
    color: #e6a23c;
    font-weight: 600;
  }
  
  .duration-slow {
    color: #f56c6c;
    font-weight: 600;
  }
}
</style>