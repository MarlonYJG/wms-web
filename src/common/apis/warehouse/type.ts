/** 仓库信息 */
export interface Warehouse {
  id: number
  name: string
  code: string
  address?: string
  contactPerson?: string
  contactPhone?: string
  totalCapacity?: number
  usedCapacity?: number
  isEnabled: boolean
  createdTime: string
}

/** 仓库查询参数 */
export interface WarehouseQuery {
  page?: number
  size?: number
  keyword?: string
  name?: string
  code?: string
  isEnabled?: boolean
}

/** 仓库表单数据 */
export interface WarehouseForm {
  name: string
  code: string
  address?: string
  contactPerson?: string
  contactPhone?: string
  totalCapacity?: number
  isEnabled?: boolean
}

/** 仓库统计信息 */
export interface WarehouseStats {
  totalLocations: number
  occupiedLocations: number
  totalInventory: number
  totalValue: number
  inboundOrders: number
  outboundOrders: number
}

export interface PageResult<T> {
  data: T[]
  total: number
}
