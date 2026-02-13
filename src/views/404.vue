<template>
  <ErrorPage
    error-code="404"
    title="页面未找到"
    description="抱歉，您访问的页面不存在或已被移除"
    :suggestions="[
      '检查URL拼写是否正确',
      '返回上一页重试',
      '使用导航菜单查找所需内容',
      '联系管理员确认页面状态'
    ]"
    :retryable="false"
    :show-contact-support="false"
  />
</template>

<script>
import ErrorPage from '@/components/ErrorPage'

export default {
  name: 'Page404',
  components: {
    ErrorPage
  }
}
</script>
