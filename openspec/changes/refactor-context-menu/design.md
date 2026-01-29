## Context

当前 `ContextMenu.vue` 是一个独立实现的上下文菜单组件：

- 手动实现了菜单定位、动画、子菜单展开等逻辑
- 通过 `api.ts` 的 `showContextmenu` 函数以命令式方式调用
- 使用 Vue `render` 函数将组件渲染到动态创建的 DOM 容器

## Goals / Non-Goals

**Goals:**

- 重构 `ContextMenu.vue`，使用 render 函数实现更清晰的渲染逻辑
- 实现 DOM 容器复用，避免频繁创建/销毁
- 保持 `showContextmenu` API 完全兼容

**Non-Goals:**

- 不改变现有的 `ContextmenuItem` 类型定义
- 不添加新的菜单功能（如 checkbox、radio 项）
- 不修改调用方代码

## Decisions

### 1. 自定义实现菜单渲染

**决定**：在 `ContextMenu.vue` 中自定义实现菜单渲染，使用 render 函数

**理由**：

- reka-ui ContextMenu 经测试不可行
- DropdownMenu + virtual element 方案不够优雅
- 自定义实现更直接、可控，无需绑定到特定库的 API
- 保持现有样式类名，与 shadcn 风格一致

**实现方式**：

- 使用 Vue `render` 函数动态渲染菜单结构
- 复用现有的 Tailwind CSS 类保持样式一致
- 自行处理定位、边界检测、子菜单展开等逻辑

### 2. 容器复用策略

**决定**：保留现有的容器复用逻辑（10 秒延迟销毁）

**理由**：

- 现有策略已经实现了基本的复用
- 10 秒延迟可以覆盖大多数连续操作场景
- 不需要更复杂的池化机制

## Risks / Trade-offs

**[Trade-off] render 函数可读性** → render 函数比 template 更难阅读，但提供了必要的动态性。通过良好的代码组织和注释缓解。

**[Trade-off] 自行维护样式** → 需要手动保持与 shadcn 组件样式一致，但避免了对外部库 API 的依赖。
