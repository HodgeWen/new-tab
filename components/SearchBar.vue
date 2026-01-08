<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
const searchInput = ref('')
const inputRef = ref<HTMLInputElement>()

const searchEngineUrl = computed(() => {
  return settingsStore.settings.searchEngine === 'google'
    ? 'https://www.google.com/search?q='
    : 'https://www.bing.com/search?q='
})

const searchEngineLogo = computed(() => {
  return settingsStore.settings.searchEngine === 'google'
    ? 'i-logos-google-icon'
    : 'i-logos-bing'
})

function handleSearch() {
  const query = searchInput.value.trim()
  if (query) {
    window.location.href = searchEngineUrl.value + encodeURIComponent(query)
  }
}

function clearInput() {
  searchInput.value = ''
  inputRef.value?.focus()
}

function toggleSearchEngine() {
  settingsStore.setSearchEngine(
    settingsStore.settings.searchEngine === 'google' ? 'bing' : 'google'
  )
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === '/' && document.activeElement !== inputRef.value) {
    event.preventDefault()
    inputRef.value?.focus()
  }
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault()
    inputRef.value?.focus()
  }
  if (event.key === 'Escape' && document.activeElement === inputRef.value) {
    searchInput.value = ''
    inputRef.value?.blur()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  // 自动聚焦
  setTimeout(() => inputRef.value?.focus(), 100)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="search-bar w-full max-w-xl">
    <div class="glass rounded-2xl px-4 py-3 flex items-center gap-3 transition-all duration-300 focus-within:ring-2 focus-within:ring-white/30">
      <!-- 搜索引擎切换按钮 -->
      <button
        class="flex-shrink-0 p-2 rounded-lg hover:bg-white/10 transition-colors"
        :title="`切换到 ${settingsStore.settings.searchEngine === 'google' ? 'Bing' : 'Google'}`"
        @click="toggleSearchEngine"
      >
        <div :class="searchEngineLogo" class="w-5 h-5" />
      </button>

      <!-- 搜索输入框 -->
      <input
        ref="inputRef"
        v-model="searchInput"
        type="text"
        class="flex-1 bg-transparent border-none outline-none text-white text-base placeholder-white/50"
        placeholder="搜索网页..."
        @keyup.enter="handleSearch"
      >

      <!-- 清除按钮 -->
      <button
        v-if="searchInput"
        class="flex-shrink-0 p-2 rounded-lg hover:bg-white/10 transition-colors"
        title="清除"
        @click="clearInput"
      >
        <div class="i-lucide-x w-4 h-4 text-white/70" />
      </button>

      <!-- 搜索按钮 -->
      <button
        class="flex-shrink-0 p-2 rounded-lg hover:bg-white/10 transition-colors"
        title="搜索"
        @click="handleSearch"
      >
        <div class="i-lucide-search w-5 h-5 text-white/70" />
      </button>
    </div>

    <!-- 快捷键提示 -->
    <div class="mt-2 text-center text-white/40 text-xs">
      按 <kbd class="px-1.5 py-0.5 rounded bg-white/10 font-mono">/</kbd> 或
      <kbd class="px-1.5 py-0.5 rounded bg-white/10 font-mono">Ctrl+K</kbd> 聚焦搜索框
    </div>
  </div>
</template>

