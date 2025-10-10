<template>
  <el-dialog v-model="visible" :title="dialogTitle" width="540px" :close-on-click-modal="false">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
      <el-form-item label="库区">
        <div class="zone-text">{{ zoneDisplayName || '请选择左侧库区' }}</div>
      </el-form-item>
      <el-form-item label="库位编码" prop="locationCode">
        <el-input v-model="form.locationCode" placeholder="如 A-01-01-01" clearable />
      </el-form-item>
      <el-form-item label="库位名称">
        <el-input v-model="form.locationName" placeholder="可选" clearable />
      </el-form-item>
      <el-form-item label="库位类型" prop="locationType">
        <el-select v-model="form.locationType" placeholder="请选择" clearable>
          <el-option v-for="opt in LOCATION_TYPE_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="容量">
        <el-input-number v-model="form.capacity" :min="0" :step="1" :precision="2" :controls="false" placeholder="请输入容量">
          <template #suffix>㎡</template>
        </el-input-number>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="form.status" placeholder="请选择">
          <el-option label="空闲" value="AVAILABLE" />
          <el-option label="占用" value="OCCUPIED" />
          <el-option label="禁用" value="DISABLED" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="submit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus"
import type { LocationType, StorageLocation, StorageLocationForm } from "@@/apis/location/type"
import { computed, reactive, ref, watch } from "vue"

const props = defineProps<{
  type: "create" | "edit"
  record?: StorageLocation
  zoneId?: number
  zoneDisplayName?: string
}>()

const emit = defineEmits<{
  (e: "save", form: StorageLocationForm): void
}>()

const visible = ref(false)
const formRef = ref<FormInstance>()

const LOCATION_TYPE_OPTIONS: Array<{ label: string, value: LocationType }> = [
  { label: "货架位", value: "SHELF" },
  { label: "地面位", value: "FLOOR" },
  { label: "冷藏位", value: "COLD" },
  { label: "危险品位", value: "DANGEROUS" }
]

const form = reactive<StorageLocationForm>({
  zoneId: props.zoneId || 0,
  locationCode: "",
  locationName: "",
  locationType: undefined,
  capacity: undefined,
  status: "AVAILABLE"
})

const rules = reactive<FormRules<StorageLocationForm>>({
  locationCode: [{ required: true, message: "请输入库位编码", trigger: "blur" }],
  locationType: [{ required: true, message: "请选择库位类型", trigger: "change" }]
})

const isEdit = computed(() => props.type === "edit")
const dialogTitle = computed(() => (isEdit.value ? "编辑库位" : "新增库位"))

watch(() => props.zoneId, (v) => { if (v) form.zoneId = v })
watch(() => props.type, (v) => {
  if (v === "create") reset()
})

watch(() => props.record, (rec) => {
  if (rec && isEdit.value) {
    form.zoneId = rec.zoneId
    form.locationCode = rec.locationCode
    form.locationName = rec.locationName
    form.locationType = rec.locationType
    form.capacity = rec.capacity
    form.status = rec.status
  }
})

function reset() {
  form.zoneId = props.zoneId || 0
  form.locationCode = ""
  form.locationName = ""
  form.locationType = undefined
  form.capacity = undefined
  form.status = "AVAILABLE"
}

function open() {
  visible.value = true
}

function close() {
  visible.value = false
}

async function submit() {
  if (!formRef.value) return
  await formRef.value.validate()
  emit("save", { ...form, zoneId: form.zoneId })
}

defineExpose({ open, close })
</script>

<style scoped>
</style>


