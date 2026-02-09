import { ref, watch, onUnmounted } from 'vue'
import { setting } from '@/store/setting'
import { getWallpaperProvider } from '@/utils/wallpaper-providers'
import { db } from '@/utils/db'

export function useWallpaper() {
  const wallpaperUrl = ref('')
  const loading = ref(false)

  let refreshTimer: ReturnType<typeof setTimeout> | null = null
  let currentBlobUrl: string | null = null

  function setUrl(url: string) {
    // 回收旧的 blob URL 防止内存泄漏
    if (currentBlobUrl) {
      URL.revokeObjectURL(currentBlobUrl)
    }
    currentBlobUrl = url || null
    wallpaperUrl.value = url
  }

  async function fetchAndCache(): Promise<boolean> {
    const provider = getWallpaperProvider(setting.wallpaperProvider)
    if (!provider) return false

    loading.value = true
    try {
      const info = await provider.getWallpaper()
      const res = await fetch(info.downloadUrl)
      if (!res.ok) throw new Error(`Image fetch failed: ${res.status}`)

      const blob = await res.blob()
      await db.saveWallpaper('current', info, blob)
      setUrl(URL.createObjectURL(blob))
      return true
    } catch (err) {
      console.error('[Wallpaper] Fetch failed:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  async function loadWallpaper() {
    if (!setting.wallpaper || !setting.wallpaperProvider) {
      setUrl('')
      clearTimer()
      return
    }

    // 优先尝试缓存
    try {
      const cached = await db.getWallpaper('current')
      if (cached) {
        const elapsed = Date.now() - cached.timestamp
        if (elapsed < setting.wallpaperInterval) {
          setUrl(cached.blobUrl)
          scheduleRefresh(setting.wallpaperInterval - elapsed)
          return
        }
      }
    } catch {
      // IndexedDB 可能不可用，忽略
    }

    // 缓存无效或不存在，直接获取
    await fetchAndCache()
    scheduleRefresh(setting.wallpaperInterval)
  }

  function scheduleRefresh(delay: number) {
    clearTimer()
    if (delay > 0 && setting.wallpaperInterval > 0) {
      refreshTimer = setTimeout(async () => {
        await fetchAndCache()
        scheduleRefresh(setting.wallpaperInterval)
      }, delay)
    }
  }

  function clearTimer() {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
      refreshTimer = null
    }
  }

  // 监听设置变化
  watch(
    () => [setting.wallpaper, setting.wallpaperProvider] as const,
    () => {
      clearTimer()
      loadWallpaper()
    }
  )

  // 初始加载
  loadWallpaper()

  onUnmounted(() => {
    clearTimer()
    if (currentBlobUrl) {
      URL.revokeObjectURL(currentBlobUrl)
    }
  })

  return { wallpaperUrl, loading }
}
