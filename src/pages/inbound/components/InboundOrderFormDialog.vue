<script lang="ts" setup>
import { ref, reactive, watch, nextTick } from "vue"
import { ElDialog, ElForm, ElFormItem, ElInput, ElInputNumber, ElButton, ElTable, ElTableColumn, ElMessage } from "element-plus"
import type { InboundOrder, InboundOrderForm } from "@/common/apis/inbound/type"

interface Props {
  type: 'create' | 'edit'
  record?: InboundOrder
}

interface Emits {
  (e: 'save', data: InboundOrderForm): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 对话框状态
const visible = ref(false)
const formRef = ref<InstanceType<typeof ElForm>>()

// 表单数据
const formData = reactive<InboundOrderForm>({
  warehouseId: 0,
  supplierId: 0,
  items: []
})

// 表单验证规则
const rules = {
  warehouseId: [
    { required: true, message: "请选择仓库", trigger: "change" }
  ],
  supplierId: [
    { required: true, message: "请选择供应商", trigger: "change" }
  ]
}

// 监听记录变化，填充表单数据
watch(() => props.record, (newRecord) => {
  if (newRecord) {
    Object.assign(formData, {
      warehouseId: newRecord.warehouseId,
      supplierId: newRecord.supplierId,
      items: newRecord.items.map(item => ({
        productSkuId: item.productSkuId,
        expectedQuantity: item.expectedQuantity
      }))
    })
  } else {
    resetForm()
  }
}, { immediate: true })

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    warehouseId: 0,
    supplierId: 0,
    items: []
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

// 添加商品
const addItem = () => {
  formData.items.push({
    productSkuId: 0,
    expectedQuantity: 0
  })
}

// 删除商品
const removeItem = (index: number) => {
  formData.items.splice(index, 1)
}

// 确认保存
const handleConfirm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    if (formData.items.length === 0) {
      ElMessage.error("请至少添加一个商品")
      return
    }
    
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
    :title="type === 'create' ? '新增入库单' : '编辑入库单'"
    width="800px"
    @close="handleCancel"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="仓库ID" prop="warehouseId">
        <el-input-number
          v-model="formData.warehouseId"
          placeholder="请输入仓库ID"
          :min="1"
          controls-position="right"
          style="width: 100%"
        />
      </el-form-item>
      
      <el-form-item label="供应商ID" prop="supplierId">
        <el-input-number
          v-model="formData.supplierId"
          placeholder="请输入供应商ID"
          :min="1"
          controls-position="right"
          style="width: 100%"
        />
      </el-form-item>
      
      <el-form-item label="商品明细">
        <div class="items-container">
          <div class="items-header">
            <span>商品明细</span>
            <el-button type="primary" size="small" @click="addItem">添加商品</el-button>
          </div>
          
          <el-table :data="formData.items" style="width: 100%" max-height="300">
            <el-table-column label="商品SKU ID" width="150">
              <template #default="{ row, $index }">
                <el-input-number
                  v-model="row.productSkuId"
                  :min="1"
                  controls-position="right"
                  style="width: 100%"
                />
              </template>
            </el-table-column>
            <el-table-column label="预期数量" width="150">
              <template #default="{ row, $index }">
                <el-input-number
                  v-model="row.expectedQuantity"
                  :min="1"
                  controls-position="right"
                  style="width: 100%"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ row, $index }">
                <el-button type="danger" size="small" @click="removeItem($index)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
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
.items-container {
  .items-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
