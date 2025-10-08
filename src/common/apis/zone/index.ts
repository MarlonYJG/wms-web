import type { PageResult } from "@@/apis/zone/type"
import type { StorageZone, StorageZoneForm, StorageZoneQuery } from "./type"
import { http } from "@/http/axios"
import { smartRequest } from "@@/utils/request"

export function getStorageZoneList(params: StorageZoneQuery) {
  return smartRequest(
    () => http.get<PageResult<StorageZone>>("/storage-zones", { params }),
    { showError: true }
  )
}

export function createStorageZone(form: StorageZoneForm) {
  return smartRequest(
    () => http.post("/storage-zones", form),
    { showSuccess: true }
  )
}

export function updateStorageZone(id: number, form: StorageZoneForm) {
  return smartRequest(
    () => http.put(`/storage-zones/${id}`, form),
    { showSuccess: true }
  )
}

export function updateStorageZoneStatus(id: number, isEnabled: boolean) {
  return smartRequest(
    () => http.patch(`/storage-zones/${id}/status`, { isEnabled }),
    { showSuccess: true }
  )
}

export function deleteStorageZone(id: number) {
  return smartRequest(
    () => http.delete(`/storage-zones/${id}`),
    { showSuccess: true }
  )
}


