/**
 * 国际化混入
 * 为组件提供便捷的国际化方法
 */
import { mapState, mapGetters } from 'vuex'
import { formatDate, formatTime, formatDateTime, formatCurrency, formatNumber } from '../utils/formatters'

export default {
  computed: {
    ...mapState('i18n', {
      '$locale': 'currentLocale',
      '$locales': 'availableLocales'
    }),
    ...mapGetters('i18n', {
      '$currentLanguage': 'currentLanguage',
      '$currentLanguageIcon': 'currentLanguageIcon'
    })
  },
  methods: {
    /**
     * 格式化日期
     * @param {Date|string|number} date 日期
     * @param {string} format 格式字符串
     * @returns {string} 格式化后的日期
     */
    $formatDate(date, format) {
      return formatDate(date, format)
    },
    
    /**
     * 格式化时间
     * @param {Date|string|number} date 时间
     * @param {boolean} use12Hour 是否使用12小时制
     * @returns {string} 格式化后的时间
     */
    $formatTime(date, use12Hour = false) {
      return formatTime(date, use12Hour)
    },
    
    /**
     * 格式化日期时间
     * @param {Date|string|number} date 日期时间
     * @param {boolean} use12Hour 是否使用12小时制
     * @returns {string} 格式化后的日期时间
     */
    $formatDateTime(date, use12Hour = false) {
      return formatDateTime(date, use12Hour)
    },
    
    /**
     * 格式化货币
     * @param {number} amount 金额
     * @param {string} currency 货币代码
     * @param {number} decimals 小数位数
     * @returns {string} 格式化后的货币
     */
    $formatCurrency(amount, currency, decimals = 2) {
      return formatCurrency(amount, currency, decimals)
    },
    
    /**
     * 格式化数字
     * @param {number} number 数字
     * @param {number} decimals 小数位数
     * @returns {string} 格式化后的数字
     */
    $formatNumber(number, decimals = 0) {
      return formatNumber(number, decimals)
    },
    
    /**
     * 翻译并插值
     * @param {string} key 翻译键
     * @param {Object} params 插值参数
     * @returns {string} 翻译结果
     */
    $tt(key, params = {}) {
      let text = this.$t(key)
      
      // 简单的插值替换
      Object.keys(params).forEach(param => {
        text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param])
      })
      
      return text
    },
    
    /**
     * 根据数量选择单复数形式
     * @param {string} key 翻译键
     * @param {number} count 数量
     * @param {Object} params 额外参数
     * @returns {string} 翻译结果
     */
    $tn(key, count, params = {}) {
      const finalParams = { count, ...params }
      
      // 如果是英文环境，尝试获取复数形式
      if (this.$locale === 'en-US' && count !== 1) {
        const pluralKey = `${key}_plural`
        if (this.$te(pluralKey)) {
          return this.$tt(pluralKey, finalParams)
        }
      }
      
      return this.$tt(key, finalParams)
    },
    
    /**
     * 获取本地化的验证规则
     * @param {string} type 验证类型
     * @param {Object} options 选项
     * @returns {Object} 验证规则
     */
    $getValidationRule(type, options = {}) {
      const rules = {
        required: {
          required: true,
          message: this.$t('form.rule.nameRequired'),
          trigger: 'blur'
        },
        email: {
          type: 'email',
          message: this.$t('form.rule.emailFormat'),
          trigger: 'blur'
        },
        phone: {
          pattern: /^1[3-9]\d{9}$/,
          message: this.$t('form.rule.phoneFormat'),
          trigger: 'blur'
        },
        url: {
          type: 'url',
          message: this.$t('form.rule.urlFormat'),
          trigger: 'blur'
        },
        number: {
          type: 'number',
          message: this.$t('validation.number'),
          trigger: 'blur'
        }
      }
      
      return { ...rules[type], ...options }
    },
    
    /**
     * 显示本地化的成功消息
     * @param {string} key 消息键
     * @param {Object} params 参数
     */
    $showSuccess(key = 'common.message.success', params = {}) {
      this.$message.success(this.$tt(key, params))
    },
    
    /**
     * 显示本地化的错误消息
     * @param {string} key 消息键
     * @param {Object} params 参数
     */
    $showError(key = 'common.message.error', params = {}) {
      this.$message.error(this.$tt(key, params))
    },
    
    /**
     * 显示本地化的警告消息
     * @param {string} key 消息键
     * @param {Object} params 参数
     */
    $showWarning(key = 'common.message.warning', params = {}) {
      this.$message.warning(this.$tt(key, params))
    },
    
    /**
     * 显示本地化的确认对话框
     * @param {string} key 消息键
     * @param {Object} params 参数
     * @param {Object} options MessageBox选项
     * @returns {Promise} Promise对象
     */
    $confirmLocalized(key = 'message.confirm.delete', params = {}, options = {}) {
      const defaultOptions = {
        confirmButtonText: this.$t('common.button.confirm'),
        cancelButtonText: this.$t('common.button.cancel'),
        type: 'warning'
      }
      
      return this.$confirm(
        this.$tt(key, params),
        this.$t('common.message.warning'),
        { ...defaultOptions, ...options }
      )
    }
  }
}