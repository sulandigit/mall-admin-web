/**
 * 模拟API服务 - 用于演示商品性能分析功能
 */

import {
  mockCategories,
  mockBrands,
  generateSalesTrendData,
  generateProductRankingData,
  generateCategoryAnalysisData,
  generateInventoryStatusData,
  generatePerformanceSummary,
  generateBrandPerformanceData,
  delay,
  mockApiResponse
} from './mockData'

class MockApiService {
  constructor() {
    this.isEnabled = true; // 开关，可以控制是否启用模拟API
  }

  // 启用/禁用模拟API
  enable(enabled = true) {
    this.isEnabled = enabled;
  }

  // 检查是否应该使用模拟API
  shouldUseMock() {
    return this.isEnabled;
  }

  // 获取商品性能汇总数据
  async fetchPerformanceSummary(params) {
    if (!this.shouldUseMock()) return null;
    
    await delay();
    
    const summary = generatePerformanceSummary();
    const trends = generateSalesTrendData(30);
    const topProducts = generateProductRankingData().slice(0, 10);
    const categoryAnalysis = generateCategoryAnalysisData();
    
    return mockApiResponse({
      summary,
      trends,
      topProducts,
      categoryAnalysis
    });
  }

  // 获取商品排行数据
  async fetchProductRanking(params) {
    if (!this.shouldUseMock()) return null;
    
    await delay(600);
    
    let data = generateProductRankingData();
    
    // 根据排序参数排序
    if (params.sortBy) {
      data.sort((a, b) => b[params.sortBy] - a[params.sortBy]);
    }
    
    // 根据限制数量截取
    if (params.limit) {
      data = data.slice(0, params.limit);
    }
    
    return mockApiResponse(data);
  }

  // 获取库存预警数据
  async fetchInventoryStatus(params) {
    if (!this.shouldUseMock()) return null;
    
    await delay(500);
    
    const data = generateInventoryStatusData();
    return mockApiResponse(data);
  }

  // 获取分类分析数据
  async fetchCategoryAnalysis(params) {
    if (!this.shouldUseMock()) return null;
    
    await delay(700);
    
    const data = generateCategoryAnalysisData();
    return mockApiResponse(data);
  }

  // 获取销售趋势数据
  async fetchSalesTrend(params) {
    if (!this.shouldUseMock()) return null;
    
    await delay(800);
    
    let days = 30;
    if (params.groupBy === 'week') days = 28; // 4周
    if (params.groupBy === 'month') days = 90; // 3个月
    
    const data = generateSalesTrendData(days);
    return mockApiResponse({ trends: data });
  }

  // 获取品牌表现数据
  async fetchBrandPerformance(params) {
    if (!this.shouldUseMock()) return null;
    
    await delay(600);
    
    const data = generateBrandPerformanceData();
    return mockApiResponse(data);
  }

  // 获取商品分类列表
  async fetchProductCategories() {
    if (!this.shouldUseMock()) return null;
    
    await delay(300);
    
    return mockApiResponse(mockCategories);
  }

  // 获取品牌列表
  async fetchBrandList() {
    if (!this.shouldUseMock()) return null;
    
    await delay(300);
    
    return mockApiResponse(mockBrands);
  }

  // 导出PDF报告
  async exportPerformanceReport(params) {
    if (!this.shouldUseMock()) return null;
    
    await delay(2000); // 模拟较长的处理时间
    
    // 模拟生成PDF文件的blob数据
    const pdfContent = `商品性能分析报告_${new Date().toLocaleDateString()}.pdf`;
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    
    return { data: blob };
  }

  // 导出Excel报告
  async exportPerformanceExcel(params) {
    if (!this.shouldUseMock()) return null;
    
    await delay(1500); // 模拟处理时间
    
    // 模拟生成Excel文件的blob数据
    const excelContent = `商品性能分析报告_${new Date().toLocaleDateString()}.xlsx`;
    const blob = new Blob([excelContent], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    return { data: blob };
  }

  // 模拟网络错误
  async simulateError(errorType = 'network') {
    await delay(1000);
    
    const errors = {
      network: { code: 500, message: '网络连接失败' },
      timeout: { code: 408, message: '请求超时' },
      unauthorized: { code: 401, message: '未授权访问' },
      notFound: { code: 404, message: '接口不存在' }
    };
    
    throw new Error(errors[errorType]?.message || '未知错误');
  }

  // 生成实时数据更新
  async fetchRealTimeUpdate() {
    if (!this.shouldUseMock()) return null;
    
    await delay(200);
    
    // 模拟实时数据更新
    const updates = {
      totalSales: generatePerformanceSummary().totalSales,
      totalOrders: generatePerformanceSummary().totalOrders,
      timestamp: new Date().toISOString()
    };
    
    return mockApiResponse(updates);
  }
}

// 创建全局实例
const mockApiService = new MockApiService();

// 拦截器 - 在实际API调用前检查是否使用模拟数据
export const setupMockInterceptor = (originalApi) => {
  const mockMethods = {
    fetchPerformanceSummary: mockApiService.fetchPerformanceSummary.bind(mockApiService),
    fetchProductRanking: mockApiService.fetchProductRanking.bind(mockApiService),
    fetchInventoryStatus: mockApiService.fetchInventoryStatus.bind(mockApiService),
    fetchCategoryAnalysis: mockApiService.fetchCategoryAnalysis.bind(mockApiService),
    fetchSalesTrend: mockApiService.fetchSalesTrend.bind(mockApiService),
    fetchBrandPerformance: mockApiService.fetchBrandPerformance.bind(mockApiService),
    fetchProductCategories: mockApiService.fetchProductCategories.bind(mockApiService),
    fetchBrandList: mockApiService.fetchBrandList.bind(mockApiService),
    exportPerformanceReport: mockApiService.exportPerformanceReport.bind(mockApiService),
    exportPerformanceExcel: mockApiService.exportPerformanceExcel.bind(mockApiService)
  };

  // 创建代理对象
  return new Proxy(originalApi, {
    get(target, prop) {
      if (mockMethods[prop] && mockApiService.shouldUseMock()) {
        return mockMethods[prop];
      }
      return target[prop];
    }
  });
};

export default mockApiService;