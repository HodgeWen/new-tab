---
phase: 08-typescript-type-safety
plan: 02
subsystem: ui
tags: [typescript, vue, generics, type-safety, context-menu, select]
requires:
  - phase: 07-design-token-css-foundation
    provides: ContextMenu and Select visual layer already tokenized, enabling focused type-safety refactor
provides:
  - ContextMenu internal SFC props now use unknown instead of any
  - Select component exposes generic V typing through defineModel/defineEmits
  - Select supports flexible option field mapping via labelKey/valueKey
affects: [08-03-grid-type-assertion-elimination, phase-09-grid-component-structure]
tech-stack:
  added: []
  patterns:
    - unknown-first internal boundary typing for Vue SFC props
    - generic script setup components with inferred v-model value type
key-files:
  created:
    - .planning/phases/08-typescript-type-safety/deferred-items.md
  modified:
    - components/context-menu/context-menu.vue
    - components/context-menu/context-menu-item.vue
    - components/select/select.vue
key-decisions:
  - Keep ContextMenu public API unchanged and tighten only internal SFC prop types.
  - Use script setup generic V extends string | number for Select to preserve string/number model inference.
patterns-established:
  - "Context menu internals accept unknown context while showContextmenu call sites keep concrete generic safety."
  - "Select option object shape can vary by passing labelKey/valueKey instead of enforcing a fixed Option interface."
requirements-completed: [TYPE-01, COMP-04]
duration: 2min
completed: 2026-02-26
---

# Phase 8 Plan 2: Generic ContextMenu/Select Type Safety Summary

**ContextMenu internal props no longer use any, and Select now provides generic v-model typing with configurable label/value keys for flexible option shapes.**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-26T06:12:03Z
- **Completed:** 2026-02-26T06:14:12Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Replaced `any` with `unknown` in `context-menu.vue` and `context-menu-item.vue` without changing public API signatures.
- Refactored `select.vue` to use `generic="V extends string | number"` with typed `defineModel<V>()` and `defineEmits`.
- Added `labelKey`/`valueKey` props and accessor helpers so Select can consume non-fixed option field names safely.

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace any with unknown in ContextMenu internals** - `e711081` (fix)
2. **Task 2: Generic Select with labelKey/valueKey and caller updates** - `34baa33` (feat)

**Plan metadata:** `PENDING` (will be set by final docs commit)

## Files Created/Modified
- `.planning/phases/08-typescript-type-safety/deferred-items.md` - Deferred unrelated pre-existing vue-tsc baseline errors.
- `components/context-menu/context-menu.vue` - Switched internal props to `unknown` context/item types.
- `components/context-menu/context-menu-item.vue` - Switched item/context props to `unknown` and preserved typed action invocation.
- `components/select/select.vue` - Introduced generic model typing and dynamic label/value key accessors.

## Decisions Made
- Kept `types.ts` and `showContextmenu` API untouched as planned, because generic safety already exists at public call sites.
- Used default `labelKey='label'` and `valueKey='value'` for backward compatibility while allowing flexible option schemas.

## Deviations from Plan

None - plan code changes executed as written.

## Issues Encountered
- `npx vue-tsc --noEmit` reports pre-existing, out-of-scope errors in `components/searcher/searcher.vue` and `components/site-modal/site-modal.vue`.
- Per scope boundary rules, these were not fixed in this plan and were logged to `.planning/phases/08-typescript-type-safety/deferred-items.md`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 8 type-safety workstream is ready to continue with remaining plans (`08-01`, `08-03`).
- Select and ContextMenu now expose safer typing boundaries for downstream refactors.

## Self-Check: PASSED

- Verified created files exist:
  - `.planning/phases/08-typescript-type-safety/08-02-SUMMARY.md`
  - `.planning/phases/08-typescript-type-safety/deferred-items.md`
- Verified task commits exist:
  - `e711081`
  - `34baa33`

---
*Phase: 08-typescript-type-safety*
*Completed: 2026-02-26*
