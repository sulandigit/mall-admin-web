import { createApp } from 'vue'
import SvgIcon from '@/components/SvgIcon/index.vue'// svg组件

// 在main.js中全局注册
// app.component('svg-icon', SvgIcon)

const requireAll = requireContext => requireContext.keys().map(requireContext)
const req = require.context('./svg', false, /\.svg$/)
requireAll(req)

export default SvgIcon
