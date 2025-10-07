<script lang="ts" setup>
import Notify from "@@/components/Notify/index.vue"
import Screenfull from "@@/components/Screenfull/index.vue"
import SearchMenu from "@@/components/SearchMenu/index.vue"
import ThemeSwitch from "@@/components/ThemeSwitch/index.vue"
import { useDevice } from "@@/composables/useDevice"
import { useLayoutMode } from "@@/composables/useLayoutMode"
import { removeLayoutsConfig } from "@@/utils/cache/local-storage"
import { Refresh, Setting, UserFilled } from "@element-plus/icons-vue"
import { useAppStore } from "@/pinia/stores/app"
import { useSettingsStore } from "@/pinia/stores/settings"
import { useUserStore } from "@/pinia/stores/user"
import { Breadcrumb, Hamburger, Sidebar } from "../index"
import SelectLayoutMode from "../Settings/SelectLayoutMode.vue"

const { isMobile } = useDevice()

const { isTop, isLeft } = useLayoutMode()

const router = useRouter()

const appStore = useAppStore()

const userStore = useUserStore()

const settingsStore = useSettingsStore()

const {
  showNotify,
  showThemeSwitch,
  showScreenfull,
  showSearchMenu,
  showTagsView,
  showLogo,
  fixedHeader,
  showFooter,
  cacheTagsView,
  showWatermark,
  showGreyMode,
  showColorWeakness
} = storeToRefs(settingsStore)

// 设置面板显示状态
const showSettingsPanel = ref(false)

/** 切换侧边栏 */
function toggleSidebar() {
  appStore.toggleSidebar(false)
}

/** 登出 */
function logout() {
  userStore.logout()
  router.push("/login")
}

/** 定义 switch 设置项 */
const switchSettings = {
  "显示标签栏": showTagsView,
  "显示 Logo": showLogo,
  "固定 Header": fixedHeader,
  "显示页脚": showFooter,
  "显示消息通知": showNotify,
  "显示切换主题按钮": showThemeSwitch,
  "显示全屏按钮": showScreenfull,
  "显示搜索按钮": showSearchMenu,
  "是否缓存标签栏": cacheTagsView,
  "开启系统水印": showWatermark,
  "显示灰色模式": showGreyMode,
  "显示色弱模式": showColorWeakness
}

// 非左侧模式时，Header 都是 fixed 布局
watchEffect(() => {
  !isLeft.value && (fixedHeader.value = true)
})

/** 重置项目配置 */
function resetLayoutsConfig() {
  removeLayoutsConfig()
  location.reload()
}
</script>

<template>
  <div class="navigation-bar">
    <Hamburger
      v-if="!isTop || isMobile"
      :is-active="appStore.sidebar.opened"
      class="hamburger"
      @toggle-click="toggleSidebar"
    />
    <Breadcrumb v-if="!isTop || isMobile" class="breadcrumb" />
    <Sidebar v-if="isTop && !isMobile" class="sidebar" />
    <div class="right-menu">
      <SearchMenu v-if="showSearchMenu" class="right-menu-item" />
      <Screenfull v-if="showScreenfull" class="right-menu-item" />
      <ThemeSwitch v-if="showThemeSwitch" class="right-menu-item" />
      <Notify v-if="showNotify" class="right-menu-item" />
      <el-dropdown>
        <div class="right-menu-item user">
          <el-avatar :icon="UserFilled" :size="30" />
          <span>{{ userStore.username }}</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="showSettingsPanel = true">
              <el-icon><Setting /></el-icon>
              布局配置
            </el-dropdown-item>
            <el-dropdown-item @click="showSettingsPanel = true">
              <el-icon><Setting /></el-icon>
              功能配置
            </el-dropdown-item>
            <el-dropdown-item divided @click="logout">
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 设置面板 -->
    <el-drawer v-model="showSettingsPanel" size="300px" :with-header="false">
      <div class="setting-container">
        <h4>布局配置</h4>
        <SelectLayoutMode />
        <el-divider />
        <h4>功能配置</h4>
        <div v-for="(settingValue, settingName, index) in switchSettings" :key="index" class="setting-item">
          <span class="setting-name">{{ settingName }}</span>
          <el-switch v-model="settingValue.value" :disabled="!isLeft && settingName === '固定 Header'" />
        </div>
        <el-button type="danger" :icon="Refresh" @click="resetLayoutsConfig">
          重 置
        </el-button>
      </div>
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
@import "@@/assets/styles/mixins.scss";

.navigation-bar {
  height: var(--wms-navigationbar-height);
  overflow: hidden;
  color: var(--wms-navigationbar-text-color);
  display: flex;
  justify-content: space-between;
  .hamburger {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 15px;
    cursor: pointer;
  }
  .breadcrumb {
    flex: 1;
    // 参考 Bootstrap 的响应式设计将宽度设置为 576
    @media screen and (max-width: 576px) {
      display: none;
    }
  }
  .sidebar {
    flex: 1;
    // 设置 min-width 是为了让 Sidebar 里的 el-menu 宽度自适应
    min-width: 0px;
    :deep(.el-menu) {
      background-color: transparent;
    }
    :deep(.el-sub-menu) {
      &.is-active {
        .el-sub-menu__title {
          color: var(--el-color-primary);
        }
      }
    }
  }
  .right-menu {
    margin-right: 10px;
    height: 100%;
    display: flex;
    align-items: center;
    &-item {
      margin: 0 10px;
      cursor: pointer;
      &:last-child {
        margin-left: 20px;
      }
    }
    .user {
      display: flex;
      align-items: center;
      .el-avatar {
        margin-right: 10px;
      }
      span {
        font-size: 16px;
      }
    }
  }
}

.setting-container {
  padding: 20px;
  .setting-item {
    font-size: 14px;
    color: var(--el-text-color-regular);
    padding: 5px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .setting-name {
      @extend %ellipsis;
    }
  }
  .el-button {
    margin-top: 40px;
    width: 100%;
  }
}
</style>
