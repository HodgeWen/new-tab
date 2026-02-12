# Feature Landscape

**Domain:** Browser new tab page extension  
**Researched:** 2025-02-12  
**Confidence:** HIGH (Chrome Web Store listings, official policy docs, competitor analysis)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or prompts uninstall.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Site shortcuts / speed dial** | Core purpose of new tab; Opera legacy; all Speed Dial, Momentum, Infinity offer it | Low | Grid of clickable shortcuts with favicon + title. Unlimited or generous limits expected. |
| **Search bar** | Default Chrome new tab has search; users expect to search from new tab | Low | **Policy:** Must use `chrome.search` API — NTP extensions cannot alter search experience without it. [Chrome Program Policies](https://developer.chrome.com/docs/webstore/program-policies/quality-guidelines-faq). |
| **Customizable background / wallpaper** | Momentum, Infinity, Speed Dial all offer it; visual personalization is baseline | Low | Built-in collections + optional custom upload. Daily refresh is common. |
| **Settings / customization** | Users expect toggles for search bar, wallpaper, layout | Low | Minimal viable: show/hide search, wallpaper on/off, provider choice. |
| **Folders or groups** | Speed Dial, Infinity organize into groups; users with many shortcuts expect organization | Medium | Group/folder to collapse related sites. Drag-and-drop between groups expected. |
| **Backup / export** | Data loss is top complaint; users want to recover after reinstall or device change | Low | Export to JSON/file. Import optional but highly valued. |
| **Privacy clarity** | Top extensions loudly state "we don't sell data"; users penalize unclear policies | Low | Declare data handling in store listing + privacy policy. |
| **Fast load, no crash** | New tab opens constantly; lag or crashes drive immediate uninstall | Medium | Avoid heavy scripts, lazy-load non-critical UI. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Glassmorphism / distinct visual style** | Avoids generic "AI slop" look; memorable identity | Low | Project already has this via CSS variables. |
| **Cloud sync** | Access bookmarks across devices | High | Speed Dial, Infinity offer it; requires auth + backend. |
| **Context menu "Save to…"** | Add current page to new tab from anywhere | Low | Speed Dial 2 highlights this; improves DX significantly. |
| **Recently closed tabs** | Quick access to accidentally closed tabs | Medium | Speed Dial 2, Humble New Tab offer it. |
| **Theme / dark mode** | Comfort for different lighting | Low | Dark/light + wallpaper-aware themes. |
| **Keyboard shortcuts** | Power users expect `/` for search, Tab/arrows for nav | Low | Speed Dial 2 emphasizes this. |
| **Minimal footprint** | Small extension size, no bloat | Low | Focused feature set vs. Momentum/Infinity’s many widgets. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems for polish/release.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|--------------|
| **Changing default search provider** | Users want choice | Violates Chrome policy unless via Settings Overrides API; NTP must use `chrome.search` | Use `chrome.search`; respect user’s default; optional engine dropdown allowed if default is user’s choice |
| **AI chatbot / copilot in new tab** | Trendy, engaging | Broadens scope; policy allows vertical search, not horizontal; adds complexity | Defer; focus on core new tab use case |
| **To-do lists, notes, weather** | Momentum/Infinity have them | Turns extension into many-purpose product; increases maintenance; single-purpose policy risk | Defer; keep scope narrow |
| **Injecting ads** | Monetization | Single-purpose policy; users hate it | Don’t; premium or donate instead |
| **Aggressive upsell / paywall** | Monetization | Negative reviews; Momentum free tier is generous | Keep core free; optional premium only if justified |
| **Auto-opening "what’s new" or promo pages** | Engagement | Users hate it; reported as spam-like behavior | Never auto-open external pages |

## Feature Dependencies

```
Site shortcuts (speed dial)
    └── requires ──> Favicon fetching

Folders
    └── requires ──> Site shortcuts (sites live in folders)

Search bar
    └── requires ──> chrome.search API (policy)

Wallpaper
    └── enhances ──> Visual experience (independent)

Backup / export
    └── requires ──> Grid items store (Dexie)

Settings
    └── enhances ──> Search bar, wallpaper, layout
```

### Dependency Notes

- **Search bar requires `chrome.search`:** Chrome policy mandates NTP extensions use the Search API for web search. Hardcoding `google.com/search?q=` or redirecting to a fixed engine may violate policy.
- **Folders enhance shortcuts:** Folders are optional grouping; core shortcuts must work without them.
- **Backup depends on data store:** Export/import is straightforward once grid items are persisted.

## MVP / Launch Definition for This Milestone

*Context: Polish existing features for Chrome Web Store release — not adding new features.*

### Must Polish Before Release (v1)

- [ ] **Search bar:** Use `chrome.search.query()` instead of hardcoded Google URL — policy compliance.
- [ ] **Site shortcuts:** Ensure add/edit/delete, drag reorder, and favicon display work reliably.
- [ ] **Folders:** Verify open/close, move sites in/out, no data loss.
- [ ] **Wallpaper:** Bing/Picsum providers stable; no white flash on load.
- [ ] **Settings:** Toggles persist; no reset on restart.
- [ ] **Backup/export:** Export produces valid JSON; import restores grid correctly.
- [ ] **Privacy:** Store listing and privacy policy clearly state data handling.

### Should Verify (v1)

- [ ] **Performance:** New tab loads quickly; no obvious lag.
- [ ] **Edge cases:** Empty state, many items, folder with no sites.

### Defer (v1.x+)

- [ ] Cloud sync — backend + auth required.
- [ ] Context menu "Save page to..." — high value differentiator, add post-launch.
- [ ] Recently closed tabs — nice-to-have.
- [ ] Weather, to-do, notes — avoid scope creep.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Search bar (chrome.search) | HIGH | Low | **P1** — policy |
| Site shortcuts | HIGH | Low | **P1** |
| Folders | HIGH | Low | **P1** |
| Wallpaper | HIGH | Low | **P1** |
| Backup/export | HIGH | Low | **P1** |
| Settings | HIGH | Low | **P1** |
| Context menu "Save to" | MEDIUM | Low | P2 |
| Keyboard shortcuts | MEDIUM | Low | P2 |
| Cloud sync | MEDIUM | High | P3 |

## Competitor Feature Analysis

| Feature | Speed Dial 2 | Momentum | Infinity | Our Approach |
|---------|--------------|----------|----------|--------------|
| Shortcuts | ✓ Groups, unlimited | ✓ Quick links | ✓ Icons, 200+ built-in | ✓ Grid, folders |
| Search | ✓ | ✓ Google/Bing | ✓ Multi-engine | Hardcoded Google — **fix** |
| Wallpaper | ✓ Themes, custom | ✓ Daily inspiration | ✓ 365+ HD, upload | ✓ Bing, Picsum |
| Folders/groups | ✓ | — | — | ✓ |
| Backup/sync | ✓ Cloud | ✓ Plus | ✓ Cloud | ✓ Export/import (local) |
| Context menu | ✓ "Save page to" | — | — | — |
| To-do/notes | — | ✓ | ✓ | — (anti-feature) |
| Weather | — | ✓ | ✓ | — |
| Distinct UI | Themes | Inspirational | Flat icons | Glassmorphism ✓ |

## Critical Compliance Note

**Search implementation:** The current search bar navigates to `https://www.google.com/search?q=...` directly. Chrome Web Store policy states:

> "NTP extensions that provide a web search experience must respect the user's existing web search settings by using the Chrome Search API."

**Action:** Replace direct navigation with `chrome.search.query({ text: query, disposition: 'CURRENT_TAB' })` (or `NEW_TAB`). The extension already requests `search` permission.

## Sources

- [Chrome Web Store - Speed Dial 2](https://chromewebstore.google.com/detail/speed-dial-2-new-tab/jpfpebmajhhopeonhlcgidhclcccjcik)
- [Chrome Web Store - Momentum](https://chromewebstore.google.com/detail/momentum/laookkfknpbbblfpciffpaejjkokdgca)
- [Chrome Web Store - Infinity New Tab](https://chromewebstore.google.com/detail/infinity-new-tab/dbfmnekepjoapopniengjbcpnbljalfg)
- [Chrome Extensions Quality Guidelines FAQ](https://developer.chrome.com/docs/webstore/program-policies/quality-guidelines-faq)
- [Chrome Search API](https://developer.chrome.com/docs/extensions/reference/api/search)
- Web search: "best new tab Chrome extension comparison 2024 2025", "new tab extension user complaints"

---
*Feature research for: browser new tab extension polish / Chrome Web Store release*  
*Researched: 2025-02-12*
