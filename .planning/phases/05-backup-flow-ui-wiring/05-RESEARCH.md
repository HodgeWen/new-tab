# Phase 5: Backup Flow UI Wiring - Research

**Researched:** 2026-02-12
**Domain:** Vue UI wiring, file selection, backup export/import UX
**Confidence:** HIGH

## Summary

Phase 5 wires the existing data-layer backup logic (`utils/backup.ts`) into the UI. The data layer is complete: `exportBackupData()` triggers a JSON download; `importBackupData(file)` validates via Zod, writes to IndexedDB, and returns `ImportBackupResult` (`{ success: true }` or `{ success: false, error: string }`). The gap is purely UI: no component calls these functions, and no UI entry point exists for users to trigger export or select a file for import.

Entry points: **setting-modal** (recommended) or **actions bar**. The audit names `components/setting-modal/setting-modal.vue` and `components/actions/actions.vue` as lacking backup actions. Settings modal is the better fit: backup is a data-management action, not a frequent toolbar action; the modal already has section structure (WebDAV) and can host export button + import file picker.

Technical components: **NUpload** already exists and supports `accept`, `@pick` with File; use `accept=".json,application/json"` for import. Export is a single button click → `exportBackupData()`. Import feedback: no toast library; use inline message in the modal with `--color-danger` (error) and `--color-success` (success).

**Primary recommendation:** Add a "备份与恢复" section to setting-modal with export button and NUpload for import; wire `ImportBackupResult` to inline feedback UI.

---

## Standard Stack

### Core

| Library/Component | Version | Purpose | Why Standard |
|------------------|---------|---------|--------------|
| Vue | ^3.5.27 | UI framework | Project standard |
| NButton | existing | Triggers | Used for export; consistent with modal footer |
| NUpload | existing | File selection | Already used in site-modal; emits `pick` with File |
| utils/backup.ts | existing | Export/import | Phase 3 complete; no changes needed |

### Supporting

| Item | Purpose | When to Use |
|------|---------|-------------|
| NModal | Container | setting-modal already uses it |
| ref + inline message | Error/success feedback | No toast; modal-scoped feedback |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| setting-modal section | actions bar | Settings groups data ops; actions bar is for quick actions |
| NUpload | `<input type="file">` | NUpload is reusable, follows project patterns, already handles reset |
| Inline message | Toast library | No toast in project; inline fits modal context |

**Installation:** None. All dependencies and components exist.

---

## Architecture Patterns

### Recommended Entry Point: setting-modal

**Why:** Audit specifies "setting-modal: no backup section"; WebDAV section shows the pattern. Backup is a data-management operation, not a toolbar shortcut.

### Pattern 1: Export Button

**What:** Button calls `exportBackupData()`; user receives download immediately (saveFile in backup.ts creates blob URL, programmatic click).

**When to use:** Export trigger.

**Example:**
```typescript
// setting-modal.vue
import { exportBackupData } from '@/utils/backup'

async function handleExport() {
  await exportBackupData()
  // Optional: brief success hint; download happens automatically
}
```

### Pattern 2: Import via NUpload

**What:** NUpload with `accept=".json,application/json"`; on `@pick`, call `importBackupData(file)` and show result.

**When to use:** Import file selection.

**Example:**
```vue
<n-upload accept=".json,application/json" @pick="handleImport">
  <n-button variant="secondary">选择备份文件</n-button>
</n-upload>
```

```typescript
import { importBackupData } from '@/utils/backup'
import type { ImportBackupResult } from '@/utils/backup'

const importResult = ref<ImportBackupResult | null>(null)

async function handleImport(file: File) {
  importResult.value = null
  const result = await importBackupData(file)
  importResult.value = result
}
```

### Pattern 3: Inline Result Feedback

**What:** Show `ImportBackupResult` below import UI: success → green text; error → red text with `error` string.

**When to use:** No toast; modal-scoped feedback.

**Example:**
```vue
<div v-if="importResult" :class="importResult.success ? 'success' : 'error'">
  {{ importResult.success ? '导入成功' : importResult.error }}
</div>
```

```css
.success { color: var(--color-success); }
.error { color: var(--color-danger); }
```

### Anti-Patterns to Avoid

- **Adding a toast library:** No existing toast; inline feedback is sufficient and consistent.
- **Putting export/import in actions bar:** Backup is infrequent; settings groups data ops.
- **Modifying backup.ts:** Data layer is complete; this phase is UI-only.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| File download | Custom blob download | `exportBackupData()` | saveFile already in backup.ts |
| File picker | Custom input | NUpload | Reusable, emit pattern, reset handled |
| Schema validation | Custom validation | `importBackupData` | Zod in backup.ts; valid before DB write |
| Error surfacing | Ad-hoc handling | ImportBackupResult | `{ success, error? }` already returned |

