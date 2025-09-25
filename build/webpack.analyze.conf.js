'use strict'

/**
 * Webpack 构建分析配置
 * 用于分析打包结果，优化构建性能
 */

const merge = require('webpack-merge')
const prodConfig = require('./webpack.prod.conf')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')

const smp = new SpeedMeasurePlugin()

// 分析配置
const analyzeConfig = merge(prodConfig, {
  plugins: [
    // 包大小分析
    new BundleAnalyzerPlugin({
      analyzerMode: 'server',
      analyzerHost: '127.0.0.1',
      analyzerPort: 8888,
      reportFilename: 'report.html',
      defaultSizes: 'parsed',
      openAnalyzer: true,
      generateStatsFile: true,
      statsFilename: 'stats.json',
      statsOptions: null,
      logLevel: 'info'
    })
  ]
})

// 导出包装后的配置（包含构建时间分析）
module.exports = smp.wrap(analyzeConfig)