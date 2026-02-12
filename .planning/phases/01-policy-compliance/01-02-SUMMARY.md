---
phase: 01-policy-compliance
plan: 02
subsystem: security
tags: [url-validation, xss-prevention, chrome-extension, site-shortcuts]

# Dependency graph
requires: []
provides:
  - URL scheme allow-list validation (http/https only) for site shortcuts
  - Malicious scheme rejection (javascript:, data:, etc.) at add/edit
affects: [policy-compliance]

# Tech tracking
tech-stack:
  added: []
  patterns: [allow-list validation, parse-before-normalize]

key-files:
  created: []
  modified: [components/site-modal/site-modal.vue]

key-decisions:
  - 'Allow-list only (http:, https:) — no blacklist approach'
  - 'Parse raw input first; never normalize before protocol check'

patterns-established:
  - 'Pattern: normalizeAndValidate(urlString): string | null — parse, protocol check, return href or null'

# Metrics
duration: 8min
completed: 2025-02-12
---

# Phase 1 Plan 2: URL Scheme Validation Summary

**URL scheme allow-list validation for site shortcuts — only http: and https: accepted; javascript:, data:, and other dangerous schemes rejected at add/edit**

## Performance

- **Duration:** ~8 min
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- `normalizeAndValidate(urlString)` function with allow-list (http/https only)
- urlStatus computed wires to normalizeAndValidate; shows error for invalid schemes
- handleUrlChange uses normalizeAndValidate; no auto-fill/favicon when invalid
- handleSave validates at save time; uses validatedUrl in payload (defense in depth)
- Invalid URLs never reach the store

## Task Commits

Each task was committed atomically:

1. **Task 1: Add normalizeAndValidate and wire to urlStatus** - `e3c4082` (feat)
2. **Task 2: Update handleUrlChange and handleSave to use normalizeAndValidate** - `0b80995` (feat)

**Plan metadata:** (pending final commit)

## Files Created/Modified

- `components/site-modal/site-modal.vue` - Added normalizeAndValidate, urlStatus uses it, handleUrlChange and handleSave validate before proceeding

## Decisions Made

- Allow-list only (http:, https:) — no blacklist; new schemes implicitly rejected
- Parse raw input first; never add https:// prefix before protocol check (avoids javascript:alert(1) slipping through)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- PLCY-02 satisfied: Site shortcuts accept only http: and https: URLs
- Malicious schemes blocked at add/edit; no XSS via href

---

_Phase: 01-policy-compliance_
_Completed: 2025-02-12_
