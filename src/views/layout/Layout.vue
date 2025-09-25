<template>
  <div class="app-wrapper" :class="classObj">
    <sidebar class="sidebar-container"></sidebar>
    <div class="main-container">
      <navbar></navbar>
      <app-main></app-main>
    </div>
    
    <!-- 快捷键相关组件 -->
    <shortcut-panel></shortcut-panel>
    <shortcut-help-dialog></shortcut-help-dialog>
  </div>
</template>

<script>
import { Navbar, Sidebar, AppMain } from './components'
import ShortcutPanel from '@/components/ShortcutPanel'
import ShortcutHelpDialog from '@/components/ShortcutHelp'
import ResizeMixin from './mixin/ResizeHandler'
import keyboardShortcutMixin from '@/mixins/keyboardShortcut'

export default {
  name: 'layout',
  components: {
    Navbar,
    Sidebar,
    AppMain,
    ShortcutPanel,
    ShortcutHelpDialog
  },
  mixins: [ResizeMixin, keyboardShortcutMixin],
  computed: {
    sidebar() {
      return this.$store.state.app.sidebar
    },
    device() {
      return this.$store.state.app.device
    },
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import "src/styles/mixin.scss";
  .app-wrapper {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;
  }
</style>
