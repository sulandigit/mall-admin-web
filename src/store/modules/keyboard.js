/**
 * 键盘快捷键模块
 * 实现全局键盘快捷键配置和管理
 */

const keyboard = {
  state: {
    // 键盘快捷键配置
    shortcuts: {
      // 通用快捷键
      'ctrl+s': {
        name: '保存',
        category: 'common',
        description: '保存当前表单或数据',
        enabled: true,
        action: 'save'
      },
      'ctrl+n': {
        name: '新建',
        category: 'common', 
        description: '新建记录',
        enabled: true,
        action: 'create'
      },
      'ctrl+e': {
        name: '编辑',
        category: 'common',
        description: '编辑选中项',
        enabled: true,
        action: 'edit'
      },
      'delete': {
        name: '删除',
        category: 'common',
        description: '删除选中项',
        enabled: true,
        action: 'delete'
      },
      'ctrl+f': {
        name: '搜索',
        category: 'common',
        description: '打开搜索框',
        enabled: true,
        action: 'search'
      },
      'escape': {
        name: '取消',
        category: 'common',
        description: '取消当前操作或关闭对话框',
        enabled: true,
        action: 'cancel'
      },
      // 导航快捷键
      'alt+1': {
        name: '首页',
        category: 'navigation',
        description: '跳转到首页',
        enabled: true,
        action: 'navigate',
        route: '/home'
      },
      'alt+2': {
        name: '商品管理',
        category: 'navigation',
        description: '跳转到商品管理',
        enabled: true,
        action: 'navigate',
        route: '/pms/product'
      },
      'alt+3': {
        name: '订单管理',
        category: 'navigation',
        description: '跳转到订单管理',
        enabled: true,
        action: 'navigate',
        route: '/oms/order'
      },
      'alt+4': {
        name: '营销管理',
        category: 'navigation',
        description: '跳转到营销管理',
        enabled: true,
        action: 'navigate',
        route: '/sms/coupon'
      },
      'alt+5': {
        name: '权限管理',
        category: 'navigation',
        description: '跳转到权限管理',
        enabled: true,
        action: 'navigate',
        route: '/ums/admin'
      },
      // 帮助快捷键
      'f1': {
        name: '帮助',
        category: 'help',
        description: '显示快捷键帮助',
        enabled: true,
        action: 'showHelp'
      },
      'ctrl+/': {
        name: '快捷键面板',
        category: 'help',
        description: '显示/隐藏快捷键面板',
        enabled: true,
        action: 'toggleShortcutPanel'
      }
    },
    // 快捷键分类
    categories: [
      { key: 'common', name: '通用操作', icon: 'common' },
      { key: 'navigation', name: '页面导航', icon: 'navigation' },
      { key: 'help', name: '帮助信息', icon: 'help' }
    ],
    // 快捷键面板显示状态
    shortcutPanelVisible: false,
    // 帮助对话框显示状态
    helpDialogVisible: false,
    // 当前激活的快捷键
    activeShortcut: null
  },

  getters: {
    // 获取启用的快捷键
    enabledShortcuts: state => {
      const shortcuts = {};
      Object.keys(state.shortcuts).forEach(key => {
        if (state.shortcuts[key].enabled) {
          shortcuts[key] = state.shortcuts[key];
        }
      });
      return shortcuts;
    },
    // 按分类获取快捷键
    shortcutsByCategory: state => category => {
      const shortcuts = [];
      Object.keys(state.shortcuts).forEach(key => {
        const shortcut = state.shortcuts[key];
        if (shortcut.category === category && shortcut.enabled) {
          shortcuts.push({
            key,
            ...shortcut
          });
        }
      });
      return shortcuts;
    },
    // 获取所有分类的快捷键
    allShortcutsByCategory: state => {
      const result = {};
      state.categories.forEach(category => {
        result[category.key] = [];
        Object.keys(state.shortcuts).forEach(key => {
          const shortcut = state.shortcuts[key];
          if (shortcut.category === category.key && shortcut.enabled) {
            result[category.key].push({
              key,
              ...shortcut
            });
          }
        });
      });
      return result;
    }
  },

  mutations: {
    // 设置快捷键配置
    SET_SHORTCUT_CONFIG: (state, { key, config }) => {
      if (state.shortcuts[key]) {
        state.shortcuts[key] = { ...state.shortcuts[key], ...config };
      }
    },
    // 启用/禁用快捷键
    TOGGLE_SHORTCUT: (state, key) => {
      if (state.shortcuts[key]) {
        state.shortcuts[key].enabled = !state.shortcuts[key].enabled;
      }
    },
    // 显示/隐藏快捷键面板
    TOGGLE_SHORTCUT_PANEL: (state) => {
      state.shortcutPanelVisible = !state.shortcutPanelVisible;
    },
    // 设置快捷键面板显示状态
    SET_SHORTCUT_PANEL_VISIBLE: (state, visible) => {
      state.shortcutPanelVisible = visible;
    },
    // 显示/隐藏帮助对话框
    TOGGLE_HELP_DIALOG: (state) => {
      state.helpDialogVisible = !state.helpDialogVisible;
    },
    // 设置帮助对话框显示状态
    SET_HELP_DIALOG_VISIBLE: (state, visible) => {
      state.helpDialogVisible = visible;
    },
    // 设置当前激活的快捷键
    SET_ACTIVE_SHORTCUT: (state, shortcut) => {
      state.activeShortcut = shortcut;
    }
  },

  actions: {
    // 配置快捷键
    ConfigureShortcut({ commit }, { key, config }) {
      commit('SET_SHORTCUT_CONFIG', { key, config });
    },
    // 切换快捷键状态
    ToggleShortcut({ commit }, key) {
      commit('TOGGLE_SHORTCUT', key);
    },
    // 切换快捷键面板
    ToggleShortcutPanel({ commit }) {
      commit('TOGGLE_SHORTCUT_PANEL');
    },
    // 显示快捷键面板
    ShowShortcutPanel({ commit }) {
      commit('SET_SHORTCUT_PANEL_VISIBLE', true);
    },
    // 隐藏快捷键面板
    HideShortcutPanel({ commit }) {
      commit('SET_SHORTCUT_PANEL_VISIBLE', false);
    },
    // 切换帮助对话框
    ToggleHelpDialog({ commit }) {
      commit('TOGGLE_HELP_DIALOG');
    },
    // 显示帮助对话框
    ShowHelpDialog({ commit }) {
      commit('SET_HELP_DIALOG_VISIBLE', true);
    },
    // 隐藏帮助对话框
    HideHelpDialog({ commit }) {
      commit('SET_HELP_DIALOG_VISIBLE', false);
    },
    // 设置激活的快捷键
    SetActiveShortcut({ commit }, shortcut) {
      commit('SET_ACTIVE_SHORTCUT', shortcut);
    }
  }
};

export default keyboard;