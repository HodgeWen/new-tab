# Phase 1: Policy Compliance - Research

**Researched:** 2025-02-12
**Domain:** Chrome Extension APIs, URL validation, Chrome Web Store NTP policy
**Confidence:** HIGH

## Summary

Phase 1 addresses two policy requirements for Chrome Web Store NTP extensions: (1) using `chrome.search.query()` instead of hardcoded search URLs, and (2) validating site shortcut URLs to allow only `http:`/`https:` schemes.

**chrome.search:** The extension already has the `search` permission. The current search bar in `components/searcher/searcher.vue` redirects to `https://www.google.com/search?q=...`, which violates Chrome policy. Chrome explicitly requires NTP extensions with search to use the Search API so results respect the user's default search engine. The fix is replacing `window.location.href` with `chrome.search.query({ text, disposition })`. In dev:web mode (localhost), `chrome.search` is unavailable; a fallback is needed (e.g., `window.location` to a default or no-op).

**URL scheme validation:** Site shortcuts use `item.url` in `<a :href="item.url">` (site-item.vue, folder-item.vue). The site-modal's `normalizeUrl` adds `https://` when absent but does not explicitly reject dangerous schemes. If a user enters `javascript:alert(1)`, it could be stored and rendered as an executable href. Use an allow-list: parse the URL, check `protocol === 'http:' || protocol === 'https:'`, reject otherwise.

**Primary recommendation:** Replace search redirect with `chrome.search.query()`, add dev:web fallback, and implement URL scheme allow-list validation in site-modal (and optionally at render time for defense in depth).

---

## Standard Stack

### Core

| Library           | Version    | Purpose                                  | Why Standard                                 |
| ----------------- | ---------- | ---------------------------------------- | -------------------------------------------- |
| chrome.search API | Chrome 87+ | Execute search via user's default engine | Required by Chrome Web Store; no alternative |
| URL constructor   | Native     | Parse and validate scheme                | Built-in; no dependency needed               |

### Supporting

| Library | Version | Purpose        | When to Use                                                |
| ------- | ------- | -------------- | ---------------------------------------------------------- |
| (none)  | —       | URL validation | Native `URL` + protocol check is sufficient; no lib needed |

### Alternatives Considered

| Instead of                  | Could Use                   | Tradeoff                               |
| --------------------------- | --------------------------- | -------------------------------------- |
| Native URL + protocol check | url-sanitizer, validator.js | Native is sufficient; avoid extra deps |

**Installation:** No new packages required.

---

## Architecture Patterns

### Recommended Project Structure

```
components/
├── searcher/
│   └── searcher.vue       # Replace handleSearch with chrome.search.query
├── site-modal/
│   └── site-modal.vue     # Add isAllowedUrlScheme() / isValidSiteUrl()
└── site-item/
    └── site-item.vue      # Optional: safe href fallback

utils/
└── url.ts (optional)      # isAllowedUrlScheme() shared helper
```

### Pattern 1: chrome.search.query Usage

**What:** Call `chrome.search.query()` with query text and disposition.

**When to use:** Any NTP search bar that performs web search.

**Example:**

```typescript
// Source: Chrome Search API docs - https://developer.chrome.com/docs/extensions/reference/api/search

function handleSearch() {
  if (!query.value.trim()) return

  if (typeof chrome !== 'undefined' && chrome.search?.query) {
    chrome.search.query({
      text: query.value.trim(),
      disposition: 'CURRENT_TAB' // or 'NEW_TAB'
    })
  } else {
    // Fallback for dev:web (no extension context)
    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query.value)}`
  }
}
```

### Pattern 2: URL Scheme Allow-List

**What:** Parse URL with `new URL()`, check `protocol === 'http:' || protocol === 'https:'`, reject otherwise.

**When to use:** Any user-provided URL stored in `href` or used in navigation.

**Critical:** Parse the raw input first. If it has a protocol (e.g. `javascript:`, `data:`), check before normalizing. Normalizing `javascript:alert(1)` to `https://javascript:alert(1)` would incorrectly pass a protocol check.

**Example:**

```typescript
const ALLOWED_PROTOCOLS = ['http:', 'https:']

function normalizeAndValidate(urlString: string): string | null {
  const trimmed = urlString.trim()
  if (!trimmed) return null
  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    try {
      parsed = new URL(`https://${trimmed}`)
    } catch {
      return null
    }
  }
  return ALLOWED_PROTOCOLS.includes(parsed.protocol) ? parsed.href : null
}
// "javascript:alert(1)" → parsed.protocol is "javascript:" → reject
// "example.com" → first parse fails, "https://example.com" works → allow
```

### Anti-Patterns to Avoid

- **Blacklist (javascript:, data:)** — New schemes can be added; allow-list is safer.
- **Normalizing before protocol check** — `javascript:alert(1)` with `https://` prefix becomes `https://javascript:alert(1)` which parses as https; must check raw URL protocol first.
- **Only checking `startsWith('http')`** — `httpjavascript:alert(1)` would pass; use URL.parse + protocol.

---

## Don't Hand-Roll

