module.exports = {
  root: true,
  parserOptions: {
    parser: '@babel/eslint-parser',
    ecmaVersion: 2020,
    sourceType: 'module',
    requireConfigFile: false,
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
    'eslint:recommended',
    '@vue/standard',
    'plugin:vue/essential',
    'prettier'
  ],
  plugins: [
    'vue',
    'prettier'
  ],
  rules: {
    // Prettier 相关
    'prettier/prettier': ['error', {
      printWidth: 100,
      tabWidth: 2,
      useTabs: false,
      semi: false,
      singleQuote: true,
      quoteProps: 'as-needed',
      trailingComma: 'none',
      bracketSpacing: true,
      vueIndentScriptAndStyle: true
    }],

    // Vue.js 特定规则
    'vue/max-attributes-per-line': ['error', {
      singleline: {
        max: 1
      },
      multiline: {
        max: 1,
        allowFirstLine: false
      }
    }],
    'vue/singleline-html-element-content-newline': 'off',
    'vue/multiline-html-element-content-newline': 'error',
    'vue/name-property-casing': ['error', 'PascalCase'],
    'vue/no-v-html': 'warn',
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/html-self-closing': ['error', {
      html: {
        void: 'never',
        normal: 'always',
        component: 'always'
      },
      svg: 'always',
      math: 'always'
    }],
    'vue/attributes-order': ['error', {
      order: [
        'DEFINITION',
        'LIST_RENDERING',
        'CONDITIONALS',
        'RENDER_MODIFIERS',
        'GLOBAL',
        ['UNIQUE', 'SLOT'],
        'TWO_WAY_BINDING',
        'OTHER_DIRECTIVES',
        'OTHER_ATTR',
        'EVENTS',
        'CONTENT'
      ],
      alphabetical: false
    }],
    'vue/order-in-components': ['error', {
      order: [
        'el',
        'name',
        'parent',
        'functional',
        ['delimiters', 'comments'],
        ['components', 'directives', 'filters'],
        'extends',
        'mixins',
        'inheritAttrs',
        'model',
        ['props', 'propsData'],
        'data',
        'computed',
        'watch',
        'LIFECYCLE_HOOKS',
        'methods',
        ['template', 'render'],
        'renderError'
      ]
    }],

    // JavaScript 代码质量规则
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-vars': ['error', { 
      vars: 'all', 
      args: 'after-used', 
      ignoreRestSiblings: false 
    }],
    'no-undef': 'error',
    'no-duplicate-imports': 'error',
    'prefer-const': 'error',
    'no-var': 'error',

    // 代码风格规则（与 Prettier 配合）
    'indent': 'off', // 交给 Prettier 处理
    'quotes': 'off', // 交给 Prettier 处理
    'semi': 'off', // 交给 Prettier 处理
    'comma-dangle': 'off', // 交给 Prettier 处理
    'space-before-function-paren': 'off', // 交给 Prettier 处理

    // Element UI 兼容性
    'vue/no-unused-components': 'warn', // Element UI 组件可能全局注册
    'vue/require-prop-types': 'warn', // 渐进式改进
    'vue/custom-event-name-casing': ['error', 'kebab-case']
  },
  globals: {
    // 全局变量定义
    '_': 'readonly',
    '$': 'readonly'
  },
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        'indent': 'off',
        'vue/script-indent': ['error', 2, {
          baseIndent: 0,
          switchCase: 1,
          ignores: []
        }]
      }
    },
    {
      files: ['src/views/**/*.vue'],
      rules: {
        'vue/multi-word-component-names': 'off'
      }
    },
    {
      files: ['src/components/**/*.vue'],
      rules: {
        'vue/multi-word-component-names': 'error'
      }
    }
  ]
}