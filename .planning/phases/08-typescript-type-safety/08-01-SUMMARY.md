---
phase: 08-typescript-type-safety
plan: 01
subsystem: ui
tags: [typescript, vue, type-guards, discriminated-union, bing-api]

# Dependency graph
requires: []
provides:
  - "GridItemUI reusable type guards: isSiteItem/isFolderItem"
  - "Type-safe grid item persistence/path handling without Site/Folder/Grid assertions"
  - "Typed Bing wallpaper API response with local interfaces"
affects: [08-02, 08-03, types, store, wallpaper]

# Tech tracking
tech-stack:
  added: []
  patterns: [type-guard-based narrowing, local-api-response-interface]

key-files:
  created: []
  modified: [types/ui.ts, store/grid-items.ts, utils/wallpaper-providers.ts]

key-decisions:
  - "Use exported discriminated-union type guards instead of local repeated type assertions in store logic."
  - "Keep Bing response interfaces file-local and enforce string id fallback via hsh/startdate/urlbase/url."

patterns-established:
  - "Pattern 1: Shared type guards live in types/ui.ts and are reused by store modules."
  - "Pattern 2: External API payloads use explicit local interfaces; avoid any in provider pipelines."

requirements-completed: [TYPE-02, TYPE-03]

# Metrics
duration: 7min
completed: 2026-02-26
---

# Phase 08 Plan 01: Type Safety Foundations Summary

**Grid item union narrowing now uses shared type guards end-to-end, and Bing wallpaper response parsing is fully typed without any.**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-26T06:11:42Z
- **Completed:** 2026-02-26T06:19:25Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added `isSiteItem` / `isFolderItem` exports in `types/ui.ts` for reusable discriminated-union narrowing.
- Removed `as SiteItemUI` / `as FolderItemUI` / `as GridItemUI` assertion paths from `store/grid-items.ts`.
- Introduced `BingImage` and `BingImageArchiveResponse` typing in `utils/wallpaper-providers.ts` and removed `any`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Create type guards and apply in grid-items store** - `a8f4852` (feat)
2. **Task 2: Type Bing API response interface** - `eb43354` (feat)

**Plan metadata:** `TBD` (docs: complete plan)

## Files Created/Modified
- `types/ui.ts` - Added GridItemUI type guards for site/folder discrimination.
- `store/grid-items.ts` - Replaced assertion-based branching with guard-based narrowing and safe persistence shaping.
- `utils/wallpaper-providers.ts` - Added Bing API interfaces and removed `any`-typed image pipeline.

## Decisions Made
- Use `isSiteItem` / `isFolderItem` from `types/ui.ts` as the canonical narrowing entrypoint in store flows.
- Keep Bing API response interfaces local to provider module to avoid unnecessary global type surface.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Ensure Bing wallpaper id is always string**
- **Found during:** Task 2 (Type Bing API response interface)
- **Issue:** After removing `any`, `image.hsh || image.startdate` inferred `string | undefined`, conflicting with `WallpaperInfo.id: string`.
- **Fix:** Added fallback chain `image.hsh ?? image.startdate ?? image.urlbase ?? image.url` and returned `imageId`.
- **Files modified:** `utils/wallpaper-providers.ts`
- **Verification:** `npx vue-tsc --noEmit` no longer reports errors in `utils/wallpaper-providers.ts`; `rg '\\bany\\b' utils/wallpaper-providers.ts` returns no matches.
- **Committed in:** `eb43354` (part of Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Auto-fix was required for type correctness and stayed within planned file scope.

## Issues Encountered
- Full-project `npx vue-tsc --noEmit` remains blocked by pre-existing unrelated issues in `components/searcher/searcher.vue` and `components/site-modal/site-modal.vue` (already tracked in deferred baseline for this phase).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 08 downstream plans can now consume shared UI type guards and typed wallpaper provider structures.
- No blockers in this plan scope.

---
*Phase: 08-typescript-type-safety*
*Completed: 2026-02-26*

## Self-Check: PASSED

- FOUND: `.planning/phases/08-typescript-type-safety/08-01-SUMMARY.md`
- FOUND commit: `a8f4852`
- FOUND commit: `eb43354`
