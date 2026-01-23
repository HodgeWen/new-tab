<template>
  <Dialog v-model:open="visible">
    <DialogContent
      class="glass-dialog max-w-md p-0 text-white border-white/20 bg-black/40 backdrop-blur-xl"
    >
      <DialogHeader class="px-6 py-4 border-b border-white/10">
        <DialogTitle class="text-lg font-semibold text-white">
          {{ isEdit ? '编辑文件夹' : '新建文件夹' }}
        </DialogTitle>
        <DialogDescription class="sr-only">
          {{ isEdit ? '编辑文件夹的名称和尺寸' : '创建新文件夹来整理网站' }}
        </DialogDescription>
      </DialogHeader>

      <form class="p-6 space-y-4" @submit.prevent="handleSubmit">
        <div class="flex items-center gap-4 p-4 rounded-xl bg-white/5">
          <div
            class="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center"
          >
            <Folder class="size-6 text-white/50" />
          </div>
          <div class="flex-1">
            <p class="text-white">{{ form.title || '文件夹名称' }}</p>
            <p class="text-xs text-white/50">
              尺寸: {{ FOLDER_SIZE_PRESETS[selectedPreset].label }}
            </p>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm text-white/70">文件夹名称</label>
          <Input
            v-model="form.title"
            type="text"
            placeholder="输入文件夹名称"
            class="bg-white/10 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-white/20"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm text-white/70">文件夹尺寸</label>
          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="option in sizeOptions"
              :key="option.key"
              type="button"
              class="px-3 py-4 rounded-xl flex flex-col items-center gap-1 transition-all"
              :class="
                selectedPreset === option.key
                  ? 'bg-white/20 ring-2 ring-white/30'
                  : 'bg-white/5 hover:bg-white/10'
              "
              @click="selectedPreset = option.key"
            >
              <span class="text-white font-medium">{{ option.label }}</span>
              <span class="text-xs text-white/50">{{ option.desc }}</span>
            </button>
          </div>
        </div>

        <div class="flex gap-3 pt-2">
          <Button
            type="button"
            variant="glass"
            class="flex-1"
            @click="closeModal"
          >
            取消
          </Button>
          <Button
            type="submit"
            class="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            :disabled="loading || !form.title.trim()"
          >
            {{ loading ? '保存中...' : isEdit ? '保存' : '创建' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useModal } from '@/composables/use-modal'
import { useGridItemStore } from '@/stores/grid-items'
import {
  FOLDER_SIZE_PRESETS,
  type GridSize,
  type FolderSizePreset
} from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/shadcn/ui/dialog'
import { Button } from '@/shadcn/ui/button'
import { Input } from '@/shadcn/ui/input'
import { Folder } from 'lucide-vue-next'

defineOptions({
  name: 'FolderEdit'
})

type FolderForm = {
  id: string | null
  title: string
  size: GridSize
}

const { visible, form, open } = useModal<FolderForm>({
  id: null,
  title: '',
  size: { w: FOLDER_SIZE_PRESETS.square.w, h: FOLDER_SIZE_PRESETS.square.h }
})

const gridItemStore = useGridItemStore()
const loading = ref(false)

const isEdit = computed(() => Boolean(form.id))
const selectedPreset = ref<FolderSizePreset>('square')

const sizeOptions = Object.entries(FOLDER_SIZE_PRESETS).map(([key, value]) => ({
  key: key as FolderSizePreset,
  ...value
}))

const currentSize = computed<GridSize>(() => {
  const preset = FOLDER_SIZE_PRESETS[selectedPreset.value]
  return { w: preset.w, h: preset.h }
})

function findPresetBySize(size: GridSize): FolderSizePreset {
  for (const [key, preset] of Object.entries(FOLDER_SIZE_PRESETS)) {
    if (preset.w === size.w && preset.h === size.h) {
      return key as FolderSizePreset
    }
  }
  return 'square'
}

function closeModal() {
  visible.value = false
}

watch(visible, value => {
  if (value) {
    selectedPreset.value = findPresetBySize(form.size)
  } else {
    selectedPreset.value = 'square'
  }
})

async function handleSubmit() {
  if (!form.title.trim()) return

  loading.value = true
  try {
    if (form.id) {
      await gridItemStore.updateGridItem(form.id, {
        title: form.title.trim()
      })
      await gridItemStore.updateFolderSize(form.id, currentSize.value)
    } else {
      await gridItemStore.addFolder({
        title: form.title.trim(),
        size: currentSize.value
      })
    }
    closeModal()
  } finally {
    loading.value = false
  }
}

defineExpose({ open })
</script>
