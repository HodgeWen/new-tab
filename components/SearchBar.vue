<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
const searchInput = ref('')
const inputRef = ref<HTMLInputElement>()

function handleSearch() {
  const query = searchInput.value.trim()
  if (query) {
    // 使用 Chrome Search API 以符合商店政策（Red Argon）
    // 这将使用用户在浏览器中设置的默认搜索引擎
    if (typeof browser !== 'undefined' && browser.search) {
      browser.search.query({
        text: query,
        disposition: 'CURRENT_TAB'
      })
    } else {
      // 回退方案（如果是普通网页预览环境）
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`
    }
  }
}

function clearInput() {
  searchInput.value = ''
  inputRef.value?.focus()
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
    <div
      class="glass rounded-2xl px-4 py-3 flex items-center gap-3 transition-all duration-300 focus-within:ring-2 focus-within:ring-white/30"
    >
      <!-- 搜索图标 -->
      <div class="flex-shrink-0 p-2">
        <div class="i-lucide-search w-5 h-5 text-white/70" />
      </div>

      <!-- 搜索输入框 -->
      <input
        ref="inputRef"
        v-model="searchInput"
        type="text"
        class="flex-1 bg-transparent border-none outline-none text-white text-base placeholder-white/50"
        placeholder="搜索网页..."
        @keyup.enter="handleSearch"
      />

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
      <kbd class="px-1.5 py-0.5 rounded bg-white/10 font-mono">Ctrl+K</kbd>
      聚焦搜索框
    </div>
  </div>
</template>
