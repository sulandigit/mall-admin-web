import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Layout组件
const Layout = () => import('@/views/layout/Layout.vue')

// 基础路由（不需要权限的路由）
export const constantRouterMap: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { hidden: true }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/404.vue'),
    meta: { hidden: true }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/home',
    meta: { title: '首页', icon: 'home' },
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/home/index.vue'),
        meta: { title: '仪表盘', icon: 'dashboard' }
      },
      {
        path: 'demo',
        name: 'TechStackDemo',
        component: () => import('@/views/demo/TechStackDemo.vue'),
        meta: { title: '技术栈演示', icon: 'guide' }
      }
    ]
  }
]

// 动态路由（需要根据权限动态添加的路由）
export const asyncRouterMap: RouteRecordRaw[] = [
  {
    path: '/pms',
    component: Layout,
    redirect: '/pms/product',
    name: 'PMS',
    meta: { title: '商品', icon: 'product' },
    children: [
      {
        path: 'product',
        name: 'Product',
        component: () => import('@/views/pms/product/index.vue'),
        meta: { title: '商品列表', icon: 'product-list' }
      },
      {
        path: 'product/add',
        name: 'AddProduct',
        component: () => import('@/views/pms/product/add.vue'),
        meta: { title: '添加商品', icon: 'product-add', hidden: true }
      },
      {
        path: 'product/update/:id',
        name: 'UpdateProduct',
        component: () => import('@/views/pms/product/update.vue'),
        meta: { title: '修改商品', hidden: true }
      },
      {
        path: 'category',
        name: 'ProductCategory',
        component: () => import('@/views/pms/productCate/index.vue'),
        meta: { title: '商品分类', icon: 'product-cate' }
      },
      {
        path: 'brand',
        name: 'Brand',
        component: () => import('@/views/pms/brand/index.vue'),
        meta: { title: '品牌管理', icon: 'product-brand' }
      }
    ]
  },
  {
    path: '/oms',
    component: Layout,
    redirect: '/oms/order',
    name: 'OMS',
    meta: { title: '订单', icon: 'order' },
    children: [
      {
        path: 'order',
        name: 'Order',
        component: () => import('@/views/oms/order/index.vue'),
        meta: { title: '订单列表', icon: 'order-list' }
      },
      {
        path: 'order/:id',
        name: 'OrderDetail',
        component: () => import('@/views/oms/order/orderDetail.vue'),
        meta: { title: '订单详情', hidden: true }
      }
    ]
  },
  {
    path: '/ums',
    component: Layout,
    redirect: '/ums/admin',
    name: 'UMS',
    meta: { title: '权限', icon: 'ums' },
    children: [
      {
        path: 'admin',
        name: 'Admin',
        component: () => import('@/views/ums/admin/index.vue'),
        meta: { title: '用户列表', icon: 'ums-admin' }
      },
      {
        path: 'role',
        name: 'Role',
        component: () => import('@/views/ums/role/index.vue'),
        meta: { title: '角色列表', icon: 'ums-role' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRouterMap,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router