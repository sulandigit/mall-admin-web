<template>
  <div class="login-container">
    <div class="login-form-wrapper">
      <div class="login-form">
        <div class="title-container">
          <h3 class="title">Mall Admin Web</h3>
          <p class="subtitle">现代化后台管理系统</p>
        </div>

        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form-content"
          autocomplete="on"
          label-position="left"
        >
          <el-form-item prop="username">
            <span class="svg-container">
              <svg-icon icon-class="user" />
            </span>
            <el-input
              ref="usernameRef"
              v-model="loginForm.username"
              placeholder="用户名"
              name="username"
              type="text"
              tabindex="1"
              autocomplete="on"
            />
          </el-form-item>

          <el-tooltip content="Caps lock is On" placement="right" manual>
            <el-form-item prop="password">
              <span class="svg-container">
                <svg-icon icon-class="password" />
              </span>
              <el-input
                :key="passwordType"
                ref="passwordRef"
                v-model="loginForm.password"
                :type="passwordType"
                placeholder="密码"
                name="password"
                tabindex="2"
                autocomplete="on"
                @keyup.enter="handleLogin"
              />
              <span class="show-pwd" @click="showPwd">
                <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
              </span>
            </el-form-item>
          </el-tooltip>

          <el-button
            :loading="loading"
            type="primary"
            style="width: 100%; margin-bottom: 30px"
            @click.prevent="handleLogin"
          >
            登录
          </el-button>

          <div style="position: relative">
            <div class="tips">
              <span>演示账号</span>
              <span>用户名: admin</span>
              <span>密码: 123456</span>
            </div>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import SvgIcon from '@/components/SvgIcon/index.vue'

interface LoginForm {
  username: string
  password: string
}

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 表单引用
const loginFormRef = ref<FormInstance>()
const usernameRef = ref()
const passwordRef = ref()

// 响应式数据
const loginForm = reactive<LoginForm>({
  username: 'admin',
  password: '123456'
})

const loading = ref(false)
const passwordType = ref('password')
const redirect = ref<string | undefined>(undefined)
const otherQuery = ref({})

// 表单验证规则
const loginRules: FormRules = {
  username: [{ required: true, trigger: 'blur', message: '请输入用户名' }],
  password: [{ required: true, trigger: 'blur', message: '请输入密码' }]
}

// 显示/隐藏密码
const showPwd = () => {
  if (passwordType.value === 'password') {
    passwordType.value = ''
  } else {
    passwordType.value = 'password'
  }
  nextTick(() => {
    passwordRef.value.focus()
  })
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    const valid = await loginFormRef.value.validate()
    if (valid) {
      loading.value = true
      
      try {
        await userStore.login(loginForm)
        ElMessage.success('登录成功')
        
        router.push({ 
          path: redirect.value || '/', 
          query: otherQuery.value 
        })
      } catch (error) {
        console.error('Login error:', error)
        ElMessage.error('登录失败，请检查用户名和密码')
      } finally {
        loading.value = false
      }
    }
  } catch (error) {
    console.error('Form validation error:', error)
  }
}

// 获取其他查询参数
const getOtherQuery = (query: any) => {
  return Object.keys(query).reduce((acc: any, cur) => {
    if (cur !== 'redirect') {
      acc[cur] = query[cur]
    }
    return acc
  }, {})
}

// 生命周期钩子
onMounted(() => {
  if (loginForm.username === '') {
    usernameRef.value.focus()
  } else if (loginForm.password === '') {
    passwordRef.value.focus()
  }
})

// 监听路由变化
const watchRoute = () => {
  const query = route.query
  if (query) {
    redirect.value = query.redirect as string
    otherQuery.value = getOtherQuery(query)
  }
}

watchRoute()
</script>

<style lang="scss" scoped>
$bg: #2d3a4b;
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (caret-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

.login-container {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;

  .login-form-wrapper {
    width: 520px;
    max-width: 100%;
    padding: 0 35px;
  }

  .login-form {
    position: relative;
    width: 100%;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 50px 35px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);

    .title-container {
      text-align: center;
      margin-bottom: 40px;

      .title {
        font-size: 26px;
        color: #2d3a4b;
        margin: 0 auto 10px;
        font-weight: bold;
      }

      .subtitle {
        color: #666;
        font-size: 14px;
        margin: 0;
      }
    }

    .el-input {
      display: inline-block;
      height: 47px;
      width: 85%;

      :deep(.el-input__wrapper) {
        background: transparent;
        border: 0;
        border-radius: 0;
        padding: 12px 5px 12px 15px;
        color: $light_gray;
        height: 47px;
        caret-color: $cursor;

        &.is-focus {
          box-shadow: none !important;
        }
      }

      input {
        background: transparent;
        border: 0;
        -webkit-appearance: none;
        border-radius: 0;
        padding: 12px 5px 12px 15px;
        color: #333;
        height: 47px;
        caret-color: #333;

        &:-webkit-autofill {
          box-shadow: 0 0 0 1000px transparent inset !important;
          -webkit-text-fill-color: #333 !important;
        }
      }
    }

    .el-form-item {
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.1);
      border-radius: 5px;
      color: #454545;
    }

    .svg-container {
      padding: 6px 5px 6px 15px;
      color: #889aa4;
      vertical-align: middle;
      width: 30px;
      display: inline-block;
    }

    .show-pwd {
      position: absolute;
      right: 10px;
      top: 7px;
      font-size: 16px;
      color: #889aa4;
      cursor: pointer;
      user-select: none;
    }

    .tips {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;

      span {
        &:first-of-type {
          margin-right: 16px;
        }
      }
    }
  }
}
</style>