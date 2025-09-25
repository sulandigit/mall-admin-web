<template>
  <div class="log-detail-page">
    <div class="page-header">
      <el-button @click="goBack" size="small">
        <i class="el-icon-arrow-left"></i>
        返回
      </el-button>
      <h2>日志详情</h2>
    </div>
    
    <log-detail
      :visible="true"
      :log-detail="logDetail"
      @close="goBack"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import LogDetail from './components/LogDetail'

export default {
  name: 'LogDetailPage',
  components: {
    LogDetail
  },
  computed: {
    ...mapGetters('log', ['currentLogDetail']),
    logDetail() {
      return this.currentLogDetail
    }
  },
  async created() {
    const logId = this.$route.params.id
    if (logId) {
      await this.fetchLogDetail(logId)
    }
  },
  methods: {
    ...mapActions('log', ['fetchLogDetail']),
    
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style lang="scss" scoped>
.log-detail-page {
  padding: 20px;
  
  .page-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    
    h2 {
      margin: 0 0 0 12px;
      font-size: 20px;
      color: #303133;
    }
  }
}
</style>