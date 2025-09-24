/**
 * CSP报告收集服务器模拟
 * 用于开发和测试环境收集CSP违规报告
 */

'use strict'

const fs = require('fs')
const path = require('path')

/**
 * CSP报告服务器类
 */
class CSPReportServer {
  constructor(options = {}) {
    this.options = {
      // 报告存储目录
      logDir: options.logDir || path.join(__dirname, '../logs'),
      
      // 日志文件名
      logFile: options.logFile || 'csp-violations.log',
      
      // 是否启用详细输出
      verbose: options.verbose || true,
      
      // 最大日志文件大小（字节）
      maxLogSize: options.maxLogSize || 10 * 1024 * 1024, // 10MB
      
      // 保留的日志文件数量
      maxLogFiles: options.maxLogFiles || 5
    }

    this.init()
  }

  /**
   * 初始化服务器
   */
  init() {
    // 确保日志目录存在
    if (!fs.existsSync(this.options.logDir)) {
      fs.mkdirSync(this.options.logDir, { recursive: true })
    }

    this.logFilePath = path.join(this.options.logDir, this.options.logFile)
    
    if (this.options.verbose) {
      console.log(`[CSP Report Server] Initialized. Log file: ${this.logFilePath}`)
    }
  }

  /**
   * 处理CSP报告
   * @param {Object} report CSP违规报告
   */
  handleReport(report) {
    try {
      // 验证报告
      if (!this.validateReport(report)) {
        if (this.options.verbose) {
          console.warn('[CSP Report Server] Invalid report format')
        }
        return false
      }

      // 添加服务器时间戳
      report.serverTimestamp = new Date().toISOString()

      // 记录到控制台
      if (this.options.verbose) {
        this.logToConsole(report)
      }

      // 写入日志文件
      this.writeToLogFile(report)

      // 检查并轮转日志文件
      this.rotateLogIfNeeded()

      return true
    } catch (error) {
      console.error('[CSP Report Server] Error handling report:', error)
      return false
    }
  }

  /**
   * 验证报告格式
   * @param {Object} report CSP报告
   * @returns {boolean} 是否有效
   */
  validateReport(report) {
    if (!report || typeof report !== 'object') {
      return false
    }

    // 检查必需字段
    const requiredFields = ['document-uri', 'violated-directive']
    return requiredFields.every(field => 
      report.hasOwnProperty(field) && report[field]
    )
  }

  /**
   * 记录到控制台
   * @param {Object} report CSP报告
   */
  logToConsole(report) {
    console.log('\n=== CSP Violation Report ===')
    console.log(`Time: ${report.serverTimestamp}`)
    console.log(`Document: ${report['document-uri']}`)
    console.log(`Violated: ${report['violated-directive']}`)
    console.log(`Blocked: ${report['blocked-uri'] || 'N/A'}`)
    console.log(`Source: ${report['source-file'] || 'N/A'}:${report['line-number'] || 'N/A'}:${report['column-number'] || 'N/A'}`)
    console.log('============================\n')
  }

  /**
   * 写入日志文件
   * @param {Object} report CSP报告
   */
  writeToLogFile(report) {
    const logEntry = JSON.stringify(report) + '\n'
    fs.appendFileSync(this.logFilePath, logEntry)
  }

  /**
   * 轮转日志文件
   */
  rotateLogIfNeeded() {
    try {
      const stats = fs.statSync(this.logFilePath)
      
      if (stats.size > this.options.maxLogSize) {
        this.rotateLog()
      }
    } catch (error) {
      // 文件可能不存在，忽略错误
    }
  }

  /**
   * 轮转日志
   */
  rotateLog() {
    const baseFilename = path.basename(this.options.logFile, path.extname(this.options.logFile))
    const extension = path.extname(this.options.logFile)

    // 移动现有的编号文件
    for (let i = this.options.maxLogFiles - 1; i >= 1; i--) {
      const oldFile = path.join(this.options.logDir, `${baseFilename}.${i}${extension}`)
      const newFile = path.join(this.options.logDir, `${baseFilename}.${i + 1}${extension}`)
      
      if (fs.existsSync(oldFile)) {
        if (i + 1 <= this.options.maxLogFiles) {
          fs.renameSync(oldFile, newFile)
        } else {
          fs.unlinkSync(oldFile)
        }
      }
    }

    // 移动当前日志文件
    const rotatedFile = path.join(this.options.logDir, `${baseFilename}.1${extension}`)
    if (fs.existsSync(this.logFilePath)) {
      fs.renameSync(this.logFilePath, rotatedFile)
    }

    if (this.options.verbose) {
      console.log('[CSP Report Server] Log file rotated')
    }
  }

