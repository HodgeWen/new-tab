<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useSettingsStore } from '@/stores/settings'
import { useWallpaperStore } from '@/stores/wallpaper'
import { useBookmarkStore } from '@/stores/bookmarks'
import { webdavService } from '@/services/webdav'
import { db } from '@/services/database'

const uiStore = useUIStore()
const settingsStore = useSettingsStore()
const wallpaperStore = useWallpaperStore()
const bookmarkStore = useBookmarkStore()

// 当前标签页
const activeTab = ref<'general' | 'wallpaper' | 'backup'>('general')

// WebDAV 配置
const webdavUrl = ref('')
const webdavUsername = ref('')
const webdavPassword = ref('')
const webdavTesting = ref(false)
const webdavConnected = ref(false)
const webdavMessage = ref('')

// 备份列表
const backupList = ref<
  Array<{ name: string; path: string; lastModified: Date; size: number }>
>([])
const backupLoading = ref(false)

// 是否显示面板
const isVisible = computed(() => uiStore.settingsPanelOpen)

// 关闭面板
function closePanel() {
  uiStore.closeSettingsPanel()
}

// 切换搜索栏
async function toggleSearchBar() {
  await settingsStore.toggleSearchBar()
}

// 更新壁纸设置
async function updateWallpaperEnabled(enabled: boolean) {
  await settingsStore.updateWallpaperSettings({ enabled })
  if (enabled) {
    await wallpaperStore.loadWallpaper()
  }
}

async function updateWallpaperInterval(interval: number) {
  await settingsStore.updateWallpaperSettings({ interval })
}

// 切换壁纸
async function switchWallpaper() {
  await wallpaperStore.switchToNext()
}

// 测试 WebDAV 连接
async function testWebdavConnection() {
  webdavTesting.value = true
  webdavMessage.value = ''

  const result = await webdavService.testConnection(
    webdavUrl.value,
    webdavUsername.value,
    webdavPassword.value
  )

  webdavTesting.value = false
  webdavConnected.value = result.success
  webdavMessage.value = result.message

  if (result.success) {
    // 保存配置
    await webdavService.saveConfig({
      url: webdavUrl.value,
      username: webdavUsername.value,
      password: webdavPassword.value
    })
    await settingsStore.updateWebDAVSettings({
      enabled: true,
      url: webdavUrl.value,
      username: webdavUsername.value
    })
    // 连接并加载备份列表
    await webdavService.connect(
      webdavUrl.value,
      webdavUsername.value,
      webdavPassword.value
    )
    await loadBackupList()
  }
}

// 加载备份列表
async function loadBackupList() {
  backupLoading.value = true
  backupList.value = await webdavService.listBackups()
  backupLoading.value = false
}

// 创建备份
async function createBackup() {
  backupLoading.value = true
  const result = await webdavService.backup()
  if (result.success) {
    webdavMessage.value = `备份成功: ${result.filename}`
    await loadBackupList()
  } else {
    webdavMessage.value = result.message || '备份失败'
  }
  backupLoading.value = false
}

// 恢复备份
async function restoreBackup(filepath: string) {
  if (!confirm('确定要恢复此备份吗？当前数据将被覆盖。')) return

  backupLoading.value = true
  const result = await webdavService.restore(filepath)
  if (result.success) {
    webdavMessage.value = '恢复成功，请刷新页面'
    await bookmarkStore.loadBookmarks()
    await settingsStore.loadSettings()
  } else {
    webdavMessage.value = result.message || '恢复失败'
  }
  backupLoading.value = false
}

// 删除备份
async function deleteBackup(filepath: string) {
  if (!confirm('确定要删除此备份吗？')) return

  const success = await webdavService.deleteBackup(filepath)
  if (success) {
    await loadBackupList()
  }
}

