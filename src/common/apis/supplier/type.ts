export interface Supplier {
  id: number
  supplierCode: string
  supplierName: string
  contactPerson?: string
}

export interface SupplierQuery {
  page?: number
  size?: number
  keyword?: string
  isEnabled?: boolean | null
}

export interface PageResult<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  total: number
}


