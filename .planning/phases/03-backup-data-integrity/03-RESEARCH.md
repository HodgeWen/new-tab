# Phase 3: Backup & Data Integrity - Research

**Researched:** 2026-02-12
**Domain:** Backup export/import, grid order persistence, schema validation
**Confidence:** HIGH

## Summary

Phase 3 addresses two requirements: **BKUP-01** (include grid order in backup export) and **BKUP-02** (schema validation on import). The current implementation exports only `gridItems` from IndexedDB; grid order lives in `localStorage` (`store/grid-order.ts`, key `grid-order`) and is omitted. Import uses `JSON.parse` + type assertion with no validation—malformed or adversarial JSON can corrupt IndexedDB. Research recommends: (1) extend export to read `gridOrder` from the store or localStorage and include it in the backup JSON; (2) add Zod schema validation before any DB write; (3) restore both gridItems and gridOrder on import; (4) surface validation errors to the user.

**Primary recommendation:** Use Zod for schema validation; extend backup schema to `{ gridItems, gridOrder? }`; read gridOrder from `gridOrder` ref (store) for export; on import validate, then bulkAdd + updateGridOrder.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zod | ^3.25.0 | Schema validation | TypeScript-first, safeParse for error handling, no throw, inferred types |
| dexie | ^4.3.0 | IndexedDB (existing) | Backup reads from db.gridItems |
| vue | ^3.5.27 | Reactivity (existing) | gridOrder is ref, watch persists |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none) | — | — | Native JSON.parse, localStorage sufficient |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zod | Manual validation (typeof, Array.isArray) | More boilerplate, error messages harder; Zod is 8kb, well-established |
| Zod | Yup, io-ts | Zod has better TS inference, smaller bundle |

**Installation:**
```bash
npm install zod
```

---

## Architecture Patterns

### Current Backup Flow (from codebase)

```
Export: db.gridItems.toArray() → { gridItems } → JSON.stringify → download
Import: file.text() → JSON.parse → db.gridItems.clear() + bulkAdd(data.gridItems)
```

**Gap:** gridOrder in `store/grid-order.ts` (localStorage key `grid-order`) is never exported or restored.

### Recommended Project Structure

```
utils/
├── backup.ts          # exportBackupData, importBackupData
├── backup-schema.ts   # Zod schema for BackupData (optional separate file)
└── db.ts             # Dexie, unchanged
store/
├── grid-order.ts      # gridOrder ref, updateGridOrder - used by import
└── grid-items.ts     # loadGridItems - must be called after import to refresh UI
```

### Pattern 1: Dual-Source Export (No Storage Migration)

**What:** Export reads from two sources: IndexedDB (gridItems) and store/grid-order (gridOrder). No migration of gridOrder to IndexedDB.

**When to use:** Per STATE.md: "存储保持双轨 — 本次不迁移，BKUP-01 从 localStorage 读取 grid order 导出"

**Example:**
```typescript
// utils/backup.ts
import { gridOrder } from '@/store/grid-order'

export async function exportBackupData(): Promise<void> {
  const gridItems = await db.gridItems.toArray()
  const data = { gridItems, gridOrder: gridOrder.value }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  saveFile(blob)
}
```

### Pattern 2: Schema Validation Before Write

**What:** Parse JSON, validate with Zod schema, reject invalid data before touching IndexedDB.

**When to use:** All user-provided JSON import (BKUP-02).

**Example:**
```typescript
// Zod safeParse - does not throw
const result = schema.safeParse(parsed)
if (!result.success) {
  console.error('[备份]: 数据格式无效', result.error)
  return false
}
// result.data is typed and validated
```

### Anti-Patterns to Avoid

- **Type assertion without validation:** `as BackupData` bypasses runtime checks; never use for user input.
- **Writing before validation:** Do not clear or bulkAdd until schema passes.
- **Silent failure:** Return false and log; UI must surface error to user.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JSON schema validation | Manual typeof/Array.isArray checks | Zod | Zod handles nested objects, unions, refinements; clear error paths |
| URL scheme validation in backup | Inline regex | URL + protocol allow-list (per Phase 1) | Reuse existing pattern; BKUP-02 can add URL check to schema |

**Key insight:** Backup import is untrusted input. Hand-rolled validation is error-prone and incomplete for nested structures (GridItemRecord with SiteItem vs FolderItem discriminated union).

---

## Common Pitfalls

### Pitfall 1: Import Order Without Reloading Grid

**What goes wrong:** Import restores gridOrder to localStorage but GridStack/widgets already rendered; UI doesn't reflect new order.

**Why it happens:** `loadGridItems` runs once at mount; `updateGridOrder` updates ref but doesn't trigger GridStack reload.

**How to avoid:** After import: (1) updateGridOrder; (2) reload gridItems (loadGridItems); (3) GridLayout/useGridStack must re-render widgets in new order. Current `loadWidgets` uses `sortByOrder` which reads gridOrder—so after updateGridOrder + loadGridItems, a page reload or explicit re-initialization may be needed. Verify: does useGridStack re-run loadWidgets when gridOrder changes? If not, consider calling `loadGridItems` and then `loadWidgets` from gridLayout ref after import.

**Warning signs:** User reports "layout wrong after restore" even with gridOrder in backup.

