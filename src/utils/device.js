/**
 * 设备检测和响应式工具类
 * 支持多种设备类型检测和响应式断点管理
 */

// 响应式断点定义
export const BREAKPOINTS = {
  MOBILE_MAX: 767,
  TABLET_MIN: 768,
  TABLET_MAX: 1023,
  DESKTOP_MIN: 1024,
  DESKTOP_LARGE_MIN: 1440
}

// 设备类型枚举
export const DEVICE_TYPE = {
  MOBILE: 'mobile',
  TABLET: 'tablet',
  DESKTOP: 'desktop',
  DESKTOP_LARGE: 'desktop-large'
}

// 设备方向枚举
export const ORIENTATION = {
  PORTRAIT: 'portrait',
  LANDSCAPE: 'landscape'
}

/**
 * 获取当前视窗宽度
 */
export function getViewportWidth() {
  return Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
}

/**
 * 获取当前视窗高度
 */
export function getViewportHeight() {
  return Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
}

/**
 * 检测当前设备类型
 */
export function detectDeviceType() {
  const width = getViewportWidth()
  
  if (width <= BREAKPOINTS.MOBILE_MAX) {
    return DEVICE_TYPE.MOBILE
  } else if (width >= BREAKPOINTS.TABLET_MIN && width <= BREAKPOINTS.TABLET_MAX) {
    return DEVICE_TYPE.TABLET
  } else if (width >= BREAKPOINTS.DESKTOP_MIN && width < BREAKPOINTS.DESKTOP_LARGE_MIN) {
    return DEVICE_TYPE.DESKTOP
  } else {
    return DEVICE_TYPE.DESKTOP_LARGE
  }
}

/**
 * 检测设备方向
 */
export function detectOrientation() {
  const width = getViewportWidth()
  const height = getViewportHeight()
  return width > height ? ORIENTATION.LANDSCAPE : ORIENTATION.PORTRAIT
}

/**
 * 检测是否为移动设备（手机或平板）
 */
export function isMobileDevice() {
  const deviceType = detectDeviceType()
  return deviceType === DEVICE_TYPE.MOBILE || deviceType === DEVICE_TYPE.TABLET
}

/**
 * 检测是否为平板设备
 */
export function isTabletDevice() {
  return detectDeviceType() === DEVICE_TYPE.TABLET
}

/**
 * 检测是否为手机设备
 */
export function isPhoneDevice() {
  return detectDeviceType() === DEVICE_TYPE.MOBILE
}

/**
 * 检测是否为桌面设备
 */
export function isDesktopDevice() {
  const deviceType = detectDeviceType()
  return deviceType === DEVICE_TYPE.DESKTOP || deviceType === DEVICE_TYPE.DESKTOP_LARGE
}

/**
 * 检测是否支持触摸
 */
export function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0
}

/**
 * 检测是否为iOS设备
 */
export function isIOSDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
}

/**
 * 检测是否为Android设备
 */
export function isAndroidDevice() {
  return /Android/.test(navigator.userAgent)
}

/**
 * 获取当前断点名称
 */
export function getCurrentBreakpoint() {
  const width = getViewportWidth()
  
  if (width <= BREAKPOINTS.MOBILE_MAX) {
    return 'mobile'
  } else if (width >= BREAKPOINTS.TABLET_MIN && width <= BREAKPOINTS.TABLET_MAX) {
    return 'tablet'
  } else if (width >= BREAKPOINTS.DESKTOP_MIN && width < BREAKPOINTS.DESKTOP_LARGE_MIN) {
    return 'desktop'
  } else {
    return 'desktop-large'
  }
}

/**
 * 媒体查询匹配器
 */
export function matchMediaBreakpoint(breakpoint) {
  let query = ''
  
  switch (breakpoint) {
    case 'mobile':
      query = `(max-width: ${BREAKPOINTS.MOBILE_MAX}px)`
      break
    case 'tablet':
      query = `(min-width: ${BREAKPOINTS.TABLET_MIN}px) and (max-width: ${BREAKPOINTS.TABLET_MAX}px)`
      break
    case 'desktop':
      query = `(min-width: ${BREAKPOINTS.DESKTOP_MIN}px) and (max-width: ${BREAKPOINTS.DESKTOP_LARGE_MIN - 1}px)`
      break
    case 'desktop-large':
      query = `(min-width: ${BREAKPOINTS.DESKTOP_LARGE_MIN}px)`
      break
    case 'mobile-tablet':
      query = `(max-width: ${BREAKPOINTS.TABLET_MAX}px)`
      break
    case 'tablet-desktop':
      query = `(min-width: ${BREAKPOINTS.TABLET_MIN}px)`
      break
    default:
      return null
  }
  
  return window.matchMedia(query)
}

/**
 * 创建响应式监听器
 */
export function createResponsiveListener(callbacks) {
  const listeners = []
  
  Object.keys(callbacks).forEach(breakpoint => {
    const mediaQuery = matchMediaBreakpoint(breakpoint)
    if (mediaQuery) {
      const handler = (e) => {
        if (e.matches) {
          callbacks[breakpoint]()
        }
      }
      
      mediaQuery.addListener(handler)
      listeners.push({ mediaQuery, handler })
      
      // 立即检查当前状态
      if (mediaQuery.matches) {
        callbacks[breakpoint]()
      }
    }
  })
  
  // 返回清理函数
  return () => {
    listeners.forEach(({ mediaQuery, handler }) => {
      mediaQuery.removeListener(handler)
    })
  }
}

/**
 * 获取完整的设备信息
 */
export function getDeviceInfo() {
  return {
    type: detectDeviceType(),
    orientation: detectOrientation(),
    viewport: {
      width: getViewportWidth(),
      height: getViewportHeight()
    },
    breakpoint: getCurrentBreakpoint(),
    touchSupported: isTouchDevice(),
    isIOS: isIOSDevice(),
    isAndroid: isAndroidDevice(),
    isMobile: isMobileDevice(),
    isTablet: isTabletDevice(),
    isPhone: isPhoneDevice(),
    isDesktop: isDesktopDevice()
  }
}

export default {
  BREAKPOINTS,
  DEVICE_TYPE,
  ORIENTATION,
  getViewportWidth,
  getViewportHeight,
  detectDeviceType,
  detectOrientation,
  isMobileDevice,
  isTabletDevice,
  isPhoneDevice,
  isDesktopDevice,
  isTouchDevice,
  isIOSDevice,
  isAndroidDevice,
  getCurrentBreakpoint,
  matchMediaBreakpoint,
  createResponsiveListener,
  getDeviceInfo
}