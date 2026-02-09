import { reactive, watch } from 'vue'

import type { Setting } from '@/types/common'

const DEFAULT_SETTING: Setting = {
  searchBar: true,
  wallpaper: true,
  wallpaperProvider: 'bing',
  wallpaperInterval: 30 * 60 * 1000,
  webdav: { url: '', username: '', password: '' }
}

export const SETTING_KEY = 'setting'

function loadSetting(): Setting {
  try {
    const saved = localStorage.getItem(SETTING_KEY)
    if (saved) {
      return { ...DEFAULT_SETTING, ...JSON.parse(saved) }
    }
  } catch {
    // ignore parse errors
  }
  return { ...DEFAULT_SETTING }
}

export const setting = reactive<Setting>(loadSetting())

watch(
  setting,
  (newVal) => {
    localStorage.setItem(SETTING_KEY, JSON.stringify(newVal))
  },
  { deep: true }
)
