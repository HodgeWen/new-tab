# Roadmap: New Tab

## Milestones

- ✅ **v1.1.0 MVP** — Phases 1-6 (shipped 2026-02-12) — [archive](milestones/v1.1.0-ROADMAP.md)
- 🚧 **v1.2.0 UI Optimization** — Phases 7-10 (in progress)

## Phases

<details>
<summary>✅ v1.1.0 MVP (Phases 1-6) — SHIPPED 2026-02-12</summary>

- [x] Phase 1: Policy Compliance (2/2 plans) — completed 2026-02-12
- [x] Phase 2: Bug Fixes (3/3 plans) — completed 2026-02-12
- [x] Phase 3: Backup & Data Integrity (2/2 plans) — completed 2026-02-12
- [x] Phase 4: UI Polish (1/1 plan) — completed 2026-02-12
- [x] Phase 5: Backup Flow UI Wiring (2/2 plans) — completed 2026-02-12
- [x] Phase 6: Design Token Cleanup (1/1 plan) — completed 2026-02-12

</details>

### 🚧 v1.2.0 UI Optimization (In Progress)

**Milestone Goal:** 全面优化 UI 视觉和交互体验，重构冗余代码，提升代码质量和可维护性

- [x] **Phase 7: Design Token & CSS Variable Foundation** - Replace all hardcoded visual values with design tokens across the codebase (completed 2026-02-19)
- [ ] **Phase 8: TypeScript Type Safety** - Eliminate type-unsafe patterns (any, type assertions) with proper generics and type guards
- [ ] **Phase 9: Grid & Component Structure** - Restructure grid composable and folder component for maintainability
- [ ] **Phase 10: Code Refactoring** - Decompose large modules and align naming with community conventions

## Phase Details

### Phase 7: Design Token & CSS Variable Foundation
**Goal**: Every hardcoded visual value (colors, spacing, font sizes, dimensions) is replaced with design tokens — the codebase speaks one visual language
**Depends on**: Nothing (foundational for this milestone)
**Requirements**: VSTL-01, VSTL-02, VSTL-03, VSTL-04, VSTL-05, COMP-01, COMP-02, COMP-03, FLDR-01, FLDR-02, GRID-01
**Success Criteria** (what must be TRUE):
  1. No hardcoded rgba/hex color values remain in any component `<style scoped>` blocks — all reference CSS variables
  2. No hardcoded pixel spacing (gap/padding/margin) in component styles — all use `--spacing-*` tokens
  3. New size tokens (`--size-icon-sm/md/lg`) exist in `variables.css` and are applied where applicable
  4. GridStack configuration values (cellHeight, margin, columnWidth) are defined as named constants, not magic numbers
  5. `grid-layout.vue` contains no commented-out dead style code
**Plans:** 3/3 plans complete
Plans:
- [ ] 07-01-PLAN.md — Design token foundation + GridStack constants + dead code cleanup
- [ ] 07-02-PLAN.md — Base component tokenization (Modal, Switch, Select, ContextMenu, Button, Input)
- [ ] 07-03-PLAN.md — Layout component tokenization (folder-item, folder-view, site-item, App.vue)

### Phase 8: TypeScript Type Safety
**Goal**: All `any` types and unsafe type assertions replaced with proper TypeScript patterns — the compiler catches real bugs
**Depends on**: Phase 7 (CSS variable work may touch same files; complete visual pass first)
**Requirements**: TYPE-01, TYPE-02, TYPE-03, TYPE-04, FLDR-03, COMP-04
**Success Criteria** (what must be TRUE):
  1. ContextMenu and Select components use generic type parameters — no `any` in their public API
  2. `isSiteItem` / `isFolderItem` type guard functions exist and replace scattered `as` assertions
  3. Bing API responses have proper TypeScript interfaces — no `any[]` in wallpaper-providers.ts
  4. `use-grid-stack.tsx` compiles without explicit type assertions (`as HTMLElement`, `as string[]`)
**Plans**: TBD

### Phase 9: Grid & Component Structure
**Goal**: Grid composable and folder component restructured into focused, maintainable modules
**Depends on**: Phase 8 (type safety improvements applied to grid code first)
**Requirements**: GRID-02, GRID-03, GRID-04, FLDR-04
**Success Criteria** (what must be TRUE):
  1. `use-grid-stack.tsx` is split into two focused modules (core grid management + rendering), each under ~150 lines
  2. `renderCB` global side-effect is encapsulated within composable initialization — no global scope pollution
  3. Drag-stop sorting has performance protection (debounce/guard) preventing redundant triggers
  4. `FolderPreview` is an independent component with its own template, reusable in isolation
**Plans**: TBD

### Phase 10: Code Refactoring
**Goal**: Large modules decomposed, directory naming aligned with Vue community conventions, external dependency removed
**Depends on**: Phase 9 (structural changes to grid complete before broader refactoring)
**Requirements**: RFAC-01, RFAC-02, RFAC-03, RFAC-04, RFAC-05
**Success Criteria** (what must be TRUE):
  1. `site-modal.vue` icon logic lives in `use-site-icon` composable — site-modal.vue is noticeably smaller
  2. `use-wallpaper.ts` is split into state management and fetch logic modules
  3. `hooks/` directory is renamed to `composables/` with all imports updated and working
  4. `@cat-kit/core` dependency is removed from package.json — replaced by native implementation
  5. Folder filtering logic is extracted from `site-item.vue` into a shared computed or store method
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Policy Compliance | v1.1.0 | 2/2 | ✓ Complete | 2026-02-12 |
| 2. Bug Fixes | v1.1.0 | 3/3 | ✓ Complete | 2026-02-12 |
| 3. Backup & Data Integrity | v1.1.0 | 2/2 | ✓ Complete | 2026-02-12 |
| 4. UI Polish | v1.1.0 | 1/1 | ✓ Complete | 2026-02-12 |
| 5. Backup Flow UI Wiring | v1.1.0 | 2/2 | ✓ Complete | 2026-02-12 |
| 6. Design Token Cleanup | v1.1.0 | 1/1 | ✓ Complete | 2026-02-12 |
| 7. Design Token & CSS Variable Foundation | 3/3 | Complete   | 2026-02-19 | - |
| 8. TypeScript Type Safety | v1.2.0 | 0/? | Not started | - |
| 9. Grid & Component Structure | v1.2.0 | 0/? | Not started | - |
| 10. Code Refactoring | v1.2.0 | 0/? | Not started | - |
