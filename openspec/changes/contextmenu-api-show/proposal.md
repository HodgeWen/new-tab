# Change: ContextMenu 可导入 API（B 方案）

## Why

目前 ContextMenu 只能依赖组件渲染器显式挂载，缺少可直接调用的命令式 API，导致跨组件复用与集成成本高。需要提供稳定的 `show` 入口，并在调用时自动完成渲染器挂载。

## What Changes

- 实现 `shadcn/ui/context-menu/api.ts` 的 `contextmenu.show`，以类型定义为准。
- `show` 内部确保 ContextMenu 渲染器单例挂载，并将配置映射为菜单状态。
- 为避免重复渲染，移除或替换现有手动挂载的渲染器引用（仅保留 API 管控）。

## Capabilities

### New Capabilities
- *(none)*

### Modified Capabilities
- `ui-menu`: 增加“命令式 ContextMenu API（`show(config)`）可用”的能力说明。

## Impact

- Affected code:
  - `shadcn/ui/context-menu/api.ts`
  - `shadcn/ui/context-menu/context-menu-renderer.vue`
  - `shadcn/ui/context-menu/index.ts`
  - `entrypoints/newtab/App.vue`
