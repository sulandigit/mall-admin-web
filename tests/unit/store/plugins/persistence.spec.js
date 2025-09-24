import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import createPersistencePlugin, { 
  serialize, 
  deserialize, 
  getValueByPath, 
  setValueByPath 
} from '@/store/plugins/persistence'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('persistence plugin', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  
  describe('工具函数', () => {
    describe('serialize/deserialize', () => {
      it('应该正确序列化和反序列化数据', () => {
        const data = { name: 'test', value: 123 }
        const serialized = serialize(data)
        const deserialized = deserialize(serialized)
        
        expect(deserialized).toEqual(data)
      })
      
      it('应该处理过期数据', () => {
        const data = { name: 'test' }
        const expires = Date.now() - 1000 // 已过期
        const serialized = serialize(data, expires)
        const deserialized = deserialize(serialized)
        
        expect(deserialized).toBeNull()
      })
      
      it('应该处理无效的序列化数据', () => {
        const invalidData = 'invalid json'
        const deserialized = deserialize(invalidData)
        
        expect(deserialized).toBeNull()
      })
    })
    
    describe('getValueByPath/setValueByPath', () => {
      it('应该正确获取和设置嵌套对象的值', () => {
        const obj = { a: { b: { c: 'test' } } }
        
        expect(getValueByPath(obj, 'a.b.c')).toBe('test')
        expect(getValueByPath(obj, 'a.b.d')).toBeUndefined()
        
        setValueByPath(obj, 'a.b.d', 'new value')
        expect(obj.a.b.d).toBe('new value')
        
        setValueByPath(obj, 'x.y.z', 'deep value')
        expect(obj.x.y.z).toBe('deep value')
      })
    })
  })
  
  describe('插件功能', () => {
    let store
    
    const testModule1 = {
      namespaced: true,
      state: {
        data1: 'value1',
        data2: 'value2',
        temporary: 'temp'
      },
      mutations: {
        SET_DATA1: (state, value) => {
          state.data1 = value
        },
        SET_DATA2: (state, value) => {
          state.data2 = value
        },
        SET_TEMPORARY: (state, value) => {
          state.temporary = value
        }
      }
    }
    
    const testModule2 = {
      namespaced: true,
      state: {
        config: { theme: 'light', lang: 'zh' }
      },
      mutations: {
        SET_CONFIG: (state, config) => {
          state.config = { ...state.config, ...config }
        }
      }
    }
    
    beforeEach(() => {
      store = new Vuex.Store({
        modules: {
          test1: testModule1,
          test2: testModule2
        },
        plugins: [
          createPersistencePlugin({
            keyPrefix: 'test-',
            modules: {
              test1: {
                paths: ['data1', 'data2'],
                storage: 'local'
              },
              test2: {
                paths: ['config'],
                storage: 'session',
                expires: 5000 // 5秒过期
              }
            },
            blacklist: ['SET_TEMPORARY']
          })
        ]
      })
    })
    
    it('应该持久化指定模块的状态', () => {
      store.commit('test1/SET_DATA1', 'new value1')
      store.commit('test1/SET_DATA2', 'new value2')
      
      // 检查localStorage
      const persistedData = localStorage.getItem('test-test1')
      expect(persistedData).toBeTruthy()
      
      const parsed = JSON.parse(persistedData)
      expect(parsed.data.data1).toBe('new value1')
      expect(parsed.data.data2).toBe('new value2')
      expect(parsed.data.temporary).toBeUndefined() // 不在paths中
    })
    
    it('应该从存储中恢复状态', () => {
      // 先设置一些数据到localStorage
      const dataToRestore = {
        data1: 'restored value1',
        data2: 'restored value2'
      }
      localStorage.setItem('test-test1', serialize(dataToRestore))
      
      // 创建新的store实例
      const newStore = new Vuex.Store({
        modules: {
          test1: testModule1
        },
        plugins: [
          createPersistencePlugin({
            keyPrefix: 'test-',
            modules: {
              test1: {
                paths: ['data1', 'data2'],
                storage: 'local'
              }
            }
          })
        ]
      })
      
      expect(newStore.state.test1.data1).toBe('restored value1')
      expect(newStore.state.test1.data2).toBe('restored value2')
    })
    
    it('应该使用sessionStorage', () => {
      store.commit('test2/SET_CONFIG', { theme: 'dark' })
      
      const persistedData = sessionStorage.getItem('test-test2')
      expect(persistedData).toBeTruthy()
      
      const parsed = JSON.parse(persistedData)
      expect(parsed.data.config.theme).toBe('dark')
    })
    
    it('应该尊重黑名单配置', () => {
      store.commit('test1/SET_TEMPORARY', 'should not persist')
      
      const persistedData = localStorage.getItem('test-test1')
      expect(persistedData).toBeFalsy()
    })
    
    it('应该处理过期数据', async () => {
      // 设置一个快速过期的数据
      const expiredData = {
        config: { theme: 'expired' }
      }
      const expiredTime = Date.now() - 1000 // 1秒前过期
      sessionStorage.setItem('test-test2', serialize(expiredData, expiredTime))
      
      // 创建新store，应该不会恢复过期数据
      const newStore = new Vuex.Store({
        modules: {
          test2: testModule2
        },
        plugins: [
          createPersistencePlugin({
            keyPrefix: 'test-',
            modules: {
              test2: {
                paths: ['config'],
                storage: 'session',
                expires: 5000
              }
            }
          })
        ]
      })
      
      expect(newStore.state.test2.config.theme).toBe('light') // 默认值
    })
    
    it('应该提供持久化API方法', () => {
      expect(store.$persistence).toBeDefined()
      expect(typeof store.$persistence.persistModule).toBe('function')
      expect(typeof store.$persistence.restoreModule).toBe('function')
      expect(typeof store.$persistence.clearModule).toBe('function')
      expect(typeof store.$persistence.clearAll).toBe('function')
      expect(typeof store.$persistence.getConfig).toBe('function')
      expect(typeof store.$persistence.hasPersistedData).toBe('function')
      expect(typeof store.$persistence.getPersistedInfo).toBe('function')
    })
    
    it('应该正确检查持久化数据是否存在', () => {
      // 初始状态，没有持久化数据
      expect(store.$persistence.hasPersistedData('test1')).toBe(false)
      
      // 提交一个mutation，应该触发持久化
      store.commit('test1/SET_DATA1', 'test value')
      
      // 现在应该有持久化数据
      expect(store.$persistence.hasPersistedData('test1')).toBe(true)
    })
    
    it('应该正确获取持久化信息', () => {
      // 提交mutation触发持久化
      store.commit('test1/SET_DATA1', 'test value')
      
      const info = store.$persistence.getPersistedInfo('test1')
      expect(info).toBeTruthy()
      expect(typeof info.timestamp).toBe('number')
      expect(info.isExpired).toBe(false)
      expect(typeof info.size).toBe('number')
    })
    
    it('应该能够清除持久化数据', () => {
      // 先持久化一些数据
      store.commit('test1/SET_DATA1', 'test value')
      expect(store.$persistence.hasPersistedData('test1')).toBe(true)
      
      // 清除指定模块的数据
      store.$persistence.clearModule('test1')
      expect(store.$persistence.hasPersistedData('test1')).toBe(false)
    })
    
    it('应该能够清除所有持久化数据', () => {
      // 持久化多个模块的数据
      store.commit('test1/SET_DATA1', 'test value1')
      store.commit('test2/SET_CONFIG', { theme: 'dark' })
      
      expect(store.$persistence.hasPersistedData('test1')).toBe(true)
      expect(store.$persistence.hasPersistedData('test2')).toBe(true)
      
      // 清除所有数据
      store.$persistence.clearAll()
      
      expect(store.$persistence.hasPersistedData('test1')).toBe(false)
      expect(store.$persistence.hasPersistedData('test2')).toBe(false)
    })
    
    it('应该返回正确的配置信息', () => {
      const config = store.$persistence.getConfig()
      
      expect(config.keyPrefix).toBe('test-')
      expect(config.modules.test1).toBeDefined()
      expect(config.modules.test2).toBeDefined()
      expect(config.blacklist).toContain('SET_TEMPORARY')
    })
  })
  
  describe('错误处理', () => {
    it('应该处理存储配额超出错误', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      
      // Mock localStorage.setItem to throw an error
      const originalSetItem = localStorage.setItem
      localStorage.setItem = jest.fn(() => {
        throw new Error('QuotaExceededError')
      })
      
      const store = new Vuex.Store({
        modules: {
          test: {
            namespaced: true,
            state: { data: 'value' },
            mutations: {
              SET_DATA: (state, value) => { state.data = value }
            }
          }
        },
        plugins: [
          createPersistencePlugin({
            modules: {
              test: { paths: ['data'] }
            }
          })
        ]
      })
      
      // 这应该不会抛出错误，而是输出警告
      store.commit('test/SET_DATA', 'new value')
      
      expect(consoleSpy).toHaveBeenCalled()
      
      // 恢复原始方法
      localStorage.setItem = originalSetItem
      consoleSpy.mockRestore()
    })
  })
})