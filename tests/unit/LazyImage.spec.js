/**
 * LazyImage组件单元测试
 */

import { mount, createLocalVue } from '@vue/test-utils'
import LazyImage from '@/components/LazyImage'
import Vuex from 'vuex'

const localVue = createLocalVue()
localVue.use(Vuex)

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback, options) {
    this.callback = callback
    this.options = options
  }

  observe(target) {
    // 模拟进入视口
    setTimeout(() => {
      this.callback([{ target, isIntersecting: true }])
    }, 100)
  }

  unobserve() {}
  disconnect() {}
}

// Mock Image
global.Image = class {
  constructor() {
    setTimeout(() => {
      this.onload && this.onload()
    }, 100)
  }
}

describe('LazyImage.vue', () => {
  let wrapper
  let store

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        imageOptimization: {
          namespaced: true,
          getters: {
            isWebPSupported: () => true,
            isWebPEnabled: () => true
          }
        }
      }
    })

    wrapper = mount(LazyImage, {
      localVue,
      store,
      propsData: {
        src: 'https://example.com/test.jpg',
        width: 200,
        height: 200
      }
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.lazy-image-container').exists()).toBe(true)
  })

  it('shows placeholder initially', () => {
    expect(wrapper.find('.lazy-placeholder').exists()).toBe(true)
    expect(wrapper.find('.lazy-image').exists()).toBe(false)
  })

  it('loads image when in viewport', async () => {
    // 等待 IntersectionObserver 触发
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // 等待图片加载
    await new Promise(resolve => setTimeout(resolve, 200))
    
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.loaded).toBe(true)
    expect(wrapper.find('.lazy-image').exists()).toBe(true)
  })

  it('handles WebP conversion correctly', async () => {
    const webpSrc = 'https://example.com/test.webp'
    await wrapper.setProps({ webpSrc })
    
    // 等待加载
    await new Promise(resolve => setTimeout(resolve, 300))
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.finalSrc).toBe(webpSrc)
  })

  it('emits load event on successful load', async () => {
    // 等待加载完成
    await new Promise(resolve => setTimeout(resolve, 300))
    await wrapper.vm.$nextTick()
    
    expect(wrapper.emitted('load')).toBeTruthy()
  })

  it('shows error state on load failure', async () => {
    // Mock 图片加载失败
    global.Image = class {
      constructor() {
        setTimeout(() => {
          this.onerror && this.onerror()
        }, 100)
      }
    }

    wrapper = mount(LazyImage, {
      localVue,
      store,
      propsData: {
        src: 'https://example.com/invalid.jpg'
      }
    })

    // 等待加载和错误处理
    await new Promise(resolve => setTimeout(resolve, 300))
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.error).toBe(true)
    expect(wrapper.find('.lazy-error').exists()).toBe(true)
  })

  it('supports manual reload', async () => {
    // 先触发错误
    wrapper.setData({ error: true })
    
    // 调用reload
    wrapper.vm.reload()
    
    expect(wrapper.vm.error).toBe(false)
    expect(wrapper.vm.loaded).toBe(false)
    expect(wrapper.vm.loading).toBe(false)
  })

  it('applies correct container styles', () => {
    const container = wrapper.find('.lazy-image-container')
    const style = container.element.style
    
    expect(style.width).toBe('200px')
    expect(style.height).toBe('200px')
  })

  it('handles threshold prop correctly', () => {
    const threshold = '100px'
    wrapper = mount(LazyImage, {
      localVue,
      store,
      propsData: {
        src: 'https://example.com/test.jpg',
        threshold
      }
    })

    expect(wrapper.props('threshold')).toBe(threshold)
  })
})