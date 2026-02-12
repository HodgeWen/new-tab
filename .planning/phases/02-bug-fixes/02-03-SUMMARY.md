---
phase: 02-bug-fixes
plan: 03
subsystem: infra
tags: [vite, proxy, cors, wallpaper, picsum, bing]

# Dependency graph
requires: []
provides:
  - Vite server.proxy for /api/picsum and /api/bing
  - Wallpaper API proxying in dev:web mode (CORS bypass)
affects: [02-bug-fixes]

# Tech tracking
tech-stack:
  added: []
  patterns: [vite-proxy-cors-bypass, dev-vs-extension-url-switching]

key-files:
  created: []
  modified: [vite.config.ts, utils/wallpaper-providers.ts]

key-decisions:
  - "Proxy only in dev:web (localhost); extension/prod use real URLs via host_permissions"

patterns-established:
  - "isDevWeb: import.meta.env.DEV && !chrome-extension:// to switch API base URLs"

# Metrics
duration: 2min
completed: 2026-02-12
---

# Phase 02 Plan 03: BUGF-04 Vite Proxy Summary

**Vite proxy for Picsum/Bing wallpaper APIs bypasses CORS in dev:web; wallpaper-providers use proxy URLs when isDevWeb.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-02-12T06:30:43Z
- **Completed:** 2026-02-12T06:32:11Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Vite `server.proxy` configured for `/api/picsum` → picsum.photos and `/api/bing` → www.bing.com
- Rewrite strips prefix so target receives correct paths (e.g. `/HPImageArchive.aspx` for Bing)
- `wallpaper-providers.ts` uses proxy base URLs when `isDevWeb` (DEV + !chrome-extension://)
- Extension build and prod unchanged; proxy only in dev:web

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Vite proxy config** - `618afff` (feat)
2. **Task 2: Use proxy URLs in wallpaper-providers when isDevWeb** - `8a662f3` (feat)

## Files Created/Modified

- `vite.config.ts` - Added server.proxy for /api/picsum and /api/bing with changeOrigin and rewrite
- `utils/wallpaper-providers.ts` - Added isDevWeb detection and API_BASE; replaced hardcoded URLs in fetchPicsumList, BingWallpaperProvider, PicsumPhotosWallpaperProvider

## Decisions Made

None - followed plan as specified. Proxy URLs only when isDevWeb; extension mode uses real URLs via host_permissions.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Verification

- `curl http://localhost:5174/api/bing/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN` → HTTP 200, valid JSON
- `curl http://localhost:5174/api/picsum/v2/list?page=1&limit=1` → HTTP 200, valid JSON
- `npm run build` → extension builds successfully; extension uses real URLs (no proxy in prod)

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- BUGF-04 resolved: Wallpaper loads in dev:web mode without CORS errors
- Ready for remaining bug-fix plans

## Self-Check: PASSED

- FOUND: .planning/phases/02-bug-fixes/02-03-SUMMARY.md
- FOUND: 618afff (Task 1)
- FOUND: 8a662f3 (Task 2)

---
*Phase: 02-bug-fixes*
*Completed: 2026-02-12*
