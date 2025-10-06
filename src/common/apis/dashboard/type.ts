/** 仪表板统计数据 */
export interface DashboardStats {
  totalWarehouses: number
  totalProducts: number
  totalInventory: number
  totalValue: number
  todayInbound: number
  todayOutbound: number
  pendingInbound: number
  pendingOutbound: number
  lowStockAlerts: number
  expiringAlerts: number
}

/** 库存预警信息 */
export interface InventoryAlert {
  id: number
  type: 'low_stock' | 'expiring' | 'expired'
  typeName: string
  productSkuId: number
  productName: string
  skuCode: string
  warehouseId: number
  warehouseName: string
  currentQuantity: number
  thresholdQuantity?: number
  expiryDate?: string
  daysToExpiry?: number
  createdTime: string
}

/** 最近活动信息 */
export interface RecentActivity {
  id: number
  type: 'inbound' | 'outbound' | 'inventory' | 'system'
  typeName: string
  title: string
  description: string
  operator?: string
  createdTime: string
}

/** 仓库概览信息 */
export interface WarehouseOverview {
  warehouseId: number
  warehouseName: string
  totalLocations: number
  occupiedLocations: number
  totalProducts: number
  totalQuantity: number
  totalValue: number
}

/** 今日作业统计 */
export interface TodayOperations {
  inboundOrders: number
  outboundOrders: number
  putawayTasks: number
  pickingTasks: number
  completedInbound: number
  completedOutbound: number
  completedPutaway: number
  completedPicking: number
}
