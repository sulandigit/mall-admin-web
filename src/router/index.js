import Vue from 'vue'
import Router from 'vue-router'
import { lazyLoad, preloadRoutes } from '@/utils/routeHelper'

Vue.use(Router)

/* Layout - 懒加载 */
const Layout = lazyLoad('layout/Layout')

/**
 * 路由懒加载帮助函数
 * @param {string} path 组件路径
 * @param {string} chunkName chunk名称，用于代码分割
 * @returns {Function} 懒加载函数
 */
const lazyLoad = (path, chunkName) => {
  return () => {
    console.log(`开始加载路由组件: ${path}`)
    
    return import(
      /* webpackChunkName: "[request]" */
      `@/views/${path}`
    ).then(module => {
      console.log(`路由组件加载成功: ${path}`)
      return module
    }).catch(error => {
      console.error(`路由组件加载失败: ${path}`, error)
      
      // 尝试重新加载
      if (!error.__retryCount) {
        error.__retryCount = 1
        console.log(`正在重试加载: ${path}`)
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(import(`@/views/${path}`))
          }, 1000)
        })
      }
      
      // 重试失败后返回错误组件
      return import('@/views/error/RouteError').catch(() => {
        // 如果错误组件也加载失败，返回一个默认的错误组件
        return {
          default: {
            name: 'RouteError',
            template: '<div style="text-align: center; padding: 50px;"><h2>页面加载失败</h2><p>请刷新页面重试</p></div>'
          }
        }
      })
    })
  }
}

/**
 * 路由预加载功能
 * @param {Array} routes 需要预加载的路由路径
 */
const preloadRoutes = (routes) => {
  if ('requestIdleCallback' in window) {
    // 在浏览器空闲时间预加载
    window.requestIdleCallback(() => {
      routes.forEach(route => {
        import(`@/views/${route}`).catch(error => {
          console.warn(`预加载失败: ${route}`, error)
        })
      })
    })
  } else {
    // 降级方案：使用setTimeout
    setTimeout(() => {
      routes.forEach(route => {
        import(`@/views/${route}`).catch(error => {
          console.warn(`预加载失败: ${route}`, error)
        })
      })
    }, 2000)
  }
}

/**
 * hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
 *                                if not set alwaysShow, only more than one route under the children
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
  }
 **/
export const constantRouterMap = [
  {path: '/login', component: lazyLoad('login/index'), hidden: true},
  {path: '/404', component: lazyLoad('404'), hidden: true},
  {
    path: '',
    component: Layout,
    redirect: '/home',
    meta: {title: '首页', icon: 'home'},
    children: [{
      path: 'home',
      name: 'home',
      component: lazyLoad('home/index'),
      meta: {title: '仪表盘', icon: 'dashboard'}
    },
    {
      name: 'document',
      path: 'https://www.macrozheng.com',
      meta: {title: '学习教程', icon: 'document'}
    },
    {
      name: 'video',
      path: 'https://www.macrozheng.com/mall/foreword/mall_video.html',
      meta: {title: '视频教程', icon: 'video'}
    },
    ]
  }
]

