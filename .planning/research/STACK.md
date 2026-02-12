# Stack Research: Chrome MV3 New Tab Extension — Dev Tooling

**Domain:** Browser extension (new tab page)
**Researched:** 2025-02-12
**Confidence:** HIGH

Focus: Dev experience improvements (CORS proxying, testing, build optimization) for quality Chrome Web Store release. Core stack (Vue 3.5, WXT, GridStack, Dexie) is already in place — not re-researched here.

---

## Recommended Stack

### Core Framework (Existing — Verified Current)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| WXT | **^0.20.15** | Extension framework, build, dev server | Next-gen framework for MV3; HMR, file-based entrypoints, Vite under the hood. Current project: 0.20.13 — upgrade to 0.20.15 for latest fixes. |
| Vite | ^5.x (via WXT) | Bundling, dev server | WXT uses Vite; `server.proxy` solves CORS in dev:web without third-party tools. |
| Vue | ^3.5.x | UI framework | Already in use; 3.5+ provides Props destructuring, useTemplateRef. |

### Development Tools

| Tool | Version | Purpose | Notes |
|------|---------|---------|-------|
| **Vite server.proxy** | (built-in) | CORS bypass in dev:web | Proxy wallpaper APIs in `vite.config.ts`; no CORS extension needed. |
| **Vitest** | ^4.0.18 | Unit + component tests | WXT’s own devDeps use Vitest 4.x; aligns with project. |
| **@playwright/test** | ^1.58.0 | Extension E2E tests | Official support for loading extensions via `launchPersistentContext` + `--load-extension`. |
| **@vue/test-utils** | ^2.4.x | Vue component unit tests | Standard for Vue + Vitest. |
| **WXT analysis** | (built-in) | Bundle analysis | `wxt build --analyze` or `analysis.enabled: true`; uses rollup-plugin-visualizer. |

### Supporting Libraries (Dev-Only)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @playwright/test | ^1.58.0 | E2E for new tab, popup, options | Before Chrome Web Store release; cover critical flows. |
| @vue/test-utils | ^2.4.x | Mount/shallow Vue components | Unit tests for components and composables. |
| happy-dom or jsdom | (Vitest default) | DOM simulation | Vitest can use happy-dom; fine for most unit tests. |

---

## CORS Proxying (Dev:web Mode)

**Problem:** In `dev:web` (standalone Vite at `localhost:5173`), fetching from `picsum.photos` and `bing.com` triggers CORS because the page origin is localhost.

**Solution:** Use Vite `server.proxy` in `vite.config.ts`. Proxy paths become same-origin; no CORS.

**Implementation:**

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [vue(), vueJsx()],
  root: 'entrypoints/newtab',
  resolve: { alias: { '@': resolve(__dirname), '~': resolve(__dirname) } },
  server: {
    port: 5173,
    open: false,
    proxy: {
      '/api/picsum': {
        target: 'https://picsum.photos',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/picsum/, ''),
      },
      '/api/bing': {
        target: 'https://www.bing.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/bing/, ''),
      },
    },
  },
})
```

**Provider adaptation:** In `utils/wallpaper-providers.ts`, use proxy base URL when running in dev:web (localhost) vs extension (chrome-extension://):

```typescript
const isDevWeb = import.meta.env.DEV && !window.location.href.startsWith('chrome-extension://')
const API_BASE = isDevWeb
  ? { picsum: '/api/picsum', bing: '/api/bing' }
  : { picsum: 'https://picsum.photos', bing: 'https://www.bing.com' }
```

**Confidence:** HIGH — Vite proxy is documented, `changeOrigin` handles CORS. Extension mode (`wxt dev`) uses `host_permissions`; no proxy needed.

---

## Testing Strategy

### Unit Tests (Vitest + @vue/test-utils)

| Layer | Tool | Approach |
|-------|------|----------|
| Pure utils | Vitest | Direct import, mock `fetch` for wallpaper-providers. |
| Composables | Vitest + @vue/test-utils | Mount minimal components or use `@vue/test-utils` `render`. |
| Components | Vitest + @vue/test-utils | Shallow render; mock `useWallpaper`, `useGridStack`, etc. |

### Extension E2E (Playwright)

| Scenario | Approach |
|----------|----------|
| New tab loads | Load extension via `launchPersistentContext`, navigate to `chrome-extension://${extensionId}/newtab.html`. |
| Popup | Same context; `page.goto(\`chrome-extension://${extensionId}/popup.html\`)`. |
| Background | Use `context.serviceWorkers()` to get extension ID. |

