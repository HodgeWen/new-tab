<template>
  <n-modal title="设置" v-model="visible" width="600px">
    <div class="setting-form">
      <!-- Search Bar -->
      <div class="form-item">
        <div class="label-group">
          <label>显示搜索栏</label>
          <span class="description">在主页显示搜索框</span>
        </div>
        <n-switch v-model="formData.searchBar" />
      </div>

      <!-- Wallpaper -->
      <div class="form-item">
        <div class="label-group">
          <label>启用壁纸</label>
          <span class="description">使用高清壁纸作为背景</span>
        </div>
        <n-switch v-model="formData.wallpaper" />
      </div>

      <transition name="slide-down">
        <div v-if="formData.wallpaper" class="sub-settings">
          <div class="form-item">
            <label>壁纸源</label>
            <n-select
              v-model="formData.wallpaperProvider"
              :options="providerOptions"
              placeholder="选择壁纸源"
            />
          </div>
          <div class="form-item" v-if="wallpaperProvider?.refreshable">
            <label>切换间隔</label>
            <n-select v-model="formData.wallpaperInterval" :options="intervalOptions" />
          </div>
        </div>
      </transition>

      <!-- 备份与恢复 -->
      <div class="section-header">
        <div class="section-title">备份与恢复</div>
        <div class="section-desc">导出/导入网站与布局数据</div>
      </div>

      <div class="backup-actions">
        <n-button variant="ghost" @click="handleExport">导出备份</n-button>
        <n-upload
          accept=".json,application/json"
          :disabled="importing"
          @pick="handleImport"
        >
          <n-button variant="ghost" :loading="importing">选择备份文件</n-button>
        </n-upload>
      </div>
      <div
        v-if="importResult"
        :class="importResult.success ? 'import-success' : 'import-error'"
      >
        {{ importResult.success ? '导入成功' : importResult.error }}
      </div>

      <!-- WebDAV -->
      <div class="section-header">
        <div class="section-title">WebDAV 同步</div>
        <div class="section-desc">即将推出，敬请期待</div>
      </div>

      <div class="webdav-settings">
        <div class="form-item">
          <label>服务器地址</label>
          <n-input v-model="formData.webdav.url" placeholder="https://dav.example.com" disabled />
        </div>
        <div class="form-item">
          <label>用户名</label>
          <n-input v-model="formData.webdav.username" placeholder="Username" disabled />
        </div>
        <div class="form-item">
          <label>密码</label>
          <n-input type="password" v-model="formData.webdav.password" placeholder="Password" disabled />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="footer-actions">
        <n-button variant="ghost" @click="visible = false">取消</n-button>
        <n-button variant="primary" @click="handleSave">保存设置</n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { NModal } from '@/components/modal'
import { NInput } from '@/components/input'
import { NSwitch } from '@/components/switch'
import { NButton } from '@/components/button'
import { NSelect } from '@/components/select'
import { useModal } from '@/hooks/use-modal'
import { setting } from '@/store/setting'
import { getWallpaperProvider, wallpaperProviders } from '@/utils/wallpaper-providers'
import { exportBackupData, importBackupData } from '@/utils/backup'
import type { ImportBackupResult } from '@/utils/backup'
import type { Setting } from '@/types/common'
import { NUpload } from '@/components/upload'
import { computed, ref } from 'vue'

defineOptions({ name: 'NSettingModal' })

const providerOptions = wallpaperProviders.map((p) => ({ label: p.name, value: p.id }))

const intervalOptions = [
  { label: '30 分钟', value: 30 * 60 * 1000 },
  { label: '1 小时', value: 60 * 60 * 1000 },
  { label: '6 小时', value: 6 * 60 * 60 * 1000 },
  { label: '12 小时', value: 12 * 60 * 60 * 1000 },
  { label: '24 小时', value: 24 * 60 * 60 * 1000 }
]

const {
  form: formData,
  open: openModal,
  visible
} = useModal<Setting>({
  searchBar: true,
  wallpaper: true,
  wallpaperProvider: 'bing',
  wallpaperInterval: 30 * 60 * 1000,
  webdav: { url: '', username: '', password: '' }
})

const wallpaperProvider = computed(() => {
  return getWallpaperProvider(formData.wallpaperProvider)
})

const open = () => {
  // Load current settings into form
  // We use JSON parse/stringify to deep copy the reactive setting object
  openModal(JSON.parse(JSON.stringify(setting)))
}

const handleSave = () => {
  // Update global setting store
  Object.assign(setting, formData)
  visible.value = false
}

async function handleExport() {
  await exportBackupData()
}

const importResult = ref<ImportBackupResult | null>(null)
const importing = ref(false)

async function handleImport(file: File) {
  importResult.value = null
  importing.value = true
  try {
    importResult.value = await importBackupData(file)
  } finally {
    importing.value = false
  }
}

defineExpose({ open })
</script>

<style scoped>
.setting-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-xs) 0;
}

.form-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.sub-settings {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--glass-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
}

.backup-actions {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--glass-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
}

.import-success {
  color: var(--color-success);
  font-size: var(--text-caption);
}

.import-error {
  color: var(--color-danger);
  font-size: var(--text-caption);
}

.webdav-settings {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--glass-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
}

.label-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.label-group label,
.form-item > label {
  color: var(--text-primary);
  font-size: var(--text-body);
  font-weight: var(--font-medium);
  white-space: nowrap;
}

.form-item > label {
  min-width: 100px;
}

.description {
  font-size: var(--text-caption);
  color: var(--text-secondary);
}

.section-header {
  margin-top: var(--spacing-sm);
}

.section-title {
  font-size: var(--text-title);
  color: var(--text-primary);
  font-weight: var(--font-medium);
}

.section-desc {
  font-size: var(--text-caption);
  color: var(--text-secondary);
  margin-top: 2px;
}

.footer-actions {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}

/* Slide Down Animation */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all var(--transition-normal);
  max-height: 200px;
  opacity: 1;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 0;
  border-width: 0;
}
</style>
