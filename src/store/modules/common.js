const common = {
  namespaced: true,
  state: {
    // 数据字典
    dictionaries: {
      // 性别字典
      gender: [
        { label: '男', value: 1 },
        { label: '女', value: 0 }
      ],
      // 商品状态字典
      productStatus: [
        { label: '下架', value: 0 },
        { label: '上架', value: 1 }
      ],
      // 订单状态字典
      orderStatus: [
        { label: '待付款', value: 0 },
        { label: '待发货', value: 1 },
        { label: '已发货', value: 2 },
        { label: '已完成', value: 3 },
        { label: '已关闭', value: 4 },
        { label: '无效订单', value: 5 }
      ],
      // 会员等级字典
      memberLevel: [
        { label: '普通会员', value: 1 },
        { label: '黄金会员', value: 2 },
        { label: '白金会员', value: 3 },
        { label: '钻石会员', value: 4 }
      ],
      // 商品分类状态
      categoryStatus: [
        { label: '不显示', value: 0 },
        { label: '显示', value: 1 }
      ],
      // 品牌状态
      brandStatus: [
        { label: '不显示', value: 0 },
        { label: '显示', value: 1 }
      ],
      // 优惠券类型
      couponType: [
        { label: '全场通用', value: 0 },
        { label: '指定分类', value: 1 },
        { label: '指定商品', value: 2 }
      ],
      // 优惠券状态
      couponStatus: [
        { label: '未发布', value: 0 },
        { label: '已发布', value: 1 },
        { label: '已过期', value: 2 }
      ],
      // 广告类型
      advertisementType: [
        { label: '首页轮播', value: 0 },
        { label: '首页广告', value: 1 },
        { label: '推荐广告', value: 2 }
      ],
      // 广告状态
      advertisementStatus: [
        { label: '下线', value: 0 },
        { label: '上线', value: 1 }
      ]
    },
    
    // 系统常量
    constants: {
      // 分页相关
      pagination: {
        defaultPageSize: 10,
        pageSizes: [10, 20, 50, 100],
        layout: 'total, sizes, prev, pager, next, jumper'
      },
      
      // 文件上传相关
      upload: {
        maxSize: 2 * 1024 * 1024, // 2MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif']
      },
      
      // 表单验证相关
      validation: {
        username: {
          minLength: 3,
          maxLength: 20,
          pattern: /^[a-zA-Z0-9_]+$/
        },
        password: {
          minLength: 6,
          maxLength: 20,
          pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]/
        },
        email: {
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        phone: {
          pattern: /^1[3-9]\d{9}$/
        }
      },
      
      // 业务常量
      business: {
        // 订单相关
        order: {
          autoCloseTime: 30 * 60 * 1000, // 30分钟自动关闭未付款订单
          autoReceiveTime: 7 * 24 * 60 * 60 * 1000, // 7天自动确认收货
          refundExpireTime: 15 * 24 * 60 * 60 * 1000 // 15天售后期限
        },
        
        // 商品相关
        product: {
          maxImages: 9, // 最大图片数量
          maxSpecs: 50, // 最大规格数量
          defaultSort: 0 // 默认排序值
        },
        
        // 优惠券相关
        coupon: {
          maxUseCount: 1, // 默认最大使用次数
          minOrderAmount: 0, // 默认最小订单金额
          validityDays: 30 // 默认有效期天数
        }
      }
    },
    
    // 全局配置
    configs: {
      // 系统信息
      system: {
        name: 'Mall Admin',
        version: '1.0.0',
        description: '商城后台管理系统',
        copyright: '© 2024 Mall Admin'
      },
      
      // 接口配置
      api: {
        timeout: 15000,
        retryCount: 3,
        baseURL: process.env.BASE_API || '/api'
      },
      
      // 缓存配置
      cache: {
        // 各类数据的默认缓存时间（毫秒）
        userInfo: 30 * 60 * 1000, // 30分钟
        permissions: 60 * 60 * 1000, // 1小时
        dictionaries: 24 * 60 * 60 * 1000, // 24小时
        productList: 5 * 60 * 1000, // 5分钟
        categoryList: 10 * 60 * 1000, // 10分钟
        brandList: 10 * 60 * 1000 // 10分钟
      },
      
      // UI配置
      ui: {
        // 表格配置
        table: {
          stripe: true,
          border: true,
          size: 'small',
          emptyText: '暂无数据'
        },
        
        // 消息提示配置
        message: {
          duration: 3000,
          showClose: true
        },
        
        // 确认对话框配置
        confirm: {
          type: 'warning',
          title: '提示',
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }
      }
    },
    
    // 加载状态
    dictionariesLoading: false,
    configsLoading: false,
    
    // 是否已初始化
    initialized: false
  },
  
  mutations: {
    // 设置字典数据
    SET_DICTIONARIES: (state, dictionaries) => {
      state.dictionaries = { ...state.dictionaries, ...dictionaries }
    },
    
    // 设置单个字典
    SET_DICTIONARY: (state, { key, data }) => {
      state.dictionaries = {
        ...state.dictionaries,
        [key]: data
      }
    },
    
    // 设置常量
    SET_CONSTANTS: (state, constants) => {
      state.constants = { ...state.constants, ...constants }
    },
    
    // 设置配置
    SET_CONFIGS: (state, configs) => {
      state.configs = { ...state.configs, ...configs }
    },
    
    // 设置单个配置
    SET_CONFIG: (state, { key, data }) => {
      state.configs = {
        ...state.configs,
        [key]: data
      }
    },
    
    // 设置加载状态
    SET_DICTIONARIES_LOADING: (state, loading) => {
      state.dictionariesLoading = loading
    },
    
    SET_CONFIGS_LOADING: (state, loading) => {
      state.configsLoading = loading
    },
    
    // 设置初始化状态
    SET_INITIALIZED: (state, initialized) => {
      state.initialized = initialized
    },
    
    // 初始化通用数据
    INIT_COMMON_DATA: (state) => {
      // 从localStorage恢复配置
      const savedConfigs = localStorage.getItem('commonConfigs')
      if (savedConfigs) {
        try {
          const parsedConfigs = JSON.parse(savedConfigs)
          state.configs = { ...state.configs, ...parsedConfigs }
        } catch (error) {
          console.warn('Failed to parse saved configs:', error)
        }
      }
      
      // 从localStorage恢复字典数据
      const savedDictionaries = localStorage.getItem('commonDictionaries')
      if (savedDictionaries) {
        try {
          const parsedDictionaries = JSON.parse(savedDictionaries)
          state.dictionaries = { ...state.dictionaries, ...parsedDictionaries }
        } catch (error) {
          console.warn('Failed to parse saved dictionaries:', error)
        }
      }
      
      state.initialized = true
    }
  },
  
  actions: {
    // 初始化通用数据
    initCommonData({ commit, state }) {
      if (state.initialized) {
        return Promise.resolve()
      }
      
      return new Promise((resolve) => {
        commit('INIT_COMMON_DATA')
        resolve()
      })
    },
    
    // 更新字典数据
    updateDictionaries({ commit }, dictionaries) {
      commit('SET_DICTIONARIES', dictionaries)
      
      // 保存到localStorage
      try {
        localStorage.setItem('commonDictionaries', JSON.stringify(dictionaries))
      } catch (error) {
        console.warn('Failed to save dictionaries to localStorage:', error)
      }
    },
    
    // 更新单个字典
    updateDictionary({ commit, state }, { key, data }) {
      commit('SET_DICTIONARY', { key, data })
      
      // 保存到localStorage
      try {
        localStorage.setItem('commonDictionaries', JSON.stringify(state.dictionaries))
      } catch (error) {
        console.warn('Failed to save dictionary to localStorage:', error)
      }
    },
    
    // 更新配置
    updateConfigs({ commit }, configs) {
      commit('SET_CONFIGS', configs)
      
      // 保存到localStorage
      try {
        localStorage.setItem('commonConfigs', JSON.stringify(configs))
      } catch (error) {
        console.warn('Failed to save configs to localStorage:', error)
      }
    },
    
    // 更新单个配置
    updateConfig({ commit, state }, { key, data }) {
      commit('SET_CONFIG', { key, data })
      
      // 保存到localStorage
      try {
        localStorage.setItem('commonConfigs', JSON.stringify(state.configs))
      } catch (error) {
        console.warn('Failed to save config to localStorage:', error)
      }
    },
    
    // 重置所有数据
    resetCommonData({ commit }) {
      // 清除localStorage
      localStorage.removeItem('commonConfigs')
      localStorage.removeItem('commonDictionaries')
      
      // 重置状态
      commit('SET_INITIALIZED', false)
      commit('INIT_COMMON_DATA')
    },
    
    // 从服务器同步字典数据（如果有相关API）
    async syncDictionaries({ commit }) {
      commit('SET_DICTIONARIES_LOADING', true)
      
      try {
        // 这里可以调用API获取最新的字典数据
        // const response = await getDictionaries()
        // commit('SET_DICTIONARIES', response.data)
        
        // 暂时使用默认数据
        await new Promise(resolve => setTimeout(resolve, 500)) // 模拟API调用
        
        return true
      } catch (error) {
        console.error('同步字典数据失败:', error)
        throw error
      } finally {
        commit('SET_DICTIONARIES_LOADING', false)
      }
    },
    
    // 从服务器同步配置数据（如果有相关API）
    async syncConfigs({ commit }) {
      commit('SET_CONFIGS_LOADING', true)
      
      try {
        // 这里可以调用API获取最新的配置数据
        // const response = await getConfigs()
        // commit('SET_CONFIGS', response.data)
        
        // 暂时使用默认数据
        await new Promise(resolve => setTimeout(resolve, 500)) // 模拟API调用
        
        return true
      } catch (error) {
        console.error('同步配置数据失败:', error)
        throw error
      } finally {
        commit('SET_CONFIGS_LOADING', false)
      }
    }
  },
  
  getters: {
    // 字典相关getters
    dictionaries: state => state.dictionaries,
    dictionariesLoading: state => state.dictionariesLoading,
    
    // 根据key获取字典
    getDictionary: (state) => (key) => {
      return state.dictionaries[key] || []
    },
    
    // 根据字典key和value获取label
    getDictionaryLabel: (state) => (key, value) => {
      const dictionary = state.dictionaries[key] || []
      const item = dictionary.find(item => item.value === value)
      return item ? item.label : value
    },
    
    // 常量相关getters
    constants: state => state.constants,
    
    // 根据路径获取常量值
    getConstant: (state) => (path) => {
      const keys = path.split('.')
      let value = state.constants
      
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key]
        } else {
          return undefined
        }
      }
      
      return value
    },
    
    // 配置相关getters
    configs: state => state.configs,
    configsLoading: state => state.configsLoading,
    
    // 根据路径获取配置值
    getConfig: (state) => (path, defaultValue = null) => {
      const keys = path.split('.')
      let value = state.configs
      
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key]
        } else {
          return defaultValue
        }
      }
      
      return value
    },
    
    // 系统信息
    systemInfo: state => state.configs.system,
    
    // API配置
    apiConfig: state => state.configs.api,
    
    // 缓存配置
    cacheConfig: state => state.configs.cache,
    
    // UI配置
    uiConfig: state => state.configs.ui,
    
    // 分页配置
    paginationConfig: state => state.configs.pagination,
    
    // 上传配置
    uploadConfig: state => state.constants.upload,
    
    // 验证规则
    validationRules: state => state.constants.validation,
    
    // 业务常量
    businessConstants: state => state.constants.business,
    
    // 初始化状态
    initialized: state => state.initialized,
    
    // 检查是否需要同步数据
    needSync: (state) => {
      // 可以根据时间戳或版本号判断是否需要同步
      return !state.initialized
    }
  }
}

export default common