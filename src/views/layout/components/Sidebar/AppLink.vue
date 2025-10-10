<template>
  <component :is="linkComponent" v-bind="linkProps">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

interface Props {
  to: string
}

const props = defineProps<Props>()

// 判断是否是外部链接
const isExternal = (path: string): boolean => {
  return /^(https?:|mailto:|tel:)/.test(path)
}

// 动态组件和属性
const linkComponent = computed(() => {
  return isExternal(props.to) ? 'a' : RouterLink
})

const linkProps = computed(() => {
  if (isExternal(props.to)) {
    return {
      href: props.to,
      target: '_blank',
      rel: 'noopener'
    }
  }
  return {
    to: props.to
  }
})
</script>