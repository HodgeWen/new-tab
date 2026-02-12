# Codebase Concerns

**Analysis Date:** 2025-02-12

## Tech Debt

**WebDAV feature incomplete:**

- Issue: `webdav` package is a dependency and WebDAV credentials UI exists in `setting-modal.vue`, but the package is never imported or used. No sync logic exists.
- Files: `components/setting-modal/setting-modal.vue`, `store/setting.ts`, `types/common.ts`
- Impact: Dead code; credentials stored in `localStorage` (via setting store) with no purpose.
- Fix approach: Either implement WebDAV sync using `createClient` from `webdav`, or remove the UI and dependency.

**Dual storage for grid order:**

- Issue: Grid order lives in `localStorage` (`store/grid-order.ts`) while grid items live in IndexedDB (`utils/db.ts`). Import/export backup does not include grid order.
- Files: `store/grid-order.ts`, `utils/backup.ts`
- Impact: Restore from backup loses custom layout; data split across two storage mechanisms.
- Fix approach: Include grid order in backup schema and/or migrate to single storage strategy.

**Empty resizecontent handler:**

- Issue: `grid.on('resizecontent', throttle((ev, items) => {}, 300))` registers a no-op handler.
- Files: `components/grid-layout/use-grid-stack.tsx` (lines 117–120)
- Impact: Unclear intent; dead code or placeholder.
- Fix approach: Remove or implement resize-related logic.

**Hardcoded styles in setting modal:**

- Issue: `background: rgba(0, 0, 0, 0.05)` and similar values bypass CSS variables.
- Files: `components/setting-modal/setting-modal.vue` (lines 145, 154)
- Impact: Breaks theme consistency per AGENTS.md (must use CSS variables).
- Fix approach: Replace with `var(--glass-bg)`, `var(--glass-border)`, or equivalent design tokens.

**Component store pattern:**

- Issue: Global `components` store holds TemplateRefs; `connectComponents` runs once. Optional chaining (`components.gridLayout?.`) used everywhere.
- Files: `store/components.ts`, `entrypoints/newtab/App.vue`
- Impact: Race risk if modals/actions run before `connectComponents`; non-standard pattern.
- Fix approach: Use `provide/inject` or ensure `connectComponents` runs before any modal/action.

---

## Known Bugs

**Backup import throws on malformed JSON:**

- Symptoms: Unhandled rejection when importing invalid JSON file.
- Files: `utils/backup.ts` (line 32)
- Trigger: User selects file that is not valid JSON; `JSON.parse(text)` throws before `try` block.
- Workaround: Wrap `JSON.parse` in try/catch and return `false` on parse error.

**use-modal watch resets form with stale initialData:**

- Symptoms: Possible form reset to wrong state when modal closes after opening with different data.
- Files: `hooks/use-modal.ts`
- Trigger: `initialData` is set once at creation; `watch(visible)` does `Object.assign(form, initialData)` on close. For modals that open with varying data (e.g. edit mode), behavior depends on whether `open` updates `initialData`.
- Workaround: Current flow appears correct for `open(data)` + close; verify across all modal usages.

---

## Security Considerations

**WebDAV and setting credentials in localStorage:**

- Risk: Passwords stored in plain JSON in `localStorage` via `store/setting.ts`; persisted to disk.
- Files: `store/setting.ts`, `types/common.ts`
- Current mitigation: Settings are local-only; no sync implemented.
- Recommendations: When implementing WebDAV, avoid storing passwords in localStorage; prefer `chrome.storage.encrypted` or extension storage APIs if available.

**User-provided URLs in site links:**

- Risk: `item.url` used in `<a :href="item.url">`; malicious `javascript:` URLs could execute code.
- Files: `components/site-item/site-item.vue`, `components/folder-item/folder-item.vue`
- Current mitigation: User controls own data; no server-side exposure.
- Recommendations: Validate/sanitize URLs to allow only `http(s):`; reject `javascript:`, `data:`, etc.

**Import backup without schema validation:**

- Risk: `importBackupData` uses `JSON.parse(text) as BackupData` with no validation; malformed or adversarial JSON could corrupt IndexedDB.
- Files: `utils/backup.ts`
- Current mitigation: `try/catch` around DB operations; parse errors still unhandled.
- Recommendations: Validate structure (e.g. Zod or manual checks) before `bulkAdd`; handle parse errors.

---

## Performance Bottlenecks

**Blob URL revocation in wallpaper:**

