import { onUnmounted } from 'vue'
import { createWallpaperState } from './use-wallpaper-state'
import { createWallpaperFetch } from './use-wallpaper-fetch'

const state = createWallpaperState()
const { loadWallpaper, refreshWallpaper } = createWallpaperFetch(state)

let consumers = 0

function initWallpaper() {
  state.init(loadWallpaper)
}

function destroyWallpaper() {
  state.destroy()
}

export function useWallpaper() {
  consumers += 1
  initWallpaper()

  onUnmounted(() => {
    consumers -= 1
    if (consumers <= 0) {
      consumers = 0
      destroyWallpaper()
    }
  })

  return {
    wallpaperUrl: state.wallpaperUrl,
    loading: state.loading,
    canRefresh: state.canRefresh,
    refreshWallpaper
  }
}
