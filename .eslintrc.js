module.exports = {
  root: true,
  parserOptions: {
    parser: '@babel/eslint-parser',
    ecmaVersion: 2018,
    sourceType: 'module',
    requireConfigFile: false,
    allowImportExportEverywhere: true,
    babelOptions: {
      presets: ['@babel/preset-env']
    }
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  extends: [
    // 添加 Vue.js 官方推荐配置
    'plugin:vue/essential',
    // 使用 ESLint 推荐规则
    'eslint:recommended',
    // 集成 Prettier，确保代码格式统一
    'plugin:prettier/recommended'
  ],
  plugins: [
    'vue',
    'prettier'
  ],
  rules: {
    // ===== Prettier 集成规则 =====
    'prettier/prettier': 'error',

    // ===== Vue.js 专用规则 =====
    // 组件名称必须为多个单词
    'vue/multi-word-component-names': 'off',
    // 允许在模板中使用 v-html
    'vue/no-v-html': 'off',
    // 组件 prop 名称风格检查
    'vue/prop-name-casing': ['error', 'camelCase'],
    // 组件事件名称风格检查
    'vue/custom-event-name-casing': ['error', 'camelCase'],

    // ===== JavaScript 基础规则 =====
    // 禁用 console，生产环境下应该移除
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // 禁用 debugger，生产环境下应该移除
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // 禁止未使用的变量
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    // 要求使用 === 和 !==
    'eqeqeq': ['error', 'always'],
    // 禁止不必要的分号
    'no-extra-semi': 'error',
    // 禁止在 return、throw、continue 和 break 语句之后出现不可达代码
    'no-unreachable': 'error',
    // 要求 return 语句要么总是指定返回的值，要么不指定
    'consistent-return': 'warn',
    // 禁用 alert、confirm 和 prompt
    'no-alert': 'warn',
    // 禁用 eval()
    'no-eval': 'error',
    // 禁止扩展原生类型
    'no-extend-native': 'error',
    // 禁止不必要的 .bind() 调用
    'no-extra-bind': 'error',
    // 禁用隐式的eval()
    'no-implied-eval': 'error',
    // 禁止在循环中出现 function 声明和表达式
    'no-loop-func': 'error',
    // 禁用 __proto__ 属性
    'no-proto': 'error',
    // 禁止在 return 语句中使用赋值语句
    'no-return-assign': 'error',
    // 禁用不必要的 return await
    'no-return-await': 'error',
    // 禁用 Script URL
    'no-script-url': 'error',
    // 禁止自我赋值
    'no-self-assign': 'error',
    // 禁止自身比较
    'no-self-compare': 'error',
    // 禁用逗号操作符
    'no-sequences': 'error',
    // 禁止抛出异常字面量
    'no-throw-literal': 'error',
    // 禁用一成不变的循环条件
    'no-unmodified-loop-condition': 'error',
    // 禁止出现未使用的表达式
    'no-unused-expressions': 'error',
    // 禁用 void 操作符
    'no-void': 'error',

    // ===== 变量声明规则 =====
    // 禁止删除变量
    'no-delete-var': 'error',
    // 不允许标签与变量同名
    'no-label-var': 'error',
    // 禁用特定的全局变量
    'no-restricted-globals': ['error', 'event'],
    // 禁止变量声明与外层作用域的变量同名
    'no-shadow': 'warn',
    // 禁止将标识符定义为受限的名字
    'no-shadow-restricted-names': 'error',
    // 禁用未声明的变量
    'no-undef': 'error',
    // 禁止将变量初始化为 undefined
    'no-undef-init': 'error',

    // ===== 代码风格规则（由 Prettier 处理，这里主要是语义相关的） =====
    // 要求或禁止 var 声明中的初始化
    'init-declarations': 'off',
    // 强制数组方法的回调函数中有 return 语句
    'array-callback-return': 'error',
    // 强制把变量的使用限制在其定义的作用域范围内
    'block-scoped-var': 'error',
    // 限制圈复杂度
    'complexity': ['warn', 10],
    // 要求 default 子句
    'default-case': 'warn',
    // 强制尽可能地使用点号
    'dot-notation': 'error',
    // 要求使用 for-in 循环中的 hasOwnProperty
    'guard-for-in': 'warn',
    // 禁用 arguments.caller 或 arguments.callee
    'no-caller': 'error',
    // 不允许在 case 子句中使用词法声明
    'no-case-declarations': 'error',
    // 禁止使用空解构模式
    'no-empty-pattern': 'error',
    // 禁用 __iterator__ 属性
    'no-iterator': 'error',
    // 禁用标签语句
    'no-labels': 'error',
    // 禁用不必要的嵌套块
    'no-lone-blocks': 'error',
    // 禁止使用多个空格
    'no-multi-spaces': 'error',
    // 禁止使用多行字符串
    'no-multi-str': 'error',
    // 禁用 Function 构造函数
    'no-new-func': 'error',
    // 禁止对 String，Number 和 Boolean 使用 new 操作符
    'no-new-wrappers': 'error',
    // 禁用八进制字面量
    'no-octal': 'error',
    // 禁止在字符串中使用八进制转义序列
    'no-octal-escape': 'error',
    // 禁用 __proto__ 属性
    'no-proto': 'error',
    // 禁止使用重新声明的变量
    'no-redeclare': 'error',
    // 禁用 javascript: url
    'no-script-url': 'error',
    // 禁止自我赋值
    'no-self-assign': 'error',
    // 禁止自身比较
    'no-self-compare': 'error',
    // 禁用逗号操作符
    'no-sequences': 'error',
    // 禁止抛出异常字面量
    'no-throw-literal': 'error',
    // 禁用一成不变的循环条件
    'no-unmodified-loop-condition': 'error',
    // 禁止出现未使用的表达式
    'no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
    // 禁用 void 操作符
    'no-void': 'error',
    // 禁止在注释中使用特定的警告术语
    'no-warning-comments': 'warn',
    // 禁用 with 语句
    'no-with': 'error',
    // 强制在parseInt()使用基数参数
    'radix': 'error',
    // 要求所有的 var 声明出现在它们所在的作用域顶部
    'vars-on-top': 'error',
    // 要求 IIFE 使用括号括起来
    'wrap-iife': ['error', 'any'],
    // 要求或禁止 "Yoda" 条件
    'yoda': 'error'
  },
  // 针对不同文件类型的特殊配置
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        // Vue 文件中允许使用 v-html
        'vue/no-v-html': 'off'
      }
    },
    {
      files: ['src/api/**/*.js'],
      rules: {
        // API 文件中可能需要使用 console.log 进行调试
        'no-console': 'off'
      }
    },
    {
      files: ['build/**/*.js', 'config/**/*.js'],
      rules: {
        // 构建配置文件中允许使用 require
        'no-console': 'off',
        // 允许使用 require
        '@typescript-eslint/no-var-requires': 'off'
      }
    }
  ],
  // 全局变量定义
  globals: {
    // 定义项目中使用的全局变量
    process: 'readonly',
    NODE_ENV: 'readonly'
  }
}