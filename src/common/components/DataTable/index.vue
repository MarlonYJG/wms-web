<script lang="ts" setup>
import { ElButton, ElInput, ElOption, ElPagination, ElSelect, ElTable, ElTableColumn } from "element-plus"
import { computed, ref } from "vue"

interface Props {
  data: any[]
  loading?: boolean
  total?: number
  page?: number
  size?: number
  columns: Array<{
    prop: string
    label: string
    width?: number | string
    fixed?: boolean | string
    formatter?: (row: any, column: any, cellValue: any) => string
    slot?: string
  }>
  showPagination?: boolean
  showSearch?: boolean
  searchFields?: Array<{
    prop: string
    label: string
    type: "input" | "select"
    options?: Array<{ label: string, value: any }>
    placeholder?: string
  }>
}

interface Emits {
  (e: "page-change", page: number): void
  (e: "size-change", size: number): void
  (e: "search", params: Record<string, any>): void
  (e: "reset"): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  total: 0,
  page: 1,
  size: 10,
  showPagination: true,
  showSearch: false,
  searchFields: () => []
})

const emit = defineEmits<Emits>()

// 搜索表单数据
const searchForm = ref<Record<string, any>>({})

// 初始化搜索表单
function initSearchForm() {
  const form: Record<string, any> = {}
  props.searchFields.forEach((field) => {
    form[field.prop] = ""
  })
  searchForm.value = form
}

// 搜索
function handleSearch() {
  emit("search", { ...searchForm.value })
}

// 重置搜索
function handleReset() {
  initSearchForm()
  emit("reset")
}

// 分页变化
function handlePageChange(page: number) {
  emit("page-change", page)
}

function handleSizeChange(size: number) {
  emit("size-change", size)
}

// 初始化
initSearchForm()
</script>

<template>
  <div class="data-table-container">
    <!-- 搜索表单 -->
    <div v-if="showSearch && searchFields.length > 0" class="search-form">
      <el-form :model="searchForm" inline>
        <el-form-item
          v-for="field in searchFields"
          :key="field.prop"
          :label="field.label"
        >
          <ElInput
            v-if="field.type === 'input'"
            v-model="searchForm[field.prop]"
            :placeholder="field.placeholder || `请输入${field.label}`"
            clearable
            @keyup.enter="handleSearch"
          />
          <ElSelect
            v-else-if="field.type === 'select'"
            v-model="searchForm[field.prop]"
            :placeholder="field.placeholder || `请选择${field.label}`"
            clearable
          >
            <ElOption
              v-for="option in field.options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </ElSelect>
        </el-form-item>
        <el-form-item>
          <ElButton type="primary" @click="handleSearch">
            搜索
          </ElButton>
          <ElButton @click="handleReset">
            重置
          </ElButton>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <ElTable :data="data" v-loading="loading" stripe>
      <ElTableColumn
        v-for="column in columns"
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
        :width="column.width"
        :fixed="column.fixed"
        :formatter="column.formatter"
      >
        <template v-if="column.slot" #default="scope">
          <slot :name="column.slot" :row="scope.row" :column="scope.column" :value="scope.row[column.prop]" />
        </template>
      </ElTableColumn>

      <!-- 操作列插槽 -->
      <slot name="actions" />
    </ElTable>

    <!-- 分页 -->
    <div v-if="showPagination" class="pagination-container">
      <ElPagination
        v-model:current-page="page"
        v-model:page-size="size"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.data-table-container {
  .search-form {
    background-color: #f5f7fa;
    padding: 20px;
    border-radius: 4px;
    margin-bottom: 20px;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}
</style>
