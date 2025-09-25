import request from '@/utils/request'
import {
  BaseQuery,
  BrandListApiResponse,
  Brand,
  BaseResponse,
  SimpleResponse
} from '@/types'

// 品牌查询参数接口
interface BrandQuery extends BaseQuery {
  name?: string
  showStatus?: number
  factoryStatus?: number
}

// 品牌表单数据接口
interface BrandForm {
  name: string
  firstLetter?: string
  sort?: number
  factoryStatus: number
  showStatus: number
  logo?: string
  bigPic?: string
  brandStory?: string
}

// 品牌状态更新参数
interface BrandStatusUpdate {
  ids: number[]
  showStatus?: number
  factoryStatus?: number
}

export function fetchList(params: BrandQuery): Promise<BrandListApiResponse> {
  return request({
    url: '/brand/list',
    method: 'get',
    params: params
  })
}

export function createBrand(data: BrandForm): Promise<SimpleResponse> {
  return request({
    url: '/brand/create',
    method: 'post',
    data: data
  })
}

export function updateShowStatus(data: BrandStatusUpdate): Promise<SimpleResponse> {
  return request({
    url: '/brand/update/showStatus',
    method: 'post',
    data: data
  })
}

export function updateFactoryStatus(data: BrandStatusUpdate): Promise<SimpleResponse> {
  return request({
    url: '/brand/update/factoryStatus',
    method: 'post',
    data: data
  })
}

export function deleteBrand(id: number): Promise<SimpleResponse> {
  return request({
    url: '/brand/delete/' + id,
    method: 'get',
  })
}

export function getBrand(id: number): Promise<BaseResponse<Brand>> {
  return request({
    url: '/brand/' + id,
    method: 'get',
  })
}

export function updateBrand(id: number, data: BrandForm): Promise<SimpleResponse> {
  return request({
    url: '/brand/update/' + id,
    method: 'post',
    data: data
  })
}

