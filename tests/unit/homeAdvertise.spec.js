/**
 * 首頁廣告API單元測試 2025
 * 測試所有廣告相關的API函數功能
 */

import {
  fetchList,
  updateStatus,
  deleteHomeAdvertise,
  createHomeAdvertise,
  getHomeAdvertise,
  updateHomeAdvertise
} from '@/api/homeAdvertise'

// 模擬request模塊 2025
jest.mock('@/utils/request', () => {
  return jest.fn()
})

import request from '@/utils/request'

describe('首頁廣告API測試套件 2025', () => {
  // 每個測試前重置mock 2025
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('fetchList - 獲取廣告列表 2025', () => {
    it('應該正確調用獲取廣告列表API 2025', async () => {
      // 模擬API返回數據 2025
      const mockResponse = {
        code: 200,
        data: {
          list: [
            {
              id: 1,
              name: '測試廣告1',
              pic: 'http://example.com/ad1.jpg',
              startTime: '2025-01-01',
              endTime: '2025-12-31',
              status: 1
            },
            {
              id: 2,
              name: '測試廣告2',
              pic: 'http://example.com/ad2.jpg',
              startTime: '2025-01-01',
              endTime: '2025-12-31',
              status: 0
            }
          ],
          total: 2,
          totalPage: 1
        }
      }
      
      request.mockResolvedValue(mockResponse)

      const params = {
        pageNum: 1,
        pageSize: 10,
        name: '測試'
      }

      const result = await fetchList(params)

      // 驗證request被正確調用 2025
      expect(request).toHaveBeenCalledWith({
        url: '/home/advertise/list',
        method: 'get',
        params: params
      })

      // 驗證返回結果 2025
      expect(result).toEqual(mockResponse)
      expect(result.data.list).toHaveLength(2)
      expect(result.data.total).toBe(2)
    })

    it('應該處理空參數調用 2025', async () => {
      const mockResponse = { code: 200, data: { list: [], total: 0 } }
      request.mockResolvedValue(mockResponse)

      await fetchList({})

      expect(request).toHaveBeenCalledWith({
        url: '/home/advertise/list',
        method: 'get',
        params: {}
      })
    })

    it('應該處理無參數調用 2025', async () => {
      const mockResponse = { code: 200, data: { list: [], total: 0 } }
      request.mockResolvedValue(mockResponse)

      await fetchList()

      expect(request).toHaveBeenCalledWith({
        url: '/home/advertise/list',
        method: 'get',
        params: undefined
      })
    })
  })

  describe('updateStatus - 更新廣告狀態 2025', () => {
    it('應該正確調用更新廣告狀態API 2025', async () => {
      const mockResponse = { code: 200, message: '操作成功' }
      request.mockResolvedValue(mockResponse)

      const advertisementId = 1
      const statusParams = { status: 1 }

      const result = await updateStatus(advertisementId, statusParams)

      // 驗證API調用參數 2025
      expect(request).toHaveBeenCalledWith({
        url: '/home/advertise/update/status/1',
        method: 'post',
        params: statusParams
      })

      expect(result).toEqual(mockResponse)
    })

    it('應該處理不同的廣告ID和狀態參數 2025', async () => {
      const mockResponse = { code: 200, message: '狀態更新成功' }
      request.mockResolvedValue(mockResponse)

      const advertisementId = 999
      const statusParams = { status: 0 }

      await updateStatus(advertisementId, statusParams)

      expect(request).toHaveBeenCalledWith({
        url: '/home/advertise/update/status/999',
        method: 'post',
        params: statusParams
      })
    })

    it('應該處理API錯誤響應 2025', async () => {
      const mockError = new Error('網路錯誤')
      request.mockRejectedValue(mockError)

      const advertisementId = 1
      const statusParams = { status: 1 }

      await expect(updateStatus(advertisementId, statusParams)).rejects.toThrow('網路錯誤')
    })
  })

  describe('deleteHomeAdvertise - 刪除廣告 2025', () => {
    it('應該正確調用刪除廣告API 2025', async () => {
      const mockResponse = { code: 200, message: '刪除成功' }
      request.mockResolvedValue(mockResponse)

      const deleteData = { ids: [1, 2, 3] }

      const result = await deleteHomeAdvertise(deleteData)

      expect(request).toHaveBeenCalledWith({
        url: '/home/advertise/delete',
        method: 'post',
        data: deleteData
      })

      expect(result).toEqual(mockResponse)
    })

    it('應該處理單個廣告刪除 2025', async () => {
      const mockResponse = { code: 200, message: '刪除成功' }
      request.mockResolvedValue(mockResponse)

      const deleteData = { ids: [5] }

      await deleteHomeAdvertise(deleteData)

      expect(request).toHaveBeenCalledWith({
        url: '/home/advertise/delete',
        method: 'post',
        data: deleteData
      })
    })

    it('應該處理刪除失敗的情況 2025', async () => {
      const mockResponse = { code: 500, message: '刪除失敗' }
      request.mockResolvedValue(mockResponse)

      const deleteData = { ids: [1] }
      const result = await deleteHomeAdvertise(deleteData)

      expect(result.code).toBe(500)
      expect(result.message).toBe('刪除失敗')
    })
  })

  describe('createHomeAdvertise - 創建廣告 2025', () => {
    it('應該正確調用創建廣告API 2025', async () => {
      const mockResponse = { code: 200, message: '創建成功', data: { id: 10 } }
      request.mockResolvedValue(mockResponse)

      const createData = {
        name: '新廣告',
        type: 1,
        pic: 'http://example.com/new-ad.jpg',
        startTime: '2025-01-01',
        endTime: '2025-12-31',
        status: 1,
        url: 'http://example.com/landing',
        note: '測試廣告創建',
        sort: 100
      }

      const result = await createHomeAdvertise(createData)

      expect(request).toHaveBeenCalledWith({
        url: '/home/advertise/create',
        method: 'post',
        data: createData
      })

      expect(result).toEqual(mockResponse)
      expect(result.data.id).toBe(10)
    })

    it('應該處理必填字段驗證錯誤 2025', async () => {
      const mockResponse = { code: 400, message: '廣告名稱不能為空' }
      request.mockResolvedValue(mockResponse)

      const incompleteData = {
        type: 1,
        pic: 'http://example.com/ad.jpg'
        // 缺少必填的name字段 2025
      }

      const result = await createHomeAdvertise(incompleteData)

      expect(result.code).toBe(400)
      expect(result.message).toBe('廣告名稱不能為空')
    })

    it('應該處理完整的廣告數據創建 2025', async () => {
      const mockResponse = { code: 200, message: '創建成功' }
      request.mockResolvedValue(mockResponse)

      const completeData = {
        name: '完整測試廣告',
        type: 2,
        pic: 'http://example.com/complete-ad.jpg',
        startTime: '2025-03-01',
        endTime: '2025-12-31',
        status: 1,
        url: 'http://example.com/product',
        note: '完整的廣告創建測試',
        sort: 200,
        clickCount: 0,
        orderCount: 0
      }

      await createHomeAdvertise(completeData)

      expect(request).toHaveBeenCalledWith({
        url: '/home/advertise/create',
        method: 'post',
        data: completeData
      })
    })
  })

  describe('getHomeAdvertise - 獲取單個廣告詳情 2025', () => {
    it('應該正確調用獲取廣告詳情API 2025', async () => {
      const mockResponse = {
        code: 200,
        data: {
          id: 1,
          name: '測試廣告詳情',
          type: 1,
          pic: 'http://example.com/detail-ad.jpg',
          startTime: '2025-01-01',
          endTime: '2025-12-31',
          status: 1,
          url: 'http://example.com/detail',
          note: '詳情測試廣告',
          sort: 150
        }
      }
      request.mockResolvedValue(mockResponse)

      const advertisementId = 1

      const result = await getHomeAdvertise(advertisementId)

      expect(request).toHaveBeenCalledWith({
        url: '/home/advertise/1',
        method: 'get'
      })

      expect(result).toEqual(mockResponse)
      expect(result.data.id).toBe(1)
      expect(result.data.name).toBe('測試廣告詳情')
    })

    it('應該處理不存在的廣告ID 2025', async () => {
      const mockResponse = { code: 404, message: '廣告不存在' }
      request.mockResolvedValue(mockResponse)

      const nonExistentId = 9999

      const result = await getHomeAdvertise(nonExistentId)

      expect(request).toHaveBeenCalledWith({
        url: '/home/advertise/9999',
        method: 'get'
      })

      expect(result.code).toBe(404)
      expect(result.message).toBe('廣告不存在')
    })

    it('應該處理字符串類型的ID 2025', async () => {
      const mockResponse = { code: 200, data: { id: 5, name: '字符串ID測試' } }
      request.mockResolvedValue(mockResponse)

      const stringId = '5'

      await getHomeAdvertise(stringId)

      expect(request).toHaveBeenCalledWith({
        url: '/home/advertise/5',
        method: 'get'
      })
    })
  })

  describe('updateHomeAdvertise - 更新廣告信息 2025', () => {
    it('應該正確調用更新廣告API 2025', async () => {
      const mockResponse = { code: 200, message: '更新成功' }
      request.mockResolvedValue(mockResponse)

      const advertisementId = 3
      const updateData = {
        name: '更新後的廣告名稱',
        type: 2,
        pic: 'http://example.com/updated-ad.jpg',
        startTime: '2025-02-01',
        endTime: '2025-11-30',
        status: 1,
        url: 'http://example.com/updated-landing',
        note: '更新測試',
        sort: 120
      }

      const result = await updateHomeAdvertise(advertisementId, updateData)

      expect(request).toHaveBeenCalledWith({
        url: '/home/advertise/update/3',
        method: 'post',
        data: updateData
      })

      expect(result).toEqual(mockResponse)
    })

    it('應該處理部分字段更新 2025', async () => {
      const mockResponse = { code: 200, message: '部分更新成功' }
      request.mockResolvedValue(mockResponse)

      const advertisementId = 4
      const partialUpdateData = {
        name: '僅更新名稱',
        status: 0
      }

      await updateHomeAdvertise(advertisementId, partialUpdateData)

      expect(request).toHaveBeenCalledWith({
        url: '/home/advertise/update/4',
        method: 'post',
        data: partialUpdateData
      })
    })

    it('應該處理更新失敗的情況 2025', async () => {
      const mockResponse = { code: 400, message: '參數驗證失敗' }
      request.mockResolvedValue(mockResponse)

      const advertisementId = 1
      const invalidData = {
        name: '', // 空名稱應該驗證失敗 2025
        startTime: 'invalid-date'
      }

      const result = await updateHomeAdvertise(advertisementId, invalidData)

      expect(result.code).toBe(400)
      expect(result.message).toBe('參數驗證失敗')
    })

    it('應該處理網路錯誤 2025', async () => {
      const networkError = new Error('網路連接失敗')
      request.mockRejectedValue(networkError)

      const advertisementId = 1
      const updateData = { name: '測試更新' }

      await expect(updateHomeAdvertise(advertisementId, updateData))
        .rejects.toThrow('網路連接失敗')

      expect(request).toHaveBeenCalledWith({
        url: '/home/advertise/update/1',
        method: 'post',
        data: updateData
      })
    })
  })

  describe('API錯誤處理和邊界情況測試 2025', () => {
    it('應該處理請求超時錯誤 2025', async () => {
      const timeoutError = new Error('Request timeout')
      timeoutError.code = 'TIMEOUT'
      request.mockRejectedValue(timeoutError)

      await expect(fetchList({ pageNum: 1 })).rejects.toThrow('Request timeout')
    })

    it('應該處理服務器內部錯誤 2025', async () => {
      const serverError = { code: 500, message: '服務器內部錯誤' }
      request.mockResolvedValue(serverError)

      const result = await fetchList({ pageNum: 1 })

      expect(result.code).toBe(500)
      expect(result.message).toBe('服務器內部錯誤')
    })

    it('應該處理無權限訪問錯誤 2025', async () => {
      const unauthorizedError = { code: 401, message: '未授權訪問' }
      request.mockResolvedValue(unauthorizedError)

      const result = await getHomeAdvertise(1)

      expect(result.code).toBe(401)
      expect(result.message).toBe('未授權訪問')
    })

    it('應該處理參數為null的情況 2025', async () => {
      const mockResponse = { code: 200, data: { list: [] } }
      request.mockResolvedValue(mockResponse)

      await fetchList(null)

      expect(request).toHaveBeenCalledWith({
        url: '/home/advertise/list',
        method: 'get',
        params: null
      })
    })

    it('應該處理大量數據請求 2025', async () => {
      const mockResponse = {
        code: 200,
        data: {
          list: new Array(1000).fill().map((_, index) => ({
            id: index + 1,
            name: `廣告${index + 1}`,
            status: index % 2
          })),
          total: 1000
        }
      }
      request.mockResolvedValue(mockResponse)

      const largePageParams = { pageNum: 1, pageSize: 1000 }
      const result = await fetchList(largePageParams)

      expect(result.data.list).toHaveLength(1000)
      expect(result.data.total).toBe(1000)
    })
  })

  describe('API調用性能和並發測試 2025', () => {
    it('應該支持並發API調用 2025', async () => {
      const mockResponse1 = { code: 200, data: { id: 1, name: '廣告1' } }
      const mockResponse2 = { code: 200, data: { id: 2, name: '廣告2' } }
      const mockResponse3 = { code: 200, data: { id: 3, name: '廣告3' } }

      request
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2)
        .mockResolvedValueOnce(mockResponse3)

      const promises = [
        getHomeAdvertise(1),
        getHomeAdvertise(2),
        getHomeAdvertise(3)
      ]

      const results = await Promise.all(promises)

      expect(results).toHaveLength(3)
      expect(results[0].data.name).toBe('廣告1')
      expect(results[1].data.name).toBe('廣告2')
      expect(results[2].data.name).toBe('廣告3')
      expect(request).toHaveBeenCalledTimes(3)
    })

    it('應該正確處理混合API操作 2025', async () => {
      const listResponse = { code: 200, data: { list: [], total: 0 } }
      const createResponse = { code: 200, message: '創建成功', data: { id: 100 } }
      const updateResponse = { code: 200, message: '更新成功' }

      request
        .mockResolvedValueOnce(listResponse)
        .mockResolvedValueOnce(createResponse)
        .mockResolvedValueOnce(updateResponse)

      // 模擬複雜的業務流程：列表查詢 -> 創建 -> 更新 2025
      const listResult = await fetchList({ pageNum: 1 })
      const createResult = await createHomeAdvertise({ name: '新廣告' })
      const updateResult = await updateHomeAdvertise(createResult.data.id, { status: 1 })

      expect(listResult.code).toBe(200)
      expect(createResult.data.id).toBe(100)
      expect(updateResult.message).toBe('更新成功')
    })
  })
})