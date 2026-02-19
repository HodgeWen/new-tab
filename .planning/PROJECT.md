# New Tab

## What This Is

一个面向 Chrome Web Store 发布的浏览器新标签页扩展。以毛玻璃风格（Glassmorphism）UI 为核心设计语言，支持网格化管理网站快捷方式和文件夹分组，提供壁纸背景切换、搜索栏（chrome.search API 合规）、备份导入导出（含 schema 验证）等实用功能。已通过 Chrome NTP 政策合规审查，具备 Web Store 发布条件。

## Core Value

打开新标签页即刻拥有一个美观、快速、可自定义的个人导航面板——网站一目了然、操作直觉化、视觉令人愉悦。

## Requirements

### Validated

- ✓ 网格布局展示网站快捷方式（GridStack 拖拽排列） — existing
- ✓ 添加/编辑/删除网站项（含 URL 自动解析、favicon 自动生成） — existing
- ✓ 文件夹分组（创建文件夹、支持多种尺寸、站点移入/移出） — existing
- ✓ 右键上下文菜单（全局空白区、网站项、文件夹项各有菜单） — existing
- ✓ 设置面板（搜索栏开关、壁纸源选择、壁纸间隔） — existing
- ✓ IndexedDB 持久化存储（网格项数据、壁纸缓存） — existing
- ✓ 编辑模式（批量选择、全选、批量删除） — existing
- ✓ 壁纸系统基础架构（多壁纸源、缓存、定时刷新） — existing
- ✓ 毛玻璃 UI 设计系统（CSS 变量、主题系统、工具类） — existing
- ✓ 搜索栏使用 chrome.search.query() API（PLCY-01） — v1.1.0
- ✓ 站点 URL scheme 验证，仅允许 http/https（PLCY-02） — v1.1.0
- ✓ 修复 setting-modal #imports 导入问题（BUGF-01） — v1.1.0
- ✓ 备份导入 JSON.parse try/catch 容错（BUGF-02） — v1.1.0
- ✓ 移除 use-grid-stack 空 resizecontent handler（BUGF-03） — v1.1.0
- ✓ Vite 开发代理解决壁纸 CORS（BUGF-04） — v1.1.0
- ✓ 备份导出包含 gridOrder（BKUP-01） — v1.1.0
- ✓ 备份导入 Zod schema 验证（BKUP-02） — v1.1.0
- ✓ setting-modal 样式使用 CSS 变量（UIPL-01） — v1.1.0
- ✓ WebDAV 区域标记"即将推出"并禁用（UIPL-02） — v1.1.0
- ✓ 备份导出/导入 UI 完整接入 setting-modal — v1.1.0
- ✓ 共享组件设计 Token 清理（input、context-menu） — v1.1.0

### Active

## Current Milestone: v1.2.0 UI全面优化和代码精简

**Goal:** 全面优化 UI 视觉和交互体验，重构冗余代码，提升代码质量和可维护性——不新增功能，专注打磨现有体验。

**重点区域：**
- 网格布局（拖拽、网格项外观）
- 文件夹（展开、内容展示）

**优化方向：**
- 视觉打磨：动画、过渡、间距、颜色精调
- 组件重构：统一基础组件 API、提取复用逻辑
- 布局优化：网格系统、空间利用
- 交互体验：拖拽手感、反馈、加载状态
- 代码精简：清理死代码、重构冗余逻辑、完善 TypeScript 类型、性能优化

### Out of Scope

- WebDAV 数据同步实现 — v1 不做，仅保留 UI 占位；可作为 v2 核心功能
- 搜索引擎切换（Google/Bing/Baidu） — 当前使用 chrome.search API 委托给浏览器默认引擎
- 移动端适配 — Chrome 扩展仅桌面环境
- 自动化测试（Vitest + Playwright） — v1 聚焦功能稳定，测试在后续里程碑加入
- 天气、待办、笔记等 widget — 保持单一用途，避免 Chrome 商店审核风险
- AI 聊天/搜索功能 — 偏离核心定位，增加维护负担
- 多语言国际化 — v1 仅中文 UI
- 存储层迁移（localStorage → IndexedDB 统一） — 当前双存储对用户无感知影响

## Context

- **已交付**: v1.1.0 MVP — 6 phases, 11 plans, 30 files changed, +2319/-100 LOC
- **技术栈**: Vue 3.5 + TypeScript + WXT (Manifest V3) + GridStack + Dexie + Lucide Icons + Zod
- **存储**: IndexedDB (网格项、壁纸缓存) + localStorage (设置、排序)
- **壁纸源**: Bing 每日壁纸、Picsum Random (需 host_permissions)
- **设计系统**: 毛玻璃 (Glassmorphism) CSS 变量体系，含 --glass-bg-disabled/--glass-bg-elevated 新增 token
- **合规**: chrome.search API 替代硬编码搜索引擎 URL，URL scheme allow-list 强制 http/https

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| v1 不实现 WebDAV 同步 | 降低发布复杂度，WebDAV 逻辑可后续单独里程碑实现 | ✓ Good — UI 占位保留，功能解耦 |
| 壁纸 CORS 用 Vite proxy 解决 | 仅影响 dev 模式，扩展模式通过 host_permissions 天然解决 | ✓ Good — dev:web 模式正常工作 |
| 保留 WebDAV UI 但标记"即将推出" | 用户可提前了解功能规划，后续实现时无需改 UI | ✓ Good — 输入框禁用并有说明文字 |
| 搜索使用 chrome.search API 委托 | 合规 Chrome NTP 政策，使用浏览器默认搜索引擎 | ✓ Good — 无需维护搜索引擎列表 |
| 备份 schema 使用 .passthrough() | 向后兼容旧版备份数据，不拒绝未知字段 | ✓ Good — 保证迁移平滑 |
| Import 返回 result 对象而非 boolean | UI 可展示具体错误信息，提升用户体验 | ✓ Good — 成功/失败有明确反馈 |
| 新增 --glass-bg-disabled/elevated token | 系统化管理禁用和提升状态的视觉效果 | ✓ Good — 组件主题适配更一致 |

---
*Last updated: 2026-02-19 after v1.2.0 milestone started*
