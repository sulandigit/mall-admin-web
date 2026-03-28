'use strict'

const { generateCSPForEnvironment } = require('./csp-config')

/**
 * CSP Webpack Plugin
 * 自动为HTML模板注入Content Security Policy meta标签
 */
class CSPWebpackPlugin {
  constructor(options = {}) {
    this.options = {
      // 环境设置
      environment: options.environment || process.env.NODE_ENV || 'development',
      
      // CSP配置选项
      cspOptions: options.cspOptions || {},
      
      // 是否启用报告模式
      reportOnly: options.reportOnly || false,
      
      // 是否在构建时输出CSP信息
      verbose: options.verbose || false,
      
      // 自定义HTML注入模式
      inject: options.inject !== false, // 默认启用注入
      
      // 是否验证策略
      validate: options.validate !== false, // 默认启用验证
      
      // 自定义meta标签属性
      metaAttributes: options.metaAttributes || {}
    }
  }

  apply(compiler) {
    const pluginName = 'CSPWebpackPlugin'

    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      // 确保HtmlWebpackPlugin存在
      if (!compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing) {
        console.warn('[CSP Plugin] HtmlWebpackPlugin not found. CSP meta tag will not be injected.')
        return
      }

      // 钩子到HTML处理过程
      compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing.tapAsync(
        pluginName,
        (data, callback) => {
          try {
            // 生成CSP策略
            const cspResult = generateCSPForEnvironment(
              this.options.environment,
              this.options.cspOptions
            )

            // 验证策略（如果启用）
            if (this.options.validate && !cspResult.validation.isValid) {
              const errors = cspResult.validation.issues.join(', ')
              throw new Error(`Invalid CSP policy: ${errors}`)
            }

            // 输出警告信息
            if (this.options.verbose && cspResult.validation.warnings.length > 0) {
              console.warn('[CSP Plugin] Warnings:')
              cspResult.validation.warnings.forEach(warning => {
                console.warn(`  - ${warning}`)
              })
            }

            // 注入CSP meta标签
            if (this.options.inject) {
              data.html = this.injectCSPMeta(data.html, cspResult.policyString)
            }

            // 输出构建信息
            if (this.options.verbose) {
              console.log(`[CSP Plugin] Generated CSP policy for ${this.options.environment}:`)
              console.log(`  Policy: ${cspResult.policyString}`)
            }

            callback(null, data)
          } catch (error) {
            console.error('[CSP Plugin] Error:', error.message)
            callback(error)
          }
        }
      )
    })
  }

  /**
   * 向HTML中注入CSP meta标签
   * @param {string} html 原始HTML内容
   * @param {string} policyString CSP策略字符串
   * @returns {string} 注入CSP后的HTML
   */
  injectCSPMeta(html, policyString) {
    const metaTagName = this.options.reportOnly 
      ? 'Content-Security-Policy-Report-Only' 
      : 'Content-Security-Policy'

    // 构建meta标签属性
    const attributes = {
      'http-equiv': metaTagName,
      content: policyString,
      ...this.options.metaAttributes
    }

    // 生成meta标签
    const attributeString = Object.entries(attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ')

    const metaTag = `<meta ${attributeString}>`

    // 查找插入位置（在head标签内，尽可能靠前）
    const headMatch = html.match(/<head[^>]*>/i)
    if (headMatch) {
      const insertPosition = headMatch.index + headMatch[0].length
      return html.slice(0, insertPosition) + 
             '\n    ' + metaTag + 
             html.slice(insertPosition)
    }

    // 如果没有找到head标签，尝试在html标签后插入
    const htmlMatch = html.match(/<html[^>]*>/i)
    if (htmlMatch) {
      const insertPosition = htmlMatch.index + htmlMatch[0].length
      return html.slice(0, insertPosition) + 
             '\n  <head>\n    ' + metaTag + '\n  </head>' +
             html.slice(insertPosition)
    }

    // 如果都没有找到，在文档开头插入
    console.warn('[CSP Plugin] Could not find appropriate insertion point for CSP meta tag')
    return metaTag + '\n' + html
  }

  /**
   * 静态方法：快速创建开发环境插件实例
   * @param {Object} options 插件选项
   * @returns {CSPWebpackPlugin} 插件实例
   */
  static forDevelopment(options = {}) {
    return new CSPWebpackPlugin({
      environment: 'development',
      reportOnly: true, // 开发环境默认使用report-only模式
      verbose: true,
      ...options
    })
  }

  /**
   * 静态方法：快速创建生产环境插件实例
   * @param {Object} options 插件选项
   * @returns {CSPWebpackPlugin} 插件实例
   */
  static forProduction(options = {}) {
    return new CSPWebpackPlugin({
      environment: 'production',
      reportOnly: false, // 生产环境启用强制模式
      verbose: false,
      validate: true,
      ...options
    })
  }

  /**
   * 静态方法：快速创建测试环境插件实例
   * @param {Object} options 插件选项
   * @returns {CSPWebpackPlugin} 插件实例
   */
  static forTesting(options = {}) {
    return new CSPWebpackPlugin({
      environment: 'testing',
      reportOnly: false,
      verbose: true,
      validate: true,
      ...options
    })
  }
}

module.exports = CSPWebpackPlugin