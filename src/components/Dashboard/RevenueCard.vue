<template>
  <KPICard
    title=\"平均客单价\"
    subtitle=\"Average Order Value\"
    :value=\"revenueData.value\"
    :percentage=\"revenueData.percentage\"
    :trend=\"revenueData.trend\"
    format=\"currency\"
    icon=\"el-icon-coin\"
    icon-color=\"#F56C6C\"
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
  name: 'RevenueCard',
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
    
    revenueData() {
      const kpiMetrics = this.$store.state.salesDashboard.kpiMetrics.avgOrderValue
      return {
        value: kpiMetrics.value || 0,
        percentage: kpiMetrics.percentage || 0,
        trend: kpiMetrics.trend || 'stable'
      }
    }
  },
  
  methods: {
    handleMoreClick() {
      this.$emit('drill-down', 'revenue-detail')
    }
  }
}
</script>