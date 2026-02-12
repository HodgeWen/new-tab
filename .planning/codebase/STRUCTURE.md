# Codebase Structure

**Analysis Date:** 2025-02-12

## Directory Layout

```
[project-root]/
├── .agents/              # Agent/skill docs (not runtime)
├── .cursor/              # Cursor commands and skills
├── .wxt/                 # WXT-generated types and tsconfig
├── assets/               # Source assets (icons)
├── components/           # Vue components (feature + primitives)
├── entrypoints/          # WXT/Vite entry points
│   └── newtab/           # New tab page
├── hooks/                # Vue composition functions
├── public/               # Static assets (icons for extension)
├── store/                # Reactive state modules
├── types/                # TypeScript interfaces
├── utils/                # DB, backup, wallpaper providers
├── AGENTS.md             # Agent guidelines
├── package.json
├── tsconfig.json
├── vite.config.ts        # Standalone dev server
└── wxt.config.ts         # Extension build config
```

## Directory Purposes

**entrypoints/newtab/:**
- Purpose: New tab page SPA
- Contains: `main.ts`, `App.vue`, `index.html`, `style.css`, `styles/`
- Key files: `main.ts` (Vue bootstrap), `App.vue` (root layout), `styles/variables.css` (design tokens)

**components/:**
- Purpose: Reusable UI; each subdir has `*.vue` + `index.ts` barrel
- Contains: `actions/`, `button/`, `context-menu/`, `folder-item/`, `folder-modal/`, `folder-view/`, `grid-layout/`, `input/`, `modal/`, `searcher/`, `select/`, `setting-modal/`, `site-item/`, `site-modal/`, `switch/`, `upload/`
- Key files: `grid-layout/use-grid-stack.tsx` (GridStack + Vue integration), `context-menu/context-menu.ts` (imperative API)

**store/:**
- Purpose: Global reactive state
- Contains: `components.ts`, `grid-items.ts`, `grid-order.ts`, `setting.ts`, `ui.ts`
- Key files: `grid-items.ts` (CRUD + Dexie sync), `components.ts` (modal/grid refs)

**hooks/:**
- Purpose: Composable logic
- Contains: `use-modal.ts`, `use-wallpaper.ts`

**utils/:**
- Purpose: Infrastructure
- Contains: `backup.ts`, `db.ts`, `wallpaper-providers.ts`
- Key files: `db.ts` (Dexie schema), `wallpaper-providers.ts` (Bing, Picsum)

**types/:**
- Purpose: Shared types
- Contains: `common.ts`, `db.ts`, `ui.ts`

**public/:**
- Purpose: Extension icons (16, 32, 48, 128)
- Contains: `icons/icon-*.png`

**assets/:**
- Purpose: Source assets
- Contains: `icons/icon.svg`

## Key File Locations

**Entry Points:**
- `entrypoints/newtab/main.ts`: Vue app bootstrap
- `entrypoints/newtab/index.html`: HTML shell
- `entrypoints/newtab/App.vue`: Root component

**Configuration:**
- `wxt.config.ts`: Extension manifest, permissions, chrome_url_overrides
- `vite.config.ts`: Standalone dev server (root: `entrypoints/newtab`)
- `tsconfig.json`: Extends `.wxt/tsconfig.json`
- `.wxt/tsconfig.json`: Path aliases `@`, `~`, `@@`, `~~` → project root

**Core Logic:**
- `store/grid-items.ts`: Grid item CRUD and Dexie sync
- `components/grid-layout/use-grid-stack.tsx`: GridStack init, widget add/remove/update, Vue render
- `utils/db.ts`: Dexie DB (gridItems, wallpapers)

**Testing:**
- Not detected

## Naming Conventions

**Files:**
- Vue SFCs: `kebab-case.vue` (e.g. `folder-modal.vue`, `site-item.vue`)
- TS modules: `kebab-case.ts` or `use-*.ts` for hooks
- Component dirs: `kebab-case/` with `index.ts` barrel

**Components:**
- Export as `N*` (e.g. `NGridLayout`, `NFolderModal`, `NSiteItem`)

**Path Aliases:**
- `@` / `~` → project root
- `@/components/...`, `@/store/...`, `@/utils/...`, `@/types/...`, `@/hooks/...`

## Where to Add New Code

**New Feature:**
- Primary code: `components/<feature>/` or extend `store/`
- Shared types: `types/`
- Tests: Not applicable (no test setup)

**New Component:**
- Implementation: `components/<name>/<name>.vue` + `index.ts`
- Use `defineOptions({ name: 'NComponentName' })` and export via barrel

**Utilities:**
- Shared helpers: `utils/`
- Composable logic: `hooks/`

**New Store Slice:**
- Add `store/<name>.ts`; export reactive state and mutations

## Special Directories

**.wxt/:**
- Purpose: WXT-generated types and tsconfig
- Generated: Yes (by WXT)
- Committed: Yes

**.output/:**
- Purpose: Extension build output
- Generated: Yes
- Committed: No (in .gitignore)

**entrypoints/:**
- Purpose: WXT entrypoint convention; each subdir becomes a page/script
- Contains: Only `newtab/` currently
- To add popup/background: create `entrypoints/popup/` or `entrypoints/background.ts` per WXT docs

---

*Structure analysis: 2025-02-12*
