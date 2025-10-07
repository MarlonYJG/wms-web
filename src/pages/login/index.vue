<script lang="ts" setup>
import type { FormRules } from "element-plus"
import type { LoginRequestData } from "./apis/type"
import ThemeSwitch from "@@/components/ThemeSwitch/index.vue"
import { Key, Lock, User } from "@element-plus/icons-vue"
import { useSettingsStore } from "@/pinia/stores/settings"
import { useUserStore } from "@/pinia/stores/user"
import { initNumericCaptchaApi, loginApi } from "./apis"
import Owl from "./components/Owl.vue"
import { useFocus } from "./composables/useFocus"

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const { isFocus, handleBlur, handleFocus } = useFocus()

const loginFormRef = useTemplateRef("loginFormRef")
const loading = ref(false)

// 数字验证码
const captchaToken = ref("")
const captchaImage = ref("")

const loginFormData: LoginRequestData = reactive({
  username: "管理员",
  password: "12345678",
  code: "",
  token: ""
})

const loginFormRules: FormRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 8, max: 16, message: "长度在 8 到 16 个字符", trigger: "blur" }
  ],
  code: [{ required: true, message: "请输入验证码", trigger: "blur" }]
}

async function refreshCaptcha() {
  const data = await initNumericCaptchaApi()
  captchaToken.value = data.token
  captchaImage.value = data.imageBase64?.startsWith("data:image")
    ? data.imageBase64
    : `data:image/png;base64,${data.imageBase64 || ""}`
  loginFormData.code = ""
  loginFormData.token = captchaToken.value
}

async function handleLogin() {
  loginFormRef.value?.validate(async (valid) => {
    if (!valid) {
      ElMessage.error("表单校验不通过")
      return
    }
    loading.value = true
    try {
      // 仅调用登录，由后端完成验证码+账号校验
      const res = await loginApi(loginFormData)
      userStore.setToken(res.data.token)
      if (res.msg) ElMessage.success(res.msg)
      router.push(route.query.redirect ? decodeURIComponent(route.query.redirect as string) : "/")
    } catch (err: any) {
      // 验证码失败时刷新验证码，其它错误仅清空密码
      const msg: string | undefined = err?.message || err?.msg
      if (msg && msg.toLowerCase().includes("captcha")) {
        await refreshCaptcha()
      }
      loginFormData.password = ""
    } finally {
      loading.value = false
    }
  })
}

onMounted(() => {
  refreshCaptcha()
})
</script>

<template>
  <div class="login-container">
    <ThemeSwitch v-if="settingsStore.showThemeSwitch" class="theme-switch" />
    <Owl :close-eyes="isFocus" />
    <div class="login-card">
      <div class="title">
        <img src="@@/assets/images/layouts/logo-text-2.png">
      </div>
      <div class="content">
        <el-form ref="loginFormRef" :model="loginFormData" :rules="loginFormRules" @keyup.enter="handleLogin">
          <el-form-item prop="username">
            <el-input
              v-model.trim="loginFormData.username" placeholder="用户名" type="text" tabindex="1"
              :prefix-icon="User" size="large"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model.trim="loginFormData.password" placeholder="密码" type="password" tabindex="2"
              :prefix-icon="Lock" size="large" show-password @blur="handleBlur" @focus="handleFocus"
            />
          </el-form-item>
          <el-form-item prop="code">
            <el-input
              v-model.trim="loginFormData.code" placeholder="验证码" type="text" tabindex="3" :prefix-icon="Key"
              maxlength="6" size="large"
            >
              <template #append>
                <el-image :src="captchaImage" draggable="false" @click="refreshCaptcha" />
              </template>
            </el-input>
          </el-form-item>
          <el-button :loading="loading" type="primary" size="large" @click.prevent="handleLogin">
            登 录
          </el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 100%;

  .theme-switch {
    position: fixed;
    top: 5%;
    right: 5%;
    cursor: pointer;
  }

  .login-card {
    width: 480px;
    max-width: 90%;
    border-radius: 20px;
    box-shadow: 0 0 10px #dcdfe6;
    background-color: var(--el-bg-color);
    overflow: hidden;

    .title {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 150px;

      img {
        height: 100%;
      }
    }

    .content {
      padding: 20px 50px 50px 50px;

      :deep(.el-input-group__append) {
        padding: 0;
        overflow: hidden;

        .el-image {
          width: 100px;
          height: 40px;
          user-select: none;
          cursor: pointer;
          text-align: center;
        }
      }

      .el-button {
        width: 100%;
        margin-top: 10px;
      }
    }
  }
}
</style>
