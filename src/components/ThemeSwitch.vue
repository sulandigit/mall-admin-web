<template>
  <div class="theme-switch" @click="toggleTheme">
    <el-tooltip :content="themeText" placement="bottom">
      <div class="theme-switch-button">
        <i :class="themeIcon"></i>
      </div>
    </el-tooltip>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ThemeSwitch',
  computed: {
    ...mapGetters(['theme']),
    themeIcon() {
      return this.theme === 'light' ? 'el-icon-moon' : 'el-icon-sunny'
    },
    themeText() {
      return this.theme === 'light' ? '切换到深色模式' : '切换到浅色模式'
    }
  },
  methods: {
    toggleTheme() {
      this.$store.dispatch('toggleTheme')
    }
  }
}
</script>

<style lang="scss" scoped>
.theme-switch {
  display: inline-block;
  height: 50px;
  line-height: 50px;
  padding: 0 15px;
  cursor: pointer;
  
  .theme-switch-button {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--bg-color-light);
    border: 1px solid var(--border-color-light);
    transition: all 0.3s;
    
    &:hover {
      background-color: var(--primary-color);
      border-color: var(--primary-color);
      
      i {
        color: #ffffff;
      }
    }
    
    i {
      font-size: 16px;
      color: var(--text-color-regular);
      transition: color 0.3s;
    }
  }
}
</style>