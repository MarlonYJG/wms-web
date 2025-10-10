import type { BatchCreateLocationForm, PageResult, StorageLocation, StorageLocationForm, StorageLocationQuery } from "./type"
import { http } from "@/http/axios"
import { smartRequest } from "@@/utils/request"

export function getStorageLocationList(params: StorageLocationQuery) {
  return smartRequest(
    () => http.get<PageResult<StorageLocation>>("/storage-locations", { params }),
    { showError: true }
  )
}

export function createStorageLocation(data: StorageLocationForm) {
  return smartRequest(
    () => http.post<StorageLocation>("/storage-locations", data),
    { showError: true, showSuccess: true, successMessage: "创建成功" }
  )
}

export function updateStorageLocation(id: number, data: StorageLocationForm) {
  return smartRequest(
    () => http.put<StorageLocation>(`/storage-locations/${id}`, data),
    { showError: true, showSuccess: true, successMessage: "更新成功" }
  )
}

export function updateStorageLocationStatus(id: number, status: string) {
  return smartRequest(
    () => http.patch<StorageLocation>(`/storage-locations/${id}/status`, { status }),
    { showError: true, showSuccess: true, successMessage: "状态已更新" }
  )
}

export function deleteStorageLocation(id: number) {
  return smartRequest(
    () => http.delete<null>(`/storage-locations/${id}`),
    { showError: true, showSuccess: true, successMessage: "删除成功" }
  )
}

export function batchCreateStorageLocations(data: BatchCreateLocationForm) {
  return smartRequest(
    () => http.post("/storage-locations/batch", data),
    { showError: true, showSuccess: true, successMessage: "批量创建成功" }
  )
}


