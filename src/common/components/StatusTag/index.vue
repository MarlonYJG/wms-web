<script lang="ts" setup>
interface Props {
  status: number
  type: "inbound" | "outbound" | "inventory" | "warehouse" | "product"
}

const props = defineProps<Props>()

// 状态配置映射
const statusConfig = {
  inbound: {
    1: { type: "warning", text: "待收货" },
    2: { type: "primary", text: "部分收货" },
    3: { type: "success", text: "已完成" },
    4: { type: "danger", text: "已取消" }
  },
  outbound: {
    1: { type: "warning", text: "待处理" },
    2: { type: "primary", text: "已分配库存" },
    3: { type: "info", text: "拣货中" },
    4: { type: "success", text: "已发货" }
  },
  inventory: {
    1: { type: "success", text: "正常" },
    2: { type: "warning", text: "库存不足" },
    3: { type: "danger", text: "已过期" }
  },
  warehouse: {
    1: { type: "success", text: "启用" },
    0: { type: "danger", text: "禁用" }
  },
  product: {
    1: { type: "success", text: "启用" },
    0: { type: "danger", text: "禁用" }
  }
}

// 获取状态配置
function getStatusConfig() {
  const config = statusConfig[props.type]
  return config[props.status as keyof typeof config] || { type: "info", text: "未知" }
}
</script>

<template>
  <el-tag :type="getStatusConfig().type" size="small">
    {{ getStatusConfig().text }}
  </el-tag>
</template>
