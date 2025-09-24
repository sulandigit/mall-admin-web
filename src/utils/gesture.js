/**
 * 手势操作工具类 - 基础部分
 * 支持滑动、长按等手势识别
 */

/**
 * 手势事件类型
 */
export const GESTURE_TYPES = {
  SWIPE_LEFT: 'swipeLeft',
  SWIPE_RIGHT: 'swipeRight',
  SWIPE_UP: 'swipeUp',
  SWIPE_DOWN: 'swipeDown',
  TAP: 'tap',
  LONG_PRESS: 'longPress',
  PAN: 'pan'
}

/**
 * 手势配置
 */
export const GESTURE_CONFIG = {
  swipeThreshold: 30,
  swipeTimeout: 300,
  swipeVelocity: 0.3,
  longPressDelay: 500,
  longPressMoveThreshold: 10,
  tapTimeout: 200,
  tapThreshold: 10,
  panThreshold: 10
}

/**
 * 手势识别器基类
 */
class GestureRecognizer {
  constructor(element, options = {}) {
    this.element = element
    this.config = { ...GESTURE_CONFIG, ...options }
    this.handlers = new Map()
    this.isEnabled = true
    
    this.startPoint = null
    this.currentPoint = null
    this.isTracking = false
    this.longPressTimer = null
    
    this.bindEvents()
  }
  
  bindEvents() {
    if (!this.element) return
    
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false })
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false })
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false })
    this.element.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false })
  }
  
  handleTouchStart(event) {
    if (!this.isEnabled) return
    
    const touch = event.touches[0]
    this.startTouch(touch.clientX, touch.clientY, event)
  }
  
  handleTouchMove(event) {
    if (!this.isEnabled || !this.isTracking) return
    
    const touch = event.touches[0]
    this.moveTouch(touch.clientX, touch.clientY, event)
  }
  
  handleTouchEnd(event) {
    if (!this.isEnabled) return
    
    const touch = event.changedTouches[0]
    this.endTouch(touch.clientX, touch.clientY, event)
  }
  
  handleTouchCancel(event) {
    this.cancelTouch(event)
  }
  
  startTouch(x, y, event) {
    this.isTracking = true
    this.startPoint = { x, y, timestamp: Date.now() }
    this.currentPoint = { x, y }
    
    this.clearTimers()
    this.startLongPressTimer(event)
  }
  
  moveTouch(x, y, event) {
    if (!this.startPoint) return
    
    this.currentPoint = { x, y }
    const deltaX = x - this.startPoint.x
    const deltaY = y - this.startPoint.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    
    if (distance > this.config.longPressMoveThreshold) {
      this.clearTimers()
    }
    
    if (distance > this.config.panThreshold) {
      this.emit(GESTURE_TYPES.PAN, {
        startPoint: this.startPoint,
        currentPoint: this.currentPoint,
        deltaX,
        deltaY,
        distance,
        event
      })
    }
  }
  
  endTouch(x, y, event) {
    if (!this.startPoint || !this.isTracking) return
    
    this.isTracking = false
    this.currentPoint = { x, y }
    
    const deltaX = x - this.startPoint.x
    const deltaY = y - this.startPoint.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const duration = Date.now() - this.startPoint.timestamp
    const velocity = distance / duration
    
    this.clearTimers()
    
    if (distance < this.config.tapThreshold && duration < this.config.tapTimeout) {
      this.emit(GESTURE_TYPES.TAP, { point: { x, y }, event })
    } else if (distance > this.config.swipeThreshold && 
               duration < this.config.swipeTimeout && 
               velocity > this.config.swipeVelocity) {
      this.detectSwipe(deltaX, deltaY, velocity, event)
    }
    
    this.startPoint = null
    this.currentPoint = null
  }
  
  cancelTouch(event) {
    this.isTracking = false
    this.clearTimers()
    this.startPoint = null
    this.currentPoint = null
  }
  
  detectSwipe(deltaX, deltaY, velocity, event) {
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)
    
    let swipeType
    if (absDeltaX > absDeltaY) {
      swipeType = deltaX > 0 ? GESTURE_TYPES.SWIPE_RIGHT : GESTURE_TYPES.SWIPE_LEFT
    } else {
      swipeType = deltaY > 0 ? GESTURE_TYPES.SWIPE_DOWN : GESTURE_TYPES.SWIPE_UP
    }
    
    this.emit(swipeType, {
      startPoint: this.startPoint,
      endPoint: this.currentPoint,
      deltaX,
      deltaY,
      velocity,
      event
    })
  }
  
  startLongPressTimer(event) {
    this.longPressTimer = setTimeout(() => {
      if (this.isTracking) {
        this.emit(GESTURE_TYPES.LONG_PRESS, {
          point: this.startPoint,
          event
        })
      }
    }, this.config.longPressDelay)
  }
  
  clearTimers() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer)
      this.longPressTimer = null
    }
  }
  
  on(gestureType, handler) {
    if (!this.handlers.has(gestureType)) {
      this.handlers.set(gestureType, [])
    }
    this.handlers.get(gestureType).push(handler)
    return this
  }
  
  off(gestureType, handler) {
    const handlers = this.handlers.get(gestureType)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
    return this
  }
  
  emit(gestureType, data) {
    const handlers = this.handlers.get(gestureType)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error('Gesture handler error:', error)
        }
      })
    }
  }
  
  enable() {
    this.isEnabled = true
    return this
  }
  
  disable() {
    this.isEnabled = false
    this.cancelTouch()
    return this
  }
  
  destroy() {
    this.disable()
    this.element.removeEventListener('touchstart', this.handleTouchStart)
    this.element.removeEventListener('touchmove', this.handleTouchMove)
    this.element.removeEventListener('touchend', this.handleTouchEnd)
    this.element.removeEventListener('touchcancel', this.handleTouchCancel)
    this.handlers.clear()
    this.clearTimers()
  }
}

export function createGestureRecognizer(element, options) {
  return new GestureRecognizer(element, options)
}

export default {
  GESTURE_TYPES,
  GESTURE_CONFIG,
  createGestureRecognizer
}