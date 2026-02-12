# Domain Pitfalls: Chrome New Tab Page Extension

**Domain:** Chrome MV3 new tab page extension
**Researched:** 2025-02-12
**Confidence:** HIGH (official Chrome docs, troubleshooting, program policies)

---

## Critical Pitfalls

### Pitfall 1: JSON.parse Throws Before Try Block (Backup Import)

**What goes wrong:**
User selects an invalid JSON file for backup import; `JSON.parse(text)` throws before the `try` block that wraps DB operations. Unhandled rejection crashes the import flow; user sees no feedback.

**Why it happens:**
`JSON.parse` is called outside the try/catch. Parsing happens first; only DB writes are guarded. Malformed JSON or non-JSON files (e.g. .txt, .html) trigger the exception.

**Consequences:**
- Unhandled promise rejection
- Silent failure or cryptic error in console
- User data may appear corrupted if partial state is shown

**How to avoid:**
Wrap `JSON.parse` in try/catch. Validate structure (e.g. Zod schema or manual checks for `gridItems` array) before `bulkAdd`. Return `false` and show user-facing error on parse failure.

**Warning signs:**
- `JSON.parse(text)` called without surrounding try/catch
- No schema validation before writing to IndexedDB
- Import handler doesn't distinguish "parse error" vs "DB error"

**Phase to address:**
Bug fix / polish phase — before Web Store submission.

---

### Pitfall 2: Dual Storage Split Breaks Backup Restore

**What goes wrong:**
Grid items live in IndexedDB; grid order lives in `localStorage`. Export backup includes only IndexedDB data. Restore from backup restores items but loses custom layout order.

**Why it happens:**
Two storage mechanisms evolved separately; backup schema only covers one. No single source of truth for "complete user state."

**Consequences:**
- User exports backup, reinstalls, restores — layout is wrong
- Support burden; user confusion about "lost" customizations
- Inconsistent behavior between export and import

**How to avoid:**
Include grid order in backup schema. Export both `gridItems` and `gridOrder`. On import, restore both. Optionally migrate to single storage (e.g. `chrome.storage.local` or IndexedDB-only with order embedded).

**Warning signs:**
- Backup export reads from one store but not another
- `gridOrder` and `gridItems` maintained in separate stores
- Import logic doesn't mention layout/order

**Phase to address:**
Bug fix / polish phase — high user impact for backup/restore flows.

---

### Pitfall 3: Unvalidated Import Corrupts IndexedDB

**What goes wrong:**
`importBackupData` uses `JSON.parse(text) as BackupData` with no validation. Malformed or adversarial JSON (wrong shape, extra keys, missing ids) is written to IndexedDB via `bulkAdd`. DB can end up in inconsistent state.

**Why it happens:**
Type assertion (`as BackupData`) bypasses TypeScript runtime checks. No schema validation; any JSON is trusted.

**Consequences:**
- Corrupted grid items (missing `id`, invalid structure)
- Dexie/IndexedDB errors on subsequent reads
- Possible need to clear DB and start over

**How to avoid:**
Validate with Zod (or similar) before writing. Reject imports that fail validation. Log rejected payloads for debugging.

**Warning signs:**
- `as BackupData` or similar type assertions on user input
- No `if (Array.isArray(gridItems) && gridItems.every(...))` checks
- `bulkAdd` receives unvalidated data

**Phase to address:**
Bug fix / polish phase — data integrity.

---

### Pitfall 4: localStorage vs chrome.storage — Persistence and Service Worker Access

**What goes wrong:**
Extension uses `localStorage` for settings and grid order. Chrome docs state: (a) Service workers cannot use `localStorage`; (b) Data saved via Web Storage API may be lost when user clears browsing history (per chrome.storage docs). Extension storage doc says extension storage is NOT cleared—contradiction exists; safer to use `chrome.storage` for critical data.

**Why it happens:**
localStorage is familiar; `chrome.storage` requires manifest permission and async API. New tab page runs in extension context so has localStorage, but future service worker or offscreen usage would break.

**Consequences:**
- If user clears history with "cookies and site data," some Chrome versions may clear extension localStorage (LOW confidence — docs conflict)
- Any background/service worker logic cannot read settings
- Harder to add sync or cross-tab features later

**How to avoid:**
For user preferences and layout: prefer `chrome.storage.local` with `storage` permission. Keeps data isolated from host pages and aligns with Chrome’s recommended extension storage. Migrate `setting` and `gridOrder` if adding service worker features.

