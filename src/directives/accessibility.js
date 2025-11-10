/**
 * Vue 无障碍指令
 * 提供简化的ARIA属性和行为绑定
 */

import { generateId, focusManager, liveAnnouncer, KeyboardHelper, AriaHelper } from '@/utils/accessibility';

/**
 * v-focus 指令 - 自动设置焦点
 */
export const focus = {
  inserted(el, binding) {
    if (binding.value !== false) {
      // 使用 nextTick 确保DOM已渲染
      el.$nextTick = el.$nextTick || ((fn) => setTimeout(fn, 0));
      el.$nextTick(() => {
        if (el.focus) {
          el.focus();
        } else {
          // 查找第一个可聚焦元素
          const focusable = el.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])');
          if (focusable) {
            focusable.focus();
          }
        }
      });
    }
  }
};

/**
 * v-aria 指令 - 批量设置ARIA属性
 * 用法: v-aria=\"{ label: '按钮', expanded: false }\"
 */
export const aria = {
  bind(el, binding) {
    if (binding.value && typeof binding.value === 'object') {
      Object.keys(binding.value).forEach(key => {
        const ariaKey = key.startsWith('aria-') ? key : `aria-${key}`;
        el.setAttribute(ariaKey, binding.value[key]);
      });
    }
  },
  update(el, binding) {
    if (binding.value && typeof binding.value === 'object') {
      Object.keys(binding.value).forEach(key => {
        const ariaKey = key.startsWith('aria-') ? key : `aria-${key}`;
        el.setAttribute(ariaKey, binding.value[key]);
      });
    }
  }
};

/**
 * v-keyboard-nav 指令 - 键盘导航支持
 * 用法: v-keyboard-nav=\"{ role: 'menu', items: menuItems }\"
 */
export const keyboardNav = {
  bind(el, binding, vnode) {
    const options = binding.value || {};
    const { role = 'menu', vertical = true, loop = true } = options;
    
    el.setAttribute('role', role);
    el.setAttribute('tabindex', '0');
    
    let currentIndex = 0;
    
    const handleKeydown = (event) => {
      const items = el.querySelectorAll('[role=\"menuitem\"], button, a, [tabindex=\"0\"]');
      const itemsArray = Array.from(items);
      
      if (itemsArray.length === 0) return;
      
      const newIndex = KeyboardHelper.handleArrowNavigation(
        event, 
        itemsArray, 
        currentIndex, 
        { vertical, loop }
      );
      
      if (newIndex !== currentIndex) {
        currentIndex = newIndex;
        items[currentIndex].focus();
      }
      
      // ESC键支持
      if (event.key === KeyboardHelper.KEYS.ESCAPE && options.onEscape) {
        options.onEscape();
      }
    };
    
    el.addEventListener('keydown', handleKeydown);
    el._keyboardNavCleanup = () => {
      el.removeEventListener('keydown', handleKeydown);
    };
  },
  unbind(el) {
    if (el._keyboardNavCleanup) {
      el._keyboardNavCleanup();
    }
  }
};

/**
 * v-announce 指令 - 屏幕阅读器宣告
 * 用法: v-announce=\"message\" 或 v-announce=\"{ message, priority }\"
 */
export const announce = {
  update(el, binding) {
    if (binding.value) {
      const message = typeof binding.value === 'string' ? 
        binding.value : binding.value.message;
      const priority = typeof binding.value === 'object' ? 
        binding.value.priority : 'polite';
      
      if (message && binding.oldValue !== binding.value) {
        liveAnnouncer.announce(message, priority);
      }
    }
  }
};

/**
 * v-skip-link 指令 - 跳转链接
 * 用法: v-skip-link=\"'#main-content'\"
 */
export const skipLink = {
  bind(el, binding) {
    el.className = (el.className || '') + ' skip-link';
    el.setAttribute('href', binding.value || '#main-content');
    
    el.addEventListener('click', (event) => {
      event.preventDefault();
      const target = document.querySelector(binding.value || '#main-content');
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
};

/**
 * v-trap-focus 指令 - 焦点陷阱
 * 用法: v-trap-focus=\"isActive\"
 */
export const trapFocus = {
  bind(el, binding) {
    el._focusTrap = null;
  },
  update(el, binding) {
    if (binding.value && !el._focusTrap) {
      // 激活焦点陷阱
      el._focusTrap = focusManager.trapFocus(el);
      focusManager.saveFocus();
      
      // 设置焦点到第一个可聚焦元素
      const focusableElements = focusManager.getFocusableElements(el);
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    } else if (!binding.value && el._focusTrap) {
      // 停用焦点陷阱
      el._focusTrap();
      el._focusTrap = null;
      focusManager.restoreFocus();
    }
  },
  unbind(el) {
    if (el._focusTrap) {
      el._focusTrap();
      focusManager.restoreFocus();
    }
  }
};

/**
 * v-clickable 指令 - 让非按钮元素可点击并可访问
 * 用法: v-clickable=\"clickHandler\"
 */
export const clickable = {
  bind(el, binding) {
    if (!el.hasAttribute('role')) {
      el.setAttribute('role', 'button');
    }
    if (!el.hasAttribute('tabindex')) {
      el.setAttribute('tabindex', '0');
    }
    
    const handleClick = (event) => {
      if (binding.value && typeof binding.value === 'function') {
        binding.value(event);
      }
    };
    
    const handleKeydown = (event) => {
      if (KeyboardHelper.isActivateKey(event)) {
        event.preventDefault();
        handleClick(event);
      }
    };
    
    el.addEventListener('click', handleClick);
    el.addEventListener('keydown', handleKeydown);
    
    el._clickableCleanup = () => {
      el.removeEventListener('click', handleClick);
      el.removeEventListener('keydown', handleKeydown);
    };
  },
  unbind(el) {
    if (el._clickableCleanup) {
      el._clickableCleanup();
    }
  }
};

/**
 * v-form-label 指令 - 自动关联表单标签
 * 用法: v-form-label=\"'用户名'\"
 */
export const formLabel = {
  bind(el, binding) {
    if (binding.value) {
      const labelId = generateId('label');
      const inputId = el.id || generateId('input');
      
      if (!el.id) {
        el.id = inputId;
      }
      
      // 查找关联的label或创建新的
      let label = document.querySelector(`label[for=\"${el.id}\"]`);
      if (!label) {
        label = document.createElement('label');
        label.htmlFor = el.id;
        label.textContent = binding.value;
        el.parentNode.insertBefore(label, el);
      }
      
      // 设置aria-label作为备选
      if (!el.hasAttribute('aria-label')) {
        el.setAttribute('aria-label', binding.value);
      }
    }
  }
};

// 导出所有指令
export default {
  focus,
  aria,
  keyboardNav,
  announce,
  skipLink,
  trapFocus,
  clickable,
  formLabel
};