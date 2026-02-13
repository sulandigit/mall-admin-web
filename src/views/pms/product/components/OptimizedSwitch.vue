<template>
  <!-- 高性能优化的开关组件 -->
  <div 
    class="optimized-switch"
    :class="{ 
      'is-checked': isChecked, 
      'is-disabled': disabled,
      'is-transitioning': isTransitioning
    }"
    @click="handleClick"
  >
    <div class="switch-core">
      <div class="switch-button"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OptimizedSwitch',
  
  props: {
    value: {
      type: [Boolean, Number],
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      isTransitioning: false
    }
  },
  
  computed: {
    isChecked() {
      return this.value === true || this.value === 1
    }
  },
  
  methods: {
    handleClick() {
      if (this.disabled || this.isTransitioning) return
      
      // 设置过渡状态，防止频繁点击
      this.isTransitioning = true
      
      // 触发值变化
      const newValue = !this.isChecked
      this.$emit('change', newValue)
      
      // 重置过渡状态
      setTimeout(() => {
        this.isTransitioning = false
      }, 200)
    }
  }
}
</script>

<style scoped>
.optimized-switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
  cursor: pointer;
  user-select: none;
  /* 优化渲染性能 */
  contain: layout style paint;
  will-change: auto;
}

.optimized-switch.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.optimized-switch.is-transitioning {
  pointer-events: none;
}

.switch-core {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #dcdfe6;
  border-radius: 10px;
  transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  /* 使用transform3d启用硬件加速 */
  transform: translate3d(0, 0, 0);
}

.optimized-switch.is-checked .switch-core {
  background-color: #409eff;
}

.switch-button {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background-color: #ffffff;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  /* 使用transform3d启用硬件加速 */
  transform: translate3d(0, 0, 0);
}

.optimized-switch.is-checked .switch-button {
  transform: translate3d(18px, 0, 0);
}

/* 悬停效果 */
.optimized-switch:not(.is-disabled):hover .switch-core {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.optimized-switch.is-checked:not(.is-disabled):hover .switch-core {
  background-color: #66b1ff;
}

/* 激活状态 */
.optimized-switch:not(.is-disabled):active .switch-button {
  transform: scale(0.9) translate3d(0, 0, 0);
}

.optimized-switch.is-checked:not(.is-disabled):active .switch-button {
  transform: scale(0.9) translate3d(18px, 0, 0);
}

/* 焦点状态 */
.optimized-switch:focus {
  outline: none;
}

.optimized-switch:focus .switch-core {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.3);
}

/* 性能优化：减少重绘 */
.switch-core,
.switch-button {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

/* 禁用状态下的特殊样式 */
.optimized-switch.is-disabled .switch-core {
  background-color: #f5f7fa;
}

.optimized-switch.is-disabled.is-checked .switch-core {
  background-color: #a0cfff;
}
</style>