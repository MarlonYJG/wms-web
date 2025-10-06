<script lang="ts" setup>
import { ref, reactive, watch, nextTick } from "vue"
import { ElDialog, ElForm, ElFormItem, ElInput, ElSwitch, ElButton, ElInputNumber } from "element-plus"
import type { ProductSku, ProductSkuForm } from "@/common/apis/product/type"

interface Props {
  type: 'create' | 'edit'
  record?: ProductSku
}

interface Emits {
  (e: 'save', data: ProductSkuForm): void
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
const resetForm = () => {
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
const open = () => {
  visible.value = true
}

// 关闭对话框
const close = () => {
  visible.value = false
  resetForm()
}

// 确认保存
const handleConfirm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    emit('save', { ...formData })
  } catch (error) {
    console.error("表单验证失败:", error)
  }
}

// 取消
const handleCancel = () => {
  close()
}

// 暴露方法
defineExpose({
  open,
  close
})
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="type === 'create' ? '新增商品' : '编辑商品'"
    width="600px"
    @close="handleCancel"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item label="SKU编码" prop="skuCode">
        <el-input
          v-model="formData.skuCode"
          placeholder="请输入SKU编码"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="商品名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入商品名称"
          maxlength="255"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="规格">
        <el-input
          v-model="formData.specification"
          placeholder="请输入商品规格"
          maxlength="255"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="供应商ID">
        <el-input-number
          v-model="formData.supplierId"
          placeholder="请输入供应商ID"
          :min="1"
          controls-position="right"
        />
      </el-form-item>
      
      <el-form-item label="批次管理">
        <el-switch
          v-model="formData.isBatchManaged"
          active-text="启用"
          inactive-text="禁用"
        />
      </el-form-item>
      
      <el-form-item label="保质期管理">
        <el-switch
          v-model="formData.isExpiryManaged"
          active-text="启用"
          inactive-text="禁用"
        />
      </el-form-item>
      
      <el-form-item label="保质期(天)" v-if="formData.isExpiryManaged">
        <el-input-number
          v-model="formData.shelfLifeDays"
          placeholder="请输入保质期天数"
          :min="1"
          controls-position="right"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm">
          {{ type === 'create' ? '创建' : '更新' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
