# Phase 8: TypeScript Type Safety - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

消除代码库中的 `any` 类型和不安全类型断言，用泛型和类型守卫替换。目标是让 TypeScript 编译器捕获真实 bug。范围限于 Success Criteria 列出的四个目标：ContextMenu/Select 泛型、类型守卫函数、Bing API 类型化、use-grid-stack 断言消除。

</domain>

<decisions>
## Implementation Decisions

### Select 组件泛型 API
- 采用**显式泛型传参**：`<NSelect<string>>` 风格，调用方手动指定 value 类型
- Option 结构**灵活化**：支持自定义 label/value 字段名（类似 Element Plus 的 `label-key` / `value-key`），不限定为固定的 `{ label, value }` 形状
- 泛型化后**全量修复**所有调用方，确保零类型报错，不做渐进兼容

### ContextMenu 组件
- 公开 API（`types.ts` 的 `ContextmenuItem<A>`、`showContextmenu` 重载）已有泛型，**不改动**
- 只修复 `context-menu.vue` 内部实现中的 `any`，确保内部类型安全

### Claude's Discretion
- Select 灵活 Option 的具体 API 设计（props 字段名 vs 泛型约束）
- 类型守卫（isSiteItem / isFolderItem）的文件位置和命名约定
- Bing API 响应的接口定义粒度
- use-grid-stack 断言消除的具体重构方式

</decisions>

<specifics>
## Specific Ideas

- Select 灵活结构参考 Element Plus 的做法（labelKey / valueKey props），用户熟悉这个模式
- 破坏性变更态度明确：泛型化是一次性完成的，不保留 `any` 默认值做过渡

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-typescript-type-safety*
*Context gathered: 2026-02-19*
