# Roadmap: New Tab

## Overview

Prepare the New Tab extension for Chrome Web Store release: address policy compliance (search API, URL validation), fix known bugs, harden backup/import, and polish UI. Phases are ordered by store-submission priority; many items can run in parallel within phases.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Policy Compliance** - Search bar uses chrome.search API; URL scheme validation ✓ (2026-02-12)
- [x] **Phase 2: Bug Fixes** - #imports fix, JSON parse safety, dead code removal, CORS proxy ✓ (2026-02-12)
- [x] **Phase 3: Backup & Data Integrity** - Export includes grid order; import validation ✓ (2026-02-12)
- [x] **Phase 4: UI Polish** - CSS variables; WebDAV "即将推出" marking ✓ (2026-02-12)
- [ ] **Phase 5: Backup Flow UI Wiring** - Add export/import UI entry points; close BKUP flow gap
- [ ] **Phase 6: Design Token Cleanup (Optional)** - Replace remaining hardcoded rgba tokens in shared components

## Phase Details

### Phase 1: Policy Compliance
**Goal**: Extension meets Chrome Web Store NTP policy requirements
**Depends on**: Nothing (first phase)
**Requirements**: PLCY-01, PLCY-02
**Success Criteria** (what must be TRUE):
  1. User can search via search bar and results use browser's default search engine (chrome.search API)
  2. User cannot add site shortcuts with `javascript:` or other dangerous URL schemes—invalid schemes are rejected
**Plans**: 2 plans

Plans:
- [x] 01-01: Implement chrome.search.query() for search bar
- [x] 01-02: Add URL scheme validation for href attributes (http/https only)

### Phase 2: Bug Fixes
**Goal**: All known bugs resolved; dev tooling works in dev:web mode
**Depends on**: Nothing (parallelizable with Phase 1)
**Requirements**: BUGF-01, BUGF-02, BUGF-03, BUGF-04
**Success Criteria** (what must be TRUE):
  1. Setting modal opens without #imports error in dev:web mode
  2. Importing malformed JSON backup shows error instead of crashing
  3. Grid resize operations work without errors (no dead handler)
  4. Wallpaper loads in dev:web mode without CORS errors
**Plans**: 3 plans

Plans:
- [x] 02-01-PLAN.md — Verify #imports fix; commit if needed (BUGF-01) ✓ (2026-02-12)
- [x] 02-02-PLAN.md — JSON.parse try/catch + remove resizecontent handler (BUGF-02, BUGF-03) ✓ (2026-02-12)
- [x] 02-03-PLAN.md — Vite proxy for Bing/Picsum APIs (BUGF-04) ✓ (2026-02-12)

### Phase 3: Backup & Data Integrity
**Goal**: Backup export/import complete and reliable; restore preserves layout
**Depends on**: Nothing (parallelizable)
**Requirements**: BKUP-01, BKUP-02
**Success Criteria** (what must be TRUE):
  1. Exported backup file contains grid layout/order (restore preserves arrangement)
  2. Invalid backup import shows validation error instead of corrupting IndexedDB
**Plans**: 2 plans

Plans:
- [x] 03-01-PLAN.md — Include grid order in backup export (read from store); restore on import ✓ (2026-02-12)
- [x] 03-02-PLAN.md — Add Zod schema validation on import (reject invalid data before DB write) ✓ (2026-02-12)

### Phase 4: UI Polish
**Goal**: Settings modal and WebDAV area follow design system
**Depends on**: Nothing
**Requirements**: UIPL-01, UIPL-02
**Success Criteria** (what must be TRUE):
  1. Setting modal tab headers use CSS variables (no hardcoded rgba)
  2. WebDAV sync area shows "即将推出", inputs disabled, with brief explanation
**Plans**: 1 plan

Plans:
- [x] 04-01: Replace hardcoded styles; mark WebDAV as coming soon ✓ (2026-02-12)

### Phase 5: Backup Flow UI Wiring
**Goal**: Complete end-user backup export/import flow by wiring existing data-layer logic into UI
**Depends on**: Phase 3 (uses existing `utils/backup.ts` data-layer implementation)
**Requirements**: BKUP-01, BKUP-02
**Gap Closure**: Closes audit gaps from `.planning/v1.1.0-MILESTONE-AUDIT.md` (requirements + integration + flow)
**Success Criteria** (what must be TRUE):
  1. User can trigger backup export from UI and download JSON with `gridItems` + `gridOrder`
  2. User can import backup JSON from UI; invalid/malformed data shows clear error message without DB corruption
  3. UI is wired to `importBackupData` result object (`success`, `error`) for user feedback
**Plans**: 2 plans

Plans:
- [ ] 05-01-PLAN.md — Add backup export UI (export button wired to exportBackupData)
- [ ] 05-02-PLAN.md — Add import UI with NUpload, success/error feedback, E2E verify

### Phase 6: Design Token Cleanup (Optional)
**Goal**: Remove remaining hardcoded rgba values in shared components to improve design-system consistency
**Depends on**: Phase 4
**Requirements**: Tech debt cleanup (from milestone audit)
**Gap Closure**: Addresses non-critical tech debt from `.planning/v1.1.0-MILESTONE-AUDIT.md`
**Success Criteria** (what must be TRUE):
  1. `components/input/input.vue` no longer uses hardcoded rgba tokens
  2. `components/context-menu/context-menu.vue` no longer uses hardcoded rgba tokens
  3. Components continue to render correctly across theme variants
**Plans**: 1 plan

Plans:
- [ ] 06-01-PLAN.md — Replace hardcoded rgba with CSS variables; run visual regression checks

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6
(Phases 2–4 can be parallelized if desired; Phase 5 closes blocking milestone gaps; Phase 6 is optional cleanup.)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Policy Compliance | 2/2 | ✓ Complete | 2026-02-12 |
| 2. Bug Fixes | 3/3 | ✓ Complete | 2026-02-12 |
| 3. Backup & Data Integrity | 2/2 | ✓ Complete | 2026-02-12 |
| 4. UI Polish | 1/1 | ✓ Complete | 2026-02-12 |
| 5. Backup Flow UI Wiring | 0/2 | Not started | - |
| 6. Design Token Cleanup (Optional) | 0/1 | Not started | - |