**Warning signs:**
- `localStorage.getItem` in extension code
- No `chrome.storage` usage despite storing user data
- Plans for background sync or offscreen documents

**Phase to address:**
Pre-release phase if adding service worker features; otherwise tech-debt backlog.

---

### Pitfall 5: Blue Argon — Remotely Hosted Code (MV3 Violation)

**What goes wrong:**
Extension fetches or executes code from remote sources. Violation ID: **Blue Argon**. Common causes: `<script src="https://...">`, `eval()`, `new Function(remoteString)`, or building an interpreter for remote commands.

**Why it happens:**
MV3 requires all logic to be self-contained in the extension package. External resources may contain data, but not executable logic.

**Consequences:**
- Rejection at review
- Possible takedown if already published

**How to avoid:**
- All scripts must be in the extension package
- No `eval()` or dynamic code execution from remote strings
- Fetch JSON/data only; never execute fetched content as code

**Warning signs:**
- Any `eval`, `new Function`, or `setTimeout(string)`
- Script tags pointing to non-extension URLs
- Dynamic import of remote modules

**Phase to address:**
Pre-submission audit — verify before first Web Store upload.

---

### Pitfall 6: Yellow Magnesium — Functionality Not Working

**What goes wrong:**
Reviewer finds packaging errors, missing files, or features that don’t work. Common causes: manifest references files that don’t exist; incorrect paths; case-sensitive path mismatches (e.g. `Background.js` vs `background.js` on case-sensitive systems).

**Why it happens:**
Unpacked and packed extensions can behave differently. Dev workflow uses unpacked; submission uses packed .crx. Vite/WXT output paths may differ from expectations.

**Consequences:**
- Rejection; "Functionality not working"
- Must fix and resubmit; delays launch

