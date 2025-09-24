import {
  fetchList as getAdminList,
  createAdmin,
  updateAdmin,
  updateStatus as updateAdminStatus,
  deleteAdmin,
  getRoleByAdmin,
  allocRole
} from '@/api/login'
import {
  fetchList as getRoleList,
  fetchAllRoleList,
  createRole,
  updateRole,
  updateStatus as updateRoleStatus,
  deleteRole,
  listMenuByRole,
  listResourceByRole,
  allocMenu,
  allocResource
} from '@/api/role'
import {
  fetchList as getMenuList,
  fetchTreeList as getMenuTreeList,
  createMenu,
  updateMenu,
  getMenu,
  deleteMenu,
  updateHidden as updateMenuHidden
} from '@/api/menu'
import {
  fetchList as getResourceList,
  fetchAllResourceList,
  createResource,
  updateResource,
  deleteResource
} from '@/api/resource'

const ums = {
  namespaced: true,
  state: {
    // 管理员相关
    adminUsers: [],
    adminListLoading: false,
    adminTotal: 0,
    adminListParams: {
      pageNum: 1,
      pageSize: 10,
      keyword: ''
    },
    currentAdmin: {},
    
    // 角色相关
    roles: [],
    roleListLoading: false,
    roleTotal: 0,
    roleListParams: {
      pageNum: 1,
      pageSize: 10,
      keyword: ''
    },
    allRoles: [],
    currentRole: {},
    
    // 菜单相关
    menus: [],
    menuListLoading: false,
    menuTotal: 0,
    menuTreeList: [],
    currentMenu: {},
    
    // 资源相关
    resources: [],
    resourceListLoading: false,
    resourceTotal: 0,
    resourceListParams: {
      pageNum: 1,
      pageSize: 10,
      nameKeyword: '',
      urlKeyword: '',
      categoryId: null
    },
    allResources: [],
    currentResource: {},
    
    // 权限关联
    roleMenus: {},
    roleResources: {},
    adminRoles: {},
    
    // 状态常量
    adminStatusMap: {
      0: { text: '禁用', color: '#f56c6c' },
      1: { text: '启用', color: '#67c23a' }
    },
    roleStatusMap: {
      0: { text: '禁用', color: '#f56c6c' },
      1: { text: '启用', color: '#67c23a' }
    },
    menuHiddenMap: {
      0: { text: '显示', color: '#67c23a' },
      1: { text: '隐藏', color: '#909399' }
    },
    
    // 缓存时间戳
    lastFetchTime: {
      admins: null,
      roles: null,
      menus: null,
      resources: null
    }
  },
  
  mutations: {
    // 管理员相关mutations
    SET_ADMIN_USERS: (state, admins) => {
      state.adminUsers = admins
      state.lastFetchTime.admins = Date.now()
    },
    SET_ADMIN_LIST_LOADING: (state, loading) => {
      state.adminListLoading = loading
    },
    SET_ADMIN_TOTAL: (state, total) => {
      state.adminTotal = total
    },
    UPDATE_ADMIN_LIST_PARAMS: (state, params) => {
      state.adminListParams = { ...state.adminListParams, ...params }
    },
    SET_CURRENT_ADMIN: (state, admin) => {
      state.currentAdmin = admin
    },
    UPDATE_ADMIN_IN_LIST: (state, updatedAdmin) => {
      const index = state.adminUsers.findIndex(a => a.id === updatedAdmin.id)
      if (index !== -1) {
        state.adminUsers.splice(index, 1, updatedAdmin)
      }
    },
    REMOVE_ADMIN_FROM_LIST: (state, adminId) => {
      const index = state.adminUsers.findIndex(a => a.id === adminId)
      if (index !== -1) {
        state.adminUsers.splice(index, 1)
        state.adminTotal = Math.max(0, state.adminTotal - 1)
      }
    },
    SET_ADMIN_ROLES: (state, { adminId, roles }) => {
      state.adminRoles = { ...state.adminRoles, [adminId]: roles }
    },
    
    // 角色相关mutations
    SET_ROLES: (state, roles) => {
      state.roles = roles
      state.lastFetchTime.roles = Date.now()
    },
    SET_ALL_ROLES: (state, roles) => {
      state.allRoles = roles
    },
    SET_ROLE_LIST_LOADING: (state, loading) => {
      state.roleListLoading = loading
    },
    SET_ROLE_TOTAL: (state, total) => {
      state.roleTotal = total
    },
    UPDATE_ROLE_LIST_PARAMS: (state, params) => {
      state.roleListParams = { ...state.roleListParams, ...params }
    },
    SET_CURRENT_ROLE: (state, role) => {
      state.currentRole = role
    },
    SET_ROLE_MENUS: (state, { roleId, menus }) => {
      state.roleMenus = { ...state.roleMenus, [roleId]: menus }
    },
    SET_ROLE_RESOURCES: (state, { roleId, resources }) => {
      state.roleResources = { ...state.roleResources, [roleId]: resources }
    },
    
    // 菜单相关mutations
    SET_MENUS: (state, menus) => {
      state.menus = menus
      state.lastFetchTime.menus = Date.now()
    },
    SET_MENU_TREE_LIST: (state, menuTree) => {
      state.menuTreeList = menuTree
    },
    SET_MENU_LIST_LOADING: (state, loading) => {
      state.menuListLoading = loading
    },
    SET_MENU_TOTAL: (state, total) => {
      state.menuTotal = total
    },
    SET_CURRENT_MENU: (state, menu) => {
      state.currentMenu = menu
    },
    
    // 资源相关mutations
    SET_RESOURCES: (state, resources) => {
      state.resources = resources
      state.lastFetchTime.resources = Date.now()
    },
    SET_ALL_RESOURCES: (state, resources) => {
      state.allResources = resources
    },
    SET_RESOURCE_LIST_LOADING: (state, loading) => {
      state.resourceListLoading = loading
    },
    SET_RESOURCE_TOTAL: (state, total) => {
      state.resourceTotal = total
    },
    UPDATE_RESOURCE_LIST_PARAMS: (state, params) => {
      state.resourceListParams = { ...state.resourceListParams, ...params }
    },
    SET_CURRENT_RESOURCE: (state, resource) => {
      state.currentResource = resource
    },
    
    // 清理缓存
    CLEAR_CACHE: (state, type) => {
      if (type === 'all' || type === 'admins') {
        state.adminUsers = []
        state.lastFetchTime.admins = null
      }
      if (type === 'all' || type === 'roles') {
        state.roles = []
        state.allRoles = []
        state.lastFetchTime.roles = null
      }
      if (type === 'all' || type === 'menus') {
        state.menus = []
        state.menuTreeList = []
        state.lastFetchTime.menus = null
      }
      if (type === 'all' || type === 'resources') {
        state.resources = []
        state.allResources = []
        state.lastFetchTime.resources = null
      }
    }
  },
  
  actions: {
    // 获取管理员列表
    async fetchAdminList({ commit, state }, params = {}) {
      commit('SET_ADMIN_LIST_LOADING', true)
      try {
        const searchParams = { ...state.adminListParams, ...params }
        commit('UPDATE_ADMIN_LIST_PARAMS', params)
        
        const response = await getAdminList(searchParams)
        if (response.code === 200) {
          commit('SET_ADMIN_USERS', response.data.list || [])
          commit('SET_ADMIN_TOTAL', response.data.total || 0)
          return response.data
        }
        throw new Error(response.message || '获取管理员列表失败')
      } catch (error) {
        console.error('获取管理员列表失败:', error)
        throw error
      } finally {
        commit('SET_ADMIN_LIST_LOADING', false)
      }
    },
    
    // 创建管理员
    async createAdmin({ dispatch }, adminData) {
      try {
        const response = await createAdmin(adminData)
        if (response.code === 200) {
          await dispatch('fetchAdminList')
          return response.data
        }
        throw new Error(response.message || '创建管理员失败')
      } catch (error) {
        console.error('创建管理员失败:', error)
        throw error
      }
    },
    
    // 获取角色列表
    async fetchRoleList({ commit, state }, params = {}) {
      commit('SET_ROLE_LIST_LOADING', true)
      try {
        const searchParams = { ...state.roleListParams, ...params }
        commit('UPDATE_ROLE_LIST_PARAMS', params)
        
        const response = await getRoleList(searchParams)
        if (response.code === 200) {
          commit('SET_ROLES', response.data.list || [])
          commit('SET_ROLE_TOTAL', response.data.total || 0)
          return response.data
        }
        throw new Error(response.message || '获取角色列表失败')
      } catch (error) {
        console.error('获取角色列表失败:', error)
        throw error
      } finally {
        commit('SET_ROLE_LIST_LOADING', false)
      }
    },
    
    // 获取所有角色
    async fetchAllRoles({ commit, state }, forceRefresh = false) {
      const now = Date.now()
      const lastFetch = state.lastFetchTime.roles
      const cacheExpiry = 5 * 60 * 1000
      
      if (!forceRefresh && lastFetch && (now - lastFetch < cacheExpiry) && state.allRoles.length > 0) {
        return state.allRoles
      }
      
      try {
        const response = await fetchAllRoleList()
        if (response.code === 200) {
          commit('SET_ALL_ROLES', response.data || [])
          return response.data
        }
        throw new Error(response.message || '获取所有角色失败')
      } catch (error) {
        console.error('获取所有角色失败:', error)
        throw error
      }
    },
    
    // 获取菜单树结构
    async fetchMenuTreeList({ commit, state }, forceRefresh = false) {
      const now = Date.now()
      const lastFetch = state.lastFetchTime.menus
      const cacheExpiry = 5 * 60 * 1000
      
      if (!forceRefresh && lastFetch && (now - lastFetch < cacheExpiry) && state.menuTreeList.length > 0) {
        return state.menuTreeList
      }
      
      try {
        const response = await getMenuTreeList()
        if (response.code === 200) {
          commit('SET_MENU_TREE_LIST', response.data || [])
          return response.data
        }
        throw new Error(response.message || '获取菜单树失败')
      } catch (error) {
        console.error('获取菜单树失败:', error)
        throw error
      }
    },
    
    // 获取资源列表
    async fetchResourceList({ commit, state }, params = {}) {
      commit('SET_RESOURCE_LIST_LOADING', true)
      try {
        const searchParams = { ...state.resourceListParams, ...params }
        commit('UPDATE_RESOURCE_LIST_PARAMS', params)
        
        const response = await getResourceList(searchParams)
        if (response.code === 200) {
          commit('SET_RESOURCES', response.data.list || [])
          commit('SET_RESOURCE_TOTAL', response.data.total || 0)
          return response.data
        }
        throw new Error(response.message || '获取资源列表失败')
      } catch (error) {
        console.error('获取资源列表失败:', error)
        throw error
      } finally {
        commit('SET_RESOURCE_LIST_LOADING', false)
      }
    },
    
    // 清理缓存
    clearCache({ commit }, type = 'all') {
      commit('CLEAR_CACHE', type)
    }
  },
  
  getters: {
    // 管理员相关getters
    adminUsers: state => state.adminUsers,
    adminListLoading: state => state.adminListLoading,
    adminTotal: state => state.adminTotal,
    adminListParams: state => state.adminListParams,
    currentAdmin: state => state.currentAdmin,
    
    // 角色相关getters
    roles: state => state.roles,
    roleListLoading: state => state.roleListLoading,
    roleTotal: state => state.roleTotal,
    roleListParams: state => state.roleListParams,
    allRoles: state => state.allRoles,
    currentRole: state => state.currentRole,
    roleOptions: state => state.allRoles.map(role => ({
      label: role.name,
      value: role.id
    })),
    
    // 菜单相关getters
    menus: state => state.menus,
    menuListLoading: state => state.menuListLoading,
    menuTotal: state => state.menuTotal,
    menuTreeList: state => state.menuTreeList,
    currentMenu: state => state.currentMenu,
    
    // 资源相关getters
    resources: state => state.resources,
    resourceListLoading: state => state.resourceListLoading,
    resourceTotal: state => state.resourceTotal,
    resourceListParams: state => state.resourceListParams,
    allResources: state => state.allResources,
    currentResource: state => state.currentResource,
    
    // 权限关联getters
    roleMenus: state => state.roleMenus,
    roleResources: state => state.roleResources,
    adminRoles: state => state.adminRoles,
    
    // 状态映射getters
    adminStatusMap: state => state.adminStatusMap,
    roleStatusMap: state => state.roleStatusMap,
    menuHiddenMap: state => state.menuHiddenMap,
    
    // 根据ID获取管理员
    getAdminById: (state) => (id) => {
      return state.adminUsers.find(admin => admin.id === id)
    },
    
    // 根据ID获取角色
    getRoleById: (state) => (id) => {
      return state.roles.find(role => role.id === id)
    },
    
    // 根据ID获取菜单
    getMenuById: (state) => (id) => {
      return state.menus.find(menu => menu.id === id)
    },
    
    // 根据ID获取资源
    getResourceById: (state) => (id) => {
      return state.resources.find(resource => resource.id === id)
    },
    
    // 根据状态过滤管理员
    adminsByStatus: (state) => (status) => {
      if (status === null || status === undefined) return state.adminUsers
      return state.adminUsers.filter(admin => admin.status === status)
    },
    
    // 根据状态过滤角色
    rolesByStatus: (state) => (status) => {
      if (status === null || status === undefined) return state.roles
      return state.roles.filter(role => role.status === status)
    },
    
    // 缓存状态
    cacheStatus: state => ({
      admins: {
        hasCache: state.adminUsers.length > 0,
        lastFetch: state.lastFetchTime.admins,
        age: state.lastFetchTime.admins ? Date.now() - state.lastFetchTime.admins : null
      },
      roles: {
        hasCache: state.roles.length > 0,
        lastFetch: state.lastFetchTime.roles,
        age: state.lastFetchTime.roles ? Date.now() - state.lastFetchTime.roles : null
      },
      menus: {
        hasCache: state.menus.length > 0,
        lastFetch: state.lastFetchTime.menus,
        age: state.lastFetchTime.menus ? Date.now() - state.lastFetchTime.menus : null
      },
      resources: {
        hasCache: state.resources.length > 0,
        lastFetch: state.lastFetchTime.resources,
        age: state.lastFetchTime.resources ? Date.now() - state.lastFetchTime.resources : null
      }
    })
  }
}

export default ums