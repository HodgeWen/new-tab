import { gridOrder, updateGridOrder } from '@/store/grid-order'
import { BackupDataSchema } from './backup-schema'
import { loadGridItems } from '@/store/grid-items'
import { db } from './db'

function saveFile(blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `new-tab-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * 导出备份数据
 */
export async function exportBackupData(): Promise<void> {
  const gridItems = await db.gridItems.toArray()
  const data = { gridItems, gridOrder: gridOrder.value }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })

  saveFile(blob)
}

/** Result of backup import: success or error with message */
export type ImportBackupResult =
  | { success: true }
  | { success: false; error: string }

/**
 * 导入备份数据
 * @param file - 备份文件
 * @returns 成功返回 { success: true }，失败返回 { success: false, error: string } 供 UI 展示
 */
export async function importBackupData(file: File): Promise<ImportBackupResult> {
  const text = await file.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    console.error('[备份]: JSON 解析失败', text.slice(0, 100))
    return { success: false, error: 'JSON 解析失败' }
  }

  const result = BackupDataSchema.safeParse(parsed)
  if (!result.success) {
    console.error('[备份]: 数据格式无效', result.error.message)
    return { success: false, error: result.error.message }
  }

  const data = result.data
  try {
    await db.gridItems.clear()
    await db.gridItems.bulkAdd(data.gridItems)
    if (data.gridOrder?.length) {
      updateGridOrder(data.gridOrder)
    } else if (data.gridItems.length > 0) {
      updateGridOrder(data.gridItems.map((i) => i.id))
    }
    await loadGridItems()
  } catch (error) {
    console.error('[备份]: 失败', error)
    return { success: false, error: error instanceof Error ? error.message : '导入失败' }
  }
  return { success: true }
}
