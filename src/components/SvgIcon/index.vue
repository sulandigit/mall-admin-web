<template>
  <div 
    v-if="isExternal" 
    :style="styleExternalIcon" 
    class="svg-external-icon svg-icon" 
    v-on="$attrs"
  />
  <svg v-else :class="svgClass" aria-hidden="true" v-on="$attrs">
    <use :href="iconName" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  iconClass: string
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  className: ''
})

// 判断是否是外部图标
const isExternal = computed(() => {
  return /^(https?:|mailto:|tel:)/.test(props.iconClass)
})

// 图标名称
const iconName = computed(() => {
  return `#icon-${props.iconClass}`
})

// SVG类名
const svgClass = computed(() => {
  if (props.className) {
    return 'svg-icon ' + props.className
  }
  return 'svg-icon'
})

// 外部图标样式
const styleExternalIcon = computed(() => ({
  mask: `url(${props.iconClass}) no-repeat 50% 50%`,
  '-webkit-mask': `url(${props.iconClass}) no-repeat 50% 50%`
}))
</script>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

.svg-external-icon {
  background-color: currentColor;
  mask-size: cover !important;
  display: inline-block;
}
</style>