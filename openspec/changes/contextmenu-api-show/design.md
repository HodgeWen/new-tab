## Context

当前 ContextMenu 通过在 `App.vue` 中显式挂载渲染器组件实现展示，业务层只能通过 `useContextMenu().show` 控制状态，缺少独立可导入的命令式 API。需求是实现 `contextmenu.show`，并由 API 负责渲染器挂载与状态映射，避免跨组件依赖与重复挂载。

## Goals / Non-Goals

**Goals:**
- 提供可导入的 `contextmenu.show(config)` API，遵循 `api.ts` 中类型定义。
- `show` 内部完成渲染器单例挂载与状态更新。
- 避免重复渲染（移除 `App.vue` 中的显式渲染器挂载）。

**Non-Goals:**
- 不扩展菜单能力（如 divider、submenu、danger、disabled）。
- 不改变现有 ContextMenu 交互与样式行为。

## Decisions

- **采用 B 方案（API 自挂载渲染器）**  
  - 原因：将挂载责任内聚到命令式 API，减少调用方要求与接入成本。  
  - 备选：继续依赖 `App.vue` 挂载（A 方案），但会保持“必须显式挂载”的耦合。

- **渲染器单例容器 + `render()` 初始化**  
  - 首次 `show` 时创建容器并 `render(ContextMenuRenderer, container)`；后续仅更新状态。  
  - 保障多次调用不会创建重复渲染树。

- **移除 `App.vue` 中的 `<ContextMenuRenderer />`**  
  - 原因：避免双渲染器导致重复菜单或状态竞争。  
  - 迁移成本低，且由 API 统一管理生命周期。

## Risks / Trade-offs

- **[Risk] API 未被调用时不渲染菜单** → **Mitigation**：只在需要展示时挂载是预期行为，无需常驻渲染器。
- **[Trade-off] 调用首次 `show` 会触发渲染开销** → **Mitigation**：首次开销可接受，且后续复用容器。

## Migration Plan

1. 在 `contextmenu.show` 中实现渲染器单例挂载与状态映射。
2. 从 `App.vue` 移除 `<ContextMenuRenderer />` 的显式挂载。
3. 验证现有右键菜单调用点可正常展示。

## Open Questions

- 是否需要在后续迭代中扩展 API 以支持 divider/submenu/danger/disabled？
