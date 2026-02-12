# New Tab

## What This Is

一个面向 Chrome Web Store 发布的浏览器新标签页扩展。以毛玻璃风格（Glassmorphism）UI 为核心设计语言，支持网格化管理网站快捷方式和文件夹分组，提供壁纸背景切换、搜索栏、备份导入导出等实用功能。目标用户是追求美观和高效的浏览器用户。

## Core Value

打开新标签页即刻拥有一个美观、快速、可自定义的个人导航面板——网站一目了然、操作直觉化、视觉令人愉悦。

## Requirements

### Validated

<!-- 已有代码中已实现且正常运作的功能 -->

- ✓ 网格布局展示网站快捷方式（GridStack 拖拽排列） — existing
- ✓ 添加/编辑/删除网站项（含 URL 自动解析、favicon 自动生成） — existing
- ✓ 文件夹分组（创建文件夹、支持多种尺寸、站点移入/移出） — existing
- ✓ 右键上下文菜单（全局空白区、网站项、文件夹项各有菜单） — existing
- ✓ 设置面板（搜索栏开关、壁纸源选择、壁纸间隔） — existing
- ✓ IndexedDB 持久化存储（网格项数据、壁纸缓存） — existing
- ✓ 搜索栏（跳转 Google 搜索） — existing
- ✓ 编辑模式（批量选择、全选、批量删除） — existing
- ✓ 壁纸系统基础架构（多壁纸源、缓存、定时刷新） — existing
- ✓ 毛玻璃 UI 设计系统（CSS 变量、主题系统、工具类） — existing

### Active

<!-- 当前需要完成的工作 -->

- [ ] 修复 dev:web 模式壁纸 CORS 问题（Vite 代理配置）
- [ ] 修复 setting-modal.vue 中 `#imports` 导入问题（已修复，待提交）
- [ ] 修复备份导入 JSON 解析容错（`utils/backup.ts`）
- [ ] 备份导入导出包含 grid order 数据
- [ ] 修复 use-grid-stack.tsx 空 resizecontent handler（移除死代码）
- [ ] setting-modal 硬编码样式替换为 CSS 变量
- [ ] 清理 WebDAV 未实现的 UI（或标记为"即将推出"）

### Out of Scope

- WebDAV 数据同步实现 — v1 不做，仅保留 UI 占位
- 搜索引擎切换（Google/Bing/Baidu） — v1 固定 Google
- 移动端适配 — Chrome 扩展仅桌面
- 测试覆盖 — 当前阶段专注功能稳定性

## Context

- 这是一个已有代码库（brownfield），核心 UI 和数据层已基本完成
- 代码库已通过 `/gsd:map-codebase` 完成架构映射
- 构建使用 WXT 框架（Chrome Manifest V3），同时支持 `dev:web` 模式独立调试
- 技术栈：Vue 3.5 + TypeScript + GridStack + Dexie + Lucide Icons
- 存储分布：网格项在 IndexedDB，设置和排序在 localStorage
- 壁纸源：Bing 每日壁纸、Picsum Random（需 host_permissions）

## Constraints

- **Tech Stack**: Vue 3.5+ / TypeScript / WXT — 已锁定，不变
- **Browser**: 仅 Chrome（Manifest V3），不考虑 Firefox/Safari
- **Storage**: IndexedDB + localStorage — 已有架构，本次不重构
- **Design**: 必须遵循 `AGENTS.md` 中定义的毛玻璃设计系统和 CSS 变量规范

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| v1 不实现 WebDAV 同步 | 降低发布复杂度，WebDAV 逻辑可后续单独里程碑实现 | — Pending |
| 壁纸 CORS 用 Vite proxy 解决 | 仅影响 dev 模式，扩展模式通过 host_permissions 天然解决 | — Pending |
| 保留 WebDAV UI 但不实现功能 | 用户可提前填写配置，后续实现时无需改 UI | — Pending |

---
*Last updated: 2025-02-12 after initialization*
