<script lang="ts" setup>
import type { ProductSku, ProductSkuForm, ProductSkuQuery } from "@/common/apis/product/type"
import type { Supplier } from "@/common/apis/supplier/type"
import { ElMessage, ElMessageBox } from "element-plus"
import { onMounted, reactive, ref } from "vue"
import { createProductSku, deleteProductSku, getProductSkuList, updateProductSku } from "@/common/apis/product"
import { getSupplierList } from "@/common/apis/supplier"
import { formatDateTime } from "@/common/utils/datetime"
import ProductFormDialog from "./components/ProductFormDialog.vue"

// 响应式数据
const tableData = ref<ProductSku[]>([])
const loading = ref(false)
const total = ref(0)

// 供应商
const suppliers = ref<Supplier[]>([])
async function fetchSuppliers() {
  const res = await getSupplierList({ page: 0, size: 1000 })
  suppliers.value = res.content
}

// 查询参数
const queryParams = reactive<ProductSkuQuery>({
  page: 1,
  size: 10,
  skuCode: "",
  name: "",
  supplierId: undefined,
  isBatchManaged: undefined,
  isExpiryManaged: undefined
})

// 表单对话框
const formDialog = ref<InstanceType<typeof ProductFormDialog>>()
const formType = ref<"create" | "edit">("create")
const currentRecord = ref<ProductSku>()

// 获取商品列表
async function fetchProductList() {
  loading.value = true
  try {
    const page = await getProductSkuList(queryParams)
    tableData.value = page.content
    total.value = page.total
  } catch {
    ElMessage.error("获取商品列表失败")
  } finally {
    loading.value = false
  }
}

// 搜索
function handleSearch() {
  queryParams.page = 1
  fetchProductList()
}

// 重置搜索
function handleReset() {
  Object.assign(queryParams, {
    page: 1,
    size: 10,
    skuCode: "",
    name: "",
    supplierId: undefined,
    isBatchManaged: undefined,
    isExpiryManaged: undefined
  })
  fetchProductList()
}

// 新增商品
function handleAdd() {
  formType.value = "create"
  currentRecord.value = undefined
  formDialog.value?.open()
}

// 编辑商品
function handleEdit(row: ProductSku) {
  formType.value = "edit"
  currentRecord.value = row
  formDialog.value?.open()
}

// 删除商品
async function handleDelete(row: ProductSku) {
  try {
    await ElMessageBox.confirm(
      `确定要删除商品"${row.skuName}"吗？`,
      "确认删除",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    )

    await deleteProductSku(row.id)
    ElMessage.success("删除成功")
    fetchProductList()
  } catch {
    ElMessage.error("删除失败")
  }
}

// 保存商品
async function handleSave(formData: ProductSkuForm) {
  try {
    if (formType.value === "create") {
      await createProductSku(formData)
      ElMessage.success("创建成功")
    } else {
      await updateProductSku(currentRecord.value!.id, formData)
      ElMessage.success("更新成功")
    }

    formDialog.value?.close()
    fetchProductList()
  } catch {
    ElMessage.error(formType.value === "create" ? "创建失败" : "更新失败")
  }
}

