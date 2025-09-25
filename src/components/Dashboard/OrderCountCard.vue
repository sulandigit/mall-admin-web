<template>
  <KPICard
    title=\"今日订单数\"
    subtitle=\"Today's Orders\"
    :value=\"orderData.value\"
    :percentage=\"orderData.percentage\"
    :trend=\"orderData.trend\"
    format=\"number\"
    :precision=\"0\"
    icon=\"el-icon-shopping-cart-2\"
    icon-color=\"#409EFF\"
    :loading=\"loading\"
    :last-update=\"lastUpdate\"
    :show-more=\"true\"
    @more-click=\"handleMoreClick\"
  />
</template>

<script>
import { mapState } from 'vuex'
import KPICard from './KPICard.vue'

export default {
  name: 'OrderCountCard',
  components: {
    KPICard
  },
  
  computed: {
    ...mapState('salesDashboard', ['uiState', 'realTimeData']),
    
    loading() {
      return this.uiState.loading
    },
    
    lastUpdate() {
      return this.realTimeData.lastUpdateTime
    },
    
    orderData() {
      const kpiMetrics = this.$store.state.salesDashboard.kpiMetrics.todayOrders
      return {
        value: kpiMetrics.value || 0,
        percentage: kpiMetrics.percentage || 0,
        trend: kpiMetrics.trend || 'stable'
      }
    }
  },
  
  methods: {
    handleMoreClick() {
      this.$emit('drill-down', 'order-detail')
    }
  }
}
</script>