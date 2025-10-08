import type { ApiResponse, PageResult, Warehouse, WarehouseForm, WarehouseQuery } from "./type"
import { http } from "@/http/axios"
import { smartRequest } from "@/common/utils/request"

/** 获取仓库列表（分页） */
export function getWarehouseList(params: WarehouseQuery) {
  // Axios 拦截器已解包到 data，这里直接使用解包后的类型
  return smartRequest(
    () => http.get<PageResult<Warehouse>>("/warehouses", { params }),
    { showError: true }
  )
}

/** 获取仓库详情 */
export function getWarehouseDetail(id: number) {
  return smartRequest(
    () => http.get<Warehouse>(`/warehouses/${id}`),
    { showError: true }
  )
}

/** 创建仓库 */
export function createWarehouse(data: WarehouseForm) {
  return smartRequest(
    () => http.post<Warehouse>("/warehouses", data),
    { showError: true, showSuccess: true, successMessage: "创建成功" }
  )
}

/** 更新仓库 */
export function updateWarehouse(id: number, data: WarehouseForm) {
  return smartRequest(
    () => http.put<Warehouse>(`/warehouses/${id}`, data),
    { showError: true, showSuccess: true, successMessage: "更新成功" }
  )
}

/** 删除仓库 */
export function deleteWarehouse(id: number) {
  return smartRequest(
    () => http.delete<null>(`/warehouses/${id}`),
    { showError: true, showSuccess: true, successMessage: "删除成功" }
  )
}

/** 启用/禁用仓库 */
export function updateWarehouseStatus(id: number, isEnabled: boolean) {
  return smartRequest(
    () => http.patch<Warehouse>(`/warehouses/${id}/status`, { isEnabled }),
    { showError: true, showSuccess: true, successMessage: isEnabled ? "已启用" : "已禁用" }
  )
}

/** 获取仓库统计信息 */
export function getWarehouseStats(id: number) {
  return smartRequest(
    () => http.get<any>(`/warehouses/${id}/stats`),
    { showError: true }
  )
}