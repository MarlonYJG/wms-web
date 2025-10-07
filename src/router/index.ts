import type { RouteRecordRaw } from "vue-router"
import { createRouter } from "vue-router"
import { PERMISSIONS } from "@@/constants/permissions"
import { routerConfig } from "@/router/config"
import { registerNavigationGuard } from "@/router/guard"
import { flatMultiLevelRoutes } from "./helper"

const Layouts = () => import("@/layouts/index.vue")

/**
 * @name 常驻路由
 * @description 除了 redirect/403/404/login 等隐藏页面，其他页面建议设置唯一的 Name 属性
 */
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/redirect",
    component: Layouts,
    meta: {
      hidden: true
    },
    children: [
      {
        path: ":path(.*)",
        component: () => import("@/pages/redirect/index.vue")
      }
    ]
  },
  {
    path: "/403",
    component: () => import("@/pages/error/403.vue"),
    meta: {
      hidden: true
    }
  },
  {
    path: "/404",
    component: () => import("@/pages/error/404.vue"),
    meta: {
      hidden: true
    },
    alias: "/:pathMatch(.*)*"
  },
  {
    path: "/login",
    component: () => import("@/pages/login/index.vue"),
    meta: {
      hidden: true
    }
  },
  {
    path: "/",
    component: Layouts,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        component: () => import("@/pages/dashboard/index.vue"),
        name: "Dashboard",
        meta: {
          title: "数据看板",
          svgIcon: "dashboard",
          affix: true,
          roles: [PERMISSIONS.DASHBOARD_VIEW]
        }
      }
    ]
  },
  {
    path: "/basic",
    component: Layouts,
    redirect: "/basic/warehouses",
    name: "Basic",
    meta: {
      title: "基础数据",
      elIcon: "Collection",
      roles: [PERMISSIONS.BASIC_WAREHOUSE_LIST]
    },
    children: [
      {
        path: "warehouses",
        component: () => import("@/pages/warehouse/index.vue"),
        name: "BasicWarehouses",
        meta: {
          title: "仓库管理",
          roles: [PERMISSIONS.BASIC_WAREHOUSE_LIST]
        }
      },
      {
        path: "zones",
        component: () => import("@/pages/warehouse/zones.vue"),
        name: "BasicZones",
        meta: {
          title: "库区管理",
          roles: [PERMISSIONS.BASIC_ZONE_LIST]
        }
      },
      {
        path: "locations",
        component: () => import("@/pages/warehouse/locations.vue"),
        name: "BasicLocations",
        meta: {
          title: "库位管理",
          roles: [PERMISSIONS.BASIC_LOCATION_LIST]
        }
      },
      {
        path: "skus",
        component: () => import("@/pages/product/index.vue"),
        name: "BasicSkus",
        meta: {
          title: "商品管理",
          roles: [PERMISSIONS.BASIC_SKU_LIST]
        }
      },
      {
        path: "suppliers",
        component: () => import("@/pages/product/suppliers.vue"),
        name: "BasicSuppliers",
        meta: {
          title: "供应商管理",
          roles: [PERMISSIONS.BASIC_SUPPLIER_LIST]
        }
      },
      {
        path: "customers",
        component: () => import("@/pages/product/customers.vue"),
        name: "BasicCustomers",
        meta: {
          title: "客户管理",
          roles: [PERMISSIONS.BASIC_CUSTOMER_LIST]
        }
      }
    ]
  },
  
  {
    path: "/inbound",
    component: Layouts,
    redirect: "/inbound/appointments",
    name: "Inbound",
    meta: {
      title: "入库管理",
      elIcon: "Upload",
      roles: [PERMISSIONS.INBOUND_ORDER_LIST]
    },
    children: [
      {
        path: "appointments",
        component: () => import("@/pages/inbound/appointments.vue"),
        name: "InboundAppointments",
        meta: {
          title: "预约入库",
          roles: [PERMISSIONS.INBOUND_APPOINTMENT_LIST]
        }
      },
      {
        path: "orders",
        component: () => import("@/pages/inbound/orders.vue"),
        name: "InboundOrders",
        meta: {
          title: "收货管理",
          roles: [PERMISSIONS.INBOUND_ORDER_LIST]
        }
      },
      {
        path: "qc",
        component: () => import("@/pages/inbound/qc.vue"),
        name: "InboundQC",
        meta: {
          title: "质检管理",
          roles: [PERMISSIONS.INBOUND_QC_LIST]
        }
      },
      {
        path: "putaway",
        component: () => import("@/pages/inbound/putaway.vue"),
        name: "InboundPutaway",
        meta: {
          title: "上架管理",
          roles: [PERMISSIONS.INBOUND_PUTAWAY_LIST]
        }
      }
    ]
  },
  {
    path: "/inventory",
    component: Layouts,
    redirect: "/inventory/query",
    name: "Inventory",
    meta: {
      title: "库存管理",
      elIcon: "Grid",
      roles: [PERMISSIONS.INVENTORY_QUERY_LIST]
    },
    children: [
      {
        path: "query",
        component: () => import("@/pages/inventory/index.vue"),
        name: "InventoryQuery",
        meta: {
          title: "库存查询",
          roles: [PERMISSIONS.INVENTORY_QUERY_LIST]
        }
      },
      {
        path: "adjustments",
        component: () => import("@/pages/inventory/adjustments.vue"),
        name: "InventoryAdjustments",
        meta: {
          title: "库存调整",
          roles: [PERMISSIONS.INVENTORY_ADJUST_LIST]
        }
      },
      {
        path: "transfers",
        component: () => import("@/pages/inventory/transfers.vue"),
        name: "InventoryTransfers",
        meta: {
          title: "库存转移",
          roles: [PERMISSIONS.INVENTORY_TRANSFER_LIST]
        }
      },
      {
        path: "counts",
        component: () => import("@/pages/inventory/counts.vue"),
        name: "InventoryCounts",
        meta: {
          title: "盘点管理",
          roles: [PERMISSIONS.INVENTORY_COUNT_LIST]
        }
      }
    ]
  },
  
  {
    path: "/outbound",
    component: Layouts,
    redirect: "/outbound/index",
    name: "Outbound",
    meta: {
      title: "出库管理",
      elIcon: "Download",
      roles: [PERMISSIONS.OUTBOUND_ORDER_LIST]
    },
    children: [
      {
        path: "index",
        component: () => import("@/pages/outbound/index.vue"),
        name: "OutboundIndex",
        meta: {
          title: "出库管理",
          roles: [PERMISSIONS.OUTBOUND_ORDER_LIST]
        }
      },
      {
        path: "orders",
        component: () => import("@/pages/outbound/orders.vue"),
        name: "OutboundOrders",
        meta: {
          title: "订单管理",
          roles: [PERMISSIONS.OUTBOUND_ORDER_LIST]
        }
      },
      {
        path: "waves",
        component: () => import("@/pages/outbound/waves.vue"),
        name: "PickingWaves",
        meta: {
          title: "波次管理",
          roles: [PERMISSIONS.OUTBOUND_WAVE_LIST]
        }
      },
      {
        path: "picking",
        component: () => import("@/pages/outbound/picking.vue"),
        name: "PickingTasks",
        meta: {
          title: "拣货管理",
          roles: [PERMISSIONS.OUTBOUND_PICKING_LIST]
        }
      },
      {
        path: "review",
        component: () => import("@/pages/outbound/review.vue"),
        name: "ReviewTasks",
        meta: {
          title: "复核管理",
          roles: [PERMISSIONS.OUTBOUND_REVIEW_LIST]
        }
      },
      {
        path: "pack",
        component: () => import("@/pages/outbound/pack.vue"),
        name: "PackingTasks",
        meta: {
          title: "打包管理",
          roles: [PERMISSIONS.OUTBOUND_PACK_GENERATE]
        }
      },
      {
        path: "shipping",
        component: () => import("@/pages/outbound/shipping.vue"),
        name: "ShippingTasks",
        meta: {
          title: "发货管理",
          roles: [PERMISSIONS.OUTBOUND_SHIPPING_LIST]
        }
      }
    ]
  }
  ,
  {
    path: "/reports",
    component: Layouts,
    redirect: "/reports/dashboard",
    name: "Reports",
    meta: {
      title: "报表与分析",
      elIcon: "DataAnalysis",
      roles: [PERMISSIONS.DASHBOARD_DATA_DATA]
    },
    children: [
      {
        path: "dashboard",
        component: () => import("@/pages/reports/dashboard.vue"),
        name: "ReportsDashboard",
        meta: {
          title: "看板",
          roles: [PERMISSIONS.DASHBOARD_DATA_DATA]
        }
      },
      {
        path: "inventory",
        component: () => import("@/pages/reports/inventory.vue"),
        name: "ReportsInventory",
        meta: {
          title: "库存报表",
          roles: [PERMISSIONS.REPORT_INVENTORY_DETAIL]
        }
      },
      {
        path: "operations",
        component: () => import("@/pages/reports/operations.vue"),
        name: "ReportsOperations",
        meta: {
          title: "作业报表",
          roles: [PERMISSIONS.REPORT_OPS_INBOUND]
        }
      },
      {
        path: "custom",
        component: () => import("@/pages/reports/custom.vue"),
        name: "ReportsCustom",
        meta: {
          title: "自定义报表",
          roles: [PERMISSIONS.REPORT_CUSTOM_LIST]
        }
      },
      {
        path: "export",
        component: () => import("@/pages/reports/export.vue"),
        name: "ReportsExport",
        meta: {
          title: "数据导出",
          roles: [PERMISSIONS.REPORT_EXPORT_CREATE]
        }
      }
    ]
  },
  {
    path: "/system",
    component: Layouts,
    redirect: "/system/users",
    name: "System",
    meta: {
      title: "系统管理",
      elIcon: "Setting",
      roles: [PERMISSIONS.SYSTEM_USER_LIST]
    },
    children: [
      {
        path: "users",
        component: () => import("@/pages/system/users.vue"),
        name: "SystemUsers",
        meta: {
          title: "用户管理",
          roles: [PERMISSIONS.SYSTEM_USER_LIST]
        }
      },
      {
        path: "roles",
        component: () => import("@/pages/system/roles.vue"),
        name: "SystemRoles",
        meta: {
          title: "角色权限",
          roles: [PERMISSIONS.SYSTEM_ROLE_LIST]
        }
      },
      {
        path: "menus",
        component: () => import("@/pages/system/menus.vue"),
        name: "SystemMenus",
        meta: {
          title: "菜单管理",
          roles: [PERMISSIONS.SYSTEM_MENU_LIST]
        }
      },
      {
        path: "settings",
        component: () => import("@/pages/system/settings.vue"),
        name: "SystemSettings",
        meta: {
          title: "系统配置",
          roles: [PERMISSIONS.SYSTEM_SETTING_VIEW]
        }
      },
      {
        path: "op-logs",
        component: () => import("@/pages/system/op-logs.vue"),
        name: "SystemOpLogs",
        meta: {
          title: "操作日志",
          roles: [PERMISSIONS.SYSTEM_LOG_LIST]
        }
      },
      {
        path: "api-monitor",
        component: () => import("@/pages/system/api-monitor.vue"),
        name: "SystemApiMonitor",
        meta: {
          title: "接口监控",
          roles: [PERMISSIONS.SYSTEM_APM_METRICS]
        }
      }
    ]
  }

]

/**
 * @name 动态路由
 * @description 用来放置有权限 (Roles 属性) 的路由
 * @description 必须带有唯一的 Name 属性
 */
export const dynamicRoutes: RouteRecordRaw[] = []

/** 路由实例 */
export const router = createRouter({
  history: routerConfig.history,
  routes: routerConfig.thirdLevelRouteCache ? flatMultiLevelRoutes(constantRoutes) : constantRoutes
})

/** 重置路由 */
export function resetRouter() {
  try {
    // 注意：所有动态路由路由必须带有 Name 属性，否则可能会不能完全重置干净
    router.getRoutes().forEach((route) => {
      const { name, meta } = route
      if (name && meta.roles?.length) {
        router.hasRoute(name) && router.removeRoute(name)
      }
    })
  } catch {
    // 强制刷新浏览器也行，只是交互体验不是很好
    location.reload()
  }
}

// 注册路由导航守卫
registerNavigationGuard(router)
