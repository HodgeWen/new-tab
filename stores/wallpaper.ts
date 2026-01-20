import { defineStore } from 'pinia'
import { ref, onUnmounted } from 'vue'
import type { WallpaperInfo } from '@/types'
import { wallpaperService } from '@/services/wallpaper-service'
import { db, revokeObjectUrl, fetchImageAsBlob } from '@/services/database'
import { useSettingsStore } from './settings'

export const useWallpaperStore = defineStore('wallpaper', () => {
  /** 当前显示的壁纸 URL（Blob URL 或原始 URL） */
  const currentWallpaperUrl = ref<string | null>(null)
  /** 当前壁纸信息 */
  const currentWallpaper = ref<WallpaperInfo | null>(null)
  /** 壁纸是否已准备好显示 */
  const isReady = ref(false)
  const loading = ref(false)
  const lastFetchTime = ref(0)

  // 用于追踪需要释放的 Blob URL
  const blobUrls = new Set<string>()

  /**
   * 释放 Blob URL，防止内存泄漏
   */
  function revokeBlobUrlSafe(url: string | null) {
    if (url && url.startsWith('blob:')) {
      revokeObjectUrl(url)
      blobUrls.delete(url)
    }
  }

  /**
   * 追踪 Blob URL
   */
  function trackBlobUrl(url: string) {
    if (url.startsWith('blob:')) {
      blobUrls.add(url)
    }
  }

  async function loadWallpaper() {
    const settingsStore = useSettingsStore()
    const interval = settingsStore.settings.wallpaper.interval * 60 * 1000

    // 尝试从 IndexedDB 缓存加载
    const cached = await db.getWallpaper('current')
    if (cached) {
      currentWallpaper.value = cached.wallpaper
      lastFetchTime.value = cached.timestamp

      // 释放旧的 URL
      revokeBlobUrlSafe(currentWallpaperUrl.value)

      // 使用缓存的 Blob URL（即时显示）
      currentWallpaperUrl.value = cached.blobUrl
      trackBlobUrl(cached.blobUrl)
      isReady.value = true

      // 检查是否需要刷新
      if (Date.now() - cached.timestamp >= interval) {
        // 在后台获取新壁纸，不阻塞当前显示
        fetchNewWallpaperInBackground()
      } else {
        // 预加载下一张
        preloadNext()
      }
      return
    }

    // 没有缓存，获取新壁纸
    await fetchNewWallpaper()
  }

  /**
   * 在后台获取新壁纸（不影响当前显示）
   */
  async function fetchNewWallpaperInBackground() {
    const settingsStore = useSettingsStore()
    try {
      const wallpaper = await wallpaperService.getRandomPhoto(
        settingsStore.settings.wallpaper.source,
        settingsStore.settings.wallpaper.category
      )
      if (wallpaper) {
        // 下载图片并缓存为 Blob
        const blob = await fetchImageAsBlob(wallpaper.url)
        if (blob) {
          await db.saveWallpaper('next', wallpaper, blob)
        }
      }
    } catch {
      // 后台获取失败不影响当前显示
    }
  }

  async function fetchNewWallpaper() {
    const settingsStore = useSettingsStore()
    loading.value = true

    try {
      const wallpaper = await wallpaperService.getRandomPhoto(
        settingsStore.settings.wallpaper.source,
        settingsStore.settings.wallpaper.category
      )

      if (wallpaper) {
        // 下载图片为 Blob
        const blob = await fetchImageAsBlob(wallpaper.url)

        if (blob) {
          // 释放旧的 URL
          revokeBlobUrlSafe(currentWallpaperUrl.value)

          // 创建 Blob URL 用于显示
          const blobUrl = URL.createObjectURL(blob)
          trackBlobUrl(blobUrl)

          currentWallpaper.value = wallpaper
          currentWallpaperUrl.value = blobUrl
          lastFetchTime.value = Date.now()
          isReady.value = true

          // 缓存到 IndexedDB
          await db.saveWallpaper('current', wallpaper, blob)

          // 预加载下一张
          preloadNext()
        } else {
          // Blob 获取失败，使用原始 URL
          currentWallpaper.value = wallpaper
          currentWallpaperUrl.value = wallpaper.url
          isReady.value = true
        }
      }
    } catch (error) {
      console.error('Failed to fetch wallpaper:', error)
      // 即使失败也标记为准备好，显示默认渐变背景
      isReady.value = true
    } finally {
      loading.value = false
    }
  }

  async function preloadNext() {
    const settingsStore = useSettingsStore()

    try {
      const wallpaper = await wallpaperService.getRandomPhoto(
        settingsStore.settings.wallpaper.source,
        settingsStore.settings.wallpaper.category
      )
      if (wallpaper) {
        // 下载图片并缓存为 Blob
        const blob = await fetchImageAsBlob(wallpaper.url)
        if (blob) {
          await db.saveWallpaper('next', wallpaper, blob)
        }
      }
    } catch {
      // 预加载失败不影响当前显示
    }
  }

  async function switchToNext() {
    // 尝试从缓存获取预加载的下一张
    const next = await db.getWallpaper('next')

    if (next) {
      // 释放旧的 URL
      revokeBlobUrlSafe(currentWallpaperUrl.value)

      currentWallpaper.value = next.wallpaper
      currentWallpaperUrl.value = next.blobUrl
      trackBlobUrl(next.blobUrl)
      lastFetchTime.value = Date.now()

      // 将 next 移动到 current 缓存
      const blob = await fetchImageAsBlob(next.wallpaper.url)
      if (blob) {
        await db.saveWallpaper('current', next.wallpaper, blob)
      }

      // 预加载下一张
      preloadNext()
    } else {
      await fetchNewWallpaper()
    }
  }

  // 清理函数：释放所有 Blob URL
  function cleanup() {
    for (const url of blobUrls) {
      revokeObjectUrl(url)
    }
    blobUrls.clear()
  }

  // 组件卸载时清理
  onUnmounted(cleanup)

  return {
    currentWallpaper,
    currentWallpaperUrl,
    isReady,
    loading,
    lastFetchTime,
    loadWallpaper,
    fetchNewWallpaper,
    switchToNext,
    cleanup
  }
})
