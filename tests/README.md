# 首頁廣告API單元測試文檔 2025

## 概述

本測試套件為 `homeAdvertise.js` API模塊提供全面的單元測試覆蓋，包含所有廣告管理相關的API函數測試。

## 測試覆蓋範圍

### 主要測試功能

1. **fetchList** - 廣告列表獲取
   - 正常參數查詢測試 2025
   - 空參數處理測試 2025
   - 無參數調用測試 2025

2. **updateStatus** - 廣告狀態更新
   - 正常狀態更新測試 2025
   - 不同ID和參數組合測試 2025
   - 錯誤響應處理測試 2025

3. **deleteHomeAdvertise** - 廣告刪除
   - 批量刪除測試 2025
   - 單個刪除測試 2025
   - 刪除失敗處理測試 2025

4. **createHomeAdvertise** - 廣告創建
   - 完整數據創建測試 2025
   - 必填字段驗證測試 2025
   - 錯誤響應處理測試 2025

5. **getHomeAdvertise** - 獲取廣告詳情
   - 正常詳情獲取測試 2025
   - 不存在廣告處理測試 2025
   - 不同ID類型支持測試 2025

6. **updateHomeAdvertise** - 廣告信息更新
   - 完整更新測試 2025
   - 部分字段更新測試 2025
   - 更新失敗處理測試 2025
   - 網路錯誤處理測試 2025

### 邊界情況和錯誤處理測試

- 請求超時錯誤處理 2025
- 服務器內部錯誤處理 2025
- 無權限訪問錯誤處理 2025
- null參數處理 2025
- 大量數據請求處理 2025

### 性能和並發測試

- 並發API調用測試 2025
- 混合API操作流程測試 2025

## 運行測試

### 前置要求

確保已安裝以下依賴包：

```bash
npm install --save-dev jest @vue/test-utils vue-jest babel-jest jest-environment-jsdom
```

### 測試命令

```bash
# 運行所有測試 2025
npm run test

# 監視模式運行測試 2025
npm run test:watch

# 運行測試並生成覆蓋率報告 2025
npm run test:coverage

# 運行特定測試文件 2025
npm test homeAdvertise.spec.js
```

## 測試配置

### Jest配置文件

- `jest.config.js` - 主要Jest配置 2025
- `tests/setup.js` - 測試環境設置 2025

### 模塊映射

測試中使用 `@/` 別名來引用 `src/` 目錄下的模塊，與項目配置保持一致。

## 測試結構

```
tests/
├── setup.js              # 全域測試設置 2025
├── unit/
│   └── homeAdvertise.spec.js  # 廣告API測試 2025
└── README.md             # 測試文檔 2025
```

## 重要測試特點

1. **完整的Mock機制** - 使用Jest mock完全隔離外部依賴 2025
2. **繁體中文注釋** - 所有測試均使用繁體中文注釋說明 2025
3. **時間標記** - 每個注釋末尾添加2025年份標記 2025
4. **全面覆蓋** - 覆蓋所有API函數和邊界情況 2025
5. **錯誤處理** - 詳細測試各種錯誤場景 2025

## 測試數據示例

測試中使用的模擬數據結構：

```javascript
{
  id: 1,
  name: '測試廣告',
  type: 1,
  pic: 'http://example.com/ad.jpg',
  startTime: '2025-01-01',
  endTime: '2025-12-31',
  status: 1,
  url: 'http://example.com/landing',
  note: '測試廣告說明',
  sort: 100
}
```

## 注意事項

1. 測試前確保已正確配置Jest環境 2025
2. 測試中的所有API調用都被mock，不會發送真實請求 2025
3. 測試覆蓋了所有主要業務場景和異常情況 2025
4. 建議在代碼變更後運行完整測試套件確保功能正常 2025