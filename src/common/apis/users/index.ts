import type * as Users from "./type"
import { request } from "@/http/axios"

/** 获取当前登录用户详情 */
export function getCurrentUserApi() {
  // 返回完整结构以兼容 res.data.username 的调用方式
  return request<{ code: number, data: Users.CurrentUserResponseData, msg: string }>({
    url: "users/me",
    method: "get",
    returnFull: true as any
  })
}
