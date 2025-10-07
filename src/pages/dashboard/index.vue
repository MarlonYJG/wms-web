<script lang="ts" setup>
import type { DashboardStats, InventoryAlert, RecentActivity } from "@/common/apis/dashboard/type"
import { Coin, Goods, OfficeBuilding, TrendCharts } from "@element-plus/icons-vue"
import { ElCard, ElCol, ElEmpty, ElRow, ElStatistic, ElTable, ElTableColumn, ElTag } from "element-plus"
import { onMounted, ref } from "vue"
import { getDashboardStats, getInventoryAlerts, getRecentActivities } from "@/common/apis/dashboard"
import InventoryTrend from "./components/InventoryTrend.vue"

// 响应式数据
const dashboardStats = ref<DashboardStats | null>(null)
const inventoryAlerts = ref<InventoryAlert[]>([])
const recentActivities = ref<RecentActivity[]>([])
const loading = ref(false)

// 获取仪表板数据
async function fetchDashboardData() {
  loading.value = true
  try {
    const [stats, alerts, activities] = await Promise.all([
      getDashboardStats(),
      getInventoryAlerts(),
      getRecentActivities()
    ])
    dashboardStats.value = stats
    inventoryAlerts.value = alerts
    recentActivities.value = activities
  } catch (error) {
    console.error("获取仪表板数据失败:", error)
  } finally {
    loading.value = false
  }
}

// 获取预警类型标签
function getAlertTypeTag(type: string) {
  const typeMap = {
    low_stock: { type: "warning", text: "库存不足" },
    expiring: { type: "danger", text: "即将过期" },
    expired: { type: "danger", text: "已过期" }
  }
  return typeMap[type as keyof typeof typeMap] || { type: "info", text: "未知" }
}

