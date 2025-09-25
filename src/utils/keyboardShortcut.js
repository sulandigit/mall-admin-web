/**
 * 键盘快捷键处理工具类
 * 提供快捷键绑定、解绑和事件处理功能
 */

class KeyboardShortcutHandler {
  constructor(store, router) {
    this.store = store;
    this.router = router;
    this.listeners = new Map();
    this.isListening = false;
  }

  /**
   * 开始监听键盘事件
   */
  startListening() {
    if (this.isListening) return;
    
    document.addEventListener('keydown', this.handleKeydown.bind(this));
    this.isListening = true;
  }

  /**
   * 停止监听键盘事件
   */
  stopListening() {
    if (!this.isListening) return;
    
    document.removeEventListener('keydown', this.handleKeydown.bind(this));
    this.isListening = false;
  }

  /**
   * 处理键盘按下事件
   * @param {KeyboardEvent} event - 键盘事件
   */
  handleKeydown(event) {
    // 忽略在输入框中的按键
    if (this.isInputElement(event.target)) {
      // 允许在输入框中使用 ESC 键
      if (event.key === 'Escape') {
        this.handleShortcut('escape', event);
      }
      return;
    }

    const shortcutKey = this.getShortcutKey(event);
    if (shortcutKey) {
      this.handleShortcut(shortcutKey, event);
    }
  }

  /**
   * 检查是否为输入元素
   * @param {Element} element - DOM元素
   * @returns {boolean}
   */
  isInputElement(element) {
    const inputTypes = ['INPUT', 'TEXTAREA', 'SELECT'];
    return inputTypes.includes(element.tagName) || 
           element.contentEditable === 'true' ||
           element.classList.contains('ql-editor'); // Quill编辑器
  }

  /**
   * 获取快捷键字符串
   * @param {KeyboardEvent} event - 键盘事件
   * @returns {string|null}
   */
  getShortcutKey(event) {
    const modifiers = [];
    
    if (event.ctrlKey) modifiers.push('ctrl');
    if (event.altKey) modifiers.push('alt');
    if (event.shiftKey) modifiers.push('shift');
    if (event.metaKey) modifiers.push('meta');

    let key = event.key.toLowerCase();
    
    // 特殊键映射
    const keyMap = {
      ' ': 'space',
      'arrowup': 'up',
      'arrowdown': 'down',
      'arrowleft': 'left',
      'arrowright': 'right'
    };
    
    if (keyMap[key]) {
      key = keyMap[key];
    }

    if (modifiers.length > 0) {
      return modifiers.join('+') + '+' + key;
    } else {
      // 对于功能键等特殊键，直接返回
      if (['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12', 
           'escape', 'enter', 'tab', 'delete', 'backspace'].includes(key)) {
        return key;
      }
    }
    
    return null;
  }

  /**
   * 处理快捷键
   * @param {string} shortcutKey - 快捷键字符串
   * @param {KeyboardEvent} event - 键盘事件
   */
  handleShortcut(shortcutKey, event) {
    const shortcuts = this.store.getters.enabledShortcuts;
    const shortcut = shortcuts[shortcutKey];
    
    if (!shortcut) return;

    event.preventDefault();
    event.stopPropagation();

    // 设置当前激活的快捷键
    this.store.dispatch('SetActiveShortcut', { key: shortcutKey, ...shortcut });

    // 根据动作类型执行相应操作
    switch (shortcut.action) {
      case 'save':
        this.handleSaveAction();
        break;
      case 'create':
        this.handleCreateAction();
        break;
      case 'edit':
        this.handleEditAction();
        break;
      case 'delete':
        this.handleDeleteAction();
        break;
      case 'search':
        this.handleSearchAction();
        break;
      case 'cancel':
        this.handleCancelAction();
        break;
      case 'navigate':
        this.handleNavigateAction(shortcut.route);
        break;
      case 'showHelp':
        this.handleShowHelpAction();
        break;
      case 'toggleShortcutPanel':
        this.handleToggleShortcutPanelAction();
        break;
      default:
        // 触发自定义事件
        this.triggerCustomAction(shortcutKey, shortcut);
    }
  }

