/**
 * 商品性能分析演示数据
 */

// 生成随机数
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// 生成随机日期
const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// 格式化日期
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// 生成最近30天的日期序列
const generateDateRange = (days = 30) => {
  const dates = [];
  const endDate = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(endDate);
    date.setDate(date.getDate() - i);
    dates.push(formatDate(date));
  }
  return dates;
};

// 商品分类数据
export const mockCategories = [
  {
    id: 1,
    name: '电子产品',
    parentId: 0,
    productCount: 156,
    children: [
      { id: 11, name: '手机通讯', parentId: 1, productCount: 45 },
      { id: 12, name: '电脑办公', parentId: 1, productCount: 38 },
      { id: 13, name: '数码配件', parentId: 1, productCount: 28 },
      { id: 14, name: '智能设备', parentId: 1, productCount: 45 }
    ]
  },
  {
    id: 2,
    name: '服装配饰',
    parentId: 0,
    productCount: 234,
    children: [
      { id: 21, name: '男装', parentId: 2, productCount: 89 },
      { id: 22, name: '女装', parentId: 2, productCount: 102 },
      { id: 23, name: '童装', parentId: 2, productCount: 43 }
    ]
  },
  {
    id: 3,
    name: '家居生活',
    parentId: 0,
    productCount: 187,
    children: [
      { id: 31, name: '家具', parentId: 3, productCount: 67 },
      { id: 32, name: '家纺', parentId: 3, productCount: 54 },
      { id: 33, name: '厨具', parentId: 3, productCount: 66 }
    ]
  },
  {
    id: 4,
    name: '美妆护肤',
    parentId: 0,
    productCount: 98,
    children: [
      { id: 41, name: '护肤品', parentId: 4, productCount: 45 },
      { id: 42, name: '彩妆', parentId: 4, productCount: 32 },
      { id: 43, name: '个护清洁', parentId: 4, productCount: 21 }
    ]
  },
  {
    id: 5,
    name: '运动户外',
    parentId: 0,
    productCount: 123,
    children: [
      { id: 51, name: '运动鞋服', parentId: 5, productCount: 67 },
      { id: 52, name: '健身器材', parentId: 5, productCount: 34 },
      { id: 53, name: '户外用品', parentId: 5, productCount: 22 }
    ]
  }
];

// 品牌数据
export const mockBrands = [
  { id: 1, name: 'Apple', logo: '', productCount: 45, firstLetter: 'A' },
  { id: 2, name: '华为', logo: '', productCount: 56, firstLetter: 'H' },
  { id: 3, name: '小米', logo: '', productCount: 67, firstLetter: 'X' },
  { id: 4, name: 'Nike', logo: '', productCount: 34, firstLetter: 'N' },
  { id: 5, name: 'Adidas', logo: '', productCount: 29, firstLetter: 'A' },
  { id: 6, name: '优衣库', logo: '', productCount: 78, firstLetter: 'Y' },
  { id: 7, name: 'ZARA', logo: '', productCount: 45, firstLetter: 'Z' },
  { id: 8, name: '海尔', logo: '', productCount: 23, firstLetter: 'H' },
  { id: 9, name: '美的', logo: '', productCount: 34, firstLetter: 'M' },
  { id: 10, name: '格力', logo: '', productCount: 28, firstLetter: 'G' },
  { id: 11, name: 'SK-II', logo: '', productCount: 15, firstLetter: 'S' },
  { id: 12, name: '兰蔻', logo: '', productCount: 18, firstLetter: 'L' },
  { id: 13, name: '雅诗兰黛', logo: '', productCount: 22, firstLetter: 'Y' },
  { id: 14, name: 'IKEA', logo: '', productCount: 89, firstLetter: 'I' },
  { id: 15, name: '宜家', logo: '', productCount: 76, firstLetter: 'Y' }
];

// 生成销售趋势数据
export const generateSalesTrendData = (days = 30) => {
  const dates = generateDateRange(days);
  return dates.map(date => ({
    date,
    sales: random(80000, 350000), // 销售额
    quantity: random(800, 2500), // 销售数量
    orders: random(200, 800) // 订单数量
  }));
};

