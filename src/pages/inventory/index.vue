<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { getInventoryList, adjustInventory, transferInventory } from "@/common/apis/inventory"
import type { Inventory, InventoryQuery } from "@/common/apis/inventory/type"
import InventoryAdjustDialog from "./components/InventoryAdjustDialog.vue"
import InventoryTransferDialog from "./components/InventoryTransferDialog.vue"

// 响应式数据
const tableData = ref<Inventory[]>([])
const loading = ref(false)
const total = ref(0)

// 查询参数
const queryParams = reactive<InventoryQuery>({
  page: 1,
  size: 10,
  warehouseId: undefined,
  locationId: undefined,
  productSkuId: undefined,
  skuCode: "",
  batchNo: "",
  hasStock: undefined
})

// 对话框引用
const adjustDialog = ref<InstanceType<typeof InventoryAdjustDialog>>()
const transferDialog = ref<InstanceType<typeof InventoryTransferDialog>>()

// 获取库存列表
const fetchInventoryList = async () => {
  loading.value = true
  try {
    const response = await getInventoryList(queryParams)
    tableData.value = response.data
    total.value = response.total || 0
  } catch (error) {
    ElMessage.error("获取库存列表失败")
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  queryParams.page = 1
  fetchInventoryList()
}

// 重置搜索
const handleReset = () => {
  Object.assign(queryParams, {
    page: 1,
    size: 10,
    warehouseId: undefined,
    locationId: undefined,
    productSkuId: undefined,
    skuCode: "",
    batchNo: "",
    hasStock: undefined
  })
  fetchInventoryList()
}

// 库存调整
const handleAdjust = (row: Inventory) => {
  adjustDialog.value?.open(row)
}

// 库存转移
const handleTransfer = (row: Inventory) => {
  transferDialog.value?.open(row)
}

// 分页变化
const handlePageChange = (page: number) => {
  queryParams.page = page
  fetchInventoryList()
}

const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
  fetchInventoryList()
}

onMounted(() => {
  fetchInventoryList()
})
</script>

<template>
  <div class="inventory-container">
    <!-- 搜索表单 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="queryParams" inline>
        <el-form-item label="仓库">
          <el-input-number
            v-model="queryParams.warehouseId"
            placeholder="请输入仓库ID"
            :min="1"
            controls-position="right"
            clearable
          />
        </el-form-item>
        <el-form-item label="库位">
          <el-input-number
            v-model="queryParams.locationId"
            placeholder="请输入库位ID"
            :min="1"
            controls-position="right"
            clearable
          />
        </el-form-item>
        <el-form-item label="SKU编码">
          <el-input
            v-model="queryParams.skuCode"
            placeholder="请输入SKU编码"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="批次号">
          <el-input
            v-model="queryParams.batchNo"
            placeholder="请输入批次号"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="有库存">
          <el-select v-model="queryParams.hasStock" placeholder="请选择" clearable>
            <el-option label="是" :value="true" />
            <el-option label="否" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>库存列表</span>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="warehouseName" label="仓库" width="120" />
        <el-table-column prop="locationCode" label="库位" width="120" />
        <el-table-column prop="productName" label="商品名称" show-overflow-tooltip />
        <el-table-column prop="skuCode" label="SKU编码" width="150" />
        <el-table-column prop="batchNo" label="批次号" width="120" />
        <el-table-column prop="productionDate" label="生产日期" width="120">
          <template #default="{ row }">
            {{ row.productionDate || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="expiryDate" label="过期日期" width="120">
          <template #default="{ row }">
            {{ row.expiryDate || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="库存数量" width="100" />
        <el-table-column prop="lockedQuantity" label="锁定数量" width="100" />
        <el-table-column prop="availableQuantity" label="可用数量" width="100">
          <template #default="{ row }">
            <span :class="{ 'text-danger': row.availableQuantity <= 0 }">
              {{ row.availableQuantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.createdTime).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="warning" size="small" @click="handleAdjust(row)">
              调整
            </el-button>
            <el-button type="primary" size="small" @click="handleTransfer(row)">
              转移
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

    <!-- 库存调整对话框 -->
    <InventoryAdjustDialog
      ref="adjustDialog"
      @success="fetchInventoryList"
    />

    <!-- 库存转移对话框 -->
    <InventoryTransferDialog
      ref="transferDialog"
      @success="fetchInventoryList"
    />
  </div>
</template>

<style lang="scss" scoped>
.inventory-container {
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
  
  .text-danger {
    color: #f56c6c;
  }
}
</style>
