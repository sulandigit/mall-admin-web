<template>
  <!-- 使用v-memo优化审核状态单元格 -->
  <div v-memo="memoDeps" class="verify-status-cell">
    <p class="status-text">{{ getVerifyStatusText(product.verifyStatus) }}</p>
    <el-button
      type="text"
      size="mini"
      @click="handleShowVerifyDetail"
      class="detail-button"
    >
      审核详情
    </el-button>
  </div>
</template>

<script>
export default {
  name: 'VerifyStatusCell',
  
  props: {
    product: {
      type: Object,
      required: true
    },
    memoDeps: {
      type: Array,
      default: () => []
    }
  },
  
  methods: {
    // 获取审核状态文本
    getVerifyStatusText(status) {
      return status === 1 ? '审核通过' : '未审核'
    },
    
    // 显示审核详情
    handleShowVerifyDetail() {
      this.$emit('show-verify-detail', {
        index: this.$parent.$index,
        product: this.product
      })
    }
  }
}
</script>

<style scoped>
.verify-status-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 5px;
}

.status-text {
  margin: 0;
  font-size: 12px;
  color: #606266;
}

.detail-button {
  font-size: 12px;
  padding: 0;
  height: auto;
  line-height: 1.2;
}

.detail-button:hover {
  color: #409eff;
}
</style>