import type { FolderSize } from '@/types/common'

export const FOLDER_SIZE_MAP: Record<FolderSize, { w: number; h: number }> = {
  horizontal: { w: 2, h: 1 },
  vertical: { w: 1, h: 2 },
  square: { w: 2, h: 2 }
}
