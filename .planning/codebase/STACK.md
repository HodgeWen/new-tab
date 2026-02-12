# Technology Stack

**Analysis Date:** 2025-02-12

## Languages

**Primary:**

- TypeScript 5.9+ - All application code, components, utils, store
- Vue SFC (`.vue`) - UI components in `components/` and `entrypoints/newtab/`
- TSX - `components/grid-layout/use-grid-stack.tsx` for GridStack render callbacks

**Secondary:**

- CSS - Scoped styles in components, global in `entrypoints/newtab/styles/`

## Runtime

**Environment:**

- Browser (Chrome extension context)
- Node.js >= 18.0.0 (build/dev)

**Package Manager:**

- Bun (default: `bun.lock` present)
- Lockfile: Present (`bun.lock`)
- Scripts: `npm run dev`, `npm run build` (works with npm/pnpm as well)

## Frameworks

**Core:**

- Vue 3.5.27 - UI framework, Composition API, `useTemplateRef`
- WXT 0.20.13 - Browser extension framework (manifest, build, modules)
- Vite - Build tool via WXT; standalone `dev:web` uses `vite.config.ts`

**Testing:**

- Not detected

**Build/Dev:**

- WXT - Extension lifecycle, manifest generation, output to `.output`
- Vite - Bundling, HMR
- @vitejs/plugin-vue-jsx 5.1.4 - JSX support in Vue
- @wxt-dev/module-vue 1.0.3 - Vue integration for WXT

## Key Dependencies

**Critical:**

- `dexie` 4.3.0 - IndexedDB wrapper, used in `utils/db.ts` for grid items and wallpaper cache
- `gridstack` 12.4.2 - Drag-and-drop grid layout; imported in `components/grid-layout/use-grid-stack.tsx`
- `vue` 3.5.27 - Core UI framework
- `lucide-vue-next` 0.563.0 - Icon library; used across components (Search, Pencil, Trash2, etc.)
- `nanoid` 5.1.6 - Unique ID generation; used in `site-modal.vue`, `use-grid-stack.tsx`
- `webdav` 5.8.0 - WebDAV client; dependency present, sync UI in `setting-modal.vue`, but no `createClient` usage in codebase (sync not implemented)

**Utilities:**

- `@cat-kit/core` 1.0.0 - `throttle` in `use-grid-stack.tsx`, `o().deepExtend` in `hooks/use-modal.ts`

## Configuration

**Environment:**

- No `.env` files detected; `.gitignore` excludes `.env`, `.env.*.local`
- No build-time env vars required
- Settings stored in `localStorage` via `store/setting.ts` (key: `setting`)

**Build:**

- `wxt.config.ts` - WXT config, manifest, host_permissions, Vue plugin
- `vite.config.ts` - Standalone web dev, root `entrypoints/newtab`, alias `@` / `~`
- `tsconfig.json` - Extends `./.wxt/tsconfig.json`; `jsx: preserve`
- `.wxt/tsconfig.json` - Target ESNext, strict, paths `@/*` → `../*`
- `.oxfmtrc.json` - Formatter (oxfmt): semi false, singleQuote, trailingComma none

## Platform Requirements

**Development:**

- Node >= 18
- Bun or npm/pnpm for install

**Production:**

- Chrome browser extension (Manifest V3 via WXT)
- Host permissions: `bing.com`, `picsum.photos`, `fastly.picsum.photos`
- Permissions: `search`, `favicon`

---

_Stack analysis: 2025-02-12_
