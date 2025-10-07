<script lang="ts" setup>
import type { ProductSku, ProductSkuForm } from "@/common/apis/product/type"
import { ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElInputNumber, ElSwitch } from "element-plus"
import { nextTick, reactive, ref, watch } from "vue"

interface Props {
  type: "create" | "edit"
  record?: ProductSku
}

interface Emits {
  (e: "save", data: ProductSkuForm): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 对话框状态
const visible = ref(false)
const formRef = ref<InstanceType<typeof ElForm>>()

// 表单数据
const formData = reactive<ProductSkuForm>({
  skuCode: "",
  name: "",
  specification: "",
  supplierId: undefined,
  isBatchManaged: false,
  isExpiryManaged: false,
  shelfLifeDays: undefined
})

// 表单验证规则
const rules = {
  skuCode: [
    { required: true, message: "请输入SKU编码", trigger: "blur" },
    { min: 2, max: 100, message: "SKU编码长度在 2 到 100 个字符", trigger: "blur" }
  ],
  name: [
    { required: true, message: "请输入商品名称", trigger: "blur" },
    { min: 2, max: 255, message: "商品名称长度在 2 到 255 个字符", trigger: "blur" }
  ]
}

// 监听记录变化，填充表单数据
watch(() => props.record, (newRecord) => {
  if (newRecord) {
    Object.assign(formData, {
      skuCode: newRecord.skuCode,
      name: newRecord.name,
      specification: newRecord.specification || "",
      supplierId: newRecord.supplierId,
      isBatchManaged: newRecord.isBatchManaged,
      isExpiryManaged: newRecord.isExpiryManaged,
      shelfLifeDays: newRecord.shelfLifeDays
    })
  } else {
    resetForm()
  }
}, { immediate: true })

// 重置表单
function resetForm() {
  Object.assign(formData, {
    skuCode: "",
    name: "",
    specification: "",
    supplierId: undefined,
    isBatchManaged: false,
    isExpiryManaged: false,
    shelfLifeDays: undefined
  })
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// 打开对话框
function open() {
  visible.value = true
}

// 关闭对话框
function close() {
  visible.value = false
  resetForm()
}

// 确认保存
async function handleConfirm() {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    emit("save", { ...formData })
  } catch (error) {
    console.error("表单验证失败:", error)
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
    :title="type === 'create' ? '新增商品' : '编辑商品'"
    width="600px"
    @close="handleCancel"
  >
    <ElForm
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
    >
      <ElFormItem label="SKU编码" prop="skuCode">
        <ElInput
          v-model="formData.skuCode"
          placeholder="请输入SKU编码"
          maxlength="100"
          show-word-limit
        />
      </ElFormItem>

      <ElFormItem label="商品名称" prop="name">
        <ElInput
          v-model="formData.name"
          placeholder="请输入商品名称"
          maxlength="255"
          show-word-limit
        />
      </ElFormItem>

      <ElFormItem label="规格">
        <ElInput
          v-model="formData.specification"
          placeholder="请输入商品规格"
          maxlength="255"
          show-word-limit
        />
      </ElFormItem>

      <ElFormItem label="供应商ID">
        <ElInputNumber
          v-model="formData.supplierId"
          placeholder="请输入供应商ID"
          :min="1"
          controls-position="right"
        />
      </ElFormItem>

      <ElFormItem label="批次管理">
        <ElSwitch
          v-model="formData.isBatchManaged"
          active-text="启用"
          inactive-text="禁用"
        />
      </ElFormItem>

      <ElFormItem label="保质期管理">
        <ElSwitch
          v-model="formData.isExpiryManaged"
          active-text="启用"
          inactive-text="禁用"
        />
      </ElFormItem>

      <ElFormItem label="保质期(天)" v-if="formData.isExpiryManaged">
        <ElInputNumber
          v-model="formData.shelfLifeDays"
          placeholder="请输入保质期天数"
          :min="1"
          controls-position="right"
        />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="handleCancel">
          取消
        </ElButton>
        <ElButton type="primary" @click="handleConfirm">
          {{ type === 'create' ? '创建' : '更新' }}
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
