<template>
  <transition name="slide-fade">
    <div v-if="visible" class="shortcut-panel">
      <div class="panel-header">
        <h4>快捷键</h4>
        <el-button 
          type="text" 
          icon="el-icon-close" 
          @click="closePanel"
          class="close-btn">
        </el-button>
      </div>
      
      <div class="panel-content">
        <div class="current-page-shortcuts">
          <h5>当前页面</h5>
          <div class="shortcut-list">
            <div 
              v-for="shortcut in currentPageShortcuts" 
              :key="shortcut.key"
              class="shortcut-item"
              @click="executeShortcut(shortcut)">
              <div class="shortcut-key">{{ formatShortcutKey(shortcut.key) }}</div>
              <div class="shortcut-name">{{ shortcut.name }}</div>
            </div>
          </div>
        </div>
        
        <div class="global-shortcuts">
          <h5>全局快捷键</h5>
          <div class="shortcut-list">
            <div 
              v-for="shortcut in globalShortcuts" 
              :key="shortcut.key"
              class="shortcut-item"
              @click="executeShortcut(shortcut)">
              <div class="shortcut-key">{{ formatShortcutKey(shortcut.key) }}</div>
              <div class="shortcut-name">{{ shortcut.name }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="panel-footer">
        <el-button 
          type="text" 
          size="mini" 
          @click="showHelp"
          class="help-btn">
          <i class="el-icon-question"></i>
          查看所有快捷键
        </el-button>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'ShortcutPanel',
  computed: {
    ...mapGetters([
      'shortcutPanelVisible',
      'enabledShortcuts'
    ]),
    visible() {
      return this.shortcutPanelVisible
    },
    /**
     * 当前页面快捷键
     */
    currentPageShortcuts() {
      const currentRoute = this.$route.path
      const shortcuts = []
      
      // 根据当前路由返回相关快捷键
      Object.keys(this.enabledShortcuts).forEach(key => {
        const shortcut = this.enabledShortcuts[key]
        if (shortcut.category === 'common') {
          shortcuts.push({ key, ...shortcut })
        }
      })
      
      return shortcuts.slice(0, 5) // 限制显示数量
    },
    /**
     * 全局快捷键
     */
    globalShortcuts() {
      const shortcuts = []
      
      Object.keys(this.enabledShortcuts).forEach(key => {
        const shortcut = this.enabledShortcuts[key]
        if (shortcut.category === 'navigation' || shortcut.category === 'help') {
          shortcuts.push({ key, ...shortcut })
        }
      })
      
      return shortcuts.slice(0, 6) // 限制显示数量
    }
  },
  methods: {
    ...mapActions([
      'HideShortcutPanel',
      'ShowHelpDialog'
    ]),
    /**
     * 格式化快捷键显示
     */
    formatShortcutKey(key) {
      return key.split('+').map(k => {
        const keyMap = {
          'ctrl': 'Ctrl',
          'alt': 'Alt',
          'shift': 'Shift',
          'meta': 'Cmd',
          'delete': 'Del',
          'escape': 'Esc'
        }
        return keyMap[k.toLowerCase()] || k.toUpperCase()
      }).join(' + ')
    },
    /**
     * 执行快捷键
     */
    executeShortcut(shortcut) {
      // 模拟键盘事件
      const event = new KeyboardEvent('keydown', {
        key: shortcut.key.split('+').pop(),
        ctrlKey: shortcut.key.includes('ctrl'),
        altKey: shortcut.key.includes('alt'),
        shiftKey: shortcut.key.includes('shift'),
        metaKey: shortcut.key.includes('meta')
      })
      
      document.dispatchEvent(event)
      this.closePanel()
    },
    /**
     * 关闭面板
     */
    closePanel() {
      this.HideShortcutPanel()
    },
    /**
     * 显示帮助
     */
    showHelp() {
      this.closePanel()
      this.ShowHelpDialog()
    }
  }
}
</script>

<style lang="scss" scoped>
.shortcut-panel {
  position: fixed;
  top: 60px;
  right: 20px;
  width: 280px;
  background: #FFFFFF;
  border: 1px solid #EBEEF5;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  z-index: 3000;
  
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 16px 12px 16px;
    border-bottom: 1px solid #F5F7FA;
    
    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
    
    .close-btn {
      padding: 4px;
      margin-right: -4px;
      
      &:hover {
        color: #409EFF;
      }
    }
  }
  
  .panel-content {
    padding: 12px 16px;
    max-height: 400px;
    overflow-y: auto;
    
    h5 {
      margin: 16px 0 8px 0;
      font-size: 12px;
      font-weight: 600;
      color: #909399;
      text-transform: uppercase;
      
      &:first-child {
        margin-top: 0;
      }
    }
    
    .shortcut-list {
      .shortcut-item {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        margin: 2px 0;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        
        &:hover {
          background: #F5F7FA;
        }
        
        .shortcut-key {
          flex: 0 0 auto;
          padding: 2px 8px;
          background: #F0F2F5;
          border-radius: 4px;
          font-size: 11px;
          font-family: 'Courier New', monospace;
          color: #606266;
          margin-right: 12px;
          min-width: 60px;
          text-align: center;
        }
        
        .shortcut-name {
          flex: 1;
          font-size: 13px;
          color: #606266;
          line-height: 1.4;
        }
      }
    }
  }
  
  .panel-footer {
    padding: 8px 16px 16px 16px;
    border-top: 1px solid #F5F7FA;
    
    .help-btn {
      width: 100%;
      padding: 8px;
      font-size: 12px;
      color: #909399;
      
      &:hover {
        color: #409EFF;
        background: #F5F7FA;
      }
      
      i {
        margin-right: 4px;
      }
    }
  }
}

// 动画效果
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter, .slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

// 深色主题支持
.shortcut-panel.dark-theme {
  background: #2B2F37;
  border-color: #4C4D4F;
  
  .panel-header {
    border-bottom-color: #4C4D4F;
    
    h4 {
      color: #E4E7ED;
    }
  }
  
  .panel-content {
    h5 {
      color: #C0C4CC;
    }
    
    .shortcut-item {
      &:hover {
        background: #383C43;
      }
      
      .shortcut-key {
        background: #4C4D4F;
        color: #C0C4CC;
      }
      
      .shortcut-name {
        color: #C0C4CC;
      }
    }
  }
  
  .panel-footer {
    border-top-color: #4C4D4F;
    
    .help-btn {
      color: #C0C4CC;
      
      &:hover {
        color: #409EFF;
        background: #383C43;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .shortcut-panel {
    top: 50px;
    right: 10px;
    width: 260px;
  }
}
</style>