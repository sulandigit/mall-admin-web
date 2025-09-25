import request from '@/utils/request'
import {
  ProductQuery,
  ProductListApiResponse,
  ProductDetailApiResponse,
  ProductForm,
  ProductStatusUpdate,
  BaseResponse,
  SimpleResponse
} from '@/types'

export function fetchList(params: ProductQuery): Promise<ProductListApiResponse> {
  return request({
    url: '/product/list',
    method: 'get',
    params: params
  })
}

export function fetchSimpleList(params?: ProductQuery): Promise<ProductListApiResponse> {
  return request({
    url: '/product/simpleList',
    method: 'get',
    params: params
  })
}

export function updateDeleteStatus(params: ProductStatusUpdate): Promise<SimpleResponse> {
  return request({
    url: '/product/update/deleteStatus',
    method: 'post',
    params: params
  })
}

export function updateNewStatus(params: ProductStatusUpdate): Promise<SimpleResponse> {
  return request({
    url: '/product/update/newStatus',
    method: 'post',
    params: params
  })
}

export function updateRecommendStatus(params: ProductStatusUpdate): Promise<SimpleResponse> {
  return request({
    url: '/product/update/recommendStatus',
    method: 'post',
    params: params
  })
}

export function updatePublishStatus(params: ProductStatusUpdate): Promise<SimpleResponse> {
  return request({
    url: '/product/update/publishStatus',
    method: 'post',
    params: params
  })
}

export function createProduct(data: ProductForm): Promise<SimpleResponse> {
  return request({
    url: '/product/create',
    method: 'post',
    data: data
  })
}

export function updateProduct(id: number, data: ProductForm): Promise<SimpleResponse> {
  return request({
    url: '/product/update/' + id,
    method: 'post',
    data: data
  })
}

export function getProduct(id: number): Promise<ProductDetailApiResponse> {
  return request({
    url: '/product/updateInfo/' + id,
    method: 'get',
  })
}