// 导出CSV
function handleExport() {
  const headers = [
    "ID",
    "SKU编码",
    "商品名称",
    "规格",
    "供应商",
    "批次管理",
    "保质期管理",
    "保质期(天)"
  ]
  const rows = tableData.value.map(r => [
    r.id,
    r.skuCode,
    r.skuName,
    r.specification ?? "",
    r.supplierName ?? "",
    r.isBatchManaged ? "是" : "否",
    r.isExpiryManaged ? "是" : "否",
    r.shelfLifeDays ?? ""
  ])
  const csv = [headers, ...rows]
    .map(arr => arr.map(v => `"${String(v).replaceAll("\"", "\"\"")}"`).join(","))
    .join("\n")
  const blob = new Blob([`${"\uFEFF"}${csv}`], { type: "text/csv;charset=utf-8;" })
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = `商品SKU_${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

// 列设置（占位，后续可扩展为弹窗）
const visibleColumns = ref([
  { key: "id", label: "ID", show: true },
  { key: "skuCode", label: "SKU编码", show: true },
  { key: "skuName", label: "商品名称", show: true },
  { key: "specification", label: "规格", show: true },
  { key: "supplierName", label: "供应商", show: true },
  { key: "isBatchManaged", label: "批次管理", show: true },
  { key: "isExpiryManaged", label: "保质期管理", show: true },
  { key: "shelfLifeDays", label: "保质期(天)", show: true },
  { key: "createdTime", label: "创建时间", show: true }
])
function openColumnSettings() {
  ElMessage.info("列设置弹窗（占位）：后续可提供显示/隐藏与顺序调整，并本地持久化")
}

// 导入（占位）
function downloadTemplate() {
  const headers = [
    "skuCode",
    "skuName",
    "specification",
    "supplierName",
    "isBatchManaged",
    "isExpiryManaged",
    "shelfLifeDays"
  ]
  const csv = `${headers.join(",")}\n`
  const blob = new Blob([`${"\uFEFF"}${csv}`], { type: "text/csv;charset=utf-8;" })
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = "SKU导入模板.csv"
  a.click()
  URL.revokeObjectURL(a.href)
}
function openImportDialog() {
  ElMessage.info("导入对话框（占位）：后续可上传CSV并解析预览与提交")
}

// 分页变化
function handlePageChange(page: number) {
  queryParams.page = page
  fetchProductList()
}

function handleSizeChange(size: number) {
  queryParams.size = size
  queryParams.page = 1
  fetchProductList()
}

onMounted(() => {
  fetchSuppliers()
  fetchProductList()
})
</script>

<template>
  <div class="product-container">
    <!-- 搜索表单 -->
    <el-card class="search-card" shadow="never" :body-style="{ padding: '16px 20px' }">
      <el-form :model="queryParams" inline class="search-form" label-width="100px">
        <el-form-item label="SKU编码">
          <el-input v-model="queryParams.skuCode" placeholder="请输入SKU编码" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="商品名称">
          <el-input v-model="queryParams.name" placeholder="请输入商品名称" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="品牌">
          <el-input v-model="queryParams.brand" placeholder="品牌(占位)" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="分类">
          <el-input v-model="queryParams.categoryId" placeholder="分类(占位可替换级联)" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="供应商">
          <el-select v-model="queryParams.supplierId" placeholder="请选择" clearable filterable>
            <el-option v-for="s in suppliers" :key="s.id" :label="s.supplierName" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="批次管理">
          <el-select v-model="queryParams.isBatchManaged" placeholder="请选择" clearable>
            <el-option label="是" :value="true" />
            <el-option label="否" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="保质期管理">
          <el-select v-model="queryParams.isExpiryManaged" placeholder="请选择" clearable>
            <el-option label="是" :value="true" />
            <el-option label="否" :value="false" />
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

    <!-- 列表与工具栏 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">商品列表</span>
          <div class="toolbar">
            <el-button @click="openColumnSettings">
              列设置
            </el-button>
            <el-button @click="downloadTemplate">
              下载模板
            </el-button>
            <el-button @click="openImportDialog">
              导入
            </el-button>
            <el-button type="primary" @click="handleExport">
              导出
            </el-button>
            <el-button type="primary" @click="handleAdd">
              新增商品
            </el-button>
          </div>
        </div>
      </template>

      <!-- 数据表格 -->
      <el-table :data="tableData" v-loading="loading" stripe border :header-cell-style="{ background: 'var(--el-fill-color-light)' }">
        <el-table-column v-if="visibleColumns.find(c => c.key === 'id')?.show" prop="id" label="ID" width="80" align="center" />
        <el-table-column v-if="visibleColumns.find(c => c.key === 'skuCode')?.show" prop="skuCode" label="SKU编码" width="160" show-overflow-tooltip />
        <el-table-column v-if="visibleColumns.find(c => c.key === 'name')?.show" prop="name" label="商品名称" show-overflow-tooltip />
        <el-table-column v-if="visibleColumns.find(c => c.key === 'brand')?.show" prop="brand" label="品牌" width="120" show-overflow-tooltip />
        <el-table-column v-if="visibleColumns.find(c => c.key === 'categoryId')?.show" prop="categoryId" label="分类" width="120" />
        <el-table-column v-if="visibleColumns.find(c => c.key === 'specification')?.show" prop="specification" label="规格" show-overflow-tooltip />
        <el-table-column v-if="visibleColumns.find(c => c.key === 'supplierName')?.show" prop="supplierName" label="供应商" width="140" show-overflow-tooltip />
        <el-table-column v-if="visibleColumns.find(c => c.key === 'isBatchManaged')?.show" prop="isBatchManaged" label="批次管理" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isBatchManaged ? 'success' : 'info'" size="small">
              {{ row.isBatchManaged ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.find(c => c.key === 'isExpiryManaged')?.show" prop="isExpiryManaged" label="保质期管理" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isExpiryManaged ? 'warning' : 'info'" size="small">
              {{ row.isExpiryManaged ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.find(c => c.key === 'shelfLifeDays')?.show" prop="shelfLifeDays" label="保质期(天)" width="120" align="right">
          <template #default="{ row }">
            {{ row.shelfLifeDays || '-' }}
          </template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.find(c => c.key === 'barcodes')?.show" prop="barcodes" label="条码数" width="100" align="right">
          <template #default="{ row }">
            {{ Array.isArray(row.barcodes) ? row.barcodes.length : (row.barcode ? 1 : 0) }}
          </template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.find(c => c.key === 'isEnabled')?.show" prop="isEnabled" label="启用" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isEnabled ? 'success' : 'info'" size="small">
              {{ row.isEnabled ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.find(c => c.key === 'createdTime')?.show" prop="createdTime" label="创建时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDateTime(row.createdTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
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
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 表单对话框 -->
    <ProductFormDialog
      ref="formDialog"
      :type="formType"
      :record="currentRecord"
      @save="handleSave"
    />
  </div>
</template>

<style lang="scss" scoped>
.product-container {
  padding: 20px;

  .search-card {
    margin-bottom: 20px;

    .search-form {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr auto;
      grid-column-gap: 16px;

      .search-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        justify-self: end;
      }

      @media (max-width: 1200px) {
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
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-title {
      font-weight: 600;
    }

    .toolbar {
      display: flex;
      gap: 12px;
    }

    .table-empty {
      padding: 24px 0;
    }

    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }
  }
}
</style>