// 生成商品排行数据
export const generateProductRankingData = () => {
  const products = [
    { id: 1, productName: 'iPhone 15 Pro Max', categoryName: '手机通讯', brandName: 'Apple', productSku: 'IP15PM-001', productImage: '' },
    { id: 2, productName: '华为Mate 60 Pro', categoryName: '手机通讯', brandName: '华为', productSku: 'HWM60P-001', productImage: '' },
    { id: 3, productName: '小米14 Ultra', categoryName: '手机通讯', brandName: '小米', productSku: 'XM14U-001', productImage: '' },
    { id: 4, productName: 'MacBook Pro M3', categoryName: '电脑办公', brandName: 'Apple', productSku: 'MBP-M3-001', productImage: '' },
    { id: 5, productName: 'Nike Air Jordan 1', categoryName: '运动鞋服', brandName: 'Nike', productSku: 'NAJ1-001', productImage: '' },
    { id: 6, productName: '优衣库羽绒服', categoryName: '男装', brandName: '优衣库', productSku: 'UNIQLO-DOWN-001', productImage: '' },
    { id: 7, productName: 'SK-II神仙水', categoryName: '护肤品', brandName: 'SK-II', productSku: 'SKII-FTE-001', productImage: '' },
    { id: 8, productName: 'IKEA沙发', categoryName: '家具', brandName: 'IKEA', productSku: 'IKEA-SOFA-001', productImage: '' },
    { id: 9, productName: 'Adidas Ultra Boost', categoryName: '运动鞋服', brandName: 'Adidas', productSku: 'AD-UB-001', productImage: '' },
    { id: 10, productName: 'ZARA大衣', categoryName: '女装', brandName: 'ZARA', productSku: 'ZARA-COAT-001', productImage: '' },
    { id: 11, productName: '海尔冰箱', categoryName: '家具', brandName: '海尔', productSku: 'HAIER-REF-001', productImage: '' },
    { id: 12, productName: '兰蔻粉底液', categoryName: '彩妆', brandName: '兰蔻', productSku: 'LANCOME-FDT-001', productImage: '' },
    { id: 13, productName: '美的空调', categoryName: '家具', brandName: '美的', productSku: 'MIDEA-AC-001', productImage: '' },
    { id: 14, productName: '格力空调', categoryName: '家具', brandName: '格力', productSku: 'GREE-AC-001', productImage: '' },
    { id: 15, productName: '雅诗兰黛精华', categoryName: '护肤品', brandName: '雅诗兰黛', productSku: 'EL-SERUM-001', productImage: '' }
  ];

  return products.map(product => ({
    ...product,
    sales: random(50000, 500000), // 销售额
    quantity: random(100, 1500), // 销售数量
    profit: random(10000, 150000), // 利润额
    profitRate: (random(15, 45) / 100), // 利润率
    returnRate: (random(1, 8) / 100) // 退货率
  }));
};

// 生成分类分析数据
export const generateCategoryAnalysisData = () => {
  return mockCategories.map(category => ({
    categoryId: category.id,
    categoryName: category.name,
    sales: random(500000, 2000000), // 销售额
    quantity: random(2000, 8000), // 销售数量
    productCount: category.productCount,
    profitRate: (random(20, 40) / 100) // 利润率
  }));
};

// 生成库存状态数据
export const generateInventoryStatusData = () => {
  const summary = {
    normalStock: random(800, 1200), // 正常库存
    lowStock: random(50, 150), // 库存预警
    outOfStock: random(10, 50), // 库存不足
    overStock: random(30, 80) // 滞销商品
  };

  const details = [];
  const statuses = ['low_stock', 'out_of_stock', 'over_stock'];
  const products = generateProductRankingData().slice(0, 10);

  products.forEach((product, index) => {
    if (index < 7) { // 前7个商品有库存问题
      const status = statuses[index % 3];
      details.push({
        productId: product.id,
        productName: product.productName,
        productSku: product.productSku,
        productImage: product.productImage,
        currentStock: status === 'out_of_stock' ? 0 : random(1, 50),
        safetyStock: random(50, 200),
        status: status,
        lastSaleDate: formatDate(getRandomDate(new Date(2024, 0, 1), new Date()))
      });
    }
  });

  return { summary, details };
};

// 生成性能汇总数据
export const generatePerformanceSummary = () => {
  return {
    totalSales: random(8000000, 15000000), // 总销售额
    totalOrders: random(15000, 35000), // 总订单数
    totalQuantity: random(50000, 120000), // 总销售数量
    avgOrderValue: random(180, 350), // 平均订单价值
    profitMargin: (random(22, 38) / 100), // 毛利率
    returnRate: (random(2, 6) / 100) // 退货率
  };
};

// 生成品牌表现数据
export const generateBrandPerformanceData = () => {
  return mockBrands.slice(0, 8).map(brand => ({
    brandId: brand.id,
    brandName: brand.name,
    sales: random(200000, 1500000), // 销售额
    quantity: random(500, 3000), // 销售数量
    productCount: brand.productCount,
    profitRate: (random(18, 42) / 100) // 利润率
  }));
};

// 模拟API延迟
export const delay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟API响应
export const mockApiResponse = (data, success = true) => {
  return {
    code: success ? 200 : 500,
    message: success ? 'success' : 'error',
    data: data
  };
};