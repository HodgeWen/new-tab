# Phase 2: Bug Fixes - Research

**Researched:** 2025-02-12
**Domain:** WXT/Vite dev tooling, error handling, GridStack events, CORS proxy
**Confidence:** HIGH

## Summary

Phase 2 addresses four discrete bugs: WXT `#imports` alias incompatibility in standalone Vite mode (BUGF-01), unhandled JSON parse errors in backup import (BUGF-02), dead code in GridStack event handling (BUGF-03), and CORS blocking wallpaper fetches in dev:web (BUGF-04). Each fix is localized and low-risk. BUGF-01 may already be resolved in the codebase (setting-modal.vue uses `import { computed } from 'vue'`; PROJECT.md notes "已修复，待提交"). BUGF-02–04 require targeted code changes. The Vite proxy pattern is documented in existing planning research (STACK.md) and aligns with official Vite docs.

**Primary recommendation:** Apply fixes in order BUGF-01 (verify/commit) → BUGF-02 → BUGF-03 → BUGF-04. Use Vite `server.proxy` for CORS; no third-party proxy or CORS extension.

## User Constraints

No CONTEXT.md exists for this phase — no locked decisions, discretion areas, or deferred ideas.

---

## Standard Stack

### Core

| Library   | Version        | Purpose              | Why Standard                                                      |
| --------- | -------------- | -------------------- | ----------------------------------------------------------------- |
| Vue       | ^3.5.x         | UI framework         | Project standard; use `import { ... } from 'vue'` for Vue APIs    |
| WXT       | ^0.20.13       | Extension framework  | Project standard; `#imports` only available when WXT build runs   |
| Vite      | ^5.x (via WXT) | Dev server, bundling | Build-in `server.proxy` for CORS bypass; no external proxy needed |
| GridStack | ^12.4.2        | Grid layout          | Event API: `grid.on('eventName', handler)`; remove no-op handlers |

### Don't Change

| Technology    | Purpose   | Notes                                                     |
| ------------- | --------- | --------------------------------------------------------- |
| Dexie         | IndexedDB | Backup import writes to `db.gridItems`; keep existing API |
| @cat-kit/core | throttle  | Used in use-grid-stack; keep if other handlers use it     |

**Installation:** No new packages required for this phase.

---

## Architecture Patterns

### BUGF-01: #imports vs dev:web

**What:** WXT provides `#imports` as a virtual module re-exporting Vue APIs and WXT utilities. When running `npm run dev:web` (standalone Vite via `vite` CLI), the WXT build pipeline does not run; `#imports` is unresolved and causes a module-not-found error.

**Fix:** Import Vue APIs directly from `'vue'`:

```typescript
// Wrong (breaks in dev:web)
import { computed } from '#imports'

// Correct
import { computed } from 'vue'
```

**Current state:** `setting-modal.vue` already uses `import { computed } from 'vue'` (line 79). No `#imports` usage found in source files. Verify no other entrypoints or components use `#imports`; if clean, mark BUGF-01 done and commit.

**Source:** WXT Auto-imports docs — `#imports` is WXT-specific; Nuxt-style module resolution. Standalone Vite does not provide it.

---

### BUGF-02: JSON.parse Error Handling

**What:** `importBackupData` currently has `JSON.parse(text)` outside the try block. Malformed JSON throws `SyntaxError` before the catch block, crashing the import flow with no user feedback.

**Fix:** Wrap parsing in try/catch and return `false` on parse failure:

```typescript
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
    const { gridItems } = data
    if (gridItems) {
      await db.gridItems.clear()
      await db.gridItems.bulkAdd(gridItems)
    }
  } catch (error) {
    console.error('[备份]: 失败', error)
    return false
  }
  return true
}
```

**Scope:** BUGF-02 only requires parse error handling. Schema validation (BKUP-02) is out of scope for this phase.

---

### BUGF-03: Dead resizecontent Handler

**What:** `use-grid-stack.tsx` registers an empty `resizecontent` handler. It does nothing and adds unnecessary overhead.

**Fix:** Remove the handler entirely:

```typescript
// Remove lines 118-121:
grid.on(
  'resizecontent',
  throttle((ev, items) => {}, 300)
)
```

**Note:** GridStack has `disableResize: true` in the config (line 90), so resize events may not fire; either way, the handler is dead code.

---

### BUGF-04: Vite Proxy for Wallpaper CORS

**What:** In `dev:web`, the page runs at `localhost:5173`. Fetching `bing.com` and `picsum.photos` triggers CORS. In extension mode (`wxt dev`), `host_permissions` exempt these origins, so CORS is not an issue.

**Fix:** Add `server.proxy` in `vite.config.ts` and use proxy URLs in `wallpaper-providers.ts` when running in dev:web.

**1. vite.config.ts:**

```typescript
server: {
  port: 5173,
  open: false,
  proxy: {
    '/api/picsum': {
      target: 'https://picsum.photos',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/picsum/, ''),
    },
    '/api/bing': {
      target: 'https://www.bing.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/bing/, ''),
    },
  },
},
```

**2. wallpaper-providers.ts** — use proxy base when in dev:web:

```typescript
const isDevWeb = import.meta.env.DEV && !window.location.href.startsWith('chrome-extension://')
const API_BASE = isDevWeb
  ? { picsum: '/api/picsum', bing: '/api/bing' }
  : { picsum: 'https://picsum.photos', bing: 'https://www.bing.com' }
```

Then replace hardcoded `https://picsum.photos` and `https://www.bing.com` in `fetchPicsumList`, `BingWallpaperProvider`, and `PicsumPhotosWallpaperProvider` with `API_BASE.picsum` and `API_BASE.bing`.

