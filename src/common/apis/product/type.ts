/** 商品SKU信息 */
export interface ProductSku {
  id: number
  skuCode: string
  name: string
  specification?: string
  supplierId?: number
  supplierName?: string
  isBatchManaged: boolean
  isExpiryManaged: boolean
  shelfLifeDays?: number
  createdTime: string
}

/** 商品SKU查询参数 */
export interface ProductSkuQuery {
  page?: number
  size?: number
  skuCode?: string
  name?: string
  supplierId?: number
  isBatchManaged?: boolean
  isExpiryManaged?: boolean
}

/** 商品SKU表单数据 */
export interface ProductSkuForm {
  skuCode: string
  name: string
  specification?: string
  supplierId?: number
  isBatchManaged?: boolean
  isExpiryManaged?: boolean
  shelfLifeDays?: number
}

/** 商品库存信息 */
export interface ProductInventory {
  productSkuId: number
  productName: string
  warehouseId: number
  warehouseName: string
  totalQuantity: number
  availableQuantity: number
  lockedQuantity: number
  locations: InventoryLocation[]
}

/** 库存库位信息 */
export interface InventoryLocation {
  locationId: number
  locationCode: string
  batchNo?: string
  productionDate?: string
  expiryDate?: string
  quantity: number
  lockedQuantity: number
}
