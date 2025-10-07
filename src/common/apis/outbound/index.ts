import type { OutboundOrder, OutboundOrderForm, OutboundOrderItem, OutboundOrderQuery, PickingTask } from "./type"
import { http } from "@/http/axios"

/** 获取出库单列表 */
export function getOutboundOrderList(params: OutboundOrderQuery) {
  return http.get<OutboundOrder[]>("/outbound-order", { params })
}

/** 获取出库单详情 */
export function getOutboundOrderDetail(id: number) {
  return http.get<OutboundOrder>(`/outbound-order/${id}`)
}

/** 创建出库单 */
export function createOutboundOrder(data: OutboundOrderForm) {
  return http.post<OutboundOrder>("/outbound-order", data)
}

/** 更新出库单 */
export function updateOutboundOrder(id: number, data: Partial<OutboundOrderForm>) {
  return http.put<OutboundOrder>(`/outbound-order/${id}`, data)
}

/** 删除出库单 */
export function deleteOutboundOrder(id: number) {
  return http.delete(`/outbound-order/${id}`)
}

/** 分配库存 */
export function allocateInventory(id: number) {
  return http.post(`/outbound-order/${id}/allocate`)
}

/** 生成拣货任务 */
export function generatePickingTasks(id: number) {
  return http.post(`/outbound-order/${id}/generate-picking-tasks`)
}

/** 获取拣货任务 */
export function getPickingTasks(outboundOrderId: number) {
  return http.get<PickingTask[]>(`/outbound-order/${outboundOrderId}/picking-tasks`)
}

/** 完成拣货任务 */
export function completePickingTask(taskId: number, pickedQuantity: number) {
  return http.post(`/picking-task/${taskId}/complete`, { pickedQuantity })
}

/** 确认发货 */
export function confirmShipment(id: number, trackingNumber?: string) {
  return http.post(`/outbound-order/${id}/ship`, { trackingNumber })
}
