<template>
  <div class="login-container" role="main" aria-label="用户登录页面">
    <el-card class="login-form-layout" role="form" aria-labelledby="login-title">
      <el-form autoComplete="on"
               :model="loginForm"
               :rules="loginRules"
               ref="loginForm"
               label-position="left"
               @submit.native.prevent="handleLogin"
               aria-describedby="login-description">
        <div style="text-align: center">
          <svg-icon 
            icon-class="login-mall" 
            style="width: 56px;height: 56px;color: #409EFF"
            aria-hidden="true"></svg-icon>
        </div>
        <h1 id="login-title" class="login-title color-main">mall-admin-web</h1>
        <p id="login-description" class="sr-only">请输入您的用户名和密码来登录系统</p>
        
        <!-- 用户名输入框 -->
        <el-form-item prop="username">
          <label for="username-input" class="sr-only">用户名</label>
          <el-input 
            id="username-input"
            name="username"
            type="text"
            v-model="loginForm.username"
            autoComplete="username"
            placeholder="请输入用户名"
            aria-label="用户名"
            aria-required="true"
            aria-describedby="username-error"
            v-focus="true">
          <span slot="prefix" aria-hidden="true">
            <svg-icon icon-class="user" class="color-main"></svg-icon>
          </span>
          </el-input>
          <span id="username-error" class="sr-only" v-if="usernameError" aria-live="polite">
            {{ usernameError }}
          </span>
        </el-form-item>
        
        <!-- 密码输入框 -->
        <el-form-item prop="password">
          <label for="password-input" class="sr-only">密码</label>
          <el-input 
            id="password-input"
            name="password"
            :type="pwdType"
            @keyup.enter.native="handleLogin"
            v-model="loginForm.password"
            autoComplete="current-password"
            placeholder="请输入密码"
            aria-label="密码"
            aria-required="true"
            aria-describedby="password-error password-toggle">
          <span slot="prefix" aria-hidden="true">
            <svg-icon icon-class="password" class="color-main"></svg-icon>
          </span>
            <span slot="suffix" 
                  @click="showPwd" 
                  v-clickable="showPwd"
                  :aria-label="pwdType === 'password' ? '显示密码' : '隐藏密码'"
                  aria-describedby="password-toggle"
                  role="button">
            <svg-icon icon-class="eye" class="color-main"></svg-icon>
          </span>
          </el-input>
          <span id="password-error" class="sr-only" v-if="passwordError" aria-live="polite">
            {{ passwordError }}
          </span>
          <span id="password-toggle" class="sr-only">
            点击可以{{ pwdType === 'password' ? '显示' : '隐藏' }}密码
          </span>
        </el-form-item>
        
        <!-- 登录按钮 -->
        <el-form-item style="margin-bottom: 60px;text-align: center">
          <el-button 
            style="width: 45%" 
            type="primary" 
            :loading="loading" 
            @click.native.prevent="handleLogin"
            aria-describedby="login-button-desc"
            :aria-label="loading ? '登录中...' : '登录'"
            :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
          <el-button 
            style="width: 45%" 
            type="primary" 
            @click.native.prevent="handleTry"
            aria-label="获取体验账号"
            :disabled="loading">
            获取体验账号
          </el-button>
          <span id="login-button-desc" class="sr-only">
            点击登录按钮或按Enter键提交表单
          </span>
        </el-form-item>
      </el-form>
    </el-card>
    
    <img 
      :src="login_center_bg" 
      class="login-center-layout"
      alt="登录页面背景图片"
      aria-hidden="true">
    
    <!-- 体验账号对话框 -->
    <el-dialog
      title="公众号二维码"
      :visible.sync="dialogVisible"
      :show-close="true"
      :center="true"
      width="30%"
      role="dialog"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-content"
      v-trap-focus="dialogVisible"
      @close="dialogCancel">
      <h3 id="dialog-title" class="sr-only">公众号二维码</h3>
      <div id="dialog-content" style="text-align: center">
        <span class="font-title-large">
          <span class="color-main font-extra-large">关注公众号</span>回复
          <span class="color-main font-extra-large">体验</span>获取体验账号
        </span>
        <br>
        <img 
          src="http://macro-oss.oss-cn-shenzhen.aliyuncs.com/mall/banner/qrcode_for_macrozheng_258.jpg" 
          width="160" 
          height="160" 
          style="margin-top: 10px"
          alt="公众号二维码，扫码关注获取体验账号">
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button 
          type="primary" 
          @click="dialogConfirm"
          aria-label="确认关闭对话框">
          确定
        </el-button>
      </span>
    </el-dialog>
    
    <!-- 错误消息实时通知 -->
    <div 
      aria-live="assertive" 
      aria-atomic="true" 
      class="sr-only"
      v-announce="errorMessage">
    </div>
  </div>
</template>

