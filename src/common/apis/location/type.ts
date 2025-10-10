/*
 * @Author: Marlon
 * @Description: 库位类型与接口定义
 */

export interface StorageLocation {
  id: number
  zoneId: number
  locationCode: string
  locationName?: string
  locationType?: LocationType
  capacity?: number
  currentVolume?: number
  status: LocationStatus
  createdTime: number
  updatedTime: number
}

export type LocationType = 'SHELF' | 'FLOOR' | 'COLD' | 'DANGEROUS'

export type LocationStatus = 'AVAILABLE' | 'OCCUPIED' | 'DISABLED'

export interface StorageLocationForm {
  zoneId: number
  locationCode: string
  locationName?: string
  locationType?: LocationType
  capacity?: number
  status?: LocationStatus
}

export interface StorageLocationQuery {
  page?: number
  size?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  warehouseId?: number
  zoneId?: number
  locationType?: LocationType
  status?: LocationStatus
  keyword?: string
}

export interface BatchCreateLocationForm {
  zoneId: number
  locationType?: LocationType
  capacity?: number
  startRow: number
  endRow: number
  startLevel: number
  endLevel: number
  startPosition: number
  endPosition: number
  zoneCodePrefix?: string
}

export interface PageResult<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  sorted: boolean
  unsorted: boolean
  total: number
}


