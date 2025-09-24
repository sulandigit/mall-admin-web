#!/usr/bin/env node

'use strict'

/**
 * CSP增强构建脚本
 * 在标准构建过程中集成CSP策略验证和测试
 */

require('./check-versions')()

process.env.NODE_ENV = 'production'

const ora = require('ora')
const rm = require('rimraf')
const path = require('path')
const chalk = require('chalk')
const webpack = require('webpack')
const config = require('../config')
const webpackConfig = require('./webpack.prod.conf')

// CSP相关模块
const { generateCSPForEnvironment, validatePolicy } = require('./csp-config')
const { CSPReportServer } = require('./csp-report-server')

/**
 * CSP策略验证和构建集成
 */
class CSPBuildIntegration {
  constructor() {
    this.spinner = ora('building for production with CSP integration...')
    this.cspResults = {}
  }

  /**
   * 验证CSP策略
   */
  validateCSPPolicies() {
    console.log(chalk.cyan('\\n=== CSP Policy Validation ==='))
    
    const environments = ['development', 'production', 'testing']
    let hasErrors = false

    environments.forEach(env => {
      try {
        console.log(chalk.blue(`\\nValidating ${env} environment...`))
        
        const result = generateCSPForEnvironment(env)
        this.cspResults[env] = result

        if (result.validation.isValid) {
          console.log(chalk.green(`✓ ${env} CSP policy is valid`))
        } else {
          console.log(chalk.red(`✗ ${env} CSP policy has issues:`))
          result.validation.issues.forEach(issue => {
            console.log(chalk.red(`  - ${issue}`))
          })
          hasErrors = true
        }

        if (result.validation.warnings.length > 0) {
          console.log(chalk.yellow(`⚠ ${env} CSP policy warnings:`))
          result.validation.warnings.forEach(warning => {
            console.log(chalk.yellow(`  - ${warning}`))
          })
        }

        // 输出策略摘要
        console.log(chalk.gray(`  Policy length: ${result.policyString.length} characters`))
        console.log(chalk.gray(`  Directives: ${Object.keys(result.policy).length}`))
        
      } catch (error) {
        console.log(chalk.red(`✗ Error validating ${env}: ${error.message}`))
        hasErrors = true
      }
    })

    if (hasErrors) {
      console.log(chalk.red('\\n❌ CSP validation failed. Please fix the issues before building.'))
      process.exit(1)
    } else {
      console.log(chalk.green('\\n✅ All CSP policies are valid'))
    }
  }

  /**
   * 生成CSP报告
   */
  generateCSPReport() {
    console.log(chalk.cyan('\\n=== Generating CSP Report ==='))
    
    const reportPath = path.join(__dirname, '../dist/csp-report.json')
    const report = {
      generatedAt: new Date().toISOString(),
      buildEnvironment: process.env.NODE_ENV,
      policies: {}
    }

    Object.entries(this.cspResults).forEach(([env, result]) => {
      report.policies[env] = {
        policy: result.policy,
        policyString: result.policyString,
        validation: result.validation,
        stats: {
          directiveCount: Object.keys(result.policy).length,
          policyLength: result.policyString.length,
          hasUnsafeInline: result.policyString.includes(\"'unsafe-inline'\"),
          hasUnsafeEval: result.policyString.includes(\"'unsafe-eval'\")
        }
      }
    })

    try {
      require('fs').writeFileSync(reportPath, JSON.stringify(report, null, 2))
      console.log(chalk.green(`✓ CSP report generated: ${reportPath}`))
    } catch (error) {
      console.log(chalk.yellow(`⚠ Could not write CSP report: ${error.message}`))
    }
  }

  /**
   * 检查资源依赖
   */
  checkResourceDependencies() {
    console.log(chalk.cyan('\\n=== Checking Resource Dependencies ==='))
    
    // 检查HTML模板中的外部资源
    const htmlTemplate = path.join(__dirname, '../index.html')
    
    try {
      const fs = require('fs')
      const htmlContent = fs.readFileSync(htmlTemplate, 'utf8')
      
      // 检查外部脚本
      const scriptMatches = htmlContent.match(/<script[^>]*src=[\"']([^\"']*)[\"'][^>]*>/g)
      if (scriptMatches) {
        console.log(chalk.blue('External scripts found:'))
        scriptMatches.forEach(match => {
          const src = match.match(/src=[\"']([^\"']*)[\"']/)[1]
          if (src.startsWith('http') || src.startsWith('//')) {
            console.log(chalk.yellow(`  - ${src}`))
          }
        })
      }

      // 检查内联脚本
      const inlineScripts = htmlContent.match(/<script[^>]*>([\\s\\S]*?)<\\/script>/g)
      if (inlineScripts) {
        console.log(chalk.blue(`Inline scripts found: ${inlineScripts.length}`))
        if (inlineScripts.length > 0) {
          console.log(chalk.yellow('  ⚠ Inline scripts may require \\'unsafe-inline\\' directive'))
        }
      }

      // 检查外部样式
      const linkMatches = htmlContent.match(/<link[^>]*href=[\"']([^\"']*)[\"'][^>]*>/g)
      if (linkMatches) {
        console.log(chalk.blue('External stylesheets found:'))
        linkMatches.forEach(match => {
          const href = match.match(/href=[\"']([^\"']*)[\"']/)[1]
          if (href.startsWith('http') || href.startsWith('//')) {
            console.log(chalk.yellow(`  - ${href}`))
          }
        })
      }

    } catch (error) {
      console.log(chalk.red(`✗ Error checking HTML template: ${error.message}`))
    }
  }

  /**
   * 运行标准构建
   */
  runBuild() {
    return new Promise((resolve, reject) => {
      this.spinner.start()

      rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), err => {
        if (err) throw err
        
        webpack(webpackConfig, (err, stats) => {
          this.spinner.stop()
          
          if (err) throw err
          
          process.stdout.write(stats.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false
          }) + '\\n\\n')

          if (stats.hasErrors()) {
            console.log(chalk.red('  Build failed with errors.\\n'))
            reject(new Error('Build failed'))
            return
          }

          console.log(chalk.cyan('  Build complete.\\n'))
          console.log(chalk.yellow(
            '  Tip: built files are meant to be served over an HTTP server.\\n' +
            '  Opening index.html over file:// won\\'t work.\\n'
          ))
          
          resolve()
        })
      })
    })
  }

  /**
   * 执行完整的CSP增强构建
   */
  async execute() {
    try {
      console.log(chalk.cyan('Starting CSP-enhanced build process...\\n'))
      
      // 1. 验证CSP策略
      this.validateCSPPolicies()
      
      // 2. 检查资源依赖
      this.checkResourceDependencies()
      
      // 3. 运行构建
      await this.runBuild()
      
      // 4. 生成CSP报告
      this.generateCSPReport()
      
      console.log(chalk.green('\\n🎉 CSP-enhanced build completed successfully!'))
      console.log(chalk.cyan('\\nNext steps:'))
      console.log('  1. Deploy the built files to your server')
      console.log('  2. Configure your server to handle CSP report endpoints')
      console.log('  3. Monitor CSP violations in production')
      console.log('  4. Review and update CSP policies as needed')
      
    } catch (error) {
      console.error(chalk.red(`\\n❌ Build failed: ${error.message}`))
      process.exit(1)
    }
  }
}

// 运行CSP增强构建
const cspBuild = new CSPBuildIntegration()
cspBuild.execute()