<script>
  import {isvalidUsername} from '@/utils/validate';
  import {setSupport,getSupport,setCookie,getCookie} from '@/utils/support';
  import { liveAnnouncer } from '@/utils/accessibility';
  import login_center_bg from '@/assets/images/login_center_bg.png'

  export default {
    name: 'login',
    data() {
      const validateUsername = (rule, value, callback) => {
        if (!isvalidUsername(value)) {
          this.usernameError = '请输入正确的用户名';
          callback(new Error('请输入正确的用户名'))
        } else {
          this.usernameError = '';
          callback()
        }
      };
      const validatePass = (rule, value, callback) => {
        if (value.length < 3) {
          this.passwordError = '密码不能小于3位';
          callback(new Error('密码不能小于3位'))
        } else {
          this.passwordError = '';
          callback()
        }
      };
      return {
        loginForm: {
          username: '',
          password: '',
        },
        loginRules: {
          username: [{required: true, trigger: 'blur', validator: validateUsername}],
          password: [{required: true, trigger: 'blur', validator: validatePass}]
        },
        loading: false,
        pwdType: 'password',
        login_center_bg,
        dialogVisible:false,
        supportDialogVisible:false,
        usernameError: '',
        passwordError: '',
        errorMessage: ''
      }
    },
    created() {
      this.loginForm.username = getCookie("username");
      this.loginForm.password = getCookie("password");
      if(this.loginForm.username === undefined||this.loginForm.username==null||this.loginForm.username===''){
        this.loginForm.username = 'admin';
      }
      if(this.loginForm.password === undefined||this.loginForm.password==null){
        this.loginForm.password = '';
      }
    },
    mounted() {
      // 宣告页面加载完成
      liveAnnouncer.announce('登录页面已加载完成，请输入您的用户名和密码');
    },
    methods: {
      showPwd() {
        if (this.pwdType === 'password') {
          this.pwdType = 'text';
          liveAnnouncer.announce('密码已显示');
        } else {
          this.pwdType = 'password';
          liveAnnouncer.announce('密码已隐藏');
        }
      },
      handleLogin() {
        this.$refs.loginForm.validate(valid => {
          if (valid) {
            this.loading = true;
            this.errorMessage = '';
            liveAnnouncer.announce('正在登录，请稍候...');
            
            this.$store.dispatch('Login', this.loginForm).then(() => {
              this.loading = false;
              setCookie("username",this.loginForm.username,15);
              setCookie("password",this.loginForm.password,15);
              liveAnnouncer.announce('登录成功，正在跳转到主页...');
              this.$router.push({path: '/'})
            }).catch((error) => {
              this.loading = false;
              this.errorMessage = '登录失败，请检查用户名和密码';
              liveAnnouncer.announceUrgent(this.errorMessage);
            })
          } else {
            this.errorMessage = '请填写正确的用户名和密码';
            liveAnnouncer.announceUrgent(this.errorMessage);
            console.log('参数验证不合法！');
            return false
          }
        })
      },
      handleTry(){
        this.dialogVisible = true;
        liveAnnouncer.announce('已打开体验账号对话框');
      },
      dialogConfirm(){
        this.dialogVisible = false;
        setSupport(true);
        liveAnnouncer.announce('对话框已关闭');
      },
      dialogCancel(){
        this.dialogVisible = false;
        setSupport(false);
        liveAnnouncer.announce('对话框已关闭');
      }
    }
  }
</script>

<style scoped>
  .login-container {
    min-height: 100vh;
    background-color: #f5f5f5;
  }
  
  .login-form-layout {
    position: absolute;
    left: 0;
    right: 0;
    width: 360px;
    margin: 140px auto;
    border-top: 10px solid #409EFF;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .login-title {
    text-align: center;
    margin: 20px 0;
    font-size: 24px;
    font-weight: 600;
  }

  .login-center-layout {
    background: #409EFF;
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    margin-top: 200px;
  }
  
  /* 无障碍改进 */
  .el-input__inner:focus,
  .el-button:focus {
    outline: 2px solid #409EFF;
    outline-offset: 2px;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  }
  
  /* 高对比度错误状态 */
  .el-form-item.is-error .el-input__inner {
    border-color: #F56C6C;
    background-color: #fef0f0;
  }
  
  /* 提高按钮的可访问性 */
  .el-button {
    min-height: 44px; /* WCAG 要求的最小点击目标尺寸 */
    font-size: 16px;
    font-weight: 500;
  }
  
  .el-button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  /* 密码显示/隐藏按钮样式 */
  .el-input__suffix {
    cursor: pointer;
  }
  
  .el-input__suffix:focus {
    outline: 2px solid #409EFF;
    outline-offset: 1px;
  }
  
  /* 对话框无障碍改进 */
  .el-dialog {
    max-width: 90vw;
  }
  
  .el-dialog__header {
    text-align: center;
  }
  
  .el-dialog__title {
    font-size: 18px;
    font-weight: 600;
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .login-form-layout {
      width: 90%;
      margin: 60px auto;
    }
    
    .login-center-layout {
      margin-top: 100px;
    }
  }
  
  /* 高对比度模式支持 */
  @media (prefers-contrast: high) {
    .login-form-layout {
      border: 2px solid #000;
    }
    
    .el-button {
      border: 2px solid currentColor;
    }
  }
  
  /* 减少动画模式支持 */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
</style>