export const asyncRouterMap = [
  {
    path: '/pms',
    component: Layout,
    redirect: '/pms/product',
    name: 'pms',
    meta: {title: '商品', icon: 'product'},
    children: [{
      path: 'product',
      name: 'product',
      component: lazyLoad('pms/product/index'),
      meta: {title: '商品列表', icon: 'product-list'}
    },
      {
        path: 'addProduct',
        name: 'addProduct',
        component: lazyLoad('pms/product/add'),
        meta: {title: '添加商品', icon: 'product-add'}
      },
      {
        path: 'updateProduct',
        name: 'updateProduct',
        component: lazyLoad('pms/product/update'),
        meta: {title: '修改商品', icon: 'product-add'},
        hidden: true
      },
      {
        path: 'productCate',
        name: 'productCate',
        component: lazyLoad('pms/productCate/index'),
        meta: {title: '商品分类', icon: 'product-cate'}
      },
      {
        path: 'addProductCate',
        name: 'addProductCate',
        component: lazyLoad('pms/productCate/add'),
        meta: {title: '添加商品分类'},
        hidden: true
      },
      {
        path: 'updateProductCate',
        name: 'updateProductCate',
        component: lazyLoad('pms/productCate/update'),
        meta: {title: '修改商品分类'},
        hidden: true
      },
      {
        path: 'productAttr',
        name: 'productAttr',
        component: lazyLoad('pms/productAttr/index'),
        meta: {title: '商品类型', icon: 'product-attr'}
      },
      {
        path: 'productAttrList',
        name: 'productAttrList',
        component: lazyLoad('pms/productAttr/productAttrList'),
        meta: {title: '商品属性列表'},
        hidden: true
      },
      {
        path: 'addProductAttr',
        name: 'addProductAttr',
        component: lazyLoad('pms/productAttr/addProductAttr'),
        meta: {title: '添加商品属性'},
        hidden: true
      },
      {
        path: 'updateProductAttr',
        name: 'updateProductAttr',
        component: lazyLoad('pms/productAttr/updateProductAttr'),
        meta: {title: '修改商品属性'},
        hidden: true
      },
      {
        path: 'brand',
        name: 'brand',
        component: lazyLoad('pms/brand/index'),
        meta: {title: '品牌管理', icon: 'product-brand'}
      },
      {
        path: 'addBrand',
        name: 'addBrand',
        component: lazyLoad('pms/brand/add'),
        meta: {title: '添加品牌'},
        hidden: true
      },
      {
        path: 'updateBrand',
        name: 'updateBrand',
        component: lazyLoad('pms/brand/update'),
        meta: {title: '编辑品牌'},
        hidden: true
      }
    ]
  },
  {
    path: '/oms',
    component: Layout,
    redirect: '/oms/order',
    name: 'oms',
    meta: {title: '订单', icon: 'order'},
    children: [
      {
        path: 'order',
        name: 'order',
        component: lazyLoad('oms/order/index'),
        meta: {title: '订单列表', icon: 'product-list'}
      },
      {
        path: 'orderDetail',
        name: 'orderDetail',
        component: lazyLoad('oms/order/orderDetail'),
        meta: {title: '订单详情'},
        hidden:true
      },
      {
        path: 'deliverOrderList',
        name: 'deliverOrderList',
        component: lazyLoad('oms/order/deliverOrderList'),
        meta: {title: '发货列表'},
        hidden:true
      },
      {
        path: 'orderSetting',
        name: 'orderSetting',
        component: lazyLoad('oms/order/setting'),
        meta: {title: '订单设置', icon: 'order-setting'}
      },
      {
        path: 'returnApply',
        name: 'returnApply',
        component: lazyLoad('oms/apply/index'),
        meta: {title: '退货申请处理', icon: 'order-return'}
      },
      {
        path: 'returnReason',
        name: 'returnReason',
        component: lazyLoad('oms/apply/reason'),
        meta: {title: '退货原因设置', icon: 'order-return-reason'}
      },
      {
        path: 'returnApplyDetail',
        name: 'returnApplyDetail',
        component: lazyLoad('oms/apply/applyDetail'),
        meta: {title: '退货原因详情'},
        hidden:true
      }
    ]
  },
  {
    path:'/sms',
    component: Layout,
    redirect: '/sms/coupon',
    name: 'sms',
    meta: {title: '营销', icon: 'sms'},
    children: [
      {
        path: 'flash',
        name: 'flash',
        component: lazyLoad('sms/flash/index'),
        meta: {title: '秒杀活动列表', icon: 'sms-flash'}
      },
      {
        path: 'flashSession',
        name: 'flashSession',
        component: lazyLoad('sms/flash/sessionList'),
        meta: {title: '秒杀时间段列表'},
        hidden:true
      },
      {
        path: 'selectSession',
        name: 'selectSession',
        component: lazyLoad('sms/flash/selectSessionList'),
        meta: {title: '秒杀时间段选择'},
        hidden:true
      },
      {
        path: 'flashProductRelation',
        name: 'flashProductRelation',
        component: lazyLoad('sms/flash/productRelationList'),
        meta: {title: '秒杀商品列表'},
        hidden:true
      },
      {
        path: 'coupon',
        name: 'coupon',
        component: lazyLoad('sms/coupon/index'),
        meta: {title: '优惠券列表', icon: 'sms-coupon'}
      },
      {
        path: 'addCoupon',
        name: 'addCoupon',
        component: lazyLoad('sms/coupon/add'),
        meta: {title: '添加优惠券'},
        hidden:true
      },
      {
        path: 'updateCoupon',
        name: 'updateCoupon',
        component: lazyLoad('sms/coupon/update'),
        meta: {title: '修改优惠券'},
        hidden:true
      },
      {
        path: 'couponHistory',
        name: 'couponHistory',
        component: lazyLoad('sms/coupon/history'),
        meta: {title: '优惠券领取详情'},
        hidden:true
      },
      {
        path: 'brand',
        name: 'homeBrand',
        component: lazyLoad('sms/brand/index'),
        meta: {title: '品牌推荐', icon: 'product-brand'}
      },
      {
        path: 'new',
        name: 'homeNew',
        component: lazyLoad('sms/new/index'),
        meta: {title: '新品推荐', icon: 'sms-new'}
      },
      {
        path: 'hot',
        name: 'homeHot',
        component: lazyLoad('sms/hot/index'),
        meta: {title: '人气推荐', icon: 'sms-hot'}
      },
      {
        path: 'subject',
        name: 'homeSubject',
        component: lazyLoad('sms/subject/index'),
        meta: {title: '专题推荐', icon: 'sms-subject'}
      },
      {
        path: 'advertise',
        name: 'homeAdvertise',
        component: lazyLoad('sms/advertise/index'),
        meta: {title: '广告列表', icon: 'sms-ad'}
      },
      {
        path: 'addAdvertise',
        name: 'addHomeAdvertise',
        component: lazyLoad('sms/advertise/add'),
        meta: {title: '添加广告'},
        hidden:true
      },
      {
        path: 'updateAdvertise',
        name: 'updateHomeAdvertise',
        component: lazyLoad('sms/advertise/update'),
        meta: {title: '编辑广告'},
        hidden:true
      }
    ]
  },
  {
    path:'/ums',
    component: Layout,
    redirect: '/ums/admin',
    name: 'ums',
    meta: {title: '权限', icon: 'ums'},
    children: [
      {
        path: 'admin',
        name: 'admin',
        component: lazyLoad('ums/admin/index'),
        meta: {title: '用户列表', icon: 'ums-admin'}
      },
      {
        path: 'role',
        name: 'role',
        component: lazyLoad('ums/role/index'),
        meta: {title: '角色列表', icon: 'ums-role'}
      },
      {
        path: 'allocMenu',
        name: 'allocMenu',
        component: lazyLoad('ums/role/allocMenu'),
        meta: {title: '分配菜单'},
        hidden: true
      },
      {
        path: 'allocResource',
        name: 'allocResource',
        component: lazyLoad('ums/role/allocResource'),
        meta: {title: '分配资源'},
        hidden: true
      },
      {
        path: 'menu',
        name: 'menu',
        component: lazyLoad('ums/menu/index'),
        meta: {title: '菜单列表', icon: 'ums-menu'}
      },
      {
        path: 'addMenu',
        name: 'addMenu',
        component: lazyLoad('ums/menu/add'),
        meta: {title: '添加菜单'},
        hidden: true
      },
      {
        path: 'updateMenu',
        name: 'updateMenu',
        component: lazyLoad('ums/menu/update'),
        meta: {title: '修改菜单'},
        hidden: true
      },
      {
        path: 'resource',
        name: 'resource',
        component: lazyLoad('ums/resource/index'),
        meta: {title: '资源列表', icon: 'ums-resource'}
      },
      {
        path: 'resourceCategory',
        name: 'resourceCategory',
        component: lazyLoad('ums/resource/categoryList'),
        meta: {title: '资源分类'},
        hidden: true
      }
    ]
  },
  {path: '*', redirect: '/404', hidden: true}
]

