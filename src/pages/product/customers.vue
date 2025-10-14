<script lang="ts" setup>
import type { Customer, CustomerQuery } from "@@/apis/customer/type"
import { createCustomer, deleteCustomer, getCustomerList, updateCustomer, updateCustomerStatus } from "@@/apis/customer"
import { formatDateTime } from "@@/utils/datetime"
import { ElMessage, ElMessageBox } from "element-plus"
import { onMounted, reactive, ref } from "vue"

const tableData = ref<Customer[]>([])
const loading = ref(false)
const total = ref(0)

const queryParams = reactive<CustomerQuery>({ page: 0, size: 10, keyword: "", isEnabled: null })
const currentPage = ref(1)

const dialogVisible = ref(false)
const formType = ref<"create" | "edit">("create")
const formData = reactive<Partial<Customer>>({
  customerCode: "",
  customerName: "",
  contactPerson: "",
  contactPhone: "",
  email: "",
  address: "",
  isEnabled: true
})
const currentId = ref<number>()

async function fetchList() {
  loading.value = true
  try {
    const page = await getCustomerList(queryParams)
    tableData.value = page.content
    total.value = page.total
    currentPage.value = page.pageNumber + 1
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryParams.page = 0
  currentPage.value = 1
  fetchList()
}

function handleReset() {
  Object.assign(queryParams, { page: 0, size: 10, keyword: "", isEnabled: null })
  currentPage.value = 1
  fetchList()
}

function openCreate() {
  formType.value = "create"
  Object.assign(formData, { customerCode: "", customerName: "", contactPerson: "", contactPhone: "", email: "", address: "", isEnabled: true })
  currentId.value = undefined
  dialogVisible.value = true
}

function openEdit(row: Customer) {
  formType.value = "edit"
  Object.assign(formData, row)
  currentId.value = row.id
  dialogVisible.value = true
}

async function handleSubmit() {
  if (formType.value === "create") {
    await createCustomer(formData)
    ElMessage.success("创建成功")
  } else {
    await updateCustomer(currentId.value!, formData)
    ElMessage.success("更新成功")
  }
  dialogVisible.value = false
  fetchList()
}

async function handleDelete(row: Customer) {
  await ElMessageBox.confirm(`确定要删除客户“${row.customerName}”吗？`, "确认删除", { type: "warning" })
  await deleteCustomer(row.id)
  ElMessage.success("删除成功")
  fetchList()
}

async function handleToggle(row: Customer) {
  const target = !row.isEnabled
  await updateCustomerStatus(row.id, target)
  row.isEnabled = target
}

function handleSizeChange(size: number) {
  queryParams.size = size
  queryParams.page = 0
  currentPage.value = 1
  fetchList()
}

function handlePageChange(page: number) {
  currentPage.value = page
  queryParams.page = page - 1
  fetchList()
}

onMounted(() => fetchList())
</script>

<template>
  <div class="customer-container">
    <el-card class="search-card" shadow="never" :body-style="{ padding: '16px 20px' }">
      <el-form :model="queryParams" inline class="search-form" label-width="100px">
        <el-form-item label="关键词">
          <el-input v-model="queryParams.keyword" placeholder="名称/编码/联系人" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="启用状态">
          <el-select v-model="queryParams.isEnabled" placeholder="全部" clearable>
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
          <el-button type="primary" @click="openCreate">
            新增客户
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <el-table
        :data="tableData" v-loading="loading" stripe border
        :header-cell-style="{ background: 'var(--el-fill-color-light)' }"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="customerCode" label="编码" width="140" />
        <el-table-column prop="customerName" label="名称" />
        <el-table-column prop="contactPerson" label="联系人" width="120" />
        <el-table-column prop="contactPhone" label="电话" width="140" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="address" label="地址" />
        <el-table-column prop="isEnabled" label="启用" width="100" align="center">
          <template #default="{ row }">
            <el-switch :model-value="row.isEnabled" @change="handleToggle(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDateTime(row.createdTime as any) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="openEdit(row)">
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage" :page-size="queryParams.size" :page-sizes="[10, 20, 50, 100]"
          :total="total" background layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="formType === 'create' ? '新增客户' : '编辑客户'" width="640px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="编码">
          <el-input v-model="(formData.customerCode as string)" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="(formData.customerName as string)" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="(formData.contactPerson as string)" maxlength="50" />
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="(formData.contactPhone as string)" maxlength="20" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="(formData.email as string)" maxlength="100" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="(formData.address as string)" maxlength="255" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="(formData.isEnabled as boolean)" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">
            取消
          </el-button>
          <el-button type="primary" @click="handleSubmit">
            {{ formType === 'create' ? '创建' : '更新' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.customer-container {
  padding: 20px;

  .search-card {
    margin-bottom: 20px;
  }

  .search-form {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    grid-column-gap: 16px;
  }

  .search-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    justify-self: end;
  }

  .table-card .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}
</style>
