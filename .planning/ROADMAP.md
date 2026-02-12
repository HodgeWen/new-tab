# Roadmap: New Tab

## Overview

Prepare the New Tab extension for Chrome Web Store release: address policy compliance (search API, URL validation), fix known bugs, harden backup/import, and polish UI. Phases are ordered by store-submission priority; many items can run in parallel within phases.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Policy Compliance** - Search bar uses chrome.search API; URL scheme validation
- [ ] **Phase 2: Bug Fixes** - #imports fix, JSON parse safety, dead code removal, CORS proxy
- [ ] **Phase 3: Backup & Data Integrity** - Export includes grid order; import validation
- [ ] **Phase 4: UI Polish** - CSS variables; WebDAV "即将推出" marking

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
- [ ] 01-01: Implement chrome.search.query() for search bar
- [ ] 01-02: Add URL scheme validation for href attributes (http/https only)

### Phase 2: Bug Fixes
**Goal**: All known bugs resolved; dev tooling works in dev:web mode
**Depends on**: Nothing (parallelizable with Phase 1)
**Requirements**: BUGF-01, BUGF-02, BUGF-03, BUGF-04
**Success Criteria** (what must be TRUE):
  1. Setting modal opens without #imports error in dev:web mode
  2. Importing malformed JSON backup shows error instead of crashing
  3. Grid resize operations work without errors (no dead handler)
  4. Wallpaper loads in dev:web mode without CORS errors
**Plans**: 2–3 plans

Plans:
- [ ] 02-01: Fix #imports in setting-modal (BUGF-01; may already be fixed, commit)
- [ ] 02-02: Try/catch JSON.parse and dead code cleanup (BUGF-02, BUGF-03)
- [ ] 02-03: Vite proxy for Bing/Picsum APIs (BUGF-04)

### Phase 3: Backup & Data Integrity
**Goal**: Backup export/import complete and reliable; restore preserves layout
**Depends on**: Nothing (parallelizable)
**Requirements**: BKUP-01, BKUP-02
**Success Criteria** (what must be TRUE):
  1. Exported backup file contains grid layout/order (restore preserves arrangement)
  2. Invalid backup import shows validation error instead of corrupting IndexedDB
**Plans**: 2 plans

Plans:
- [ ] 03-01: Include grid order in backup export (read from localStorage)
- [ ] 03-02: Add schema validation on import (reject invalid data)

### Phase 4: UI Polish
**Goal**: Settings modal and WebDAV area follow design system
**Depends on**: Nothing
**Requirements**: UIPL-01, UIPL-02
**Success Criteria** (what must be TRUE):
  1. Setting modal tab headers use CSS variables (no hardcoded rgba)
  2. WebDAV sync area shows "即将推出", inputs disabled, with brief explanation
**Plans**: 1 plan

Plans:
- [ ] 04-01: Replace hardcoded styles; mark WebDAV as coming soon

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4
(Phases 2–4 can be parallelized if desired; Phase 1 is highest priority.)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Policy Compliance | 0/2 | Not started | - |
| 2. Bug Fixes | 0/3 | Not started | - |
| 3. Backup & Data Integrity | 0/2 | Not started | - |
| 4. UI Polish | 0/1 | Not started | - |
