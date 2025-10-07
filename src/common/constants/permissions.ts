/**
 * 权限常量清单（与后端约定的权限码/角色码一致）
 * 说明：当前项目的指令 v-permission 会校验用户 store 中的 roles 数组。
 * 因此此处的常量既可作为“权限码”也可作为“角色码”使用。
 */
export const PERMISSIONS = {
  // 仪表盘
  DASHBOARD_VIEW: "dashboard:view",

  // 基础数据
  BASIC_WAREHOUSE_LIST: "basic:warehouse:list",
  BASIC_WAREHOUSE_ADD: "basic:warehouse:add",
  BASIC_WAREHOUSE_EDIT: "basic:warehouse:edit",
  BASIC_WAREHOUSE_DELETE: "basic:warehouse:delete",
  BASIC_WAREHOUSE_ENABLE: "basic:warehouse:enable",

  BASIC_ZONE_LIST: "basic:zone:list",
  BASIC_ZONE_ADD: "basic:zone:add",
  BASIC_ZONE_EDIT: "basic:zone:edit",
  BASIC_ZONE_DELETE: "basic:zone:delete",

  BASIC_LOCATION_LIST: "basic:location:list",
  BASIC_LOCATION_ADD: "basic:location:add",
  BASIC_LOCATION_EDIT: "basic:location:edit",
  BASIC_LOCATION_DELETE: "basic:location:delete",
  BASIC_LOCATION_BATCH: "basic:location:batch",

  BASIC_SKU_LIST: "basic:sku:list",
  BASIC_SKU_ADD: "basic:sku:add",
  BASIC_SKU_EDIT: "basic:sku:edit",
  BASIC_SKU_DELETE: "basic:sku:delete",

  BASIC_SUPPLIER_LIST: "basic:supplier:list",
  BASIC_SUPPLIER_ADD: "basic:supplier:add",
  BASIC_SUPPLIER_EDIT: "basic:supplier:edit",
  BASIC_SUPPLIER_DELETE: "basic:supplier:delete",

  BASIC_CUSTOMER_LIST: "basic:customer:list",
  BASIC_CUSTOMER_ADD: "basic:customer:add",
  BASIC_CUSTOMER_EDIT: "basic:customer:edit",
  BASIC_CUSTOMER_DELETE: "basic:customer:delete",

  // 入库
  INBOUND_APPOINTMENT_LIST: "inbound:appointment:list",
  INBOUND_APPOINTMENT_ADD: "inbound:appointment:add",
  INBOUND_APPOINTMENT_APPROVE: "inbound:appointment:approve",
  INBOUND_APPOINTMENT_CANCEL: "inbound:appointment:cancel",

  INBOUND_ORDER_LIST: "inbound:order:list",
  INBOUND_ORDER_ADD: "inbound:order:add",
  INBOUND_ORDER_RECEIVE: "inbound:order:receive",
  INBOUND_ORDER_APPROVE: "inbound:order:approve",
  INBOUND_ORDER_CANCEL: "inbound:order:cancel",

  INBOUND_QC_LIST: "inbound:qc:list",
  INBOUND_QC_ADD: "inbound:qc:add",
  INBOUND_QC_SUBMIT: "inbound:qc:submit",

  INBOUND_PUTAWAY_LIST: "inbound:putaway:list",
  INBOUND_PUTAWAY_GENERATE: "inbound:putaway:generate",
  INBOUND_PUTAWAY_START: "inbound:putaway:start",
  INBOUND_PUTAWAY_COMPLETE: "inbound:putaway:complete",

  // 库存
  INVENTORY_QUERY_LIST: "inventory:query:list",
  INVENTORY_QUERY_SUMMARY: "inventory:query:summary",
  INVENTORY_QUERY_ALERTS: "inventory:query:alerts",

  INVENTORY_ADJUST_LIST: "inventory:adjust:list",
  INVENTORY_ADJUST_ADD: "inventory:adjust:add",
  INVENTORY_ADJUST_APPROVE: "inventory:adjust:approve",
  INVENTORY_ADJUST_EXECUTE: "inventory:adjust:execute",

  INVENTORY_TRANSFER_LIST: "inventory:transfer:list",
  INVENTORY_TRANSFER_ADD: "inventory:transfer:add",
  INVENTORY_TRANSFER_START: "inventory:transfer:start",
  INVENTORY_TRANSFER_COMPLETE: "inventory:transfer:complete",

  INVENTORY_COUNT_LIST: "inventory:count:list",
  INVENTORY_COUNT_ADD: "inventory:count:add",
  INVENTORY_COUNT_START: "inventory:count:start",
  INVENTORY_COUNT_SUBMIT: "inventory:count:submit",
  INVENTORY_COUNT_COMPLETE: "inventory:count:complete",

  // 出库
  OUTBOUND_ORDER_LIST: "outbound:order:list",
  OUTBOUND_ORDER_ADD: "outbound:order:add",
  OUTBOUND_ORDER_ALLOCATE: "outbound:order:allocate",
  OUTBOUND_ORDER_CANCEL: "outbound:order:cancel",

  OUTBOUND_WAVE_LIST: "outbound:wave:list",
  OUTBOUND_WAVE_ADD: "outbound:wave:add",
  OUTBOUND_WAVE_AUTO: "outbound:wave:auto",
  OUTBOUND_WAVE_START: "outbound:wave:start",

  OUTBOUND_PICKING_LIST: "outbound:picking:list",
  OUTBOUND_PICKING_GENERATE: "outbound:picking:generate",
  OUTBOUND_PICKING_START: "outbound:picking:start",
  OUTBOUND_PICKING_COMPLETE: "outbound:picking:complete",

  OUTBOUND_REVIEW_LIST: "outbound:review:list",
  OUTBOUND_REVIEW_GENERATE: "outbound:review:generate",
  OUTBOUND_REVIEW_SUBMIT: "outbound:review:submit",

  OUTBOUND_PACK_GENERATE: "outbound:pack:generate",
  OUTBOUND_PACK_COMPLETE: "outbound:pack:complete",

  OUTBOUND_SHIPPING_LIST: "outbound:shipping:list",
  OUTBOUND_SHIPPING_ADD: "outbound:shipping:add",
  OUTBOUND_SHIPPING_PRINT: "outbound:shipping:print",
  OUTBOUND_SHIPPING_SHIP: "outbound:shipping:ship",
  OUTBOUND_SHIPPING_UPDATE: "outbound:shipping:update",

  // 报表/看板
  REPORT_INVENTORY_DETAIL: "report:inventory:detail",
  REPORT_INVENTORY_SUMMARY: "report:inventory:summary",
  REPORT_INVENTORY_AGE: "report:inventory:age",
  REPORT_INVENTORY_ALERTS: "report:inventory:alerts",

  REPORT_OPS_INBOUND: "report:ops:inbound",
  REPORT_OPS_OUTBOUND: "report:ops:outbound",
  REPORT_OPS_PERFORMANCE: "report:ops:performance",
  REPORT_OPS_ERROR: "report:ops:error",

  DASHBOARD_DATA_CONFIG: "dashboard:data:config",
  DASHBOARD_DATA_DATA: "dashboard:data:data",
  DASHBOARD_DATA_REALTIME: "dashboard:data:realtime",
  DASHBOARD_DATA_TRENDS: "dashboard:data:trends",

  REPORT_CUSTOM_LIST: "report:custom:list",
  REPORT_CUSTOM_ADD: "report:custom:add",
  REPORT_CUSTOM_EXECUTE: "report:custom:execute",
  REPORT_CUSTOM_DOWNLOAD: "report:custom:download",

  REPORT_EXPORT_CREATE: "report:export:create",
  REPORT_EXPORT_STATUS: "report:export:status",
  REPORT_EXPORT_DOWNLOAD: "report:export:download",

  // 系统管理（建议）
  SYSTEM_USER_LIST: "system:user:list",
  SYSTEM_USER_ADD: "system:user:add",
  SYSTEM_USER_EDIT: "system:user:edit",
  SYSTEM_USER_DELETE: "system:user:delete",
  SYSTEM_USER_ASSIGN_ROLE: "system:user:assignRole",

  SYSTEM_ROLE_LIST: "system:role:list",
  SYSTEM_ROLE_ADD: "system:role:add",
  SYSTEM_ROLE_EDIT: "system:role:edit",
  SYSTEM_ROLE_DELETE: "system:role:delete",
  SYSTEM_ROLE_ASSIGN_PERM: "system:role:assignPerm",

  SYSTEM_MENU_LIST: "system:menu:list",
  SYSTEM_MENU_ADD: "system:menu:add",
  SYSTEM_MENU_EDIT: "system:menu:edit",
  SYSTEM_MENU_DELETE: "system:menu:delete",

  SYSTEM_SETTING_VIEW: "system:setting:view",
  SYSTEM_SETTING_EDIT: "system:setting:edit",

  SYSTEM_LOG_LIST: "system:log:list",
  SYSTEM_LOG_DETAIL: "system:log:detail",
  SYSTEM_LOG_EXPORT: "system:log:export",

  SYSTEM_APM_METRICS: "system:apm:metrics",
  SYSTEM_APM_ALERTS: "system:apm:alerts"
} as const

export type PermissionCode = typeof PERMISSIONS[keyof typeof PERMISSIONS]


