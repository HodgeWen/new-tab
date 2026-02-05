## Why

项目基础骨架已完成，但组件的业务逻辑和样式系统均未实现。需要完成所有组件的功能开发，并建立统一的毛玻璃风格 UI，让新标签页应用可以正常使用。

## What Changes

### 业务功能

- 实现 `site-item` 网站项组件的渲染逻辑
- 实现 `site-modal` 网站编辑模态框（地址、名称、图标编辑，自动获取 favicon 并转 base64）
- 实现 `folder-item` 文件夹组件的渲染逻辑
- 实现 `folder-modal` 文件夹编辑模态框（尺寸选择、名称编辑）
- 实现 `setting-modal` 设置模态框（搜索栏开关、壁纸设置、数据备份）
- 实现 `grid-layout` 基于 GridStack 的网格布局渲染
- 实现 `store` 层数据管理（UI ↔ store ↔ db/localStorage）
- 实现 `context-menu` 右键菜单 API

### 样式系统

- 创建全局样式系统（CSS 变量、基础样式）
- 为所有组件添加毛玻璃（glassmorphism）效果
- 添加简洁的交互过渡效果（hover 高亮）

## Capabilities

### New Capabilities

- `site-item`: 网站项组件 - 显示网站图标和名称，支持在 GridStack 和 folder-item 中渲染
- `site-modal`: 网站编辑模态框 - 编辑网站地址/名称/图标，自动获取 favicon 转 base64
- `folder-item`: 文件夹组件 - 显示文件夹内的网站项，支持多种尺寸
- `folder-modal`: 文件夹编辑模态框 - 编辑文件夹名称和尺寸（1x2、2x1、2x2）
- `setting-modal`: 设置模态框 - 搜索栏开关、壁纸设置、数据导入导出
- `grid-layout`: 网格布局 - 基于 GridStack 的拖拽布局，使用 renderCB 渲染
- `data-store`: 数据管理层 - 基于 Vue 响应式系统的 store，连接 UI 与持久化存储
- `context-menu`: 右键菜单 - API 调用方式的上下文菜单
- `glass-ui-style`: 毛玻璃 UI 风格系统 - CSS 变量、backdrop-filter 效果
- `interaction-transitions`: 交互过渡效果 - hover 高亮、聚焦效果、Modal 淡入淡出

### Modified Capabilities

<!-- 无现有 specs 需要修改 -->

## Impact

- `components/**/*.vue` - 所有组件需要实现业务逻辑和样式
- `store/grid-items.ts` - 需要实现网格项状态管理
- `entrypoints/newtab/style.css` - 需要创建全局样式文件
- `utils/` - 可能需要添加 favicon 获取、图片转 base64 等工具函数
