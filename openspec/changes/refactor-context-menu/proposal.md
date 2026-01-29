## Why

当前 `ContextMenu.vue` 组件需要升级，以实现：

1. 玻璃风格（Glassmorphism）- 与项目整体设计语言保持一致
2. 高性能 - 优化渲染和交互性能
3. 流畅过渡 - 更精致的动画效果

## What Changes

- **玻璃风格**：应用 `glass-context-menu` 样式，实现半透明模糊效果
- **流畅过渡**：优化进入/离开动画，子菜单展开动画
- **高性能**：使用 render 函数减少不必要的响应式开销
- **保持 API 不变**：`showContextmenu` 函数签名和调用方式保持一致

## Capabilities

### New Capabilities

- `context-menu-renderer`: 玻璃风格的高性能上下文菜单组件

### Modified Capabilities

（无现有 spec 需要修改）

## Impact

- **代码变更**：
  - `shadcn/ui/context-menu/ContextMenu.vue` - 重写实现
- **样式依赖**：使用 `assets/styles/components.css` 中定义的 glass 类
- **使用方**：API 不变，无需修改
