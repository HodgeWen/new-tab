---
phase: 06-design-token-cleanup
plan: 01
subsystem: ui
tags: [css-variables, design-tokens, glassmorphism, vue]

# Dependency graph
requires:
  - phase: 04-ui-polish
    provides: setting-modal design token pattern to follow
provides:
  - Design tokens --glass-bg-disabled, --glass-bg-elevated in all 3 theme blocks
  - Input, context-menu, context-menu-item using var() instead of hardcoded rgba
affects: [design-system, theme-variants]

# Tech tracking
tech-stack:
  added: []
  patterns: [design token for disabled/elevated states, theme-aware glass surfaces]

key-files:
  created: []
  modified:
    - entrypoints/newtab/styles/variables.css
    - components/input/input.vue
    - components/context-menu/context-menu.vue
    - components/context-menu/context-menu-item.vue

key-decisions:
  - "Reuse --glass-bg-hover for clear-btn hover (per RESEARCH); no new token needed"

patterns-established:
  - "Glass elevated surfaces: use --glass-bg-elevated for context menus, dropdowns"
  - "Disabled states: use --glass-bg-disabled for disabled input background"

# Metrics
duration: ~5min
completed: 2026-02-12
---

# Phase 6 Plan 01: Design Token Cleanup Summary

**Design tokens --glass-bg-disabled and --glass-bg-elevated introduced; input, context-menu, context-menu-item migrated from hardcoded rgba to var() references for theme-aware glass surfaces**

## Performance

- **Duration:** ~5 min
- **Tasks:** 3 (2 auto + 1 human-verify)
- **Files modified:** 4

## Accomplishments

- Added `--glass-bg-disabled` (disabled input background) and `--glass-bg-elevated` (context menu / dropdown surfaces) in all three theme blocks (:root, dark-wallpaper, light-wallpaper)
- Replaced hardcoded rgba in input.vue (disabled state, clear-btn hover) with var(--glass-bg-disabled), var(--glass-bg-hover)
- Replaced hardcoded rgba in context-menu.vue and context-menu-item.vue with var(--glass-bg-elevated)
- Human verified no visual regressions across default, dark-wallpaper, light-wallpaper themes

## Task Commits

Each task was committed atomically:

1. **Task 1: Add design tokens to variables.css** - `698868c` (feat)
2. **Task 2: Replace hardcoded rgba in input and context-menu components** - `709b004` (fix)
3. **Task 3: Visual verification across themes** - Human approved (no code commit)

**Plan metadata:** (docs: complete plan)

## Files Created/Modified

- `entrypoints/newtab/styles/variables.css` - Added --glass-bg-disabled, --glass-bg-elevated in all 3 theme blocks
- `components/input/input.vue` - Uses var(--glass-bg-disabled), var(--glass-bg-hover)
- `components/context-menu/context-menu.vue` - Uses var(--glass-bg-elevated)
- `components/context-menu/context-menu-item.vue` - Uses var(--glass-bg-elevated) for submenu

## Decisions Made

None - followed plan as specified. Reused --glass-bg-hover for clear-btn hover per RESEARCH.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 6 complete; design token cleanup done
- All roadmap phases (01–06) complete
- Milestone v1.1 ready for finalization

## Self-Check: PASSED

- FOUND: .planning/phases/06-design-token-cleanup/06-01-SUMMARY.md
- FOUND: commits 698868c, 709b004

---
*Phase: 06-design-token-cleanup*
*Completed: 2026-02-12*
