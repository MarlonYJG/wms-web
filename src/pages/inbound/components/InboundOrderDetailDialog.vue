<script lang="ts" setup>
import type { InboundOrder } from "@/common/apis/inbound/type"
import { ElDialog, ElTable, ElTableColumn, ElTag } from "element-plus"
import { ref, watch } from "vue"

interface Props {
  record?: InboundOrder
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
function handleClose() {
  visible.value = false
}

// 获取状态标签类型
function getStatusTagType(status: number) {
  const typeMap = {
    1: "warning",
    2: "primary",
    3: "success",
    4: "danger"
  }
  const allowedTypes = ["primary", "success", "warning", "info", "danger"] as const
  const t = (typeMap as any)[status] || "info"
  return (allowedTypes as readonly string[]).includes(t) ? t : "info"
}

// 获取状态文本
function getStatusText(status: number) {
  const statusMap = {
    1: "待收货",
    2: "部分收货",
    3: "已完成",
    4: "已取消"
  }
  return statusMap[status as keyof typeof statusMap] || "未知"
}

// 暴露方法
defineExpose({
  open: () => {
    visible.value = true
  },
  close: handleClose
})
</script>

<template>
  <ElDialog
    v-model="visible"
    title="入库单详情"
    width="800px"
    @close="handleClose"
  >
    <div v-if="record" class="order-detail">
      <!-- 基本信息 -->
      <div class="detail-section">
        <h4>基本信息</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="label">入库单号：</span>
            <span class="value">{{ record.orderNo }}</span>
          </div>
          <div class="detail-item">
            <span class="label">仓库：</span>
            <span class="value">{{ record.warehouseName }}</span>
          </div>
          <div class="detail-item">
            <span class="label">供应商：</span>
            <span class="value">{{ record.supplierName }}</span>
          </div>
          <div class="detail-item">
            <span class="label">状态：</span>
            <ElTag :type="getStatusTagType(record.status)">
              {{ getStatusText(record.status) }}
            </ElTag>
          </div>
          <div class="detail-item">
            <span class="label">预期数量：</span>
            <span class="value">{{ record.totalExpectedQuantity }}</span>
          </div>
          <div class="detail-item">
            <span class="label">已收数量：</span>
            <span class="value">{{ record.totalReceivedQuantity }}</span>
          </div>
          <div class="detail-item">
            <span class="label">创建时间：</span>
            <span class="value">{{ new Date(record.createdTime).toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <!-- 商品明细 -->
      <div class="detail-section">
        <h4>商品明细</h4>
        <ElTable :data="record.items" style="width: 100%">
          <ElTableColumn prop="productName" label="商品名称" show-overflow-tooltip />
          <ElTableColumn prop="skuCode" label="SKU编码" width="150" />
          <ElTableColumn prop="expectedQuantity" label="预期数量" width="100" />
          <ElTableColumn prop="receivedQuantity" label="已收数量" width="100" />
          <ElTableColumn label="完成率" width="100">
            <template #default="{ row }">
              <span :class="{ 'text-danger': row.receivedQuantity < row.expectedQuantity }">
                {{ Math.round((row.receivedQuantity / row.expectedQuantity) * 100) }}%
              </span>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </div>
  </ElDialog>
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

  .text-danger {
    color: #f56c6c;
  }
}
</style>
