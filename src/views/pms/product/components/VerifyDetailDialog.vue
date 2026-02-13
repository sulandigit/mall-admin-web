<template>
  <el-dialog
    title="审核详情"
    :visible.sync="dialogVisible"
    width="60%"
    :before-close="handleClose"
    append-to-body
  >
    <div class="verify-detail-dialog">
      <!-- 商品基本信息 -->
      <div class="product-summary">
        <h4>商品信息</h4>
        <div class="product-basic">
          <div class="product-image">
            <img :src="productData.pic" :alt="productData.name" />
          </div>
          <div class="product-info">
            <p><strong>商品名称：</strong>{{ productData.name }}</p>
            <p><strong>商品货号：</strong>{{ productData.productSn }}</p>
            <p><strong>商品品牌：</strong>{{ productData.brandName }}</p>
            <p><strong>销售价格：</strong>￥{{ productData.price }}</p>
          </div>
        </div>
      </div>
      
      <!-- 审核状态 -->
      <div class="verify-status">
        <h4>审核状态</h4>
        <div class="status-info">
          <el-tag 
            :type="getStatusType(productData.verifyStatus)" 
            size="medium"
          >
            {{ getStatusText(productData.verifyStatus) }}
          </el-tag>
          <span class="status-time">
            更新时间：{{ formatTime(productData.updateTime) }}
          </span>
        </div>
      </div>
      
      <!-- 审核历史 -->
      <div class="verify-history">
        <h4>审核历史</h4>
        <el-timeline>
          <el-timeline-item
            v-for="(item, index) in verifyHistory"
            :key="index"
            :timestamp="formatTime(item.timestamp)"
            :type="getTimelineType(item.status)"
          >
            <div class="timeline-content">
              <div class="timeline-header">
                <span class="action">{{ item.action }}</span>
                <span class="operator">操作人：{{ item.operator }}</span>
              </div>
              <div v-if="item.remark" class="timeline-remark">
                备注：{{ item.remark }}
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
      
      <!-- 审核操作（如果当前用户有权限） -->
      <div v-if="canOperate" class="verify-operations">
        <h4>审核操作</h4>
        <div class="operation-form">
          <el-radio-group v-model="operationType">
            <el-radio label="approve">审核通过</el-radio>
            <el-radio label="reject">审核拒绝</el-radio>
          </el-radio-group>
          
          <el-input
            v-model="operationRemark"
            type="textarea"
            :rows="3"
            placeholder="请输入审核备注"
            style="margin-top: 12px"
          />
          
          <div class="operation-buttons">
            <el-button 
              type="primary" 
              @click="handleVerifyOperation"
              :loading="submitting"
            >
              提交审核
            </el-button>
          </div>
        </div>
      </div>
    </div>
    
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'VerifyDetailDialog',
  
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    modalData: {
      type: Object,
      default: () => ({})
    }
  },
  
  data() {
    return {
      dialogVisible: false,
      productData: {},
      verifyHistory: [],
      operationType: 'approve',
      operationRemark: '',
      submitting: false,
      canOperate: true // 这里应该根据用户权限判断
    }
  },
  
  watch: {
    visible(newVal) {
      this.dialogVisible = newVal
      if (newVal) {
        this.initDialog()
      }
    },
    
    dialogVisible(newVal) {
      if (!newVal) {
        this.$emit('close')
      }
    }
  },
  
  methods: {
    // 初始化对话框
    initDialog() {
      this.productData = this.modalData.product || {}
      this.loadVerifyHistory()
      this.resetForm()
    },
    
    // 加载审核历史
    loadVerifyHistory() {
      // 模拟审核历史数据
      this.verifyHistory = [
        {
          timestamp: Date.now() - 86400000, // 1天前
          action: '商品创建',
          operator: '张三',
          status: 'created',
          remark: '商品初始创建'
        },
        {
          timestamp: Date.now() - 43200000, // 12小时前
          action: '提交审核',
          operator: '李四',
          status: 'submitted',
          remark: '商品信息完善，提交审核'
        },
        {
          timestamp: Date.now() - 21600000, // 6小时前
          action: '审核中',
          operator: '王五',
          status: 'reviewing',
          remark: '正在审核商品详情'
        }
      ]
      
      // 如果商品已经审核通过或拒绝，添加最终状态
      if (this.productData.verifyStatus === 1) {
        this.verifyHistory.push({
          timestamp: Date.now() - 3600000, // 1小时前
          action: '审核通过',
          operator: '管理员',
          status: 'approved',
          remark: '商品信息符合要求，审核通过'
        })
      } else if (this.productData.verifyStatus === 0) {
        this.verifyHistory.push({
          timestamp: Date.now() - 3600000,
          action: '审核拒绝',
          operator: '管理员',
          status: 'rejected',
          remark: '商品信息不完整，需要补充'
        })
      }
      
      // 按时间倒序排列
      this.verifyHistory.sort((a, b) => b.timestamp - a.timestamp)
    },
    
    // 获取状态类型
    getStatusType(status) {
      const statusMap = {
        1: 'success', // 审核通过
        0: 'danger',  // 审核拒绝
        2: 'warning'  // 审核中
      }
      return statusMap[status] || 'info'
    },
    
    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        1: '审核通过',
        0: '审核拒绝',
        2: '审核中'
      }
      return statusMap[status] || '未审核'
    },
    
    // 获取时间轴类型
    getTimelineType(status) {
      const typeMap = {
        'created': 'primary',
        'submitted': 'info',
        'reviewing': 'warning',
        'approved': 'success',
        'rejected': 'danger'
      }
      return typeMap[status] || 'info'
    },
    
    // 格式化时间
    formatTime(timestamp) {
      if (!timestamp) return '-'
      
      const date = new Date(timestamp)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    },
    
    // 处理审核操作
    async handleVerifyOperation() {
      if (!this.operationType) {
        this.$message.warning('请选择审核操作')
        return
      }
      
      if (!this.operationRemark.trim()) {
        this.$message.warning('请输入审核备注')
        return
      }
      
      this.submitting = true
      
      try {
        // 这里应该调用实际的审核API
        // await submitVerifyOperation({
        //   productId: this.productData.id,
        //   operation: this.operationType,
        //   remark: this.operationRemark
        // })
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const actionText = this.operationType === 'approve' ? '审核通过' : '审核拒绝'
        this.$message.success(`${actionText}操作成功`)
        
        // 更新审核历史
        this.verifyHistory.unshift({
          timestamp: Date.now(),
          action: actionText,
          operator: '当前用户',
          status: this.operationType === 'approve' ? 'approved' : 'rejected',
          remark: this.operationRemark
        })
        
        // 更新商品状态
        this.productData.verifyStatus = this.operationType === 'approve' ? 1 : 0
        
        // 重置表单
        this.resetForm()
        
        // 通知父组件刷新数据
        this.$emit('verify-updated', {
          productId: this.productData.id,
          verifyStatus: this.productData.verifyStatus
        })
        
      } catch (error) {
        this.$message.error('审核操作失败')
        console.error('Verify operation failed:', error)
      } finally {
        this.submitting = false
      }
    },
    
    // 重置表单
    resetForm() {
      this.operationType = 'approve'
      this.operationRemark = ''
    },
    
    // 处理关闭
    handleClose() {
      this.dialogVisible = false
      this.resetForm()
    }
  }
}
</script>

