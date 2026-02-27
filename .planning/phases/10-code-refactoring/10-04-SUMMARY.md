---
phase: 10-code-refactoring
plan: 04
subsystem: ui
tags: [store, selector, context-menu]
requires: []
provides:
  - grid item store 提供共享文件夹候选选择器
  - site-item context menu 去除本地 folder 过滤实现
affects: [site-item, grid-items-store, folder-move-flow]
tech-stack:
  added: []
  patterns: [store-level-selector]
key-files:
  created: []
  modified: [store/grid-items.ts, components/site-item/site-item.vue]
key-decisions:
  - "将文件夹候选筛选提升到 store，避免组件重复读取/过滤 runtime map"
patterns-established:
  - "组件上下文菜单优先消费 store selector，而非直接操作底层 map"
requirements-completed: [RFAC-03]
duration: 1 min
completed: 2026-02-27
---

# Phase 10 Plan 04 Summary

**“移入分组”文件夹列表已改为 store 级共享 selector，`site-item` 不再内联过滤 `gridItemsMap`。**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-27T09:03:30+08:00
- **Completed:** 2026-02-27T09:04:06+08:00
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- 在 `grid-items.ts` 新增 `getFolderCandidates`，输出类型安全文件夹候选列表。
- `site-item.vue` 改为调用共享 selector，删除组件内联过滤逻辑。
- 保持编辑/移入分组/移出文件夹/删除的菜单行为顺序不变。

## Task Commits

1. **Task 1: Add shared folder candidate selector to grid-item store** - `4bb354c` (refactor)
2. **Task 2: Refactor `site-item.vue` to consume shared selector** - `989861d` (refactor)

**Plan metadata:** 待 phase 文档提交统一记录

## Files Created/Modified
- `store/grid-items.ts` - 新增无副作用 `getFolderCandidates` selector。
- `components/site-item/site-item.vue` - 改用 store selector 生成“移入分组”子菜单。

## Decisions Made
- selector 支持可选排除项参数，为后续扩展（如排除当前 folder）预留接口。

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- 组件层筛选逻辑已下沉，后续其它组件可复用相同 selector。
- 无阻塞项。

---
*Phase: 10-code-refactoring*
*Completed: 2026-02-27*
