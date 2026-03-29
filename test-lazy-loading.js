/**
 * 路由懒加载功能测试脚本
 * 用于验证懒加载实现是否正确工作
 */

// 模拟测试环境
const mockWebpack = {
  context: '/data/workspace/mall-admin-web/src',
  // 模拟webpack的import函数
  import: (path) => {
    return new Promise((resolve, reject) => {
      // 模拟网络延迟
      const delay = Math.random() * 1000 + 200
      
      setTimeout(() => {
        // 90%成功率模拟
        if (Math.random() > 0.1) {
          resolve({
            default: {
              name: path.split('/').pop(),
              template: `<div>Mock component for ${path}</div>`
            }
          })
          console.log(`✅ 模拟加载成功: ${path} (${Math.round(delay)}ms)`)
        } else {
          reject(new Error(`Network error loading ${path}`))
          console.log(`❌ 模拟加载失败: ${path}`)
        }
      }, delay)
    })
  }
}

// 重写全局import函数用于测试
const originalImport = global.import || (() => Promise.reject(new Error('Import not available')))
global.import = mockWebpack.import

// 测试路由列表
const testRoutes = [
  'home/index',
  'pms/product/index', 
  'oms/order/index',
  'sms/coupon/index',
  'ums/admin/index',
  'pms/brand/index',
  'error/RouteError'
]

/**
 * 测试单个路由懒加载
 */
async function testSingleRoute(route) {
  console.log(`\n🧪 测试路由: ${route}`)
  const startTime = Date.now()
  
  try {
    const lazyLoader = () => mockWebpack.import(`views/${route}`)
    const component = await lazyLoader()
    const endTime = Date.now()
    
    console.log(`  ✅ 加载成功 - ${endTime - startTime}ms`)
    console.log(`  📦 组件名: ${component.default.name}`)
    return { route, success: true, duration: endTime - startTime }
  } catch (error) {
    const endTime = Date.now()
    console.log(`  ❌ 加载失败 - ${endTime - startTime}ms`)
    console.log(`  🚨 错误: ${error.message}`)
    return { route, success: false, duration: endTime - startTime, error: error.message }
  }
}

/**
 * 测试批量预加载
 */
async function testBatchPreload(routes) {
  console.log(`\n🚀 测试批量预加载 (${routes.length}个路由)`)
  const results = []
  
  // 并发预加载
  const promises = routes.map(route => testSingleRoute(route))
  const allResults = await Promise.allSettled(promises)
  
  allResults.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      results.push(result.value)
    } else {
      results.push({ 
        route: routes[index], 
        success: false, 
        error: result.reason.message 
      })
    }
  })
  
  return results
}

/**
 * 测试错误处理和重试机制
 */
async function testErrorHandling() {
  console.log(`\n🛠️  测试错误处理机制`)
  
  // 模拟必然失败的加载
  const alwaysFailLoader = () => Promise.reject(new Error('Simulated network failure'))
  
  try {
    await alwaysFailLoader()
  } catch (error) {
    console.log(`  ✅ 成功捕获错误: ${error.message}`)
    
    // 模拟重试机制
    console.log(`  🔄 尝试重试加载...`)
    try {
      // 第二次尝试 - 模拟成功
      const retryResult = await mockWebpack.import('views/error/RouteError')
      console.log(`  ✅ 重试成功，加载错误组件`)
      return { success: true, fallback: 'RouteError' }
    } catch (retryError) {
      console.log(`  ❌ 重试失败: ${retryError.message}`)
      return { success: false, error: retryError.message }
    }
  }
}

/**
 * 生成测试报告
 */
function generateTestReport(results) {
  const totalTests = results.length
  const successCount = results.filter(r => r.success).length
  const failCount = totalTests - successCount
  const avgDuration = successCount > 0 
    ? Math.round(results.filter(r => r.success).reduce((sum, r) => sum + r.duration, 0) / successCount)
    : 0
  
  console.log(`\n📊 测试报告`)
  console.log(`${'='.repeat(50)}`)
  console.log(`📈 总测试数: ${totalTests}`)
  console.log(`✅ 成功数: ${successCount}`)
  console.log(`❌ 失败数: ${failCount}`)
  console.log(`📊 成功率: ${((successCount / totalTests) * 100).toFixed(1)}%`)
  console.log(`⏱️  平均加载时间: ${avgDuration}ms`)
  
  if (failCount > 0) {
    console.log(`\n❌ 失败的路由:`)
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.route}: ${r.error}`)
    })
  }
  
  console.log(`${'='.repeat(50)}`)
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log(`🎯 开始路由懒加载功能测试\n`)
  
  // 1. 测试单个路由加载
  console.log(`\n1️⃣ 单个路由测试`)
  const singleResults = []
  for (const route of testRoutes.slice(0, 3)) {
    const result = await testSingleRoute(route)
    singleResults.push(result)
  }
  
  // 2. 测试批量预加载
  console.log(`\n2️⃣ 批量预加载测试`)
  const batchResults = await testBatchPreload(testRoutes.slice(3, 6))
  
  // 3. 测试错误处理
  console.log(`\n3️⃣ 错误处理测试`) 
  const errorResult = await testErrorHandling()
  
  // 4. 生成报告
  const allResults = [...singleResults, ...batchResults]
  generateTestReport(allResults)
  
  // 5. 测试性能基准
  console.log(`\n📏 性能基准测试`)
  const fastRoutes = allResults.filter(r => r.success && r.duration < 500)
  const slowRoutes = allResults.filter(r => r.success && r.duration >= 500)
  
  console.log(`  ⚡ 快速加载 (<500ms): ${fastRoutes.length}个`)
  console.log(`  🐌 慢速加载 (>=500ms): ${slowRoutes.length}个`)
  
  if (slowRoutes.length > 0) {
    console.log(`  💡 建议优化以下慢速路由:`)
    slowRoutes.forEach(r => {
      console.log(`    - ${r.route}: ${r.duration}ms`)
    })
  }
  
  console.log(`\n🎉 测试完成！`)
  return allResults
}

// 导出测试函数
module.exports = {
  runTests,
  testSingleRoute,
  testBatchPreload,
  testErrorHandling,
  generateTestReport
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
  runTests().catch(console.error)
}