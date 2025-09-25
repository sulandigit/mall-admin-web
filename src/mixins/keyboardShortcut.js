/**
 * 键盘快捷键混入
 * 为组件提供快捷键功能支持
 */

import KeyboardShortcutHandler from '@/utils/keyboardShortcut'

export default {
  data() {
    return {
      shortcutHandler: null
    }
  },
  
  created() {
    // 初始化快捷键处理器
    this.shortcutHandler = new KeyboardShortcutHandler(this.$store, this.$router)
  },
  
  mounted() {
    // 开始监听快捷键
    this.shortcutHandler.startListening()
    
    // 注册组件级别的快捷键事件监听器
    this.registerShortcutListeners()
  },
  
  beforeDestroy() {
    // 清理快捷键监听器
    if (this.shortcutHandler) {
      this.shortcutHandler.cleanup()
    }
    
    // 移除组件级别的事件监听器
    this.removeShortcutListeners()
  },
  
  methods: {
    /**
     * 注册快捷键事件监听器
     */
    registerShortcutListeners() {
      // 保存操作
      this.shortcutHandler.addEventListener('shortcut:save', this.handleShortcutSave)
      
      // 新建操作
      this.shortcutHandler.addEventListener('shortcut:create', this.handleShortcutCreate)
      
      // 编辑操作
      this.shortcutHandler.addEventListener('shortcut:edit', this.handleShortcutEdit)
      
      // 删除操作
      this.shortcutHandler.addEventListener('shortcut:delete', this.handleShortcutDelete)
      
      // 搜索操作
      this.shortcutHandler.addEventListener('shortcut:search', this.handleShortcutSearch)
      
      // 取消操作
      this.shortcutHandler.addEventListener('shortcut:cancel', this.handleShortcutCancel)
      
      // 自定义操作
      this.shortcutHandler.addEventListener('shortcut:custom', this.handleShortcutCustom)
    },
    
    /**
     * 移除快捷键事件监听器
     */
    removeShortcutListeners() {
      if (this.shortcutHandler) {
        this.shortcutHandler.removeEventListener('shortcut:save', this.handleShortcutSave)
        this.shortcutHandler.removeEventListener('shortcut:create', this.handleShortcutCreate)
        this.shortcutHandler.removeEventListener('shortcut:edit', this.handleShortcutEdit)
        this.shortcutHandler.removeEventListener('shortcut:delete', this.handleShortcutDelete)
        this.shortcutHandler.removeEventListener('shortcut:search', this.handleShortcutSearch)
        this.shortcutHandler.removeEventListener('shortcut:cancel', this.handleShortcutCancel)
        this.shortcutHandler.removeEventListener('shortcut:custom', this.handleShortcutCustom)
      }
    },
    
    /**
     * 处理保存快捷键
     * 子组件可以重写此方法来自定义保存逻辑
     */
    handleShortcutSave(event) {
      if (typeof this.onShortcutSave === 'function') {
        this.onShortcutSave(event)
      } else if (typeof this.handleSave === 'function') {
        this.handleSave()
      } else if (typeof this.save === 'function') {
        this.save()
      }
    },
    
    /**
     * 处理新建快捷键
     */
    handleShortcutCreate(event) {
      if (typeof this.onShortcutCreate === 'function') {
        this.onShortcutCreate(event)
      } else if (typeof this.handleCreate === 'function') {
        this.handleCreate()
      } else if (typeof this.create === 'function') {
        this.create()
      } else if (typeof this.handleAdd === 'function') {
        this.handleAdd()
      }
    },
    
    /**
     * 处理编辑快捷键
     */
    handleShortcutEdit(event) {
      if (typeof this.onShortcutEdit === 'function') {
        this.onShortcutEdit(event)
      } else if (typeof this.handleEdit === 'function') {
        this.handleEdit()
      } else if (typeof this.edit === 'function') {
        this.edit()
      }
    },
    
    /**
     * 处理删除快捷键
     */
    handleShortcutDelete(event) {
      if (typeof this.onShortcutDelete === 'function') {
        this.onShortcutDelete(event)
      } else if (typeof this.handleDelete === 'function') {
        // 如果有选中的项目，删除选中项
        if (this.multipleSelection && this.multipleSelection.length > 0) {
          this.handleDelete()
        } else if (this.selectedRows && this.selectedRows.length > 0) {
          this.handleDelete()
        }
      } else if (typeof this.delete === 'function') {
        this.delete()
      }
    },
    
    /**
     * 处理搜索快捷键
     */
    handleShortcutSearch(event) {
      if (typeof this.onShortcutSearch === 'function') {
        this.onShortcutSearch(event)
      } else if (typeof this.handleSearch === 'function') {
        this.handleSearch()
      } else if (typeof this.search === 'function') {
        this.search()
      } else if (typeof this.getList === 'function') {
        this.getList()
      }
    },
    
    /**
     * 处理取消快捷键
     */
    handleShortcutCancel(event) {
      if (typeof this.onShortcutCancel === 'function') {
        this.onShortcutCancel(event)
      } else if (typeof this.handleCancel === 'function') {
        this.handleCancel()
      } else if (typeof this.cancel === 'function') {
        this.cancel()
      } else {
        // 默认取消逻辑：关闭对话框等
        if (this.dialogVisible !== undefined) {
          this.dialogVisible = false
        }
        if (this.visible !== undefined) {
          this.visible = false
        }
      }
    },
    
    /**
     * 处理自定义快捷键
     */
    handleShortcutCustom(event) {
      if (typeof this.onShortcutCustom === 'function') {
        this.onShortcutCustom(event)
      }
    },
    
    /**
     * 动态注册页面特定的快捷键
     * @param {string} key - 快捷键
     * @param {Object} config - 快捷键配置
     */
    registerPageShortcut(key, config) {
      this.$store.dispatch('ConfigureShortcut', { key, config })
    },
    
    /**
     * 启用快捷键
     * @param {string} key - 快捷键
     */
    enableShortcut(key) {
      const shortcut = this.$store.getters.shortcuts[key]
      if (shortcut && !shortcut.enabled) {
        this.$store.dispatch('ToggleShortcut', key)
      }
    },
    
    /**
     * 禁用快捷键
     * @param {string} key - 快捷键
     */
    disableShortcut(key) {
      const shortcut = this.$store.getters.shortcuts[key]
      if (shortcut && shortcut.enabled) {
        this.$store.dispatch('ToggleShortcut', key)
      }
    },
    
    /**
     * 检查快捷键是否启用
     * @param {string} key - 快捷键
     * @returns {boolean}
     */
    isShortcutEnabled(key) {
      const shortcut = this.$store.getters.shortcuts[key]
      return shortcut ? shortcut.enabled : false
    },
    
    /**
     * 显示快捷键提示
     * @param {string} message - 提示消息
     */
    showShortcutTip(message) {
      this.$message({
        message: message || '快捷键已触发',
        type: 'info',
        duration: 1500,
        showClose: false
      })
    }
  }
}