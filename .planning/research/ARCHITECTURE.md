# Architecture Research

**Domain:** Chrome Manifest V3 new tab page extension  
**Researched:** 2025-02-12  
**Confidence:** HIGH

## Research Scope

This document addresses architecture for quality and reliability of a Chrome MV3 new tab extension (Vue 3.5 + WXT), with focus on:

- Data layer patterns and storage strategies
- Dev vs production environment handling
- Integration of bug fixes, backup improvements, and UI polish with the existing architecture

---

## Current Architecture (from codebase)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Entry Layer (entrypoints/newtab/)                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  main.ts → App.vue → connectComponents() + NGridLayout + modals                │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Component Layer (components/)                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ GridLayout  │ │ SiteModal   │ │ FolderModal  │ │ SettingModal│          │
│  │ useGridStack│ │ useModal    │ │ useModal    │ │ useModal    │          │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘          │
└────────┼───────────────┼───────────────┼───────────────┼──────────────────┘
         │               │               │               │
         ▼               ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Store Layer (store/)                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │
│  │ grid-items   │ │ grid-order   │ │ setting       │ │ components   │      │
│  │ gridItemsMap │ │ gridOrder    │ │ setting       │ │ (refs)       │      │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────────────┘      │
└────────┼────────────────┼────────────────┼────────────────────────────────┘
         │                │                │
         ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Data Persistence Layer                               │
│  ┌────────────────────────────────────┐  ┌────────────────────────────────┐ │
│  │ IndexedDB (Dexie)                  │  │ localStorage                   │ │
│  │ - gridItems                        │  │ - setting                      │ │
│  │ - wallpapers (blobs)               │  │ - grid-order                   │ │
│  │ utils/db.ts                        │  │ store/setting.ts, grid-order.ts│ │
│  └────────────────────────────────────┘  └────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Recommended Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         UI Layer (Vue Components)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  Components → Store (reactive state) → NO direct storage access              │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Data Layer (store/)                                  │
│  Single source of truth: gridItems, gridOrder, setting all owned by store     │
│  Persistence via explicit store → persistence layer calls                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Persistence Layer (utils/)                            │
│  Unified storage: IndexedDB (Dexie) as single backend for all user data      │
│  Backup reads from single source; export/import includes full dataset        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| **Entry (main.ts, App.vue)** | Bootstrap Vue, connect modal/grid refs | Components, store |
| **Components** | UI rendering, user input, call store actions | Store (read/write only) |
| **Store (grid-items, grid-order, setting)** | Reactive state, business logic, orchestrate persistence | Persistence layer (utils) |
| **Persistence (utils/db, utils/backup)** | IndexedDB CRUD, backup export/import | Store only |
| **Hooks (use-modal, use-wallpaper)** | Composable logic, cache lifecycle | Store, persistence |

**Rule:** Components never call `db.*` or `localStorage` directly. All persistence goes through store actions that delegate to the persistence layer.

---

## Data Layer Patterns

### Pattern 1: Unified Storage (IndexedDB via Dexie)

**What:** Store all user data (grid items, grid order, settings) in a single IndexedDB database.

**Why:**  
- Backup/restore reads from one source; no partial restore (current backup misses grid order).  
- Chrome docs: IndexedDB works in extension pages and service workers; localStorage does not work in service workers. For new-tab override pages (extension context), both work today, but IndexedDB is the consistent choice if you ever add background logic.  
- `chrome.storage.local` is 10 MB default; IndexedDB scales better for blobs (wallpapers) and large collections.

**When to use:** For any extension that needs structured data, blobs, or reliable backup.

**Example schema extension:**

```typescript
// utils/db.ts — extend Dexie schema
this.version(2).stores({
  gridItems: 'id',
  wallpapers: 'id',
  appMeta: 'key'  // key-value for setting, gridOrder
})
```

**Migration:** Add `appMeta` table; migrate `setting` and `grid-order` from localStorage on first load; then remove localStorage usage.

---

### Pattern 2: Store-Owned Persistence (Explicit Save)

