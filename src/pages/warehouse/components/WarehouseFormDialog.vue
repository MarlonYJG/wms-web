<script lang="ts" setup>
import type { FormRules } from "element-plus"
import type { Warehouse, WarehouseForm } from "@/common/apis/warehouse/type"
import { ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElInputNumber, ElSwitch } from "element-plus"
import { nextTick, reactive, ref, watch } from "vue"

interface Props {
  type: "create" | "edit"
  record?: Warehouse
}

interface Emits {
  (e: "save", data: WarehouseForm): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 对话框状态
const visible = ref(false)
const formRef = ref<InstanceType<typeof ElForm>>()

// 表单数据
const formData = reactive<WarehouseForm>({
  name: "",
  code: "",
  address: "",
  contactPerson: "",
  contactPhone: "",
  totalCapacity: undefined,
  isEnabled: true
})

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: "请输入仓库名称", trigger: "blur" },
    { min: 2, max: 100, message: "仓库名称长度在 2 到 100 个字符", trigger: "blur" }
  ],
  code: [
    { required: true, message: "请输入仓库编码", trigger: "blur" },
    { min: 2, max: 50, message: "仓库编码长度在 2 到 50 个字符", trigger: "blur" }
  ],
  contactPerson: [
    { min: 1, max: 50, message: "负责人长度在 1 到 50 个字符", trigger: "blur" }
  ],
  contactPhone: [
    { min: 6, max: 20, message: "联系方式长度在 6 到 20 个字符", trigger: "blur" }
  ]
}

// 监听记录变化，填充表单数据
watch(() => props.record, (newRecord) => {
  if (newRecord) {
    // 使用 nextTick 确保在下一个 DOM 更新周期后执行
    nextTick(() => {
      Object.assign(formData, {
        name: newRecord.name,
        code: newRecord.code,
        address: newRecord.address || "",
        contactPerson: newRecord.contactPerson || "",
        contactPhone: newRecord.contactPhone || "",
        totalCapacity: newRecord.totalCapacity,
        isEnabled: newRecord.isEnabled
      })
    })
  } else {
    resetForm()
  }
}, { immediate: true, deep: true })

// 重置表单
function resetForm() {
  Object.assign(formData, {
    name: "",
    code: "",
    address: "",
    contactPerson: "",
    contactPhone: "",
    totalCapacity: undefined,
    isEnabled: true
  })
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// 打开对话框
function open() {
  visible.value = true
  // 确保在对话框打开时正确填充数据
  if (props.record) {
    nextTick(() => {
      const record = props.record!
      Object.assign(formData, {
        name: record.name,
        code: record.code,
        address: record.address || "",
        contactPerson: record.contactPerson || "",
        contactPhone: record.contactPhone || "",
        totalCapacity: record.totalCapacity,
        isEnabled: record.isEnabled
      })
    })
  }
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
    v-model="visible" :title="type === 'create' ? '新增仓库' : '编辑仓库'" width="640px" :padding="0" top="10vh"
    destroy-on-close :close-on-click-modal="false" @close="handleCancel"
  >
    <div>
      <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px" label-position="right">
        <ElFormItem label="仓库名称" prop="name">
          <ElInput v-model="formData.name" placeholder="请输入仓库名称" maxlength="100" show-word-limit />
        </ElFormItem>

        <ElFormItem label="仓库编码" prop="code">
          <ElInput v-model="formData.code" placeholder="请输入仓库编码" maxlength="50" show-word-limit />
        </ElFormItem>

        <ElFormItem label="负责人" prop="contactPerson">
          <ElInput v-model="formData.contactPerson" placeholder="请输入负责人" maxlength="50" show-word-limit />
        </ElFormItem>

        <ElFormItem label="联系电话" prop="contactPhone">
          <ElInput v-model="formData.contactPhone" placeholder="请输入联系电话" maxlength="20" show-word-limit />
        </ElFormItem>

        <ElFormItem label="状态">
          <ElSwitch v-model="formData.isEnabled" active-text="启用" inactive-text="禁用" />
        </ElFormItem>

        <ElFormItem label="地址">
          <ElInput
            v-model="formData.address" type="textarea" placeholder="请输入仓库地址" :rows="3" maxlength="255"
            show-word-limit
          />
        </ElFormItem>

        <ElFormItem label="总容量" prop="totalCapacity">
          <ElInputNumber
            v-model="formData.totalCapacity" :min="0" :step="1" :precision="2" :controls="false"
            placeholder="请输入总容量"
          >
            <template #suffix>
              <span>平方米</span>
            </template>
          </ElInputNumber>
        </ElFormItem>
      </ElForm>
    </div>

    <template #footer>
      <div>
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

<style lang="scss" scoped></style>
