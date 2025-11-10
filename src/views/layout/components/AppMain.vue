<template>
  <section class="app-main" 
           role="main" 
           aria-label="主要内容区域"
           tabindex="-1">
    <transition name="fade" mode="out-in">
      <router-view :key="key"></router-view>
    </transition>
  </section>
</template>

<script>
export default {
  name: 'AppMain',
  computed: {
    key() {
      return this.$route.fullPath
    }
  },
  watch: {
    $route() {
      // 在路由变化时宣告页面变化
      this.$nextTick(() => {
        const title = this.$route.meta && this.$route.meta.title
        if (title) {
          // 导入实时宣告器
          import('@/utils/accessibility').then(({ liveAnnouncer }) => {
            liveAnnouncer.announce(`已跳转到页面: ${title}`)
          })
        }
      })
    }
  }
}
</script>
