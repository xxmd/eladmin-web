<template>
  <div class="login" :style="'background-image:url('+ Background +');'">
    <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-position="left" label-width="0px" class="login-form">
      <h3 class="title">
        ELADMIN 后台管理系统
      </h3>
      <el-form-item prop="username">
        <el-input v-model="loginForm.username" type="text" auto-complete="off" placeholder="账号">
          <template #prefix><svg-icon  icon-class="user" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="loginForm.password" type="password" auto-complete="off" placeholder="密码" @keyup.enter="handleLogin">
          <template #prefix><svg-icon  icon-class="password" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="code">
        <el-input v-model="loginForm.code" auto-complete="off" placeholder="验证码" style="width: 63%" @keyup.enter="handleLogin">
          <template #prefix><svg-icon  icon-class="validCode" class="el-input__icon input-icon" /></template>
        </el-input>
        <div class="login-code">
          <img :src="codeUrl" @click="getCode">
        </div>
      </el-form-item>
      <el-checkbox v-model="loginForm.rememberMe" style="margin:0 0 25px 0;">
        记住我
      </el-checkbox>
      <el-form-item style="width:100%;">
        <el-button :loading="loading" size="default" type="primary" style="width:100%;" @click.prevent="handleLogin">
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
      </el-form-item>
    </el-form>
    <!--  底部  -->
    <div v-if="store.state.settings.showFooter" id="el-login-footer">
      <span v-html="store.state.settings.footerTxt" />
      <span v-if="store.state.settings.caseNumber"> ⋅ </span>
      <a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank">{{ store.state.settings.caseNumber }}</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElNotification, type FormInstance, type FormRules } from 'element-plus'
import { encrypt } from '@/utils/rsaEncrypt'
import Config from '@/settings'
import { getCodeImg } from '@/api/login'
import Cookies from 'js-cookie'
import Background from '@/assets/images/background.jpeg'

defineOptions({ name: 'Login' })
const route = useRoute()
const router = useRouter()
const store = useStore()
const codeUrl = ref('')
const loading = ref(false)
const cookiePass = Cookies.get('password') || ''
const loginFormRef = ref<FormInstance>()
const loginForm = reactive({ username: Cookies.get('username') || 'admin', password: cookiePass || '123456', rememberMe: Cookies.get('rememberMe') === 'true', code: '', uuid: '' })
const loginRules: FormRules = {
  username: [{ required: true, trigger: 'blur', message: '用户名不能为空' }],
  password: [{ required: true, trigger: 'blur', message: '密码不能为空' }],
  code: [{ required: true, trigger: 'change', message: '验证码不能为空' }]
}
const redirect = computed(() => typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/') && !route.query.redirect.startsWith('//') ? route.query.redirect : '/')
async function getCode() {
  try { const result = await getCodeImg(); codeUrl.value = result.img; loginForm.uuid = result.uuid } catch { /* request layer displays API errors */ }
}
async function handleLogin() {
  if (loading.value || !await loginFormRef.value?.validate().catch(() => false)) return
  loading.value = true
  try {
    const credentials = { ...loginForm, password: loginForm.password === cookiePass ? cookiePass : encrypt(loginForm.password) }
    await store.dispatch('Login', credentials)
    if (credentials.rememberMe) {
      Cookies.set('username', credentials.username, { expires: Config.passCookieExpires })
      Cookies.set('password', credentials.password, { expires: Config.passCookieExpires })
      Cookies.set('rememberMe', 'true', { expires: Config.passCookieExpires })
    } else { ['username', 'password', 'rememberMe'].forEach(key => Cookies.remove(key)) }
    await router.push(redirect.value)
  } catch { await getCode() } finally { loading.value = false }
}
onMounted(() => {
  void getCode()
  if (Cookies.get('point')) {
    ElNotification.warning({ title: '提示', message: '当前登录状态已过期，请重新登录！', duration: 5000 })
    Cookies.remove('point')
  }
})
</script>

<style rel="stylesheet/scss" lang="scss">
  .login {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    background-size: cover;
  }
  .title {
    margin: 0 auto 30px auto;
    text-align: center;
    color: #707070;
  }

  .login-form {
    border-radius: 6px;
    background: #ffffff;
    width: 385px;
    padding: 25px 25px 5px 25px;
    .el-input {
      height: 38px;
      input {
        height: 38px;
      }
    }
    .input-icon{
      height: 39px;width: 14px;margin-left: 2px;
    }
  }
  .login-tip {
    font-size: 13px;
    text-align: center;
    color: #bfbfbf;
  }
  .login-code {
    width: 33%;
    display: inline-block;
    height: 38px;
    float: right;
    img{
      cursor: pointer;
      vertical-align:middle
    }
  }
</style>
