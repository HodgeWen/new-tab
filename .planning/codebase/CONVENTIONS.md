# Coding Conventions

**Analysis Date:** 2025-02-12

## Naming Patterns

**Files:**
- Vue components: `kebab-case.vue` (e.g., `folder-item.vue`, `site-modal.vue`)
- TS/TSX: `kebab-case.ts` or `kebab-case.tsx` (e.g., `use-grid-stack.tsx`, `use-modal.ts`)
- Barrel exports: `index.ts` per component directory
- Types: `common.ts`, `db.ts`, `ui.ts` in `types/`

**Components:**
- All components use `N` prefix in `defineOptions({ name: 'NButton' })` (e.g., `NButton`, `NModal`, `NSiteItem`, `NGridLayout`)
- Export names match: `export { default as NButton } from './button.vue'`

**Functions:**
- camelCase: `handleClick`, `loadGridItems`, `fetchAndCache`, `showContextmenu`
- Event handlers: `handle` prefix (e.g., `handleIconUpload`, `handleContextMenu`, `handleOverlayClick`)
- Async functions: no special suffix, standard naming

**Variables:**
- camelCase for reactivity: `wallpaperUrl`, `modelValue`, `gridItemsMap`
- Constants: UPPER_SNAKE_CASE: `DEFAULT_SETTING`, `SETTING_KEY`, `BLOB_REVOKE_DELAY`, `FOLDER_SIZE_MAP`
- Module-level refs with underscore for internal: `_gridItems`, `_components`

**Types:**
- PascalCase: `GridItem`, `SiteItemUI`, `FolderItemForm`, `ContextmenuItem`
- Interfaces: `Setting`, `WallpaperInfo`, `WallpaperProvider`
- Union types: `ItemType`, `FolderSize`

## Code Style

**Formatting:**
- Tool: oxfmt (config at `.oxfmtrc.json`)
- Key settings: `semi: false`, `singleQuote: true`, `trailingComma: none`, `jsxSingleQuote: true`
- No Prettier or ESLint config detected in project root

**Linting:**
- Not detected. No `eslint.config.*`, `.eslintrc*`, or lint scripts in `package.json`
- TypeScript strict mode enabled via `tsconfig.json` (`"strict": true`)

## Import Organization

**Order (observed pattern):**
1. Vue runtime: `import { ref, computed } from 'vue'`
2. External libraries: `import { nanoid } from 'nanoid'`, `import { X } from 'lucide-vue-next'`
3. Type-only imports: `import type { SiteItemUI } from '@/types/ui'`
4. Local `@/` imports: `import { NButton } from '@/components/button'`, `import { db } from '@/utils/db'`

**Path Aliases:**
- `@` or `~` or `@@` or `~~`: project root (from `tsconfig.json` and `.wxt/types/paths.d.ts`)
- Usage: `@/components/button`, `@/store/grid-items`, `@/types/common`, `@/utils/db`, `@/hooks/use-modal`

**Type imports:**
- Use `import type` for type-only imports: `import type { Setting } from '@/types/common'`

## Vue Component Patterns

**Script setup:**
- Use `<script setup lang="ts">` or `<script lang="ts" setup>`
- Props via `defineProps<T>()` with TypeScript interfaces
- Destructure props with defaults: `const { item, inFolder = false } = defineProps<{ item: SiteItemUI; inFolder?: boolean }>()`
- Emits via `defineEmits<{ click: [event: MouseEvent] }>()` or `defineEmits<{ close: [] }>()`
- v-model via `defineModel<T>({ required: true })` or `defineModel<T>({ default: '' })`
- Always set `defineOptions({ name: 'NComponentName' })` (and optionally `inheritAttrs: false`)

**Composition:**
- Use `useTemplateRef` for template refs (Vue 3.5+): `const inputRef = useTemplateRef<HTMLInputElement>('inputRef')`
- Use `useSlots()` when checking slot presence
- Composable hooks: `useModal`, `useWallpaper`, `useGridStack` (in TSX)

**Exports:**
- Components: barrel `index.ts` re-exports default: `export { default as NButton } from './button.vue'`
- Store: named exports of reactive state and functions: `export const gridItems`, `export function loadGridItems`

## Error Handling

**Patterns:**
- Try/catch for recoverable errors: log with `console.error('[Module] message:', err)` and return `false` or fallback
- Throw for validation/API failures: `throw new Error('Picsum list request failed: ${res.status}')`
- Silent catch for optional features: `catch { /* IndexedDB 可能不可用，忽略 */ }`

**Examples:**
```typescript
// store/setting.ts
try {
  const saved = localStorage.getItem(SETTING_KEY)
  if (saved) return { ...DEFAULT_SETTING, ...JSON.parse(saved) }
} catch { /* ignore parse errors */ }

// hooks/use-wallpaper.ts
catch (err) {
  console.error('[Wallpaper] Fetch failed:', err)
  return false
}

// utils/wallpaper-providers.ts
if (!res.ok) throw new Error(`Picsum list request failed: ${res.status}`)
```

## Logging

**Framework:** `console` (no structured logger)

**Patterns:**
- Use `console.error` with module prefix: `console.error('[Wallpaper] Fetch failed:', err)`, `console.error('[备份]: 失败', error)`
- No `console.log` in production code observed; debug logging not present

## Comments

**When to Comment:**
- JSDoc for exported functions and public APIs: `/** 从数据库加载所有网格项到内存 */`
- Section headers in large files: `// ==================== 壁纸缓存操作 ====================`
- Inline for non-obvious logic: `// 内部可见性状态与 modelValue 解耦，确保离场过渡动画完整播放`

**JSDoc:**
- Simple block comments for exports: `/** 响应式的网格项列表（只读） */`
- `@param` and `@returns` used sparingly (e.g., `store/components.ts`)

## Function Design

**Size:** Functions kept reasonably small; complex logic split into helpers (e.g., `fetchAndCache`, `loadWallpaper`, `scheduleRefresh` in `use-wallpaper.ts`)

**Parameters:** Prefer objects for multiple optional params; single-arg functions common

**Return Values:** Async functions return `Promise<boolean>` for success/failure; sync functions return `void` or typed values

## Module Design

**Exports:**
- Store modules: reactive state + functions; no default export
- Utils: named functions only
- Components: default export + barrel re-export with `N` prefix

**Barrel Files:**
- Each component directory has `index.ts` that re-exports the Vue component
- Context menu also exports `showContextmenu` from `index.ts`

---

*Convention analysis: 2025-02-12*
