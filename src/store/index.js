import { createPinia } from 'pinia'
import { createApp } from 'vue'

// 临时兼容 - 先创建空的store对象
const store = {
  state: {},
  getters: {},
  dispatch: () => Promise.resolve(),
  commit: () => {}
}

export default store
