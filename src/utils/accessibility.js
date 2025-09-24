/**
 * 无障碍工具类
 * 提供WCAG 2.1 AA级无障碍支持
 */

// 生成唯一ID，用于aria-describedby等属性
let idCounter = 0;
export function generateId(prefix = 'a11y') {
  return `${prefix}-${++idCounter}`;
}

/**
 * 焦点管理类
 */
export class FocusManager {
  constructor() {
    this.previousFocus = null;
    this.focusStack = [];
  }

  // 保存当前焦点
  saveFocus() {
    this.previousFocus = document.activeElement;
    this.focusStack.push(this.previousFocus);
  }

  // 恢复焦点
  restoreFocus() {
    if (this.focusStack.length > 0) {
      const element = this.focusStack.pop();
      if (element && element.focus) {
        element.focus();
      }
    }
  }

  // 设置焦点到指定元素
  setFocus(element) {
    if (element && element.focus) {
      element.focus();
    }
  }

  // 获取可聚焦元素
  getFocusableElements(container = document) {
    const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    return Array.from(container.querySelectorAll(selector))
      .filter(el => !el.disabled && !el.hidden && el.offsetParent !== null);
  }

  // 焦点陷阱（用于模态框等）
  trapFocus(element) {
    const focusableElements = this.getFocusableElements(element);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    
    // 返回清理函数
    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  }
}

/**
 * 实时宣告类，用于屏幕阅读器
 */
export class LiveAnnouncer {
  constructor() {
    this.liveRegion = null;
    this.createLiveRegion();
  }

  createLiveRegion() {
    if (!this.liveRegion) {
      this.liveRegion = document.createElement('div');
      this.liveRegion.setAttribute('aria-live', 'polite');
      this.liveRegion.setAttribute('aria-atomic', 'true');
      this.liveRegion.className = 'sr-only';
      document.body.appendChild(this.liveRegion);
    }
  }

  // 宣告消息
  announce(message, priority = 'polite') {
    if (this.liveRegion) {
      this.liveRegion.setAttribute('aria-live', priority);
      this.liveRegion.textContent = message;
      
      // 清除消息，准备下次宣告
      setTimeout(() => {
        this.liveRegion.textContent = '';
      }, 1000);
    }
  }

  // 立即宣告重要消息
  announceUrgent(message) {
    this.announce(message, 'assertive');
  }
}

/**
 * 键盘导航助手
 */
export const KeyboardHelper = {
  KEYS: {
    ENTER: 'Enter',
    SPACE: ' ',
    TAB: 'Tab',
    ESCAPE: 'Escape',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    HOME: 'Home',
    END: 'End'
  },

  // 检查是否为激活键（Enter或Space）
  isActivateKey(event) {
    return event.key === this.KEYS.ENTER || event.key === this.KEYS.SPACE;
  },

  // 处理箭头键导航
  handleArrowNavigation(event, items, currentIndex, options = {}) {
    const { loop = true, vertical = true } = options;
    let newIndex = currentIndex;

    switch (event.key) {
      case this.KEYS.ARROW_UP:
        if (vertical) {
          newIndex = currentIndex > 0 ? currentIndex - 1 : (loop ? items.length - 1 : 0);
          event.preventDefault();
        }
        break;
      case this.KEYS.ARROW_DOWN:
        if (vertical) {
          newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : (loop ? 0 : items.length - 1);
          event.preventDefault();
        }
        break;
      case this.KEYS.ARROW_LEFT:
        if (!vertical) {
          newIndex = currentIndex > 0 ? currentIndex - 1 : (loop ? items.length - 1 : 0);
          event.preventDefault();
        }
        break;
      case this.KEYS.ARROW_RIGHT:
        if (!vertical) {
          newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : (loop ? 0 : items.length - 1);
          event.preventDefault();
        }
        break;
      case this.KEYS.HOME:
        newIndex = 0;
        event.preventDefault();
        break;
      case this.KEYS.END:
        newIndex = items.length - 1;
        event.preventDefault();
        break;
    }

    return newIndex;
  }
};

/**
 * ARIA 属性助手
 */
export const AriaHelper = {
  // 设置ARIA属性
  setAttributes(element, attributes) {
    Object.keys(attributes).forEach(key => {
      if (attributes[key] !== null && attributes[key] !== undefined) {
        element.setAttribute(key, attributes[key]);
      }
    });
  },

  // 移除ARIA属性
  removeAttributes(element, attributes) {
    attributes.forEach(attr => {
      element.removeAttribute(attr);
    });
  },

  // 切换ARIA状态
  toggleAttribute(element, attribute, value) {
    const currentValue = element.getAttribute(attribute);
    element.setAttribute(attribute, currentValue === 'true' ? 'false' : 'true');
  }
};

// 全局实例
export const focusManager = new FocusManager();
export const liveAnnouncer = new LiveAnnouncer();

/**
 * 颜色对比度检查工具
 */
export const ColorContrastChecker = {
  // 计算相对亮度
  getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  // 计算对比度比率
  getContrastRatio(color1, color2) {
    const l1 = this.getLuminance(...color1);
    const l2 = this.getLuminance(...color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  },

  // 检查是否符合WCAG AA标准
  meetsWCAGAA(foreground, background, isLargeText = false) {
    const ratio = this.getContrastRatio(foreground, background);
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  }
};