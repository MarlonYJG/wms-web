<script lang="ts" setup>
import type { DashboardStats, InventoryAlert } from "@/common/apis/dashboard/type"
import {
  ArrowDown,
  ArrowUp,
  Box,
  Calendar,
  Coin,
  Goods,
  OfficeBuilding,
  TrendCharts,
  Warning
} from "@element-plus/icons-vue"
import { ElCard, ElEmpty, ElProgress, ElTable, ElTableColumn, ElTag } from "element-plus"
import { computed, onMounted, ref } from "vue"
import { getDashboardStats, getInventoryAlerts } from "@/common/apis/dashboard"
import InventoryTrend from "./components/InventoryTrend.vue"

// 响应式数据
const dashboardStats = ref<DashboardStats | null>(null)
const inventoryAlerts = ref<InventoryAlert[]>([])
const loading = ref(false)

// 获取仪表板数据
async function fetchDashboardData() {
  loading.value = true
  try {
    const [stats, alerts] = await Promise.all([
      getDashboardStats(),
      getInventoryAlerts()
    ])
    dashboardStats.value = stats
    inventoryAlerts.value = alerts
  } catch (error) {
    console.error("获取仪表板数据失败:", error)
  } finally {
    loading.value = false
  }
}

// 计算今日完成率
const inboundCompletionRate = computed(() => {
  if (!dashboardStats.value) return 0
  const total = dashboardStats.value.todayInbound + dashboardStats.value.pendingInbound
  return total > 0 ? Math.round((dashboardStats.value.todayInbound / total) * 100) : 0
})

const outboundCompletionRate = computed(() => {
  if (!dashboardStats.value) return 0
  const total = dashboardStats.value.todayOutbound + dashboardStats.value.pendingOutbound
  return total > 0 ? Math.round((dashboardStats.value.todayOutbound / total) * 100) : 0
})

