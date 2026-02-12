# Architecture

**Analysis Date:** 2025-02-12

## Pattern Overview

**Overall:** SPA-style Vue 3 Composition API application within a single WXT browser extension entrypoint (new tab override).

**Key Characteristics:**
- Single-page new tab page with glassmorphism UI
- Reactive state via Vue `ref`/`reactive` modules in `store/`
- GridStack for drag-and-drop layout; Dexie (IndexedDB) for persistence
- Imperative component discovery via `connectComponents()` for cross-component calls (modals, grid layout)
- No router—all UI is modal-based or inline

## Layers

**Entry/App:**
- Purpose: Bootstrap Vue app and compose root layout
- Location: `entrypoints/newtab/`
- Contains: `main.ts`, `App.vue`, `index.html`, `style.css`, `styles/`
- Depends on: Vue, components, store, hooks
- Used by: Extension runtime (chrome_url_overrides)

**Components:**
- Purpose: Reusable UI (buttons, inputs, modals, grid items)
- Location: `components/`
- Contains: Vue SFCs with barrel exports via `index.ts`
- Depends on: `store/`, `types/`, `lucide-vue-next`
- Used by: `App.vue`, other components

**Store:**
- Purpose: Shared reactive state and cross-component wiring
- Location: `store/`
- Contains: `grid-items.ts`, `components.ts`, `ui.ts`, `setting.ts`, `grid-order.ts`
- Depends on: Vue reactivity, `utils/db`, `types/`
- Used by: Components, hooks

**Utils:**
- Purpose: Infrastructure (DB, backup, wallpaper providers)
- Location: `utils/`
- Contains: `db.ts`, `backup.ts`, `wallpaper-providers.ts`
- Depends on: Dexie, `types/`
- Used by: Store, hooks

**Hooks:**
- Purpose: Composable logic (modal, wallpaper)
- Location: `hooks/`
- Contains: `use-modal.ts`, `use-wallpaper.ts`
- Depends on: Vue, `store/`, `utils/`
- Used by: Components

**Types:**
- Purpose: Shared TypeScript interfaces
- Location: `types/`
- Contains: `common.ts`, `db.ts`, `ui.ts`
- Depends on: None
- Used by: Store, components, utils

## Data Flow

**Initial Load:**
1. `main.ts` creates Vue app and mounts `App.vue`
2. `App.vue` calls `connectComponents()` with template refs to modals and `NGridLayout`
3. `NGridLayout` uses `useGridStack()` which awaits `loadGridItems()` (from `store/grid-items.ts`)
4. `loadGridItems()` reads from `db.gridItems` (Dexie), populates `gridItemsMap`
5. `useGridStack` loads widgets into GridStack, using `GridStack.renderCB` to render Vue components into each cell
6. `useWallpaper()` initializes from `setting`, fetches or loads cached wallpaper via `db`

**Grid Item CRUD:**
1. User opens modal via context menu or actions → `components.*.open()` (from `connectComponents`)
2. Modal uses `useModal()` for form state; on save calls `addGridItem`/`updateGridItem` from `store/grid-items`
3. `grid-items` updates `gridItemsMap` and `syncList()`, then `db.gridItems.add`/`update`
4. For add: `useGridStack.addWidget()` adds to GridStack and appends to `gridOrder`
5. For update: `components.gridLayout?.updateWidget()` re-renders the cell

**Settings:**
- `setting` is reactive (`store/setting.ts`); `watch` persists to `localStorage` on change
- `gridOrder` is reactive (`store/grid-order.ts`); `watch` persists to `localStorage`
- Modals read/write `setting` directly (e.g. `Object.assign(setting, formData)`)

**State Management:**
- Reactive modules: `gridItems` (readonly ref), `gridItemsMap` (Mutable Map), `ui`, `selectedIds`, `setting`, `gridOrder`
- No Pinia/Vuex—plain Vue reactivity
- Cross-component calls via `store/components` (TemplateRefs to modal/grid instances)

## Key Abstractions

**GridItem / SiteItem / FolderItem:**
- Purpose: Typed data for grid cells (sites and folders)
- Examples: `types/common.ts`, `types/ui.ts`
- Pattern: `FolderItemUI` extends `FolderItem` with `sites?: SiteItemUI[]` for runtime parent-child relationship

**Components store:**
- Purpose: Imperative access to modal and grid layout instances
- Examples: `store/components.ts`
- Pattern: `connectComponents()` called once from `App.vue`; `components.folder?.open()`, `components.gridLayout?.updateWidget()`

**useModal:**
- Purpose: Shared open/close + form state for modals
- Examples: `hooks/use-modal.ts`, used by `folder-modal`, `site-modal`, `setting-modal`
- Pattern: `useModal<T>(initialData)` → `{ visible, form, open }`

**useWallpaper:**
- Purpose: Single wallpaper URL + refresh logic with caching
- Examples: `hooks/use-wallpaper.ts`
- Pattern: Singleton-like; `consumers` count for lazy init/destroy; caches in IndexedDB via `db`

**Context Menu:**
- Purpose: Imperative right-click menu
- Examples: `components/context-menu/context-menu.ts`
- Pattern: `showContextmenu({ x, y, items })` mounts Vue component into body container

## Entry Points

**New Tab Page:**
- Location: `entrypoints/newtab/`
- Triggers: User opens new tab (`chrome_url_overrides.newtab`)
- Responsibilities: Render wallpapered layout with search bar, grid, actions; handle context menu; wire modals

**WXT Entrypoints:**
- Build entry: `wxt.config.ts`; `chrome_url_overrides` points to `/newtab.html`
- Output: `.output/chrome-mv3/` (or similar) with `newtab.html`, `main.ts` bundle

## Error Handling

**Strategy:** Minimal centralized handling; components and utils use try/catch and `console.error` where needed.

**Patterns:**
- `store/setting.ts`: `loadSetting()` catches parse errors, returns defaults
- `store/grid-order.ts`: `loadOrder()` catches parse errors, returns empty array
- `utils/backup.ts`: `importBackupData` returns `false` on failure, logs error
- `hooks/use-wallpaper.ts`: `fetchAndCache` catches fetch errors, returns `false`; IndexedDB errors ignored in load path

## Cross-Cutting Concerns

**Logging:** `console.error` in backup and wallpaper hooks; no structured logger.

**Validation:** URL validation in `site-modal` via `parseUrl`/`normalizeUrl`; form `canSave` computed.

**Authentication:** None; WebDAV credentials stored in `setting.webdav` (localStorage) for future sync (not implemented in current codebase).

---

*Architecture analysis: 2025-02-12*
