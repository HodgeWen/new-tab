import type { BackupData } from '@/types/db'

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
  const data = { gridItems }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })

  saveFile(blob)
}

/**
 * 导入备份数据
 * @param file - 备份文件
 * @returns 是否成功
 */
export async function importBackupData(file: File): Promise<boolean> {
  const text = await file.text()
  let data: BackupData
  try {
    data = JSON.parse(text) as BackupData
  } catch {
    console.error('[备份]: JSON 解析失败', text.slice(0, 100))
    return false
  }
  try {
    if (data.gridItems) {
      await db.gridItems.clear()
      await db.gridItems.bulkAdd(data.gridItems)
    }
  } catch (error) {
    console.error('[备份]: 失败', error)
    return false
  }
  return true
}
