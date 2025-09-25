// 双11促销页面Mock数据
// 用于开发测试和演示

export const mockPromotionConfig = {
  id: 'holiday_2024_double11',
  title: '双11狂欢节',
  description: '全场5折起，优惠券免费领取，错过再等一年！',
  startTime: '2024-11-01 00:00:00',
  endTime: '2024-11-11 23:59:59',
  status: 1, // 0:未开始, 1:进行中, 2:已结束
  bannerImage: 'https://example.com/banner/double11.jpg',
  bannerLink: '/promotion/double11'
}

export const mockBannerSettings = {
  image: 'https://example.com/banner/double11.jpg',
  title: '双11狂欢节',
  subtitle: '全场5折起，优惠券免费领取',
  link: '/promotion/double11',
  showCountdown: true
}

export const mockCouponList = [
  {
    id: 'coupon_001',
    name: '满100减20优惠券',
    amount: 20,
    type: 0, // 满减券
    minPoint: 100,
    startTime: '2024-11-01 00:00:00',
    endTime: '2024-11-11 23:59:59',
    totalStock: 10000,
    remainStock: 8500,
    isHot: true,
    receiveLimit: 1,
    displayOrder: 1
  },
  {
    id: 'coupon_002',
    name: '新人专享8折券',
    amount: 0.8,
    type: 1, // 折扣券
    minPoint: 0,
    startTime: '2024-11-01 00:00:00',
    endTime: '2024-11-11 23:59:59',
    totalStock: 5000,
    remainStock: 4200,
    isHot: false,
    receiveLimit: 1,
    displayOrder: 2
  },
  {
    id: 'coupon_003',
    name: '全场免邮券',
    amount: 0,
    type: 2, // 免邮券
    minPoint: 50,
    startTime: '2024-11-01 00:00:00',
    endTime: '2024-11-11 23:59:59',
    totalStock: 20000,
    remainStock: 15000,
    isHot: false,
    receiveLimit: 3,
    displayOrder: 3
  },
  {
    id: 'coupon_004',
    name: '满500减100大额券',
    amount: 100,
    type: 0, // 满减券
    minPoint: 500,
    startTime: '2024-11-01 00:00:00',
    endTime: '2024-11-11 23:59:59',
    totalStock: 3000,
    remainStock: 2800,
    isHot: true,
    receiveLimit: 1,
    displayOrder: 4
  },
  {
    id: 'coupon_005',
    name: '电子产品专享券',
    amount: 50,
    type: 0, // 满减券
    minPoint: 200,
    startTime: '2024-11-01 00:00:00',
    endTime: '2024-11-11 23:59:59',
    totalStock: 1000,
    remainStock: 50, // 库存紧张
    isHot: true,
    receiveLimit: 2,
    displayOrder: 5
  },
  {
    id: 'coupon_006',
    name: '服装类9折券',
    amount: 0.9,
    type: 1, // 折扣券
    minPoint: 100,
    startTime: '2024-11-01 00:00:00',
    endTime: '2024-11-11 23:59:59',
    totalStock: 8000,
    remainStock: 6500,
    isHot: false,
    receiveLimit: 1,
    displayOrder: 6
  }
]

