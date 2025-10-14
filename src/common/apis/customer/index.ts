import type { Customer, CustomerQuery, PageResult } from "./type"
import { http } from "@/http/axios"
import { smartRequest } from "@@/utils/request"

export function getCustomerList(params: CustomerQuery) {
  return smartRequest(
    () => http.get<PageResult<Customer>>("/customers", { params }),
    { showError: true }
  )
}

export function getCustomerDetail(id: number) {
  return smartRequest(
    () => http.get<Customer>(`/customers/${id}`),
    { showError: true }
  )
}

export function createCustomer(data: Partial<Customer>) {
  return smartRequest(
    () => http.post<Customer>("/customers", data),
    { showError: true }
  )
}

export function updateCustomer(id: number, data: Partial<Customer>) {
  return smartRequest(
    () => http.put<Customer>(`/customers/${id}`, data),
    { showError: true }
  )
}

export function deleteCustomer(id: number) {
  return smartRequest(
    () => http.delete(`/customers/${id}`),
    { showError: true }
  )
}

export function updateCustomerStatus(id: number, isEnabled: boolean) {
  return smartRequest(
    () => http.patch<Customer>(`/customers/${id}/status`, { isEnabled }),
    { showError: true }
  )
}


