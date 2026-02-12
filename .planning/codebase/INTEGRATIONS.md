# External Integrations

**Analysis Date:** 2025-02-12

## APIs & External Services

**Wallpaper Providers:**
- **Bing HPImageArchive** - Daily wallpaper images
  - URL: `https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=...&mkt=zh-CN`
  - Usage: `utils/wallpaper-providers.ts` (`BingWallpaperProvider`)
  - Auth: None
- **Picsum Photos** - Random placeholder images
  - URLs: `https://picsum.photos/v2/list`, `https://picsum.photos/id/{id}/1920/1080`
  - Usage: `utils/wallpaper-providers.ts` (`PicsumPhotosWallpaperProvider`)
  - Auth: None

**Search:**
- **Google Search** - Search redirect
  - Usage: `components/searcher/searcher.vue` → `window.location.href = https://www.google.com/search?q=...`
  - Auth: None

**WebDAV:**
- Package `webdav` 5.8.0 present; config UI in `components/setting-modal/setting-modal.vue`
- Credentials stored in `store/setting.ts` (localStorage): `url`, `username`, `password`
- **Status:** Sync logic not implemented; no `createClient` or WebDAV API calls in codebase

## Data Storage

**Databases:**
- **IndexedDB** (via Dexie)
  - Client: `utils/db.ts` → `AppDatabase`
  - DB name: `new-tab-db`
  - Tables: `gridItems` (id), `wallpapers` (id)
  - No connection env var; runs in browser

**File Storage:**
- Local filesystem only (export backup downloads JSON via `utils/backup.ts`)

**Caching:**
- Wallpaper blob cache in IndexedDB `wallpapers` table
- `localStorage` for `setting` and `grid-order`

## Authentication & Identity

**Auth Provider:**
- None
- WebDAV credentials stored locally (url, username, password) for future sync

## Browser Extension APIs

**Chrome APIs:**
- `chrome.runtime.getURL` - Used in `components/site-modal/site-modal.vue` for favicon path `/_favicon/?pageUrl=...&size=64`
- `host_permissions` in `wxt.config.ts`: `bing.com`, `picsum.photos`, `fastly.picsum.photos`
- `permissions`: `search`, `favicon`

**Favicon:**
- Chrome Favicon API: `/_favicon/?pageUrl={url}&size={size}` via `getURL`; then `fetch` + canvas to base64

## Monitoring & Observability

**Error Tracking:**
- None

**Logs:**
- `console.error` in `utils/backup.ts`, `hooks/use-wallpaper.ts`

## CI/CD & Deployment

**Hosting:**
- Chrome Web Store (implied; extension zip via `wxt zip`)

**CI Pipeline:**
- Not detected

## Environment Configuration

**Required env vars:**
- None for build or runtime

**Secrets location:**
- WebDAV credentials in `localStorage` (key `setting`); not env vars

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

---

*Integration audit: 2025-02-12*
