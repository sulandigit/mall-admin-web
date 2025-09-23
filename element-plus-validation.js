/**
 * Element Plus 升级验证脚本
 * 用于验证 Element Plus 组件的基本功能
 */

// 验证适配层是否正常工作
console.log('开始Element Plus升级验证...')

// 验证Vue实例上的适配方法
function validateCompat() {
  const Vue = require('vue')
  const { installElementPlusCompat } = require('./src/utils/element-plus-compat')
  
  // 创建测试Vue实例
  const testVue = new Vue({})
  
  // 安装适配层
  installElementPlusCompat(Vue)
  
  // 验证适配方法是否存在
  const methods = ['$message', '$confirm', '$alert', '$loading', '$notify']
  const missing = methods.filter(method => !Vue.prototype[method])
  
  if (missing.length === 0) {
    console.log('✅ Element Plus适配层验证通过')
    return true
  } else {
    console.log('❌ Element Plus适配层验证失败，缺少方法:', missing)
    return false
  }
}

// 验证依赖包是否正确
function validateDependencies() {
  try {
    const packageJson = require('./package.json')
    const requiredDeps = ['element-plus', '@element-plus/icons-vue']
    const missing = requiredDeps.filter(dep => !packageJson.dependencies[dep])
    
    if (missing.length === 0) {
      console.log('✅ Element Plus依赖包验证通过')
      return true
    } else {
      console.log('❌ Element Plus依赖包验证失败，缺少依赖:', missing)
      return false
    }
  } catch (error) {
    console.log('❌ 无法读取package.json文件')
    return false
  }
}

// 验证样式文件
function validateStyles() {
  const fs = require('fs')
  const path = require('path')
  
  const styleFile = path.join(__dirname, 'src/styles/element-plus.scss')
  
  if (fs.existsSync(styleFile)) {
    console.log('✅ Element Plus样式文件验证通过')
    return true
  } else {
    console.log('❌ Element Plus样式文件不存在')
    return false
  }
}

// 主验证函数
function runValidation() {
  console.log('Element Plus 升级验证报告')
  console.log('================================')
  
  const results = [
    validateDependencies(),
    validateStyles(),
    validateCompat()
  ]
  
  const passedTests = results.filter(Boolean).length
  const totalTests = results.length
  
  console.log('================================')
  console.log(`验证结果: ${passedTests}/${totalTests} 项通过`)
  
  if (passedTests === totalTests) {
    console.log('🎉 Element Plus升级验证全部通过！')
  } else {
    console.log('⚠️  部分验证项未通过，请检查相关配置')
  }
  
  return passedTests === totalTests
}

// 导出验证函数
module.exports = {
  runValidation,
  validateCompat,
  validateDependencies,
  validateStyles
}

// 如果直接运行此脚本
if (require.main === module) {
  runValidation()
}