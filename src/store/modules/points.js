import {
  fetchPointsRules,
  createPointsRule,
  updatePointsRule,
  deletePointsRule,
  toggleRuleStatus
} from '@/api/pointsRules'
import {
  fetchPointsRecords,
  adjustPoints,
  getMemberPoints
} from '@/api/pointsRecords'
import {
  fetchExchangeItems,
  fetchExchangeRecords,
  auditExchange
} from '@/api/pointsExchange'
import {
  getPointsOverview,
  getPointsTrend,
  getUserDistribution,
  getExchangeStats
} from '@/api/pointsAnalytics'
import { fetchMemberLevels } from '@/api/memberLevel'

const points = {
  state: {
    // 积分规则
    pointsRules: [],
    rulesTotal: 0,
    rulesLoading: false,
    
    // 积分记录
    pointsRecords: {
      list: [],
      total: 0,
      pageNum: 1,
      pageSize: 10
    },
    recordsLoading: false,
    
    // 兑换商品
    exchangeItems: [],
    exchangeItemsTotal: 0,
    exchangeItemsLoading: false,
    
    // 兑换记录
    exchangeRecords: {
      list: [],
      total: 0,
      pageNum: 1,
      pageSize: 10
    },
    exchangeRecordsLoading: false,
    
    // 会员等级
    memberLevels: [],
    levelsLoading: false,
    
    // 统计数据
    analyticsData: {
      overview: {},
      trend: [],
      distribution: [],
      exchangeStats: {}
    },
    analyticsLoading: false,
    
    // 用户积分余额缓存
    memberPointsCache: new Map()
  },

  mutations: {
    // 积分规则相关
    SET_POINTS_RULES(state, { list, total }) {
      state.pointsRules = list
      state.rulesTotal = total
    },
    SET_RULES_LOADING(state, loading) {
      state.rulesLoading = loading
    },
    ADD_POINTS_RULE(state, rule) {
      state.pointsRules.unshift(rule)
      state.rulesTotal += 1
    },
    UPDATE_POINTS_RULE(state, updatedRule) {
      const index = state.pointsRules.findIndex(rule => rule.id === updatedRule.id)
      if (index !== -1) {
        state.pointsRules.splice(index, 1, updatedRule)
      }
    },
    REMOVE_POINTS_RULE(state, ruleId) {
      const index = state.pointsRules.findIndex(rule => rule.id === ruleId)
      if (index !== -1) {
        state.pointsRules.splice(index, 1)
        state.rulesTotal -= 1
      }
    },
    
    // 积分记录相关
    SET_POINTS_RECORDS(state, data) {
      state.pointsRecords = { ...state.pointsRecords, ...data }
    },
    SET_RECORDS_LOADING(state, loading) {
      state.recordsLoading = loading
    },
    ADD_POINTS_RECORD(state, record) {
      state.pointsRecords.list.unshift(record)
      state.pointsRecords.total += 1
    },
    
    // 兑换商品相关
    SET_EXCHANGE_ITEMS(state, { list, total }) {
      state.exchangeItems = list
      state.exchangeItemsTotal = total
    },
    SET_EXCHANGE_ITEMS_LOADING(state, loading) {
      state.exchangeItemsLoading = loading
    },
    
    // 兑换记录相关
    SET_EXCHANGE_RECORDS(state, data) {
      state.exchangeRecords = { ...state.exchangeRecords, ...data }
    },
    SET_EXCHANGE_RECORDS_LOADING(state, loading) {
      state.exchangeRecordsLoading = loading
    },
    
    // 会员等级相关
    SET_MEMBER_LEVELS(state, levels) {
      state.memberLevels = levels
    },
    SET_LEVELS_LOADING(state, loading) {
      state.levelsLoading = loading
    },
    
    // 统计数据相关
    SET_ANALYTICS_DATA(state, { type, data }) {
      state.analyticsData[type] = data
    },
    SET_ANALYTICS_LOADING(state, loading) {
      state.analyticsLoading = loading
    },
    
    // 用户积分缓存
    SET_MEMBER_POINTS(state, { memberId, points }) {
      state.memberPointsCache.set(memberId, points)
    }
  },

  actions: {
    // 获取积分规则列表
    async fetchPointsRules({ commit }, params) {
      commit('SET_RULES_LOADING', true)
      try {
        const response = await fetchPointsRules(params)
        commit('SET_POINTS_RULES', {
          list: response.data.list,
          total: response.data.total
        })
        return response
      } catch (error) {
        console.error('获取积分规则失败:', error)
        throw error
      } finally {
        commit('SET_RULES_LOADING', false)
      }
    },
    
    // 创建积分规则
    async createPointsRule({ commit }, ruleData) {
      try {
        const response = await createPointsRule(ruleData)
        commit('ADD_POINTS_RULE', response.data)
        return response
      } catch (error) {
        console.error('创建积分规则失败:', error)
        throw error
      }
    },
    
    // 获取积分记录列表
    async fetchPointsRecords({ commit }, params) {
      commit('SET_RECORDS_LOADING', true)
      try {
        const response = await fetchPointsRecords(params)
        commit('SET_POINTS_RECORDS', {
          list: response.data.list,
          total: response.data.total
        })
        return response
      } catch (error) {
        console.error('获取积分记录失败:', error)
        throw error
      } finally {
        commit('SET_RECORDS_LOADING', false)
      }
    },
    
    // 获取积分统计概览
    async fetchPointsOverview({ commit }, params) {
      commit('SET_ANALYTICS_LOADING', true)
      try {
        const response = await getPointsOverview(params)
        commit('SET_ANALYTICS_DATA', {
          type: 'overview',
          data: response.data
        })
        return response
      } catch (error) {
        console.error('获取积分概览失败:', error)
        throw error
      } finally {
        commit('SET_ANALYTICS_LOADING', false)
      }
    }
  }
}

export default points