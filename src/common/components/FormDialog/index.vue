<script lang="ts" setup>
import { ref, watch, nextTick } from "vue"
import { ElDialog, ElForm, ElFormItem, ElButton } from "element-plus"

interface Props {
  title: string
  visible: boolean
  loading?: boolean
  formData: Record<string, any>
  rules?: Record<string, any>
  formItems: Array<{
    prop: string
    label: string
    type: 'input' | 'textarea' | 'number' | 'select' | 'switch' | 'date' | 'datetime'
    placeholder?: string
    options?: Array<{ label: string; value: any }>
    min?: number
    max?: number
    rows?: number
    slot?: string
  }>
  width?: string
}

interface Emits {
  (e: 'update:visible', visible: boolean): void
  (e: 'confirm', formData: Record<string, any>): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  width: '600px'
})

const emit = defineEmits<Emits>()

const formRef = ref<InstanceType<typeof ElForm>>()

// 监听visible变化
watch(() => props.visible, (newVal) => {
  if (newVal) {
    nextTick(() => {
      formRef.value?.clearValidate()
    })
  }
})

// 确认
const handleConfirm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    emit('confirm', { ...props.formData })
  } catch (error) {
    console.error("表单验证失败:", error)
  }
}

// 取消
const handleCancel = () => {
  emit('cancel')
}

// 关闭对话框
const handleClose = () => {
  emit('update:visible', false)
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    :width="width"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item
        v-for="item in formItems"
        :key="item.prop"
        :label="item.label"
        :prop="item.prop"
      >
        <!-- 输入框 -->
        <el-input
          v-if="item.type === 'input'"
          v-model="formData[item.prop]"
          :placeholder="item.placeholder"
          clearable
        />
        
        <!-- 文本域 -->
        <el-input
          v-else-if="item.type === 'textarea'"
          v-model="formData[item.prop]"
          type="textarea"
          :placeholder="item.placeholder"
          :rows="item.rows || 3"
        />
        
        <!-- 数字输入框 -->
        <el-input-number
          v-else-if="item.type === 'number'"
          v-model="formData[item.prop]"
          :placeholder="item.placeholder"
          :min="item.min"
          :max="item.max"
          controls-position="right"
          style="width: 100%"
        />
        
        <!-- 选择器 -->
        <el-select
          v-else-if="item.type === 'select'"
          v-model="formData[item.prop]"
          :placeholder="item.placeholder"
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="option in item.options"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        
        <!-- 开关 -->
        <el-switch
          v-else-if="item.type === 'switch'"
          v-model="formData[item.prop]"
        />
        
        <!-- 日期选择器 -->
        <el-date-picker
          v-else-if="item.type === 'date'"
          v-model="formData[item.prop]"
          type="date"
          :placeholder="item.placeholder"
          style="width: 100%"
        />
        
        <!-- 日期时间选择器 -->
        <el-date-picker
          v-else-if="item.type === 'datetime'"
          v-model="formData[item.prop]"
          type="datetime"
          :placeholder="item.placeholder"
          style="width: 100%"
        />
        
        <!-- 自定义插槽 -->
        <slot v-else-if="item.slot" :name="item.slot" :item="item" :form-data="formData" />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleConfirm">
          确定
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
