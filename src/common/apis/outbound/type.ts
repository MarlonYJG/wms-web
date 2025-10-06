/** 出库单信息 */
export interface OutboundOrder {
  id: number
  orderNo: string
  warehouseId: number
  warehouseName: string
  customerId: number
  customerName: string
  status: number
  statusName: string
  customerInfo: string
  createdTime: string
  items: OutboundOrderItem[]
}

/** 出库单明细 */
export interface OutboundOrderItem {
  id: number
  outboundOrderId: number
  productSkuId: number
  productName: string
  skuCode: string
  quantity: number
  allocatedQuantity: number
  pickedQuantity: number
  createdTime: string
}

/** 出库单查询参数 */
export interface OutboundOrderQuery {
  page?: number
  size?: number
  orderNo?: string
  warehouseId?: number
  customerId?: number
  status?: number
  startTime?: string
  endTime?: string
}

/** 出库单表单数据 */
export interface OutboundOrderForm {
  warehouseId: number
  customerId: number
  customerInfo: string
  items: Array<{
    productSkuId: number
    quantity: number
  }>
}

/** 拣货任务信息 */
export interface PickingTask {
  id: number
  taskNo: string
  waveNo?: string
  outboundOrderId: number
  outboundOrderNo: string
  productSkuId: number
  productName: string
  skuCode: string
  fromLocationId: number
  fromLocationCode: string
  quantity: number
  status: number
  statusName: string
  pickedQuantity: number
  createdTime: string
}
