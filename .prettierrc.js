module.exports = {
  // 基础格式化选项
  printWidth: 100,                    // 单行最大字符数
  tabWidth: 2,                        // 缩进空格数
  useTabs: false,                     // 使用空格而非制表符
  semi: false,                        // 语句末尾不加分号 (符合 Vue 项目习惯)
  singleQuote: true,                  // 使用单引号
  quoteProps: 'as-needed',            // 对象属性引号策略：仅在需要时添加
  trailingComma: 'none',              // 尾随逗号策略：ES5 兼容
  bracketSpacing: true,               // 对象字面量空格：{ foo: bar }
  bracketSameLine: false,             // JSX 标签闭合括号换行
  arrowParens: 'avoid',               // 箭头函数参数括号：avoid

  // Vue.js 特定配置
  vueIndentScriptAndStyle: true,      // Vue 文件中 <script> 和 <style> 标签内容缩进

  // HTML 相关配置
  htmlWhitespaceSensitivity: 'css',   // HTML 空白符敏感性
  endOfLine: 'lf',                    // 行尾序列：LF (Unix)

  // 文件类型覆盖配置
  overrides: [
    {
      files: '*.vue',
      options: {
        parser: 'vue'
      }
    },
    {
      files: '*.json',
      options: {
        parser: 'json',
        trailingComma: 'none'
      }
    },
    {
      files: '*.md',
      options: {
        parser: 'markdown',
        proseWrap: 'preserve',
        printWidth: 80
      }
    },
    {
      files: ['*.scss', '*.css'],
      options: {
        parser: 'scss',
        singleQuote: false,
        printWidth: 120
      }
    },
    {
      files: '*.yaml',
      options: {
        parser: 'yaml',
        singleQuote: false
      }
    },
    {
      files: '*.yml',
      options: {
        parser: 'yaml',
        singleQuote: false
      }
    }
  ]
}