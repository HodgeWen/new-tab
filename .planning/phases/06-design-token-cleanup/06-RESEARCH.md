# Phase 6: Design Token Cleanup - Research

**Researched:** 2026-02-12
**Domain:** CSS design tokens, theme system, visual regression
**Confidence:** HIGH

## Summary

Phase 6 removes the remaining hardcoded `rgba` values in two shared components identified by the v1.1.0 milestone audit: `input.vue` and `context-menu.vue`. The project already has a mature CSS variable theme system in `variables.css` with three variants (default, `dark-wallpaper`, `light-wallpaper`). The replacement strategy is straightforward: introduce two new design tokens (`--glass-bg-disabled`, `--glass-bg-elevated`) and use existing `--glass-bg-hover` for hover states. The same pattern was successfully applied in Phase 4 for setting-modal.

**Primary recommendation:** Add `--glass-bg-disabled` and `--glass-bg-elevated` to `variables.css` with theme-specific values, then replace the hardcoded rgba usages in both target components. Run manual visual checks across all three theme variants.

## User Constraints

No CONTEXT.md exists for this phase. No locked decisions or discretion areas.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue 3.5+ | existing | Component framework | Project standard |
| CSS variables | native | Design tokens | Project theme system (AGENTS.md) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-vue-next | existing | Icons | Project standard (AGENTS.md) |

**Installation:** None required. Changes are CSS-only.

## Architecture Patterns

### Design Token Flow
```
variables.css (defines tokens per theme)
    ↓
components/*.vue (use var(--token-name) in scoped styles)
```

### Pattern 1: Theme-Aware Token Definition
**What:** Define the same token name in `:root` and each `[data-theme="..."]` block with theme-specific values.
**When to use:** Any token that must adapt to dark/light wallpaper.
**Example:**
```css
/* variables.css */
:root {
  --glass-bg: rgba(255, 255, 255, 0.08);
}

[data-theme="dark-wallpaper"] {
  --glass-bg: rgba(0, 0, 0, 0.25);
}

[data-theme="light-wallpaper"] {
  --glass-bg: rgba(255, 255, 255, 0.6);
}
```

### Pattern 2: Reuse Existing Tokens Before Adding New Ones
**What:** Prefer `--glass-bg-hover` for hover states instead of adding a new token.
**When to use:** Semantic match exists (e.g., hover → glass-bg-hover).

### Anti-Patterns to Avoid
- **Hardcoding rgba in components:** Breaks theme consistency; use CSS variables.
- **Adding tokens without theme variants:** New tokens must be defined for all three theme scopes (`:root`, `dark-wallpaper`, `light-wallpaper`).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Theme switching | Custom JS/SASS theme engine | CSS variables + data-theme | Project already uses this; no new infrastructure |
| Visual regression | Manual screenshot diffing | Manual checks across themes | Phase scope is small; no Playwright/Cypress needed per audit |
| Color math | manual rgba computation | Semantic tokens in variables.css | Single source of truth |

## Common Pitfalls

### Pitfall 1: Forgetting Theme Variants
**What goes wrong:** New token works in default theme but breaks in dark/light wallpaper.
**Why it happens:** Token added only to `:root`.
**How to avoid:** Define the token in all three blocks: `:root`, `[data-theme="dark-wallpaper"]`, `[data-theme="light-wallpaper"]`.
**Warning signs:** Token only in `:root`.

### Pitfall 2: Over-Opaque Elevated Surfaces on Light Theme
**What goes wrong:** `--glass-bg-elevated` uses dark rgba on light theme, making dropdowns invisible or jarring.
**Why it happens:** Copy-pasting dark theme values.
**How to avoid:** Light theme must use light/white rgba (e.g., `rgba(255, 255, 255, 0.98)`).
**Warning signs:** Same rgba for all themes.

### Pitfall 3: Disabled State Too Strong
**What goes wrong:** Disabled input looks like a hole or too dark.
**Why it happens:** `--glass-bg-disabled` opacity too high.
**How to avoid:** Keep subtle overlay (e.g., default `rgba(0, 0, 0, 0.05)`); light theme may need `rgba(0, 0, 0, 0.06)`).

## Code Examples

### Target Replacements (input.vue)

**Current (line 131):**
```css
.input-wrapper.disabled {
  background: rgba(0, 0, 0, 0.05);
}
```

