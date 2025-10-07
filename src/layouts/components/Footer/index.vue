<script lang="ts" setup>
const VITE_APP_TITLE = import.meta.env.VITE_APP_TITLE
</script>

<template>
  <footer class="layout-footer">
    MIT © 2024-PRESENT {{ VITE_APP_TITLE }}
  </footer>
</template>

<style lang="scss" scoped>
.layout-footer {
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-placeholder);
  background-color: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-light);
  flex-shrink: 0;
}
</style>
