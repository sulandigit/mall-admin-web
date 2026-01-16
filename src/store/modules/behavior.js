/**
 * 用户行为状态管理模块 2026
 */
import {
  recordPageVisit,
  getCurrentVisit,
  setCurrentVisit,
  clearCurrentVisit
} from '@/utils/behavior'

const behavior = {
  state: {
    currentVisit: null // 当前访问信息 2026
  },

  mutations: {
    // 设置当前访问信息 2026
    SET_CURRENT_VISIT: (state, visit) => {
      state.currentVisit = visit
    }
  },

  actions: {
    // 开始记录页面访问 2026
    StartVisit({ commit }, routeInfo) {
      const visitData = {
        path: routeInfo.path,
        name: routeInfo.name,
        title: routeInfo.title,
        module: routeInfo.module,
        enterTime: Date.now()
      }
      setCurrentVisit(visitData)
      commit('SET_CURRENT_VISIT', visitData)
    },

    // 结束当前页面访问并保存记录 2026
    EndVisit({ commit, state, rootGetters }) {
      const current = state.currentVisit || getCurrentVisit()
      if (!current) return

      const leaveTime = Date.now()
      const duration = leaveTime - current.enterTime

      // 只记录停留时间大于1秒的访问 2026
      if (duration > 1000) {
        recordPageVisit({
          userId: rootGetters.name || '',
          path: current.path,
          name: current.name,
          title: current.title,
          module: current.module,
          enterTime: current.enterTime,
          leaveTime: leaveTime,
          duration: duration
        })
      }

      clearCurrentVisit()
      commit('SET_CURRENT_VISIT', null)
    }
  }
}

export default behavior
