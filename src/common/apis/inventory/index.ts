import type { Inventory, InventoryQuery, InventoryTransaction, InventoryTransactionQuery } from "./type"
import { http } from "@/http/axios"

/** 获取库存列表（分页） */
export function getInventoryList(params: InventoryQuery) {
  return http.get<PageResult<Inventory>>("/inventory", { params })
}

/** 获取库存详情 */
export function getInventoryDetail(id: number) {
  return http.get<Inventory>(`/inventory/${id}`)
}

/** 库存调整 */
export function adjustInventory(data: { id: number, quantity: number, reason: string }) {
  return http.post(`/inventory/${data.id}/adjust`, {
    quantity: data.quantity,
    reason: data.reason
  })
}

/** 库存转移 */
export function transferInventory(data: {
  id: number
  toLocationId: number
  quantity: number
  reason: string
}) {
  return http.post(`/inventory/${data.id}/transfer`, {
    toLocationId: data.toLocationId,
    quantity: data.quantity,
    reason: data.reason
  })
}

/** 获取库存流水 */
export function getInventoryTransactions(params: InventoryTransactionQuery) {
  return http.get<InventoryTransaction[]>("/inventory/transactions", { params })
}

/** 获取库存统计 */
export function getInventoryStats(warehouseId?: number) {
  return http.get("/inventory/stats", { params: { warehouseId } })
}
