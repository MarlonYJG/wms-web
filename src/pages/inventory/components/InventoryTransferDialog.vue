<script lang="ts" setup>
import type { Inventory } from "@/common/apis/inventory/type"
import { ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElInputNumber, ElMessage } from "element-plus"
import { nextTick, reactive, ref, watch } from "vue"
import { transferInventory } from "@/common/apis/inventory"

interface Emits {
  (e: "success"): void
}

const emit = defineEmits<Emits>()

// 对话框状态
const visible = ref(false)
const formRef = ref<InstanceType<typeof ElForm>>()
const currentRecord = ref<Inventory>()

// 表单数据
const formData = reactive({
  toLocationId: undefined as number | undefined,
  quantity: 0,
  reason: ""
})

// 表单验证规则
const rules = {
  toLocationId: [
    { required: true, message: "请输入目标库位ID", trigger: "blur" }
  ],
  quantity: [
    { required: true, message: "请输入转移数量", trigger: "blur" }
  ],
  reason: [
    { required: true, message: "请输入转移原因", trigger: "blur" },
    { min: 5, max: 200, message: "转移原因长度在 5 到 200 个字符", trigger: "blur" }
  ]
}

// 监听记录变化，填充表单数据
watch(() => currentRecord.value, (newRecord) => {
  if (newRecord) {
    formData.toLocationId = undefined
    formData.quantity = newRecord.availableQuantity
    formData.reason = ""
  } else {
    resetForm()
  }
}, { immediate: true })

// 重置表单
function resetForm() {
  Object.assign(formData, {
    toLocationId: undefined,
    quantity: 0,
    reason: ""
  })
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// 打开对话框
function open(record: Inventory) {
  currentRecord.value = record
  visible.value = true
}

// 关闭对话框
function close() {
  visible.value = false
  currentRecord.value = undefined
  resetForm()
}

// 确认转移
async function handleConfirm() {
  if (!formRef.value || !currentRecord.value) return

  try {
    await formRef.value.validate()

    await transferInventory({
      id: currentRecord.value.id,
      toLocationId: formData.toLocationId!,
      quantity: formData.quantity,
      reason: formData.reason
    })

    ElMessage.success("库存转移成功")
    close()
    emit("success")
  } catch (error) {
    console.error("库存转移失败:", error)
  }
}

// 取消
function handleCancel() {
  close()
}

// 暴露方法
defineExpose({
  open,
  close
})
</script>

<template>
  <ElDialog
    v-model="visible"
    title="库存转移"
    width="500px"
    @close="handleCancel"
  >
    <div v-if="currentRecord" class="inventory-info">
      <p><strong>商品：</strong>{{ currentRecord.productName }}</p>
      <p><strong>SKU编码：</strong>{{ currentRecord.skuCode }}</p>
      <p><strong>源库位：</strong>{{ currentRecord.locationCode }}</p>
      <p><strong>可用库存：</strong>{{ currentRecord.availableQuantity }}</p>
      <p v-if="currentRecord.batchNo">
        <strong>批次号：</strong>{{ currentRecord.batchNo }}
      </p>
    </div>

    <ElForm
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <ElFormItem label="目标库位ID" prop="toLocationId">
        <ElInputNumber
          v-model="formData.toLocationId"
          placeholder="请输入目标库位ID"
          :min="1"
          controls-position="right"
          style="width: 100%"
        />
      </ElFormItem>

      <ElFormItem label="转移数量" prop="quantity">
        <ElInputNumber
          v-model="formData.quantity"
          placeholder="请输入转移数量"
          :min="1"
          :max="currentRecord?.availableQuantity || 0"
          controls-position="right"
          style="width: 100%"
        />
        <div class="form-tip">
          最多可转移 {{ currentRecord?.availableQuantity || 0 }} 件
        </div>
      </ElFormItem>

      <ElFormItem label="转移原因" prop="reason">
        <ElInput
          v-model="formData.reason"
          type="textarea"
          placeholder="请输入转移原因"
          :rows="3"
          maxlength="200"
          show-word-limit
        />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="handleCancel">
          取消
        </ElButton>
        <ElButton type="primary" @click="handleConfirm">
          确认转移
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<style lang="scss" scoped>
.inventory-info {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;

  p {
    margin: 5px 0;
    font-size: 14px;
  }
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
