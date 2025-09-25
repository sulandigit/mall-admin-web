<template>
  <KPICard
    title=\"今日销售额\"
    subtitle=\"Today's Sales\"
    :value=\"salesData.value\"
    :percentage=\"salesData.percentage\"
    :trend=\"salesData.trend\"
    format=\"currency\"
    icon=\"el-icon-money\"
    icon-color=\"#67C23A\"
    :loading=\"loading\"
    :last-update=\"lastUpdate\"
    :show-more=\"true\"
    @more-click=\"handleMoreClick\"
  />
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import KPICard from './KPICard.vue'

export default {
  name: 'TodaySalesCard',
  components: {
    KPICard
  },
  
  computed: {
    ...mapState('salesDashboard', ['uiState', 'realTimeData']),
    ...mapGetters('salesDashboard', ['formattedSalesData']),
    
    loading() {
      return this.uiState.loading
    },
    
    lastUpdate() {
      return this.realTimeData.lastUpdateTime
    },
    
    salesData() {
      const kpiMetrics = this.$store.state.salesDashboard.kpiMetrics.todaySales
      return {
        value: kpiMetrics.value || 0,
        percentage: kpiMetrics.percentage || 0,
        trend: kpiMetrics.trend || 'stable'
      }
    }
  },
  
  methods: {
    handleMoreClick() {
      // 可以跳转到销售详情页面或显示更多信息
      this.$emit('drill-down', 'sales-detail')
    }
  }
}
</script>