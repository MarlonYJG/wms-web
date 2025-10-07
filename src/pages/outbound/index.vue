<script lang="ts" setup>
import type { OutboundOrder, OutboundOrderForm, OutboundOrderQuery } from "@/common/apis/outbound/type"
import { ElMessage, ElMessageBox } from "element-plus"
import { onMounted, reactive, ref } from "vue"
import { allocateInventory, confirmShipment, createOutboundOrder, deleteOutboundOrder, generatePickingTasks, getOutboundOrderList, updateOutboundOrder } from "@/common/apis/outbound"
import OutboundOrderDetailDialog from "./components/OutboundOrderDetailDialog.vue"
import OutboundOrderFormDialog from "./components/OutboundOrderFormDialog.vue"

// 响应式数据
const tableData = ref<OutboundOrder[]>([])
const loading = ref(false)
const total = ref(0)

// 查询参数
const queryParams = reactive<OutboundOrderQuery>({
  page: 1,
  size: 10,
  orderNo: "",
  warehouseId: undefined,
  customerId: undefined,
  status: undefined,
  startTime: "",
  endTime: ""
})

// 对话框引用
const formDialog = ref<InstanceType<typeof OutboundOrderFormDialog>>()
const detailDialog = ref<InstanceType<typeof OutboundOrderDetailDialog>>()
const formType = ref<"create" | "edit">("create")
const currentRecord = ref<OutboundOrder>()

// 状态选项
const statusOptions = [
  { label: "待处理", value: 1 },
  { label: "已分配库存", value: 2 },
  { label: "拣货中", value: 3 },
  { label: "已发货", value: 4 }
]

// 获取出库单列表
async function fetchOutboundOrderList() {
  loading.value = true
  try {
    const response = await getOutboundOrderList(queryParams)
    tableData.value = response.data
    total.value = response.total || 0
  } catch (error) {
    ElMessage.error("获取出库单列表失败")
  } finally {
    loading.value = false
  }
}

// 搜索
function handleSearch() {
  queryParams.page = 1
  fetchOutboundOrderList()
}

// 重置搜索
function handleReset() {
  Object.assign(queryParams, {
    page: 1,
    size: 10,
    orderNo: "",
    warehouseId: undefined,
    customerId: undefined,
    status: undefined,
    startTime: "",
    endTime: ""
  })
  fetchOutboundOrderList()
}

// 新增出库单
function handleAdd() {
  formType.value = "create"
  currentRecord.value = undefined
  formDialog.value?.open()
}

// 编辑出库单
function handleEdit(row: OutboundOrder) {
  formType.value = "edit"
  currentRecord.value = row
  formDialog.value?.open()
}

// 查看详情
function handleView(row: OutboundOrder) {
  currentRecord.value = row
  detailDialog.value?.open()
}

// 删除出库单
async function handleDelete(row: OutboundOrder) {
  try {
    await ElMessageBox.confirm(
      `确定要删除出库单"${row.orderNo}"吗？`,
      "确认删除",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    )

    await deleteOutboundOrder(row.id)
    ElMessage.success("删除成功")
    fetchOutboundOrderList()
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除失败")
    }
  }
}

// 分配库存
async function handleAllocate(row: OutboundOrder) {
  try {
    await ElMessageBox.confirm(
      `确定要为出库单"${row.orderNo}"分配库存吗？`,
      "确认分配",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    )

    await allocateInventory(row.id)
    ElMessage.success("库存分配成功")
    fetchOutboundOrderList()
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("库存分配失败")
    }
  }
}

// 生成拣货任务
async function handleGeneratePicking(row: OutboundOrder) {
  try {
    await ElMessageBox.confirm(
      `确定要为出库单"${row.orderNo}"生成拣货任务吗？`,
      "确认生成",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    )

    await generatePickingTasks(row.id)
    ElMessage.success("拣货任务生成成功")
    fetchOutboundOrderList()
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("拣货任务生成失败")
    }
  }
}

// 确认发货
async function handleShip(row: OutboundOrder) {
  try {
    const { value: trackingNumber } = await ElMessageBox.prompt(
      "请输入运单号（可选）",
      "确认发货",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPlaceholder: "请输入运单号"
      }
    )

    await confirmShipment(row.id, trackingNumber)
    ElMessage.success("确认发货成功")
    fetchOutboundOrderList()
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("确认发货失败")
    }
  }
}

// 保存出库单
async function handleSave(formData: OutboundOrderForm) {
  try {
    if (formType.value === "create") {
      await createOutboundOrder(formData)
      ElMessage.success("创建成功")
    } else {
      await updateOutboundOrder(currentRecord.value!.id, formData)
      ElMessage.success("更新成功")
    }

    formDialog.value?.close()
    fetchOutboundOrderList()
  } catch (error) {
    ElMessage.error(formType.value === "create" ? "创建失败" : "更新失败")
  }
}

// 获取状态标签类型
function getStatusTagType(status: number) {
  const typeMap = {
    1: "warning",
    2: "primary",
    3: "info",
    4: "success"
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
  fetchOutboundOrderList()
}

function handleSizeChange(size: number) {
  queryParams.size = size
  queryParams.page = 1
  fetchOutboundOrderList()
}

onMounted(() => {
  fetchOutboundOrderList()
})
</script>

<template>
  <div class="outbound-container">
    <!-- 搜索表单 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="queryParams" inline>
        <el-form-item label="出库单号">
          <el-input
            v-model="queryParams.orderNo"
            placeholder="请输入出库单号"
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
        <el-form-item label="客户">
          <el-input-number
            v-model="queryParams.customerId"
            placeholder="请输入客户ID"
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
          <span>出库单列表</span>
          <el-button type="primary" @click="handleAdd">
            新增出库单
          </el-button>
        </div>
      </template>

      <!-- 数据表格 -->
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="orderNo" label="出库单号" width="150" />
        <el-table-column prop="warehouseName" label="仓库" width="120" />
        <el-table-column prop="customerName" label="客户" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.createdTime).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="400" fixed="right">
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
              @click="handleAllocate(row)"
            >
              分配库存
            </el-button>
            <el-button
              v-if="row.status === 2"
              type="warning"
              size="small"
              @click="handleGeneratePicking(row)"
            >
              生成拣货
            </el-button>
            <el-button
              v-if="row.status === 3"
              type="success"
              size="small"
              @click="handleShip(row)"
            >
              确认发货
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
    <OutboundOrderFormDialog
      ref="formDialog"
      :type="formType"
      :record="currentRecord"
      @save="handleSave"
    />

    <!-- 详情对话框 -->
    <OutboundOrderDetailDialog
      ref="detailDialog"
      :record="currentRecord"
    />
  </div>
</template>

<style lang="scss" scoped>
.outbound-container {
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
