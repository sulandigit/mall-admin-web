#!/usr/bin/env node

/**
 * 缓存功能测试运行脚本
 * 用于快速运行所有缓存相关的测试
 */

const { spawn } = require('child_process')
const path = require('path')

console.log('🧪 开始运行缓存功能测试...\n')

// 测试文件列表
const testFiles = [
  'tests/unit/store/cache.spec.js',
  'tests/unit/components/AppMain.spec.js', 
  'tests/unit/mixins/cacheView.spec.js',
  'tests/unit/utils/cacheControl.spec.js'
]

// 检查测试文件是否存在
const fs = require('fs')
const missingFiles = testFiles.filter(file => !fs.existsSync(path.join(__dirname, file)))
if (missingFiles.length > 0) {
  console.error('❌ 以下测试文件不存在:')
  missingFiles.forEach(file => console.error(`   ${file}`))
  process.exit(1)
}

// 运行测试
const jest = spawn('npx', ['jest', ...testFiles, '--verbose', '--coverage'], {
  stdio: 'inherit',
  shell: true
})

jest.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ 所有缓存功能测试通过!')
    console.log('\n📊 测试覆盖率报告已生成')
  } else {
    console.log('\n❌ 测试失败，请检查错误信息')
    process.exit(code)
  }
})

jest.on('error', (error) => {
  console.error('❌ 启动测试失败:', error.message)
  process.exit(1)
})