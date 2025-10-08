/*
 * @Author: Marlon
 * @Date: 2025-10-06 13:44:48
 * @Description: 
 */
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
  createdTime: number // 时间戳（毫秒）
  updatedTime: number // 时间戳（毫秒）
  createdBy?: string
  updatedBy?: string
}

/** 仓库查询参数 */
export interface WarehouseQuery {
  page?: number
  size?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  keyword?: string
  name?: string
  code?: string
  isEnabled?: boolean | null
  startTime?: number // 时间戳（毫秒）
  endTime?: number // 时间戳（毫秒）
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

/** 分页响应数据 */
export interface PageResult<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  sorted: boolean
  unsorted: boolean
  total: number
}

/** API统一响应格式 */
export interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
  error?: {
    type: string
    details: Array<{
      field: string
      message: string
    }>
  }
}
