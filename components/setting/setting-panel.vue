<template>
  <Dialog v-model:open="visible">
    <DialogContent
      class="glass-dialog max-w-2xl h-[520px] max-h-[80vh] p-0 text-white border-white/25 bg-black/50 backdrop-blur-2xl overflow-hidden flex flex-col shadow-2xl"
    >
      <DialogHeader
        class="px-6 py-4 border-b border-white/15 shrink-0 bg-white/5"
      >
        <DialogTitle class="text-xl font-semibold text-white">设置</DialogTitle>
        <DialogDescription class="sr-only">
          配置新标签页的各项设置
        </DialogDescription>
      </DialogHeader>

      <Tabs
        v-model="activeTab"
        class="flex flex-col flex-1 min-h-0 overflow-hidden"
      >
        <TabsList
          class="flex bg-black/20 rounded-none h-auto mx-4 py-2 rounded-lg shrink-0"
        >
          <TabsTrigger
            value="general"
            class="flex-1 px-4 py-2.5 flex items-center justify-center gap-2 text-sm rounded-md data-[state=active]:bg-white/15 data-[state=active]:text-white data-[state=active]:shadow-sm text-white/60 hover:text-white/80 transition-all"
          >
            <Settings class="size-4" />
            通用
          </TabsTrigger>
          <TabsTrigger
            value="wallpaper"
            class="flex-1 px-4 py-2.5 flex items-center justify-center gap-2 text-sm rounded-md data-[state=active]:bg-white/15 data-[state=active]:text-white data-[state=active]:shadow-sm text-white/60 hover:text-white/80 transition-all"
          >
            <Image class="size-4" />
            壁纸
          </TabsTrigger>
          <TabsTrigger
            value="backup"
            class="flex-1 px-4 py-2.5 flex items-center justify-center gap-2 text-sm rounded-md data-[state=active]:bg-white/15 data-[state=active]:text-white data-[state=active]:shadow-sm text-white/60 hover:text-white/80 transition-all"
          >
            <Cloud class="size-4" />
            备份
          </TabsTrigger>
        </TabsList>

        <div class="flex-1 min-h-0 overflow-y-auto p-6 bg-white/[0.03]">
          <!-- 通用设置 -->
          <TabsContent value="general" class="mt-0 space-y-6">
            <!-- 搜索栏显示 -->
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm text-white/70">显示搜索栏</label>
                <p class="text-xs text-white/50">在页面顶部显示搜索输入框</p>
              </div>
              <Switch
                :model-value="settingsStore.settings.showSearchBar"
                class="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-white/20"
                @update:model-value="toggleSearchBar"
              />
            </div>
          </TabsContent>

          <!-- 壁纸设置 -->
          <TabsContent value="wallpaper" class="mt-0 space-y-6">
            <!-- 启用壁纸 -->
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm text-white/70">启用背景壁纸</label>
              </div>
              <Switch
                :model-value="settingsStore.settings.wallpaper.enabled"
                class="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-white/20"
                @update:model-value="updateWallpaperEnabled"
              />
            </div>

            <template v-if="settingsStore.settings.wallpaper.enabled">
              <div class="space-y-2">
                <label class="text-sm text-white/70">壁纸来源</label>
                <Select
                  :model-value="
                    settingsStore.settings.wallpaper.source || 'bing'
                  "
                  @update:model-value="updateWallpaperSource"
                >
                  <SelectTrigger
                    class="w-full bg-white/10 border-white/10 text-white focus:ring-white/20"
                  >
                    <SelectValue placeholder="选择壁纸来源" />
                  </SelectTrigger>
                  <SelectContent class="glass border-white/15 text-white">
                    <SelectItem
                      v-for="src in wallpaperSources"
                      :key="src.id"
                      :value="src.id"
                      class="focus:bg-white/20 focus:text-white"
                    >
                      {{ src.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <!-- 轮播间隔 -->
              <div class="space-y-2">
                <label class="text-sm text-white/70">轮播间隔</label>
                <Select
                  :model-value="
                    String(settingsStore.settings.wallpaper.interval)
                  "
                  @update:model-value="updateWallpaperInterval"
                >
                  <SelectTrigger
                    class="w-full bg-white/10 border-white/10 text-white focus:ring-white/20"
                  >
                    <SelectValue placeholder="选择轮播间隔" />
                  </SelectTrigger>
                  <SelectContent class="glass border-white/15 text-white">
                    <SelectItem
                      value="15"
                      class="focus:bg-white/20 focus:text-white"
                      >15 分钟</SelectItem
                    >
                    <SelectItem
                      value="30"
                      class="focus:bg-white/20 focus:text-white"
                      >30 分钟</SelectItem
                    >
                    <SelectItem
                      value="60"
                      class="focus:bg-white/20 focus:text-white"
                      >1 小时</SelectItem
                    >
                    <SelectItem
                      value="180"
                      class="focus:bg-white/20 focus:text-white"
                      >3 小时</SelectItem
                    >
                    <SelectItem
                      value="360"
                      class="focus:bg-white/20 focus:text-white"
                      >6 小时</SelectItem
                    >
                    <SelectItem
                      value="720"
                      class="focus:bg-white/20 focus:text-white"
                      >12 小时</SelectItem
                    >
                    <SelectItem
                      value="1440"
                      class="focus:bg-white/20 focus:text-white"
                      >24 小时</SelectItem
                    >
                  </SelectContent>
                </Select>
              </div>

              <!-- 手动切换 -->
              <Button
                variant="glass"
                class="w-full"
                :disabled="wallpaperStore.loading"
                @click="switchWallpaper"
              >
                <RefreshCw
                  class="size-4"
                  :class="{ 'animate-spin': wallpaperStore.loading }"
                />
                换一张壁纸
              </Button>
            </template>
          </TabsContent>

          <!-- 备份设置 -->
          <TabsContent value="backup" class="mt-0 space-y-4">
            <!-- 本地备份 -->
            <div class="space-y-2">
              <label class="text-sm text-white/70">本地备份</label>
              <div class="flex gap-2">
                <Button variant="glass" class="flex-1" @click="exportLocalData">
                  <Download class="size-4" />
                  导出数据
                </Button>
                <Button variant="glass" class="flex-1" @click="importLocalData">
                  <Upload class="size-4" />
                  导入数据
                </Button>
              </div>
            </div>

            <!-- WebDAV 配置 -->
            <div class="space-y-2">
              <label class="text-sm text-white/70">WebDAV 云备份</label>
              <Input
                v-model="webdavUrl"
                type="url"
                placeholder="WebDAV 服务器地址"
                class="bg-white/10 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-white/20"
              />
              <div class="flex gap-2">
                <Input
                  v-model="webdavUsername"
                  type="text"
                  placeholder="用户名"
                  class="flex-1 bg-white/10 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-white/20"
                />
                <Input
                  v-model="webdavPassword"
                  type="password"
                  placeholder="密码"
                  class="flex-1 bg-white/10 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-white/20"
                />
              </div>
              <Button
                class="w-full bg-blue-500 hover:bg-blue-600 text-white"
                :disabled="
                  webdavTesting ||
                  !webdavUrl ||
                  !webdavUsername ||
                  !webdavPassword
                "
                @click="testWebdavConnection"
              >
                <Loader2 v-if="webdavTesting" class="size-4 animate-spin" />
                <Check v-else-if="webdavConnected" class="size-4" />
                <Plug v-else class="size-4" />
                {{
                  webdavTesting
                    ? '连接中...'
                    : webdavConnected
                      ? '已连接'
                      : '测试连接'
                }}
              </Button>
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
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="text-sm text-white/70">云端备份</label>
                  <Button
                    variant="glass"
                    size="sm"
                    :disabled="backupLoading"
                    @click="createBackup"
                  >
                    <CloudUpload class="size-3.5" />
                    立即备份
                  </Button>
                </div>

                <!-- 备份列表 -->
                <div class="max-h-36 overflow-y-auto rounded-lg bg-white/5">
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
                    class="px-3 py-2 flex items-center justify-between border-b border-white/5 last:border-0 hover:bg-white/5"
                  >
                    <div>
                      <p class="text-sm text-white/80">{{ backup.name }}</p>
                      <p class="text-xs text-white/50">
                        {{ formatDate(backup.lastModified) }} ·
                        {{ formatSize(backup.size) }}
                      </p>
                    </div>
                    <div class="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        class="hover:bg-white/10 text-white/70"
                        title="恢复"
                        @click="restoreBackup(backup.path)"
                      >
                        <Download class="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        class="hover:bg-white/10 text-red-400"
                        title="删除"
                        @click="deleteBackup(backup.path)"
                      >
                        <Trash2 class="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </TabsContent>
        </div>
      </Tabs>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useWallpaperStore } from '@/stores/wallpaper'
import { useGridItemStore } from '@/stores/grid-items'
import { webdavService } from '@/services/webdav'
import { wallpaperService } from '@/services/wallpaper'
import { db } from '@/services/database'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/shadcn/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shadcn/ui/tabs'
import { Switch } from '@/shadcn/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shadcn/ui/select'
import { Button } from '@/shadcn/ui/button'
import { Input } from '@/shadcn/ui/input'
import {
  Settings,
  Image,
  Cloud,
  RefreshCw,
  Download,
  Upload,
  Plug,
  Check,
  Loader2,
  CloudUpload,
  Trash2
} from 'lucide-vue-next'
import { BackupData } from '@/types'

const settingsStore = useSettingsStore()
const wallpaperStore = useWallpaperStore()
const gridItemStore = useGridItemStore()

// 当前标签页
const activeTab = ref<string>('general')

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
const visible = ref(false)

// 切换搜索栏
function toggleSearchBar(checked: boolean) {
  settingsStore.settings.showSearchBar = checked
}

// 更新壁纸设置
async function updateWallpaperEnabled(enabled: boolean) {
  settingsStore.settings.wallpaper.enabled = enabled
  if (enabled) {
    await wallpaperStore.loadWallpaper()
  }
}

async function updateWallpaperSource(source: unknown) {
  if (!source) return
  settingsStore.settings.wallpaper.source = String(source) as any
  await wallpaperStore.fetchNewWallpaper()
}

async function updateWallpaperInterval(interval: unknown) {
  if (!interval) return
  settingsStore.settings.wallpaper.interval = Number(interval)
}

// 切换壁纸
async function switchWallpaper() {
  await wallpaperStore.switchToNext()
}

// 壁纸来源选项
const wallpaperSources = wallpaperService.getProviders()

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
    settingsStore.settings.webdav.enabled = true
    settingsStore.settings.webdav.url = webdavUrl.value
    settingsStore.settings.webdav.username = webdavUsername.value
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
    await gridItemStore.loadGridItems()
    const rawSettings = localStorage.getItem('new-tab-settings')
    if (rawSettings) {
      Object.assign(settingsStore.settings, JSON.parse(rawSettings))
    }
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
  const dbData = await db.exportData()
  const settings = structuredClone(settingsStore.settings)
  const rawOrders = localStorage.getItem('new-tab-orders')
  const orders = rawOrders ? JSON.parse(rawOrders) : []

  const exportData = {
    exportedAt: new Date().toISOString(),
    ...dbData,
    settings,
    orders
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json'
  })
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

    try {
      const text = await file.text()
      const data = JSON.parse(text) as BackupData

      // 1. 恢复 GridItems
      await db.importData(data)

      // 2. 恢复设置
      if (data.settings) {
        localStorage.setItem('new-tab-settings', JSON.stringify(data.settings))
      }

      // 3. 恢复排序
      if (data.orders) {
        localStorage.setItem('new-tab-orders', JSON.stringify(data.orders))
      }

      // 重新加载应用状态
      await gridItemStore.loadGridItems()
      if (data.settings) {
        Object.assign(settingsStore.settings, data.settings)
      }
      alert('导入成功！')
    } catch (error) {
      console.error('Import failed:', error)
      alert('导入失败：数据格式无效')
    }
  }
  input.click()
}

// 初始化
watch(visible, async visible => {
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

defineExpose({
  open() {
    visible.value = true
  }
})
</script>

<style scoped>
/* Select 下拉选项背景 */
:deep([data-radix-popper-content-wrapper]) {
  --tw-bg-opacity: 1;
}
</style>
