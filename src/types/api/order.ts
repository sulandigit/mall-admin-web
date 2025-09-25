import { BaseEntity, BaseQuery, BaseResponse, DetailResponse, ListResponse } from './base'

/**
 * 订单相关类型定义
 */

// 订单状态枚举
export enum OrderStatus {
  PENDING_PAYMENT = 0, // 待付款
  PENDING_DELIVERY = 1, // 待发货
  PENDING_RECEIPT = 2, // 已发货
  COMPLETED = 3, // 已完成
  CLOSED = 4 // 已关闭
}

// 订单来源枚举
export enum OrderSource {
  PC = 0,
  APP = 1
}

// 订单类型枚举
export enum OrderType {
  NORMAL = 0, // 正常订单
  SECKILL = 1 // 秒杀订单
}

// 订单实体接口
export interface Order extends BaseEntity {
  memberId?: number
  memberUsername?: string
  couponId?: number
  orderSn: string
  memberPhone?: string
  orderType: OrderType
  sourceType: OrderSource
  status: OrderStatus
  autoConfirmDay?: number
  integration?: number
  growth?: number
  promotionInfo?: string
  billType?: number
  billHeader?: string
  billContent?: string
  billReceiverPhone?: string
  billReceiverEmail?: string
  receiverName: string
  receiverPhone: string
  receiverPostCode?: string
  receiverProvince?: string
  receiverCity?: string
  receiverRegion?: string
  receiverDetailAddress?: string
  note?: string
  confirmStatus: number
  deleteStatus: number
  useIntegration?: number
  paymentTime?: string
  deliveryTime?: string
  receiveTime?: string
  commentTime?: string
  modifyTime?: string
  totalAmount: number
  freightAmount?: number
  discountAmount?: number
  promotionAmount?: number
  integrationAmount?: number
  couponAmount?: number
  payAmount: number
}

// 订单商品接口
export interface OrderItem extends BaseEntity {
  orderId: number
  orderSn?: string
  productId: number
  productPic?: string
  productName: string
  productBrand?: string
  productSn?: string
  productPrice: number
  productQuantity: number
  productSkuId?: number
  productSkuCode?: string
  productCategoryId?: number
  promotionName?: string
  promotionAmount?: number
  couponAmount?: number
  integrationAmount?: number
  realAmount: number
  giftIntegration?: number
  giftGrowth?: number
  productAttr?: string
}

// 订单详情接口
export interface OrderDetail extends Order {
  orderItemList: OrderItem[]
  historyList?: OrderOperateHistory[]
}

// 订单操作历史
export interface OrderOperateHistory extends BaseEntity {
  orderId: number
  operateMan: string
  orderStatus: OrderStatus
  note?: string
}

// 订单设置接口
export interface OrderSetting extends BaseEntity {
  flashOrderOvertime?: number
  normalOrderOvertime?: number
  confirmOvertime?: number
  finishOvertime?: number
  commentOvertime?: number
}

// 订单查询参数
export interface OrderQuery extends BaseQuery {
  orderSn?: string
  status?: OrderStatus
  sourceType?: OrderSource
  orderType?: OrderType
  receiverKeyword?: string
  createTime?: string
}

// 订单发货参数
export interface DeliveryParam {
  orderId: number
  deliveryCompany: string
  deliverySn: string
}

// 订单收货地址修改参数
export interface OrderReceiverInfoParam {
  orderId: number
  receiverName: string
  receiverPhone: string
  receiverPostCode?: string
  receiverDetailAddress: string
  receiverProvince?: string
  receiverCity?: string
  receiverRegion?: string
  status?: number
}

// 订单备注修改参数
export interface OrderNoteParam {
  orderId: number
  note: string
  status?: number
}

// 订单关闭参数
export interface OrderCloseParam {
  orderId: number
  note?: string
}

// API 响应类型
export type OrderListApiResponse = ListResponse<Order>
export type OrderDetailApiResponse = DetailResponse<OrderDetail>
export type OrderSettingApiResponse = DetailResponse<OrderSetting>