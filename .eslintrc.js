module.exports = {
  root: true,
  
  // 指定代码运行环境
  env: {
    browser: true,
    node: true,
    es6: true
  },

  // 继承的规则集
  extends: [
    // Vue.js 官方推荐的基础规则
    'plugin:vue/essential',
    // 继承标准JavaScript规则
    '@vue/standard',
    // 禁用与Prettier冲突的ESLint规则，必须放在最后
    'prettier'
  ],

  // 指定解析器
  parser: 'vue-eslint-parser',
  
  // 解析器配置
  parserOptions: {
    parser: '@babel/eslint-parser',
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    },
    requireConfigFile: false,
    babelOptions: {
      presets: ['@babel/preset-env']
    }
  },

  // 插件列表
  plugins: [
    'vue',
    'prettier'
  ],

  // 自定义规则
  rules: {
    // Prettier相关
    'prettier/prettier': 'error',

    // Vue相关规则
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/no-unused-components': 'error',
    'vue/prop-name-casing': ['error', 'camelCase'],
    'vue/attribute-hyphenation': ['error', 'always'],
    'vue/v-bind-style': ['error', 'shorthand'],
    'vue/v-on-style': ['error', 'shorthand'],
    'vue/no-v-html': 'warn',
    'vue/this-in-template': ['error', 'never'],
    'vue/eqeqeq': ['error', 'always'],

    // JavaScript规则
    'no-unused-vars': 'warn',
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-alert': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    
    // 代码风格规则（这些通常由Prettier处理，但可以作为备用）
    'indent': 'off', // 由Prettier处理
    'quotes': 'off', // 由Prettier处理
    'semi': 'off', // 由Prettier处理
    'comma-dangle': 'off', // 由Prettier处理
    
    // 最佳实践
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-throw-literal': 'error',
    'no-useless-call': 'error',
    'no-void': 'error',
    'wrap-iife': ['error', 'inside'],
    
    // ES6规则
    'arrow-spacing': 'off', // 由Prettier处理
    'no-duplicate-imports': 'error',
    'no-useless-constructor': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-template': 'error'
  },

  // 针对特定文件的规则覆盖
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        // Vue文件特定规则
        'vue/script-indent': ['error', 2, { baseIndent: 0 }]
      }
    },
    {
      files: ['src/views/**/*.vue'],
      rules: {
        // 页面组件可以使用多个单词
        'vue/multi-word-component-names': 'off'
      }
    },
    {
      files: ['build/**/*.js', 'config/**/*.js'],
      rules: {
        // 构建脚本允许使用console
        'no-console': 'off'
      }
    }
  ]
}