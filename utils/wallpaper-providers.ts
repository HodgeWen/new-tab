import type { WallpaperProvider } from '@/types/common'

export const BingWallpaperProvider: WallpaperProvider = {
  name: 'Bing 每日壁纸',
  id: 'bing',
  getWallpaper: async () => {
    const res = await fetch(
      'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN'
    )
    const data = await res.json()
    const image = data.images[0]
    const baseUrl = 'https://www.bing.com'

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
  getWallpaper: async () => {
    const res = await fetch('https://picsum.photos/v2/random')
    const photo = await res.json()

    return {
      id: photo.id,
      url: `https://picsum.photos/id/${photo.id}/1920/1080`,
      thumbUrl: `https://picsum.photos/id/${photo.id}/400/240`,
      author: photo.author ?? '',
      authorUrl: photo.url ?? '',
      downloadUrl: `https://picsum.photos/id/${photo.id}/1920/1080`
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
