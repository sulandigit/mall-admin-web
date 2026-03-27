<template>
  <div 
    class="hamburger" 
    :class="{ 'is-active': isActive }"
    @click="toggleClick"
  >
    <svg
      class="hamburger-icon"
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
    >
      <path
        d="M408 442h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm-8 204c0 4.4 3.6 8 8 8h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56zm504-486H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 632H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM142.4 642.1L298.7 519a8.84 8.84 0 0 0 0-13.9L142.4 381.9c-5.8-4.6-14.4-.5-14.4 6.9v246.3c0 7.4 8.5 11.5 14.4 6.9z"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isActive: boolean
  toggleClick: () => void
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
.hamburger {
  display: inline-block;
  vertical-align: middle;
  width: 20px;
  height: 20px;
  cursor: pointer;
  
  .hamburger-icon {
    width: 100%;
    height: 100%;
    transition: transform 0.38s;
    transform-origin: center;
  }
  
  &.is-active {
    .hamburger-icon {
      transform: rotate(90deg);
    }
  }
}
</style>