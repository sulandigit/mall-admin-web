const ui = {
  namespaced: true,
  state: {
    breadcrumb: [],
    tabs: [],
    activeTab: '',
    fullscreen: false,
    collapsed: false,
    fixedHeader: true,
    showTagsView: true,
    showSidebar: true,
    showSettings: false,
    sidebarWidth: '210px',
    miniSidebarWidth: '64px'
  },
  
  mutations: {
    SET_BREADCRUMB: (state, breadcrumb) => {
      state.breadcrumb = breadcrumb
    },
    ADD_TAB: (state, tab) => {
      const exists = state.tabs.find(t => t.path === tab.path)
      if (!exists) {
        state.tabs.push({
          name: tab.name,
          path: tab.path,
          title: tab.title || tab.name,
          closable: tab.closable !== false
        })
      }
    },
    REMOVE_TAB: (state, targetPath) => {
      const index = state.tabs.findIndex(tab => tab.path === targetPath)
      if (index > -1) {
        state.tabs.splice(index, 1)
      }
      // 如果删除的是当前活动tab，需要切换到其他tab
      if (state.activeTab === targetPath && state.tabs.length > 0) {
        state.activeTab = state.tabs[Math.max(0, index - 1)].path
      }
    },
    CLEAR_TABS: (state) => {
      state.tabs = []
      state.activeTab = ''
    },
    SET_ACTIVE_TAB: (state, path) => {
      state.activeTab = path
    },
    TOGGLE_FULLSCREEN: (state) => {
      state.fullscreen = !state.fullscreen
    },
    SET_FULLSCREEN: (state, fullscreen) => {
      state.fullscreen = fullscreen
    },
    TOGGLE_COLLAPSED: (state) => {
      state.collapsed = !state.collapsed
    },
    SET_COLLAPSED: (state, collapsed) => {
      state.collapsed = collapsed
    },
    SET_FIXED_HEADER: (state, fixed) => {
      state.fixedHeader = fixed
      localStorage.setItem('fixedHeader', JSON.stringify(fixed))
    },
    SET_SHOW_TAGS_VIEW: (state, show) => {
      state.showTagsView = show
      localStorage.setItem('showTagsView', JSON.stringify(show))
    },
    SET_SHOW_SIDEBAR: (state, show) => {
      state.showSidebar = show
    },
    SET_SHOW_SETTINGS: (state, show) => {
      state.showSettings = show
    },
    INIT_UI_SETTINGS: (state) => {
      // 从localStorage恢复UI设置
      const fixedHeader = localStorage.getItem('fixedHeader')
      const showTagsView = localStorage.getItem('showTagsView')
      
      if (fixedHeader !== null) {
        state.fixedHeader = JSON.parse(fixedHeader)
      }
      if (showTagsView !== null) {
        state.showTagsView = JSON.parse(showTagsView)
      }
    }
  },
  
  actions: {
    setBreadcrumb({ commit }, breadcrumb) {
      commit('SET_BREADCRUMB', breadcrumb)
    },
    
    addTab({ commit }, tab) {
      commit('ADD_TAB', tab)
      commit('SET_ACTIVE_TAB', tab.path)
    },
    
    removeTab({ commit, state }, targetPath) {
      commit('REMOVE_TAB', targetPath)
    },
    
    removeOtherTabs({ commit, state }, currentPath) {
      const currentTab = state.tabs.find(tab => tab.path === currentPath)
      if (currentTab) {
        commit('CLEAR_TABS')
        commit('ADD_TAB', currentTab)
        commit('SET_ACTIVE_TAB', currentPath)
      }
    },
    
    removeAllTabs({ commit }) {
      commit('CLEAR_TABS')
    },
    
    setActiveTab({ commit }, path) {
      commit('SET_ACTIVE_TAB', path)
    },
    
    toggleFullscreen({ commit }) {
      commit('TOGGLE_FULLSCREEN')
    },
    
    setFullscreen({ commit }, fullscreen) {
      commit('SET_FULLSCREEN', fullscreen)
    },
    
    toggleCollapsed({ commit }) {
      commit('TOGGLE_COLLAPSED')
    },
    
    setCollapsed({ commit }, collapsed) {
      commit('SET_COLLAPSED', collapsed)
    },
    
    updateSettings({ commit }, settings) {
      if (settings.fixedHeader !== undefined) {
        commit('SET_FIXED_HEADER', settings.fixedHeader)
      }
      if (settings.showTagsView !== undefined) {
        commit('SET_SHOW_TAGS_VIEW', settings.showTagsView)
      }
      if (settings.showSidebar !== undefined) {
        commit('SET_SHOW_SIDEBAR', settings.showSidebar)
      }
    },
    
    toggleSettings({ commit }) {
      commit('SET_SHOW_SETTINGS', true)
    },
    
    hideSettings({ commit }) {
      commit('SET_SHOW_SETTINGS', false)
    },
    
    initUiSettings({ commit }) {
      commit('INIT_UI_SETTINGS')
    }
  },
  
  getters: {
    breadcrumb: state => state.breadcrumb,
    tabs: state => state.tabs,
    activeTab: state => state.activeTab,
    fullscreen: state => state.fullscreen,
    collapsed: state => state.collapsed,
    fixedHeader: state => state.fixedHeader,
    showTagsView: state => state.showTagsView,
    showSidebar: state => state.showSidebar,
    showSettings: state => state.showSettings,
    sidebarWidth: state => state.collapsed ? state.miniSidebarWidth : state.sidebarWidth,
    
    // 获取当前活动的标签页
    currentTab: state => {
      return state.tabs.find(tab => tab.path === state.activeTab)
    },
    
    // 检查是否有可关闭的标签页
    hasClosableTabs: state => {
      return state.tabs.some(tab => tab.closable)
    },
    
    // 获取标签页数量
    tabsCount: state => state.tabs.length,
    
    // 检查指定路径的标签页是否存在
    hasTab: (state) => (path) => {
      return state.tabs.some(tab => tab.path === path)
    }
  }
}

export default ui