const router = new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({y: 0}),
  routes: constantRouterMap
})

// 常用页面预加载列表
const commonRoutes = [
  'home/index',
  'pms/product/index',
  'oms/order/index',
  'sms/coupon/index',
  'ums/admin/index'
]

// 次要页面预加载列表（低优先级）
const secondaryRoutes = [
  'pms/brand/index',
  'pms/productCate/index',
  'oms/apply/index',
  'sms/flash/index',
  'ums/role/index',
  'ums/menu/index'
]

// 启动预加载
if (process.env.NODE_ENV === 'production') {
  // 生产环境下才启用预加载
  // 高优先级预加载常用页面
  preloadRoutes(commonRoutes, { priority: 'normal', delay: 1000 })
  
  // 低优先级预加载次要页面
  preloadRoutes(secondaryRoutes, { priority: 'low', delay: 5000 })
} else {
  // 开发环境下延迟预加载，避免影响开发体验
  preloadRoutes(commonRoutes, { priority: 'low', delay: 3000 })
}

// 路由导航守卫 - 加载状态管理
router.beforeEach((to, from, next) => {
  // 可以在这里添加全局的loading状态
  console.log(`路由导航: ${from.path} -> ${to.path}`)
  next()
})

router.afterEach((to, from) => {
  // 路由导航完成后的处理
  console.log(`路由导航完成: ${to.path}`)
})

// 错误处理
router.onError((error) => {
  console.error('路由错误:', error)
  // 可以在这里上报错误信息
})

export default router

