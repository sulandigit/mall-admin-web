#!/usr/bin/env node

'use strict'

/**
 * CSP策略测试和验证工具
 * 用于测试不同环境下的CSP策略生成和验证
 */

const { generateCSPForEnvironment, validatePolicy } = require('./csp-config')

// 颜色输出工具
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`
}

/**
 * 打印CSP策略信息
 * @param {string} env 环境名称
 * @param {Object} result CSP生成结果
 */
function printCSPResult(env, result) {
  console.log(colorize(`\n=== ${env.toUpperCase()} Environment CSP Policy ===`, 'cyan'))
  
  // 打印策略字符串
  console.log(colorize('\nPolicy String:', 'blue'))
  console.log(result.policyString)
  
  // 打印验证结果
  console.log(colorize('\nValidation Result:', 'blue'))
  if (result.validation.isValid) {
    console.log(colorize('✓ Policy is valid', 'green'))
  } else {
    console.log(colorize('✗ Policy has issues:', 'red'))
    result.validation.issues.forEach(issue => {
      console.log(colorize(`  - ${issue}`, 'red'))
    })
  }
  
  // 打印警告
  if (result.validation.warnings.length > 0) {
    console.log(colorize('\nWarnings:', 'yellow'))
    result.validation.warnings.forEach(warning => {
      console.log(colorize(`  ⚠ ${warning}`, 'yellow'))
    })
  }
  
  // 打印详细策略
  console.log(colorize('\nDetailed Policy:', 'blue'))
  Object.entries(result.policy).forEach(([directive, value]) => {
    if (value) {
      console.log(`  ${colorize(directive + ':', 'magenta')} ${value}`)
    }
  })
}

/**
 * 测试所有环境的CSP策略
 */
function testAllEnvironments() {
  const environments = ['development', 'testing', 'production']
  
  console.log(colorize('CSP Policy Generator Test', 'bright'))
  console.log(colorize('================================', 'bright'))
  
  environments.forEach(env => {
    try {
      const result = generateCSPForEnvironment(env)
      printCSPResult(env, result)
    } catch (error) {
      console.log(colorize(`\n=== ${env.toUpperCase()} Environment ===`, 'cyan'))
      console.log(colorize(`✗ Error generating policy: ${error.message}`, 'red'))
    }
  })
}

/**
 * 测试特定配置选项
 */
function testCustomOptions() {
  console.log(colorize('\n\n=== Custom Options Test ===', 'cyan'))
  
  // 测试禁用不安全策略的生产环境
  try {
    console.log(colorize('\nProduction with strict security (no unsafe policies):', 'blue'))
    const strictResult = generateCSPForEnvironment('production', {
      allowUnsafe: false,
      enableReporting: true,
      reportUri: '/api/csp-violations'
    })
    
    console.log('Policy String:')
    console.log(strictResult.policyString)
    
    if (strictResult.validation.warnings.length === 0) {
      console.log(colorize('✓ No security warnings', 'green'))
    } else {
      console.log(colorize('Warnings:', 'yellow'))
      strictResult.validation.warnings.forEach(warning => {
        console.log(colorize(`  ⚠ ${warning}`, 'yellow'))
      })
    }
  } catch (error) {
    console.log(colorize(`✗ Error: ${error.message}`, 'red'))
  }
}

/**
 * 测试策略兼容性
 */
function testCompatibility() {
  console.log(colorize('\n\n=== Browser Compatibility Test ===', 'cyan'))
  
  // 测试不同浏览器的兼容性指令
  const testDirectives = [
    'default-src',
    'script-src', 
    'style-src',
    'img-src',
    'connect-src',
    'font-src',
    'object-src',
    'media-src',
    'frame-src',
    'frame-ancestors',
    'base-uri',
    'form-action',
    'upgrade-insecure-requests'
  ]
  
  const result = generateCSPForEnvironment('production')
  
  console.log(colorize('\nSupported CSP Directives:', 'blue'))
  testDirectives.forEach(directive => {
    if (result.policy[directive] !== undefined) {
      console.log(colorize(`✓ ${directive}`, 'green'))
    } else {
      console.log(colorize(`✗ ${directive} (not configured)`, 'yellow'))
    }
  })
}

/**
 * 性能影响评估
 */
function performanceTest() {
  console.log(colorize('\n\n=== Performance Impact Test ===', 'cyan'))
  
  const iterations = 1000
  const environments = ['development', 'production', 'testing']
  
  environments.forEach(env => {
    const startTime = process.hrtime.bigint()
    
    for (let i = 0; i < iterations; i++) {
      generateCSPForEnvironment(env)
    }
    
    const endTime = process.hrtime.bigint()
    const duration = Number(endTime - startTime) / 1000000 // 转换为毫秒
    const avgTime = duration / iterations
    
    console.log(`${env}: ${iterations} iterations in ${duration.toFixed(2)}ms (avg: ${avgTime.toFixed(4)}ms per generation)`)
  })
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    // 默认运行所有测试
    testAllEnvironments()
    testCustomOptions()
    testCompatibility()
    performanceTest()
  } else {
    const command = args[0]
    
    switch (command) {
      case 'all':
        testAllEnvironments()
        break
      case 'env':
        if (args[1]) {
          const result = generateCSPForEnvironment(args[1])
          printCSPResult(args[1], result)
        } else {
          console.log(colorize('Usage: node csp-test.js env <environment>', 'red'))
        }
        break
      case 'custom':
        testCustomOptions()
        break
      case 'compat':
        testCompatibility()
        break
      case 'perf':
        performanceTest()
        break
      case 'help':
        console.log(colorize('CSP Test Tool Usage:', 'bright'))
        console.log('  node csp-test.js           - Run all tests')
        console.log('  node csp-test.js all       - Test all environments')
        console.log('  node csp-test.js env <env> - Test specific environment')
        console.log('  node csp-test.js custom    - Test custom options')
        console.log('  node csp-test.js compat    - Test browser compatibility')
        console.log('  node csp-test.js perf      - Run performance tests')
        console.log('  node csp-test.js help      - Show this help')
        break
      default:
        console.log(colorize(`Unknown command: ${command}`, 'red'))
        console.log(colorize('Use "node csp-test.js help" for usage information', 'yellow'))
    }
  }
}

// 运行主函数
if (require.main === module) {
  main()
}

module.exports = {
  testAllEnvironments,
  testCustomOptions,
  testCompatibility,
  performanceTest,
  printCSPResult
}