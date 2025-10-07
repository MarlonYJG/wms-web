<script lang="ts" setup>
import type { Warehouse, WarehouseForm, WarehouseQuery } from "@/common/apis/warehouse/type"
import { ElMessage, ElMessageBox } from "element-plus"
import { onMounted, reactive, ref } from "vue"
import { createWarehouse, deleteWarehouse, getWarehouseList, updateWarehouse, updateWarehouseStatus } from "@/common/apis/warehouse"
import WarehouseFormDialog from "./components/WarehouseFormDialog.vue"

// 响应式数据
const tableData = ref<Warehouse[]>([])
const loading = ref(false)
const total = ref(0)

// 查询参数
const queryParams = reactive<WarehouseQuery>({
  page: 1,
  size: 10,
  name: "",
  code: "",
  isEnabled: undefined
})

// 表单对话框
const formDialog = ref<InstanceType<typeof WarehouseFormDialog>>()
const formType = ref<"create" | "edit">("create")
const currentRecord = ref<Warehouse>()

// 获取仓库列表
async function fetchWarehouseList() {
  loading.value = true
  try {
    const response = await getWarehouseList(queryParams)
    tableData.value = response.data
    total.value = response.total || 0
  } catch {
    ElMessage.error("获取仓库列表失败")
  } finally {
    loading.value = false
  }
}

// 搜索
function handleSearch() {
  queryParams.page = 1
  fetchWarehouseList()
}

// 重置搜索
function handleReset() {
  Object.assign(queryParams, {
    page: 1,
    size: 10,
    name: "",
    code: "",
    isEnabled: undefined
  })
  fetchWarehouseList()
}

// 新增仓库
function handleAdd() {
  formType.value = "create"
  currentRecord.value = undefined
  formDialog.value?.open()
}

// 编辑仓库
function handleEdit(row: Warehouse) {
  formType.value = "edit"
  currentRecord.value = row
  formDialog.value?.open()
}

// 启用/禁用切换
async function handleToggleEnabled(row: Warehouse) {
  try {
    await updateWarehouseStatus(row.id, !row.isEnabled)
    ElMessage.success(!row.isEnabled ? "已启用" : "已禁用")
    fetchWarehouseList()
  } catch {
    ElMessage.error("状态更新失败")
  }
}

// 删除仓库
async function handleDelete(row: Warehouse) {
  try {
    await ElMessageBox.confirm(
      `确定要删除仓库"${row.name}"吗？`,
      "确认删除",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    )

    await deleteWarehouse(row.id)
    ElMessage.success("删除成功")
    fetchWarehouseList()
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除失败")
    }
  }
}

// 保存仓库
async function handleSave(formData: WarehouseForm) {
  try {
    if (formType.value === "create") {
      await createWarehouse(formData)
      ElMessage.success("创建成功")
    } else {
      await updateWarehouse(currentRecord.value!.id, formData)
      ElMessage.success("更新成功")
    }

    formDialog.value?.close()
    fetchWarehouseList()
  } catch {
    ElMessage.error(formType.value === "create" ? "创建失败" : "更新失败")
  }
}

// 分页变化
function handlePageChange(page: number) {
  queryParams.page = page
  fetchWarehouseList()
}

function handleSizeChange(size: number) {
  queryParams.size = size
  queryParams.page = 1
  fetchWarehouseList()
}

onMounted(() => {
  fetchWarehouseList()
})
</script>

<template>
  <div class="warehouse-container">
    <!-- 搜索表单 -->
    <el-card class="search-card" shadow="never" :body-style="{ padding: '16px 20px' }">
      <el-form :model="queryParams" inline class="search-form" label-width="100px">
        <el-form-item label="仓库名称">
          <el-input v-model="queryParams.name" placeholder="请输入仓库名称" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="仓库编码">
          <el-input v-model="queryParams.code" placeholder="请输入仓库编码" clearable @keyup.enter="handleSearch" />
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

    <!-- 操作按钮 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">仓库列表</span>
          <div class="toolbar">
            <el-button type="primary" @click="handleAdd">
              新增仓库
            </el-button>
          </div>
        </div>
      </template>

      <!-- 数据表格 -->
      <el-table
        :data="tableData" v-loading="loading" stripe border
        :header-cell-style="{ background: 'var(--el-fill-color-light)' }" row-key="id"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="仓库名称" show-overflow-tooltip />
        <el-table-column prop="code" label="仓库编码" show-overflow-tooltip />
        <el-table-column prop="address" label="地址" show-overflow-tooltip />
        <el-table-column prop="isEnabled" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isEnabled ? 'success' : 'danger'">
              {{ row.isEnabled ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.createdTime).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-switch
              v-model="row.isEnabled"
              :active-text="row.isEnabled ? '启用' : '禁用'"
              @change="() => handleToggleEnabled(row)"
            />
            <el-button type="primary" size="small" @click="handleEdit(row)">
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

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page" v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 50, 100]" :total="total" background layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 表单对话框 -->
    <WarehouseFormDialog ref="formDialog" :type="formType" :record="currentRecord" @save="handleSave" />
  </div>
</template>

<style lang="scss" scoped>
.warehouse-container {
  font-size: 16px;
  padding: 20px;

  .search-card {
    margin-bottom: 20px;

    .search-form {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr auto;
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
      padding: 8px 0;

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
