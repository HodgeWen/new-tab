<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useBookmarkStore } from '@/stores/bookmarks'
import { isFolderItem, type FolderSize } from '@/types'

const uiStore = useUIStore()
const bookmarkStore = useBookmarkStore()

const isVisible = computed(() =>
  uiStore.modalType === 'addFolder' || uiStore.modalType === 'editFolder'
)
const isEdit = computed(() => uiStore.modalType === 'editFolder')

const title = ref('')
const size = ref<FolderSize>('2x2')
const loading = ref(false)

const sizeOptions: Array<{ value: FolderSize; label: string; desc: string }> = [
  { value: '1x2', label: '1×2', desc: '窄高型' },
  { value: '2x2', label: '2×2', desc: '正方形' },
  { value: '2x1', label: '2×1', desc: '宽扁型' },
]

// 重置表单
function resetForm() {
  title.value = ''
  size.value = '2x2'
}

// 监听模态框打开
watch(isVisible, visible => {
  if (visible && isEdit.value && uiStore.modalData && isFolderItem(uiStore.modalData)) {
    title.value = uiStore.modalData.title
    size.value = uiStore.modalData.size
  } else if (!visible) {
    resetForm()
  }
})

// 关闭模态框
function closeModal() {
  uiStore.closeModal()
  resetForm()
}

// 提交表单
async function handleSubmit() {
  if (!title.value.trim()) return

  loading.value = true
  try {
    if (isEdit.value && uiStore.modalData) {
      await bookmarkStore.updateBookmark(uiStore.modalData.id, {
        title: title.value.trim(),
      })
      if (isFolderItem(uiStore.modalData)) {
        await bookmarkStore.updateFolderSize(uiStore.modalData.id, size.value)
      }
    } else {
      await bookmarkStore.addFolder({
        title: title.value.trim(),
        size: size.value,
        parentId: null,
      })
    }

    closeModal()
  } finally {
    loading.value = false
  }
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
        @click.self="closeModal"
      >
        <div class="w-full max-w-md mx-4 rounded-2xl glass overflow-hidden">
          <!-- 标题栏 -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <h2 class="text-lg font-semibold text-white">
              {{ isEdit ? '编辑文件夹' : '新建文件夹' }}
            </h2>
            <button
              class="p-2 rounded-lg hover:bg-white/10 transition-colors"
              @click="closeModal"
            >
              <div class="i-lucide-x w-5 h-5 text-white/70" />
            </button>
          </div>

          <!-- 表单 -->
          <form class="p-6 space-y-4" @submit.prevent="handleSubmit">
            <!-- 预览 -->
            <div class="flex items-center gap-4 p-4 rounded-xl bg-white/5">
              <div class="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <div class="i-lucide-folder w-6 h-6 text-white/50" />
              </div>
              <div class="flex-1">
                <p class="text-white">{{ title || '文件夹名称' }}</p>
                <p class="text-xs text-white/50">尺寸: {{ size }}</p>
              </div>
            </div>

            <!-- 名称输入 -->
            <div class="space-y-2">
              <label class="text-sm text-white/70">文件夹名称</label>
              <input
                v-model="title"
                type="text"
                placeholder="输入文件夹名称"
                class="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
              >
            </div>

            <!-- 尺寸选择 -->
            <div class="space-y-2">
              <label class="text-sm text-white/70">文件夹尺寸</label>
              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="option in sizeOptions"
                  :key="option.value"
                  type="button"
                  class="px-3 py-4 rounded-xl flex flex-col items-center gap-1 transition-all"
                  :class="size === option.value
                    ? 'bg-white/20 ring-2 ring-white/30'
                    : 'bg-white/5 hover:bg-white/10'"
                  @click="size = option.value"
                >
                  <span class="text-white font-medium">{{ option.label }}</span>
                  <span class="text-xs text-white/50">{{ option.desc }}</span>
                </button>
              </div>
            </div>

            <!-- 提交按钮 -->
            <div class="flex gap-3 pt-2">
              <button
                type="button"
                class="flex-1 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                @click="closeModal"
              >
                取消
              </button>
              <button
                type="submit"
                class="flex-1 px-4 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50"
                :disabled="loading || !title.trim()"
              >
                {{ loading ? '保存中...' : (isEdit ? '保存' : '创建') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

