import type { WallpaperProvider } from '@/types/common'

const isDevWeb =
  import.meta.env.DEV && !window.location.href.startsWith('chrome-extension://')
const API_BASE = isDevWeb
  ? { picsum: '/api/picsum', bing: '/api/bing' }
  : { picsum: 'https://picsum.photos', bing: 'https://www.bing.com' }

interface PicsumPhoto {
  id: string
  author: string
  url: string
}

async function fetchPicsumList(page: number, limit: number): Promise<PicsumPhoto[]> {
  const res = await fetch(`${API_BASE.picsum}/v2/list?page=${page}&limit=${limit}`)
  if (!res.ok) {
    throw new Error(`Picsum list request failed: ${res.status}`)
  }

  const data = await res.json()
  if (!Array.isArray(data)) {
    throw new Error('Picsum list response is invalid')
  }

  return data as PicsumPhoto[]
}

export const BingWallpaperProvider: WallpaperProvider = {
  name: 'Bing 每日壁纸',
  id: 'bing',
  refreshable: false,
  getWallpaper: async (options) => {
    const count = options?.force ? 8 : 1
    const res = await fetch(
      `${API_BASE.bing}/HPImageArchive.aspx?format=js&idx=0&n=${count}&mkt=zh-CN`
    )
    const data = await res.json()
    const images: any[] = Array.isArray(data.images) ? data.images : []
    const image =
      images.find(
        (item) => !options?.excludeId || (item.hsh || item.startdate) !== options.excludeId
      ) || images[0]

    if (!image) {
      throw new Error('Bing wallpaper response is empty')
    }

    const baseUrl = API_BASE.bing

    // copyright 格式: "描述 (© 作者/来源)"
    const authorMatch = image.copyright?.match(/\(©\s*(.+?)\)/)
    const author = authorMatch ? authorMatch[1] : (image.copyright ?? '')

    return {
      id: image.hsh || image.startdate,
      url: `${baseUrl}${image.url}`,
      thumbUrl: `${baseUrl}${image.urlbase}_400x240.jpg`,
      author,
      authorUrl: image.copyrightlink ?? '',
      downloadUrl: `${baseUrl}${image.url}`
    }
  }
}

export const PicsumPhotosWallpaperProvider: WallpaperProvider = {
  name: 'Picsum Photos',
  id: 'picsum-photos',
  refreshable: true,
  getWallpaper: async (options) => {
    let photo: PicsumPhoto | undefined

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const page = Math.floor(Math.random() * 50) + 1
      const list = await fetchPicsumList(page, 1)
      const candidate = list[0]
      if (!candidate) continue
      if (options?.excludeId && candidate.id === options.excludeId) continue
      photo = candidate
      break
    }

    if (!photo) {
      const fallbackList = await fetchPicsumList(1, 100)
      const candidates = options?.excludeId
        ? fallbackList.filter((item) => item.id !== options.excludeId)
        : fallbackList
      photo = candidates[Math.floor(Math.random() * candidates.length)] || fallbackList[0]
    }

    if (!photo) {
      throw new Error('Picsum wallpaper response is empty')
    }

    return {
      id: photo.id,
      url: `${API_BASE.picsum}/id/${photo.id}/1920/1080`,
      thumbUrl: `${API_BASE.picsum}/id/${photo.id}/400/240`,
      author: photo.author ?? '',
      authorUrl: photo.url ?? '',
      downloadUrl: `${API_BASE.picsum}/id/${photo.id}/1920/1080`
    }
  }
}

/** 所有可用的壁纸源 */
export const wallpaperProviders: WallpaperProvider[] = [
  BingWallpaperProvider,
  PicsumPhotosWallpaperProvider
]

/** 根据 ID 获取壁纸源 */
export function getWallpaperProvider(id: string): WallpaperProvider | undefined {
  return wallpaperProviders.find((p) => p.id === id)
}
