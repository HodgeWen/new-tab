import { FolderSizeName, GridSize } from '@/types'

/**
 * 预设文件夹尺寸配置
 */
export const FOLDER_SIZE_PRESETS: Record<
  FolderSizeName,
  GridSize & { label: string; desc: string }
> = {
  wide: { w: 2, h: 1, label: '2×1', desc: '宽扁型' },
  square: { w: 2, h: 2, label: '2×2', desc: '正方形' },
  narrow: { w: 1, h: 2, label: '1×2', desc: '窄高型' }
}
