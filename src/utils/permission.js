/**
 * 权限控制指令
 * 使用方法：
 * v-permission="'user:create'" - 检查单个权限
 * v-permission="['user:create', 'user:update']" - 检查多个权限（OR关系）
 * v-role="'admin'" - 检查单个角色
 * v-role="['admin', 'editor']" - 检查多个角色（OR关系）
 */

import store from '@/store'

function checkPermission(el, binding, vnode) {
  const { value } = binding
  const roles = store.getters.roles
  const permissions = store.getters.permissions

  if (value && value instanceof Array && value.length > 0) {
    const hasPermission = permissions.some(permission => {
      return value.includes(permission)
    })

    if (!hasPermission) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  } else if (typeof value === 'string' && value) {
    const hasPermission = permissions.includes(value)

    if (!hasPermission) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  } else {
    throw new Error('need permission value! Like v-permission="\'user:create\'" or v-permission="[\'user:create\', \'user:update\']"')
  }
}

function checkRole(el, binding, vnode) {
  const { value } = binding
  const roles = store.getters.roles

  if (value && value instanceof Array && value.length > 0) {
    const hasRole = roles.some(role => {
      return value.includes(role)
    })

    if (!hasRole) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  } else if (typeof value === 'string' && value) {
    const hasRole = roles.includes(value)

    if (!hasRole) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  } else {
    throw new Error('need role value! Like v-role="\'admin\'" or v-role="[\'admin\', \'editor\']"')
  }
}

// 权限指令
export const permission = {
  inserted(el, binding, vnode) {
    checkPermission(el, binding, vnode)
  },
  update(el, binding, vnode) {
    checkPermission(el, binding, vnode)
  }
}

// 角色指令
export const role = {
  inserted(el, binding, vnode) {
    checkRole(el, binding, vnode)
  },
  update(el, binding, vnode) {
    checkRole(el, binding, vnode)
  }
}

// 权限检查函数（用于编程式检查）
export function hasPermission(permission) {
  const permissions = store.getters.permissions
  
  if (permission instanceof Array) {
    return permission.some(p => permissions.includes(p))
  } else {
    return permissions.includes(permission)
  }
}

// 角色检查函数（用于编程式检查）
export function hasRole(role) {
  const roles = store.getters.roles
  
  if (role instanceof Array) {
    return role.some(r => roles.includes(r))
  } else {
    return roles.includes(role)
  }
}

// 权限检查混入
export const permissionMixin = {
  methods: {
    /**
     * 检查权限
     * @param {String|Array} permission 权限或权限数组
     * @returns {Boolean}
     */
    $hasPermission(permission) {
      return hasPermission(permission)
    },
    
    /**
     * 检查角色
     * @param {String|Array} role 角色或角色数组
     * @returns {Boolean}
     */
    $hasRole(role) {
      return hasRole(role)
    },
    
    /**
     * 检查是否有任意一个权限
     * @param {Array} permissions 权限数组
     * @returns {Boolean}
     */
    $hasAnyPermission(permissions) {
      return store.getters.hasAnyPermission(permissions)
    },
    
    /**
     * 检查是否有任意一个角色
     * @param {Array} roles 角色数组
     * @returns {Boolean}
     */
    $hasAnyRole(roles) {
      return store.getters.hasAnyRole(roles)
    }
  }
}