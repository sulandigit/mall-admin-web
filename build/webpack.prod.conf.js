'use strict'
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const env = require('../config/prod.env')

const webpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true,
      usePostCSS: true
    })
  },
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].[chunkhash].js'),
    chunkFilename: utils.assetsPath('js/[id].[chunkhash].js'),
    // 优化输出
    pathinfo: false
  },
  
  // 生产环境优化配置
  optimization: {
    // 代码分割优化
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // 第三方库分割
        vendor: {
          name: 'vendor',
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: 'all'
        },
        // Element UI 单独分割
        elementUI: {
          name: 'element-ui',
          test: /[\\/]node_modules[\\/]element-ui[\\/]/,
          priority: 20,
          chunks: 'all'
        },
        // ECharts 单独分割
        echarts: {
          name: 'echarts',
          test: /[\\/]node_modules[\\/](echarts|v-charts)[\\/]/,
          priority: 20,
          chunks: 'all'
        },
        // 公共代码分割
        common: {
          name: 'common',
          minChunks: 2,
          priority: 5,
          chunks: 'all',
          reuseExistingChunk: true
        }
      }
    },
    // runtime 分割
    runtimeChunk: {
      name: 'runtime'
    },
    // 代码压缩优化
    minimize: true,
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          compress: {
            warnings: false,
            drop_console: true, // 移除 console
            drop_debugger: true, // 移除 debugger
            pure_funcs: ['console.log'] // 移除特定函数
          },
          mangle: {
            safari10: true // 解决 Safari 10+ 问题
          }
        },
        sourceMap: config.build.productionSourceMap,
        parallel: true, // 并行处理
        cache: true // 缓存
      })
    ]
  },
  
  // 性能优化
  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },
  
  plugins: [
    // 环境变量定义
    new webpack.DefinePlugin({
      'process.env': env
    }),
    
    // 忽略 moment.js 的语言包，减小打包体积
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    
    // CSS 提取优化
    new ExtractTextPlugin({
      filename: utils.assetsPath('css/[name].[contenthash].css'),
      allChunks: true,
    }),
    
    // CSS 压缩优化
    new OptimizeCSSPlugin({
      cssProcessorOptions: config.build.productionSourceMap
        ? { 
            safe: true, 
            map: { inline: false },
            autoprefixer: { disable: true }, // 禁用 autoprefixer，由 PostCSS 处理
            discardComments: { removeAll: true } // 移除所有注释
          }
        : { 
            safe: true,
            autoprefixer: { disable: true },
            discardComments: { removeAll: true }
          }
    }),
    
    // HTML 模板优化
    new HtmlWebpackPlugin({
      filename: config.build.index,
      template: 'index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeEmptyAttributes: true, // 移除空属性
        removeStyleLinkTypeAttributes: true, // 移除 style 和 link 的 type 属性
        removeScriptTypeAttributes: true, // 移除 script 的 type 属性
        minifyJS: true, // 压缩 JS
        minifyCSS: true, // 压缩 CSS
        minifyURLs: true // 压缩 URL
      },
      chunksSortMode: 'dependency'
    }),
    
    // 保持模块 ID 稳定
    new webpack.HashedModuleIdsPlugin(),
    
    // 启用作用域提升
    new webpack.optimize.ModuleConcatenationPlugin(),
    
    // 复制静态资源
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.build.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ]
})

if (config.build.productionGzip) {
  const CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

if (config.build.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