**What:** Store modules own reactive state; persistence is triggered explicitly by store actions or a debounced watcher, not by deep watchers on every nested change.

**Why:**  
- `watch(setting, ..., { deep: true })` writes to storage on every nested change; can cause excessive writes.  
- Explicit save gives control over batching and error handling.

**When to use:** For any reactive object that must persist.

**Example:**

```typescript
// store/setting.ts
export function saveSetting(data: Partial<Setting>) {
  Object.assign(setting, data)
  persistSetting(setting)  // single write
}

// On load: db.appMeta.get('setting').then(...)
// On change: debounced persistSetting or explicit saveSetting() in modal close
```

---

### Pattern 3: Single Backup Schema

**What:** Backup file includes `gridItems`, `gridOrder`, and `setting` in one JSON structure. Import validates schema before writing.

**Why:**  
- Current backup omits grid order; restore loses layout.  
- Single export/import path avoids partial state.

**Example:**

```typescript
// types/db.ts
export interface BackupData {
  gridItems: GridItemRecord[]
  gridOrder: string[]
  setting: Setting
}

// utils/backup.ts — export
const data: BackupData = {
  gridItems: await db.gridItems.toArray(),
  gridOrder: gridOrder.value,
  setting: { ...setting }
}
```

---

## Storage Strategy: Recommendation

| Data | Current | Recommended | Rationale |
|------|---------|--------------|-----------|
| Grid items | IndexedDB | IndexedDB | Keep; structured, scales |
| Grid order | localStorage | IndexedDB (appMeta) | Unify; include in backup |
| Setting | localStorage | IndexedDB (appMeta) | Unify; single backup source |
| Wallpapers | IndexedDB | IndexedDB | Keep; blobs require IDB |

**Do not** migrate to `chrome.storage.local` for grid items or wallpapers — quota limits and JSON-only values make it unsuitable. Use IndexedDB as the single backend.

**Optional:** Use `chrome.storage.local` only for tiny key-value (e.g. "lastBackupVersion") if you need cross-context access from a future service worker. For a new-tab-only extension, IndexedDB is sufficient.

---

## Dev vs Production Environment Handling

### CORS Differences

**Problem:** Production extensions send `chrome-extension://[id]` as origin; unpacked dev extensions may behave differently. Some APIs (e.g. Bing, Picsum) may not include `chrome-extension://` in `Access-Control-Allow-Origin`.

**Mitigation:**

1. **Declare `host_permissions`** for all fetch targets (already done: bing.com, picsum.photos).
2. **Use extension page context:** New tab override runs as `chrome-extension://` page; fetch from extension pages is same-origin to the extension. Host permissions allow cross-origin fetch to listed domains.
3. **If CORS still fails in production:** Use a background script as a fetch proxy — background has broader cross-origin privileges. New-tab page sends message to background; background fetches and returns result.

**Detection:** Use `import.meta.env.DEV` or `import.meta.env.MODE` to enable verbose logging in dev; consider a fetch wrapper that logs failures only in dev.

### Environment Detection

**WXT/Vite:** `import.meta.env.MODE` is `development` for `wxt start`, `production` for `wxt build`/`wxt zip`.

```typescript
const isDev = import.meta.env.DEV

if (isDev) {
  console.debug('[Storage] Loaded', count, 'items')
}
```

**Use for:** Logging, optional mock data, or feature flags. Do not branch core persistence logic by environment.

---

## Data Flow

### Initial Load

```
main.ts
  → App.vue mounted
  → connectComponents()
  → useGridStack: await loadGridItems()
  → loadGridItems(): db.gridItems.toArray() → gridItemsMap → syncList()
  → useGridStack: load gridOrder, sortByOrder, render widgets
  → useWallpaper: loadSetting, db.getWallpaper or fetch
```

### Grid Item CRUD

```
User action (add/edit/delete)
  → Component calls store action (addGridItem, updateGridItem, deleteGridItem)
  → Store: update gridItemsMap, syncList()
  → Store: db.gridItems.add|update|delete (async)
  → gridOrder: appendToOrder, removeFromOrder, updateGridOrder (persisted separately today)
```

