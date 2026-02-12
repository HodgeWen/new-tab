# Project Research Summary

**Project:** New Tab
**Domain:** Chrome Manifest V3 new tab page extension
**Researched:** 2025-02-12
**Confidence:** HIGH

## Executive Summary

This is a Chrome MV3 new tab page extension—a product category where users expect site shortcuts, search, customizable wallpapers, and backup/export. Competitors (Speed Dial 2, Momentum, Infinity) set clear table stakes. The recommended approach is to polish existing features for Chrome Web Store release: fix policy compliance (search API), unify backup schema (include grid order), resolve dev tooling (CORS proxy), and harden data integrity (import validation). Core stack (Vue 3.5, WXT, GridStack, Dexie) is already in place and appropriate; research focuses on dev tooling, testing, and store readiness.

Key risks: (1) Search bar uses hardcoded Google—must switch to `chrome.search` API for policy compliance or face rejection. (2) Backup export omits grid order—restore loses layout. (3) Import uses unvalidated `JSON.parse`—crashes on bad files and can corrupt IndexedDB. Mitigate by addressing these in a bug-fix/polish phase before submission.

## Key Findings

### Recommended Stack

Core framework (WXT ^0.20.15, Vue 3.5, Vite) is established. Research adds dev tooling for release quality.

**Core technologies:**
- **Vite server.proxy** — CORS bypass in dev:web; proxy wallpaper APIs (picsum, bing) so no CORS extension needed.
- **Vitest 4.x + @vue/test-utils** — Unit and component tests; aligns with WXT devDeps.
- **Playwright ^1.58.0** — Extension E2E; load unpacked extension via `launchPersistentContext` + `--load-extension`.
- **WXT analysis** — `wxt build --analyze` for bundle analysis.

**What NOT to use:** CORS Unblock extension, crossorigin.me, eval/remote code, hardcoded extension IDs in tests.

### Expected Features

**Must have (table stakes):**
- Site shortcuts / speed dial — grid of shortcuts with favicon + title.
- Search bar — must use `chrome.search` API (policy requirement).
- Customizable wallpaper — Bing/Picsum; built-in collections.
- Settings / customization — toggles persist.
- Folders or groups — organize shortcuts.
- Backup / export — include grid order; valid JSON.
- Privacy clarity — store listing + privacy policy.

**Should have (competitive):**
- Glassmorphism visual style — project already has this.
- Context menu "Save to…" — add page from anywhere (defer to v2).
- Minimal footprint — focused feature set.

**Defer (v2+):**
- Cloud sync — requires auth + backend.
- To-do, notes, weather — scope creep; single-purpose policy risk.

**Anti-features:** AI chatbot, injecting ads, changing default search without API, aggressive upsell.

### Architecture Approach

Single source of truth: store owns reactive state; persistence via explicit store → persistence layer calls. Components never call `db.*` or `localStorage` directly.

**Major components:**
1. **UI Layer** — Vue components; call store actions only.
2. **Data Layer (store/)** — gridItems, gridOrder, setting; orchestrate persistence.
3. **Persistence Layer (utils/)** — IndexedDB via Dexie as single backend; backup from single source.

**Patterns:** Unified storage (all user data in IndexedDB, including gridOrder/setting); store-owned explicit save (no deep watch); single backup schema with validation.

**Build order:** (1) Unified storage → (2) Backup improvements → (3) Bug fixes → (4) UI polish.

### Critical Pitfalls

1. **JSON.parse throws before try block** — Wrap `JSON.parse` in try/catch; validate schema before writing; return error to user.
2. **Dual storage breaks backup restore** — Include grid order in backup export; migrate setting/gridOrder to IndexedDB for unified backup.
3. **Unvalidated import corrupts IndexedDB** — Use Zod schema; reject invalid imports; never trust user JSON with `as BackupData`.
4. **Search violates single-purpose policy** — Use `chrome.search.query()` instead of hardcoded Google URL.
5. **WebDAV dead code** — Remove UI or implement; listing must not imply sync.

