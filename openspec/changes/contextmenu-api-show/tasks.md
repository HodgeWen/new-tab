## 1. API 渲染器挂载与状态映射

- [x] 1.1 在 `shadcn/ui/context-menu/api.ts` 实现 `contextmenu.show`：创建单例容器、渲染 `ContextMenuRenderer`、将 config 映射为菜单状态
- [x] 1.2 处理 `context` 透传到 `action` 的调用路径，确保无 context 时也能安全执行

## 2. 去除重复挂载与导出调整

- [x] 2.1 从 `entrypoints/newtab/App.vue` 移除 `<ContextMenuRenderer />` 显式挂载
- [x] 2.2 调整 `shadcn/ui/context-menu/index.ts`，导出可导入的 `contextmenu` API

## 3. 验证与回归

- [ ] 3.1 验证空白区域、网站卡片、文件夹卡片右键菜单仍可正常显示与触发