// 获取预警类型标签
function getAlertTypeTag(type: string) {
  const typeMap = {
    low_stock: { type: "warning", text: "库存不足", icon: Warning },
    expiring: { type: "danger", text: "即将过期", icon: Warning },
    expired: { type: "danger", text: "已过期", icon: Warning }
  }
  return typeMap[type as keyof typeof typeMap] || { type: "info", text: "未知", icon: Warning }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<template>
  <div class="dashboard-container">
    <!-- 核心统计卡片 -->
    <ElCard class="stats-overview-card" shadow="never" v-loading="loading">
      <div class="stats-overview">
        <div class="stat-item">
          <div class="stat-icon-wrapper warehouse">
            <el-icon class="stat-icon">
              <OfficeBuilding />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">
              {{ dashboardStats?.totalWarehouses || 0 }}
            </div>
            <div class="stat-label">
              仓库总数
            </div>
            <div class="stat-unit">
              个
            </div>
          </div>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <div class="stat-icon-wrapper goods">
            <el-icon class="stat-icon">
              <Goods />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">
              {{ dashboardStats?.totalProducts || 0 }}
            </div>
            <div class="stat-label">
              商品总数
            </div>
            <div class="stat-unit">
              种
            </div>
          </div>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <div class="stat-icon-wrapper inventory">
            <el-icon class="stat-icon">
              <Box />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">
              {{ dashboardStats?.totalInventory || 0 }}
            </div>
            <div class="stat-label">
              库存总量
            </div>
            <div class="stat-unit">
              件
            </div>
          </div>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <div class="stat-icon-wrapper value">
            <el-icon class="stat-icon">
              <Coin />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">
              ¥{{ (dashboardStats?.totalValue || 0).toLocaleString() }}
            </div>
            <div class="stat-label">
              库存总价值
            </div>
            <div class="stat-unit">
              元
            </div>
          </div>
        </div>
      </div>
    </ElCard>

    <!-- 作业概览与趋势 -->
    <ElCard class="operations-trend-card" shadow="never" v-loading="loading">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon class="header-icon operations">
              <TrendCharts />
            </el-icon>
            <span class="header-title">作业概览与趋势</span>
          </div>
          <div class="header-actions">
            <el-icon class="action-icon">
              <Calendar />
            </el-icon>
          </div>
        </div>
      </template>

      <div class="operations-trend-content">
        <!-- 今日作业统计 -->
        <div class="operations-overview">
          <div class="operation-item inbound">
            <div class="operation-header">
              <div class="operation-title">
                <el-icon class="operation-icon">
                  <ArrowDown />
                </el-icon>
                <span>今日入库</span>
              </div>
              <div class="operation-badge success">
                {{ inboundCompletionRate }}%
              </div>
            </div>
            <div class="operation-stats">
              <div class="stat-item">
                <div class="stat-number">
                  {{ dashboardStats?.todayInbound || 0 }}
                </div>
                <div class="stat-text">
                  已完成
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-number pending">
                  {{ dashboardStats?.pendingInbound || 0 }}
                </div>
                <div class="stat-text">
                  待处理
                </div>
              </div>
            </div>
            <div class="progress-section">
              <ElProgress
                :percentage="inboundCompletionRate"
                :stroke-width="6"
                :show-text="false"
                color="#10b981"
              />
            </div>
          </div>

          <div class="operation-item outbound">
            <div class="operation-header">
              <div class="operation-title">
                <el-icon class="operation-icon">
                  <ArrowUp />
                </el-icon>
                <span>今日出库</span>
              </div>
              <div class="operation-badge primary">
                {{ outboundCompletionRate }}%
              </div>
            </div>
            <div class="operation-stats">
              <div class="stat-item">
                <div class="stat-number">
                  {{ dashboardStats?.todayOutbound || 0 }}
                </div>
                <div class="stat-text">
                  已完成
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-number pending">
                  {{ dashboardStats?.pendingOutbound || 0 }}
                </div>
                <div class="stat-text">
                  待处理
                </div>
              </div>
            </div>
            <div class="progress-section">
              <ElProgress
                :percentage="outboundCompletionRate"
                :stroke-width="6"
                :show-text="false"
                color="#3b82f6"
              />
            </div>
          </div>
        </div>

        <!-- 趋势图表 -->
        <div class="trend-section">
          <div class="trend-header">
            <span class="trend-title">近7日出入库趋势</span>
          </div>
          <InventoryTrend
            :dates="['12-01', '12-02', '12-03', '12-04', '12-05', '12-06', '12-07']"
            :inbound="[12, 8, 15, 10, 18, 14, 16]"
            :outbound="[8, 12, 10, 15, 12, 18, 14]"
          />
        </div>
      </div>
    </ElCard>

    <!-- 库存预警 -->
    <ElCard class="alert-card" shadow="never" v-loading="loading">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon class="header-icon alert">
              <Warning />
            </el-icon>
            <span class="header-title">库存预警</span>
          </div>
          <div class="header-badges">
            <ElTag v-if="dashboardStats?.lowStockAlerts" type="danger" size="small">
              库存不足: {{ dashboardStats.lowStockAlerts }}
            </ElTag>
            <ElTag v-if="dashboardStats?.expiringAlerts" type="warning" size="small">
              即将过期: {{ dashboardStats.expiringAlerts }}
            </ElTag>
          </div>
        </div>
      </template>
      <div class="alert-content">
        <ElTable :data="inventoryAlerts" style="width: 100%" max-height="240" :header-cell-style="{ background: '#f8fafc' }">
          <ElTableColumn prop="typeName" label="类型" width="100">
            <template #default="{ row }">
              <div class="alert-type">
                <el-icon class="type-icon">
                  <component :is="getAlertTypeTag(row.type).icon" />
                </el-icon>
                <ElTag :type="(getAlertTypeTag(row.type).type) as any" size="small">
                  {{ getAlertTypeTag(row.type).text }}
                </ElTag>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="productName" label="商品" show-overflow-tooltip />
          <ElTableColumn prop="warehouseName" label="仓库" width="100" />
          <ElTableColumn prop="currentQuantity" label="库存" width="80">
            <template #default="{ row }">
              <span class="quantity-text">{{ row.currentQuantity }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="状态" width="100">
            <template #default="{ row }">
              <span v-if="row.type !== 'low_stock'" class="expiry-text">
                {{ row.expiryDate || '-' }}
              </span>
              <span v-else class="stock-text">库存不足</span>
            </template>
          </ElTableColumn>
          <template #empty>
            <ElEmpty description="暂无库存预警" :image-size="80" />
          </template>
        </ElTable>
      </div>
    </ElCard>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-container {
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;

  // 统计概览卡片
  .stats-overview-card {
    margin-bottom: 16px;
    border-radius: 12px;
    border: none;
    background: #ffffff;
    box-shadow:
      0 2px 4px -1px rgba(0, 0, 0, 0.1),
      0 1px 2px -1px rgba(0, 0, 0, 0.06);

    .stats-overview {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 0;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        justify-content: center;

        .stat-icon-wrapper {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;

          &::before {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 10px;
            background: var(--icon-bg);
            opacity: 0.1;
          }

          .stat-icon {
            font-size: 18px;
            color: var(--icon-color);
            z-index: 1;
          }

          &.warehouse {
            --icon-bg: #3b82f6;
            --icon-color: #3b82f6;
          }

          &.goods {
            --icon-bg: #8b5cf6;
            --icon-color: #8b5cf6;
          }

          &.inventory {
            --icon-bg: #10b981;
            --icon-color: #10b981;
          }

          &.value {
            --icon-bg: #f59e0b;
            --icon-color: #f59e0b;
          }
        }

        .stat-info {
          text-align: left;

          .stat-value {
            font-size: 20px;
            font-weight: 700;
            color: #1e293b;
            line-height: 1;
            margin-bottom: 2px;
          }

          .stat-label {
            font-size: 12px;
            color: #64748b;
            font-weight: 500;
            margin-bottom: 1px;
          }

          .stat-unit {
            font-size: 10px;
            color: #94a3b8;
            font-weight: 400;
          }
        }
      }

      .stat-divider {
        width: 1px;
        height: 40px;
        background: #e2e8f0;
        margin: 0 20px;
      }
    }
  }

  // 统计卡片行（保留原有样式作为备用）
  .stats-row {
    margin-bottom: 16px;

    .stat-card {
      border-radius: 16px;
      border: none;
      background: #ffffff;
      box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;

      &:hover {
        transform: translateY(-4px);
        box-shadow:
          0 20px 25px -5px rgba(0, 0, 0, 0.1),
          0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }

      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, var(--gradient-start), var(--gradient-end));
      }

      .stat-content {
        display: flex;
        align-items: center;
        gap: 12px;

        .stat-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;

          &::before {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 12px;
            background: var(--icon-bg);
            opacity: 0.1;
          }

          .stat-icon {
            font-size: 20px;
            color: var(--icon-color);
            z-index: 1;
          }
        }

        .stat-info {
          flex: 1;

          .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: #1e293b;
            line-height: 1;
            margin-bottom: 2px;
          }

          .stat-label {
            font-size: 12px;
            color: #64748b;
            font-weight: 500;
            margin-bottom: 1px;
          }

          .stat-unit {
            font-size: 10px;
            color: #94a3b8;
            font-weight: 400;
          }
        }
      }

      // 仓库卡片
      &.stat-warehouse {
        --gradient-start: #3b82f6;
        --gradient-end: #1d4ed8;
        --icon-bg: #3b82f6;
        --icon-color: #3b82f6;
      }

      // 商品卡片
      &.stat-goods {
        --gradient-start: #8b5cf6;
        --gradient-end: #7c3aed;
        --icon-bg: #8b5cf6;
        --icon-color: #8b5cf6;
      }

      // 库存卡片
      &.stat-inventory {
        --gradient-start: #10b981;
        --gradient-end: #059669;
        --icon-bg: #10b981;
        --icon-color: #10b981;
      }

      // 价值卡片
      &.stat-value {
        --gradient-start: #f59e0b;
        --gradient-end: #d97706;
        --icon-bg: #f59e0b;
        --icon-color: #f59e0b;
      }
    }
  }

  // 作业概览与趋势面板
  .operations-trend-card {
    margin-bottom: 16px;
    border-radius: 12px;
    border: none;
    background: #ffffff;
    box-shadow:
      0 2px 4px -1px rgba(0, 0, 0, 0.1),
      0 1px 2px -1px rgba(0, 0, 0, 0.06);

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0;
      border-bottom: 1px solid #f1f5f9;

      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;

        .header-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;

          &.operations {
            background: linear-gradient(135deg, #fef3c7, #fde68a);
            color: #d97706;
          }
        }

        .header-title {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
        }
      }

      .header-actions {
        .action-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            background: #e2e8f0;
            color: #475569;
          }
        }
      }
    }

    .operations-trend-content {
      padding: 20px 0 0 0;

      .operations-overview {
        display: flex;
        gap: 24px;
        margin-bottom: 24px;

        .operation-item {
          flex: 1;
          padding: 16px;
          border-radius: 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;

          &.inbound {
            border-left: 3px solid #10b981;
          }

          &.outbound {
            border-left: 3px solid #3b82f6;
          }

          .operation-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;

            .operation-title {
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 14px;
              font-weight: 600;
              color: #1e293b;

              .operation-icon {
                font-size: 16px;
              }
            }

            .operation-badge {
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 600;

              &.success {
                background: linear-gradient(135deg, #dcfce7, #bbf7d0);
                color: #16a34a;
              }

              &.primary {
                background: linear-gradient(135deg, #dbeafe, #bfdbfe);
                color: #2563eb;
              }
            }
          }

          .operation-stats {
            display: flex;
            gap: 16px;
            margin-bottom: 12px;

            .stat-item {
              text-align: center;

              .stat-number {
                font-size: 18px;
                font-weight: 700;
                color: #1e293b;
                line-height: 1;
                margin-bottom: 2px;

                &.pending {
                  color: #f59e0b;
                }
              }

              .stat-text {
                font-size: 11px;
                color: #64748b;
                font-weight: 500;
              }
            }
          }

          .progress-section {
            .progress-label {
              font-size: 11px;
              color: #64748b;
              margin-bottom: 4px;
              font-weight: 500;
            }
          }
        }
      }

      .trend-section {
        .trend-header {
          margin-bottom: 16px;

          .trend-title {
            font-size: 14px;
            font-weight: 600;
            color: #1e293b;
          }
        }
      }
    }
  }

  // 库存预警卡片
  .alert-card {
    margin-bottom: 16px;
    border-radius: 12px;
    border: none;
    background: #ffffff;
    box-shadow:
      0 2px 4px -1px rgba(0, 0, 0, 0.1),
      0 1px 2px -1px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow:
        0 10px 15px -3px rgba(0, 0, 0, 0.1),
        0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0;
      border-bottom: 1px solid #f1f5f9;

      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;

        .header-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;

          &.alert {
            background: linear-gradient(135deg, #fecaca, #fca5a5);
            color: #dc2626;
          }
        }

        .header-title {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
        }
      }

      .header-badges {
        display: flex;
        gap: 8px;
      }
    }

    .alert-content {
      padding: 0;

      .alert-type {
        display: flex;
        align-items: center;
        gap: 8px;

        .type-icon {
          font-size: 16px;
        }
      }

      .quantity-text {
        font-weight: 600;
        color: #1e293b;
      }

      .expiry-text {
        font-size: 12px;
        color: #dc2626;
        font-weight: 500;
      }

      .stock-text {
        font-size: 12px;
        color: #f59e0b;
        font-weight: 500;
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .dashboard-container {
    .stats-overview-card {
      .stats-overview {
        .stat-item {
          .stat-info {
            .stat-value {
              font-size: 18px;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 12px;

    .stats-overview-card {
      .stats-overview {
        flex-direction: column;
        gap: 16px;
        padding: 16px 0;

        .stat-item {
          width: 100%;
          justify-content: flex-start;
          padding: 0 16px;

          .stat-icon-wrapper {
            width: 36px;
            height: 36px;

            .stat-icon {
              font-size: 16px;
            }
          }

          .stat-info {
            .stat-value {
              font-size: 16px;
            }

            .stat-label {
              font-size: 11px;
            }

            .stat-unit {
              font-size: 9px;
            }
          }
        }

        .stat-divider {
          display: none;
        }
      }
    }

    .operations-trend-card {
      .operations-trend-content {
        .operations-overview {
          flex-direction: column;
          gap: 16px;

          .operation-item {
            .operation-stats {
              gap: 12px;

              .stat-item {
                .stat-number {
                  font-size: 16px;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
