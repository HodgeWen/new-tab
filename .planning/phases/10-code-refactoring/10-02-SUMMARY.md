---
phase: 10-code-refactoring
plan: 02
subsystem: infra
tags: [vue, composables, modal, dependency-cleanup, wallpaper]
requires: []
provides:
  - 壁纸逻辑拆分为状态层、抓取层与 facade 层
  - useModal 脱离 @cat-kit/core，改为原生深拷贝/深合并
  - 依赖树移除 @cat-kit/core
affects: [wallpaper-system, modal-state, dependency-graph]
tech-stack:
  added: []
  patterns: [facade-module-split, dependency-free-composable]
key-files:
  created: [hooks/use-wallpaper-state.ts, hooks/use-wallpaper-fetch.ts]
  modified: [hooks/use-wallpaper.ts, hooks/use-modal.ts, package.json, package-lock.json, bun.lock]
key-decisions:
  - "保持 useWallpaper 对外 API 不变，仅做内部职责拆分"
  - "useModal 在每次 open 前重置基线并执行深合并，消除历史字段残留风险"
patterns-established:
  - "复杂 composable 拆分为 state/fetch/facade 三段式结构"
requirements-completed: [RFAC-02, RFAC-05]
duration: 3 min
completed: 2026-02-27
---

# Phase 10 Plan 02 Summary

**壁纸 composable 已完成 state/fetch/facade 拆分，并移除了 `@cat-kit/core` 依赖而保持现有调用接口稳定。**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-27T08:59:15+08:00
- **Completed:** 2026-02-27T09:02:55+08:00
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- `use-wallpaper` 拆分为 `use-wallpaper-state` 与 `use-wallpaper-fetch`，并保留 facade 入口。
- `use-modal` 改为原生 clone/merge/reset 逻辑，移除第三方深合并依赖。
- `package.json/package-lock.json/bun.lock` 同步清理 `@cat-kit/core`。

## Task Commits

1. **Task 1: Decompose wallpaper composable into state and fetch modules** - `99bae43` (refactor)
2. **Task 2: Remove `@cat-kit/core` by native modal merge/reset implementation** - `9f8899a` (refactor)

**Plan metadata:** 待 phase 文档提交统一记录

## Files Created/Modified
- `hooks/use-wallpaper-state.ts` - 统一管理壁纸响应式状态、定时器和生命周期。
- `hooks/use-wallpaper-fetch.ts` - 统一管理壁纸 provider 拉取、缓存读写、刷新调度。
- `hooks/use-wallpaper.ts` - 作为 facade 暴露原有 `useWallpaper()` API。
- `hooks/use-modal.ts` - 使用原生深拷贝与深合并实现开关弹窗状态管理。
- `package.json` - 移除 `@cat-kit/core`。
- `package-lock.json` - 移除对应 lock 记录。
- `bun.lock` - 移除对应 lock 记录。

## Decisions Made
- wallpaper 逻辑采取 “状态与生命周期 / 远端抓取 / 对外 facade” 三层隔离。
- modal 在 `open` 前先 reset，再 merge patch，保证每次打开表单状态可预测。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `Setting` 泛型约束不满足导致 `vue-tsc` 失败**
- **Found during:** Task 2
- **Issue:** `useModal<T extends Record<string, unknown>>` 要求索引签名，`Setting` 不满足。
- **Fix:** 将泛型约束调整为 `T extends object`，内部继续用受控类型转换处理 merge。
- **Files modified:** `hooks/use-modal.ts`
- **Verification:** `npx vue-tsc --noEmit` 通过。
- **Committed in:** `9f8899a`

**2. [Rule 3 - Blocking] bun 离线环境无法自动更新锁文件**
- **Found during:** Task 2
- **Issue:** `bun remove @cat-kit/core` 在受限网络下无法拉取清单。
- **Fix:** 先用 `npm install --package-lock-only` 更新 npm 锁，再手动同步删除 `bun.lock` 中对应条目。
- **Files modified:** `package-lock.json`, `bun.lock`
- **Verification:** `rg -n "@cat-kit/core" package.json package-lock.json bun.lock hooks/use-modal.ts` 无命中。
- **Committed in:** `9f8899a`

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** 全部为编译/环境阻塞修复，无行为变更。

## Issues Encountered
- 受限网络导致 `bun remove` 无法在线解析依赖，改为本地锁文件同步方式处理。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- 为后续目录命名统一（hooks -> composables）提供了清晰模块边界。
- 无阻塞项。

---
*Phase: 10-code-refactoring*
*Completed: 2026-02-27*
