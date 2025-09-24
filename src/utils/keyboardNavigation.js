/**
 * 全局键盘导航管理器
 * 提供统一的键盘导航支持
 */

import { focusManager, liveAnnouncer } from './accessibility'

class KeyboardNavigationManager {
  constructor() {
    this.isKeyboardUser = false
    this.shortcuts = new Map()
    this.modalStack = []
    this.init()
  }

  init() {
    // 检测键盘用户
    this.detectKeyboardUser()
    
    // 注册全局快捷键
    this.registerGlobalShortcuts()
    
    // 监听模态框变化
    this.watchModals()
  }

  // 检测是否为键盘用户
  detectKeyboardUser() {
    let keyboardUsed = false
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        keyboardUsed = true
        document.body.classList.add('keyboard-user')
      }
    })
    
    document.addEventListener('mousedown', () => {
      if (keyboardUsed) {
        keyboardUsed = false
        document.body.classList.remove('keyboard-user')
      }
    })
  }

  // 注册全局快捷键
  registerGlobalShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Alt + M: 打开主菜单
      if (e.altKey && e.key === 'm') {
        e.preventDefault()
        this.focusMainMenu()
        return
      }
      
      // Alt + C: 跳转到主内容
      if (e.altKey && e.key === 'c') {
        e.preventDefault()
        this.focusMainContent()
        return
      }
      
      // Alt + S: 跳转到搜索
      if (e.altKey && e.key === 's') {
        e.preventDefault()
        this.focusSearch()
        return
      }
      
      // ESC: 关闭模态框或返回
      if (e.key === 'Escape') {
        this.handleEscape()
        return
      }
      
      // F6: 在主要区域间循环
      if (e.key === 'F6') {
        e.preventDefault()
        this.cycleThroughLandmarks()
        return
      }
    })
  }

  // 聚焦主菜单
  focusMainMenu() {
    const menu = document.querySelector('.sidebar-container [role="menu"]')
    if (menu) {
      const firstItem = menu.querySelector('[role="menuitem"], .el-menu-item')
      if (firstItem) {
        firstItem.focus()
        liveAnnouncer.announce('已聚焦到主导航菜单')
      }
    }
  }

  // 聚焦主内容
  focusMainContent() {
    const mainContent = document.querySelector('#main-content, [role="main"]')
    if (mainContent) {
      mainContent.focus()
      liveAnnouncer.announce('已跳转到主要内容区域')
    }
  }

  // 聚焦搜索框
  focusSearch() {
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="搜索"]')
    if (searchInput) {
      searchInput.focus()
      liveAnnouncer.announce('已聚焦到搜索框')
    } else {
      liveAnnouncer.announce('当前页面没有搜索功能')
    }
  }

  // 处理ESC键
  handleEscape() {
    // 关闭最顶层的模态框
    if (this.modalStack.length > 0) {
      const topModal = this.modalStack[this.modalStack.length - 1]
      if (topModal.close) {
        topModal.close()
      }
      return
    }

    // 取消当前操作或返回上一级
    const activeElement = document.activeElement
    if (activeElement && activeElement.blur) {
      activeElement.blur()
    }
  }

  // 在主要区域间循环聚焦
  cycleThroughLandmarks() {
    const landmarks = [
      'nav[role="navigation"]',
      '[role="main"]',
      '[role="banner"]',
      '[role="complementary"]',
      '[role="contentinfo"]'
    ]
    
    let currentIndex = -1
    const focusedElement = document.activeElement
    
    // 找到当前聚焦的landmark
    landmarks.forEach((selector, index) => {
      const landmark = document.querySelector(selector)
      if (landmark && landmark.contains(focusedElement)) {
        currentIndex = index
      }
    })
    
    // 移动到下一个landmark
    currentIndex = (currentIndex + 1) % landmarks.length
    const nextLandmark = document.querySelector(landmarks[currentIndex])
    
    if (nextLandmark) {
      nextLandmark.focus()
      const landmarkName = this.getLandmarkName(nextLandmark)
      liveAnnouncer.announce(`已聚焦到${landmarkName}`)
    }
  }

  // 获取landmark名称
  getLandmarkName(element) {
    const role = element.getAttribute('role')
    const ariaLabel = element.getAttribute('aria-label')
    
    if (ariaLabel) return ariaLabel
    
    switch (role) {
      case 'navigation': return '导航区域'
      case 'main': return '主要内容区域'
      case 'banner': return '页面顶部'
      case 'complementary': return '辅助内容区域'
      case 'contentinfo': return '页面底部'
      default: return '区域'
    }
  }

  // 监听模态框变化
  watchModals() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            // 检测新增的模态框
            if (node.matches('.el-dialog, .el-drawer, .el-popover') ||
                node.querySelector('.el-dialog, .el-drawer, .el-popover')) {
              this.handleModalOpen(node)
            }
          }
        })
        
        mutation.removedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            // 检测移除的模态框
            this.handleModalClose(node)
          }
        })
      })
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  // 处理模态框打开
  handleModalOpen(element) {
    const modal = element.matches('.el-dialog, .el-drawer') ? element : 
                  element.querySelector('.el-dialog, .el-drawer')
    
    if (modal) {
      this.modalStack.push({
        element: modal,
        previousFocus: document.activeElement
      })
      
      // 设置焦点陷阱
      this.setupFocusTrap(modal)
    }
  }

  // 处理模态框关闭
  handleModalClose(element) {
    const modalIndex = this.modalStack.findIndex(modal => 
      modal.element === element || modal.element.contains(element)
    )
    
    if (modalIndex >= 0) {
      const modal = this.modalStack.splice(modalIndex, 1)[0]
      
      // 恢复焦点
      if (modal.previousFocus && modal.previousFocus.focus) {
        modal.previousFocus.focus()
      }
    }
  }

  // 设置焦点陷阱
  setupFocusTrap(element) {
    const focusableElements = focusManager.getFocusableElements(element)
    if (focusableElements.length === 0) return
    
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    
    // 聚焦到第一个元素
    firstElement.focus()
    
    const trapListener = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }
    
    element.addEventListener('keydown', trapListener)
    
    // 清理函数
    const cleanup = () => {
      element.removeEventListener('keydown', trapListener)
    }
    
    // 存储清理函数
    element._focusTrapCleanup = cleanup
  }

  // 注册自定义快捷键
  registerShortcut(key, callback, description) {
    this.shortcuts.set(key, { callback, description })
  }

  // 移除快捷键
  unregisterShortcut(key) {
    this.shortcuts.delete(key)
  }

  // 获取快捷键帮助信息
  getShortcutHelp() {
    const help = [
      'Alt + M: 打开主菜单',
      'Alt + C: 跳转到主内容',
      'Alt + S: 跳转到搜索',
      'ESC: 关闭对话框',
      'F6: 在区域间切换',
      'Tab: 向前导航',
      'Shift + Tab: 向后导航'
    ]
    
    // 添加自定义快捷键
    this.shortcuts.forEach((shortcut, key) => {
      help.push(`${key}: ${shortcut.description}`)
    })
    
    return help
  }

  // 显示快捷键帮助
  showShortcutHelp() {
    const helpText = this.getShortcutHelp().join('\n')
    alert(`键盘快捷键帮助：\n\n${helpText}`)
  }
}

// 创建全局实例
export const keyboardNavigationManager = new KeyboardNavigationManager()

// 导出快捷键常量
export const KEYBOARD_SHORTCUTS = {
  MAIN_MENU: 'Alt+M',
  MAIN_CONTENT: 'Alt+C',
  SEARCH: 'Alt+S',
  ESCAPE: 'Escape',
  CYCLE_LANDMARKS: 'F6'
}

export default keyboardNavigationManager