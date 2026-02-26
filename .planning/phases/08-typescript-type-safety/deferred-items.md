# Deferred Items

## 2026-02-26 - Plan 08-02 verification baseline issues

- `npx vue-tsc --noEmit` fails in files unrelated to 08-02 task scope:
  - `components/searcher/searcher.vue`: `Cannot find name 'chrome'` (TS2304)
  - `components/site-modal/site-modal.vue`: `Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature` (TS7017)
- These are pre-existing and outside the current plan file scope. Left unchanged per deviation boundary rules.

## 2026-02-26 - Plan 08-03 verification baseline issues

- `npx vue-tsc --noEmit` still reports the same out-of-scope baseline errors:
  - `components/searcher/searcher.vue`: `Cannot find name 'chrome'` (TS2304)
  - `components/site-modal/site-modal.vue`: `Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature` (TS7017)
- Confirmed no additional type errors in `components/grid-layout/use-grid-stack.tsx` and `components/folder-view/folder-view.vue`.
