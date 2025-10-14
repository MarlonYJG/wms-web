export interface Customer {
  id: number
  customerCode: string
  customerName: string
  customerType?: string
  contactPerson?: string
  contactPhone?: string
  email?: string
  address?: string
  creditRating?: string
  creditLimit?: number
  isEnabled: boolean
  createdTime?: string
}

export interface CustomerQuery {
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


