import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'
import user from './modules/user'
import permission from './modules/permission'
import productPerformance from './modules/productPerformance'
import chat from './modules/chat'
import customerService from './modules/customerService'
import getters from './getters'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    user,
    permission,
    productPerformance,
    chat,
    customerService
  },
  getters
})

export default store
