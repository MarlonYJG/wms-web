/** 库存信息 */
export interface Inventory {
  id: number
  warehouseId: number
  warehouseName: string
  locationId: number
  locationCode: string
  productSkuId: number
  productName: string
  skuCode: string
  batchNo?: string
  productionDate?: string
  expiryDate?: string
  quantity: number
  lockedQuantity: number
  availableQuantity: number
  createdTime: string
}

/** 库存查询参数 */
export interface InventoryQuery {
  page?: number
  size?: number
  warehouseId?: number
  locationId?: number
  productSkuId?: number
  skuCode?: string
  batchNo?: string
  hasStock?: boolean
}

/** 库存流水信息 */
export interface InventoryTransaction {
  id: number
  productSkuId: number
  productName: string
  skuCode: string
  batchNo?: string
  warehouseId: number
  warehouseName: string
  locationId: number
  locationCode: string
  transactionType: number
  transactionTypeName: string
  relatedOrderNo?: string
  quantityChange: number
  quantityAfter: number
  transactionTime: string
  operator?: number
  operatorName?: string
}

/** 库存流水查询参数 */
export interface InventoryTransactionQuery {
  page?: number
  size?: number
  productSkuId?: number
  warehouseId?: number
  locationId?: number
  transactionType?: number
  startTime?: string
  endTime?: string
}

/** 库存统计信息 */
export interface InventoryStats {
  totalProducts: number
  totalQuantity: number
  totalValue: number
  warehouseStats: WarehouseInventoryStats[]
}

/** 仓库库存统计 */
export interface WarehouseInventoryStats {
  warehouseId: number
  warehouseName: string
  productCount: number
  totalQuantity: number
  totalValue: number
}
