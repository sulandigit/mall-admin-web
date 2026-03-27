/**
 * 侧边栏手势支持组件
 * 提供滑动展开/收起侧边栏功能
 */

import { createGestureRecognizer, GESTURE_TYPES } from '@/utils/gesture'
import { mapGetters } from 'vuex'

export default {
  name: 'SidebarGesture',
  data() {
    return {
      gestureRecognizer: null,
      isEdgeSwipe: false,
      edgeThreshold: 20,
      swipeThreshold: 50
    }
  },
  computed: {
    ...mapGetters([
      'isMobileOrTablet', 
      'sidebar'
    ])
  },
  mounted() {
    this.initGesture()
  },
  beforeDestroy() {
    this.destroyGesture()
  },
  methods: {
    /**
     * 初始化手势识别
     */
    initGesture() {
      if (!this.isMobileOrTablet) return
      
      this.gestureRecognizer = createGestureRecognizer(document.body, {
        swipeThreshold: this.swipeThreshold,
        swipeVelocity: 0.3
      })
      
      this.gestureRecognizer
        .on(GESTURE_TYPES.PAN + 'Start', this.handlePanStart.bind(this))
        .on(GESTURE_TYPES.SWIPE_RIGHT, this.handleSwipeRight.bind(this))
        .on(GESTURE_TYPES.SWIPE_LEFT, this.handleSwipeLeft.bind(this))
    },
    
    /**
     * 处理拖拽开始 - 检测边缘滑动
     */
    handlePanStart({ startPoint }) {
      this.isEdgeSwipe = startPoint.x <= this.edgeThreshold
    },
    
    /**
     * 处理右滑 - 展开侧边栏
     */
    handleSwipeRight({ startPoint }) {
      if (!this.isMobileOrTablet) return
      
      // 从左边缘右滑，或者在侧边栏区域右滑
      if ((this.isEdgeSwipe && !this.sidebar.opened) || 
          (startPoint.x <= 200 && !this.sidebar.opened)) {
        this.$store.dispatch('OpenSideBar', { withoutAnimation: false })
      }
    },
    
    /**
     * 处理左滑 - 收起侧边栏
     */
    handleSwipeLeft({ startPoint }) {
      if (!this.isMobileOrTablet) return
      
      // 在侧边栏打开状态下左滑
      if (this.sidebar.opened && startPoint.x <= 250) {
        this.$store.dispatch('CloseSideBar', { withoutAnimation: false })
      }
    },
    
    /**
     * 销毁手势识别
     */
    destroyGesture() {
      if (this.gestureRecognizer) {
        this.gestureRecognizer.destroy()
        this.gestureRecognizer = null
      }
    }
  },
  render() {
    // 该组件不渲染任何内容，仅提供手势功能
    return null
  }
}