  /**
   * 获取报告统计信息
   * @returns {Object} 统计信息
   */
  getStatistics() {
    try {
      if (!fs.existsSync(this.logFilePath)) {
        return {
          totalReports: 0,
          fileSize: 0,
          lastModified: null
        }
      }

      const stats = fs.statSync(this.logFilePath)
      const content = fs.readFileSync(this.logFilePath, 'utf8')
      const lines = content.trim().split('\n').filter(line => line.trim())

      return {
        totalReports: lines.length,
        fileSize: stats.size,
        lastModified: stats.mtime.toISOString()
      }
    } catch (error) {
      console.error('[CSP Report Server] Error getting statistics:', error)
      return {
        totalReports: 0,
        fileSize: 0,
        lastModified: null,
        error: error.message
      }
    }
  }

  /**
   * 获取最近的报告
   * @param {number} count 报告数量
   * @returns {Array} 报告列表
   */
  getRecentReports(count = 10) {
    try {
      if (!fs.existsSync(this.logFilePath)) {
        return []
      }

      const content = fs.readFileSync(this.logFilePath, 'utf8')
      const lines = content.trim().split('\n').filter(line => line.trim())
      
      return lines
        .slice(-count)
        .map(line => {
          try {
            return JSON.parse(line)
          } catch (error) {
            return null
          }
        })
        .filter(report => report !== null)
        .reverse() // 最新的在前面
    } catch (error) {
      console.error('[CSP Report Server] Error getting recent reports:', error)
      return []
    }
  }

  /**
   * 创建Express中间件
   * @returns {Function} Express中间件函数
   */
  createExpressMiddleware() {
    return (req, res, next) => {
      if (req.method === 'POST' && req.path.endsWith('/csp-report')) {
        // 处理CSP报告
        let body = ''
        req.on('data', chunk => {
          body += chunk.toString()
        })
        
        req.on('end', () => {
          try {
            const report = JSON.parse(body)
            const success = this.handleReport(report)
            
            res.status(success ? 200 : 400).json({
              success,
              message: success ? 'Report received' : 'Invalid report'
            })
          } catch (error) {
            res.status(400).json({
              success: false,
              message: 'Invalid JSON'
            })
          }
        })
      } else if (req.method === 'GET' && req.path.endsWith('/csp-stats')) {
        // 返回统计信息
        const stats = this.getStatistics()
        res.json(stats)
      } else if (req.method === 'GET' && req.path.endsWith('/csp-reports')) {
        // 返回最近的报告
        const count = parseInt(req.query.count) || 10
        const reports = this.getRecentReports(count)
        res.json({ reports })
      } else {
        next()
      }
    }
  }
}

/**
 * 创建简单的HTTP服务器用于测试
 * @param {number} port 端口号
 * @param {Object} options 选项
 */
function createTestServer(port = 3001, options = {}) {
  const server = new CSPReportServer(options)
  const http = require('http')
  const url = require('url')

  const httpServer = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true)
    
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200)
      res.end()
      return
    }

    if (req.method === 'POST' && parsedUrl.pathname === '/api/csp-report') {
      let body = ''
      req.on('data', chunk => {
        body += chunk.toString()
      })
      
      req.on('end', () => {
        try {
          const report = JSON.parse(body)
          const success = server.handleReport(report)
          
          res.writeHead(success ? 200 : 400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            success,
            message: success ? 'Report received' : 'Invalid report'
          }))
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            success: false,
            message: 'Invalid JSON'
          }))
        }
      })
    } else if (req.method === 'GET' && parsedUrl.pathname === '/api/csp-stats') {
      const stats = server.getStatistics()
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(stats))
    } else if (req.method === 'GET' && parsedUrl.pathname === '/api/csp-reports') {
      const count = parseInt(parsedUrl.query.count) || 10
      const reports = server.getRecentReports(count)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ reports }))
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Not found' }))
    }
  })

  httpServer.listen(port, () => {
    console.log(`[CSP Report Server] Test server listening on port ${port}`)
    console.log(`  - POST /api/csp-report - Receive CSP reports`)
    console.log(`  - GET /api/csp-stats - Get statistics`)
    console.log(`  - GET /api/csp-reports?count=N - Get recent reports`)
  })

  return { server, httpServer }
}

module.exports = {
  CSPReportServer,
  createTestServer
}

// 如果直接运行此文件，启动测试服务器
if (require.main === module) {
  const port = process.argv[2] || 3001
  createTestServer(port)
}