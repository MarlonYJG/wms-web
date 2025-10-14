import type { PageResult } from "./type"
import type { Supplier, SupplierQuery } from "./type"
import { http } from "@/http/axios"
import { smartRequest } from "@@/utils/request"

export function getSupplierList(params: SupplierQuery) {
  return smartRequest(
    () => http.get<PageResult<Supplier>>("/suppliers", { params }),
    { showError: true }
  )
}

export function getSupplierDetail(id: number) {
  return smartRequest(
    () => http.get<Supplier>(`/suppliers/${id}`),
    { showError: true }
  )
}

export function createSupplier(data: Partial<Supplier>) {
  return smartRequest(
    () => http.post<Supplier>("/suppliers", data),
    { showError: true }
  )
}

export function updateSupplier(id: number, data: Partial<Supplier>) {
  return smartRequest(
    () => http.put<Supplier>(`/suppliers/${id}`, data),
    { showError: true }
  )
}

export function deleteSupplier(id: number) {
  return smartRequest(
    () => http.delete(`/suppliers/${id}`),
    { showError: true }
  )
}

export function updateSupplierStatus(id: number, isEnabled: boolean) {
  return smartRequest(
    () => http.patch<Supplier>(`/suppliers/${id}/status`, { isEnabled }),
    { showError: true }
  )
}


