import { reactive, watch } from 'vue'

import type { Setting } from '@/types/common'

export const setting = reactive<Setting>({
  searchBar: true,
  wallpaper: true,
  wallpaperInterval: 30 * 60 * 1000,
  webdav: { url: '', username: '', password: '' }
})

export const SETTING_KEY = 'setting'

watch(
  setting,
  (newVal) => {
    localStorage.setItem(SETTING_KEY, JSON.stringify(newVal))
  },
  { deep: true }
)
