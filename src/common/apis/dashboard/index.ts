import type { DashboardStats, InventoryAlert, RecentActivity } from "./type"
import { http } from "@/http/axios"

/** 获取仪表板统计数据 */
export function getDashboardStats() {
  return http.get<DashboardStats>("/dashboard/stats")
}

/** 获取库存预警信息 */
export function getInventoryAlerts() {
  return http.get<InventoryAlert[]>("/dashboard/inventory-alerts")
}

/** 获取最近活动 */
export function getRecentActivities() {
  return http.get<RecentActivity[]>("/dashboard/recent-activities")
}

/** 获取仓库库存概览 */
export function getWarehouseOverview() {
  return http.get("/dashboard/warehouse-overview")
}

/** 获取今日作业统计 */
export function getTodayOperations() {
  return http.get("/dashboard/today-operations")
}
