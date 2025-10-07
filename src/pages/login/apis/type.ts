/*
 * @Author: Marlon
 * @Date: 2025-10-06 13:22:51
 * @Description:
 */
export interface LoginRequestData {
  username: string
  password: string
  /** 数字验证码内容 */
  code: string
  /** 数字验证码 token（init 返回） */
  token: string
}

export interface NumericCaptchaInitData {
  token: string
  imageBase64: string
}
