/**
 * 防抖函数 - 用于优化频繁触发的事件
 * @param {Function} func - 要防抖的函数
 * @param {number} delay - 防抖延迟时间（毫秒）
 * @param {boolean} immediate - 是否立即执行第一次调用
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, delay = 300, immediate = false) {
  let timeoutId = null
  let isInvoked = false

  return function debounced(...args) {
    const context = this

    // 清除之前的定时器
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    if (immediate && !isInvoked) {
      // 立即执行模式：第一次调用立即执行
      func.apply(context, args)
      isInvoked = true
    } else {
      // 延迟执行模式：等待延迟时间后执行
      timeoutId = setTimeout(() => {
        func.apply(context, args)
        isInvoked = false
        timeoutId = null
      }, delay)
    }
  }
}

/**
 * 节流函数 - 限制函数执行频率
 * @param {Function} func - 要节流的函数
 * @param {number} delay - 节流间隔时间（毫秒）
 * @param {Object} options - 配置选项
 * @returns {Function} 节流后的函数
 */
export function throttle(func, delay = 300, options = {}) {
  let timeoutId = null
  let lastExecTime = 0
  const { leading = true, trailing = true } = options

  return function throttled(...args) {
    const context = this
    const currentTime = Date.now()

    // 如果是第一次调用且允许前沿执行
    if (leading && currentTime - lastExecTime >= delay) {
      func.apply(context, args)
      lastExecTime = currentTime
      return
    }

    // 清除之前的定时器
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    // 如果允许后沿执行，设置定时器
    if (trailing) {
      timeoutId = setTimeout(() => {
        if (currentTime - lastExecTime >= delay) {
          func.apply(context, args)
          lastExecTime = Date.now()
        }
        timeoutId = null
      }, delay - (currentTime - lastExecTime))
    }
  }
}

/**
 * 批量处理函数 - 将多个调用合并为一次处理
 * @param {Function} func - 要批量处理的函数
 * @param {number} delay - 批量处理延迟时间（毫秒）
 * @param {number} maxBatchSize - 最大批次大小
 * @returns {Function} 批量处理后的函数
 */
export function batchProcess(func, delay = 100, maxBatchSize = 10) {
  let batchItems = []
  let timeoutId = null

  return function batched(item) {
    batchItems.push(item)

    // 清除之前的定时器
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    // 如果达到最大批次大小，立即处理
    if (batchItems.length >= maxBatchSize) {
      processBatch()
      return
    }

    // 设置延迟处理
    timeoutId = setTimeout(processBatch, delay)

    function processBatch() {
      if (batchItems.length > 0) {
        const itemsToProcess = [...batchItems]
        batchItems = []
        timeoutId = null
        func.call(this, itemsToProcess)
      }
    }
  }
}

/**
 * 智能防抖 - 根据调用频率自动调整延迟时间
 * @param {Function} func - 要防抖的函数
 * @param {Object} options - 配置选项
 * @returns {Function} 智能防抖后的函数
 */
export function smartDebounce(func, options = {}) {
  const {
    minDelay = 100,
    maxDelay = 1000,
    threshold = 5
  } = options

  let timeoutId = null
  let callCount = 0
  let lastCallTime = 0

  return function smartDebounced(...args) {
    const context = this
    const currentTime = Date.now()

    // 计算调用频率
    if (currentTime - lastCallTime < 1000) {
      callCount++
    } else {
      callCount = 1
    }
    lastCallTime = currentTime

    // 根据调用频率调整延迟时间
    let delay = minDelay
    if (callCount > threshold) {
      delay = Math.min(maxDelay, minDelay * Math.log(callCount))
    }

    // 清除之前的定时器
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    // 设置新的定时器
    timeoutId = setTimeout(() => {
      func.apply(context, args)
      callCount = 0
      timeoutId = null
    }, delay)
  }
}

/**
 * 请求去重 - 避免重复请求
 * @param {Function} requestFunc - 请求函数
 * @param {Function} keyGenerator - 生成请求唯一标识的函数
 * @returns {Function} 去重后的请求函数
 */
export function deduplicateRequest(requestFunc, keyGenerator = (...args) => JSON.stringify(args)) {
  const pendingRequests = new Map()

  return async function deduplicated(...args) {
    const key = keyGenerator(...args)

    // 如果有相同的请求正在进行，返回该请求的Promise
    if (pendingRequests.has(key)) {
      return pendingRequests.get(key)
    }

    // 创建新的请求Promise
    const requestPromise = requestFunc.apply(this, args)
      .then(result => {
        pendingRequests.delete(key)
        return result
      })
      .catch(error => {
        pendingRequests.delete(key)
        throw error
      })

    pendingRequests.set(key, requestPromise)
    return requestPromise
  }
}

/**
 * 延迟执行 - 创建一个可取消的延迟Promise
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Object} 包含promise和cancel方法的对象
 */
export function createDelay(delay) {
  let timeoutId
  let resolve
  let reject

  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
    timeoutId = setTimeout(resolve, delay)
  })

  const cancel = (reason = 'Cancelled') => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      reject(new Error(reason))
    }
  }

  return { promise, cancel }
}