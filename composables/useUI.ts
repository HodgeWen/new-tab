import { inject } from 'vue'
import { UI_KEY, type UIContext } from '@/types/ui'

export function useUI(): UIContext {
  const ui = inject(UI_KEY)
  if (!ui) {
    throw new Error('useUI must be used within a UI provider')
  }
  return ui
}
