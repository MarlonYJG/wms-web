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


