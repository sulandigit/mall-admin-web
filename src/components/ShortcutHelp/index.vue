<template>
  <el-dialog
    title="键盘快捷键帮助"
    :visible.sync="visible"
    width="800px"
    :close-on-click-modal="false"
    class="shortcut-help-dialog">
    
    <div class="help-content">
      <div class="help-tabs">
        <el-tabs v-model="activeTab" tab-position="left">
          <el-tab-pane 
            v-for="category in categories" 
            :key="category.key"
            :label="category.name" 
            :name="category.key">
            
            <div class="category-content">
              <div class="category-header">
                <h3>{{ category.name }}</h3>
                <p class="category-description">{{ getCategoryDescription(category.key) }}</p>
              </div>
              
              <div class="shortcuts-list">
                <div 
                  v-for="shortcut in getShortcutsByCategory(category.key)" 
                  :key="shortcut.key"
                  class="shortcut-item">
                  <div class="shortcut-keys">
                    <span 
                      v-for="(key, index) in shortcut.key.split('+')" 
                      :key="index"
                      class="key-badge">
                      {{ formatKey(key) }}
                    </span>
                  </div>
                  <div class="shortcut-info">
                    <div class="shortcut-name">{{ shortcut.name }}</div>
                    <div class="shortcut-description">{{ shortcut.description }}</div>
                  </div>
                  <div class="shortcut-status">
                    <el-switch
                      v-model="shortcut.enabled"
                      @change="toggleShortcut(shortcut.key)"
                      size="mini">
                    </el-switch>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="resetToDefaults">恢复默认</el-button>
      <el-button type="primary" @click="closeDialog">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'ShortcutHelpDialog',
  data() {
    return {
      activeTab: 'common'
    }
  },
  computed: {
    ...mapGetters([
      'helpDialogVisible',
      'shortcuts'
    ]),
    visible: {
      get() {
        return this.helpDialogVisible
      },
      set(value) {
        if (!value) {
          this.HideHelpDialog()
        }
      }
    },
    categories() {
      return this.$store.state.keyboard.categories
    }
  },
  methods: {
    ...mapActions([
      'HideHelpDialog',
      'ToggleShortcut'
    ]),
    /**
     * 获取分类描述
     */
    getCategoryDescription(category) {
      const descriptions = {
        'common': '常用操作快捷键，帮助您快速完成日常任务',
        'navigation': '页面导航快捷键，快速跳转到不同功能模块',
        'help': '帮助相关快捷键，获取系统帮助和快捷键信息'
      }
      return descriptions[category] || ''
    },
    /**
     * 按分类获取快捷键
     */
    getShortcutsByCategory(category) {
      return this.$store.getters.shortcutsByCategory(category)
    },
    /**
     * 格式化按键显示
     */
    formatKey(key) {
      const keyMap = {
        'ctrl': 'Ctrl',
        'alt': 'Alt', 
        'shift': 'Shift',
        'meta': 'Meta',
        'delete': 'Delete',
        'escape': 'Esc',
        'enter': 'Enter',
        'tab': 'Tab',
        'space': 'Space',
        'f1': 'F1',
        'f2': 'F2',
        'f3': 'F3',
        'f4': 'F4',
        'f5': 'F5',
        'f6': 'F6',
        'f7': 'F7',
        'f8': 'F8',
        'f9': 'F9',
        'f10': 'F10',
        'f11': 'F11',
        'f12': 'F12'
      }
      return keyMap[key.toLowerCase()] || key.toUpperCase()
    },
    /**
     * 切换快捷键状态
     */
    toggleShortcut(key) {
      this.ToggleShortcut(key)
    },
    /**
     * 恢复默认设置
     */
    resetToDefaults() {
      this.$confirm('确定要恢复所有快捷键到默认设置吗？', '确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 启用所有快捷键
        Object.keys(this.shortcuts).forEach(key => {
          if (!this.shortcuts[key].enabled) {
            this.ToggleShortcut(key)
          }
        })
        this.$message.success('已恢复默认设置')
      }).catch(() => {
        // 用户取消
      })
    },
    /**
     * 关闭对话框
     */
    closeDialog() {
      this.HideHelpDialog()
    }
  }
}
</script>

<style lang="scss" scoped>
.shortcut-help-dialog {
  .help-content {
    min-height: 400px;
    
    .help-tabs {
      ::v-deep .el-tabs__content {
        padding: 20px 0;
      }
    }
    
    .category-content {
      .category-header {
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #EBEEF5;
        
        h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          color: #303133;
        }
        
        .category-description {
          margin: 0;
          font-size: 14px;
          color: #606266;
          line-height: 1.5;
        }
      }
      
      .shortcuts-list {
        .shortcut-item {
          display: flex;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #F5F7FA;
          
          &:last-child {
            border-bottom: none;
          }
          
          .shortcut-keys {
            flex: 0 0 200px;
            display: flex;
            align-items: center;
            gap: 4px;
            
            .key-badge {
              display: inline-block;
              padding: 4px 8px;
              background: #F5F7FA;
              border: 1px solid #DCDFE6;
              border-radius: 4px;
              font-size: 12px;
              font-family: 'Courier New', monospace;
              color: #606266;
              min-width: 20px;
              text-align: center;
            }
          }
          
          .shortcut-info {
            flex: 1;
            margin: 0 16px;
            
            .shortcut-name {
              font-size: 14px;
              font-weight: 500;
              color: #303133;
              margin-bottom: 4px;
            }
            
            .shortcut-description {
              font-size: 12px;
              color: #909399;
              line-height: 1.4;
            }
          }
          
          .shortcut-status {
            flex: 0 0 auto;
          }
        }
      }
    }
  }
  
  .dialog-footer {
    text-align: right;
    
    .el-button {
      margin-left: 10px;
    }
  }
}

// 深色主题支持
.shortcut-help-dialog.dark-theme {
  .category-header {
    border-bottom-color: #4C4D4F;
    
    h3 {
      color: #E4E7ED;
    }
    
    .category-description {
      color: #C0C4CC;
    }
  }
  
  .shortcut-item {
    border-bottom-color: #4C4D4F;
    
    .key-badge {
      background: #4C4D4F;
      border-color: #606266;
      color: #C0C4CC;
    }
    
    .shortcut-name {
      color: #E4E7ED;
    }
    
    .shortcut-description {
      color: #909399;
    }
  }
}
</style>