**Replace with:**
```css
.input-wrapper.disabled {
  background: var(--glass-bg-disabled);
}
```

**Current (line 189):**
```css
.clear-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}
```

**Replace with:**
```css
.clear-btn:hover {
  background: var(--glass-bg-hover);
}
```

### Target Replacements (context-menu.vue)

**Current (line 116):**
```css
.context-menu-content {
  background: rgba(30, 30, 30, 0.95);
  /* ... */
}
```

**Replace with:**
```css
.context-menu-content {
  background: var(--glass-bg-elevated);
  /* ... */
}
```

### New Tokens (variables.css)

Add to `:root`:
```css
--glass-bg-disabled: rgba(0, 0, 0, 0.05);
--glass-bg-elevated: rgba(30, 30, 30, 0.95);
```

Add to `[data-theme="dark-wallpaper"]`:
```css
--glass-bg-disabled: rgba(0, 0, 0, 0.15);
--glass-bg-elevated: rgba(20, 20, 20, 0.98);
```

Add to `[data-theme="light-wallpaper"]`:
```css
--glass-bg-disabled: rgba(0, 0, 0, 0.06);
--glass-bg-elevated: rgba(255, 255, 255, 0.98);
```

## Related Components (Out of Phase Scope)

The following components also use hardcoded rgba but are **not** in the phase success criteria. Documented for future cleanup:

| File | Usage | Same Token? |
|------|-------|-------------|
| `context-menu-item.vue` | `rgba(30, 30, 30, 0.95)` (submenu) | `--glass-bg-elevated` |
| `select.vue` | `rgba(30, 30, 30, 0.95)` (dropdown), `rgba(255,255,255,0.2)` (scrollbar), `rgba(255,255,255,0.1)` (hover) | `--glass-bg-elevated`, new tokens for scrollbar/hover |
| `modal.vue` | overlay, close-btn hover, header hover | Separate overlay token |
| `switch.vue` | track, shadows | Track-specific tokens |
| `folder-item.vue` | text-shadow | Decorative |
| `site-modal.vue` | canvas fillStyle | Canvas API—requires different approach |

**Recommendation:** Phase 6 scope is input.vue + context-menu.vue only. Optionally include `context-menu-item.vue` since it uses the same `rgba(30, 30, 30, 0.95)` submenu background—requires zero extra tokens.

## Verification Approach

1. **Build:** `pnpm dev:web` or `pnpm build`
2. **Manual checks:**
   - Default theme: input (default, disabled, focused, clear-btn hover), context menu
   - `data-theme="dark-wallpaper"`: same
   - `data-theme="light-wallpaper"`: same
3. **Grep:** `rgba(` in `components/input/input.vue` and `components/context-menu/context-menu.vue` → 0 matches

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Hardcoded rgba in components | CSS variables in variables.css | Theme consistency, single source of truth |
| Phase 4 scope (setting-modal only) | Phase 6 scope (input, context-menu) | Extends token cleanup to shared components |

## Open Questions

1. **Include context-menu-item.vue?**
   - What we know: Same `rgba(30, 30, 30, 0.95)` as context-menu.vue; no new tokens needed.
   - Recommendation: Include in plan for consistency; success criteria could be expanded or kept as "context-menu" folder.

2. **Exact values for theme variants**
   - What we know: Default values are fixed; dark/light are estimated from existing patterns.
   - Recommendation: Tune during implementation if visual regression shows issues.

## Sources

### Primary (HIGH confidence)
- `entrypoints/newtab/styles/variables.css` — theme structure, existing tokens
- `components/input/input.vue` — exact hardcoded values
- `components/context-menu/context-menu.vue` — exact hardcoded values
- `components/setting-modal/setting-modal.vue` — Phase 4 pattern (var-based, no rgba)
- `AGENTS.md` — design token system, theme variants

### Secondary (MEDIUM confidence)
- `.planning/v1.1.0-MILESTONE-AUDIT.md` — tech debt items, scope

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — project uses CSS variables; no new stack
- Architecture: HIGH — Phase 4 established pattern; variables.css structure known
- Pitfalls: HIGH — theme variant omission is well-understood risk

**Research date:** 2026-02-12
**Valid until:** 90 days (stable CSS variable approach)
