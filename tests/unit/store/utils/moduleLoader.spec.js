import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import { loadModule, loadModules, isModuleLoaded, createLazyLoadPlugin } from '@/store/utils/moduleLoader'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('moduleLoader', () => {
  let store
  
  const mockModule = {
    namespaced: true,
    state: { data: 'test' },
    mutations: { SET_DATA: (state, data) => { state.data = data } }
  }
  
  beforeEach(() => {
    store = new Vuex.Store({ state: { test: 'root' }, modules: {} })
  })
  
  describe('模块状态检查', () => {
    it('应该正确检查模块是否已加载', () => {
      expect(isModuleLoaded('testModule')).toBe(false)
    })
  })
  
  describe('单个模块加载', () => {
    it('应该成功加载模块', async () => {
      // Mock动态导入
      const mockLoader = () => Promise.resolve({ default: mockModule })
      require('@/store/utils/moduleLoader').moduleLoaders = { testModule: mockLoader }
      
      const success = await loadModule(store, 'testModule')
      
      expect(success).toBe(true)
      expect(store.hasModule('testModule')).toBe(true)
    })
  })
  
  describe('批量模块加载', () => {
    it('应该成功加载多个模块', async () => {
      const mockLoaders = {
        module1: () => Promise.resolve({ default: mockModule }),
        module2: () => Promise.resolve({ default: mockModule })
      }
      require('@/store/utils/moduleLoader').moduleLoaders = mockLoaders
      
      const result = await loadModules(store, ['module1', 'module2'])
      
      expect(result.success).toEqual(['module1', 'module2'])
      expect(result.failed).toEqual([])
    })
  })
  
  describe('懒加载插件', () => {
    it('应该创建插件并添加到store', () => {
      const plugin = createLazyLoadPlugin()
      plugin(store)
      
      expect(store.$moduleLoader).toBeDefined()
      expect(typeof store.$moduleLoader.loadModule).toBe('function')
    })
  })
})