| Problem               | Don't Build                    | Use Instead                       | Why                                               |
| --------------------- | ------------------------------ | --------------------------------- | ------------------------------------------------- |
| Search execution      | Manual redirect to Google/Bing | `chrome.search.query()`           | Policy violation; ignores user preference         |
| URL scheme validation | Regex blacklist                | `new URL()` + protocol allow-list | Blacklist misses edge cases; native URL is robust |

**Key insight:** Chrome Search API is the only compliant way to perform search from an NTP extension. Custom URL validation is trivial enough with native URL; no library needed.

---

## Common Pitfalls

### Pitfall 1: chrome.search Unavailable in dev:web

**What goes wrong:** `chrome.search` is undefined when running via `dev:web` (localhost) instead of extension context.

**Why it happens:** Extension APIs exist only in `chrome-extension://` context.

**How to avoid:** Guard with `typeof chrome !== 'undefined' && chrome.search?.query`; fallback to `window.location` for dev only.

**Warning signs:** Search does nothing or throws in dev:web.

---

### Pitfall 2: Normalizing Before Protocol Check

**What goes wrong:** `javascript:alert(1)` becomes `https://javascript:alert(1)` after normalize; `protocol === 'https:'` incorrectly allows it.

**Why it happens:** `normalizeUrl` adds `https://` before validation.

**How to avoid:** Parse raw input first; if protocol is not http/https, reject. Only normalize for URLs without a scheme (e.g., `example.com`).

**Warning signs:** Malicious URLs slip through when user omits `https://`.

---

### Pitfall 3: Import Backup With Malicious URLs

**What goes wrong:** Old backup contains `javascript:` URLs; import restores them; href executes.

**Why it happens:** Phase 1 focuses on add/edit; import validation is Phase 3 (BKUP-02).

**How to avoid:** Phase 1: validate on add/edit. Phase 3: add schema validation including URL scheme on import. Optional: render-time check in site-item for defense in depth.

**Warning signs:** Imported shortcuts trigger unexpected behavior.

---

## Code Examples

### chrome.search.query (search bar)

```typescript
// components/searcher/searcher.vue

function handleSearch() {
  const text = query.value.trim()
  if (!text) return

  if (typeof chrome !== 'undefined' && chrome.search?.query) {
    chrome.search.query({ text, disposition: 'CURRENT_TAB' })
  } else {
    // dev:web fallback
    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(text)}`
  }
}
```

### URL Scheme Validation (site-modal)

```typescript
// site-modal.vue - use normalizeAndValidate for urlStatus and before handleSave

const validatedUrl = normalizeAndValidate(form.url) // null if invalid
// urlStatus: 'error' when validatedUrl is null (and url non-empty)
// handleSave: reject if validatedUrl is null
```

---

## State of the Art

| Old Approach                | Current Approach      | When Changed           | Impact                             |
| --------------------------- | --------------------- | ---------------------- | ---------------------------------- |
| Hardcoded Google search URL | chrome.search.query() | Policy since 2017+     | NTP extensions must use Search API |
| No URL validation           | Allow-list http/https | Security best practice | Prevents XSS via javascript: href  |

**Deprecated/outdated:**

- Direct `window.location` to fixed search engine: Violates policy; use chrome.search.

---

## Open Questions

1. **Import backup URL validation**
   - What we know: Phase 3 will add schema validation (BKUP-02); grid items include `url`.
   - What's unclear: Whether Phase 1 should also validate URLs during import.
   - Recommendation: Phase 1 scope = add/edit only. Phase 3 can add URL scheme check to import schema validation.

2. **Render-time href sanitization**
   - What we know: Validation at add/edit prevents bad data from entering.
   - What's unclear: Whether to add defensive check in site-item when rendering href (e.g., if protocol invalid, use `#`).
   - Recommendation: Optional defense in depth; not required for success criteria.

---

## Sources

### Primary (HIGH confidence)

- [Chrome Search API](https://developer.chrome.com/docs/extensions/reference/api/search) — `chrome.search.query()` signature, parameters, availability
- [Chrome Web Store Quality Guidelines FAQ](https://developer.chrome.com/docs/webstore/program-policies/quality-guidelines-faq) — "NTP extensions that provide a web search experience must respect the user's existing web search settings by using the Chrome Search API"
- [Chrome API Use Policy](https://developer.chrome.com/docs/webstore/program-policies/api-use) — Must use designated APIs; URL Overrides for NTP

### Secondary (MEDIUM confidence)

- [Secure JavaScript URL validation (Snyk)](https://medium.com/@snyksec/secure-javascript-url-validation-a74ef7b19ca8) — Allow-list over blacklist
- [CodeQL: Incomplete URL scheme check](https://codeql.github.com/codeql-query-help/javascript/js-incomplete-url-scheme-check/) — javascript:, data:, vbscript: as dangerous

### Tertiary (LOW confidence)

- WebSearch: Chrome Web Store NTP policy 2024–2025 — confirms Search API requirement

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — Official Chrome docs; no third-party stack
- Architecture: HIGH — Simple two-file changes; patterns from existing codebase
- Pitfalls: HIGH — Documented in Chrome policy and codebase CONCERNS.md

**Research date:** 2025-02-12
**Valid until:** 30 days (Chrome APIs stable)
