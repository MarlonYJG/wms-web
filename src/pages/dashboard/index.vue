<script lang="ts" setup>
import { ref, onMounted } from "vue"
import { ElCard, ElRow, ElCol, ElStatistic, ElTable, ElTableColumn, ElTag, ElAlert } from "element-plus"
import { getDashboardStats, getInventoryAlerts, getRecentActivities } from "@/common/apis/dashboard"
import type { DashboardStats, InventoryAlert, RecentActivity } from "@/common/apis/dashboard/type"

// 响应式数据
const dashboardStats = ref<DashboardStats>()
const inventoryAlerts = ref<InventoryAlert[]>([])
const recentActivities = ref<RecentActivity[]>([])
const loading = ref(false)

// 获取仪表板数据
const fetchDashboardData = async () => {
  loading.value = true
  try {
    const [statsRes, alertsRes, activitiesRes] = await Promise.all([
      getDashboardStats(),
      getInventoryAlerts(),
      getRecentActivities()
    ])
    
    dashboardStats.value = statsRes.data
    inventoryAlerts.value = alertsRes.data
    recentActivities.value = activitiesRes.data
  } catch (error) {
    console.error("获取仪表板数据失败:", error)
  } finally {
    loading.value = false
  }
}

// 获取预警类型标签
const getAlertTypeTag = (type: string) => {
  const typeMap = {
    low_stock: { type: "warning", text: "库存不足" },
    expiring: { type: "danger", text: "即将过期" },
    expired: { type: "danger", text: "已过期" }
  }
  return typeMap[type as keyof typeof typeMap] || { type: "info", text: "未知" }
}

// 获取活动类型标签
const getActivityTypeTag = (type: string) => {
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
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <el-statistic
            title="仓库总数"
            :value="dashboardStats?.totalWarehouses || 0"
            suffix="个"
          />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <el-statistic
            title="商品总数"
            :value="dashboardStats?.totalProducts || 0"
            suffix="种"
          />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <el-statistic
            title="库存总量"
            :value="dashboardStats?.totalInventory || 0"
            suffix="件"
          />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <el-statistic
            title="库存总价值"
            :value="dashboardStats?.totalValue || 0"
            prefix="¥"
            :precision="2"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 今日作业统计 -->
    <el-row :gutter="20" class="operations-row">
      <el-col :span="12">
        <el-card title="今日入库">
          <el-statistic
            title="入库单数"
            :value="dashboardStats?.todayInbound || 0"
            suffix="单"
          />
          <el-statistic
            title="待处理"
            :value="dashboardStats?.pendingInbound || 0"
            suffix="单"
            class="mt-4"
          />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card title="今日出库">
          <el-statistic
            title="出库单数"
            :value="dashboardStats?.todayOutbound || 0"
            suffix="单"
          />
          <el-statistic
            title="待处理"
            :value="dashboardStats?.pendingOutbound || 0"
            suffix="单"
            class="mt-4"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 预警信息和最近活动 -->
    <el-row :gutter="20" class="alerts-activities-row">
      <el-col :span="12">
        <el-card title="库存预警">
          <template #header>
            <div class="card-header">
              <span>库存预警</span>
              <el-tag type="danger" v-if="dashboardStats?.lowStockAlerts">
                库存不足: {{ dashboardStats.lowStockAlerts }}
              </el-tag>
              <el-tag type="warning" v-if="dashboardStats?.expiringAlerts">
                即将过期: {{ dashboardStats.expiringAlerts }}
              </el-tag>
            </div>
          </template>
          
          <el-table :data="inventoryAlerts" style="width: 100%" max-height="300">
            <el-table-column prop="typeName" label="类型" width="80">
              <template #default="{ row }">
                <el-tag :type="getAlertTypeTag(row.type).type" size="small">
                  {{ getAlertTypeTag(row.type).text }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="productName" label="商品" show-overflow-tooltip />
            <el-table-column prop="warehouseName" label="仓库" width="100" />
            <el-table-column prop="currentQuantity" label="当前库存" width="80" />
            <el-table-column prop="expiryDate" label="过期日期" width="100" v-if="row.type !== 'low_stock'">
              <template #default="{ row }">
                {{ row.expiryDate || '-' }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card title="最近活动">
          <el-table :data="recentActivities" style="width: 100%" max-height="300">
            <el-table-column prop="typeName" label="类型" width="80">
              <template #default="{ row }">
                <el-tag :type="getActivityTypeTag(row.type).type" size="small">
                  {{ getActivityTypeTag(row.type).text }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="title" label="标题" show-overflow-tooltip />
            <el-table-column prop="operator" label="操作人" width="80" />
            <el-table-column prop="createdTime" label="时间" width="120">
              <template #default="{ row }">
                {{ new Date(row.createdTime).toLocaleString() }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;
  
  .stats-row {
    margin-bottom: 20px;
    
    .stat-card {
      text-align: center;
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