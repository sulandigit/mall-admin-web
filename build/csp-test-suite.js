#!/usr/bin/env node

'use strict'

/**
 * CSP测试套件
 * 完整的CSP策略验证、测试和分析工具
 */

const fs = require('fs')
const path = require('path')
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
 * CSP测试套件类
 */
class CSPTestSuite {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: []
    }
  }

  /**
   * 运行测试
   * @param {string} testName 测试名称
   * @param {Function} testFunction 测试函数
   */
  async runTest(testName, testFunction) {
    try {
      console.log(colorize(`\n▶ Running: ${testName}`, 'blue'))
      
      const result = await testFunction()
      
      if (result.success) {
        console.log(colorize(`✓ ${testName}`, 'green'))
        this.testResults.passed++
      } else {
        console.log(colorize(`✗ ${testName}`, 'red'))
        if (result.error) {
          console.log(colorize(`  Error: ${result.error}`, 'red'))
        }
        this.testResults.failed++
      }
      
      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach(warning => {
          console.log(colorize(`  ⚠ ${warning}`, 'yellow'))
        })
        this.testResults.warnings += result.warnings.length
      }
      
      this.testResults.tests.push({
        name: testName,
        success: result.success,
        error: result.error,
        warnings: result.warnings || []
      })
      
    } catch (error) {
      console.log(colorize(`✗ ${testName}`, 'red'))
      console.log(colorize(`  Exception: ${error.message}`, 'red'))
      this.testResults.failed++
      
      this.testResults.tests.push({
        name: testName,
        success: false,
        error: error.message,
        warnings: []
      })
    }
  }

  /**
   * 测试基本策略生成
   */
  async testBasicPolicyGeneration() {
    return this.runTest('Basic Policy Generation', () => {
      const environments = ['development', 'production', 'testing']
      const warnings = []
      
      for (const env of environments) {
        const result = generateCSPForEnvironment(env)
        
        if (!result.policy) {
          return { success: false, error: `No policy generated for ${env}` }
        }
        
        if (!result.policyString) {
          return { success: false, error: `No policy string generated for ${env}` }
        }
        
        if (result.validation.warnings.length > 0) {
          warnings.push(`${env}: ${result.validation.warnings.join(', ')}`)
        }
      }
      
      return { success: true, warnings }
    })
  }

  /**
   * 测试策略验证
   */
  async testPolicyValidation() {
    return this.runTest('Policy Validation', () => {
      const environments = ['development', 'production', 'testing']
      
      for (const env of environments) {
        const result = generateCSPForEnvironment(env)
        
        if (!result.validation.isValid) {
          return {
            success: false,
            error: `${env} policy validation failed: ${result.validation.issues.join(', ')}`
          }
        }
      }
      
      return { success: true }
    })
  }

  /**
   * 测试必需指令
   */
  async testRequiredDirectives() {
    return this.runTest('Required Directives', () => {
      const requiredDirectives = [
        'default-src',
        'script-src',
        'style-src',
        'img-src',
        'connect-src',
        'font-src'
      ]
      
      const environments = ['development', 'production', 'testing']
      const warnings = []
      
      for (const env of environments) {
        const result = generateCSPForEnvironment(env)
        
        for (const directive of requiredDirectives) {
          if (!result.policy[directive]) {
            return {
              success: false,
              error: `Missing required directive '${directive}' in ${env} environment`
            }
          }
        }
        
        // 检查安全性指令
        const securityDirectives = ['object-src', 'base-uri', 'form-action']
        for (const directive of securityDirectives) {
          if (!result.policy[directive]) {
            warnings.push(`${env}: Missing security directive '${directive}'`)
          }
        }
      }
      
      return { success: true, warnings }
    })
  }

  /**
   * 测试策略字符串格式
   */
  async testPolicyStringFormat() {
    return this.runTest('Policy String Format', () => {
      const environments = ['development', 'production', 'testing']
      
      for (const env of environments) {
        const result = generateCSPForEnvironment(env)
        const policyString = result.policyString
        
        // 检查基本格式
        if (!policyString.includes('default-src')) {
          return {
            success: false,
            error: `${env} policy string missing default-src directive`
          }
        }
        
        // 检查指令分隔符
        if (!policyString.includes(';')) {
          return {
            success: false,
            error: `${env} policy string missing directive separators`
          }
        }
        
        // 检查长度合理性
        if (policyString.length < 50) {
          return {
            success: false,
            error: `${env} policy string too short (${policyString.length} chars)`
          }
        }
        
        if (policyString.length > 2000) {
          return {
            success: false,
            error: `${env} policy string too long (${policyString.length} chars)`
          }
        }
      }
      
      return { success: true }
    })
  }

  /**
   * 测试浏览器兼容性
   */
  async testBrowserCompatibility() {
    return this.runTest('Browser Compatibility', () => {
      const result = generateCSPForEnvironment('production')
      const policy = result.policy
      const warnings = []
      
      // CSP 1.0 指令（广泛支持）
      const csp1Directives = [
        'default-src', 'script-src', 'style-src', 'img-src',
        'connect-src', 'font-src', 'object-src', 'media-src'
      ]
      
      // CSP 2.0 指令（现代浏览器支持）
      const csp2Directives = [
        'base-uri', 'form-action', 'frame-ancestors'
      ]
      
      // CSP 3.0 指令（最新浏览器支持）
      const csp3Directives = [
        'worker-src', 'manifest-src'
      ]
      
      // 检查使用的指令
      Object.keys(policy).forEach(directive => {
        if (csp3Directives.includes(directive)) {
          warnings.push(`Using CSP 3.0 directive '${directive}' - may not be supported in older browsers`)
        } else if (csp2Directives.includes(directive)) {
          warnings.push(`Using CSP 2.0 directive '${directive}' - ensure target browsers support it`)
        }
      })
      
      return { success: true, warnings }
    })
  }

  /**
   * 测试安全性配置
   */
  async testSecurityConfiguration() {
    return this.runTest('Security Configuration', () => {
      const result = generateCSPForEnvironment('production')
      const policy = result.policy
      const warnings = []
      
      // 检查危险的配置
      Object.entries(policy).forEach(([directive, value]) => {
        if (typeof value === 'string') {
          if (value.includes("'unsafe-inline'")) {
            warnings.push(`Directive '${directive}' allows unsafe-inline - consider using nonces or hashes`)
          }
          
          if (value.includes("'unsafe-eval'")) {
            warnings.push(`Directive '${directive}' allows unsafe-eval - high security risk`)
          }
          
          if (value.includes('*')) {
            warnings.push(`Directive '${directive}' uses wildcard - consider more specific sources`)
          }
          
          if (value.includes('data:') && directive === 'script-src') {
            warnings.push(`Script-src allows data: URLs - potential XSS risk`)
          }
        }
      })
      
      // 检查object-src策略
      if (policy['object-src'] !== "'none'") {
        warnings.push("object-src should be set to 'none' for better security")
      }
      
      return { success: true, warnings }
    })
  }

  /**
   * 测试HTML模板集成
   */
  async testHTMLTemplateIntegration() {
    return this.runTest('HTML Template Integration', () => {
      const htmlTemplatePath = path.join(__dirname, '../index.html')
      
      if (!fs.existsSync(htmlTemplatePath)) {
        return {
          success: false,
          error: 'HTML template not found'
        }
      }
      
      const htmlContent = fs.readFileSync(htmlTemplatePath, 'utf8')
      const warnings = []
      
      // 检查现有CSP meta标签
      const cspMetaRegex = /<meta[^>]*http-equiv=['"](Content-Security-Policy|Content-Security-Policy-Report-Only)['"]/i
      if (cspMetaRegex.test(htmlContent)) {
        warnings.push('HTML template already contains CSP meta tag - may conflict with webpack plugin')
      }
      
      // 检查内联脚本
      const inlineScriptRegex = /<script[^>]*>[\s\S]*?<\/script>/g
      const inlineScripts = htmlContent.match(inlineScriptRegex)
      if (inlineScripts && inlineScripts.length > 0) {
        warnings.push(`Found ${inlineScripts.length} inline script(s) - may require 'unsafe-inline' or nonces`)
      }
      
      // 检查内联样式
      const inlineStyleRegex = /<style[^>]*>[\s\S]*?<\/style>/g
      const inlineStyles = htmlContent.match(inlineStyleRegex)
      if (inlineStyles && inlineStyles.length > 0) {
        warnings.push(`Found ${inlineStyles.length} inline style(s) - may require 'unsafe-inline' or nonces`)
      }
      
      // 检查外部资源
      const externalScriptRegex = /<script[^>]*src=['"](https?:\/\/[^'"]*)['"]/g
      const externalScripts = [...htmlContent.matchAll(externalScriptRegex)]
      if (externalScripts.length > 0) {
        warnings.push(`Found ${externalScripts.length} external script(s) - ensure domains are whitelisted in CSP`)
      }
      
      return { success: true, warnings }
    })
  }

  /**
   * 测试性能影响
   */
  async testPerformanceImpact() {
    return this.runTest('Performance Impact', () => {
      const iterations = 1000
      const startTime = process.hrtime.bigint()
      
      for (let i = 0; i < iterations; i++) {
        generateCSPForEnvironment('production')
      }
      
      const endTime = process.hrtime.bigint()
      const totalTime = Number(endTime - startTime) / 1000000 // 毫秒
      const avgTime = totalTime / iterations
      
      const warnings = []
      
      if (avgTime > 10) {
        warnings.push(`CSP generation is slow: ${avgTime.toFixed(2)}ms per call`)
      }
      
      if (totalTime > 5000) {
        warnings.push(`Total generation time for ${iterations} iterations: ${totalTime.toFixed(2)}ms`)
      }
      
      return { success: true, warnings }
    })
  }

  /**
   * 测试错误处理
   */
  async testErrorHandling() {
    return this.runTest('Error Handling', () => {
      const warnings = []
      
      // 测试无效环境
      try {
        generateCSPForEnvironment('invalid-environment')
        return {
          success: false,
          error: 'Should throw error for invalid environment'
        }
      } catch (error) {
        if (!error.message.includes('Unsupported environment')) {
          warnings.push('Error message not descriptive enough')
        }
      }
      
      // 测试无效策略
      try {
        const invalidPolicy = {}
        const validation = validatePolicy(invalidPolicy)
        if (validation.isValid) {
          return {
            success: false,
            error: 'Should fail validation for empty policy'
          }
        }
      } catch (error) {
        warnings.push(`Validation threw exception: ${error.message}`)
      }
      
      return { success: true, warnings }
    })
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log(colorize('=== CSP Test Suite ===', 'cyan'))
    console.log(colorize('Running comprehensive CSP tests...', 'blue'))
    
    await this.testBasicPolicyGeneration()
    await this.testPolicyValidation()
    await this.testRequiredDirectives()
    await this.testPolicyStringFormat()
    await this.testBrowserCompatibility()
    await this.testSecurityConfiguration()
    await this.testHTMLTemplateIntegration()
    await this.testPerformanceImpact()
    await this.testErrorHandling()
    
    this.printSummary()
  }

  /**
   * 打印测试总结
   */
  printSummary() {
    console.log(colorize('\n=== Test Summary ===', 'cyan'))
    console.log(`${colorize('✓', 'green')} Passed: ${colorize(this.testResults.passed, 'green')}`)
    console.log(`${colorize('✗', 'red')} Failed: ${colorize(this.testResults.failed, 'red')}`)
    console.log(`${colorize('⚠', 'yellow')} Warnings: ${colorize(this.testResults.warnings, 'yellow')}`)
    
    if (this.testResults.failed > 0) {
      console.log(colorize('\nFailed tests:', 'red'))
      this.testResults.tests
        .filter(test => !test.success)
        .forEach(test => {
          console.log(colorize(`  - ${test.name}: ${test.error}`, 'red'))
        })
    }
    
    const warningTests = this.testResults.tests.filter(test => test.warnings.length > 0)
    if (warningTests.length > 0) {
      console.log(colorize('\nTests with warnings:', 'yellow'))
      warningTests.forEach(test => {
        console.log(colorize(`  - ${test.name}:`, 'yellow'))
        test.warnings.forEach(warning => {
          console.log(colorize(`    ${warning}`, 'yellow'))
        })
      })
    }
    
    const overallSuccess = this.testResults.failed === 0
    console.log(colorize(
      `\n${overallSuccess ? '✅' : '❌'} Overall: ${overallSuccess ? 'PASS' : 'FAIL'}`,
      overallSuccess ? 'green' : 'red'
    ))
    
    if (!overallSuccess) {
      process.exit(1)
    }
  }

  /**
   * 生成测试报告
   */
  generateReport() {
    const reportPath = path.join(__dirname, '../test-reports/csp-test-report.json')
    const reportDir = path.dirname(reportPath)
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        passed: this.testResults.passed,
        failed: this.testResults.failed,
        warnings: this.testResults.warnings,
        total: this.testResults.tests.length
      },
      tests: this.testResults.tests
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(colorize(`\nTest report saved to: ${reportPath}`, 'blue'))
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2)
  const testSuite = new CSPTestSuite()
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(colorize('CSP Test Suite Usage:', 'bright'))
    console.log('  node csp-test-suite.js [options]')
    console.log('\nOptions:')
    console.log('  --report, -r    Generate test report')
    console.log('  --help, -h      Show this help')
    return
  }
  
  await testSuite.runAllTests()
  
  if (args.includes('--report') || args.includes('-r')) {
    testSuite.generateReport()
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error(colorize(`\nUnexpected error: ${error.message}`, 'red'))
    process.exit(1)
  })
}

module.exports = { CSPTestSuite }