**Picsum:** list at `{picsum}/v2/list`, image at `{picsum}/id/{id}/1920/1080`.
**Bing:** API at `{bing}/HPImageArchive.aspx`, image at `{bing}{image.url}`.

**Source:** Vite server.proxy docs; `.planning/research/STACK.md`.

---

## Don't Hand-Roll

| Problem                    | Don't Build                         | Use Instead                                    | Why                                                                |
| -------------------------- | ----------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------ |
| CORS bypass                | Custom proxy server, CORS extension | Vite `server.proxy`                            | Built-in, same-origin in dev, no extra deps                        |
| JSON parse safety          | Manual regex validation             | try/catch around JSON.parse                    | Covers all malformed JSON; schema validation is separate (BKUP-02) |
| Dev vs extension detection | Hardcoded env vars                  | `import.meta.env.DEV` + `window.location.href` | Reliable, no build-time config needed                              |

---

## Common Pitfalls

### Pitfall 1: JSON.parse try/catch Scope

**What goes wrong:** try/catch only around DB operations; parse errors escape.

**Why it happens:** Parse is done before the try block.

**How to avoid:** Wrap `JSON.parse` in its own try/catch; handle parse and DB errors separately.

**Warning signs:** User selects malformed JSON file → uncaught SyntaxError in console.

---

### Pitfall 2: Proxy Path Rewriting

**What goes wrong:** `/api/bing/HPImageArchive.aspx` not rewritten correctly; 404.

**Why it happens:** `rewrite` must strip the `/api/bing` prefix so the target receives `/HPImageArchive.aspx`.

**How to avoid:** Use `path.replace(/^\/api\/bing/, '')` (or `/api/picsum` for Picsum). Test with `fetch('/api/bing/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN')` in dev:web.

**Warning signs:** Network tab shows 404 for proxied requests.

---

### Pitfall 3: Wrong Config File for dev:web

**What goes wrong:** Adding proxy to `wxt.config.ts` under `vite: () => ({...})` — may not apply when running `vite` directly.

**Why it happens:** `npm run dev:web` runs `vite`, which uses root `vite.config.ts`. WXT's `vite` callback is for `wxt dev` / `wxt build`.

**How to avoid:** Add `server.proxy` to `vite.config.ts` (the one used by `vite` CLI).

---

### Pitfall 4: Wallpaper Provider Using Wrong Base in Extension

**What goes wrong:** Production extension uses proxy URLs; fetches fail (no proxy in prod).

**Why it happens:** `isDevWeb` logic inverted or `import.meta.env.DEV` true in extension dev build.

**How to avoid:** `isDevWeb = import.meta.env.DEV && !window.location.href.startsWith('chrome-extension://')`. In extension (dev or prod), origin is chrome-extension:// → use real URLs.

---

## Code Examples

### Vite server.proxy (BUGF-04)

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api/picsum': {
        target: 'https://picsum.photos',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/picsum/, '')
      },
      '/api/bing': {
        target: 'https://www.bing.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/bing/, '')
      }
    }
  }
})
```

**Source:** [Vite server.proxy](https://vitejs.dev/config/server-options.html#server-proxy)

---

### JSON.parse with Error Handling (BUGF-02)

```typescript
try {
  data = JSON.parse(text) as BackupData
} catch (err) {
  console.error('[备份]: JSON 解析失败', err)
  return false
}
```

**Source:** Standard JavaScript pattern; MDN JSON.parse.

---

## State of the Art

| Old Approach                       | Current Approach                   | When Changed | Impact                   |
| ---------------------------------- | ---------------------------------- | ------------ | ------------------------ |
| CORS extension / third-party proxy | Vite server.proxy                  | Vite 2.x     | No extra tools; dev-only |
| #imports for Vue in WXT            | Explicit `from 'vue'` when dev:web | Manual       | Cross-mode compatibility |

**Deprecated/outdated:**

- `#imports` for Vue APIs in dual-mode (WXT + standalone Vite) projects — use `'vue'` imports.

---

## Open Questions

1. **BUGF-01 verification**
   - What we know: setting-modal.vue uses `from 'vue'`; no `#imports` in source.
   - What's unclear: Whether another file or generated code still uses `#imports`.
   - Recommendation: Grep for `#imports` in `*.vue`, `*.ts`, `*.tsx`; if none, mark done.

2. **Picsum fastly subdomain**
   - What we know: manifest has `fastly.picsum.photos` for image CDN.
   - What's unclear: Whether Picsum redirects to fastly; proxy may need to handle that.
   - Recommendation: Proxy `/api/picsum` to `https://picsum.photos`; if 302 to fastly, may need additional proxy entry. Test first; often not needed.

---

## Sources

### Primary (HIGH confidence)

- [Vite server.proxy](https://vitejs.dev/config/server-options.html#server-proxy) — proxy config, rewrite
- [WXT Auto-imports](https://wxt.dev/guide/essentials/config/auto-imports.html) — `#imports` module, explicit imports
- `.planning/research/STACK.md` — CORS proxy pattern, dev:web detection

### Secondary (MEDIUM confidence)

- Project codebase: `setting-modal.vue`, `utils/backup.ts`, `use-grid-stack.tsx`, `wallpaper-providers.ts`, `vite.config.ts`

### Tertiary (LOW confidence)

- WebSearch: WXT #imports in dev:web — general understanding; codebase review is authoritative.

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — project stack and versions confirmed
- Architecture: HIGH — patterns from official docs and project research
- Pitfalls: HIGH — based on codebase and common proxy/CORS issues

**Research date:** 2025-02-12
**Valid until:** ~30 days (stable tooling)
