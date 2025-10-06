/** 入库单信息 */
export interface InboundOrder {
  id: number
  orderNo: string
  warehouseId: number
  warehouseName: string
  supplierId: number
  supplierName: string
  status: number
  statusName: string
  totalExpectedQuantity: number
  totalReceivedQuantity: number
  createdTime: string
  items: InboundOrderItem[]
}

/** 入库单明细 */
export interface InboundOrderItem {
  id: number
  inboundOrderId: number
  productSkuId: number
  productName: string
  skuCode: string
  expectedQuantity: number
  receivedQuantity: number
  createdTime: string
}

/** 入库单查询参数 */
export interface InboundOrderQuery {
  page?: number
  size?: number
  orderNo?: string
  warehouseId?: number
  supplierId?: number
  status?: number
  startTime?: string
  endTime?: string
}

/** 入库单表单数据 */
export interface InboundOrderForm {
  warehouseId: number
  supplierId: number
  items: Array<{
    productSkuId: number
    expectedQuantity: number
  }>
}

/** 上架任务信息 */
export interface PutawayTask {
  id: number
  taskNo: string
  inboundOrderItemId: number
  productName: string
  skuCode: string
  fromLocationId?: number
  fromLocationCode?: string
  toLocationId: number
  toLocationCode: string
  quantity: number
  status: number
  statusName: string
  operator?: number
  operatorName?: string
  completedTime?: string
  createdTime: string
}
