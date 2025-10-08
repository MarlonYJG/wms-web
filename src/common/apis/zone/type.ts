/*
 * @Author: Marlon
 * @Description: 库区类型与接口定义
 */

export interface StorageZone {
  id: number
  warehouseId: number
  zoneCode: string
  zoneName: string
  zoneType: ZoneType
  capacity?: number
  usedCapacity?: number
  isEnabled: boolean
  createdTime: number
  updatedTime: number
}

export type ZoneType = 'STORAGE' | 'RECEIVING' | 'PICKING' | 'RETURN' | 'DEFECTIVE' | 'SHIPPING'

export interface StorageZoneForm {
  warehouseId: number
  zoneCode: string
  zoneName: string
  zoneType: ZoneType
  capacity?: number
  isEnabled?: boolean
}

export interface StorageZoneQuery {
  page?: number
  size?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  warehouseId?: number
  zoneType?: ZoneType
  keyword?: string
  isEnabled?: boolean | null
}

export interface PageResult<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  sorted: boolean
  unsorted: boolean
  total: number
}