// 获取活动类型标签
function getActivityTypeTag(type: string) {
  const typeMap = {
    inbound: { type: "success", text: "入库" },
    outbound: { type: "primary", text: "出库" },
    inventory: { type: "warning", text: "库存" },
    system: { type: "info", text: "系统" }
  }
  return typeMap[type as keyof typeof typeMap] || { type: "info", text: "未知" }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<template>
  <div class="dashboard-container">
    <!-- 统计卡片 -->
    <ElRow :gutter="20" class="stats-row">
      <ElCol :span="6">
        <ElCard class="stat-card stat-warehouse" shadow="hover" :body-style="{ padding: '18px' }" v-loading="loading">
          <div class="stat-header">
            <el-icon class="icon">
              <OfficeBuilding />
            </el-icon>
            <span class="label">仓库总数</span>
          </div>
          <ElStatistic :value="dashboardStats?.totalWarehouses || 0" suffix="个" />
        </ElCard>
      </ElCol>
      <ElCol :span="6">
        <ElCard class="stat-card stat-goods" shadow="hover" :body-style="{ padding: '18px' }" v-loading="loading">
          <div class="stat-header">
            <el-icon class="icon">
              <Goods />
            </el-icon>
            <span class="label">商品总数</span>
          </div>
          <ElStatistic :value="dashboardStats?.totalProducts || 0" suffix="种" />
        </ElCard>
      </ElCol>
      <ElCol :span="6">
        <ElCard class="stat-card stat-trend" shadow="hover" :body-style="{ padding: '18px' }" v-loading="loading">
          <div class="stat-header">
            <el-icon class="icon">
              <TrendCharts />
            </el-icon>
            <span class="label">库存总量</span>
          </div>
          <ElStatistic :value="dashboardStats?.totalInventory || 0" suffix="件" />
        </ElCard>
      </ElCol>
      <ElCol :span="6">
        <ElCard class="stat-card stat-amount" shadow="hover" :body-style="{ padding: '18px' }" v-loading="loading">
          <div class="stat-header">
            <el-icon class="icon">
              <Coin />
            </el-icon>
            <span class="label">库存总价值</span>
          </div>
          <ElStatistic :value="dashboardStats?.totalValue || 0" prefix="¥" :precision="2" />
        </ElCard>
      </ElCol>
    </ElRow>

    <!-- 今日作业统计 + 趋势图表 -->
    <ElRow :gutter="20" class="operations-row">
      <ElCol :span="12">
        <ElCard title="今日入库" shadow="hover" v-loading="loading">
          <ElStatistic title="入库单数" :value="dashboardStats?.todayInbound || 0" suffix="单" />
          <ElStatistic title="待处理" :value="dashboardStats?.pendingInbound || 0" suffix="单" class="mt-4" />
        </ElCard>
      </ElCol>
      <ElCol :span="12">
        <ElCard title="今日出库" shadow="hover" v-loading="loading">
          <ElStatistic title="出库单数" :value="dashboardStats?.todayOutbound || 0" suffix="单" />
          <ElStatistic title="待处理" :value="dashboardStats?.pendingOutbound || 0" suffix="单" class="mt-4" />
        </ElCard>
      </ElCol>
    </ElRow>

    <ElRow :gutter="20" class="mb-4">
      <ElCol :span="24">
        <ElCard title="近7日出入库趋势" shadow="hover" v-loading="loading">
          <InventoryTrend
            :dates="recentActivities.map(a => a.createdTime).slice(-7).map(t => new Date(t).toLocaleDateString())"
            :inbound="recentActivities.filter(a => a.type === 'inbound').slice(-7).map(() => 1)"
            :outbound="recentActivities.filter(a => a.type === 'outbound').slice(-7).map(() => 1)"
          />
        </ElCard>
      </ElCol>
    </ElRow>

    <!-- 预警信息和最近活动 -->
    <ElRow :gutter="20" class="alerts-activities-row">
      <ElCol :span="12">
        <ElCard title="库存预警" shadow="hover" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>库存预警</span>
              <ElTag :type="(dashboardStats?.lowStockAlerts ? 'danger' : 'info') as any" v-if="dashboardStats?.lowStockAlerts">
                库存不足: {{ dashboardStats.lowStockAlerts }}
              </ElTag>
              <ElTag :type="('warning') as any" v-if="dashboardStats?.expiringAlerts">
                即将过期: {{ dashboardStats.expiringAlerts }}
              </ElTag>
            </div>
          </template>

          <ElTable :data="inventoryAlerts" style="width: 100%" max-height="300">
            <ElTableColumn prop="typeName" label="类型" width="80">
              <template #default="{ row }">
                <ElTag :type="(getAlertTypeTag(row.type).type) as any" size="small">
                  {{ getAlertTypeTag(row.type).text }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="productName" label="商品" show-overflow-tooltip />
            <ElTableColumn prop="warehouseName" label="仓库" width="100" />
            <ElTableColumn prop="currentQuantity" label="当前库存" width="80" />
            <ElTableColumn label="过期日期" width="100">
              <template #default="{ row }">
                <span v-if="row.type !== 'low_stock'">
                  {{ row.expiryDate || '-' }}
                </span>
                <span v-else>-</span>
              </template>
            </ElTableColumn>
            <template #empty>
              <ElEmpty description="暂无库存预警" />
            </template>
          </ElTable>
        </ElCard>
      </ElCol>

      <ElCol :span="12">
        <ElCard title="最近活动" shadow="hover" v-loading="loading">
          <ElTable :data="recentActivities" style="width: 100%" max-height="300">
            <ElTableColumn prop="typeName" label="类型" width="80">
              <template #default="{ row }">
                <ElTag :type="(getActivityTypeTag(row.type).type) as any" size="small">
                  {{ getActivityTypeTag(row.type).text }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="title" label="标题" show-overflow-tooltip />
            <ElTableColumn prop="operator" label="操作人" width="80" />
            <ElTableColumn prop="createdTime" label="时间" width="120">
              <template #default="{ row }">
                {{ new Date(row.createdTime).toLocaleString() }}
              </template>
            </ElTableColumn>
            <template #empty>
              <ElEmpty description="暂无活动记录" />
            </template>
          </ElTable>
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;

  .stats-row {
    margin-bottom: 20px;

    .stat-card {
      position: relative;
      overflow: hidden;
      color: var(--el-text-color-regular);

      .stat-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        .icon {
          font-size: 20px;
        }
        .label {
          font-weight: 600;
        }
      }
    }

    .stat-warehouse {
      background: linear-gradient(135deg, #e3f2fd 0%, #f1f8ff 100%);
    }
    .stat-goods {
      background: linear-gradient(135deg, #f3e5f5 0%, #faf0ff 100%);
    }
    .stat-trend {
      background: linear-gradient(135deg, #e8f5e9 0%, #f1fff3 100%);
    }
    .stat-amount {
      background: linear-gradient(135deg, #fff3e0 0%, #fff8e6 100%);
    }
  }

  .operations-row {
    margin-bottom: 20px;
  }

  .alerts-activities-row {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>
