import { setting } from '@/store/setting'
import { getWallpaperProvider } from '@/utils/wallpaper-providers'
import { db } from '@/utils/db'
import type { WallpaperRequestOptions } from '@/types/common'
import type { WallpaperState } from './use-wallpaper-state'

export function createWallpaperFetch(state: WallpaperState) {
  async function fetchAndCache(options?: WallpaperRequestOptions): Promise<boolean> {
    const provider = getWallpaperProvider(setting.wallpaperProvider)
    if (!provider) return false

    state.setLoading(true)
    try {
      const info = await provider.getWallpaper(options)

      if (!state.wallpaperUrl.value) {
        state.setUrl(info.url)
      }

      const res = await fetch(info.downloadUrl)
      if (!res.ok) throw new Error(`Image fetch failed: ${res.status}`)

      const blob = await res.blob()
      await db.saveWallpaper('current', info, blob)
      state.setCurrentWallpaperId(info.id)
      state.setUrl(URL.createObjectURL(blob))
      return true
    } catch (err) {
      console.error('[Wallpaper] Fetch failed:', err)
      return false
    } finally {
      state.setLoading(false)
    }
  }

  function scheduleRefresh(delay: number) {
    state.scheduleRefresh(delay, async () => {
      await fetchAndCache()
      scheduleRefresh(setting.wallpaperInterval)
    })
  }

  async function loadWallpaper() {
    if (!setting.wallpaper || !setting.wallpaperProvider) {
      state.setCanRefresh(false)
      state.setCurrentWallpaperId('')
      state.setUrl('')
      state.clearTimer()
      return
    }

    state.clearTimer()
    state.setCanRefresh(!!getWallpaperProvider(setting.wallpaperProvider)?.refreshable)

    try {
      const cached = await db.getWallpaper('current')
      if (cached) {
        state.setCurrentWallpaperId(cached.wallpaper.id)
        state.setUrl(cached.blobUrl)

        const elapsed = Date.now() - cached.timestamp
        if (elapsed < setting.wallpaperInterval) {
          scheduleRefresh(setting.wallpaperInterval - elapsed)
          return
        }
      }
    } catch {
      // IndexedDB 可能不可用，忽略
    }

    await fetchAndCache()
    scheduleRefresh(setting.wallpaperInterval)
  }

  async function refreshWallpaper() {
    if (!setting.wallpaper || !setting.wallpaperProvider) return false

    const provider = getWallpaperProvider(setting.wallpaperProvider)
    if (!provider?.refreshable) return false

    state.clearTimer()
    const ok = await fetchAndCache({
      force: true,
      excludeId: state.getCurrentWallpaperId() || undefined
    })
    scheduleRefresh(setting.wallpaperInterval)
    return ok
  }

  return { fetchAndCache, loadWallpaper, refreshWallpaper }
}
