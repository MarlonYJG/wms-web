<script setup lang="ts">
import type { LocationType, StorageLocation, StorageLocationForm, StorageLocationQuery } from "@@/apis/location/type"
import type { Warehouse } from "@@/apis/warehouse/type"
import type { StorageZone, StorageZoneQuery, ZoneType } from "@@/apis/zone/type"
import { deleteStorageLocation, getStorageLocationList, updateStorageLocationStatus } from "@@/apis/location"
import { getWarehouseList } from "@@/apis/warehouse"
import { getStorageZoneList } from "@@/apis/zone"
import { ArrowDown } from "@element-plus/icons-vue"
import { ElMessageBox } from "element-plus"
import { computed, onMounted, reactive, ref } from "vue"
import { formatDateTime } from "@/common/utils/datetime"
import BatchCreateDialog from "./components/BatchCreateDialog.vue"
import LocationFormDialog from "./components/LocationFormDialog.vue"

const loading = ref(false)
const tableData = ref<StorageLocation[]>([])
const total = ref(0)
const currentPage = ref(1)

const leftQuery = reactive<{ warehouseId?: number }>({})
const zoneList = ref<StorageZone[]>([])
const activeZoneId = ref<number>()

const groupedZones = computed(() => {
  const groups: Record<string, StorageZone[]> = {}
  for (const z of zoneList.value) {
    const key = z.zoneType
    if (!groups[key]) groups[key] = []
    groups[key].push(z)
  }
  return groups
})

const queryParams = reactive<StorageLocationQuery>({
  page: 0,
  size: 10,
  sortBy: "createdTime",
  sortDir: "desc",
  zoneId: undefined,
  locationType: undefined,
  status: undefined,
  keyword: ""
})

const formDialog = ref<InstanceType<typeof LocationFormDialog>>()
const batchDialog = ref<InstanceType<typeof BatchCreateDialog>>()
const dialogType = ref<"create" | "edit">("create")
const currentRecord = ref<StorageLocation>()

const warehouseList = ref<Warehouse[]>([])

const ZONE_TYPE_OPTIONS: Array<{ label: string, value: ZoneType }> = [
  { label: "存储区", value: "STORAGE" },
  { label: "收货区", value: "RECEIVING" },
  { label: "拣货区", value: "PICKING" },
  { label: "退货区", value: "RETURN" },
  { label: "不良品区", value: "DEFECTIVE" },
  { label: "发货区", value: "SHIPPING" }
]

const LOCATION_TYPE_OPTIONS: Array<{ label: string, value: LocationType }> = [
  { label: "货架位", value: "SHELF" },
  { label: "地面位", value: "FLOOR" },
  { label: "冷藏位", value: "COLD" },
  { label: "危险品位", value: "DANGEROUS" }
]

const STATUS_OPTIONS: Array<{ label: string, value: StorageLocation["status"] }> = [
  { label: "空闲", value: "AVAILABLE" },
  { label: "占用", value: "OCCUPIED" },
  { label: "禁用", value: "DISABLED" }
]

function getZoneTypeLabel(val: ZoneType | undefined) {
  if (val == null) return "-"
  return ZONE_TYPE_OPTIONS.find(o => o.value === val)?.label ?? String(val)
}

function getLocationTypeLabel(val: LocationType | undefined) {
  if (val == null) return "-"
  return LOCATION_TYPE_OPTIONS.find(o => o.value === val)?.label ?? String(val)
}

function getStatusLabel(val: StorageLocation["status"]) {
  return STATUS_OPTIONS.find(o => o.value === val)?.label ?? String(val)
}

async function fetchWarehouseList() {
  const data = await getWarehouseList({ page: 0, size: 1000 })
  warehouseList.value = data.content
  if (!leftQuery.warehouseId && warehouseList.value.length > 0) {
    leftQuery.warehouseId = warehouseList.value[0].id
  }
}

async function fetchZoneList() {
  if (!leftQuery.warehouseId) {
    zoneList.value = []
    activeZoneId.value = undefined
    return
  }
  const data = await getStorageZoneList({
    page: 0,
    size: 1000,
    warehouseId: leftQuery.warehouseId
  } as StorageZoneQuery)
  zoneList.value = data.content
  if (zoneList.value.length > 0) {
    activeZoneId.value = zoneList.value[0].id
    queryParams.zoneId = activeZoneId.value
    handleSearch()
  } else {
    activeZoneId.value = undefined
    queryParams.zoneId = undefined
    tableData.value = []
    total.value = 0
  }
}

