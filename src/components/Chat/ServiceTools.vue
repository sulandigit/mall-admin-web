<template>
  <div class="service-tools">
    <!-- 常用功能 -->
    <div class="tool-section">
      <div class="section-title">
        <i class="el-icon-menu"></i>
        常用功能
      </div>
      <div class="tool-grid">
        <div class="tool-item" @click="checkOrder">
          <i class="el-icon-shopping-cart-2"></i>
          <span>查询订单</span>
        </div>
        <div class="tool-item" @click="checkLogistics">
          <i class="el-icon-truck"></i>
          <span>物流查询</span>
        </div>
        <div class="tool-item" @click="refundProcess">
          <i class="el-icon-refresh-left"></i>
          <span>退款处理</span>
        </div>
        <div class="tool-item" @click="couponManage">
          <i class="el-icon-ticket"></i>
          <span>优惠券</span>
        </div>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="tool-section">
      <div class="section-title">
        <i class="el-icon-lightning"></i>
        快捷操作
      </div>
      <div class="quick-actions">
        <el-button size="small" icon="el-icon-phone" @click="makeCall">
          拨打电话
        </el-button>
        <el-button size="small" icon="el-icon-message" @click="sendEmail">
          发送邮件
        </el-button>
        <el-button size="small" icon="el-icon-document" @click="createOrder">
          创建订单
        </el-button>
        <el-button size="small" icon="el-icon-tickets" @click="createTicket">
          创建工单
        </el-button>
      </div>
    </div>

    <!-- 客户标签 -->
    <div class="tool-section">
      <div class="section-title">
        <i class="el-icon-collection-tag"></i>
        客户标签
      </div>
      <div class="tag-manager">
        <div class="current-tags">
          <el-tag
            v-for="tag in customerTags"
            :key="tag"
            size="small"
            closable
            @close="removeTag(tag)"
            style="margin-right: 8px; margin-bottom: 8px;"
          >
            {{ tag }}
          </el-tag>
        </div>
        <el-input
          v-model="newTag"
          placeholder="添加标签"
          size="small"
          @keyup.enter.native="addTag"
        >
          <el-button slot="append" icon="el-icon-plus" @click="addTag"></el-button>
        </el-input>
      </div>
    </div>

    <!-- 备注信息 -->
    <div class="tool-section">
      <div class="section-title">
        <i class="el-icon-edit-outline"></i>
        备注信息
      </div>
      <div class="notes-section">
        <el-input
          v-model="customerNote"
          type="textarea"
          :rows="3"
          placeholder="添加客户备注..."
          @blur="saveNote"
        />
        <div class="note-actions">
          <el-button size="mini" type="text" @click="saveNote">
            保存备注
          </el-button>
          <el-button size="mini" type="text" @click="viewNoteHistory">
            历史备注
          </el-button>
        </div>
      </div>
    </div>

    <!-- 转接工具 -->
    <div class="tool-section">
      <div class="section-title">
        <i class="el-icon-sort"></i>
        转接工具
      </div>
      <div class="transfer-tools">
        <el-select 
          v-model="selectedDepartment"
          placeholder="选择部门"
          size="small"
          style="width: 100%; margin-bottom: 8px;"
        >
          <el-option 
            v-for="dept in departments"
            :key="dept.id"
            :label="dept.name"
            :value="dept.id"
          />
        </el-select>
        <el-select 
          v-model="selectedService"
          placeholder="选择客服"
          size="small"
          style="width: 100%; margin-bottom: 8px;"
        >
          <el-option 
            v-for="service in availableServices"
            :key="service.id"
            :label="service.name"
            :value="service.id"
          />
        </el-select>
        <el-button 
          size="small" 
          type="primary"
          style="width: 100%;"
          @click="transferSession"
        >
          转接会话
        </el-button>
      </div>
    </div>

    <!-- 满意度评价 -->
    <div class="tool-section">
      <div class="section-title">
        <i class="el-icon-star-on"></i>
        满意度评价
      </div>
      <div class="rating-section">
        <el-button 
          size="small"
          style="width: 100%; margin-bottom: 8px;"
          @click="requestRating"
        >
          请求客户评价
        </el-button>
        <div class="rating-stats">
          <div class="stat-item">
            <span class="stat-label">本月评分:</span>
            <span class="stat-value">4.8</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">评价数量:</span>
            <span class="stat-value">125</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 订单查询对话框 -->
    <el-dialog
      title="订单查询"
      :visible.sync="orderDialogVisible"
      width="600px"
    >
      <el-form :model="orderForm" label-width="80px">
        <el-form-item label="查询方式">
          <el-radio-group v-model="orderForm.searchType">
            <el-radio label="orderSn">订单号</el-radio>
            <el-radio label="phone">手机号</el-radio>
            <el-radio label="customerId">客户ID</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="查询内容">
          <el-input v-model="orderForm.searchValue" placeholder="请输入查询内容" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="orderDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="searchOrder">查询</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ServiceTools',

  data() {
    return {
      customerTags: ['新客户', 'VIP'],
      newTag: '',
      customerNote: '',
      selectedDepartment: '',
      selectedService: '',
      orderDialogVisible: false,
      
      orderForm: {
        searchType: 'orderSn',
        searchValue: ''
      },

      departments: [
        { id: 1, name: '售前咨询' },
        { id: 2, name: '售后服务' },
        { id: 3, name: '技术支持' }
      ],

      availableServices: [
        { id: 1, name: '张小明', status: 'online' },
        { id: 2, name: '李小红', status: 'busy' },
        { id: 3, name: '王小华', status: 'online' }
      ]
    }
  },

  methods: {
    // 查询订单
    checkOrder() {
      this.orderDialogVisible = true
    },

    // 物流查询
    checkLogistics() {
      this.$message.info('物流查询功能开发中')
    },

    // 退款处理
    refundProcess() {
      this.$message.info('退款处理功能开发中')
    },

    // 优惠券管理
    couponManage() {
      this.$message.info('优惠券管理功能开发中')
    },

    // 拨打电话
    makeCall() {
      this.$message.info('拨打电话功能开发中')
    },

    // 发送邮件
    sendEmail() {
      this.$message.info('发送邮件功能开发中')
    },

    // 创建订单
    createOrder() {
      this.$message.info('创建订单功能开发中')
    },

    // 创建工单
    createTicket() {
      this.$message.info('创建工单功能开发中')
    },

    // 添加标签
    addTag() {
      if (this.newTag.trim() && !this.customerTags.includes(this.newTag.trim())) {
        this.customerTags.push(this.newTag.trim())
        this.newTag = ''
        this.saveTags()
      }
    },

    // 移除标签
    removeTag(tag) {
      const index = this.customerTags.indexOf(tag)
      if (index > -1) {
        this.customerTags.splice(index, 1)
        this.saveTags()
      }
    },

    // 保存标签
    saveTags() {
      // 这里调用API保存标签
      console.log('保存客户标签:', this.customerTags)
    },

    // 保存备注
    saveNote() {
      // 这里调用API保存备注
      console.log('保存客户备注:', this.customerNote)
      this.$message.success('备注已保存')
    },

    // 查看备注历史
    viewNoteHistory() {
      this.$message.info('备注历史功能开发中')
    },

    // 转接会话
    transferSession() {
      if (!this.selectedService) {
        this.$message.warning('请选择要转接的客服')
        return
      }
      this.$message.info('转接会话功能开发中')
    },

    // 请求评价
    requestRating() {
      this.$message.info('请求评价功能开发中')
    },

    // 搜索订单
    searchOrder() {
      if (!this.orderForm.searchValue.trim()) {
        this.$message.warning('请输入查询内容')
        return
      }
      
      // 这里调用订单查询API
      console.log('查询订单:', this.orderForm)
      this.$message.success('查询成功')
      this.orderDialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.service-tools {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
}

.tool-section {
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;

  i {
    margin-right: 8px;
    color: #409EFF;
  }
}

.tool-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;

  .tool-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 8px;
    border: 1px solid #f0f0f0;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: #409EFF;
      background-color: #f0f9ff;
    }

    i {
      font-size: 20px;
      color: #409EFF;
      margin-bottom: 4px;
    }

    span {
      font-size: 12px;
      color: #666;
      text-align: center;
    }
  }
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .el-button {
    width: 100%;
    justify-content: flex-start;
  }
}

.tag-manager {
  .current-tags {
    margin-bottom: 8px;
    min-height: 24px;
  }
}

.notes-section {
  .note-actions {
    margin-top: 8px;
    text-align: right;
  }
}

.transfer-tools {
  .el-select {
    width: 100%;
  }
}

.rating-section {
  .rating-stats {
    margin-top: 12px;
    
    .stat-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      font-size: 12px;

      .stat-label {
        color: #666;
      }

      .stat-value {
        color: #409EFF;
        font-weight: 500;
      }
    }
  }
}
</style>