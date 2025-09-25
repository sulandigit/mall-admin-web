<template>
  <KPICard
    title=\"实时转化率\"
    subtitle=\"Conversion Rate\"
    :value=\"conversionData.value\"
    :percentage=\"conversionData.percentage\"
    :trend=\"conversionData.trend\"
    format=\"percentage\"
    icon=\"el-icon-pie-chart\"
    icon-color=\"#E6A23C\"
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
  name: 'ConversionRateCard',
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
    
    conversionData() {
      const kpiMetrics = this.$store.state.salesDashboard.kpiMetrics.conversionRate
      return {
        value: kpiMetrics.value || 0,
        percentage: kpiMetrics.percentage || 0,
        trend: kpiMetrics.trend || 'stable'
      }
    }
  },
  
  methods: {
    handleMoreClick() {
      this.$emit('drill-down', 'conversion-detail')
    }
  }
}
</script>