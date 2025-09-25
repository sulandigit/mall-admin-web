/**
 * 库存周转率计算工具类
 */
export default class TurnoverCalculator {
  
  /**
   * 计算库存周转率
   * @param {number} costOfGoodsSold 销售成本
   * @param {number} averageInventoryValue 平均库存价值
   * @returns {number} 周转率
   */
  static calculateTurnoverRate(costOfGoodsSold, averageInventoryValue) {
    if (!averageInventoryValue || averageInventoryValue <= 0) {
      return 0
    }
    
    const cogs = parseFloat(costOfGoodsSold) || 0
    const avgInventory = parseFloat(averageInventoryValue)
    
    return Math.round((cogs / avgInventory) * 100) / 100
  }
  
  /**
   * 计算平均库存价值
   * @param {number} beginningInventoryValue 期初库存价值
   * @param {number} endingInventoryValue 期末库存价值
   * @returns {number} 平均库存价值
   */
  static calculateAverageInventoryValue(beginningInventoryValue, endingInventoryValue) {
    const beginning = parseFloat(beginningInventoryValue) || 0
    const ending = parseFloat(endingInventoryValue) || 0
    
    return Math.round(((beginning + ending) / 2) * 100) / 100
  }
  
  /**
   * 计算库存周转天数
   * @param {number} turnoverRate 周转率
   * @param {number} periodDays 统计期间天数，默认365天
   * @returns {number} 周转天数
   */
  static calculateTurnoverDays(turnoverRate, periodDays = 365) {
    if (!turnoverRate || turnoverRate <= 0) {
      return 0
    }
    
    const rate = parseFloat(turnoverRate)
    const days = parseFloat(periodDays)
    
    return Math.round((days / rate) * 100) / 100
  }
  
  /**
   * 获取周转率级别
   * @param {number} turnoverRate 周转率
   * @returns {Object} 包含级别信息的对象
   */
  static getTurnoverLevel(turnoverRate) {
    const rate = parseFloat(turnoverRate) || 0
    
    if (rate >= 4.0) {
      return {
        level: 'fast',
        label: '快速周转',
        color: '#67C23A',
        description: '保持当前库存策略'
      }
    } else if (rate >= 2.0) {
      return {
        level: 'normal',
        label: '正常周转', 
        color: '#409EFF',
        description: '适度优化库存结构'
      }
    } else if (rate >= 1.0) {
      return {
        level: 'slow',
        label: '缓慢周转',
        color: '#E6A23C',
        description: '考虑促销或减少采购'
      }
    } else {
      return {
        level: 'risk',
        label: '滞销风险',
        color: '#F56C6C',
        description: '重点关注，制定清库计划'
      }
    }
  }
  
  /**
   * 获取周转率级别选项
   * @returns {Array} 级别选项数组
   */
  static getTurnoverLevelOptions() {
    return [
      { value: 'fast', label: '快速周转 (≥4.0)', color: '#67C23A' },
      { value: 'normal', label: '正常周转 (2.0-3.9)', color: '#409EFF' },
      { value: 'slow', label: '缓慢周转 (1.0-1.9)', color: '#E6A23C' },
      { value: 'risk', label: '滞销风险 (<1.0)', color: '#F56C6C' }
    ]
  }
  
  /**
   * 格式化数值显示
   * @param {number} value 数值
   * @param {number} precision 精度，默认2位小数
   * @returns {string} 格式化后的字符串
   */
  static formatNumber(value, precision = 2) {
    if (value === null || value === undefined || isNaN(value)) {
      return '--'
    }
    
    return parseFloat(value).toFixed(precision)
  }
  
  /**
   * 格式化货币显示
   * @param {number} value 金额
   * @param {string} currency 货币符号，默认￥
   * @returns {string} 格式化后的货币字符串
   */
  static formatCurrency(value, currency = '￥') {
    if (value === null || value === undefined || isNaN(value)) {
      return '--'
    }
    
    const num = parseFloat(value)
    const formatted = num.toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    return `${currency}${formatted}`
  }
  
  /**
   * 计算同比增长率
   * @param {number} currentValue 当前值
   * @param {number} previousValue 上期值
   * @returns {number} 增长率（百分比）
   */
  static calculateGrowthRate(currentValue, previousValue) {
    if (!previousValue || previousValue <= 0) {
      return 0
    }
    
    const current = parseFloat(currentValue) || 0
    const previous = parseFloat(previousValue)
    
    return Math.round(((current - previous) / previous * 100) * 100) / 100
  }
  
  /**
   * 验证输入数据的有效性
   * @param {Object} data 数据对象
   * @returns {Object} 验证结果
   */
  static validateData(data) {
    const errors = []
    
    if (!data.beginningInventory && data.beginningInventory !== 0) {
      errors.push('期初库存不能为空')
    }
    
    if (!data.endingInventory && data.endingInventory !== 0) {
      errors.push('期末库存不能为空')
    }
    
    if (!data.costOfGoodsSold && data.costOfGoodsSold !== 0) {
      errors.push('销售成本不能为空')
    }
    
    if (data.beginningInventory < 0 || data.endingInventory < 0) {
      errors.push('库存数量不能为负数')
    }
    
    if (data.costOfGoodsSold < 0) {
      errors.push('销售成本不能为负数')
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    }
  }
}

/**
 * Mixin：周转率计算相关方法
 */
export const turnoverCalculationMixin = {
  methods: {
    /**
     * 计算单个商品的周转率数据
     * @param {Object} item 商品数据
     * @returns {Object} 计算结果
     */
    calculateTurnoverData(item) {
      // 计算平均库存价值
      const averageInventoryValue = TurnoverCalculator.calculateAverageInventoryValue(
        item.beginningInventoryValue,
        item.endingInventoryValue
      )
      
      // 计算周转率
      const turnoverRate = TurnoverCalculator.calculateTurnoverRate(
        item.costOfGoodsSold,
        averageInventoryValue
      )
      
      // 计算周转天数
      const turnoverDays = TurnoverCalculator.calculateTurnoverDays(turnoverRate)
      
      // 获取级别信息
      const levelInfo = TurnoverCalculator.getTurnoverLevel(turnoverRate)
      
      return {
        ...item,
        averageInventoryValue,
        turnoverRate,
        turnoverDays: Math.round(turnoverDays),
        levelInfo
      }
    },
    
    /**
     * 格式化周转率显示
     * @param {number} rate 周转率
     * @returns {string} 格式化字符串
     */
    formatTurnoverRate(rate) {
      return TurnoverCalculator.formatNumber(rate, 2) + '次'
    },
    
    /**
     * 格式化天数显示
     * @param {number} days 天数
     * @returns {string} 格式化字符串
     */
    formatTurnoverDays(days) {
      return Math.round(days) + '天'
    },
    
    /**
     * 获取级别标签组件属性
     * @param {Object} levelInfo 级别信息
     * @returns {Object} 标签属性
     */
    getLevelTagProps(levelInfo) {
      const typeMap = {
        fast: 'success',
        normal: 'primary', 
        slow: 'warning',
        risk: 'danger'
      }
      
      return {
        type: typeMap[levelInfo.level] || 'info',
        effect: 'light'
      }
    }
  }
}