<style scoped>
.verify-detail-dialog {
  max-height: 70vh;
  overflow-y: auto;
}

.verify-detail-dialog h4 {
  color: #303133;
  font-size: 16px;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.product-summary {
  margin-bottom: 24px;
}

.product-basic {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.product-image img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.product-info {
  flex: 1;
}

.product-info p {
  margin: 8px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.verify-status {
  margin-bottom: 24px;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-time {
  color: #909399;
  font-size: 12px;
}

.verify-history {
  margin-bottom: 24px;
}

.timeline-content {
  padding-left: 8px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.action {
  font-weight: 500;
  color: #303133;
}

.operator {
  font-size: 12px;
  color: #909399;
}

.timeline-remark {
  color: #606266;
  font-size: 12px;
  line-height: 1.4;
  background-color: #f5f7fa;
  padding: 8px;
  border-radius: 4px;
  margin-top: 4px;
}

.verify-operations {
  border-top: 1px solid #ebeef5;
  padding-top: 24px;
}

.operation-form {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
}

.operation-buttons {
  margin-top: 16px;
  text-align: right;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .product-basic {
    flex-direction: column;
  }
  
  .status-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .timeline-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .verify-detail-dialog {
    max-height: 60vh;
  }
}

/* 滚动条样式 */
.verify-detail-dialog::-webkit-scrollbar {
  width: 6px;
}

.verify-detail-dialog::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.verify-detail-dialog::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.verify-detail-dialog::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* 时间轴样式优化 */
.el-timeline-item__timestamp {
  font-size: 12px;
  color: #909399;
}

.el-timeline-item__wrapper {
  padding-left: 24px;
}
</style>