**Fixture pattern (from Playwright docs):**

```typescript
// fixtures.ts
import { test as base, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  context: async ({}, use) => {
    const pathToExtension = path.join(__dirname, '.output/chrome-mv3');
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    const [serviceWorker] = context.serviceWorkers();
    const sw = serviceWorker ?? await context.waitForEvent('serviceworker');
    const extensionId = sw.url().split('/')[2];
    await use(extensionId);
  },
});
```

**Note:** Use Playwright’s bundled `chromium`; Chrome/Edge may not support `--load-extension` via CLI flags.

**Confidence:** HIGH — Playwright docs and examples cover this pattern.

---

## Build Optimization

| Technique | How | Notes |
|-----------|-----|-------|
| WXT bundle analysis | `wxt build --analyze` or `analysis: { enabled: true }` in config | Uses rollup-plugin-visualizer; treemap by default. |
| Production ZIP | `wxt zip` | Default artifact: `{{name}}-{{version}}-{{browser}}.zip`. |
| Mode-aware plugins | `vite: (configEnv) => ({ plugins: configEnv.mode === 'production' ? [...] : [] })` | WXT warns: some plugins may run in dev; gate by mode. |

**Chrome Web Store:** MV3 requires manifest_version 3 and `host_permissions` separate from `permissions`. No remote code in production.

---

## Installation

```bash
# Upgrade WXT (if needed)
npm update wxt

# Dev tooling for release quality
npm install -D vitest @vue/test-utils @playwright/test

# Playwright browsers (for extension E2E)
npx playwright install chromium
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|--------------------------|
| Vite proxy | CORS Unblock extension | Avoid; adds another extension and manual toggling. |
| Vite proxy | crossorigin.me | Avoid; 2MB limit, GET only, third-party dependency. |
| Playwright | Puppeteer | Playwright has better extension support and docs. |
| Vitest 4.x | Vitest 3.x | Project uses Vitest 4 via WXT; stay consistent. |
| Vitest browser mode | Vitest browser mode | Optional; use for complex Vue components that need real DOM. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| CORS Unblock / Cacao extension | Extra install, manual toggle, not part of project | Vite `server.proxy` in vite.config.ts |
| crossorigin.me / third-party CORS proxy | Unreliable, limits, privacy concern | Vite proxy |
| CRXJS, Webpack for extension | Older ecosystem; WXT is current standard | WXT |
| `eval()` or remote code in extension | Chrome Web Store policy violation | Bundle all logic locally |
| Hardcoded extension IDs in tests | IDs change per build | Derive from `context.serviceWorkers()` |

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| wxt@^0.20.0 | vite@^5.4 \| ^6.3 \| ^7.0, vitest@^4.0 | WXT 0.20.x supports multiple Vite versions |
| vitest@^4.0 | vite@^6.0, node@>=20 | Vitest 4 requires Node 20+ |
| @playwright/test@^1.58 | Playwright 1.58+ | Use Chromium channel for extension loading |

---

## Sources

- [WXT Config API](https://wxt.dev/api/config.html) — `vite`, `dev`, `analysis`, `zip`
- [WXT Vite Guide](https://wxt.dev/guide/essentials/config/vite.html) — Vite customization
- [Vite Server Options](https://vitejs.dev/config/server-options.html) — `server.proxy`, `server.cors`
- [Playwright: Chrome Extensions](https://playwright.dev/docs/chrome-extensions) — extension testing
- [Chrome MV3 Program Policies](https://developer.chrome.com/docs/webstore/program-policies/mv3-requirements) — remote code, manifest
- [Chrome Cross-Origin](https://developer.chrome.com/docs/extensions/develop/concepts/network-requests) — host_permissions
- npm: wxt@0.20.15, vitest@4.0.18, @playwright/test@1.58.0 — versions verified 2025-02-12

---
*Stack research for: Chrome MV3 new tab extension — dev tooling*
*Researched: 2025-02-12*