### Pitfall 2: Backward Compatibility

**What goes wrong:** Old backup files have no `gridOrder`; import fails or treats as invalid.

**Why it happens:** New schema expects `gridOrder`; old exports omit it.

**How to avoid:** Make `gridOrder` optional in schema. If absent, derive from `gridItems` order (e.g. `gridItems.map(i => i.id)`) or use empty array.

### Pitfall 3: Validation Error Not Surfaced to User

**What goes wrong:** importBackupData returns false, but caller only checks boolean; user sees no message.

**Why it happens:** backup.ts currently has no UI; when wired, caller must show toast/message when false.

**How to avoid:** Import flow should return `{ success: boolean; error?: string }` or equivalent; UI shows error message on failure. (Plan 03-02 may be backup-only; UI wiring may be in scope of another phase.)

### Pitfall 4: Strict Schema Rejects Valid Legacy Exports

**What goes wrong:** Backup from older version has slightly different shape (e.g. extra optional fields); Zod rejects.

**Why it happens:** `.strict()` or over-specific schema.

**How to avoid:** Use `.passthrough()` or allow extra keys; validate only required fields. Ensure `updatedAt`/`createdAt` are numbers.

---

## Code Examples

### BackupData Schema (Zod)

```typescript
// From types/common.ts + types/db.ts
import { z } from 'zod'

const FolderSize = z.enum(['horizontal', 'vertical', 'square'])

const SiteItemRecordSchema = z.object({
  type: z.literal('site'),
  id: z.string(),
  title: z.string(),
  url: z.string(),
  icon: z.string(),
  pid: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number()
})

const FolderItemRecordSchema = z.object({
  type: z.literal('folder'),
  id: z.string(),
  title: z.string(),
  size: FolderSize,
  createdAt: z.number(),
  updatedAt: z.number()
})

const GridItemRecordSchema = z.discriminatedUnion('type', [
  SiteItemRecordSchema,
  FolderItemRecordSchema
])

export const BackupDataSchema = z.object({
  gridItems: z.array(GridItemRecordSchema),
  gridOrder: z.array(z.string()).optional()
})
```

### Import with Validation

```typescript
// utils/backup.ts
import { BackupDataSchema } from './backup-schema'

export async function importBackupData(file: File): Promise<boolean> {
  const text = await file.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    console.error('[备份]: JSON 解析失败')
    return false
  }
  const result = BackupDataSchema.safeParse(parsed)
  if (!result.success) {
    console.error('[备份]: 数据格式无效', result.error.format())
    return false
  }
  const data = result.data
  try {
    await db.gridItems.clear()
    await db.gridItems.bulkAdd(data.gridItems)
    if (data.gridOrder?.length) {
      updateGridOrder(data.gridOrder)
    } else {
      updateGridOrder(data.gridItems.map(i => i.id))
    }
    await loadGridItems() // Refresh store from DB
    return true
  } catch (error) {
    console.error('[备份]: 失败', error)
    return false
  }
}
```

### URL Scheme Validation in Schema (Optional)

Per Phase 1 and PLCY-02, site URLs must be http/https. Add to SiteItemRecordSchema:

```typescript
url: z.string().refine((val) => {
  try {
    const u = new URL(val)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}, 'URL must be http or https')
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| JSON.parse + as type | Zod safeParse | Phase 3 | Runtime validation, no DB corruption |
| Backup = gridItems only | Backup = gridItems + gridOrder | Phase 3 | Restore preserves layout |

**Deprecated/outdated:**
- Type assertion for user input: Never use `as BackupData` for untrusted JSON.

---

## Open Questions

1. **UI for backup import/export**
   - What we know: backup.ts exists; no component imports it currently
   - What's unclear: Is backup UI in scope for Phase 3 or a separate phase?
   - Recommendation: Plan 03-01 and 03-02 focus on data layer; UI wiring (e.g. export/import buttons in setting modal) may be assumed or deferred. Verify with roadmap.

2. **Grid reload after import**
   - What we know: loadGridItems populates gridItemsMap; useGridStack loads widgets on mount via sortByOrder
   - What's unclear: Does useGridStack expose a reload method? Does gridLayout need to re-mount?
   - Recommendation: After import, call loadGridItems; if gridOrder is updated, gridItems ref may change; check if useGridStack watches gridItems or gridOrder—if not, may need explicit reload or page refresh.

---

## Sources

### Primary (HIGH confidence)
- Project codebase: `utils/backup.ts`, `store/grid-order.ts`, `utils/db.ts`, `types/db.ts`, `types/common.ts`
- Zod docs: https://zod.dev — safeParse, discriminatedUnion, objects

### Secondary (MEDIUM confidence)
- .planning/research/ARCHITECTURE.md — Zod schema recommended
- .planning/research/PITFALLS.md — Backup validation, grid order
- .planning/STATE.md — "存储保持双轨，BKUP-01 从 localStorage 读取 grid order 导出"

### Tertiary (LOW confidence)
- WebSearch: Zod validation patterns

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Zod is industry standard; project research recommends it
- Architecture: HIGH — Codebase structure is clear; dual storage is documented
- Pitfalls: MEDIUM — Grid reload behavior needs verification during implementation

**Research date:** 2026-02-12
**Valid until:** 30 days (stable domain)
