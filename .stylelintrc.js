module.exports = {
  // 继承标准配置
  extends: [
    'stylelint-config-standard'
  ],
  // 插件配置
  plugins: [],
  // 规则配置
  rules: {
    // ===== 可能的错误 =====
    // 禁止未知的@规则
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          // 忽略 SCSS 特有的 @ 规则
          'mixin',
          'include',
          'extend',
          'if',
          'else',
          'for',
          'each',
          'while',
          'function',
          'return',
          'warn',
          'error',
          'debug',
          // 忽略 CSS 模块化相关
          'value'
        ]
      }
    ],
    // 禁止空块
    'block-no-empty': true,
    // 禁止无效的颜色值
    'color-no-invalid-hex': true,
    // 禁止重复的字体家族名称
    'font-family-no-duplicate-names': true,
    // 禁止缺少通用字体家族关键字
    'font-family-no-missing-generic-family-keyword': true,
    // 禁止未知的函数
    'function-no-unknown': [
      true,
      {
        ignoreFunctions: [
          // 忽略 SCSS 函数
          'map-get',
          'map-merge',
          'map-remove',
          'map-keys',
          'map-values',
          'map-has-key',
          'percentage',
          'round',
          'ceil',
          'floor',
          'abs',
          'min',
          'max',
          'random',
          'unit',
          'unitless',
          'comparable',
          'str-length',
          'str-slice',
          'str-index',
          'str-insert',
          'to-upper-case',
          'to-lower-case',
          'length',
          'nth',
          'set-nth',
          'join',
          'append',
          'zip',
          'index',
          'list-separator',
          'is-bracketed',
          'keywords',
          'feature-exists',
          'variable-exists',
          'global-variable-exists',
          'function-exists',
          'mixin-exists',
          'inspect',
          'type-of',
          'call',
          'get-function'
        ]
      }
    ],
    // 禁止未知的属性
    'property-no-unknown': [
      true,
      {
        ignoreProperties: [
          // 忽略厂商前缀属性
          '/^-webkit-/',
          '/^-moz-/',
          '/^-ms-/',
          '/^-o-/'
        ]
      }
    ],
    // 禁止未知的伪类选择器
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: [
          // 忽略 Vue.js 特有的伪类
          'deep',
          'slotted',
          'global'
        ]
      }
    ],
    // 禁止未知的伪元素选择器
    'selector-pseudo-element-no-unknown': [
      true,
      {
        ignorePseudoElements: [
          // 忽略 Vue.js 特有的伪元素
          'v-deep',
          'v-slotted',
          'v-global'
        ]
      }
    ],
    // 禁止未知的类型选择器
    'selector-type-no-unknown': [
      true,
      {
        ignore: ['custom-elements']
      }
    ],

    // ===== 限制语言特性 =====
    // 禁止使用低优先级的选择器
    'no-descending-specificity': null,
    // 禁止重复的选择器
    'no-duplicate-selectors': true,
    // 禁止空的源码
    'no-empty-source': null,
    // 禁止行尾空白
    'no-eol-whitespace': true,
    // 禁止多余的分号
    'no-extra-semicolons': true,
    // 禁止无效的双斜线注释
    'no-invalid-double-slash-comments': true,
    // 禁止缺少文件结尾的新行
    'no-missing-end-of-source-newline': true,

    // ===== 风格相关 =====
    // 颜色值使用小写
    'color-hex-case': 'lower',
    // 使用短的颜色值
    'color-hex-length': 'short',
    // 字体家族名称使用引号
    'font-family-name-quotes': 'always-where-recommended',
    // 函数名称使用小写
    'function-name-case': 'lower',
    // 函数括号内不允许有空格
    'function-parentheses-space-inside': 'never',
    // URL 使用引号
    'function-url-quotes': 'always',
    // 数字不允许前导零
    'number-leading-zero': 'always',
    // 数字不允许尾随零
    'number-no-trailing-zeros': true,
    // 字符串使用双引号
    'string-quotes': 'double',
    // 长度为0时不需要单位
    'length-zero-no-unit': true,
    // 属性名称使用小写
    'property-case': 'lower',
    // 声明块不允许有分号
    'declaration-bang-space-after': 'never',
    'declaration-bang-space-before': 'always',
    // 声明分号后需要空格
    'declaration-colon-space-after': 'always-single-line',
    'declaration-colon-space-before': 'never',
    // 声明块内允许重复的属性
    'declaration-block-no-duplicate-properties': [
      true,
      {
        ignore: ['consecutive-duplicates-with-different-values']
      }
    ],
    // 声明块尾随分号
    'declaration-block-trailing-semicolon': 'always',
    // 块开始大括号前需要空格
    'block-opening-brace-space-before': 'always',
    // 选择器列表逗号后需要空格
    'selector-list-comma-space-after': 'always-single-line',
    // 选择器列表逗号前不允许空格
    'selector-list-comma-space-before': 'never',
    // 规则前需要空行
    'rule-empty-line-before': [
      'always-multi-line',
      {
        except: ['first-nested'],
        ignore: ['after-comment']
      }
    ],

    // ===== 项目特定规则 =====
    // 允许厂商前缀
    'property-no-vendor-prefix': null,
    'value-no-vendor-prefix': null,
    // 允许空的注释
    'comment-no-empty': null,
    // 关闭一些过于严格的规则
    'no-duplicate-at-import-rules': null,
    'font-weight-notation': null,
    // 允许未知的单位（用于CSS变量等）
    'unit-no-unknown': [
      true,
      {
        ignoreUnits: ['rpx', 'upx']
      }
    ]
  },
  // 忽略的文件
  ignoreFiles: [
    '**/*.js',
    '**/*.jsx',
    '**/*.ts',
    '**/*.tsx',
    'node_modules/**/*',
    'dist/**/*',
    'build/**/*',
    'static/**/*'
  ],
  // 针对不同文件类型的特殊配置
  overrides: [
    {
      files: ['*.vue', '**/*.vue'],
      customSyntax: 'postcss-html',
      rules: {
        // Vue 文件中的特殊规则
        'selector-pseudo-class-no-unknown': [
          true,
          {
            ignorePseudoClasses: ['deep', 'slotted', 'global']
          }
        ],
        'selector-pseudo-element-no-unknown': [
          true,
          {
            ignorePseudoElements: ['v-deep', 'v-slotted', 'v-global']
          }
        ]
      }
    },
    {
      files: ['*.scss', '**/*.scss'],
      customSyntax: 'postcss-scss',
      rules: {
        // SCSS 文件中的特殊规则
        'at-rule-no-unknown': null,
        'scss/at-rule-no-unknown': true
      }
    }
  ]
}