- Problem: `utils/db.ts` `getWallpaper` creates blob URLs; caller must revoke. `hooks/use-wallpaper.ts` manages revoke with `BLOB_REVOKE_DELAY` and `pendingRevokeTimers`.
- Files: `utils/db.ts`, `hooks/use-wallpaper.ts`
- Cause: Blob URLs are not auto-released; delayed revoke avoids race during wallpaper transitions.
- Improvement path: Current design is reasonable; document lifecycle in code comments.

**gridItemsMap and syncList:**

- Problem: `gridItemsMap` is a non-reactive `Map`; `syncList()` must run after every mutation to update `_gridItems`.
- Files: `store/grid-items.ts`
- Cause: Manual sync pattern; any mutation that skips `syncList` causes UI desync.
- Improvement path: Consider reactive Map or derived store; add assertions that `syncList` is always called.

**Deep watch on setting:**

- Problem: `watch(setting, ..., { deep: true })` writes to `localStorage` on every nested change.
- Files: `store/setting.ts`
- Cause: `deep: true` triggers on any property change; can cause frequent writes.
- Improvement path: Debounce or watch specific paths; acceptable for typical usage.

---

## Fragile Areas

**site-modal.vue:**

- Files: `components/site-modal/site-modal.vue` (~452 lines)
- Why fragile: Large component; favicon fetch, URL parsing, fallback icon generation, and form logic bundled together. `latestIconRequestId` race handling is subtle.
- Safe modification: Extract `extractDomainName`, `parseUrl`, `imageUrlToBase64`, `generateTextIconBase64` to shared utils; add unit tests.
- Test coverage: None.

**use-grid-stack.tsx:**

- Files: `components/grid-layout/use-grid-stack.tsx` (~267 lines)
- Why fragile: Bridges GridStack (imperative DOM) with Vue (declarative); `shadowDom` map and `render(vnode, el)` require careful cleanup on unmount.
- Safe modification: Keep `removed` and `onBeforeUnmount` cleanup in sync; avoid direct DOM manipulation outside GridStack callbacks.
- Test coverage: None.

**loadGridItems and gridItemsReady:**

- Files: `store/grid-items.ts`, `components/grid-layout/use-grid-stack.tsx`
- Why fragile: `gridItemsReady = loadGridItems()` runs at module load; `useGridStack` awaits it in `onMounted`. Order of module evaluation and mount matters.
- Safe modification: Document execution order; consider centralizing init in App or a dedicated bootstrap module.
- Test coverage: None.

---

## Scaling Limits

**IndexedDB:**

- Current capacity: Browser storage limits (typically hundreds of MB).
- Limit: Very large grids or many wallpapers could affect performance.
- Scaling path: Paginate or limit grid items; add cleanup for old wallpaper blobs.

**localStorage:**

- Current capacity: ~5–10 MB per origin.
- Limit: Setting object and grid order are small; risk is low.
- Scaling path: Move to IndexedDB if needed.

---

## Dependencies at Risk

**webdav:**

- Risk: Unused; increases bundle size and maintenance.
- Impact: Dead dependency; no functional impact.
- Migration plan: Remove if WebDAV sync is not planned; otherwise implement sync.

**@cat-kit/core:**

- Risk: Used for `throttle` and `o().deepExtend`; small internal package.
- Impact: Unknown maintenance status.
- Migration plan: Consider replacing with `lodash-es` or `throttle` from lodash if sustainability is a concern.

---

## Missing Critical Features

**WebDAV sync:**

- Problem: UI and credentials exist but no sync logic.
- Blocks: Users cannot sync data across devices.

**Test coverage:**

- Problem: No `*.test.*` or `*.spec.*` files found.
- Blocks: Regressions and refactors are harder to validate.

---

## Test Coverage Gaps

**Untested areas:**

- Backup import/export: `utils/backup.ts` (no validation, JSON.parse error handling).
- Grid item CRUD: `store/grid-items.ts` (syncList, batchDelete).
- Wallpaper providers: `utils/wallpaper-providers.ts` (fetch, error handling).
- URL parsing and validation: `site-modal.vue` helpers (`extractDomainName`, `parseUrl`, `normalizeUrl`).
- Files: `utils/backup.ts`, `store/grid-items.ts`, `utils/wallpaper-providers.ts`, `components/site-modal/site-modal.vue`
- Risk: Data corruption, import failures, broken URLs.
- Priority: High for backup; Medium for grid store; Medium for URL validation.

---

_Concerns audit: 2025-02-12_
