<template>
  <n-modal :title="isEdit ? '编辑网站' : '添加网站'" v-model="visible" width="420px">
    <div class="site-form">
      <!-- 图标上传 -->
      <div class="icon-section">
        <n-upload class="icon-upload" :class="{ 'has-icon': form.icon }" @pick="handleIconUpload">
          <img v-if="form.icon" :src="form.icon" class="icon-preview" alt="网站图标" />
          <div v-else-if="fetchingIcon" class="icon-placeholder icon-loading">
            <Loader2 :size="24" class="icon-spinner" />
            <span>获取中</span>
          </div>
          <div v-else class="icon-placeholder">
            <ImagePlus :size="24" />
            <span>上传图标</span>
          </div>
        </n-upload>
        <n-button
          v-if="form.icon"
          variant="ghost"
          class="remove-icon-btn"
          @click="handleRemoveIcon"
        >
          移除图标
        </n-button>
      </div>

      <!-- 网址 -->
      <div class="form-item">
        <label>网址</label>
        <n-input
          v-model="form.url"
          @change="handleUrlChange"
          placeholder="https://example.com"
          clearable
          :status="urlStatus"
        >
          <template #prefix>
            <Globe :size="16" />
          </template>
        </n-input>
      </div>

      <!-- 标题 -->
      <div class="form-item">
        <label>标题</label>
        <n-input v-model="form.title" placeholder="输入网站名称" clearable />
      </div>
    </div>

    <template #footer>
      <div class="footer-actions">
        <n-button variant="ghost" @click="visible = false">取消</n-button>
        <n-button variant="primary" @click="handleSave" :disabled="!canSave">
          {{ isEdit ? '保存' : '添加' }}
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ImagePlus, Globe, Loader2 } from 'lucide-vue-next'
import { NModal } from '@/components/modal'
import { NInput } from '@/components/input'
import { NButton } from '@/components/button'
import { NUpload } from '@/components/upload'
import { useModal } from '@/composables/use-modal'
import { useSiteIcon } from '@/composables/use-site-icon'
import { nanoid } from 'nanoid'
import { components } from '@/store/components'
import { addGridItem, updateGridItem } from '@/store/grid-items'
import type { SiteItemForm, SiteItemUI } from '@/types/ui'

defineOptions({ name: 'NSiteModal' })

const {
  form,
  open: openModal,
  visible
} = useModal<SiteItemForm>({ type: 'site', id: null, title: '', url: '', icon: '', pid: null })
const { fetchingIcon, handleUrlChange, resetIconRequestState, normalizeAndValidate } = useSiteIcon({
  form,
  visible
})

const isEdit = computed(() => !!form.id)

const canSave = computed(() => {
  return form.title.trim() !== '' && form.url.trim() !== '' && urlStatus.value !== 'error'
})

const urlStatus = computed<'default' | 'error' | 'success'>(() => {
  const url = form.url.trim()
  if (!url) return 'default'
  return normalizeAndValidate(url) ? 'success' : 'error'
})

function open(data?: Partial<SiteItemForm>) {
  resetIconRequestState()
  openModal(data as SiteItemForm)
}

function handleIconUpload(file: File) {
  const reader = new FileReader()
  reader.onload = (e) => {
    form.icon = (e.target?.result as string) ?? ''
  }
  reader.readAsDataURL(file)
}

function handleRemoveIcon() {
  form.icon = ''
}

function handleSave() {
  if (!canSave.value) return

  const validatedUrl = normalizeAndValidate(form.url.trim())
  if (!validatedUrl) return

  const payload = { ...form, url: validatedUrl }

  if (isEdit.value) {
    // 编辑模式：先更新 store 数据，再重新渲染
    updateGridItem({ ...payload, id: form.id! } as SiteItemUI)
    components.gridLayout?.updateWidget(form.id!)
  } else {
    // 创建模式
    if (form.pid) {
      // 如果是在文件夹内创建
      const id = nanoid(10)
      addGridItem({ ...payload, id } as SiteItemUI)
    } else {
      // 顶级网格创建：通过 GridStack 添加
      components.gridLayout?.addWidget({ ...payload })
    }
  }

  visible.value = false
}

defineExpose({ open })
</script>

<style scoped>
.site-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-xs) 0;
}

.icon-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.icon-upload {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: var(--radius-lg);
  border: 2px dashed var(--glass-border-strong);
  background: var(--glass-bg);
  cursor: pointer;
  transition: all var(--transition-normal);
  overflow: hidden;
  position: relative;
}

.icon-upload:hover {
  border-color: var(--color-primary);
  background: var(--glass-bg-hover);
  transform: translateY(-2px);
  box-shadow: var(--glass-shadow);
}

.icon-upload.has-icon {
  border-style: solid;
  border-color: var(--glass-border);
}

.icon-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
}

.icon-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-muted);
  font-size: var(--text-caption);
}

.icon-loading {
  color: var(--color-primary);
}

.icon-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.remove-icon-btn {
  font-size: var(--text-caption);
  height: 28px;
  padding: 0 var(--spacing-sm);
  color: var(--text-secondary);
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-item > label {
  color: var(--text-primary);
  font-size: var(--text-body);
  font-weight: var(--font-medium);
}

.footer-actions {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}
</style>
