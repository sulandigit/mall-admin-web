module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-standard-scss',
    'stylelint-config-standard-vue',
    'stylelint-config-recess-order',
    'stylelint-config-prettier'
  ],
  plugins: [
    'stylelint-scss',
    'stylelint-order'
  ],
  rules: {
    // 基础规则配置
    'color-no-invalid-hex': true,
    'font-family-no-duplicate-names': true,
    'function-calc-no-unspaced-operator': true,
    'unit-no-unknown': true,
    'property-no-unknown': true,
    'declaration-block-no-duplicate-properties': true,
    'selector-pseudo-class-no-unknown': true,
    'selector-pseudo-element-no-unknown': true,
    'selector-type-no-unknown': true,
    'media-feature-name-no-unknown': true,
    'comment-no-empty': true,

    // 格式化规则
    'indentation': 2,
    'max-empty-lines': 2,
    'no-eol-whitespace': true,
    'no-missing-end-of-source-newline': true,

    // 颜色相关
    'color-hex-case': 'lower',
    'color-hex-length': 'short',
    'color-named': 'never',

    // 字体相关
    'font-weight-notation': 'numeric',

    // 函数相关
    'function-comma-space-after': 'always-single-line',
    'function-comma-space-before': 'never',
    'function-name-case': 'lower',
    'function-parentheses-space-inside': 'never',
    'function-url-quotes': 'always',
    'function-whitespace-after': 'always',

    // 数值和单位
    'number-leading-zero': 'always',
    'number-no-trailing-zeros': true,
    'length-zero-no-unit': true,

    // 字符串
    'string-quotes': 'single',

    // 值
    'value-keyword-case': 'lower',
    'value-list-comma-space-after': 'always-single-line',
    'value-list-comma-space-before': 'never',

    // 属性
    'property-case': 'lower',

    // 声明
    'declaration-bang-space-after': 'never',
    'declaration-bang-space-before': 'always',
    'declaration-colon-space-after': 'always-single-line',
    'declaration-colon-space-before': 'never',

    // 声明块
    'declaration-block-semicolon-newline-after': 'always-multi-line',
    'declaration-block-semicolon-space-after': 'always-single-line',
    'declaration-block-semicolon-space-before': 'never',
    'declaration-block-trailing-semicolon': 'always',

    // 块
    'block-closing-brace-empty-line-before': 'never',
    'block-closing-brace-newline-after': 'always',
    'block-closing-brace-newline-before': 'always-multi-line',
    'block-opening-brace-newline-after': 'always-multi-line',
    'block-opening-brace-space-before': 'always',

    // 选择器
    'selector-attribute-brackets-space-inside': 'never',
    'selector-attribute-operator-space-after': 'never',
    'selector-attribute-operator-space-before': 'never',
    'selector-combinator-space-after': 'always',
    'selector-combinator-space-before': 'always',
    'selector-descendant-combinator-no-non-space': true,
    'selector-pseudo-class-case': 'lower',
    'selector-pseudo-class-parentheses-space-inside': 'never',
    'selector-pseudo-element-case': 'lower',
    'selector-pseudo-element-colon-notation': 'double',
    'selector-type-case': 'lower',

    // 选择器列表
    'selector-list-comma-newline-after': 'always',
    'selector-list-comma-space-before': 'never',

    // 媒体查询
    'media-feature-colon-space-after': 'always',
    'media-feature-colon-space-before': 'never',
    'media-feature-parentheses-space-inside': 'never',
    'media-feature-range-operator-space-after': 'always',
    'media-feature-range-operator-space-before': 'always',
    'media-query-list-comma-newline-after': 'always-multi-line',
    'media-query-list-comma-space-after': 'always-single-line',
    'media-query-list-comma-space-before': 'never',

    // SCSS 特定规则
    'scss/at-import-no-partial-leading-underscore': true,
    'scss/at-import-partial-extension-blacklist': ['scss'],
    'scss/at-mixin-pattern': '^[a-z]+([a-z0-9-]+[a-z0-9]+)?$',
    'scss/at-function-pattern': '^[a-z]+([a-z0-9-]+[a-z0-9]+)?$',
    'scss/at-variable-pattern': '^[a-z]+([a-z0-9-]+[a-z0-9]+)?$',
    'scss/dollar-variable-colon-space-after': 'always',
    'scss/dollar-variable-colon-space-before': 'never',
    'scss/dollar-variable-no-missing-interpolation': true,
    'scss/operator-no-newline-after': true,
    'scss/operator-no-newline-before': true,
    'scss/operator-no-unspaced': true,

    // Vue 单文件组件支持
    'selector-pseudo-element-no-unknown': [
      true,
      {
        ignorePseudoElements: ['v-deep', 'v-global', 'v-slotted']
      }
    ],
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['deep', 'global', 'export']
      }
    ],

    // 自定义属性规则
    'custom-property-pattern': '^[a-z]+([a-z0-9-]+[a-z0-9]+)?$',

    // 属性排序 (由 stylelint-config-recess-order 提供)
    'order/properties-alphabetical-order': null,

    // Element UI 相关兼容性
    'selector-class-pattern': null, // 允许 Element UI 的类名格式
    'keyframes-name-pattern': null,  // 允许各种动画名称格式

    // 禁用一些过于严格的规则
    'no-descending-specificity': null,
    'font-family-no-missing-generic-family-keyword': null,
    'declaration-empty-line-before': null
  },
  ignoreFiles: [
    'dist/**/*',
    'node_modules/**/*',
    'public/**/*',
    '**/*.js',
    '**/*.ts'
  ],
  overrides: [
    {
      files: ['*.vue', '**/*.vue'],
      customSyntax: 'postcss-html'
    },
    {
      files: ['*.scss', '**/*.scss'],
      customSyntax: 'postcss-scss'
    }
  ]
}