### Backup Export

```
Current: db.gridItems.toArray() → JSON → download
Target:  db.gridItems + gridOrder + setting → BackupData → JSON → download
```

### Backup Import

```
Current: JSON.parse → db.gridItems.clear + bulkAdd (no validation, no gridOrder)
Target:  JSON.parse → validate BackupData (Zod or manual) → db write + gridOrder + setting update
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Dual Storage Without Unified Backup

**What:** Grid items in IndexedDB, settings/order in localStorage; backup exports only grid items.

**Why bad:** Restore loses layout and settings; data split across two mechanisms.

**Instead:** Single storage backend (IndexedDB) and backup schema that includes all user data.

---

### Anti-Pattern 2: Deep Watch for Persistence

**What:** `watch(obj, persist, { deep: true })` on every nested change.

**Why bad:** Frequent writes; no batching; hard to handle errors.

**Instead:** Explicit save on user actions (e.g. modal close), or debounced persist.

---

### Anti-Pattern 3: Component → Storage Bypass

**What:** Components call `db.*` or `localStorage` directly.

**Why bad:** Breaks single source of truth; backup logic must chase multiple writers.

**Instead:** Components only call store actions; store delegates to persistence.

---

### Anti-Pattern 4: JSON.parse Without Validation

**What:** `JSON.parse(text) as BackupData` with no checks.

**Why bad:** Malformed or adversarial JSON can corrupt IndexedDB.

**Instead:** Validate shape (e.g. Zod) before any db write; return `false` on parse/validation error.

---

### Anti-Pattern 5: Ignoring CORS in Production

**What:** Fetch works in dev (localhost) but fails in production (`chrome-extension://`).

**Why bad:** Users get broken wallpaper/sync in production.

**Instead:** Test against packed extension; use background fetch proxy if needed.

---

## Build Order (Dependencies)

For integrating bug fixes, backup improvements, and UI polish:

```
1. Data Layer (unified storage)
   - Add appMeta table to Dexie
   - Migrate setting, gridOrder from localStorage to IndexedDB
   - Store modules use db.appMeta for persistence

2. Backup Improvements
   - Extend BackupData to include gridOrder, setting
   - Add schema validation (Zod) to importBackupData
   - Wrap JSON.parse in try/catch

3. Bug Fixes (can run in parallel with 1–2)
   - Parse error handling in importBackupData
   - Component store race (ensure connectComponents before modal open)

4. UI Polish
   - Replace hardcoded styles in setting-modal with CSS variables
   - Any visual tweaks
```

**Rationale:** Backup depends on unified storage (gridOrder must live in IndexedDB to be exported). Bug fixes are independent. UI polish has no data dependencies.

---

## Scalability Considerations

| Scale | Adjustment |
|-------|-------------|
| 0–500 grid items | Current design fine |
| 500–2000 items | Paginate or virtualize grid; consider lazy load for folder contents |
| 2000+ items | IndexedDB pagination; avoid loading full `toArray()` on init |

**Wallpapers:** Blob cache is bounded by `current` and `next` keys; no scaling concern.

---

## Sources

- [Chrome Storage and Cookies](https://developer.chrome.com/docs/extensions/develop/concepts/storage-and-cookies) — Extension storage behavior, IndexedDB in service workers
- [chrome.storage API](https://developer.chrome.com/docs/extensions/reference/storage) — Permissions, quotas, recommended over localStorage
- [WXT Build Modes](https://wxt.dev/guide/essentials/config/build-mode.html) — `import.meta.env.MODE` for dev vs production
- [CORS in Chrome Extensions](https://groups.google.com/a/chromium.org/g/chromium-extensions/c/R8Aq720qMCE) — Dev vs production origin differences
- [Dexie Migration](https://dexie.org/docs/Tutorial/Migrating-existing-DB-to-Dexie) — Schema evolution
- Codebase: `.planning/codebase/ARCHITECTURE.md`, `CONCERNS.md`

---

*Architecture research for: Chrome MV3 new tab extension*  
*Researched: 2025-02-12*