// 导出本地数据
async function exportLocalData() {
  const data = await db.exportData()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `new-tab-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// 导入本地数据
async function importLocalData() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async e => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return

    const text = await file.text()
    const success = await db.importData(text)
    if (success) {
      await bookmarkStore.loadBookmarks()
      await settingsStore.loadSettings()
      alert('导入成功！')
    } else {
      alert('导入失败：数据格式无效')
    }
  }
  input.click()
}

// 初始化
watch(isVisible, async visible => {
  if (visible) {
    // 尝试自动连接 WebDAV
    if (settingsStore.settings.webdav.enabled) {
      webdavUrl.value = settingsStore.settings.webdav.url
      webdavUsername.value = settingsStore.settings.webdav.username
      const connected = await webdavService.autoConnect()
      webdavConnected.value = connected
      if (connected) {
        await loadBackupList()
      }
    }
  }
})

// 格式化文件大小
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

// 格式化日期
function formatDate(date: Date): string {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isVisible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        @click.self="closePanel"
      >
        <div
          class="w-full max-w-2xl max-h-[80vh] mx-4 rounded-2xl glass overflow-hidden flex flex-col"
        >
          <!-- 标题栏 -->
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-white/10"
          >
            <h2 class="text-xl font-semibold text-white">设置</h2>
            <button
              class="p-2 rounded-lg hover:bg-white/10 transition-colors"
              @click="closePanel"
            >
              <div class="i-lucide-x w-5 h-5 text-white/70" />
            </button>
          </div>

          <!-- 标签页导航 -->
          <div class="flex border-b border-white/10">
            <button
              v-for="tab in [
                { key: 'general', label: '通用', icon: 'i-lucide-settings' },
                { key: 'wallpaper', label: '壁纸', icon: 'i-lucide-image' },
                { key: 'backup', label: '备份', icon: 'i-lucide-cloud' }
              ]"
              :key="tab.key"
              class="flex-1 px-4 py-3 flex items-center justify-center gap-2 text-sm transition-colors"
              :class="
                activeTab === tab.key
                  ? 'text-white bg-white/10'
                  : 'text-white/60 hover:text-white/80'
              "
              @click="activeTab = tab.key as typeof activeTab"
            >
              <div :class="tab.icon" class="w-4 h-4" />
              {{ tab.label }}
            </button>
          </div>

          <!-- 内容区域 -->
          <div class="flex-1 overflow-y-auto p-6">
            <!-- 通用设置 -->
            <div v-show="activeTab === 'general'" class="space-y-6">
              <!-- 搜索栏显示 -->
              <div class="flex items-center justify-between">
                <div>
                  <label class="text-sm text-white/70">显示搜索栏</label>
                  <p class="text-xs text-white/50">在页面顶部显示搜索输入框</p>
                </div>
                <button
                  class="w-12 h-6 rounded-full transition-colors relative"
                  :class="
                    settingsStore.settings.showSearchBar
                      ? 'bg-blue-500'
                      : 'bg-white/20'
                  "
                  @click="toggleSearchBar"
                >
                  <div
                    class="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform"
                    :class="
                      settingsStore.settings.showSearchBar ? 'left-7' : 'left-1'
                    "
                  />
                </button>
              </div>
            </div>

            <!-- 壁纸设置 -->
            <div v-show="activeTab === 'wallpaper'" class="space-y-6">
              <!-- 启用壁纸 -->
              <div class="flex items-center justify-between">
                <div>
                  <label class="text-sm text-white/70">启用背景壁纸</label>
                  <p class="text-xs text-white/50">使用 Picsum 随机壁纸</p>
                </div>
                <button
                  class="w-12 h-6 rounded-full transition-colors relative"
                  :class="
                    settingsStore.settings.wallpaper.enabled
                      ? 'bg-blue-500'
                      : 'bg-white/20'
                  "
                  @click="
                    updateWallpaperEnabled(
                      !settingsStore.settings.wallpaper.enabled
                    )
                  "
                >
                  <div
                    class="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform"
                    :class="
                      settingsStore.settings.wallpaper.enabled
                        ? 'left-7'
                        : 'left-1'
                    "
                  />
                </button>
              </div>

              <template v-if="settingsStore.settings.wallpaper.enabled">
                <!-- 轮播间隔 -->
                <div class="space-y-2">
                  <label class="text-sm text-white/70">轮播间隔</label>
                  <select
                    class="w-full px-4 py-2 rounded-xl bg-white/10 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
                    :value="settingsStore.settings.wallpaper.interval"
                    @change="
                      updateWallpaperInterval(
                        Number(($event.target as HTMLSelectElement).value)
                      )
                    "
                  >
                    <option value="15">15 分钟</option>
                    <option value="30">30 分钟</option>
                    <option value="60">1 小时</option>
                    <option value="180">3 小时</option>
                    <option value="360">6 小时</option>
                    <option value="720">12 小时</option>
                    <option value="1440">24 小时</option>
                  </select>
                </div>

                <!-- 手动切换 -->
                <button
                  class="w-full px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center justify-center gap-2"
                  :disabled="wallpaperStore.loading"
                  @click="switchWallpaper"
                >
                  <div
                    class="i-lucide-refresh-cw w-4 h-4"
                    :class="{ 'animate-spin': wallpaperStore.loading }"
                  />
                  换一张壁纸
                </button>
              </template>
            </div>

            <!-- 备份设置 -->
            <div v-show="activeTab === 'backup'" class="space-y-6">
              <!-- 本地备份 -->
              <div class="space-y-3">
                <label class="text-sm text-white/70">本地备份</label>
                <div class="flex gap-3">
                  <button
                    class="flex-1 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center justify-center gap-2"
                    @click="exportLocalData"
                  >
                    <div class="i-lucide-download w-4 h-4" />
                    导出数据
                  </button>
                  <button
                    class="flex-1 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center justify-center gap-2"
                    @click="importLocalData"
                  >
                    <div class="i-lucide-upload w-4 h-4" />
                    导入数据
                  </button>
                </div>
              </div>

              <!-- WebDAV 配置 -->
              <div class="space-y-3">
                <label class="text-sm text-white/70">WebDAV 云备份</label>
                <input
                  v-model="webdavUrl"
                  type="url"
                  placeholder="WebDAV 服务器地址"
                  class="w-full px-4 py-2 rounded-xl bg-white/10 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                <div class="flex gap-3">
                  <input
                    v-model="webdavUsername"
                    type="text"
                    placeholder="用户名"
                    class="flex-1 px-4 py-2 rounded-xl bg-white/10 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
                  />
                  <input
                    v-model="webdavPassword"
                    type="password"
                    placeholder="密码"
                    class="flex-1 px-4 py-2 rounded-xl bg-white/10 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
                  />
                </div>
                <button
                  class="w-full px-4 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  :disabled="
                    webdavTesting ||
                    !webdavUrl ||
                    !webdavUsername ||
                    !webdavPassword
                  "
                  @click="testWebdavConnection"
                >
                  <div
                    v-if="webdavTesting"
                    class="i-lucide-loader-2 w-4 h-4 animate-spin"
                  />
                  <div
                    v-else-if="webdavConnected"
                    class="i-lucide-check w-4 h-4"
                  />
                  <div v-else class="i-lucide-plug w-4 h-4" />
                  {{
                    webdavTesting
                      ? '连接中...'
                      : webdavConnected
                        ? '已连接'
                        : '测试连接'
                  }}
                </button>
                <p
                  v-if="webdavMessage"
                  class="text-xs"
                  :class="webdavConnected ? 'text-green-400' : 'text-red-400'"
                >
                  {{ webdavMessage }}
                </p>
              </div>

              <!-- WebDAV 备份操作 -->
              <template v-if="webdavConnected">
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <label class="text-sm text-white/70">云端备份</label>
                    <button
                      class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors flex items-center gap-2"
                      :disabled="backupLoading"
                      @click="createBackup"
                    >
                      <div class="i-lucide-cloud-upload w-4 h-4" />
                      立即备份
                    </button>
                  </div>

                  <!-- 备份列表 -->
                  <div class="max-h-48 overflow-y-auto rounded-xl bg-white/5">
                    <div
                      v-if="backupLoading"
                      class="p-4 text-center text-white/50"
                    >
                      加载中...
                    </div>
                    <div
                      v-else-if="backupList.length === 0"
                      class="p-4 text-center text-white/50"
                    >
                      暂无备份
                    </div>
                    <div
                      v-for="backup in backupList"
                      :key="backup.path"
                      class="px-4 py-3 flex items-center justify-between border-b border-white/5 last:border-0 hover:bg-white/5"
                    >
                      <div>
                        <p class="text-sm text-white/80">{{ backup.name }}</p>
                        <p class="text-xs text-white/50">
                          {{ formatDate(backup.lastModified) }} ·
                          {{ formatSize(backup.size) }}
                        </p>
                      </div>
                      <div class="flex gap-2">
                        <button
                          class="p-2 rounded-lg hover:bg-white/10 transition-colors"
                          title="恢复"
                          @click="restoreBackup(backup.path)"
                        >
                          <div
                            class="i-lucide-download w-4 h-4 text-white/70"
                          />
                        </button>
                        <button
                          class="p-2 rounded-lg hover:bg-white/10 transition-colors"
                          title="删除"
                          @click="deleteBackup(backup.path)"
                        >
                          <div class="i-lucide-trash-2 w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
select option {
  background: #1a1a2e;
  color: white;
}
</style>