**Key insight:** Phase 3 completed all data-layer work. Phase 5 only wires UI to existing functions.

---

## Common Pitfalls

### Pitfall 1: Async Import Without Loading State

**What goes wrong:** User selects file; import runs; no feedback during async; user thinks nothing happened.

**Why it happens:** importBackupData is async; UI doesn't show loading.

**How to avoid:** Add `importing` ref; set true before import, false after; disable button or show spinner during import.

**Warning signs:** User selects file; UI stays static for 1–2 seconds.

### Pitfall 2: Stale Result After Re-import

**What goes wrong:** User imports successfully; then imports invalid file; old success message still visible.

**Why it happens:** importResult not cleared before new import.

**How to avoid:** Set `importResult.value = null` at start of handleImport.

### Pitfall 3: Zod Error Message Too Technical

**What goes wrong:** Zod returns long validation messages; user sees raw `Expected array, received string` etc.

**Why it happens:** BackupDataSchema.safeParse returns result.error.message.

**How to avoid:** Optionally map common Zod messages to user-friendly text; or truncate. Current error string is acceptable for MVP; can refine later.

### Pitfall 4: NUpload Accept Too Restrictive

**What goes wrong:** User has `.json` file but OS doesn't associate; file picker filters too strictly.

**Why it happens:** `accept=".json"` only; some systems use `application/json` MIME.

**How to avoid:** Use `accept=".json,application/json"` (NUpload passes to input accept).

---

## Code Examples

### Export Flow (Complete)

```typescript
// setting-modal.vue script
import { exportBackupData } from '@/utils/backup'

async function handleExport() {
  await exportBackupData()
  // Download triggers automatically via saveFile(blob)
}
```

### Import Flow (Complete)

```typescript
// setting-modal.vue script
import { ref } from 'vue'
import { importBackupData } from '@/utils/backup'
import type { ImportBackupResult } from '@/utils/backup'

const importResult = ref<ImportBackupResult | null>(null)
const importing = ref(false)

async function handleImport(file: File) {
  importResult.value = null
  importing.value = true
  try {
    importResult.value = await importBackupData(file)
  } finally {
    importing.value = false
  }
}
```

```vue
<!-- template -->
<n-upload
  accept=".json,application/json"
  :disabled="importing"
  @pick="handleImport"
>
  <n-button variant="secondary" :loading="importing">
    选择备份文件
  </n-button>
</n-upload>
<div v-if="importResult" class="import-feedback" :class="importResult.success ? 'success' : 'error'">
  {{ importResult.success ? '导入成功' : importResult.error }}
</div>
```

### Section Structure (from existing WebDAV)

```vue
<div class="section-header">
  <div class="section-title">备份与恢复</div>
  <div class="section-desc">导出/导入网站与布局数据</div>
</div>
<div class="backup-actions">
  <n-button @click="handleExport">导出备份</n-button>
  <n-upload accept=".json,application/json" @pick="handleImport">
    <n-button>导入备份</n-button>
  </n-upload>
</div>
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| No UI entry | setting-modal section | Users can trigger export/import |
| Silent import failure | ImportBackupResult + inline feedback | Clear error messages |
| Manual file input | NUpload component | Consistent, reusable |

**Deprecated/outdated:** None. Phase 5 is additive.

---

## Open Questions

1. **Success feedback duration**
   - What we know: Import success shows "导入成功"; export has no explicit feedback (download is implicit).
   - What's unclear: Whether to auto-clear success message after N seconds.
   - Recommendation: Keep success message until user triggers another action or closes modal; no auto-dismiss for MVP.

2. **Export success hint**
   - What we know: exportBackupData triggers download; no callback.
   - What's unclear: Whether to show "已导出" after download.
   - Recommendation: Optional brief hint; low priority; download is sufficient.

---

## Sources

### Primary (HIGH confidence)

- `utils/backup.ts` — exportBackupData, importBackupData, ImportBackupResult
- `components/upload/upload.vue` — NUpload API, accept, @pick
- `components/setting-modal/setting-modal.vue` — section structure, form patterns
- `.planning/v1.1.0-MILESTONE-AUDIT.md` — gaps, entry points

### Secondary (MEDIUM confidence)

- `components/site-modal/site-modal.vue` — NUpload usage with @pick
- `entrypoints/newtab/styles/variables.css` — --color-danger, --color-success

### Tertiary

- Phase 3 RESEARCH/VERIFICATION — ImportBackupResult, schema validation

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — All components and utils exist in codebase; verified.
- Architecture: HIGH — setting-modal pattern matches audit; NUpload usage verified in site-modal.
- Pitfalls: MEDIUM — Based on common async/form patterns; loading state and result clearing are standard.

**Research date:** 2026-02-12
**Valid until:** 30 days (stable UI wiring domain)
