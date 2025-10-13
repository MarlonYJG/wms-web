import type { InboundOrder, InboundOrderForm, InboundOrderItem, InboundOrderQuery, PutawayTask } from "./type"
import { http } from "@/http/axios"

/** 获取入库单列表（分页） */
export function getInboundOrderList(params: InboundOrderQuery) {
  return http.get<PageResult<InboundOrder>>("/inbound-order", { params })
}

/** 获取入库单详情 */
export function getInboundOrderDetail(id: number) {
  return http.get<InboundOrder>(`/inbound-order/${id}`)
}

/** 创建入库单 */
export function createInboundOrder(data: InboundOrderForm) {
  return http.post<InboundOrder>("/inbound-order", data)
}

/** 更新入库单 */
export function updateInboundOrder(id: number, data: Partial<InboundOrderForm>) {
  return http.put<InboundOrder>(`/inbound-order/${id}`, data)
}

/** 删除入库单 */
export function deleteInboundOrder(id: number) {
  return http.delete(`/inbound-order/${id}`)
}

/** 确认收货 */
export function confirmReceipt(id: number, items: Array<{ productSkuId: number, receivedQuantity: number, batchNo?: string }>) {
  return http.post(`/inbound-order/${id}/confirm-receipt`, { items })
}

/** 获取上架任务 */
export function getPutawayTasks(inboundOrderId: number) {
  return http.get<PutawayTask[]>(`/inbound-order/${inboundOrderId}/putaway-tasks`)
}

/** 完成上架任务 */
export function completePutawayTask(taskId: number) {
  return http.post(`/putaway-task/${taskId}/complete`)
}
