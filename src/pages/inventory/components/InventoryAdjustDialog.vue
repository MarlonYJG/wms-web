<script lang="ts" setup>
import type { Inventory } from "@/common/apis/inventory/type"
import { ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElInputNumber, ElMessage } from "element-plus"
import { nextTick, reactive, ref, watch } from "vue"
import { adjustInventory } from "@/common/apis/inventory"

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
  quantity: 0,
  reason: ""
})

// 表单验证规则
const rules = {
  quantity: [
    { required: true, message: "请输入调整数量", trigger: "blur" }
  ],
  reason: [
    { required: true, message: "请输入调整原因", trigger: "blur" },
    { min: 5, max: 200, message: "调整原因长度在 5 到 200 个字符", trigger: "blur" }
  ]
}

// 监听记录变化，填充表单数据
watch(() => currentRecord.value, (newRecord) => {
  if (newRecord) {
    formData.quantity = newRecord.quantity
    formData.reason = ""
  } else {
    resetForm()
  }
}, { immediate: true })

// 重置表单
function resetForm() {
  Object.assign(formData, {
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

// 确认调整
async function handleConfirm() {
  if (!formRef.value || !currentRecord.value) return

  try {
    await formRef.value.validate()

    await adjustInventory({
      id: currentRecord.value.id,
      quantity: formData.quantity,
      reason: formData.reason
    })

    ElMessage.success("库存调整成功")
    close()
    emit("success")
  } catch (error) {
    console.error("库存调整失败:", error)
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
    title="库存调整"
    width="500px"
    @close="handleCancel"
  >
    <div v-if="currentRecord" class="inventory-info">
      <p><strong>商品：</strong>{{ currentRecord.productName }}</p>
      <p><strong>SKU编码：</strong>{{ currentRecord.skuCode }}</p>
      <p><strong>库位：</strong>{{ currentRecord.locationCode }}</p>
      <p><strong>当前库存：</strong>{{ currentRecord.quantity }}</p>
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
      <ElFormItem label="调整数量" prop="quantity">
        <ElInputNumber
          v-model="formData.quantity"
          placeholder="请输入调整数量"
          controls-position="right"
          style="width: 100%"
        />
        <div class="form-tip">
          正数为增加库存，负数为减少库存
        </div>
      </ElFormItem>

      <ElFormItem label="调整原因" prop="reason">
        <ElInput
          v-model="formData.reason"
          type="textarea"
          placeholder="请输入调整原因"
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
          确认调整
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
