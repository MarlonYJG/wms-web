/*
 * @Author: Marlon
 * @Date: 2025-10-06 13:22:51
 * @Description:
 */
import type * as Auth from "./type"
import { http, request } from "@/http/axios"

/** 登录并返回 Token */
export function loginApi(data: Auth.LoginRequestData) {
  // 需要显示后端 msg：返回完整结构 { code, data, msg }
  return request<{ code: number, data: { token: string }, msg: string }>({
    url: "auth/login",
    method: "post",
    data,
    returnFull: true as any
  })
}

// 已改用数字验证码

/** 初始化数字验证码 */
export function initNumericCaptchaApi() {
  // 拦截器已解包，直接返回 { token, imageBase64 }
  return http.get<Auth.NumericCaptchaInitData>("auth/captcha/init")
}

/** 校验数字验证码 */
export function verifyNumericCaptchaApi(params: { token: string, code: string }) {
  // 需要提示 msg：传 returnFull 让拦截器返回 { code, data, msg }
  return request<{ code: number, data: string | null, msg: string }>({
    url: "auth/captcha/verify",
    method: "post",
    params,
    returnFull: true as any
  })
}
