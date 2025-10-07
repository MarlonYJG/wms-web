import type { Warehouse, WarehouseForm, WarehouseQuery } from "./type"
import { http } from "@/http/axios"

/** 获取仓库列表 */
export function getWarehouseList(params: WarehouseQuery) {
  return http.get<Warehouse[]>("/warehouse", { params })
}

/** 获取仓库详情 */
export function getWarehouseDetail(id: number) {
  return http.get<Warehouse>(`/warehouse/${id}`)
}

/** 创建仓库 */
export function createWarehouse(data: WarehouseForm) {
  return http.post<Warehouse>("/warehouse", data)
}

/** 更新仓库 */
export function updateWarehouse(id: number, data: WarehouseForm) {
  return http.put<Warehouse>(`/warehouse/${id}`, data)
}

/** 删除仓库 */
export function deleteWarehouse(id: number) {
  return http.delete(`/warehouse/${id}`)
}

/** 获取仓库统计信息 */
export function getWarehouseStats(id: number) {
  return http.get(`/warehouse/${id}/stats`)
}
