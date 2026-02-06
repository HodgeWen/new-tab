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
            <n-input v-model="formData.wallpaperProvider" placeholder="请输入壁纸源 API" />
          </div>
          <div class="form-item">
            <label>轮播间隔 (毫秒)</label>
            <n-input
              type="number"
              v-model.number="formData.wallpaperInterval"
              placeholder="例如: 3600000"
            />
          </div>
        </div>
      </transition>

      <!-- WebDAV -->
      <div class="section-header">
        <div class="section-title">WebDAV 同步</div>
        <div class="section-desc">配置 WebDAV 以同步你的数据</div>
      </div>

      <div class="webdav-settings">
        <div class="form-item">
          <label>服务器地址</label>
          <n-input v-model="formData.webdav.url" placeholder="https://dav.example.com" />
        </div>
        <div class="form-item">
          <label>用户名</label>
          <n-input v-model="formData.webdav.username" placeholder="Username" />
        </div>
        <div class="form-item">
          <label>密码</label>
          <n-input type="password" v-model="formData.webdav.password" placeholder="Password" />
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
import { useModal } from '@/hooks/use-modal'
import { setting } from '@/store/setting'
import type { Setting } from '@/types/common'

defineOptions({ name: 'NSettingModal' })

const {
  form: formData,
  open: openModal,
  visible
} = useModal<Setting>({
  searchBar: true,
  wallpaper: true,
  wallpaperProvider: '',
  wallpaperInterval: 0,
  webdav: { url: '', username: '', password: '' }
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
  background: rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
}

.webdav-settings {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: rgba(0, 0, 0, 0.05);
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
