/**
 * WebPUpload组件单元测试
 */

import { mount, createLocalVue } from '@vue/test-utils'
import WebPUpload from '@/components/WebPUpload'
import ElementUI from 'element-ui'

const localVue = createLocalVue()
localVue.use(ElementUI)

// Mock HTMLCanvasElement
global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  drawImage: jest.fn(),
}))

global.HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
  const blob = new Blob(['test'], { type: 'image/webp' })
  callback(blob)
})

// Mock FileReader
global.FileReader = class {
  readAsDataURL(file) {
    this.result = 'data:image/jpeg;base64,test'
    setTimeout(() => {
      this.onload && this.onload({ target: this })
    }, 100)
  }
}

// Mock Image
global.Image = class {
  constructor() {
    this.width = 800
    this.height = 600
    setTimeout(() => {
      this.onload && this.onload()
    }, 100)
  }
}

describe('WebPUpload.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(WebPUpload, {
      localVue,
      propsData: {
        value: '',
        autoConvert: true,
        quality: 80
      }
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.webp-upload-container').exists()).toBe(true)
    expect(wrapper.find('.el-upload').exists()).toBe(true)
  })

  it('validates file type correctly', () => {
    const validFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
    const invalidFile = new File([''], 'test.txt', { type: 'text/plain' })

    expect(wrapper.vm.validateFileType(validFile)).toBe(true)
    expect(wrapper.vm.validateFileType(invalidFile)).toBe(false)
  })

  it('validates file size correctly', () => {
    const smallFile = { size: 1024 * 1024 } // 1MB
    const largeFile = { size: 50 * 1024 * 1024 } // 50MB

    expect(wrapper.vm.validateFileSize(smallFile)).toBe(true)
    expect(wrapper.vm.validateFileSize(largeFile)).toBe(false)
  })

  it('determines WebP conversion correctly', () => {
    const jpegFile = { type: 'image/jpeg' }
    const pngFile = { type: 'image/png' }
    const webpFile = { type: 'image/webp' }

    expect(wrapper.vm.shouldConvertToWebP(jpegFile)).toBe(true)
    expect(wrapper.vm.shouldConvertToWebP(pngFile)).toBe(true)
    expect(wrapper.vm.shouldConvertToWebP(webpFile)).toBe(false)
  })

  it('converts file to WebP successfully', async () => {
    const originalFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    
    const convertedFile = await wrapper.vm.convertToWebP(originalFile)
    
    expect(convertedFile).toBeInstanceOf(File)
    expect(convertedFile.type).toBe('image/webp')
    expect(convertedFile.name).toBe('test.webp')
  })

  it('emits input event on file change', async () => {
    const file = {
      name: 'test.jpg',
      url: 'https://example.com/test.jpg',
      size: 1024,
      type: 'image/jpeg'
    }

    wrapper.vm.fileList = [file]
    wrapper.vm.emitInput()

    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('input')).toBeTruthy()
    expect(wrapper.emitted('input')[0][0]).toBe(file.url)
  })

  it('handles multiple files correctly', async () => {
    await wrapper.setProps({ multiple: true })

    const files = [
      { url: 'https://example.com/test1.jpg' },
      { url: 'https://example.com/test2.jpg' }
    ]

    wrapper.vm.fileList = files
    wrapper.vm.emitInput()

    await wrapper.vm.$nextTick()

    const emittedValue = wrapper.emitted('input')[0][0]
    expect(Array.isArray(emittedValue)).toBe(true)
    expect(emittedValue).toHaveLength(2)
  })

  it('shows upload progress correctly', async () => {
    wrapper.setData({ convertDialogVisible: true, convertProgress: 50 })

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.convert-progress').exists()).toBe(true)
    expect(wrapper.find('.el-progress').exists()).toBe(true)
  })

  it('handles upload success correctly', () => {
    const mockResponse = {
      data: { url: 'https://example.com/uploaded.jpg' }
    }
    const mockFile = { name: 'test.jpg', size: 1024 }

    wrapper.vm.handleUploadSuccess(mockResponse, mockFile, [])

    expect(wrapper.vm.fileList).toHaveLength(1)
    expect(wrapper.emitted('success')).toBeTruthy()
  })

  it('handles upload error correctly', () => {
    const mockError = new Error('Upload failed')
    const mockFile = { name: 'test.jpg' }

    wrapper.vm.handleUploadError(mockError, mockFile, [])

    expect(wrapper.emitted('error')).toBeTruthy()
  })

  it('clears files correctly', () => {
    wrapper.vm.fileList = [
      { url: 'https://example.com/test1.jpg' },
      { url: 'https://example.com/test2.jpg' }
    ]

    wrapper.vm.clearFiles()

    expect(wrapper.vm.fileList).toHaveLength(0)
    expect(wrapper.emitted('input')).toBeTruthy()
  })

  it('respects file limit', async () => {
    await wrapper.setProps({ limit: 2 })

    const files = new Array(3).fill().map((_, i) => ({
      name: `test${i}.jpg`
    }))

    wrapper.vm.handleExceed(files, [])

    expect(wrapper.emitted('exceed')).toBeTruthy()
  })

  it('gets file name from URL correctly', () => {
    const url = 'https://example.com/path/to/image.jpg'
    const fileName = wrapper.vm.getFileName(url)
    
    expect(fileName).toBe('image.jpg')
  })

  it('handles preview correctly', () => {
    const file = { url: 'https://example.com/test.jpg' }
    
    wrapper.vm.handlePreview(file)
    
    expect(wrapper.vm.previewImageUrl).toBe(file.url)
    expect(wrapper.vm.previewVisible).toBe(true)
  })
})