import request from '@/utils/request'

// 获取双11活动配置
export function getPromotionConfig() {
  return request({
    url: '/promotion/holiday/config',
    method: 'get'
  })
}

// 保存双11活动配置
export function savePromotionConfig(data) {
  return request({
    url: '/promotion/holiday/config',
    method: 'post',
    data: data
  })
}

// 获取活动优惠券列表
export function getHolidayCoupons(params) {
  return request({
    url: '/promotion/holiday/coupons',
    method: 'get',
    params: params
  })
}

// 领取优惠券
export function receiveCoupon(data) {
  return request({
    url: '/promotion/holiday/coupon/receive',
    method: 'post',
    data: data
  })
}

// 获取促销商品
export function getPromotionProducts(params) {
  return request({
    url: '/promotion/holiday/products',
    method: 'get',
    params: params
  })
}

// 更新横幅配置
export function updateBannerConfig(data) {
  return request({
    url: '/promotion/holiday/banner',
    method: 'post',
    data: data
  })
}

// 获取用户已领取的优惠券
export function getUserReceivedCoupons(userId) {
  return request({
    url: `/promotion/holiday/user/${userId}/coupons`,
    method: 'get'
  })
}

// 检查优惠券库存
export function checkCouponStock(couponId) {
  return request({
    url: `/promotion/holiday/coupon/${couponId}/stock`,
    method: 'get'
  })
}