async function fetchList() {
  if (!queryParams.zoneId) return
  loading.value = true
  const data = await getStorageLocationList(queryParams)
  tableData.value = data.content
  total.value = data.total
  currentPage.value = data.pageNumber + 1
  loading.value = false
}

function handleSearch() {
  queryParams.page = 0
  currentPage.value = 1
  fetchList()
}

function handleReset() {
  Object.assign(queryParams, {
    page: 0,
    size: 10,
    sortBy: "createdTime",
    sortDir: "desc",
    zoneId: activeZoneId.value,
    locationType: undefined,
    status: undefined,
    keyword: ""
  })
  currentPage.value = 1
  fetchList()
}

function indexMethod(index: number) {
  return (queryParams.page || 0) * (queryParams.size || 10) + index + 1
}

function handlePageChange(page: number) {
  queryParams.page = page - 1
  fetchList()
}

function handleSizeChange(size: number) {
  queryParams.size = size
  queryParams.page = 0
  currentPage.value = 1
  fetchList()
}

function onSelectZone(index: string) {
  activeZoneId.value = Number(index)
  queryParams.zoneId = activeZoneId.value
  handleSearch()
}

function handleWarehouseChange() {
  fetchZoneList()
}

function openCreate() {
  dialogType.value = "create"
  currentRecord.value = undefined
  formDialog.value?.open()
}

function openEdit(row: StorageLocation) {
  dialogType.value = "edit"
  currentRecord.value = { ...row }
  formDialog.value?.open()
}

async function handleSave(_form: StorageLocationForm) {
  formDialog.value?.close()
  fetchList()
}

function openBatchCreate() {
  batchDialog.value?.open()
}

async function handleBatchCreate() {
  batchDialog.value?.close()
  fetchList()
}

async function toggleStatus(row: StorageLocation) {
  const next = row.status === "DISABLED" ? "AVAILABLE" : "DISABLED"
  await updateStorageLocationStatus(row.id, next)
  fetchList()
}

async function handleDelete(row: StorageLocation) {
  await ElMessageBox.confirm(
    `确定要删除库位"${row.locationCode}"吗？`,
    "确认删除",
    {
      closeOnClickModal: false,
      closeOnPressEscape: false,
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }
  ).then(async () => {
    await deleteStorageLocation(row.id)
    fetchList()
  }).catch(() => { })
}

onMounted(async () => {
  await fetchWarehouseList()
  await fetchZoneList()
})
</script>

