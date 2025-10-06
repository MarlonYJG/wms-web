<script lang="ts" setup>
import { ref, watch } from "vue"
import { ElDialog, ElTable, ElTableColumn, ElTag } from "element-plus"
import type { OutboundOrder } from "@/common/apis/outbound/type"

interface Props {
  record?: OutboundOrder
}

const props = defineProps<Props>()

// 对话框状态
const visible = ref(false)

// 监听记录变化
watch(() => props.record, (newRecord) => {
  if (newRecord) {
    visible.value = true
  }
}, { immediate: true })

// 关闭对话框
const handleClose = () => {
  visible.value = false
}

// 获取状态标签类型
const getStatusTagType = (status: number) => {
  const typeMap = {
    1: "warning",
    2: "primary", 
    3: "info",
    4: "success"
  }
  return typeMap[status as keyof typeof typeMap] || "info"
}

// 获取状态文本
const getStatusText = (status: number) => {
  const statusMap = {
    1: "待处理",
    2: "已分配库存",
    3: "拣货中",
    4: "已发货"
  }
  return statusMap[status as keyof typeof statusMap] || "未知"
}

// 暴露方法
defineExpose({
  open: () => { visible.value = true },
  close: handleClose
})
</script>

<template>
  <el-dialog
    v-model="visible"
    title="出库单详情"
    width="800px"
    @close="handleClose"
  >
    <div v-if="record" class="order-detail">
      <!-- 基本信息 -->
      <div class="detail-section">
        <h4>基本信息</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="label">出库单号：</span>
            <span class="value">{{ record.orderNo }}</span>
          </div>
          <div class="detail-item">
            <span class="label">仓库：</span>
            <span class="value">{{ record.warehouseName }}</span>
          </div>
          <div class="detail-item">
            <span class="label">客户：</span>
            <span class="value">{{ record.customerName }}</span>
          </div>
          <div class="detail-item">
            <span class="label">状态：</span>
            <el-tag :type="getStatusTagType(record.status)">
              {{ getStatusText(record.status) }}
            </el-tag>
          </div>
          <div class="detail-item">
            <span class="label">创建时间：</span>
            <span class="value">{{ new Date(record.createdTime).toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <!-- 客户信息 -->
      <div class="detail-section" v-if="record.customerInfo">
        <h4>客户信息</h4>
        <div class="customer-info">
          <pre>{{ record.customerInfo }}</pre>
        </div>
      </div>

      <!-- 商品明细 -->
      <div class="detail-section">
        <h4>商品明细</h4>
        <el-table :data="record.items" style="width: 100%">
          <el-table-column prop="productName" label="商品名称" show-overflow-tooltip />
          <el-table-column prop="skuCode" label="SKU编码" width="150" />
          <el-table-column prop="quantity" label="需求数量" width="100" />
          <el-table-column prop="allocatedQuantity" label="已分配" width="100" />
          <el-table-column prop="pickedQuantity" label="已拣选" width="100" />
          <el-table-column label="完成率" width="100">
            <template #default="{ row }">
              <span :class="{ 'text-danger': row.pickedQuantity < row.quantity }">
                {{ Math.round((row.pickedQuantity / row.quantity) * 100) }}%
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.order-detail {
  .detail-section {
    margin-bottom: 20px;
    
    h4 {
      margin: 0 0 15px 0;
      color: #303133;
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .detail-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    
    .detail-item {
      display: flex;
      align-items: center;
      
      .label {
        font-weight: 500;
        color: #606266;
        min-width: 80px;
      }
      
      .value {
        color: #303133;
      }
    }
  }
  
  .customer-info {
    background-color: #f5f7fa;
    padding: 15px;
    border-radius: 4px;
    
    pre {
      margin: 0;
      font-family: inherit;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  }
  
  .text-danger {
    color: #f56c6c;
  }
}
</style>
