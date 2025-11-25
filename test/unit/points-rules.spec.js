import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import ElementUI from 'element-ui'
import PointsRules from '@/views/member/points/rules.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(ElementUI)

describe('PointsRules.vue', () => {
  let wrapper
  let store
  let actions

  beforeEach(() => {
    actions = {
      fetchPointsRules: jest.fn(() => Promise.resolve({
        data: {
          list: [
            { id: 1, ruleName: '购物积分', ruleType: 'EARN', isActive: true },
            { id: 2, ruleName: '登录积分', ruleType: 'EARN', isActive: true }
          ],
          total: 2
        }
      }))
    }

    store = new Vuex.Store({
      actions
    })

    wrapper = mount(PointsRules, {
      store,
      localVue
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('should render correctly', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.app-container').exists()).toBe(true)
  })

  it('should load rules data on created', () => {
    expect(actions.fetchPointsRules).toHaveBeenCalled()
  })

  it('should display search form', () => {
    expect(wrapper.find('input[placeholder="规则名称"]').exists()).toBe(true)
    expect(wrapper.find('.el-select').exists()).toBe(true)
    expect(wrapper.find('.el-button').exists()).toBe(true)
  })

  it('should display rules table', () => {
    expect(wrapper.find('.el-table').exists()).toBe(true)
    expect(wrapper.find('.el-table-column').exists()).toBe(true)
  })

  it('should handle search filter', async () => {
    const searchInput = wrapper.find('input[placeholder="规则名称"]')
    await searchInput.setValue('购物')
    
    const searchBtn = wrapper.find('.el-button')
    await searchBtn.trigger('click')
    
    expect(actions.fetchPointsRules).toHaveBeenCalledTimes(2)
  })

  it('should handle create button click', async () => {
    const createBtn = wrapper.find('.el-button[type="primary"]')
    await createBtn.trigger('click')
    
    // 应该显示创建消息
    // 由于我们在组件中使用了 this.$message，需要 mock
  })
})