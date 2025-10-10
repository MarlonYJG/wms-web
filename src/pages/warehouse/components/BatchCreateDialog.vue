<template>
  <el-dialog v-model="visible" title="批量生成库位" width="560px" :close-on-click-modal="false">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="库区">
        <el-input :model-value="zoneId ? String(zoneId) : ''" disabled placeholder="请选择左侧库区" />
      </el-form-item>
      <el-form-item label="库位类型" prop="locationType">
        <el-select v-model="form.locationType" placeholder="请选择">
          <el-option v-for="opt in LOCATION_TYPE_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="单个位容量">
        <el-input-number v-model="form.capacity" :min="0" :precision="2" :step="10" controls-position="right" />
      </el-form-item>

      <el-form-item label="排范围" required>
        <el-input-number v-model="form.startRow" :min="1" />
        <span class="range-sep">-</span>
        <el-input-number v-model="form.endRow" :min="form.startRow || 1" />
      </el-form-item>
      <el-form-item label="层范围" required>
        <el-input-number v-model="form.startLevel" :min="1" />
        <span class="range-sep">-</span>
        <el-input-number v-model="form.endLevel" :min="form.startLevel || 1" />
      </el-form-item>
      <el-form-item label="位范围" required>
        <el-input-number v-model="form.startPosition" :min="1" />
        <span class="range-sep">-</span>
        <el-input-number v-model="form.endPosition" :min="form.startPosition || 1" />
      </el-form-item>
      <el-form-item label="库区前缀">
        <el-input v-model="form.zoneCodePrefix" placeholder="如 A（可选）" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="submit">生成</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus"
import type { BatchCreateLocationForm, LocationType } from "@@/apis/location/type"
import { reactive, ref, watch } from "vue"

const props = defineProps<{ zoneId?: number }>()
const emit = defineEmits<{ (e: "confirm", form: BatchCreateLocationForm): void }>()

const visible = ref(false)
const formRef = ref<FormInstance>()

const LOCATION_TYPE_OPTIONS: Array<{ label: string, value: LocationType }> = [
  { label: "货架位", value: "SHELF" },
  { label: "地面位", value: "FLOOR" },
  { label: "冷藏位", value: "COLD" },
  { label: "危险品位", value: "DANGEROUS" }
]

const form = reactive<BatchCreateLocationForm>({
  zoneId: props.zoneId || 0,
  locationType: undefined,
  capacity: undefined,
  startRow: 1,
  endRow: 1,
  startLevel: 1,
  endLevel: 1,
  startPosition: 1,
  endPosition: 1,
  zoneCodePrefix: ""
})

const rules = reactive<FormRules<BatchCreateLocationForm>>({
  locationType: [{ required: true, message: "请选择库位类型", trigger: "change" }]
})

watch(() => props.zoneId, (v) => { if (v) form.zoneId = v })

function open() { visible.value = true }
function close() { visible.value = false }

async function submit() {
  if (!formRef.value) return
  await formRef.value.validate()
  emit("confirm", { ...form, zoneId: form.zoneId })
}

defineExpose({ open, close })
</script>

<style scoped>
.range-sep {
  margin: 0 8px;
}
</style>


