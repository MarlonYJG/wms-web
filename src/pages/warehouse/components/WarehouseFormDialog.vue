<script lang="ts" setup>
import type { Warehouse, WarehouseForm } from "@/common/apis/warehouse/type"
import { ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElSwitch } from "element-plus"
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
  isEnabled: true
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: "请输入仓库名称", trigger: "blur" },
    { min: 2, max: 100, message: "仓库名称长度在 2 到 100 个字符", trigger: "blur" }
  ],
  code: [
    { required: true, message: "请输入仓库编码", trigger: "blur" },
    { min: 2, max: 50, message: "仓库编码长度在 2 到 50 个字符", trigger: "blur" }
  ]
}

// 监听记录变化，填充表单数据
watch(() => props.record, (newRecord) => {
  if (newRecord) {
    Object.assign(formData, {
      name: newRecord.name,
      code: newRecord.code,
      address: newRecord.address || "",
      isEnabled: newRecord.isEnabled
    })
  } else {
    resetForm()
  }
}, { immediate: true })

// 重置表单
function resetForm() {
  Object.assign(formData, {
    name: "",
    code: "",
    address: "",
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
    :title="type === 'create' ? '新增仓库' : '编辑仓库'"
    width="600px"
    @close="handleCancel"
  >
    <ElForm
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <ElFormItem label="仓库名称" prop="name">
        <ElInput
          v-model="formData.name"
          placeholder="请输入仓库名称"
          maxlength="100"
          show-word-limit
        />
      </ElFormItem>

      <ElFormItem label="仓库编码" prop="code">
        <ElInput
          v-model="formData.code"
          placeholder="请输入仓库编码"
          maxlength="50"
          show-word-limit
        />
      </ElFormItem>

      <ElFormItem label="地址">
        <ElInput
          v-model="formData.address"
          type="textarea"
          placeholder="请输入仓库地址"
          :rows="3"
          maxlength="255"
          show-word-limit
        />
      </ElFormItem>

      <ElFormItem label="状态">
        <ElSwitch
          v-model="formData.isEnabled"
          active-text="启用"
          inactive-text="禁用"
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
