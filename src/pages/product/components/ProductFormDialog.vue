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
  skuName: "",
  specification: "",
  brand: "",
  categoryId: undefined,
  supplierId: undefined,
  barcode: "",
  barcodes: [],
  weight: undefined,
  volume: undefined,
  safetyStock: undefined,
  isBatchManaged: false,
  isExpiryManaged: false,
  shelfLifeDays: undefined,
  isEnabled: true
})

// 表单验证规则
const rules = {
  skuCode: [
    { required: true, message: "请输入SKU编码", trigger: "blur" },
    { min: 2, max: 100, message: "SKU编码长度在 2 到 100 个字符", trigger: "blur" }
  ],
  skuName: [
    { required: true, message: "请输入商品名称", trigger: "blur" },
    { min: 2, max: 255, message: "商品名称长度在 2 到 255 个字符", trigger: "blur" }
  ]
}

// 监听记录变化，填充表单数据
watch(() => props.record, (newRecord) => {
  if (newRecord) {
    Object.assign(formData, {
      skuCode: newRecord.skuCode,
      skuName: newRecord.skuName,
      specification: newRecord.specification || "",
      brand: newRecord.brand || "",
      categoryId: newRecord.categoryId,
      supplierId: newRecord.supplierId,
      barcode: newRecord.barcode || "",
      barcodes: newRecord.barcodes || [],
      weight: newRecord.weight,
      volume: newRecord.volume,
      safetyStock: newRecord.safetyStock,
      isBatchManaged: newRecord.isBatchManaged,
      isExpiryManaged: newRecord.isExpiryManaged,
      shelfLifeDays: newRecord.shelfLifeDays,
      isEnabled: newRecord.isEnabled ?? true
    })
  } else {
    resetForm()
  }
}, { immediate: true })

// 重置表单
function resetForm() {
  Object.assign(formData, {
    skuCode: "",
    skuName: "",
    specification: "",
    brand: "",
    categoryId: undefined,
    supplierId: undefined,
    barcode: "",
    barcodes: [],
    weight: undefined,
    volume: undefined,
    safetyStock: undefined,
    isBatchManaged: false,
    isExpiryManaged: false,
    shelfLifeDays: undefined,
    isEnabled: true
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
    // 简化条码输入：将单条码与多条码合并（去重）
    const barcodes = Array.from(new Set([...(formData.barcodes || []), ...(formData.barcode ? [formData.barcode] : [])]))
    emit("save", { ...formData, barcodes })
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
    width="680px"
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

      <ElFormItem label="商品名称" prop="skuName">
        <ElInput
          v-model="formData.skuName"
          placeholder="请输入商品名称"
          maxlength="255"
          show-word-limit
        />
      </ElFormItem>

      <ElFormItem label="品牌">
        <ElInput v-model="formData.brand" placeholder="请输入品牌" />
      </ElFormItem>

      <ElFormItem label="分类">
        <ElInput v-model="formData.categoryId" placeholder="分类(占位，可替换为级联)" />
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

      <ElFormItem label="条码">
        <ElInput v-model="formData.barcode" placeholder="单条码（可选）" />
      </ElFormItem>

      <ElFormItem label="多条码">
        <ElInput v-model="(formData.barcodes as any)" placeholder="多个条码用逗号分隔（占位）" />
      </ElFormItem>

      <ElFormItem label="重量(kg)">
        <ElInputNumber v-model="formData.weight" :min="0" :precision="3" :step="0.1" controls-position="right" />
      </ElFormItem>

      <ElFormItem label="体积(m³)">
        <ElInputNumber v-model="formData.volume" :min="0" :precision="3" :step="0.1" controls-position="right" />
      </ElFormItem>

      <ElFormItem label="安全库存">
        <ElInputNumber v-model="formData.safetyStock" :min="0" :step="1" controls-position="right" />
      </ElFormItem>

      <ElFormItem label="批次管理">
        <ElSwitch v-model="formData.isBatchManaged" active-text="启用" inactive-text="禁用" />
      </ElFormItem>

      <ElFormItem label="保质期管理">
        <ElSwitch v-model="formData.isExpiryManaged" active-text="启用" inactive-text="禁用" />
      </ElFormItem>

      <ElFormItem label="保质期(天)" v-if="formData.isExpiryManaged">
        <ElInputNumber v-model="formData.shelfLifeDays" placeholder="请输入保质期天数" :min="1" controls-position="right" />
      </ElFormItem>

      <ElFormItem label="启用状态">
        <ElSwitch v-model="formData.isEnabled" active-text="启用" inactive-text="禁用" />
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
