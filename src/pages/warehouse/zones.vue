<!--
 * @Author: Marlon
 * @Date: 2025-10-07 19:48:34
 * @Description:
-->
<script setup lang="ts">
import type { Warehouse } from "@@/apis/warehouse/type"
import type { StorageZone, StorageZoneForm, StorageZoneQuery, ZoneType } from "@@/apis/zone/type"
import { getWarehouseList } from "@@/apis/warehouse"
import { createStorageZone, deleteStorageZone, getStorageZoneList, updateStorageZone, updateStorageZoneStatus } from "@@/apis/zone"
import { ElMessageBox } from "element-plus"
import { onMounted, reactive, ref } from "vue"
import { formatDateTime } from "@/common/utils/datetime"
import ZoneFormDialog from "./components/ZoneFormDialog.vue"

const loading = ref(false)
const tableData = ref<StorageZone[]>([])
const total = ref(0)
const currentPage = ref(1)

const queryParams = reactive<StorageZoneQuery>({
  page: 0,
  size: 10,
  sortBy: "createdTime",
  sortDir: "desc",
  warehouseId: undefined,
  zoneType: undefined,
  keyword: "",
  isEnabled: null
})

const formDialog = ref<InstanceType<typeof ZoneFormDialog>>()
const dialogType = ref<"create" | "edit">("create")
const currentRecord = ref<StorageZone>()

const warehouseList = ref<Warehouse[]>([])

// 库区类型字典（统一字符串枚举）
const ZONE_TYPE_OPTIONS: Array<{ label: string, value: ZoneType }> = [
  { label: "存储区", value: "STORAGE" },
  { label: "收货区", value: "RECEIVING" },
  { label: "拣货区", value: "PICKING" },
  { label: "退货区", value: "RETURN" },
  { label: "不良品区", value: "DEFECTIVE" },
  { label: "发货区", value: "SHIPPING" }
]

function getZoneTypeLabel(val: ZoneType | undefined) {
  if (val == null) return "-"
  return ZONE_TYPE_OPTIONS.find(o => o.value === val)?.label ?? String(val)
}

async function fetchWarehouseList() {
  const data = await getWarehouseList({
    page: 0,
    size: 1000
  })
  warehouseList.value = data.content
}

async function fetchList() {
  loading.value = true
  const data = await getStorageZoneList(queryParams)
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
    warehouseId: undefined,
    zoneType: undefined,
    keyword: "",
    isEnabled: null
  })
  currentPage.value = 1
  fetchList()
}

function openCreate() {
  dialogType.value = "create"
  currentRecord.value = undefined
  formDialog.value?.open()
}

function openEdit(row: StorageZone) {
  dialogType.value = "edit"
  currentRecord.value = { ...row }
  formDialog.value?.open()
}

async function handleSave(formData: StorageZoneForm) {
  if (dialogType.value === "create") {
    await createStorageZone(formData)
  } else if (currentRecord.value) {
    await updateStorageZone(currentRecord.value.id, formData)
  }
  formDialog.value?.close()
  fetchList()
}

async function handleToggleEnabled(row: StorageZone) {
  await updateStorageZoneStatus(row.id, row.isEnabled)
  fetchList()
}

async function handleDelete(row: StorageZone) {
  await ElMessageBox.confirm(
    `确定要删除库区"${row.zoneName}"吗？`,
    "确认删除",
    {
      closeOnClickModal: false,
      closeOnPressEscape: false,
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }
  ).then(async () => {
    await deleteStorageZone(row.id)
    fetchList()
  }).catch(() => { })
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

onMounted(() => {
  fetchWarehouseList()
  fetchList()
})
</script>

<template>
  <div class="warehouse-container">
    <el-card class="search-card" shadow="never" :body-style="{ padding: '16px 20px' }">
      <el-form :model="queryParams" inline class="search-form" label-width="100px">
        <el-form-item label="所属仓库">
          <el-select v-model="queryParams.warehouseId" placeholder="请选择所属仓库" clearable>
            <el-option v-for="item in warehouseList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="库区类型">
          <el-select v-model="queryParams.zoneType" placeholder="请选择类型" clearable>
            <el-option v-for="opt in ZONE_TYPE_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input v-model="queryParams.keyword" placeholder="名称/编码" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.isEnabled" placeholder="请选择状态" clearable>
            <el-option label="启用" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
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
          <span class="card-title">库区列表</span>
          <div class="toolbar">
            <el-button type="primary" @click="openCreate">
              新增库区
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="tableData" v-loading="loading" stripe border
        :header-cell-style="{ background: 'var(--el-fill-color-light)' }" row-key="id"
      >
        <el-table-column type="index" label="序号" width="80" :index="indexMethod" align="center" />
        <el-table-column prop="zoneName" label="库区名称" show-overflow-tooltip />
        <el-table-column prop="zoneCode" label="库区编码" show-overflow-tooltip />
        <el-table-column prop="zoneType" label="类型" width="120" align="center">
          <template #default="{ row }">
            {{ getZoneTypeLabel(row.zoneType) }}
          </template>
        </el-table-column>
        <el-table-column prop="capacity" label="容量(㎡)" width="140" align="right" />
        <el-table-column prop="isEnabled" label="状态" width="150" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.isEnabled" :active-text="row.isEnabled ? '启用' : '禁用'"
              @change="() => handleToggleEnabled(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDateTime(row.createdTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button class="ml-4" type="primary" size="small" @click="openEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
        <template #empty>
          <div class="table-empty">
            <el-empty description="暂无数据" />
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

    <ZoneFormDialog
      ref="formDialog"
      :type="dialogType"
      :record="currentRecord"
      :default-warehouse-id="queryParams.warehouseId || warehouseList[0]?.id"
      @save="handleSave"
    />
  </div>
</template>

<style scoped lang="scss">
.warehouse-container {
  font-size: 16px;
  padding: 20px;

  .search-card {
    margin-bottom: 20px;

    .search-form {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr auto;
      grid-column-gap: 16px;
      grid-row-gap: 0;
      align-items: start;

      .search-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        justify-self: end;
      }

      @media (max-width: 1200px) {
        grid-template-columns: 1fr 1fr auto;
      }

      @media (max-width: 1100px) {
        grid-template-columns: 1fr 1fr;
      }

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }
  }

  .table-card {
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
}
</style>
