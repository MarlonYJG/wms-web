<script lang="ts" setup>
import type { Warehouse } from "@@/apis/warehouse/type"
import type { StorageZone, StorageZoneForm, ZoneType } from "@@/apis/zone/type"
import type { FormRules } from "element-plus"
import { getWarehouseList } from "@@/apis/warehouse"
import { ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElInputNumber, ElOption, ElSelect, ElSwitch } from "element-plus"
import { nextTick, onMounted, reactive, ref, watch } from "vue"

interface Props {
  type: "create" | "edit"
  record?: StorageZone
  /** 父组件传入的默认仓库ID（例如查询条件中的所属仓库） */
  defaultWarehouseId?: number
}

interface Emits {
  (e: "save", data: StorageZoneForm): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = ref(false)
const formRef = ref<InstanceType<typeof ElForm>>()

const formData = reactive<StorageZoneForm>({
  warehouseId: 0,
  zoneCode: "",
  zoneName: "",
  zoneType: "STORAGE" as ZoneType,
  capacity: undefined,
  isEnabled: true
})

const rules: FormRules = {
  warehouseId: [
    { required: true, message: "请输入仓库ID", trigger: "blur" }
  ],
  zoneCode: [
    { required: true, message: "请输入库区编码", trigger: "blur" },
    { min: 1, max: 50, message: "库区编码长度在 1 到 50 个字符", trigger: "blur" }
  ],
  zoneName: [
    { required: true, message: "请输入库区名称", trigger: "blur" },
    { min: 2, max: 100, message: "库区名称长度在 2 到 100 个字符", trigger: "blur" }
  ],
  zoneType: [
    { required: true, message: "请选择库区类型", trigger: "change" }
  ]
}

const warehouseList = ref<Warehouse[]>([])
async function fetchWarehouseList() {
  const data = await getWarehouseList({
    page: 0,
    size: 1000
  })
  warehouseList.value = data.content
}
async function ensureWarehousesLoaded() {
  if (!warehouseList.value.length) {
    await fetchWarehouseList()
  }
}
onMounted(() => {
  fetchWarehouseList()
})

watch(() => props.record, (newRecord) => {
  if (newRecord) {
    nextTick(() => {
      Object.assign(formData, {
        warehouseId: newRecord.warehouseId,
        zoneCode: newRecord.zoneCode,
        zoneName: newRecord.zoneName,
        zoneType: newRecord.zoneType as ZoneType,
        capacity: newRecord.capacity,
        isEnabled: newRecord.isEnabled
      })
    })
  } else {
    resetForm()
  }
}, { immediate: true, deep: true })

function resetForm() {
  Object.assign(formData, {
    warehouseId: 0,
    zoneCode: "",
    zoneName: "",
    zoneType: "STORAGE" as ZoneType,
    capacity: undefined,
    isEnabled: true
  })
  nextTick(() => formRef.value?.clearValidate())
}

async function open() {
  await ensureWarehousesLoaded()
  if (props.record) {
    // 编辑：完整回填
    const record = props.record
    Object.assign(formData, {
      warehouseId: record!.warehouseId,
      zoneCode: record!.zoneCode,
      zoneName: record!.zoneName,
      zoneType: record!.zoneType as ZoneType,
      capacity: record!.capacity,
      isEnabled: record!.isEnabled
    })
  } else {
    // 新建：先重置再按默认值初始化，杜绝上一次编辑残留
    resetForm()
    formData.warehouseId = props.defaultWarehouseId ?? (warehouseList.value[0]?.id || 0)
    formData.zoneType = "STORAGE" as ZoneType
    formData.isEnabled = true
  }
  visible.value = true
  await nextTick()
  formRef.value?.clearValidate()
}

function close() {
  visible.value = false
  resetForm()
}

async function handleConfirm() {
  if (!formRef.value) return
  await formRef.value.validate()
  emit("save", { ...formData })
}

function handleCancel() {
  close()
}

defineExpose({ open, close })
</script>

<template>
  <ElDialog
    v-model="visible" :title="type === 'create' ? '新增库区' : '编辑库区'" width="560px" top="10vh" destroy-on-close
    :close-on-click-modal="false" @close="handleCancel"
  >
    <div>
      <ElForm ref="formRef" :model="formData" :rules="rules" label-width="90px" label-position="right">
        <ElFormItem label="所属仓库" prop="warehouseId">
          <ElSelect v-model="formData.warehouseId" placeholder="请选择所属仓库">
            <ElOption v-for="item in warehouseList" :key="item.id" :label="item.name" :value="item.id" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="库区编码" prop="zoneCode">
          <ElInput v-model="formData.zoneCode" placeholder="请输入库区编码" maxlength="50" show-word-limit />
        </ElFormItem>

        <ElFormItem label="库区名称" prop="zoneName">
          <ElInput v-model="formData.zoneName" placeholder="请输入库区名称" maxlength="100" show-word-limit />
        </ElFormItem>

        <ElFormItem label="库区类型" prop="zoneType">
          <ElSelect v-model="formData.zoneType" placeholder="请选择类型">
            <ElOption label="存储区" value="STORAGE" />
            <ElOption label="收货区" value="RECEIVING" />
            <ElOption label="拣货区" value="PICKING" />
            <ElOption label="退货区" value="RETURN" />
            <ElOption label="不良品区" value="DEFECTIVE" />
            <ElOption label="发货区" value="SHIPPING" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="容量">
          <ElInputNumber
            v-model="formData.capacity" :min="0" :step="1" :precision="2" :controls="false"
            placeholder="请输入容量"
          >
            <template #suffix>
              ㎡
            </template>
          </ElInputNumber>
        </ElFormItem>

        <ElFormItem label="状态">
          <ElSwitch v-model="formData.isEnabled" />
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