  /**
   * 保存操作
   */
  handleSaveAction() {
    // 查找页面中的保存按钮并触发点击
    const saveButtons = document.querySelectorAll('button[type="submit"], .el-button--primary');
    for (let button of saveButtons) {
      if (button.textContent.includes('保存') || 
          button.textContent.includes('确定') || 
          button.textContent.includes('提交')) {
        button.click();
        break;
      }
    }
    
    // 触发自定义保存事件
    this.triggerCustomEvent('shortcut:save');
  }

  /**
   * 新建操作
   */
  handleCreateAction() {
    // 查找新增按钮
    const createButtons = document.querySelectorAll('.btn-add, .el-button');
    for (let button of createButtons) {
      if (button.textContent.includes('添加') || 
          button.textContent.includes('新增') ||
          button.textContent.includes('新建')) {
        button.click();
        break;
      }
    }
    
    this.triggerCustomEvent('shortcut:create');
  }

  /**
   * 编辑操作
   */
  handleEditAction() {
    this.triggerCustomEvent('shortcut:edit');
  }

  /**
   * 删除操作
   */
  handleDeleteAction() {
    this.triggerCustomEvent('shortcut:delete');
  }

  /**
   * 搜索操作
   */
  handleSearchAction() {
    // 查找搜索输入框并聚焦
    const searchInputs = document.querySelectorAll('input[type="text"], .el-input__inner');
    for (let input of searchInputs) {
      if (input.placeholder && (
          input.placeholder.includes('搜索') || 
          input.placeholder.includes('查询') ||
          input.placeholder.includes('筛选'))) {
        input.focus();
        break;
      }
    }
    
    this.triggerCustomEvent('shortcut:search');
  }

  /**
   * 取消操作
   */
  handleCancelAction() {
    // 查找取消按钮
    const cancelButtons = document.querySelectorAll('.el-button');
    for (let button of cancelButtons) {
      if (button.textContent.includes('取消') || 
          button.textContent.includes('关闭')) {
        button.click();
        break;
      }
    }
    
    // 关闭当前对话框
    const dialogs = document.querySelectorAll('.el-dialog__wrapper');
    if (dialogs.length > 0) {
      const closeButtons = dialogs[dialogs.length - 1].querySelectorAll('.el-dialog__close');
      if (closeButtons.length > 0) {
        closeButtons[0].click();
      }
    }
    
    this.triggerCustomEvent('shortcut:cancel');
  }

  /**
   * 导航操作
   * @param {string} route - 路由地址
   */
  handleNavigateAction(route) {
    if (route && this.router) {
      this.router.push(route);
    }
  }

  /**
   * 显示帮助
   */
  handleShowHelpAction() {
    this.store.dispatch('ShowHelpDialog');
  }

  /**
   * 切换快捷键面板
   */
  handleToggleShortcutPanelAction() {
    this.store.dispatch('ToggleShortcutPanel');
  }

  /**
   * 触发自定义动作
   * @param {string} shortcutKey - 快捷键
   * @param {Object} shortcut - 快捷键配置
   */
  triggerCustomAction(shortcutKey, shortcut) {
    this.triggerCustomEvent('shortcut:custom', { key: shortcutKey, shortcut });
  }

  /**
   * 触发自定义事件
   * @param {string} eventName - 事件名
   * @param {Object} detail - 事件详情
   */
  triggerCustomEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { 
      detail,
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(event);
  }

  /**
   * 注册快捷键监听器
   * @param {string} eventName - 事件名
   * @param {Function} handler - 处理函数
   */
  addEventListener(eventName, handler) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(handler);
    document.addEventListener(eventName, handler);
  }

  /**
   * 移除快捷键监听器
   * @param {string} eventName - 事件名
   * @param {Function} handler - 处理函数
   */
  removeEventListener(eventName, handler) {
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      const index = listeners.indexOf(handler);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
    document.removeEventListener(eventName, handler);
  }

  /**
   * 清理所有监听器
   */
  cleanup() {
    this.stopListening();
    
    this.listeners.forEach((handlers, eventName) => {
      handlers.forEach(handler => {
        document.removeEventListener(eventName, handler);
      });
    });
    
    this.listeners.clear();
  }
}

export default KeyboardShortcutHandler;