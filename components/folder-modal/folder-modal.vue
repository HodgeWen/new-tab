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
            {{ option.label }}
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

const sizeOptions: { value: FolderSize; label: string }[] = [
  { value: 'horizontal', label: '横向 2×1' },
  { value: 'vertical', label: '纵向 1×2' },
  { value: 'square', label: '方形 2×2' }
]

const {
  form,
  open: openModal,
  visible
} = useModal<FolderItemForm>({ type: 'folder', id: null, title: '', size: 'horizontal' })

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
    components.gridLayout?.updateWidget(form.id!)
  } else {
    // 显式构造干净的表单数据，避免残留字段（如 deepExtend 遗留的 sites）
    const formData: FolderItemForm = { type: 'folder', title: form.title.trim(), size: form.size }
    components.gridLayout?.addWidget(formData)
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
  gap: var(--spacing-sm);
}

.size-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  color: var(--text-primary);
  font-size: var(--text-body);
  cursor: pointer;
  transition: all var(--transition-fast);
  user-select: none;
}

.size-option:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-strong);
}

.size-option.active {
  border-color: var(--color-primary);
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  font-weight: var(--font-medium);
}

/* Footer */
.footer-actions {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}
</style>
