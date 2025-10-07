<script lang="ts" setup>
import type { InboundOrder, InboundOrderForm, InboundOrderQuery } from "@/common/apis/inbound/type"
import { ElMessage, ElMessageBox } from "element-plus"
import { onMounted, reactive, ref } from "vue"
import { confirmReceipt, createInboundOrder, deleteInboundOrder, getInboundOrderList, updateInboundOrder } from "@/common/apis/inbound"
import InboundOrderDetailDialog from "./components/InboundOrderDetailDialog.vue"
import InboundOrderFormDialog from "./components/InboundOrderFormDialog.vue"

// 响应式数据
const tableData = ref<InboundOrder[]>([])
const loading = ref(false)
const total = ref(0)

// 查询参数
const queryParams = reactive<InboundOrderQuery>({
  page: 1,
  size: 10,
  orderNo: "",
  warehouseId: undefined,
  supplierId: undefined,
  status: undefined,
  startTime: "",
  endTime: ""
})

// 对话框引用
const formDialog = ref<InstanceType<typeof InboundOrderFormDialog>>()
const detailDialog = ref<InstanceType<typeof InboundOrderDetailDialog>>()
const formType = ref<"create" | "edit">("create")
const currentRecord = ref<InboundOrder>()

// 状态选项
const statusOptions = [
  { label: "待收货", value: 1 },
  { label: "部分收货", value: 2 },
  { label: "已完成", value: 3 },
  { label: "已取消", value: 4 }
]

// 获取入库单列表
async function fetchInboundOrderList() {
  loading.value = true
  try {
    const response = await getInboundOrderList(queryParams)
    tableData.value = response.data
    total.value = response.total || 0
  } catch (error) {
    ElMessage.error("获取入库单列表失败")
  } finally {
    loading.value = false
  }
}

// 搜索
function handleSearch() {
  queryParams.page = 1
  fetchInboundOrderList()
}

// 重置搜索
function handleReset() {
  Object.assign(queryParams, {
    page: 1,
    size: 10,
    orderNo: "",
    warehouseId: undefined,
    supplierId: undefined,
    status: undefined,
    startTime: "",
    endTime: ""
  })
  fetchInboundOrderList()
}

// 新增入库单
function handleAdd() {
  formType.value = "create"
  currentRecord.value = undefined
  formDialog.value?.open()
}

// 编辑入库单
function handleEdit(row: InboundOrder) {
  formType.value = "edit"
  currentRecord.value = row
  formDialog.value?.open()
}

// 查看详情
function handleView(row: InboundOrder) {
  currentRecord.value = row
  detailDialog.value?.open()
}

// 删除入库单
async function handleDelete(row: InboundOrder) {
  try {
    await ElMessageBox.confirm(
      `确定要删除入库单"${row.orderNo}"吗？`,
      "确认删除",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    )

    await deleteInboundOrder(row.id)
    ElMessage.success("删除成功")
    fetchInboundOrderList()
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除失败")
    }
  }
}

// 确认收货
async function handleConfirmReceipt(row: InboundOrder) {
  try {
    await ElMessageBox.confirm(
      `确定要确认收货入库单"${row.orderNo}"吗？`,
      "确认收货",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    )

    // 这里应该打开收货确认对话框，暂时简化处理
    await confirmReceipt(row.id, row.items.map(item => ({
      productSkuId: item.productSkuId,
      receivedQuantity: item.expectedQuantity
    })))

    ElMessage.success("确认收货成功")
    fetchInboundOrderList()
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("确认收货失败")
    }
  }
}

// 保存入库单
async function handleSave(formData: InboundOrderForm) {
  try {
    if (formType.value === "create") {
      await createInboundOrder(formData)
      ElMessage.success("创建成功")
    } else {
      await updateInboundOrder(currentRecord.value!.id, formData)
      ElMessage.success("更新成功")
    }

    formDialog.value?.close()
    fetchInboundOrderList()
  } catch (error) {
    ElMessage.error(formType.value === "create" ? "创建失败" : "更新失败")
  }
}

// 获取状态标签类型
function getStatusTagType(status: number) {
  const typeMap = {
    1: "warning",
    2: "primary",
    3: "success",
    4: "danger"
  }
  return typeMap[status as keyof typeof typeMap] || "info"
}

// 获取状态文本
function getStatusText(status: number) {
  const option = statusOptions.find(opt => opt.value === status)
  return option?.label || "未知"
}

// 分页变化
function handlePageChange(page: number) {
  queryParams.page = page
  fetchInboundOrderList()
}

function handleSizeChange(size: number) {
  queryParams.size = size
  queryParams.page = 1
  fetchInboundOrderList()
}

onMounted(() => {
  fetchInboundOrderList()
})
</script>

<template>
  <div class="inbound-container">
    <!-- 搜索表单 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="queryParams" inline>
        <el-form-item label="入库单号">
          <el-input
            v-model="queryParams.orderNo"
            placeholder="请输入入库单号"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="仓库">
          <el-input-number
            v-model="queryParams.warehouseId"
            placeholder="请输入仓库ID"
            :min="1"
            controls-position="right"
            clearable
          />
        </el-form-item>
        <el-form-item label="供应商">
          <el-input-number
            v-model="queryParams.supplierId"
            placeholder="请输入供应商ID"
            :min="1"
            controls-position="right"
            clearable
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option
              v-for="option in statusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
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
          <span>入库单列表</span>
          <el-button type="primary" @click="handleAdd">
            新增入库单
          </el-button>
        </div>
      </template>

      <!-- 数据表格 -->
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="orderNo" label="入库单号" width="150" />
        <el-table-column prop="warehouseName" label="仓库" width="120" />
        <el-table-column prop="supplierName" label="供应商" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="数量" width="120">
          <template #default="{ row }">
            {{ row.totalReceivedQuantity }}/{{ row.totalExpectedQuantity }}
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.createdTime).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-button type="info" size="small" @click="handleView(row)">
              详情
            </el-button>
            <el-button
              v-if="row.status === 1"
              type="primary"
              size="small"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="row.status === 1"
              type="success"
              size="small"
              @click="handleConfirmReceipt(row)"
            >
              确认收货
            </el-button>
            <el-button
              v-if="row.status === 1"
              type="danger"
              size="small"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 表单对话框 -->
    <InboundOrderFormDialog
      ref="formDialog"
      :type="formType"
      :record="currentRecord"
      @save="handleSave"
    />

    <!-- 详情对话框 -->
    <InboundOrderDetailDialog
      ref="detailDialog"
      :record="currentRecord"
    />
  </div>
</template>

<style lang="scss" scoped>
.inbound-container {
  padding: 20px;

  .search-card {
    margin-bottom: 20px;
  }

  .table-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }
  }
}
</style>
