import { BaseEntity, BaseQuery, BaseResponse, DetailResponse, ListResponse, Status } from './base'

/**
 * 商品相关类型定义
 */

// 商品实体接口
export interface Product extends BaseEntity {
  brandId?: number
  productCategoryId?: number
  feightTemplateId?: number
  productAttributeCategoryId?: number
  name: string
  pic?: string
  productSn: string
  deleteStatus: number
  publishStatus: number
  newStatus: number
  recommandStatus: number
  verifyStatus: number
  sort?: number
  sale?: number
  price: number
  promotionPrice?: number
  giftGrowth: number
  giftPoint: number
  usePointLimit?: number
  subTitle?: string
  originalPrice?: number
  stock: number
  lowStock?: number
  unit?: string
  weight?: number
  previewStatus: number
  serviceIds?: string
  keywords?: string
  note?: string
  albumPics?: string
  detailTitle?: string
  promotionStartTime?: string
  promotionEndTime?: string
  promotionPerLimit?: number
  promotionType: number
  brandName?: string
  productCategoryName?: string
}

// 商品详情接口
export interface ProductDetail extends Product {
  productLadderList?: ProductLadder[]
  productFullReductionList?: ProductFullReduction[]
  memberPriceList?: MemberPrice[]
  skuStockList?: SkuStock[]
  productAttributeValueList?: ProductAttributeValue[]
  coupomRelationList?: CouponRelation[]
  subjectRelationList?: SubjectRelation[]
  prefrenceAreaRelationList?: PrefrenceAreaRelation[]
}

// 商品阶梯价格
export interface ProductLadder extends BaseEntity {
  productId: number
  count: number
  discount: number
  price: number
}

// 商品满减
export interface ProductFullReduction extends BaseEntity {
  productId: number
  fullPrice: number
  reducePrice: number
}

// 会员价格
export interface MemberPrice extends BaseEntity {
  productId: number
  memberLevelId: number
  memberPrice: number
  memberLevelName?: string
}

// SKU库存
export interface SkuStock extends BaseEntity {
  productId: number
  skuCode: string
  price: number
  stock: number
  lowStock?: number
  pic?: string
  sale?: number
  promotionPrice?: number
  lockStock?: number
  spData?: string
}

// 商品属性值
export interface ProductAttributeValue extends BaseEntity {
  productId: number
  productAttributeId: number
  value?: string
  productAttributeName?: string
  type?: number
}

// 优惠券关联
export interface CouponRelation extends BaseEntity {
  couponId: number
  productId: number
  productName?: string
  productSn?: string
}

// 专题关联
export interface SubjectRelation extends BaseEntity {
  subjectId: number
  productId: number
}

// 优选区域关联
export interface PrefrenceAreaRelation extends BaseEntity {
  prefrenceAreaId: number
  productId: number
}

// 品牌接口
export interface Brand extends BaseEntity {
  name: string
  firstLetter?: string
  sort?: number
  factoryStatus: number
  showStatus: number
  productCount?: number
  productCommentCount?: number
  logo?: string
  bigPic?: string
  brandStory?: string
}

// 商品分类接口
export interface ProductCategory extends BaseEntity {
  parentId: number
  name: string
  level: number
  productCount?: number
  productUnit?: string
  navStatus: number
  showStatus: number
  sort?: number
  icon?: string
  keywords?: string
  description?: string
  children?: ProductCategory[]
}

// 商品查询参数
export interface ProductQuery extends BaseQuery {
  publishStatus?: number
  verifyStatus?: number
  productSn?: string
  productCategoryId?: number
  brandId?: number
}

// 商品表单数据
export interface ProductForm {
  name: string
  subTitle?: string
  productCategoryId?: number
  brandId?: number
  description?: string
  productSn: string
  price: number
  originalPrice?: number
  stock: number
  unit?: string
  weight?: number
  sort?: number
  pic?: string
  albumPics?: string[]
  keywords?: string
  note?: string
  publishStatus: number
  newStatus: number
  recommandStatus: number
  detailTitle?: string
  detailDesc?: string
  promotionType?: number
  giftGrowth?: number
  giftPoint?: number
  usePointLimit?: number
  previewStatus?: number
  serviceIds?: number[]
  memberPriceList?: MemberPrice[]
  skuStockList?: SkuStock[]
  productLadderList?: ProductLadder[]
  productFullReductionList?: ProductFullReduction[]
  productAttributeValueList?: ProductAttributeValue[]
  subjectProductRelationList?: SubjectRelation[]
  prefrenceAreaProductRelationList?: PrefrenceAreaRelation[]
}

// 商品状态更新参数
export interface ProductStatusUpdate {
  ids: number[]
  publishStatus?: number
  recommendStatus?: number
  newStatus?: number
  deleteStatus?: number
}

// API 响应类型
export type ProductListApiResponse = ListResponse<Product>
export type ProductDetailApiResponse = DetailResponse<ProductDetail>
export type BrandListApiResponse = ListResponse<Brand>
export type ProductCategoryListApiResponse = ListResponse<ProductCategory>
export type SkuStockListApiResponse = ListResponse<SkuStock>