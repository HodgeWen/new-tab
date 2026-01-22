import { createClient, type WebDAVClient, type FileStat } from 'webdav'
import { encrypt, decrypt } from '@/utils/crypto'
import type { Settings } from '@/types'
import { db } from './database'

interface BackupFile {
  name: string
  path: string
  lastModified: Date
  size: number
}

class WebDAVService {
  private client: WebDAVClient | null = null
  private readonly backupPath = '/new-tab-backups'
  private readonly settingsStorageKey = 'new-tab-settings'

  private readSettingsFromStorage(): Partial<Settings> {
    try {
      const raw = localStorage.getItem(this.settingsStorageKey)
      return raw ? (JSON.parse(raw) as Partial<Settings>) : {}
    } catch {
      return {}
    }
  }

  /**
   * 初始化 WebDAV 客户端
   */
  async connect(
    url: string,
    username: string,
    password: string
  ): Promise<boolean> {
    try {
      this.client = createClient(url, {
        username,
        password
      })

      // 测试连接
      await this.client.exists('/')
      return true
    } catch {
      this.client = null
      return false
    }
  }

  /**
   * 测试连接
   */
  async testConnection(
    url: string,
    username: string,
    password: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const testClient = createClient(url, { username, password })
      await testClient.exists('/')
      return { success: true, message: '连接成功' }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '连接失败'
      }
    }
  }

  /**
   * 确保备份目录存在
   */
  private async ensureBackupDir(): Promise<void> {
    if (!this.client) return

    const exists = await this.client.exists(this.backupPath)
    if (!exists) {
      await this.client.createDirectory(this.backupPath)
    }
  }

  /**
   * 创建备份
   */
  async backup(): Promise<{
    success: boolean
    filename?: string
    message?: string
  }> {
    if (!this.client) {
      return { success: false, message: '未连接到 WebDAV 服务器' }
    }

    try {
      await this.ensureBackupDir()

      const data = await db.exportData()
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .slice(0, 19)
      const filename = `new-tab-backup-${timestamp}.json`
      const filepath = `${this.backupPath}/${filename}`

      await this.client.putFileContents(filepath, data, {
        contentLength: new Blob([data]).size
      })

      return { success: true, filename }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '备份失败'
      }
    }
  }

  /**
   * 获取备份文件列表
   */
  async listBackups(): Promise<BackupFile[]> {
    if (!this.client) return []

    try {
      await this.ensureBackupDir()

      const contents = (await this.client.getDirectoryContents(
        this.backupPath
      )) as FileStat[]

      return contents
        .filter(item => item.type === 'file' && item.basename.endsWith('.json'))
        .map(item => ({
          name: item.basename,
          path: item.filename,
          lastModified: new Date(item.lastmod),
          size: item.size
        }))
        .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
    } catch {
      return []
    }
  }

  /**
   * 恢复备份
   */
  async restore(
    filepath: string
  ): Promise<{ success: boolean; message?: string }> {
    if (!this.client) {
      return { success: false, message: '未连接到 WebDAV 服务器' }
    }

    try {
      const data = (await this.client.getFileContents(filepath, {
        format: 'text'
      })) as string
      const success = await db.importData(data)

      if (success) {
        return { success: true }
      } else {
        return { success: false, message: '数据格式无效' }
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '恢复失败'
      }
    }
  }

  /**
   * 删除备份
   */
  async deleteBackup(filepath: string): Promise<boolean> {
    if (!this.client) return false

    try {
      await this.client.deleteFile(filepath)
      return true
    } catch {
      return false
    }
  }

  /**
   * 保存加密的 WebDAV 配置
   */
  async saveConfig(config: {
    url: string
    username: string
    password: string
  }): Promise<void> {
    const encryptedPassword = await encrypt(config.password)
    const storedSettings = this.readSettingsFromStorage()
    const storedWebdav =
      storedSettings.webdav && typeof storedSettings.webdav === 'object'
        ? storedSettings.webdav
        : undefined

    const nextSettings: Partial<Settings> = {
      ...storedSettings,
      webdav: {
        ...storedWebdav,
        enabled: storedWebdav?.enabled ?? true,
        url: config.url,
        username: config.username,
        password: encryptedPassword
      }
    }

    localStorage.setItem(this.settingsStorageKey, JSON.stringify(nextSettings))
  }

  /**
   * 加载 WebDAV 配置并自动连接
   */
  async autoConnect(): Promise<boolean> {
    try {
      const storedSettings = this.readSettingsFromStorage()
      const webdavConfig = storedSettings.webdav

      if (
        !webdavConfig ||
        typeof webdavConfig !== 'object' ||
        !webdavConfig.url ||
        !webdavConfig.username ||
        !webdavConfig.password
      ) {
        return false
      }

      const password = await decrypt(webdavConfig.password)
      if (!password) return false

      return await this.connect(
        webdavConfig.url,
        webdavConfig.username,
        password
      )
    } catch {
      return false
    }
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.client = null
  }

  /**
   * 检查是否已连接
   */
  isConnected(): boolean {
    return this.client !== null
  }
}

export const webdavService = new WebDAVService()
