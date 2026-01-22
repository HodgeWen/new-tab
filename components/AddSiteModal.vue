<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useUI } from '@/composables/useUI'
import { useGridItemStore } from '@/stores/grid-items'
import { faviconService } from '@/services/favicon'
import { isSiteItem } from '@/types'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/shadcn/ui/dialog'
import { Button } from '@/shadcn/ui/button'
import { Input } from '@/shadcn/ui/input'
import { Globe } from 'lucide-vue-next'

const ui = useUI()
const gridItemStore = useGridItemStore()

const isVisible = computed({
  get: () => ui.modalType.value === 'addSite' || ui.modalType.value === 'editSite',
  set: (value: boolean) => {
    if (!value) closeModal()
  }
})
const isEdit = computed(() => ui.modalType.value === 'editSite')

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
    ui.modalData.value &&
    isSiteItem(ui.modalData.value)
  ) {
    title.value = ui.modalData.value.title
    url.value = ui.modalData.value.url
    favicon.value = ui.modalData.value.favicon
  } else if (!visible) {
    resetForm()
  }
})

// 关闭模态框
function closeModal() {
  ui.closeModal()
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

    if (isEdit.value && ui.modalData.value) {
      await gridItemStore.updateGridItem(ui.modalData.value.id, {
        title: title.value.trim(),
        url: fullUrl,
        favicon: favicon.value
      })
    } else {
      await gridItemStore.addSite({
        title: title.value.trim(),
        url: fullUrl,
        favicon: favicon.value,
        pid: null
      })
    }

    closeModal()
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="isVisible">
    <DialogContent
      class="glass-dialog max-w-md p-0 text-white border-white/20 bg-black/40 backdrop-blur-xl"
    >
      <DialogHeader class="px-6 py-4 border-b border-white/10">
        <DialogTitle class="text-lg font-semibold text-white">
          {{ isEdit ? '编辑网站' : '添加网站' }}
        </DialogTitle>
        <DialogDescription class="sr-only">
          {{ isEdit ? '编辑网站的名称和网址' : '添加新网站到新标签页' }}
        </DialogDescription>
      </DialogHeader>

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
            <Globe v-else class="size-6 text-white/50" />
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
          <Input
            v-model="url"
            type="text"
            placeholder="https://example.com"
            class="bg-white/10 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-white/20"
            @blur="handleUrlChange"
          />
        </div>

        <!-- 标题输入 -->
        <div class="space-y-2">
          <label class="text-sm text-white/70">名称</label>
          <Input
            v-model="title"
            type="text"
            placeholder="网站名称"
            class="bg-white/10 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-white/20"
          />
        </div>

        <!-- 提交按钮 -->
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
            :disabled="loading || !title.trim() || !url.trim()"
          >
            {{ loading ? '保存中...' : isEdit ? '保存' : '添加' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
