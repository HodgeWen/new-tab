<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useGridItemStore } from '@/stores/grid-items'
import { faviconService } from '@/services/favicon'
import { isSiteItem } from '@/types'

const uiStore = useUIStore()
const gridItemStore = useGridItemStore()

const isVisible = computed(
  () => uiStore.modalType === 'addSite' || uiStore.modalType === 'editSite'
)
const isEdit = computed(() => uiStore.modalType === 'editSite')

const title = ref('')
const url = ref('')
const favicon = ref('')
const loading = ref(false)

// 重置表单
function resetForm() {
  title.value = ''
  url.value = ''
  favicon.value = ''
}

// 监听模态框打开
watch(isVisible, visible => {
  if (
    visible &&
    isEdit.value &&
    uiStore.modalData &&
    isSiteItem(uiStore.modalData)
  ) {
    title.value = uiStore.modalData.title
    url.value = uiStore.modalData.url
    favicon.value = uiStore.modalData.favicon
  } else if (!visible) {
    resetForm()
  }
})

// 关闭模态框
function closeModal() {
  uiStore.closeModal()
  resetForm()
}

// URL 变化时自动获取 favicon（使用缓存）
async function handleUrlChange() {
  if (!url.value) return

  try {
    // 确保 URL 有协议前缀
    let fullUrl = url.value
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = `https://${fullUrl}`
      url.value = fullUrl
    }

    // 自动获取标题（如果为空）
    if (!title.value) {
      try {
        const domain = new URL(fullUrl).hostname.replace('www.', '')
        title.value =
          domain.charAt(0).toUpperCase() + domain.slice(1).split('.')[0]
      } catch {
        // 忽略解析错误
      }
    }

    // 获取并缓存 favicon
    favicon.value = await faviconService.fetchAndCacheFavicon(fullUrl)
  } catch {
    // 忽略错误
  }
}

// 提交表单
async function handleSubmit() {
  if (!title.value.trim() || !url.value.trim()) return

  loading.value = true
  try {
    // 确保 URL 有协议前缀
    let fullUrl = url.value
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = `https://${fullUrl}`
    }

    // 确保 favicon 已缓存
    if (!favicon.value) {
      favicon.value = await faviconService.fetchAndCacheFavicon(fullUrl)
    }

    if (isEdit.value && uiStore.modalData) {
      await gridItemStore.updateGridItem(uiStore.modalData.id, {
        title: title.value.trim(),
        url: fullUrl,
        favicon: favicon.value
      })
    } else {
      await gridItemStore.addSite({
        title: title.value.trim(),
        url: fullUrl,
        favicon: favicon.value,
        parentId: null
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
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-white/10"
          >
            <h2 class="text-lg font-semibold text-white">
              {{ isEdit ? '编辑网站' : '添加网站' }}
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
              <div
                class="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center"
              >
                <img
                  v-if="favicon"
                  :src="favicon"
                  class="w-8 h-8 rounded"
                  @error="favicon = ''"
                />
                <div v-else class="i-lucide-globe w-6 h-6 text-white/50" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-white truncate">{{ title || '网站名称' }}</p>
                <p class="text-xs text-white/50 truncate">
                  {{ url || 'https://example.com' }}
                </p>
              </div>
            </div>

            <!-- URL 输入 -->
            <div class="space-y-2">
              <label class="text-sm text-white/70">网址</label>
              <input
                v-model="url"
                type="text"
                placeholder="https://example.com"
                class="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
                @blur="handleUrlChange"
              />
            </div>

            <!-- 标题输入 -->
            <div class="space-y-2">
              <label class="text-sm text-white/70">名称</label>
              <input
                v-model="title"
                type="text"
                placeholder="网站名称"
                class="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
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
                :disabled="loading || !title.trim() || !url.trim()"
              >
                {{ loading ? '保存中...' : isEdit ? '保存' : '添加' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
