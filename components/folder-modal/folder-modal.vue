<template>
  <n-modal :title="isEdit ? '编辑文件夹' : '添加文件夹'" v-model="visible" width="420px">
    <div class="folder-form">
      <!-- 名称 -->
      <div class="form-item">
        <label>名称</label>
        <n-input v-model="form.title" placeholder="输入文件夹名称" clearable />
      </div>

      <!-- 尺寸预设 -->
      <div class="form-item">
        <label>尺寸</label>
        <div class="size-options">
          <div
            v-for="option in sizeOptions"
            :key="option.value"
            class="size-option"
            :class="{ active: form.size === option.value }"
            @click="form.size = option.value"
          >
            <div class="size-preview">
              <div
                class="size-grid"
                :style="{
                  gridTemplateColumns: `repeat(${option.w}, 1fr)`,
                  gridTemplateRows: `repeat(${option.h}, 1fr)`,
                  aspectRatio: `${option.w} / ${option.h}`
                }"
              >
                <div v-for="i in option.w * option.h" :key="i" class="size-cell" />
              </div>
            </div>
            <span class="size-label">{{ option.label }}</span>
            <span class="size-desc">{{ option.w }}×{{ option.h }}</span>
          </div>
        </div>
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
import { NModal } from '@/components/modal'
import { NInput } from '@/components/input'
import { NButton } from '@/components/button'
import { useModal } from '@/hooks/use-modal'
import { components } from '@/store/components'
import { updateGridItem } from '@/store/grid-items'
import type { FolderItemForm, FolderItemUI } from '@/types/ui'
import type { FolderSize } from '@/types/common'

defineOptions({ name: 'NFolderModal' })

const sizeOptions: { value: FolderSize; label: string; w: number; h: number }[] = [
  { value: 'horizontal', label: '横向', w: 2, h: 1 },
  { value: 'vertical', label: '纵向', w: 1, h: 2 },
  { value: 'square', label: '方形', w: 2, h: 2 }
]

const {
  form,
  open: openModal,
  visible
} = useModal<FolderItemForm>({ type: 'folder', title: '', size: 'horizontal' })

const isEdit = computed(() => !!form.id)

const canSave = computed(() => {
  return form.title.trim() !== ''
})

function open(data?: Partial<FolderItemForm>) {
  openModal(data as FolderItemForm)
}

function handleSave() {
  if (!canSave.value) return

  if (isEdit.value) {
    // 先更新 store 数据，再重新渲染
    updateGridItem({ ...form, id: form.id! } as FolderItemUI)
    components.gridLayout?.value?.updateWidget(form.id!)
  } else {
    components.gridLayout?.value?.addWidget({ ...form })
  }

  visible.value = false
}

defineExpose({ open })
</script>

<style scoped>
.folder-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-xs) 0;
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

/* 尺寸选择器 */
.size-options {
  display: flex;
  gap: var(--spacing-md);
}

.size-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  cursor: pointer;
  transition: all var(--transition-normal);
  user-select: none;
}

.size-option:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-strong);
  transform: translateY(-2px);
  box-shadow: var(--glass-shadow);
}

.size-option.active {
  border-color: var(--color-primary);
  background: var(--color-primary-subtle);
  box-shadow: 0 0 0 2px var(--color-primary-subtle);
}

.size-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: var(--spacing-sm) 0;
}

.size-grid {
  display: grid;
  gap: 3px;
  width: 48px;
}

.size-cell {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 4px;
  background: var(--glass-border-strong);
  transition: background var(--transition-fast);
}

.size-option.active .size-cell {
  background: var(--color-primary);
  opacity: 0.6;
}

.size-label {
  font-size: var(--text-body);
  color: var(--text-primary);
  font-weight: var(--font-medium);
}

.size-desc {
  font-size: var(--text-caption);
  color: var(--text-secondary);
}

.size-option.active .size-label {
  color: var(--color-primary);
}

/* Footer */
.footer-actions {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}
</style>