<template>
  <div class="location-page">
    <div class="layout">
      <div class="sider">
        <el-card shadow="never" class="sider-card" :body-style="{ padding: '12px 12px 4px' }">
          <template #header>
            <div class="sider-header">
              <span>仓库 / 库区</span>
            </div>
          </template>

          <el-form :model="leftQuery" label-width="64px" class="left-search" inline>
            <el-form-item label="仓库">
              <el-select v-model="leftQuery.warehouseId" placeholder="选择仓库" clearable @change="handleWarehouseChange">
                <el-option v-for="w in warehouseList" :key="w.id" :label="w.name" :value="w.id" />
              </el-select>
            </el-form-item>
          </el-form>

          <el-scrollbar class="zone-list">
            <el-empty v-if="zoneList.length === 0" description="暂无库区" />
            <el-menu v-else class="zone-menu" :default-active="String(activeZoneId ?? '')" @select="onSelectZone">
              <template v-for="groupKey in Object.keys(groupedZones)" :key="groupKey">
                <el-sub-menu :index="`g-${groupKey}`">
                  <template #title>
                    <span>{{ getZoneTypeLabel(groupKey as ZoneType) }}</span>
                  </template>
                  <el-menu-item v-for="z in groupedZones[groupKey]" :key="z.id" :index="String(z.id)">
                    <span class="zone-item__name">{{ z.zoneName }}</span>
                  </el-menu-item>
                </el-sub-menu>
              </template>
            </el-menu>
          </el-scrollbar>
        </el-card>
      </div>

      <div class="content">
        <el-card shadow="never" class="search-card" :body-style="{ padding: '16px 20px' }">
          <el-form :model="queryParams" inline class="search-form" label-width="100px">
            <el-form-item label="库位类型">
              <el-select v-model="queryParams.locationType" placeholder="请选择类型" clearable>
                <el-option
                  v-for="opt in LOCATION_TYPE_OPTIONS" :key="opt.value" :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
                <el-option v-for="opt in STATUS_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="关键字">
              <el-input v-model="queryParams.keyword" placeholder="名称/编码" clearable @keyup.enter="handleSearch" />
            </el-form-item>
            <el-form-item class="search-actions">
              <el-button type="primary" @click="handleSearch">
                搜索
              </el-button>
              <el-button @click="handleReset">
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card class="table-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">库位列表</span>
              <div class="toolbar">
                <el-button type="primary" @click="openCreate">
                  新增库位
                </el-button>
                <el-button @click="openBatchCreate">
                  批量生成
                </el-button>
              </div>
            </div>
          </template>

          <el-table
            :data="tableData" v-loading="loading" stripe border
            :header-cell-style="{ background: 'var(--el-fill-color-light)' }" row-key="id"
          >
            <el-table-column type="index" label="序号" width="80" :index="indexMethod" align="center" />
            <el-table-column prop="locationCode" label="库位编码" show-overflow-tooltip />
            <el-table-column prop="locationName" label="库位名称" show-overflow-tooltip />
            <el-table-column prop="locationType" label="类型" width="120" align="center">
              <template #default="{ row }">
                {{ getLocationTypeLabel(row.locationType) }}
              </template>
            </el-table-column>
            <el-table-column prop="capacity" label="容量" width="120" align="right" />
            <el-table-column prop="status" label="状态" width="120" align="center">
              <template #default="{ row }">
                {{ getStatusLabel(row.status) }}
              </template>
            </el-table-column>
            <el-table-column prop="createdTime" label="创建时间" width="180" align="center">
              <template #default="{ row }">
                {{ formatDateTime(row.createdTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right" align="center">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="openEdit(row)">
                  编辑
                </el-button>
                <el-dropdown trigger="click">
                  <el-button size="small">
                    更多
                    <el-icon class="el-icon--right">
                      <ArrowDown />
                    </el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="toggleStatus(row)">
                        {{ row.status === 'DISABLED' ? '启用' : '禁用' }}
                      </el-dropdown-item>
                      <el-dropdown-item divided @click="handleDelete(row)">
                        <span class="danger">删除</span>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </el-table-column>
            <template #empty>
              <div class="table-empty">
                <el-empty description="请选择左侧库区以查看库位" />
              </div>
            </template>
          </el-table>

          <div class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage" v-model:page-size="queryParams.size"
              :page-sizes="[10, 20, 50, 100]" :total="total" background layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange" @current-change="handlePageChange"
            />
          </div>
        </el-card>
      </div>
    </div>

    <LocationFormDialog
      ref="formDialog" :type="dialogType" :record="currentRecord" :zone-id="activeZoneId"
      :zone-display-name="zoneList.find(z => z.id === activeZoneId)?.zoneName"
      @save="handleSave"
    />

    <BatchCreateDialog ref="batchDialog" :zone-id="activeZoneId" @confirm="handleBatchCreate" />
  </div>
</template>

<style scoped lang="scss">
.location-page {
  padding: 20px;
  max-width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  grid-gap: 16px;
  width: 100%;
  height: 100%;

  @media (max-width: 1200px) {
    grid-template-columns: 260px 1fr;
  }

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
}

.sider,
.content {
  min-width: 0; // 防止 CSS Grid 子项溢出导致横向滚动
}

.sider {
  height: 100%;
  display: flex;
}

.sider-card .left-search {
  display: grid;
  grid-template-columns: 1fr;
  grid-row-gap: 10px;
}

.sider-card {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.sider-card :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.zone-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: none; // 由弹性布局控制高度
}

.zone-menu {
  border-right: none;
  --el-menu-item-height: 36px;
  --el-menu-base-level-padding: 14px;
  --el-menu-level-padding: 20px;
}

.zone-menu :deep(.el-sub-menu__title) {
  font-weight: 600; // 一级分组标题加粗
}

.zone-item__name {
  margin-right: 6px;
}

.sider-header {
  font-size: 16px;
  font-weight: 600;
}

.zone-item__type {
  color: var(--el-color-info);
  font-size: 12px;
}

.search-card {
  margin-bottom: 16px;

  .search-form {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr auto;
    grid-column-gap: 16px;

    .search-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      justify-self: end;
    }

    @media (max-width: 1100px) {
      grid-template-columns: 1fr 1fr auto;
    }

    @media (max-width: 900px) {
      grid-template-columns: 1fr auto;
    }

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
}

.table-card {
  overflow: hidden; // 防止表格边界引起的横向滚动

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .card-title {
      font-weight: 600;
    }

    .toolbar {
      display: flex;
      gap: 12px;
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }

  .table-empty {
    padding: 24px 0;
  }
}
</style>