**Others:** Blue Argon (no remote code), Yellow Magnesium (test packed build), Purple Lithium (privacy policy URL), user URL validation (reject javascript:/data: in hrefs).

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Data Layer & Backup
**Rationale:** Backup depends on unified storage; grid order must be in IndexedDB to be exported.
**Delivers:** appMeta table in Dexie; migration of setting/gridOrder from localStorage; backup schema includes all user data; Zod validation on import.
**Addresses:** Backup/export, data integrity.
**Avoids:** Pitfall 2 (dual storage), Pitfall 3 (unvalidated import), Pitfall 1 (JSON.parse crash).

### Phase 2: Policy Compliance & Bug Fixes
**Rationale:** Must be done before Web Store submission.
**Delivers:** Search bar uses `chrome.search` API; WebDAV UI removed or marked clearly; URL validation for user-provided hrefs; dead code cleanup.
**Addresses:** Search bar, settings, privacy.
**Avoids:** Pitfall 9 (single-purpose), Pitfall 10 (dead code), Pitfall 11 (XSS/URL hazards).

### Phase 3: Dev Tooling & UX Polish
**Rationale:** Improves dev experience and release quality.
**Delivers:** Vite proxy for CORS in dev:web; Vitest + Playwright setup; setting-modal uses CSS variables; packed build test.
**Uses:** Vite proxy, Vitest, Playwright.
**Avoids:** Pitfall 12 (CORS dev vs prod), Pitfall 6 (Yellow Magnesium).

### Phase 4: Pre-Submission Audit
**Rationale:** Final verification before submission.
**Delivers:** Manifest audit (no excessive permissions); privacy policy URL; packed build E2E; no eval/remote code.
**Avoids:** Pitfall 5 (Blue Argon), Pitfall 7 (Purple Potassium), Pitfall 8 (Purple Lithium).

### Phase Ordering Rationale

- Phase 1 first: backup improvements require unified storage; migration must happen before any other data changes.
- Phase 2: policy and security fixes are blocking for submission; independent of storage refactor.
- Phase 3: dev tooling and polish can run in parallel with 1–2 for parts that don't touch data.
- Phase 4: always last; final verification before upload.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** Dexie migration pattern for localStorage → IndexedDB; schema validation (Zod) shape for BackupData.

Phases with standard patterns (skip research-phase):
- **Phase 2:** chrome.search API is well-documented; WebDAV removal is straightforward.
- **Phase 3:** Vite proxy, Playwright extension testing are documented.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official docs (WXT, Vite, Playwright); versions verified. |
| Features | HIGH | Chrome Web Store listings, official policy docs, competitor analysis. |
| Architecture | HIGH | Chrome storage docs, Dexie migration, codebase alignment. |
| Pitfalls | HIGH | Official violation docs, troubleshooting guide, CONCERNS.md. |

**Overall confidence:** HIGH

### Gaps to Address

- **PROJECT.md vs research:** Project constraints say "Storage: IndexedDB + localStorage — 已有架构，本次不重构." Architecture research recommends unified IndexedDB. Roadmapper should decide: (a) full migration in Phase 1, or (b) minimal change—extend backup schema to read gridOrder from localStorage for export only, without migrating storage.
- **WebDAV UI:** Research says remove or implement; PROJECT.md says "保留 WebDAV UI 但不实现功能." Resolution needed during requirements phase.

## Sources

### Primary (HIGH confidence)
- [WXT Config API](https://wxt.dev/api/config.html) — build, dev, analysis
- [Vite Server Options](https://vitejs.dev/config/server-options.html) — proxy
- [Playwright Chrome Extensions](https://playwright.dev/docs/chrome-extensions) — extension testing
- [Chrome Search API](https://developer.chrome.com/docs/extensions/reference/api/search) — policy
- [Chrome Web Store Quality Guidelines](https://developer.chrome.com/docs/webstore/program-policies/quality-guidelines-faq)
- [Chrome storage and cookies](https://developer.chrome.com/docs/extensions/develop/concepts/storage-and-cookies) — IndexedDB vs localStorage

### Secondary (MEDIUM confidence)
- Competitor Chrome Web Store listings (Speed Dial 2, Momentum, Infinity)
- Project CONCERNS.md, codebase ARCHITECTURE.md

---
*Research completed: 2025-02-12*
*Ready for roadmap: yes*