**How to avoid:**
- Test the exact packed extension (build → load .crx in chrome://extensions)
- Verify all manifest paths exist in build output
- Use consistent casing for filenames
- Test on unreliable network (timeouts, 4xx/5xx) and surface errors to user

**Warning signs:**
- Never tested packed build
- Manifest references assets not in output
- No error handling for external API failures (Bing, Picsum)

**Phase to address:**
Pre-submission QA — test packed build end-to-end.

---

### Pitfall 7: Purple Potassium — Excessive Permissions

**What goes wrong:**
Extension requests permissions it doesn’t use. Review flags this as excessive. Host patterns like `*://*/*` or `https://*/*` trigger longer review and stricter scrutiny.

**Why it happens:**
"Future-proofing" permissions, copying from examples, or not auditing after feature removal.

**Consequences:**
- Rejection or warning
- Longer review for broad host permissions
- User trust impact from permission prompt

**How to avoid:**
- Request only permissions actually used
- Use narrow host patterns (e.g. `https://www.bing.com/*`, `https://picsum.photos/*`)
- Remove unused permissions before submission
- Do not request `storage` if only using IndexedDB/localStorage (per Chrome docs)

**Warning signs:**
- `*://*/*` or `<<all_urls>>` in host_permissions
- Permissions for removed features (e.g. WebDAV if not implemented)
- Unused optional_permissions

**Phase to address:**
Pre-submission audit — review manifest against implemented features.

---

### Pitfall 8: Purple Lithium — Missing or Broken Privacy Policy

**What goes wrong:**
Extension collects user data (preferences, bookmarks/sites, wallpapers, backup) but has no privacy policy, or policy is in description instead of designated field, or URL is broken.

**Why it happens:**
Policy required for any collection of user data. Easy to forget or misconfigure.

**Consequences:**
- Rejection
- Must add policy and resubmit

**How to avoid:**
- Publish privacy policy at stable URL
- Add URL in Developer Dashboard → Privacy tab
- Describe what data is collected, how it’s used, and that it stays local (no server transmission)
- Ensure link works from incognito and different browsers

**Warning signs:**
- No privacy policy URL in dashboard
- Policy in description field only
- Policy doesn’t mention extension data

**Phase to address:**
Pre-submission checklist — before first submission.

---

### Pitfall 9: New Tab Single Purpose — Search Experience Violation

**What goes wrong:**
NTP extension alters search experience without using `chrome.search` API. Quality Guidelines explicitly prohibit: "New Tab Page extensions that alter the user's web search experience and don't respect the user's existing search settings."

**Why it happens:**
Custom search bar or search redirect that doesn’t use `chrome.search` API. Policy enforced since 2024.

**Consequences:**
- Rejection or removal
- Must use `chrome.search` or remove search UI

**How to avoid:**
- If providing search: use `chrome.search` API and respect user’s default search
- If not providing search: ensure no search interception or redirect
- `search` permission is declared; verify it’s used correctly per API

**Warning signs:**
- Custom search box that submits to non-default engine
- Overriding or changing default search behavior
- Search UI without `chrome.search` integration

**Phase to address:**
Design phase (if adding search) or pre-submission audit.

---

### Pitfall 10: Dead Code and Promised-but-Missing Features (Deceptive Behavior)

**What goes wrong:**
WebDAV UI and credentials exist; `webdav` package is installed but never used. Listing could imply sync capability. Review may treat this as deceptive or non-functioning.

**Why it happens:**
Feature started but not completed; UI left in place.

**Consequences:**
- Possible deception violation if listing implies sync
- Confusion; users enter credentials with no effect
- Extra bundle size; maintenance burden

**How to avoid:**
- Remove WebDAV UI and dependency until sync is implemented, or
- Implement sync and document it
- Ensure listing matches implemented features only

**Warning signs:**
- Credential/connection UI with no backend
- Dependencies never imported
- Listing mentions features not present

**Phase to address:**
Bug fix / polish phase — resolve before submission.

---

### Pitfall 11: User-Provided URLs — XSS and Navigation Hazards

**What goes wrong:**
`<a :href="item.url">` uses user-provided URLs. Malicious values like `javascript:alert(1)` or `data:text/html,...` can execute script or navigate unexpectedly.

**Why it happens:**
User data is trusted; no validation or sanitization of URL scheme.

**Consequences:**
- XSS if `javascript:` or `data:` URLs execute in extension context
- Unwanted navigation or behavior

**How to avoid:**
- Validate URLs: allow only `http:`, `https:`, `chrome-extension:`
- Reject or sanitize `javascript:`, `data:`, `vbscript:`, etc.
- Use `rel="noopener noreferrer"` for external links

**Warning signs:**
- `href` bound directly to user input
- No URL scheme validation
- No CSP mitigating script execution from URLs

**Phase to address:**
Bug fix / polish phase — security hardening.

---

### Pitfall 12: CORS in Dev vs Production

**What goes wrong:**
In dev mode, new tab is served by Vite dev server (e.g. `localhost`). Fetch to Bing/Picsum may fail with CORS. In production, extension uses `chrome-extension://` origin and `host_permissions`, so CORS doesn’t apply.

**Why it happens:**
Vite dev server origin differs from extension origin. Extensions bypass CORS for declared host_permissions; dev server doesn’t.

**Consequences:**
- Wallpaper fails in dev; works in built extension
- Developer confusion; false sense of broken feature

**How to avoid:**
- Use Vite proxy for wallpaper URLs in dev (redirect to proxy, proxy fetches)
- Document that CORS only affects dev; extension build uses host_permissions
- Test wallpaper in packed extension before release

**Warning signs:**
- Wallpaper fetch fails in `npm run dev` but works when loaded as extension
- No proxy configured for external APIs in dev

**Phase to address:**
Dev setup phase — document and fix dev-mode behavior.

---

## Moderate Pitfalls

### Pitfall 13: Blob URL Lifespan and Revocation

**What goes wrong:**
IndexedDB stores wallpaper Blobs; `getWallpaper` creates blob URLs. Caller must revoke with `URL.revokeObjectURL`. If not revoked, memory leaks; if revoked too early, image breaks during transitions.

**Prevention:**
Document lifecycle in code. Use `BLOB_REVOKE_DELAY` and `pendingRevokeTimers` (as in `use-wallpaper.ts`). Revoke only when next wallpaper is displayed.

---

### Pitfall 14: chrome.storage.sync Write Limits

**What goes wrong:**
If migrating to `chrome.storage.sync`: 120 writes/minute, 1800/hour, 100KB total, 8KB per item. Exceeding limits causes silent failures.

**Prevention:**
Batch updates; debounce frequent writes. Use `storage.local` for larger or high-frequency data.

---

### Pitfall 15: Incognito New Tab Not Overridden

**What goes wrong:**
Extensions cannot override New Tab in incognito. Users in incognito see default Chrome NTP.

**Prevention:**
Document in listing. Don’t promise incognito support. Consider messaging if NTP is critical.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| `as BackupData` type assertion | No validation code | DB corruption on bad import | Never for user input |
| Dual storage (IDB + localStorage) | Quick to add | Backup incomplete, restore broken | Avoid; unify if possible |
| Empty event handlers (resizecontent) | Placeholder compiles | Dead code, unclear intent | Remove or implement |
| Hardcoded colors in components | Fast styling | Breaks theme, AGENTS.md violation | Never; use CSS variables |
| WebDAV UI without implementation | Shows roadmap | Deceptive, bundle bloat | Remove or implement |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|-------------------|
| Bing wallpaper | Assuming CORS works in dev | Use Vite proxy in dev; host_permissions in prod |
| Picsum | No error handling for 4xx/5xx | Handle fetch errors; show fallback or retry |
| Favicon fetch | Same-origin assumptions | Use `favicon` permission; handle failures |
| File import | Trusting file contents | Validate JSON; schema check; try/catch parse |

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|----------------|------------|
| Backup/restore | JSON parse, dual storage, no validation | Fix all three; add schema validation |
| Web Store submission | Blue Argon, Yellow Magnesium, Purple * | Audit manifest, test packed build, privacy policy |
| Storage refactor | localStorage vs chrome.storage | Decide migration scope; test persistence |
| Search feature | Single purpose violation | Use chrome.search API only |
| WebDAV sync | Credentials in localStorage | Prefer chrome.storage; avoid plaintext passwords |

---

## "Looks Done But Isn't" Checklist

- [ ] **Backup import:** Parse wrapped in try/catch — verify unhandled rejection fix
- [ ] **Backup export:** Grid order included — verify restore preserves layout
- [ ] **Listed features:** No WebDAV sync implied — remove UI or implement
- [ ] **Privacy policy:** URL in Dashboard, working, describes data collection
- [ ] **Packed build:** Test .crx in chrome://extensions — not just dev
- [ ] **Permissions:** No unused permissions — audit manifest
- [ ] **URL handling:** User URLs validated — no javascript:/data: in href
- [ ] **External APIs:** Bing/Picsum errors handled — no silent failures

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| JSON parse crash | LOW | Add try/catch; validate; return false |
| Backup missing grid order | MEDIUM | Extend schema; migrate export/import |
| DB corruption from bad import | MEDIUM | Add validation; consider wipe + re-import option |
| Review rejection (Blue Argon) | LOW | Remove remote code; resubmit |
| Review rejection (Privacy) | LOW | Add policy URL; resubmit |
| Data loss (localStorage cleared) | HIGH | Migrate to chrome.storage; no easy recovery |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| JSON.parse, backup validation | Bug fix / polish | Unit test import with invalid JSON |
| Dual storage, grid order in backup | Bug fix / polish | Export → reinstall → import → layout matches |
| Blue Argon, MV3 code | Pre-submission audit | Grep for eval, remote scripts |
| Yellow Magnesium | Pre-submission QA | Load packed .crx; test all flows |
| Purple Lithium (privacy) | Pre-submission checklist | Policy URL works; content correct |
| Single purpose (search) | Design / audit | Search uses chrome.search only |
| WebDAV dead code | Bug fix / polish | Remove or implement; no UI without backend |
| URL validation | Bug fix / polish | Test javascript: URL; no execution |

---

## Sources

- [Chrome Web Store Review Process](https://developer.chrome.com/docs/webstore/review-process)
- [Troubleshooting Chrome Web Store Violations](https://developer.chrome.com/docs/webstore/troubleshooting)
- [Override Chrome Pages (New Tab)](https://developer.chrome.com/docs/extensions/develop/ui/override-chrome-pages)
- [chrome.storage API](https://developer.chrome.com/docs/extensions/reference/api/storage)
- [Storage and Cookies (Extensions)](https://developer.chrome.com/docs/extensions/develop/concepts/storage-and-cookies)
- [Quality Guidelines](https://developer.chrome.com/docs/webstore/program-policies/quality-guidelines)
- [Chrome Web Store Policy Updates 2024](https://developer.chrome.com/blog/cws-policy-updates-2024)
- Project CONCERNS.md (2025-02-12)

---
*Pitfalls research for: Chrome MV3 new tab page extension*
*Researched: 2025-02-12*
