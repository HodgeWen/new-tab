---
phase: 08-typescript-type-safety
plan: 03
subsystem: ui
tags: [typescript, vue, type-safety, gridstack, discriminated-union]
requires:
  - phase: 08-01
    provides: Reusable isSiteItem/isFolderItem type guards for GridItemUI narrowing
provides:
  - use-grid-stack removed assertion-based narrowing in favor of type guards and instanceof checks
  - folder-view now resolves folder by runtime guard instead of FolderItemUI cast
  - ui type guards support readonly reactive collections through generic Extract-based predicates
affects: [phase-08-type-safety-completion, phase-09-grid-component-structure]
tech-stack:
  added: []
  patterns:
    - assertion-free union narrowing for Vue TSX widget rendering
    - predicate-driven ID filtering and HTMLElement runtime narrowing
key-files:
  created: []
  modified:
    - components/grid-layout/use-grid-stack.tsx
    - components/folder-view/folder-view.vue
    - types/ui.ts
    - .planning/phases/08-typescript-type-safety/deferred-items.md
key-decisions:
  - Replaced Record render dispatch with renderWidget(item) to let discriminated unions narrow directly.
  - Updated type guards to generic Extract predicates so readonly reactive item unions can be narrowed safely.
patterns-established:
  - "Prefer isSiteItem/isFolderItem plus dedicated render/getter helpers over assertion-heavy inline casts."
  - "When GridStack returns union element types, narrow with instanceof HTMLElement before DOM operations."
requirements-completed: [TYPE-04, FLDR-03]
duration: 3min
completed: 2026-02-26
---

# Phase 8 Plan 3: Assertion-Free Grid and Folder Type Narrowing Summary

**GridStack composable and folder-view lookup now rely on structural narrowing (type guards, predicates, instanceof) with zero explicit `as` assertions in the two target files.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-26T06:22:06Z
- **Completed:** 2026-02-26T06:24:51Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Removed all explicit `as` assertions from `use-grid-stack.tsx` and replaced them with `isSiteItem/isFolderItem`, `instanceof HTMLElement`, and type predicate filtering.
- Replaced folder lookup cast in `folder-view.vue` with `isFolderItem`-guarded lookup, preserving runtime safety for unexpected IDs.
- Kept verification scope clean by logging pre-existing out-of-scope `vue-tsc` baseline errors to deferred items.

## Task Commits

Each task was committed atomically:

1. **Task 1: Eliminate all type assertions in use-grid-stack.tsx** - `51cf607` (fix)
2. **Task 2: Replace FolderItemUI assertion in folder-view.vue** - `58d59f4` (fix)

**Plan metadata:** `PENDING` (will be set by final docs commit)

## Files Created/Modified
- `components/grid-layout/use-grid-stack.tsx` - Removed assertion-based narrowing and introduced guard-driven rendering/sizing/DOM lookup.
- `components/folder-view/folder-view.vue` - Replaced cast-based folder resolve with `isFolderItem` guard path.
- `types/ui.ts` - Generalized type guard signatures to support readonly reactive unions (blocking fix for task completion).
- `.planning/phases/08-typescript-type-safety/deferred-items.md` - Logged unchanged, out-of-scope baseline type-check errors.

## Decisions Made
- Used `renderWidget(item)` helper instead of keyed render map to keep type narrowing local and compiler-verifiable.
- Treated readonly reactive item guard incompatibility as blocking and fixed guard signatures centrally in `types/ui.ts`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Guard parameter types incompatible with readonly reactive gridItems**
- **Found during:** Task 2 (Replace FolderItemUI assertion in folder-view.vue)
- **Issue:** `gridItems` is a readonly reactive collection; passing list items to `isFolderItem(item: GridItemUI)` caused type-check failure.
- **Fix:** Updated `isSiteItem/isFolderItem` to generic `Extract`-based predicates over `{ type: string }`, preserving narrowing for mutable and readonly unions.
- **Files modified:** `types/ui.ts`
- **Verification:** `folder-view.vue` guard usage compiles; no type errors remain in task-targeted files.
- **Committed in:** `58d59f4` (part of Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Deviation was required to complete planned guard migration without assertions; no scope creep.

## Issues Encountered
- Full `npx vue-tsc --noEmit` still reports pre-existing, out-of-scope baseline errors in `components/searcher/searcher.vue` and `components/site-modal/site-modal.vue`.
- Per scope boundary rules, these were not fixed and were recorded in `.planning/phases/08-typescript-type-safety/deferred-items.md`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 08 plan set is complete from implementation perspective; assertion-heavy paths targeted by 08-03 have been removed.
- Existing baseline type errors outside plan scope remain deferred and should be addressed in a dedicated follow-up plan.

## Self-Check: PASSED

- Verified created/required files exist:
  - `.planning/phases/08-typescript-type-safety/08-03-SUMMARY.md`
  - `.planning/phases/08-typescript-type-safety/deferred-items.md`
- Verified task commits exist:
  - `51cf607`
  - `58d59f4`

---
*Phase: 08-typescript-type-safety*
*Completed: 2026-02-26*
