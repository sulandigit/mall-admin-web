import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'
import user from './modules/user'
import permission from './modules/permission'
import product from './modules/product'
import ui from './modules/ui'
import cache from './modules/cache'
import getters from './getters'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    user,
    permission,
    product,
    ui,
    cache
  },
  getters
})

export default store
