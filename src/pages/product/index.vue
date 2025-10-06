<script lang="ts" setup>
import type { ProductSku, ProductSkuForm, ProductSkuQuery } from "@/common/apis/product/type"
import { ElMessage, ElMessageBox } from "element-plus"
import { onMounted, reactive, ref } from "vue"
import { createProductSku, deleteProductSku, getProductSkuList, updateProductSku } from "@/common/apis/product"
import ProductFormDialog from "./components/ProductFormDialog.vue"

// 响应式数据
const tableData = ref<ProductSku[]>([])
const loading = ref(false)
const total = ref(0)

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
    const response = await getProductSkuList(queryParams)
    tableData.value = response.data
    total.value = response.total || 0
  } catch (error) {
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
      `确定要删除商品"${row.name}"吗？`,
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
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除失败")
    }
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
  } catch (error) {
    ElMessage.error(formType.value === "create" ? "创建失败" : "更新失败")
  }
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
  fetchProductList()
})
</script>

<template>
  <div class="product-container">
    <!-- 搜索表单 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="queryParams" inline>
        <el-form-item label="SKU编码">
          <el-input
            v-model="queryParams.skuCode"
            placeholder="请输入SKU编码"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="商品名称">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入商品名称"
            clearable
            @keyup.enter="handleSearch"
          />
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
          <span>商品列表</span>
          <el-button type="primary" @click="handleAdd">
            新增商品
          </el-button>
        </div>
      </template>

      <!-- 数据表格 -->
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="skuCode" label="SKU编码" width="150" />
        <el-table-column prop="name" label="商品名称" show-overflow-tooltip />
        <el-table-column prop="specification" label="规格" show-overflow-tooltip />
        <el-table-column prop="supplierName" label="供应商" width="120" />
        <el-table-column prop="isBatchManaged" label="批次管理" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isBatchManaged ? 'success' : 'info'" size="small">
              {{ row.isBatchManaged ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isExpiryManaged" label="保质期管理" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isExpiryManaged ? 'warning' : 'info'" size="small">
              {{ row.isExpiryManaged ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="shelfLifeDays" label="保质期(天)" width="100">
          <template #default="{ row }">
            {{ row.shelfLifeDays || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.createdTime).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
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
