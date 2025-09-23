module.exports = {
  // 基础格式化选项
  semi: false,                          // 不使用分号结尾
  singleQuote: true,                    // 使用单引号
  quoteProps: 'as-needed',              // 仅在需要时为对象属性加引号
  trailingComma: 'es5',                 // ES5兼容的尾随逗号
  bracketSpacing: true,                 // 对象字面量大括号内部空格
  bracketSameLine: false,               // 多行JSX元素的>换行
  arrowParens: 'avoid',                 // 箭头函数单参数时避免括号
  
  // 缩进和换行
  tabWidth: 2,                          // 缩进宽度2空格
  useTabs: false,                       // 使用空格而非制表符
  printWidth: 100,                      // 每行最大长度
  endOfLine: 'lf',                      // 行尾序列使用LF
  
  // HTML相关
  htmlWhitespaceSensitivity: 'css',     // 遵循CSS的空格敏感性规则
  
  // Vue文件特殊配置
  vueIndentScriptAndStyle: false,       // Vue文件中script和style标签不额外缩进
  
  // 嵌入式语言格式化
  embeddedLanguageFormatting: 'auto',   // 自动格式化嵌入式代码
  
  // 针对特定文件类型的覆盖配置
  overrides: [
    {
      files: '*.vue',
      options: {
        // Vue模板中的HTML属性换行
        htmlWhitespaceSensitivity: 'ignore',
        // Vue文件的特殊处理
        vueIndentScriptAndStyle: false
      }
    },
    {
      files: ['*.json', '.eslintrc', '.prettierrc'],
      options: {
        // JSON文件使用双引号
        singleQuote: false,
        // JSON文件保持尾随逗号
        trailingComma: 'none'
      }
    },
    {
      files: '*.md',
      options: {
        // Markdown文件保持原有换行
        proseWrap: 'preserve',
        // 适当增加行宽以适应文档
        printWidth: 80
      }
    },
    {
      files: '*.scss',
      options: {
        // SCSS文件使用双引号
        singleQuote: false
      }
    }
  ]
}