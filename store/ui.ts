import { reactive } from 'vue'

import type { UIState } from '@/types/common'

export const ui = reactive<UIState>({ editing: false })