export const mockPromotionProducts = [
  {
    id: 'product_001',
    name: 'iPhone 15 Pro Max 256GB',
    originalPrice: 9999,
    promotionPrice: 8999,
    discount: 0.9,
    image: 'https://example.com/products/iphone15.jpg',
    category: 'electronics',
    stock: 100,
    salesCount: 1205,
    isHot: true,
    priority: 10
  },
  {
    id: 'product_002',
    name: '小米14 Ultra 12GB+256GB',
    originalPrice: 6999,
    promotionPrice: 5999,
    discount: 0.86,
    image: 'https://example.com/products/xiaomi14.jpg',
    category: 'electronics',
    stock: 150,
    salesCount: 2580,
    isHot: true,
    priority: 9
  },
  {
    id: 'product_003',
    name: 'Nike Air Max 270 运动鞋',
    originalPrice: 1299,
    promotionPrice: 799,
    discount: 0.62,
    image: 'https://example.com/products/nike_shoes.jpg',
    category: 'sports',
    stock: 80,
    salesCount: 856,
    isHot: false,
    priority: 8
  },
  {
    id: 'product_004',
    name: 'Zara 女士羊毛大衣',
    originalPrice: 1599,
    promotionPrice: 1199,
    discount: 0.75,
    image: 'https://example.com/products/zara_coat.jpg',
    category: 'clothing',
    stock: 45,
    salesCount: 423,
    isHot: false,
    priority: 7
  },
  {
    id: 'product_005',
    name: '戴森V15吸尘器',
    originalPrice: 4990,
    promotionPrice: 3990,
    discount: 0.8,
    image: 'https://example.com/products/dyson_v15.jpg',
    category: 'home',
    stock: 30,
    salesCount: 312,
    isHot: true,
    priority: 6
  },
  {
    id: 'product_006',
    name: 'MUJI 无印良品收纳盒组合',
    originalPrice: 299,
    promotionPrice: 199,
    discount: 0.67,
    image: 'https://example.com/products/muji_storage.jpg',
    category: 'home',
    stock: 200,
    salesCount: 1580,
    isHot: false,
    priority: 5
  },
  {
    id: 'product_007',
    name: 'Adidas 健身套装',
    originalPrice: 899,
    promotionPrice: 599,
    discount: 0.67,
    image: 'https://example.com/products/adidas_set.jpg',
    category: 'sports',
    stock: 120,
    salesCount: 765,
    isHot: false,
    priority: 4
  },
  {
    id: 'product_008',
    name: 'Uniqlo 男士羽绒服',
    originalPrice: 699,
    promotionPrice: 499,
    discount: 0.71,
    image: 'https://example.com/products/uniqlo_down.jpg',
    category: 'clothing',
    stock: 0, // 售罄
    salesCount: 2100,
    isHot: true,
    priority: 3
  }
]

export const mockUserReceivedCoupons = [
  {
    id: 'received_001',
    couponId: 'coupon_001',
    userId: 'user_123',
    receiveTime: '2024-11-01 10:30:00',
    status: 0, // 0:未使用, 1:已使用, 2:已过期
    coupon: mockCouponList[0]
  }
]

// API Mock响应格式
export const mockApiResponses = {
  // 获取促销配置
  getPromotionConfig: {
    code: 200,
    message: 'success',
    data: mockPromotionConfig
  },
  
  // 获取优惠券列表
  getHolidayCoupons: {
    code: 200,
    message: 'success',
    data: {
      list: mockCouponList,
      pageNum: 1,
      pageSize: 10,
      total: mockCouponList.length
    }
  },
  
  // 获取促销商品
  getPromotionProducts: {
    code: 200,
    message: 'success',
    data: mockPromotionProducts
  },
  
  // 领取优惠券成功
  receiveCoupon: {
    code: 200,
    message: '优惠券领取成功',
    data: {
      id: 'received_002',
      couponId: 'coupon_002',
      userId: 'user_123',
      receiveTime: new Date().toISOString(),
      status: 0
    }
  },
  
  // 领取失败 - 库存不足
  receiveCouponFailed: {
    code: 400,
    message: '优惠券库存不足',
    data: null
  },
  
  // 领取失败 - 已达上限
  receiveCouponLimit: {
    code: 400,
    message: '您已达到该优惠券的领取上限',
    data: null
  }
}

// 使用说明
export const usageInstructions = {
  development: `
在开发环境中使用Mock数据：

1. 在API文件中导入Mock数据：
   import { mockApiResponses } from '@/mock/holidayPromotionMock'

2. 在接口函数中返回Mock数据：
   export function getPromotionConfig() {
     return Promise.resolve(mockApiResponses.getPromotionConfig)
   }

3. 在组件中正常调用API即可获得Mock数据
  `,
  
  testing: `
测试场景覆盖：

1. 正常流程测试：
   - 页面加载和数据展示
   - 优惠券领取
   - 商品浏览和操作

2. 异常情况测试：
   - 网络错误处理
   - 库存不足处理
   - 达到领取上限处理

3. 边界条件测试：
   - 活动时间边界
   - 库存为0的情况
   - 最大/最小价格商品
  `
}

export default {
  mockPromotionConfig,
  mockBannerSettings,
  mockCouponList,
  mockPromotionProducts,
  mockUserReceivedCoupons,
  mockApiResponses,
  usageInstructions
}