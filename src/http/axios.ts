import type { AxiosInstance, AxiosRequestConfig } from "axios"
import { getToken } from "@@/utils/cache/cookies"
import axios from "axios"
import { get, merge } from "lodash-es"
import { useUserStore } from "@/pinia/stores/user"

/** 为请求配置扩展：控制是否返回完整响应（包含 msg） */
export interface WmsAxiosRequestConfig<T = any> extends AxiosRequestConfig<T> {
  returnFull?: boolean
}

/** 退出登录并强制刷新页面（会重定向到登录页） */
function logout() {
  useUserStore().logout()
  location.reload()
}

/** 创建请求实例 */
function createInstance() {
  // 创建一个 axios 实例命名为 instance
  const instance = axios.create()
  // 请求拦截器
  instance.interceptors.request.use(
    // 发送之前
    config => config,
    // 发送失败
    error => Promise.reject(error)
  )
  // 响应拦截器（可根据具体业务作出相应的调整）
  instance.interceptors.response.use(
    (response) => {
      // apiData 是 api 返回的数据
      const apiData = response.data
      // 二进制数据则直接返回
      const responseType = response.config.responseType
      if (responseType === "blob" || responseType === "arraybuffer") return apiData
      // 统一响应结构 { data, code, msg }
      if (apiData && typeof apiData === 'object' && Object.prototype.hasOwnProperty.call(apiData, 'code')) {
        const code = apiData.code
        if (code === 200 || code === 0) {
          // 可选：返回完整响应（包含 msg），供部分接口获取提示信息
          if ((response.config as WmsAxiosRequestConfig)?.returnFull) {
            return apiData
          }
          return apiData.data
        }
        if (code === 401) {
          return logout()
        }
        ElMessage.error(apiData.msg || apiData.message || "Error")
        return Promise.reject(new Error(apiData.msg || apiData.message || "Error"))
      }
      // 非标准结构则原样返回（如第三方接口）
      return apiData
    },
    (error) => {
      // status 是 HTTP 状态码
      const status = get(error, "response.status")
      // 优先使用后端标准字段 msg，其次 message
      const backendMsg = get(error, "response.data.msg") || get(error, "response.data.message")
      switch (status) {
        case 400:
          error.message = backendMsg || "请求错误"
          break
        case 401:
          // Token 过期时
          error.message = backendMsg || "未授权"
          logout()
          break
        case 403:
          error.message = backendMsg || "拒绝访问"
          break
        case 404:
          error.message = "请求地址出错"
          break
        case 408:
          error.message = "请求超时"
          break
        case 500:
          error.message = backendMsg || "服务器内部错误"
          break
        case 501:
          error.message = "服务未实现"
          break
        case 502:
          error.message = "网关错误"
          break
        case 503:
          error.message = backendMsg || "服务不可用"
          break
        case 504:
          error.message = "网关超时"
          break
        case 505:
          error.message = "HTTP 版本不受支持"
          break
      }
      ElMessage.error(error.message || backendMsg || "请求失败")
      return Promise.reject(error)
    }
  )
  return instance
}

/** 创建请求方法 */
function createRequest(instance: AxiosInstance) {
  return <T>(config: WmsAxiosRequestConfig): Promise<T> => {
    const token = getToken()
    // 默认配置
    const defaultConfig: WmsAxiosRequestConfig = {
      // 接口地址
      baseURL: "/api/v1",
      // 请求头
      headers: {
        // 携带 Token
        "Authorization": token ? `Bearer ${token}` : undefined,
        "Content-Type": "application/json"
      },
      // 请求体
      data: {},
      // 请求超时
      timeout: 5000,
      // 跨域请求时是否携带 Cookies
      withCredentials: false
    }
    // 将默认配置 defaultConfig 和传入的自定义配置 config 进行合并成为 mergeConfig
    const mergeConfig = merge(defaultConfig, config) as WmsAxiosRequestConfig
    // 规范化 url，确保以 / 开头，避免与 baseURL 拼接异常
    if (mergeConfig.url && !mergeConfig.url.startsWith("/")) {
      mergeConfig.url = `/${mergeConfig.url}`
    }
    return instance(mergeConfig)
  }
}

/** 用于请求的实例 */
const instance = createInstance()

/** 用于请求的方法 */
export const request = createRequest(instance)

/** 轻量封装，提供 http.get/post 等便捷方法（返回已解包的 data） */
type Method = "get" | "post" | "put" | "delete" | "patch"
function call<T>(method: Method, url: string, config: WmsAxiosRequestConfig = {}): Promise<T> {
  return request<T>({ ...config, method, url })
}
export const http = {
  get: <T>(url: string, config?: WmsAxiosRequestConfig) => call<T>("get", url, config),
  post: <T>(url: string, data?: unknown, config: WmsAxiosRequestConfig = {}) => call<T>("post", url, { ...config, data }),
  put: <T>(url: string, data?: unknown, config: WmsAxiosRequestConfig = {}) => call<T>("put", url, { ...config, data }),
  delete: <T>(url: string, config?: WmsAxiosRequestConfig) => call<T>("delete", url, config),
  patch: <T>(url: string, data?: unknown, config: WmsAxiosRequestConfig = {}) => call<T>("patch", url, { ...config, data })
}
